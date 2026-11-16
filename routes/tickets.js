import { Router } from "express";
import mongoose from "mongoose";
import { ticketSchema } from "../ticket-schema.js";

export function createTicketRouter({ Ticket, triage }) {
  const router = Router();
  // Local single-process demo only. Use a shared limiter before public deployment.
  let windowStart = Date.now();
  let requests = 0;

  router.post("/", async (req, res) => {
    const result = ticketSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ message: "Invalid ticket input", errors: result.error.issues });
    if (Date.now() - windowStart >= 60_000) { windowStart = Date.now(); requests = 0; }
    if (requests >= 10) return res.status(429).json({ message: "Demo limit reached. Try again in a minute." });
    requests += 1;
    const analysis = await triage(result.data);
    const ticket = await Ticket.create({ ...result.data, ...analysis });
    return res.status(201).json({ ticket });
  });

  router.get("/:id", async (req, res) => {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(400).json({ message: "Invalid ticket ID" });
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    return res.json({ ticket });
  });
  return router;
}
