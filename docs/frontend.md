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
2. Form submission calls `preventDefault()` so the browser does not reload the page. Whitespace-only values are rejected before a request; the invalid input gets focus and an associated error.
3. `busy` becomes `create`. The fieldset is disabled and the result panel shows a loading state.
4. `createTicket()` sends JSON to `/tickets`. The backend remains responsible for Zod validation and all secret credentials.
5. On success, App stores the returned ticket and its ID. React renders TicketResult with those values as props. A small effect focuses the result heading; on narrow screens it also scrolls the result into view.
6. On failure, the form keeps its values and displays an error. `finally` clears the busy state in both cases.

The New ticket and Find ticket buttons switch the editor's task using the `mode` state. The draft remains in React state when switching tasks. Lookup follows the same request pattern with GET `/tickets/:id`. It reads the saved record without a new AI call. A previous saved result remains available if a later request fails; the current error is shown separately. Clear draft removes only the title/description, not the displayed saved record or lookup ID.

## Concepts beyond plain HTML

- **Props:** values passed from App to a child component, such as `ticket` and `busy`.
- **Conditional rendering:** show a different panel depending on whether the request is busy or a ticket exists.
- **useRef:** holds a reference to an input or heading so code can call its browser `focus()` method. Updating a ref does not itself redraw the page.
- **useEffect:** runs the result-focus behavior after React has placed the saved result in the DOM. It skips loading and failed requests. `matchMedia()` checks narrow screens and reduced-motion preferences before scrolling.
- **Key:** TicketResult uses the ticket ID as its key. Switching records resets the component's local copy-status message.
- **Fetch:** the browser's built-in HTTP client. A non-200 status does not automatically throw, so api.js checks `response.ok`.
- **AbortSignal.timeout:** limits browser waiting. It does not undo a database write or cancel work already accepted by the server.
- **Vite:** builds JSX and CSS into browser assets. Its development proxy forwards `/tickets` to Express, avoiding a separate browser CORS configuration.
- **Tailwind and CSS:** Tailwind supplies reset/utilities such as `sr-only` and icon sizes. Named CSS classes describe the editor, task navigation and analysis pane. Reused colors live in CSS variables, such as `--accent`; one change updates the shared color. Media queries stack the workbench on smaller screens.

## Boundaries

The browser never receives the Gemini key or MongoDB connection string. React displays ticket text as text, without injecting HTML. Production assets and API share one origin, with a self-only content security policy for assets. Validation alerts, a persistent request status, visible focus and reduced-motion styling support accessibility; a screen reader was not tested directly.

The layout keeps context beside saved analysis on desktop, with both create/find actions at the top. The redesign removed the earlier large introduction, decorative result cards and below-the-fold lookup form. [Design system](../DESIGN.md) records the actual styles; [verification](ui-verification.md) records behavior and reference limits. No third-party product assets are shipped and this is not user-validated design.
