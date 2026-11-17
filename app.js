import express from "express";
import { fileURLToPath } from "node:url";
import { Ticket as ticketModel } from "./db.js";
import { createTicketRouter } from "./routes/tickets.js";

export function createApp({ Ticket = ticketModel, triage, consumeQuota = async () => {}, isReady = () => true, frontendDir = fileURLToPath(new URL("./frontend/dist/", import.meta.url)) }) {
  const app = express();
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    res.set({ "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY", "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'", "Referrer-Policy": "no-referrer", "Cache-Control": "no-store" });
    next();
  });
  app.use(express.json({ limit: "8kb" }));
  app.get("/health", (req, res) => {
    const ready = isReady();
    res.status(ready ? 200 : 503).json({ status: ready ? "ok" : "unavailable" });
  });
  app.use("/tickets", createTicketRouter({ Ticket, triage, consumeQuota }));
  app.use(express.static(frontendDir, {
    dotfiles: "ignore",
    setHeaders(res) {
      res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'");
    },
  }));
  app.use((req, res) => res.status(404).json({ message: "Route not found" }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.type === "entity.parse.failed") return res.status(400).json({ message: "Invalid JSON body" });
    if (error.type === "entity.too.large") return res.status(413).json({ message: "Request body too large" });
    if ([429, 502, 503, 504].includes(error.status)) return res.status(error.status).json({ message: error.message });
    return res.status(500).json({ message: "Could not complete the request" });
  });
  return app;
}
