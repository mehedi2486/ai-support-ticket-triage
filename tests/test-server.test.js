import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { startTestServer } from "./test-server.js";

test("HTTP fixtures use fetch-safe high ports instead of the Windows low-port range", async t => {
  const app = express();
  app.get("/", (req, res) => res.json({ ready: true }));
  const server = await startTestServer(app);
  t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
  const port = server.address().port;
  assert.ok(port >= 49152 && port <= 65535);
  const response = await fetch(`http://127.0.0.1:${port}/`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ready: true });
});
