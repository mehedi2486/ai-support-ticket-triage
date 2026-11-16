import test from "node:test";
import assert from "node:assert/strict";
import { ticketSchema } from "./ticket-schema.js";

test("cleans allowed fields and discards untrusted extra fields", () => {
  const result = ticketSchema.safeParse({
    title: "  Course page stuck  ", body: "  Spinner keeps loading.  ", priority: "high",
  });
  assert.equal(result.success, true);
  assert.deepEqual(result.data, { title: "Course page stuck", body: "Spinner keeps loading." });
});

test("rejects missing, non-string, blank and oversized input", () => {
  const invalid = [
    undefined, null, [], {},
    { title: "Sample", body: 42 },
    { title: 42, body: "Sample" },
    { title: "   ", body: "Sample" },
    { title: "Sample", body: "   " },
    { title: "a".repeat(101), body: "Sample" },
    { title: "Sample", body: "a".repeat(1001) },
  ];
  for (const input of invalid) assert.equal(ticketSchema.safeParse(input).success, false);
  assert.equal(ticketSchema.safeParse({ title: "a".repeat(100), body: "b".repeat(1000) }).success, true);
});
