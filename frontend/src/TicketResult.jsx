import React, { useState } from "react";
import Icon from "./Icon.jsx";

export default function TicketResult({ ticket, busy, resultSource, headingRef, mode }) {
  const [copyMessage, setCopyMessage] = useState("");

  async function copyId() {
    try {
      await navigator.clipboard.writeText(ticket._id);
      setCopyMessage("Ticket ID copied");
    } catch {
      setCopyMessage("Select the ID below to copy it manually.");
    }
  }

  if (busy) {
    return <section className="result-area" aria-busy="true" aria-label="Ticket analysis">
      <div className="result-topline"><h2>{busy === "create" ? "Analyzing your report" : "Retrieving ticket"}</h2><Icon name="clock" className="size-4" /></div>
      <p className="result-caption">{busy === "create" ? "Generating the summary, category and priority. Then saving your ticket." : "Reading the saved report and its original analysis."}</p>
      <div className="skeleton-group" aria-hidden="true"><div className="skeleton skeleton-title" /><div className="skeleton" /><div className="skeleton" /><div className="skeleton skeleton-short" /><div className="skeleton-properties"><div className="skeleton" /><div className="skeleton" /></div></div>
      <p className="processing-note">Keep this page open. Your result will appear here.</p>
    </section>;
  }

  if (!ticket) {
    return <section className="result-area empty-result" aria-labelledby="preview-heading">
      <div className="result-topline"><h2 id="preview-heading">Analysis</h2><span>Awaiting ticket</span></div>
      <div className="empty-message"><Icon name={mode === "lookup" ? "archive" : "document"} className="size-7" /><h3>{mode === "lookup" ? "Saved report, ready to retrieve" : "Your report becomes a triage brief"}</h3><p>{mode === "lookup" ? "Enter a ticket ID to see the report and the analysis saved with it." : "Add an issue or choose an example. The saved result will appear here."}</p></div>
      <dl className="preview-fields"><div><dt>Summary</dt><dd>A concise account of the issue</dd></div><div><dt>Category</dt><dd>Access, performance, bug or other</dd></div><div><dt>Priority</dt><dd>A suggested level of urgency</dd></div></dl>
    </section>;
  }

  return <section className="result-area" aria-labelledby="result-heading">
    <div className="result-topline"><h2 id="result-heading" ref={headingRef} tabIndex={-1}>Saved analysis</h2><span className="saved-indicator"><Icon name="check" className="size-4" />{resultSource === "lookup" ? "Retrieved" : "Saved"}</span></div>
    <h3 className="ticket-title">{ticket.title}</h3>
    <div className="analysis-summary"><h4>Summary</h4><p>{ticket.summary}</p></div>
    <dl className="ticket-properties"><div><dt>Category</dt><dd className="category-value"><Icon name="tag" className="size-4" />{ticket.category}</dd></div><div><dt>Suggested priority</dt><dd><span className={"priority priority-" + ticket.priority}><Icon name="priority" className="size-4" />{ticket.priority}</span></dd></div></dl>
    <div className="ticket-identifier"><div className="identifier-heading"><h4>Ticket ID</h4><button type="button" onClick={copyId} className="copy-button"><Icon name="copy" className="size-4" />Copy ID</button></div><code>{ticket._id}</code>{copyMessage && <p role="status" className="copy-message">{copyMessage}</p>}</div>
    <details className="original-report"><summary>Original report & details<Icon name="chevron" className="size-4" /></summary><p className="original-body">{ticket.body}</p><dl className="saved-details"><div><dt>Model</dt><dd>{ticket.model}</dd></div>{ticket.createdAt && <div><dt>Saved</dt><dd>{new Date(ticket.createdAt).toLocaleString()}</dd></div>}</dl></details>
    <p className="review-note"><Icon name="info" className="size-4" />AI-generated suggestions. Review before acting.</p>
  </section>;
}
