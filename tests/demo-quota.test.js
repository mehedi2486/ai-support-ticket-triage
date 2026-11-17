import test from "node:test";
import assert from "node:assert/strict";
import { createDailyQuota } from "../services/demo-quota.js";

function fixture() {
  const days = new Map();
  const calls = [];
  const Usage = {
    async findOneAndUpdate(filter, update, options) {
      calls.push({ filter, update, options });
      const attempts = days.get(filter._id);
      if (attempts === undefined) {
        if (!options.upsert) return null;
        days.set(filter._id, 1);
        return { _id: filter._id, attempts: 1 };
      }
      if (attempts < filter.attempts.$lt) {
        days.set(filter._id, attempts + 1);
        return { _id: filter._id, attempts: attempts + 1 };
      }
      if (options.upsert) throw Object.assign(new Error("fixture duplicate key"), { code: 11000 });
      return null;
    },
  };
  return { Usage, days, calls };
}

test("daily reservations stop at the exact limit and remain consumed", async () => {
  const f = fixture();
  const consumeQuota = createDailyQuota({ Usage: f.Usage, limit: 2 });
  await consumeQuota();
  await consumeQuota();
  await assert.rejects(consumeQuota(), { status: 429, message: "Daily demo limit reached. Please try again tomorrow." });
  const day = new Date().toISOString().slice(0, 10);
  assert.equal(f.days.get(day), 2);
  assert.deepEqual(f.calls[0], {
    filter: { _id: day, attempts: { $lt: 2 } },
    update: { $inc: { attempts: 1 } },
    options: { upsert: true, returnDocument: "after" },
  });
});

test("concurrent callers never reserve more than the daily limit", async () => {
  const f = fixture();
  const consumeQuota = createDailyQuota({ Usage: f.Usage, limit: 5 });
  const results = await Promise.allSettled(Array.from({ length: 20 }, () => consumeQuota()));
  assert.equal(results.filter(result => result.status === "fulfilled").length, 5);
  const rejected = results.filter(result => result.status === "rejected");
  assert.equal(rejected.length, 15);
  assert.ok(rejected.every(result => result.reason.status === 429));
  assert.equal([...f.days.values()][0], 5);
});

test("a duplicate-key creation race can reserve an available slot without another upsert", async () => {
  const calls = [];
  const Usage = {
    async findOneAndUpdate(filter, update, options) {
      calls.push(options);
      if (options.upsert) throw Object.assign(new Error("fixture race"), { code: 11000 });
      return { _id: filter._id, attempts: 2 };
    },
  };
  await createDailyQuota({ Usage, limit: 3 })();
  assert.deepEqual(calls, [{ upsert: true, returnDocument: "after" }, { returnDocument: "after" }]);
});

test("quota storage failures fail closed without retrying an unrelated database error", async () => {
  let calls = 0;
  const storageError = new Error("fixture unavailable storage");
  const Usage = { async findOneAndUpdate() { calls++; throw storageError; } };
  await assert.rejects(createDailyQuota({ Usage, limit: 3 })(), error => error === storageError);
  assert.equal(calls, 1);
});

test("invalid configured limits fail before storage is called", () => {
  const Usage = { findOneAndUpdate() { assert.fail("storage must not be called"); } };
  for (const limit of [undefined, "25", 0, -1, 1.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => createDailyQuota({ Usage, limit }), /positive integer/);
  }
});
