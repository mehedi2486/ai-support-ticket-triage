import mongoose from "mongoose";
import { createApp } from "./app.js";
import { connectDatabase, DemoUsage } from "./db.js";
import { createTriage } from "./services/triage.js";
import { createDailyQuota } from "./services/demo-quota.js";
import { loadLocalEnvironment, readConfiguration } from "./config.js";

async function main() {
  loadLocalEnvironment();
  const config = readConfiguration();
  await connectDatabase(config.mongoUri);
  // The unique daily counter must exist before accepting model requests.
  await DemoUsage.init();
  const triage = createTriage({ apiKey: config.apiKey, model: config.model });
  const consumeQuota = createDailyQuota({ Usage: DemoUsage, limit: config.dailyLimit });
  const app = createApp({ triage, consumeQuota, isReady: () => mongoose.connection.readyState === 1 });
  const server = app.listen(config.port, config.host, (error) => {
    if (error) {
      console.error("Could not start server. Check whether PORT is already in use.");
      mongoose.disconnect().finally(() => { process.exitCode = 1; });
      return;
    }
    console.log(`Server running at http://${config.host}:${server.address().port}`);
  });
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.once(signal, () => {
      server.close(async () => { await mongoose.disconnect(); process.exit(0); });
      server.closeAllConnections();
    });
  }
}

main().catch(async () => {
  console.error("Startup failed. Check local configuration and database access. Credentials were not logged.");
  await mongoose.disconnect();
  process.exitCode = 1;
});
