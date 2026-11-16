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
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{drawing}</svg>;
}
