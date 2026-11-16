import mongoose from "mongoose";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { connectDatabase } from "./db.js";
import { createTriage } from "./services/triage.js";

async function main() {
  // Load configuration even when launched with plain node or nodemon.
  loadEnvFile(fileURLToPath(new URL(".env", import.meta.url)));
  const port = Number(process.env.PORT || 3001);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error("Invalid PORT");
  if (!process.env.GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");
  await connectDatabase(process.env.MONGODB_URI);
  const triage = createTriage({ apiKey: process.env.GEMINI_API_KEY, model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite" });
  const app = createApp({ triage });
  const server = app.listen(port, "127.0.0.1", (error) => {
    if (error) {
      console.error("Could not start server. Check whether PORT is already in use.");
      mongoose.disconnect().finally(() => { process.exitCode = 1; });
      return;
    }
    console.log(`Server running at http://127.0.0.1:${server.address().port}`);
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
