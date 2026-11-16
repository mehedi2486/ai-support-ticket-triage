# How the frontend works

The frontend uses basic React state and browser requests. There is no router, global state library or component framework.

## Files

| File | Responsibility |
| --- | --- |
| frontend/index.html | HTML entry point with the React root |
| frontend/src/main.jsx | Mount App and import CSS |
| frontend/src/App.jsx | Store form values and request state; create/find tickets |
| frontend/src/TicketResult.jsx | Show empty, loading or saved-result views |
| frontend/src/api.js | Send requests and read JSON responses |
| frontend/src/Icon.jsx | Small inline SVG icons |
| frontend/src/index.css | Tailwind utilities, shared classes and focus styles |
| frontend/vite.config.js | Tailwind build plugin and development API proxy |

## Follow a submission

1. Each input reads a state variable through `value`. Its `onChange` updates that variable. This is a controlled input.
2. Form submission calls `preventDefault()` so the browser does not reload the page. Whitespace-only values are rejected before a request.
3. `busy` becomes `create`. The fieldset is disabled and the result panel shows a loading state.
4. `createTicket()` sends JSON to `/tickets`. The backend remains responsible for Zod validation and all secret credentials.
5. On success, App stores the returned ticket and its ID. React renders TicketResult with those values as props.
6. On failure, the form keeps its values and displays an error. `finally` clears the busy state in both cases.

Lookup follows the same pattern with GET `/tickets/:id`. It reads the saved record without a new AI call. A previous saved result remains available if a later request fails; the current error is shown separately.

## Concepts beyond plain HTML

- **Props:** values passed from App to a child component, such as `ticket` and `busy`.
- **Conditional rendering:** show a different panel depending on whether the request is busy or a ticket exists.
- **Key:** TicketResult uses the ticket ID as its key. Switching records resets the component's local copy-status message.
- **Fetch:** the browser's built-in HTTP client. A non-200 status does not automatically throw, so api.js checks `response.ok`.
- **AbortSignal.timeout:** limits browser waiting. It does not undo a database write or cancel work already accepted by the server.
- **Vite:** builds JSX and CSS into browser assets. Its development proxy forwards `/tickets` to Express, avoiding a separate browser CORS configuration.
- **Tailwind:** utility classes describe layout and appearance. For example, `grid` starts a grid and `lg:grid-cols-[1.08fr_1fr]` creates two columns on large screens. Small repeated styles live in CSS component classes.

## Boundaries

The browser never receives the Gemini key or MongoDB connection string. React displays ticket text as text, without injecting HTML. Production assets and API share one origin, with a self-only content security policy for assets. Validation alerts, a persistent request status, visible focus and reduced-motion styling support accessibility; a screen reader was not tested directly.

The layout draws on common support-tool patterns: issue context beside AI output and stored-record lookup below. References consulted: [Intercom Inbox](https://www.intercom.com/help/en/articles/6258745-the-inbox-explained) and [Zendesk ticket summaries](https://support.zendesk.com/hc/en-us/articles/8037649972634-Summarizing-ticket-comments-using-generative-AI). No product assets were copied and this is not user-validated design.
