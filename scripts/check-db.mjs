// Assistant-written read-only setup probe. No collections are read or changed.
import assert from 'node:assert/strict';
import mongoose from 'mongoose';

async function main() {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    console.error('Set MONGODB_URI in the local .env file first. Do not share the connection string.');
    process.exitCode = 1;
    return;
  }
  try {
    await mongoose.connect(uri, {
      dbName: 'triage_lab',
      serverSelectionTimeoutMS: 8_000,
      connectTimeoutMS: 8_000,
      socketTimeoutMS: 8_000,
    });
    const result = await mongoose.connection.db.command({ ping: 1 });
    assert.equal(result.ok, 1);
    console.log('MongoDB connection verified for triage_lab. No collections were read or changed.');
  } finally {
    await mongoose.disconnect();
  }
}

main().catch(() => {
  // Connection errors can contain hostnames and credentials; never log them raw.
  console.error('MongoDB check failed. Check the saved URI, database-user permissions, network access and connection timeout. No raw connection details were logged.');
  process.exitCode = 1;
});
