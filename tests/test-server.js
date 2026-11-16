import { randomInt } from "node:crypto";

export async function startTestServer(app) {
  // Windows may assign port 0 a low port that fetch blocks (observed: 3659).
  // Choose a high port, skipping occupied or Windows-reserved ports before HTTP.
  for (let attempt = 0; attempt < 20; attempt++) {
    const server = app.listen(randomInt(49152, 65536), "127.0.0.1");
    try {
      await new Promise((resolve, reject) => {
        server.once("listening", resolve);
        server.once("error", reject);
      });
      return server;
    } catch (error) {
      if (error.code !== "EADDRINUSE" && error.code !== "EACCES") throw error;
    }
  }
  throw new Error("Could not find an available high port for the test server.");
}
