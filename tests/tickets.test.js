import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../app.js";
import { startTestServer } from "./test-server.js";

// Real local HTTP, but fixture storage and AI functions. Live services are checked separately.
const id = "507f1f77bcf86cd799439011";
const analysis = { summary: "Course list does not load.", category: "performance", priority: "medium", model: "fixture-model" };

async function fixture(t, overrides = {}) {
  const saved = [];
  const inputs = [];
  const Ticket = {
    async create(data) { const row = { _id: id, ...data }; saved.push(row); return row; },
    async findById(value) { return saved.find(row => row._id === value) || null; },
  };
  const triage = async input => { inputs.push(input); return analysis; };
  const app = createApp({ Ticket, triage, ...overrides });
  const server = await startTestServer(app);
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const url = `http://127.0.0.1:${server.address().port}`;
  const post = body => fetch(`${url}/tickets`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { url, post, saved, inputs };
}

test("POST creates cleaned ticket and GET retrieves it", async t => {
  const f = await fixture(t);
  const response = await f.post({ title: "  Course stuck  ", body: "  Spinner keeps loading.  ", priority: "high" });
  assert.equal(response.status, 201);
  const result = await response.json();
  assert.equal(result.ticket._id, id);
  assert.equal(result.ticket.priority, "medium");
  assert.deepEqual(f.inputs, [{ title: "Course stuck", body: "Spinner keeps loading." }]);
  assert.equal(f.saved.length, 1);
  const read = await fetch(`${f.url}/tickets/${id}`);
  assert.equal(read.status, 200);
  assert.deepEqual(await read.json(), result);
  assert.equal(read.headers.get("x-content-type-options"), "nosniff");
});

test("bad input, bad IDs, missing tickets and JSON errors stay safe", async t => {
  const f = await fixture(t);
  for (const input of [{}, null, { title: " ", body: "x" }, { title: "x", body: 42 }]) {
    assert.equal((await f.post(input)).status, 400);
  }
  assert.equal(f.inputs.length, 0);
  assert.equal(f.saved.length, 0);
  assert.equal((await fetch(`${f.url}/tickets/not-an-id`)).status, 400);
  assert.equal((await fetch(`${f.url}/tickets/${id}`)).status, 404);
  assert.equal((await fetch(`${f.url}/unknown`)).status, 404);
  const badJson = await fetch(`${f.url}/tickets`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" });
  assert.equal(badJson.status, 400);
  assert.deepEqual(await badJson.json(), { message: "Invalid JSON body" });
  assert.equal((await f.post({ title: "x", body: "a".repeat(9000) })).status, 413);
});

test("AI failures never save a ticket", async t => {
  for (const status of [502, 503, 504]) {
    const f = await fixture(t, { triage: async () => { const error = new Error("Safe upstream failure"); error.status = status; throw error; } });
    const response = await f.post({ title: "x", body: "y" });
    assert.equal(response.status, status);
    assert.equal(f.saved.length, 0);
  }
});

test("database failures do not disclose internal errors", async t => {
  const f = await fixture(t, { Ticket: { async create() { throw new Error("private database detail"); } } });
  const response = await f.post({ title: "x", body: "y" });
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { message: "Could not complete the request" });
});

test("local demo stops expensive creation attempts after ten per minute", async t => {
  const f = await fixture(t);
  for (let i = 0; i < 10; i++) assert.equal((await f.post({ title: "x", body: "y" })).status, 201);
  assert.equal((await f.post({ title: "x", body: "y" })).status, 429);
  assert.equal(f.inputs.length, 10);
});
