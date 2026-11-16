// All provider responses below are simulated. These tests do not call Google.
import test from "node:test";
import assert from "node:assert/strict";
import { createTriage } from "./triage.js";

const apiKey = "fixture-key-not-a-real-secret";
const ticket = { title: "Course page stuck", body: "The lesson takes a minute to open." };
const result = { summary: "Lesson opens slowly.", category: "performance", priority: "medium" };

function modelResponse(text) {
  return new Response(JSON.stringify({
    candidates: [{ content: { parts: [{ text }] } }],
  }), { status: 200, headers: { "Content-Type": "application/json" } });
}

test("makes one fixed-host request and returns validated, trimmed output", async () => {
  let requests = 0;
  const triage = createTriage({ apiKey, fetchImpl: async (url, options) => {
    requests++;
    assert.equal(url, "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent");
    assert.equal(options.method, "POST");
    assert.equal(options.redirect, "error");
    assert.ok(options.signal instanceof AbortSignal);
    assert.equal(options.headers["x-goog-api-key"], apiKey);
    const body = JSON.parse(options.body);
    assert.equal(body.generationConfig.responseMimeType, "application/json");
    assert.equal(body.generationConfig.responseJsonSchema.additionalProperties, false);
    assert.deepEqual(JSON.parse(body.contents[0].parts[0].text), ticket);
    assert.match(body.systemInstruction.parts[0].text, /untrusted data/);
    assert.equal(options.body.includes(apiKey), false);
    assert.equal(body.tools, undefined);
    return modelResponse(JSON.stringify({ ...result, summary: "  Lesson opens slowly.  " }));
  } });

  assert.deepEqual(await triage(ticket), { ...result, model: "gemini-3.5-flash-lite" });
  assert.equal(requests, 1);
});

test("rejects malformed JSON and invalid or extra output fields", async () => {
  const invalid = [
    "not JSON",
    JSON.stringify({ ...result, category: "billing" }),
    JSON.stringify({ ...result, priority: "urgent" }),
    JSON.stringify({ ...result, summary: "   " }),
    JSON.stringify({ ...result, summary: "a".repeat(501) }),
    JSON.stringify({ ...result, action: "delete account" }),
    JSON.stringify({ category: "bug", priority: "low" }),
    "null",
  ];
  for (const text of invalid) {
    const triage = createTriage({ apiKey, fetchImpl: async () => modelResponse(text) });
    await assert.rejects(triage(ticket), {
      status: 502, message: "AI returned an invalid triage result.",
    });
  }
});

test("maps rate limits to a safe 503 without retries or reading the error body", async () => {
  let requests = 0;
  const triage = createTriage({ apiKey, fetchImpl: async () => {
    requests++;
    return { ok: false, status: 429, json() { assert.fail("must not read error body"); } };
  } });
  await assert.rejects(triage(ticket), {
    status: 503, message: "AI triage is temporarily unavailable. Try again later.",
  });
  assert.equal(requests, 1);
});

test("maps provider HTTP failures to a safe 502", async () => {
  for (const status of [400, 403, 404, 500]) {
    const triage = createTriage({ apiKey, fetchImpl: async () => ({ ok: false, status }) });
    await assert.rejects(triage(ticket), { status: 502, message: "AI provider request failed." });
  }
});

test("sanitizes network and redirect errors instead of exposing their details", async () => {
  const triage = createTriage({ apiKey, fetchImpl: async () => {
    throw new Error(`Simulated request failure containing ${apiKey} and ticket text`);
  } });
  await assert.rejects(triage(ticket), error => {
    assert.equal(error.status, 502);
    assert.equal(error.message, "AI provider request failed.");
    assert.equal(error.cause, undefined);
    assert.equal(String(error).includes(apiKey), false);
    return true;
  });
});

test("aborts a simulated slow provider and returns a safe 504", async () => {
  const triage = createTriage({ apiKey, timeoutMs: 5, fetchImpl: async (_url, { signal }) => {
    return new Promise((_resolve, reject) => {
      // This timer keeps the fixture alive and fails if the abort signal is missing.
      const fallback = setTimeout(() => reject(new Error("Expected request to abort")), 200);
      signal.addEventListener("abort", () => {
        clearTimeout(fallback);
        reject(signal.reason);
      }, { once: true });
    });
  } });
  await assert.rejects(triage(ticket), { status: 504, message: "AI triage timed out." });
});

test("rejects missing configuration before making any request", async () => {
  for (const config of [{}, { apiKey: " " }, { apiKey, model: "https://another-host.example" }]) {
    const triage = createTriage({ ...config, fetchImpl: async () => assert.fail("must not fetch") });
    await assert.rejects(triage(ticket), { status: 503, message: "AI triage is not configured." });
  }
});

test("rejects unreadable or absent provider output", async () => {
  const responses = [
    new Response("not JSON", { status: 200 }),
    new Response(JSON.stringify({ candidates: [] }), { status: 200 }),
  ];
  for (const response of responses) {
    const triage = createTriage({ apiKey, fetchImpl: async () => response });
    await assert.rejects(triage(ticket), error => error.status === 502 && !error.message.includes(apiKey));
  }
});
