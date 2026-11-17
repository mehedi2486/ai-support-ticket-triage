import React from "react";

export default function Icon({ name, className = "size-5" }) {
  let drawing;
  if (name === "ticket") drawing = <><path d="M4 4h16v5a3 3 0 0 0 0 6v5H4v-5a3 3 0 0 0 0-6V4Z" /><path d="M9 8h6M9 12h4M9 16h6" /></>;
  if (name === "arrow") drawing = <><path d="M5 12h14M13 6l6 6-6 6" /></>;
  if (name === "check") drawing = <path d="m5 12 4 4L19 6" />;
  if (name === "search") drawing = <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></>;
  if (name === "copy") drawing = <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M15 8V4H4v11h4" /></>;
  if (name === "spark") drawing = <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" /></>;
  if (name === "shield") drawing = <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" /><path d="m8 12 3 3 5-6" /></>;
  if (name === "plus") drawing = <path d="M12 5v14M5 12h14" />;
  if (name === "external") drawing = <><path d="M14 4h6v6M20 4l-9 9M10 4H4v16h16v-6" /></>;
  if (name === "clock") drawing = <><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2" /></>;
  if (name === "alert") drawing = <><path d="m12 3 10 18H2L12 3ZM12 9v5M12 17v.1" /></>;
  if (name === "archive") drawing = <><path d="M4 8v12h16V8M3 3h18v5H3zM9 12h6" /></>;
  if (name === "document") drawing = <><path d="M14 3H5v18h14V8l-5-5ZM14 3v5h5M9 12h6M9 16h6" /></>;
  if (name === "tag") drawing = <><path d="m3 3 8 .1 10 10-8 8L3 11V3Z" /><circle cx="7" cy="7" r="1" /></>;
  if (name === "priority") drawing = <path d="M5 18v-4M12 18V9M19 18V4" />;
  if (name === "chevron") drawing = <path d="m6 9 6 6 6-6" />;
  if (name === "info") drawing = <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7v.1" /></>;
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{drawing}</svg>;
}
