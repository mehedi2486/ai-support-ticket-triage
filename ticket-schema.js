import { z } from "zod";

export const ticketSchema = z.object({
  title: z.string().trim().min(1).max(100),
  body: z.string().trim().min(1).max(1000),
});
