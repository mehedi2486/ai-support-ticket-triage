import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import { writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const root = fileURLToPath(new URL("../", import.meta.url));
let child;

async function start() {
  child = spawn(process.execPath, ["--env-file=.env", "server.js"], {
    cwd: root, env: { ...process.env, PORT: "0" }, stdio: ["ignore", "pipe", "pipe"],
  });
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Server startup timed out")), 15000);
    child.once("error", () => { clearTimeout(timer); reject(new Error("Could not start verification server")); });
    child.once("exit", () => { clearTimeout(timer); reject(new Error("Verification server exited")); });
    let output = "";
    child.stdout.on("data", chunk => {
      output += chunk;
      const match = output.match(/Server running at (http:\/\/127\.0\.0\.1:\d+)/);
      if (match) { clearTimeout(timer); resolve(match[1]); }
    });
    // Server errors are already sanitized; do not copy them or credentials into evidence.
    child.stderr.resume();
  });
}

async function stop() {
  if (child && child.exitCode === null && child.signalCode === null) {
    const closed = once(child, "close");
    child.kill();
    await closed;
  }
  child = undefined;
}

try {
  const url = await start();
  const response = await fetch(`${url}/tickets`, {
    method: "POST", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(20000),
    body: JSON.stringify({ title: "Fictional demo: course page keeps loading", body: "Synthetic test only. The course list shows a spinner for five minutes. Other pages still open." }),
  });
  const result = await response.json();
  assert.equal(response.status, 201, `Create failed with HTTP ${response.status}`);
  assert.match(result.ticket._id, /^[a-f0-9]{24}$/);
  assert.ok(result.ticket.summary.length > 0);
  assert.ok(["access", "performance", "bug", "other"].includes(result.ticket.category));
  assert.ok(["low", "medium", "high"].includes(result.ticket.priority));
  const read = await fetch(`${url}/tickets/${result.ticket._id}`);
  assert.equal(read.status, 200);
  assert.deepEqual((await read.json()).ticket, result.ticket);
  await stop();

  const restartedUrl = await start();
  const persisted = await fetch(`${restartedUrl}/tickets/${result.ticket._id}`);
  assert.equal(persisted.status, 200);
  assert.deepEqual((await persisted.json()).ticket, result.ticket);
  const evidence = {
    checkedAt: new Date().toISOString(), fixture: "fictional support issue", createStatus: response.status,
    readStatus: read.status, afterRestartStatus: persisted.status, ticket: result.ticket,
    note: "Real Gemini and MongoDB. Fictional ticket retained in triage_lab for demonstration. No credentials logged.",
  };
  await writeFile(new URL("../live-check.json", import.meta.url), JSON.stringify(evidence, null, 2) + "\n");
  console.log("PASS: real API -> Gemini -> MongoDB creation, GET and retrieval after process restart.");
  console.log(`Fictional demonstration ticket ID: ${result.ticket._id}`);
} catch (error) {
  // Assertion messages in this script contain only controlled status information.
  console.error(error.code === "ERR_ASSERTION" ? error.message : "Live flow check failed. Check local configuration and provider availability.");
  process.exitCode = 1;
} finally {
  await stop();
}
