import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createApp } from "../app.js";
import { startTestServer } from "./test-server.js";

async function fixture(t, build = true) {
  const directory = await mkdtemp(join(tmpdir(), "ticket-frontend-"));
  const frontendDir = join(directory, "dist");
  if (build) {
    await mkdir(join(frontendDir, "assets"), { recursive: true });
    await writeFile(join(frontendDir, "index.html"), '<!doctype html><title>Ticket desk</title><script type="module" src="/assets/app.js"></script>');
    await writeFile(join(frontendDir, "assets", "app.js"), 'console.log("fixture");');
    await writeFile(join(frontendDir, "assets", "app.css"), 'body { color: navy; }');
    await writeFile(join(frontendDir, ".env"), "FIXTURE_SECRET=not-a-real-secret");
  }
  await writeFile(join(directory, ".env"), "OUTSIDE_SECRET=not-a-real-secret");
  const app = createApp({ frontendDir, Ticket: { async findById() { return null; } }, triage: async () => {} });
  const server = await startTestServer(app);
  t.after(async () => {
    await new Promise(resolve => { server.close(resolve); server.closeAllConnections(); });
    await rm(directory, { recursive: true, force: true });
  });
  return `http://127.0.0.1:${server.address().port}`;
}

test("built frontend HTML and assets use the same origin and a self-only CSP", async t => {
  const url = await fixture(t);
  for (const [path, contentType, content] of [
    ["/", "text/html", "<title>Ticket desk</title>"],
    ["/assets/app.js", "javascript", 'console.log("fixture");'],
    ["/assets/app.css", "text/css", "body { color: navy; }"],
  ]) {
    const response = await fetch(`${url}${path}`);
    assert.equal(response.status, 200);
    assert.ok(response.headers.get("content-type").includes(contentType));
    assert.ok((await response.text()).includes(content));
    assert.equal(response.headers.get("content-security-policy"), "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'");
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(response.headers.get("x-frame-options"), "DENY");
    assert.equal(response.headers.get("access-control-allow-origin"), null);
  }
});

test("frontend files do not replace API errors or expose environment files", async t => {
  const url = await fixture(t);
  for (const [path, status, message] of [
    ["/tickets/not-an-id", 400, "Invalid ticket ID"],
    ["/tickets/507f1f77bcf86cd799439011", 404, "Ticket not found"],
    ["/tickets", 404, "Route not found"],
    ["/unknown", 404, "Route not found"],
    ["/.env", 404, "Route not found"],
    ["/%2eenv", 404, "Route not found"],
    ["/assets/%2e%2e/%2e%2e/.env", 404, "Route not found"],
  ]) {
    const response = await fetch(`${url}${path}`);
    assert.equal(response.status, status);
    assert.deepEqual(await response.json(), { message });
    assert.equal(response.headers.get("content-security-policy"), "default-src 'none'; frame-ancestors 'none'");
  }
});

test("missing frontend build keeps GET / as a JSON 404", async t => {
  const url = await fixture(t, false);
  const response = await fetch(`${url}/`);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { message: "Route not found" });
});
