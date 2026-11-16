import express from "express";
import { Ticket as ticketModel } from "./db.js";
import { createTicketRouter } from "./routes/tickets.js";

export function createApp({ Ticket = ticketModel, triage }) {
  const app = express();
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    res.set({ "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY", "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'", "Referrer-Policy": "no-referrer", "Cache-Control": "no-store" });
    next();
  });
  app.use(express.json({ limit: "8kb" }));
  app.use("/tickets", createTicketRouter({ Ticket, triage }));
  app.use((req, res) => res.status(404).json({ message: "Route not found" }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.type === "entity.parse.failed") return res.status(400).json({ message: "Invalid JSON body" });
    if (error.type === "entity.too.large") return res.status(413).json({ message: "Request body too large" });
    if ([502, 503, 504].includes(error.status)) return res.status(error.status).json({ message: error.message });
    return res.status(500).json({ message: "Could not complete the request" });
  });
  return app;
}
