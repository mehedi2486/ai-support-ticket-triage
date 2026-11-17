import test from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp, rm } from "node:fs/promises";
import { loadLocalEnvironment, readConfiguration } from "../config.js";

const credentials = { GEMINI_API_KEY: "fixture-key", MONGODB_URI: "mongodb://fixture.invalid/demo" };

test("cloud environment works without a .env file; local defaults stay loopback", async t => {
  const directory = await mkdtemp(join(tmpdir(), "triage-config-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  assert.doesNotThrow(() => loadLocalEnvironment(join(directory, ".env")));
  assert.equal(readConfiguration(credentials).host, "127.0.0.1");
  const cloud = readConfiguration({ ...credentials, NODE_ENV: "production", PORT: "10000" });
  assert.equal(cloud.host, "0.0.0.0");
  assert.equal(cloud.port, 10000);
  assert.equal(cloud.dailyLimit, 25);
});

test("invalid startup settings fail before opening a server", () => {
  for (const overrides of [{ PORT: "bad" }, { PORT: "65536" }, { HOST: "invalid" }, { DEMO_DAILY_LIMIT: "0" }, { DEMO_DAILY_LIMIT: "1.5" }, { DEMO_DAILY_LIMIT: "1001" }, { GEMINI_API_KEY: " " }, { MONGODB_URI: "" }, { NODE_ENV: "production", PORT: "0" }]) {
    assert.throws(() => readConfiguration({ ...credentials, ...overrides }));
  }
});
