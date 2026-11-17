---
name: Triage Desk
description: A compact ticket editor and saved-analysis workspace.
colors:
  ink: "#202c42"
  muted: "#58657a"
  accent: "#2959c8"
  accent-hover: "#2049aa"
  navy: "#1c2d4d"
  line: "#dce2ec"
  ground: "#f1f4f9"
  panel: "#f7f9fc"
  canvas: "#ffffff"
  danger: "#ad283e"
typography:
  headline:
    fontFamily: "Segoe UI, Helvetica Neue, Arial, sans-serif"
    fontSize: "24px"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Segoe UI, Helvetica Neue, Arial, sans-serif"
    fontSize: "20px"
    fontWeight: 650
    lineHeight: 1.4
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Segoe UI, Helvetica Neue, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Segoe UI, Helvetica Neue, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 600
  caption:
    fontFamily: "Segoe UI, Helvetica Neue, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  control: "6px"
  workbench: "12px"
spacing:
  compact: "8px"
  small: "12px"
  medium: "16px"
  section: "24px"
  pane: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.canvas}"
    rounded: "{rounded.control}"
    padding: "11px 18px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-quiet:
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
  button-example:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.control}"
    padding: "8px 11px"
  input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "12px 13px"
  workbench:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.workbench}"
---

# Design System: Triage Desk

## Overview

**Creative North Star: "The correction desk"**

This document records the observed implementation. A blue-black shell frames a white editor and a pale analysis surface. Labels, input and saved output lead; decorative containers and marketing copy recede.

The interface uses familiar web controls with compact type and visible task selection. Color distinguishes action, selection and meaningful state. The workspace supports ticket creation and ID lookup. Its visual direction may evolve after review.

**Key Characteristics:**

- A shared workbench with distinct editor and analysis surfaces.
- Restrained action color and explicit text labels.
- Readable compact controls, clear focus and recoverable errors.

## Colors

### Primary

Action blue marks primary buttons, active navigation, links and the caret. Its deeper variant is the primary-button hover state. Blue-black carries the header rather than the main work surface.

### Neutral

Ink carries content; muted blue-gray carries help and metadata. White is the editor canvas, cool ground surrounds the workbench, pale panel distinguishes analysis, and the line color separates regions.

### State

Danger marks invalid fields and failure messaging. Saved feedback uses green; suggested high, medium and low priorities use red, amber and green together with text labels. These states do not imply a workflow beyond the data actually saved.

## Typography

One system sans stack serves the operating interface. No display face is used. Monospace appears only for ticket IDs.

The desktop workspace heading uses the headline token and becomes smaller (22px) on phones. Task headings use the title token and become (19px). Report prose is (15px) with generous line spacing (1.8); help and metadata use captions. Form text rises to (16px) on small screens. Sentence case and moderate weight separate roles without large promotional typography.

## Layout

The header and workspace share a maximum width (1280px). Desktop content has side padding (32px), with an editor-to-analysis grid ratio (1.12:1). Task navigation spans the workbench above both panes. A single boundary separates the workbench; pane color and a divider distinguish analysis.

At widths up to (900px), panes stack and successful requests reveal the result. At widths up to (540px), workspace padding becomes (24px 16px), pane padding becomes (24px 20px), and secondary header metadata hides. Long ticket text wraps rather than expanding the viewport.

## Elevation & Depth

The implemented interface has no box shadows. Depth comes from tonal surfaces and one-pixel structural borders. Focus outlines communicate interaction, not elevation.

## Shapes

The workbench has soft outer corners; controls use a smaller radius. Thin strokes define inputs and examples. Icons share authored line SVG geometry, rounded line caps and a consistent stroke (1.6). Priority uses text and an icon rather than a decorative pill.

## Components

- **Primary buttons:** solid action color, minimum height (46px), explicit action labels, deeper hover and visible focus. Disabled controls reduce opacity and cannot repeat a busy request.
- **Quiet and example buttons:** minimum height (44px). Quiet actions gain a neutral hover surface; examples use a light border and blue hover feedback.
- **Fields:** visible labels, counters, help, white fill and a thin stroke. Focus changes the border and adds an outline. Invalid fields expose `aria-invalid`, reference the error and receive focus. Native required-field behavior remains in place.
- **Navigation:** text-and-icon buttons with `aria-pressed`; active selection uses action color and an underline. These are buttons, not an incomplete ARIA tab widget.
- **Analysis:** an instructional empty view, skeleton loading view, or saved report. Copy ID is a labeled button; original details use native disclosure. Successful requests focus the result heading; mobile also scrolls it into view.
- **Feedback:** errors preserve drafts and saved records. A persistent status announces progress, failure or success. Skeleton opacity animation and transitions stop under reduced motion. Direct screen-reader testing remains outside the recorded evidence.

## Do's and Don'ts

### Do:

- **Do** preserve the distinction between draft input and saved analysis.
- **Do** retain visible labels, keyboard focus and meaningful state text.
- **Do** keep long report text and IDs contained at narrow widths.

### Don't:

- **Don't** use color alone to communicate priority or failure.
- **Don't** erase a saved result when clearing only the draft.
- **Don't** turn decorative icons or invented metrics into primary content.
