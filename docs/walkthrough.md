# How the backend works

## Structure

| File | Responsibility |
| --- | --- |
| server.js | Load local configuration, connect MongoDB and start listening |
| app.js | Configure Express, mount routes and format errors |
| ticket-schema.js | Validate and clean incoming ticket data with Zod |
| routes/tickets.js | Handle ticket creation and lookup |
| db.js | Define the Mongoose model and database connection |
| services/triage.js | Call Gemini and validate the generated analysis |

## Follow a request

1. Express parses JSON with an 8 KB body limit.
2. Zod requires a string title and body, trims whitespace and checks their lengths. Unknown fields are removed. Handlers use `result.data`, not the unvalidated request body.
3. The local limiter permits ten valid creation attempts per minute per process.
4. The triage service sends the fictional issue to Gemini. The key is sent only as an authentication header to a fixed HTTPS host, with redirects refused.
5. Gemini is asked for JSON containing summary, category and priority. A second Zod schema rejects invalid, missing or unexpected output fields. It verifies the shape of the answer, not its factual accuracy.
6. Mongoose saves the validated input and analysis together. It adds an ObjectId and timestamps.
7. The API returns HTTP 201 with the saved record. GET uses that ID to retrieve the record without another AI request.

An AI failure stops before the database write. A storage failure after analysis returns 500; the provider request has already consumed quota. There are no retries or duplicate-request guarantees.

## Concepts used

- **Async/await:** wait for network/database operations without blocking the event loop.
- **Spread syntax:** `{ ...input, ...analysis }` combines two validated objects into a record.
- **Timeout:** `AbortSignal.timeout()` bounds waiting for the model. It does not guarantee the provider stopped processing the request.
- **Dependency injection:** `createApp({ Ticket, triage })` accepts collaborators as function arguments. Tests substitute fixtures without contacting real services.
- **Separate app and server:** importing app.js does not open a port or a database connection. server.js owns startup; tests own their temporary listeners.
- **Error middleware:** Express 5 forwards rejected async handlers to the final error handler. Expected public errors are sanitized; raw database/provider details are withheld.
- **ES modules:** the project uses import/export and `type: module`. Node's built-in environment-file loading serves the role often handled by dotenv.

## Testing boundaries

`npm test` uses real local HTTP for route tests, fixture storage and AI functions, and simulated fetch responses for the provider service. It checks valid creation/retrieval, invalid data, missing IDs, rate limits and safe failures. These simulations are not claims about Google's uptime or model accuracy.

`npm run check:flow` starts its own temporary API process, calls the real model, writes a fictional record to MongoDB, fetches it, restarts the process and fetches it again. It retains the fictional record for demonstration and writes ignored local evidence. It consumes real quota, so it is separate from the normal test suite.

This is an LLM-assisted fixed workflow. The model cannot call tools, execute commands, resolve tickets or send messages.
