import React, { useEffect, useRef, useState } from "react";
import Icon from "./Icon.jsx";
import TicketResult from "./TicketResult.jsx";
import { createTicket, findTicket } from "./api.js";

export default function App() {
  const [mode, setMode] = useState("create");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [ticket, setTicket] = useState(null);
  const [busy, setBusy] = useState("");
  const [formError, setFormError] = useState("");
  const [lookupError, setLookupError] = useState("");
  const [resultSource, setResultSource] = useState("");
  const [invalidField, setInvalidField] = useState("");
  const titleRef = useRef(null);
  const bodyRef = useRef(null);
  const lookupRef = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => {
    if (!ticket || busy || formError || lookupError) return;
    resultRef.current.focus({ preventScroll: true });
    if (window.matchMedia("(max-width: 900px)").matches) {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      resultRef.current.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "start" });
    }
  }, [ticket, busy, resultSource]);

  function changeMode(nextMode) {
    setMode(nextMode);
    setFormError("");
    setLookupError("");
    setInvalidField("");
  }

  async function submitTicket(event) {
    event.preventDefault();
    if (busy) return;
    setFormError("");
    setLookupError("");
    setInvalidField("");
    if (!title.trim() || !body.trim()) {
      const field = !title.trim() ? "title" : "body";
      setInvalidField(field);
      setFormError(field === "title" ? "Add an issue title. Spaces alone are not enough." : "Describe what happened. Spaces alone are not enough.");
      if (field === "title") titleRef.current.focus();
      else bodyRef.current.focus();
      return;
    }
    setBusy("create");
    try {
      const savedTicket = await createTicket(title, body);
      setTicket(savedTicket);
      setTicketId(savedTicket._id);
      setResultSource("create");
    } catch (error) {
      let message = error.message;
      if (error.name === "TimeoutError") message = "The request timed out. Saving may still finish on the server. Retrying can create a duplicate ticket.";
      if (error.name === "TypeError") message = "Could not reach the server. Check that the backend is running.";
      setFormError(message);
    } finally {
      setBusy("");
    }
  }

  async function lookupTicket(event) {
    event.preventDefault();
    if (busy) return;
    setLookupError("");
    setFormError("");
    setInvalidField("");
    if (!/^[a-fA-F0-9]{24}$/.test(ticketId.trim())) {
      setLookupError("Enter the 24-character ticket ID from a saved result.");
      setInvalidField("id");
      lookupRef.current.focus();
      return;
    }
    setBusy("lookup");
    try {
      const savedTicket = await findTicket(ticketId);
      setTicket(savedTicket);
      setResultSource("lookup");
    } catch (error) {
      let message = error.message;
      if (error.name === "TimeoutError") message = "Ticket lookup timed out. Try again in a moment.";
      if (error.name === "TypeError") message = "Could not reach the server. Check that the backend is running.";
      setLookupError(message);
    } finally {
      setBusy("");
    }
  }

  function useSample(sample) {
    if (sample === "course") {
      setTitle("Course page keeps loading");
      setBody("Fictional demo: the course list has shown a loading spinner for five minutes. Other pages still open, but I cannot access my courses.");
    }
    if (sample === "login") {
      setTitle("Cannot sign in after resetting password");
      setBody("Fictional demo: I reset my password, but signing in still shows an invalid password message. This prevents me from accessing my account.");
    }
    if (sample === "slow") {
      setTitle("Dashboard takes 30 seconds to open");
      setBody("Fictional demo: the dashboard takes about 30 seconds to load after each refresh. It eventually opens, but switching between reports is slow too.");
    }
    setFormError("");
    setInvalidField("");
    titleRef.current.focus();
  }

  function clearForm() {
    setTitle("");
    setBody("");
    setFormError("");
    setInvalidField("");
    titleRef.current.focus();
  }

  return <div className="app-shell">
    <a href="#main" className="skip-link">Skip to ticket workspace</a>
    <header className="app-header">
      <div className="header-inner">
        <a className="brand" href="#main"><span className="brand-mark"><Icon name="ticket" /></span>Triage Desk</a>
        <div className="header-links"><span className="demo-label">Local demo</span><a href="https://github.com/mehedi2486/ai-support-ticket-triage" target="_blank" rel="noreferrer">GitHub<Icon name="external" className="size-4" /><span className="sr-only">, opens a new tab</span></a></div>
      </div>
    </header>
    <main id="main" className="workspace" tabIndex={-1}>
      <div className="workspace-heading"><div><h1>Ticket workspace</h1><p>Create an issue report or find a saved analysis.</p></div><span className="workspace-note"><Icon name="shield" className="size-4" />Fictional reports only</span></div>
      <div className="workbench">
        <nav className="task-nav" aria-label="Ticket tools">
          <button type="button" className={mode === "create" ? "task-button active" : "task-button"} aria-pressed={mode === "create"} disabled={Boolean(busy)} onClick={() => changeMode("create")}><Icon name="plus" className="size-4" />New ticket</button>
          <button type="button" className={mode === "lookup" ? "task-button active" : "task-button"} aria-pressed={mode === "lookup"} disabled={Boolean(busy)} onClick={() => changeMode("lookup")}><Icon name="search" className="size-4" />Find ticket</button>
        </nav>
        <p className="sr-only" role="status" aria-live="polite">{busy ? "Ticket request in progress." : formError || lookupError ? "Ticket request failed. Review the error message." : ticket ? (resultSource === "lookup" ? "Saved ticket retrieved." : "Ticket analyzed and saved.") : "Ready for a new ticket."}</p>
        <div className="workspace-grid">
          <section className="editor" aria-labelledby="task-heading">
            <div className="editor-heading"><h2 id="task-heading">{mode === "create" ? "What needs attention?" : "Find a saved ticket"}</h2><p>{mode === "create" ? "Describe the issue. We’ll summarize it and suggest how to triage it." : "Paste a ticket ID to retrieve its original report and analysis."}</p></div>
            {mode === "create" ? <form onSubmit={submitTicket} aria-busy={busy === "create"}>
              <fieldset disabled={Boolean(busy)}>
                <div className="field-heading"><label htmlFor="title">Issue title</label><span id="title-count">{title.length}/100</span></div>
                <input ref={titleRef} id="title" name="title" className="field-input" placeholder="A short description of the problem" required maxLength={100} value={title} onChange={event => setTitle(event.target.value)} aria-invalid={invalidField === "title"} aria-describedby={invalidField === "title" ? "form-error title-count" : "title-count"} />
                <div className="field-heading description-heading"><label htmlFor="description">Description</label><span id="body-count">{body.length}/1000</span></div>
                <textarea ref={bodyRef} id="description" name="body" className="field-input description-input" placeholder="What happened? Who is affected? What have you tried?" required maxLength={1000} value={body} onChange={event => setBody(event.target.value)} aria-invalid={invalidField === "body"} aria-describedby={invalidField === "body" ? "form-error body-help body-count" : "body-help body-count"} />
                <p id="body-help" className="field-help">Use fictional details. Leave out names, emails and passwords.</p>
                <div className="examples"><p>Try an example</p><div className="example-buttons"><button type="button" onClick={() => useSample("course")}>Page won’t load</button><button type="button" onClick={() => useSample("login")}>Can’t sign in</button><button type="button" onClick={() => useSample("slow")}>Slow dashboard</button></div></div>
                {formError && <p id="form-error" role="alert" className="error-message"><Icon name="alert" className="size-4" />{formError}</p>}
                <div className="form-actions"><button type="submit" className="primary-button">{busy === "create" ? "Analyzing…" : "Analyze & save"}<Icon name={busy === "create" ? "clock" : "arrow"} className="size-4" /></button><button className="quiet-button" onClick={clearForm} type="button">Clear draft</button></div>
              </fieldset>
              <p className="submit-help">Creates a saved ticket with an AI summary, category and priority.</p>
            </form> : <form onSubmit={lookupTicket} aria-busy={busy === "lookup"}>
              <label className="lookup-label" htmlFor="ticket-id">Saved ticket ID</label>
              <input ref={lookupRef} id="ticket-id" className="field-input" placeholder="e.g. 507f1f77bcf86cd799439011" maxLength={24} required value={ticketId} onChange={event => setTicketId(event.target.value)} disabled={Boolean(busy)} aria-invalid={invalidField === "id"} aria-describedby={lookupError ? "lookup-error id-help" : "id-help"} autoCapitalize="none" spellCheck={false} />
              <p id="id-help" className="field-help">The 24-character ID is shown with each saved analysis.</p>
              {lookupError && <p id="lookup-error" role="alert" className="error-message"><Icon name="alert" className="size-4" />{lookupError}</p>}
              <div className="form-actions"><button type="submit" className="primary-button" disabled={Boolean(busy)}>{busy === "lookup" ? "Finding…" : "Retrieve ticket"}<Icon name="search" className="size-4" /></button></div>
              <div className="lookup-note"><Icon name="archive" className="size-5" /><div><h3>The original analysis, unchanged</h3><p>Looking up a ticket reads the saved result. It doesn’t use another AI request.</p></div></div>
            </form>}
          </section>
          <TicketResult key={ticket ? ticket._id : "empty"} ticket={ticket} busy={busy} resultSource={resultSource} headingRef={resultRef} mode={mode} />
        </div>
      </div>
      <footer className="workspace-footer"><span>Demo workspace. No customer data.</span><span>AI suggestions need human review.</span></footer>
    </main>
  </div>;
}
