import React, { useState } from "react";
import Icon from "./Icon.jsx";
import TicketResult from "./TicketResult.jsx";
import { createTicket, findTicket } from "./api.js";

export default function App() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [ticket, setTicket] = useState(null);
  const [busy, setBusy] = useState("");
  const [formError, setFormError] = useState("");
  const [lookupError, setLookupError] = useState("");
  const [resultSource, setResultSource] = useState("");

  async function submitTicket(event) {
    event.preventDefault();
    if (busy) return;
    setFormError("");
    setLookupError("");
    if (!title.trim() || !body.trim()) {
      setFormError("Add a title and a description. Spaces alone do not describe an issue.");
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
      if (error.name === "TimeoutError") message = "The request timed out. Check the saved ticket before trying again; it may have completed.";
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
    if (!/^[a-fA-F0-9]{24}$/.test(ticketId.trim())) {
      setLookupError("Enter the 24-character ticket ID from a saved result.");
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

  function useSample() {
    setTitle("Course page keeps loading");
    setBody("Fictional demo: the course list has shown a loading spinner for five minutes. Other pages still open, but I cannot access my courses.");
    setFormError("");
  }

  function clearForm() {
    setTitle("");
    setBody("");
    setTicket(null);
    setFormError("");
    setLookupError("");
  }

  return <div className="min-h-screen bg-[#f5f7f8] text-slate-800">
    <a href="#main" className="skip-link">Skip to ticket workspace</a>
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-330 items-center justify-between gap-4 px-5 py-5 sm:px-9">
        <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-teal-800 text-white"><Icon name="ticket" className="size-6" /></span><div><p className="text-lg font-bold tracking-tight text-slate-950">Triage Desk<span className="text-teal-600">.</span></p><p className="text-xs text-slate-500">A little clarity for every issue</p></div></div>
        <div className="flex items-center gap-5"><span className="hidden items-center gap-2 text-xs text-slate-500 sm:flex"><span className="size-1.5 rounded-full bg-teal-600" />Local demo</span><a className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-teal-800 hover:underline" href="https://github.com/mehedi2486/ai-support-ticket-triage" target="_blank" rel="noreferrer">View source<span className="sr-only"> on GitHub, opens a new tab</span></a></div>
      </div>
    </header>

    <main id="main" className="mx-auto max-w-330 px-5 pb-10 pt-8 sm:px-9 sm:pt-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div><p className="mb-3 text-xs text-slate-500">Workspace <span className="mx-2 text-slate-300">/</span> Ticket triage</p><h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">From issue to understanding.</h1><p className="mt-3 max-w-140 text-sm leading-6 text-slate-600">Capture the context. Get a useful summary. Keep the next step human.</p></div>
        <span className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600"><Icon name="shield" className="size-4 text-teal-700" />Fictional data only</span>
      </div>

      <p className="sr-only" role="status" aria-live="polite">{busy ? "Ticket request in progress." : formError || lookupError ? "Ticket request failed. Review the error message." : ticket ? (resultSource === "lookup" ? "Saved ticket retrieved." : "Ticket analyzed and saved.") : "Ready for a new ticket."}</p>
      <div className="grid items-start gap-5 lg:grid-cols-[1.08fr_1fr] lg:gap-7">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-950">New ticket</h2><p className="mt-1 text-xs leading-5 text-slate-500">Start with what happened and who is affected.</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">Create</span></div>
          <form onSubmit={submitTicket} aria-busy={busy === "create"}>
            <fieldset disabled={Boolean(busy)}>
              <label className="field-label" htmlFor="title">Issue title</label>
              <input id="title" name="title" className="field-input mt-2" placeholder="e.g. Course page keeps loading" required maxLength={100} value={title} onChange={event => setTitle(event.target.value)} aria-describedby="title-count" />
              <p id="title-count" className="mt-2 text-right text-xs text-slate-600">{title.length}/100</p>
              <label className="field-label mt-5" htmlFor="description">What happened?</label>
              <textarea id="description" name="body" className="field-input mt-2 min-h-43 resize-y leading-6" placeholder="Describe the issue, its impact, and anything you have already tried..." required maxLength={1000} value={body} onChange={event => setBody(event.target.value)} aria-describedby="body-help body-count" />
              <div className="mt-2 flex justify-between gap-4 text-xs"><p id="body-help" className="text-slate-500">Use made-up details. Leave out personal information.</p><p id="body-count" className="shrink-0 text-slate-600">{body.length}/1000</p></div>
              <div className="mb-6 mt-5 flex flex-wrap items-center justify-between gap-3"><button className="text-xs font-semibold text-teal-700 underline-offset-4 hover:underline disabled:opacity-50" onClick={useSample} type="button">Use a sample issue</button><button className="text-xs text-slate-500 underline-offset-4 hover:underline disabled:opacity-50" onClick={clearForm} type="button">Clear</button></div>
              {formError && <p role="alert" className="error-message mb-4">{formError}</p>}
              <button type="submit" className="primary-button w-full">{busy === "create" ? "Analyzing and saving…" : "Analyze & save ticket"}<Icon name="arrow" className="size-4" /></button>
            </fieldset>
            <p className="mt-3 text-center text-xs leading-5 text-slate-500">Your result is saved only after the analysis is validated.</p>
          </form>
        </section>
        <TicketResult key={ticket ? ticket._id : "empty"} ticket={ticket} busy={busy} resultSource={resultSource} />
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:px-8">
        <div className="grid items-start gap-5 lg:grid-cols-[1fr_1.2fr]">
          <div className="flex gap-3"><span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><Icon name="search" className="size-4" /></span><div><h2 className="text-sm font-semibold text-slate-900">Pick up where you left off</h2><p className="mt-1 max-w-83 text-xs leading-5 text-slate-500">Find a saved ticket using its ID. The original analysis stays with it.</p></div></div>
          <form onSubmit={lookupTicket} aria-busy={busy === "lookup"}>
            <label htmlFor="ticket-id" className="sr-only">Saved ticket ID</label>
            <div className="flex flex-col gap-2 sm:flex-row"><input id="ticket-id" className="field-input min-w-0 flex-1 text-sm" placeholder="Paste a 24-character ticket ID" maxLength={24} required value={ticketId} onChange={event => setTicketId(event.target.value)} disabled={Boolean(busy)} aria-describedby={lookupError ? "lookup-error" : undefined} /><button type="submit" className="secondary-button shrink-0" disabled={Boolean(busy)}>{busy === "lookup" ? "Finding…" : "Find ticket"}<Icon name="arrow" className="size-4" /></button></div>
            {lookupError && <p id="lookup-error" role="alert" className="error-message mt-3">{lookupError}</p>}
          </form>
        </div>
      </section>
      <footer className="mt-7 flex flex-col justify-between gap-3 text-xs leading-5 text-slate-500 sm:flex-row"><p>AI suggests. People decide.</p><p>React + Tailwind CSS <span className="mx-2 text-slate-300">/</span> Express + MongoDB</p></footer>
    </main>
  </div>;
}
