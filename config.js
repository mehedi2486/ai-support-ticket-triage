import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";

export function loadLocalEnvironment(path = fileURLToPath(new URL(".env", import.meta.url))) {
  // Render supplies environment variables without a local .env file.
  if (existsSync(path)) loadEnvFile(path);
}

export function readConfiguration(env = process.env) {
  const production = env.NODE_ENV === "production";
  const host = env.HOST || (production ? "0.0.0.0" : "127.0.0.1");
  const port = Number(env.PORT || 3001);
  const dailyLimit = Number(env.DEMO_DAILY_LIMIT || 25);
  if (!["127.0.0.1", "0.0.0.0"].includes(host)) throw new Error("Invalid HOST");
  if (!Number.isInteger(port) || port < (production ? 1 : 0) || port > 65535) throw new Error("Invalid PORT");
  if (!Number.isInteger(dailyLimit) || dailyLimit < 1 || dailyLimit > 1000) throw new Error("Invalid DEMO_DAILY_LIMIT");
  if (!env.GEMINI_API_KEY?.trim()) throw new Error("Missing GEMINI_API_KEY");
  if (!env.MONGODB_URI?.trim()) throw new Error("Missing MONGODB_URI");
  return { host, port, dailyLimit, apiKey: env.GEMINI_API_KEY, mongoUri: env.MONGODB_URI, model: env.GEMINI_MODEL || "gemini-3.5-flash-lite" };
}
