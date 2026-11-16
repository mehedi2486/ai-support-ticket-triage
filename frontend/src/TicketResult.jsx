import React, { useState } from "react";
import Icon from "./Icon.jsx";

export default function TicketResult({ ticket, busy, resultSource }) {
  const [copyMessage, setCopyMessage] = useState("");

  async function copyId() {
    try {
      await navigator.clipboard.writeText(ticket._id);
      setCopyMessage("Copied");
    } catch {
      setCopyMessage("Select the ID to copy it manually.");
    }
  }

  if (busy) {
    return <section className="result-panel flex min-h-112 flex-col items-center justify-center px-8 py-14 text-center" aria-live="polite" aria-busy="true">
      <div className="loading-ring mb-7" />
      <h2 className="text-xl font-semibold text-slate-900">{busy === "create" ? "Making sense of your ticket" : "Finding your saved ticket"}</h2>
      <p className="mt-3 max-w-64 text-sm leading-6 text-slate-600">{busy === "create" ? "Reading the issue, suggesting a priority and saving the result." : "Retrieving the original analysis from the database."}</p>
      <span className="mt-8 rounded-full bg-white px-3 py-1.5 text-xs text-teal-800">{busy === "create" ? "One issue. A clearer next step." : "No new AI request needed."}</span>
    </section>;
  }

  if (!ticket) {
    return <section className="result-panel flex min-h-112 flex-col items-center justify-center px-7 py-12 text-center">
      <div className="relative mb-7 flex size-22 items-center justify-center rounded-3xl border border-teal-200 bg-white text-teal-700 shadow-sm">
        <Icon name="ticket" className="size-10" />
        <span className="absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full bg-teal-700 text-white"><Icon name="spark" className="size-4" /></span>
      </div>
      <h2 className="text-xl font-semibold tracking-tight text-slate-900">A little context. A clearer ticket.</h2>
      <p className="mt-3 max-w-70 text-sm leading-6 text-slate-600">Describe an issue to get a concise summary, a category and a suggested priority.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-2 text-xs text-teal-900">
        <span className="rounded-full border border-teal-200 bg-white/80 px-3 py-1.5">Summarized</span>
        <span className="rounded-full border border-teal-200 bg-white/80 px-3 py-1.5">Categorized</span>
        <span className="rounded-full border border-teal-200 bg-white/80 px-3 py-1.5">Saved</span>
      </div>
    </section>;
  }

  let priorityClass = "bg-sky-50 text-sky-800 ring-sky-200";
  if (ticket.priority === "medium") priorityClass = "bg-amber-50 text-amber-900 ring-amber-200";
  if (ticket.priority === "high") priorityClass = "bg-rose-50 text-rose-800 ring-rose-200";

  return <section className="result-panel min-h-112 p-6 sm:p-8" aria-live="polite">
    <div className="mb-6 flex items-center gap-2 text-sm font-medium text-teal-800"><span className="flex size-6 items-center justify-center rounded-full bg-teal-700 text-white"><Icon name="check" className="size-3.5" /></span>{resultSource === "lookup" ? "Saved ticket retrieved" : "Ticket analyzed and saved"}</div>
    <h2 className="break-words text-xl font-semibold leading-7 tracking-tight text-slate-900">{ticket.title}</h2>
    <div className="mt-5 rounded-xl border border-teal-100 bg-white p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-teal-900"><Icon name="spark" className="size-4" />AI summary</h3>
      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{ticket.summary}</p>
    </div>
    <dl className="mt-5 grid grid-cols-2 gap-4 border-b border-teal-200/70 pb-5">
      <div><dt className="text-xs text-slate-600">Category</dt><dd className="mt-2 text-sm font-semibold capitalize text-slate-900">{ticket.category}</dd></div>
      <div><dt className="text-xs text-slate-600">Suggested priority</dt><dd className="mt-2"><span className={"inline-flex rounded-md px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset " + priorityClass}>{ticket.priority}</span></dd></div>
    </dl>
    <div className="mt-5 flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs text-slate-600">Ticket ID</p><code className="mt-1 block break-all text-xs leading-5 text-slate-800">{ticket._id}</code></div><button type="button" onClick={copyId} className="icon-button shrink-0" aria-label="Copy ticket ID"><Icon name="copy" className="size-4" /></button></div>
    {copyMessage && <p className="mt-1 text-xs text-teal-800" role="status">{copyMessage}</p>}
    <details className="mt-5 border-t border-teal-200/70 pt-4"><summary className="cursor-pointer text-xs font-medium text-slate-700">View original issue and saved details</summary><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{ticket.body}</p><p className="mt-3 break-all text-xs text-slate-500">Model: {ticket.model}</p>{ticket.createdAt && <p className="mt-1 text-xs text-slate-500">Saved {new Date(ticket.createdAt).toLocaleString()}</p>}</details>
    <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-teal-900"><Icon name="shield" className="mt-0.5 size-4 shrink-0" />Review the summary and priority before acting. AI suggestions can be wrong.</p>
  </section>;
}
