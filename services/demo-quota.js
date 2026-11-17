function quotaError() {
  return Object.assign(new Error("Daily demo limit reached. Please try again tomorrow."), { status: 429 });
}

export function createDailyQuota({ Usage, limit }) {
  if (!Number.isSafeInteger(limit) || limit < 1) {
    throw new Error("DEMO_DAILY_LIMIT must be a positive integer.");
  }

  return async function consumeQuota() {
    const day = new Date().toISOString().slice(0, 10);
    const filter = { _id: day, attempts: { $lt: limit } };
    const update = { $inc: { attempts: 1 } };
    try {
      // MongoDB checks the limit and increments together; _id makes each UTC day unique.
      const usage = await Usage.findOneAndUpdate(filter, update, { upsert: true, returnDocument: "after" });
      if (!usage) throw quotaError();
    } catch (error) {
      if (error.code !== 11000) throw error;
      // Another request may have created today's document. Reserve only if it still has room.
      const usage = await Usage.findOneAndUpdate(filter, update, { returnDocument: "after" });
      if (!usage) throw quotaError();
    }
  };
}
