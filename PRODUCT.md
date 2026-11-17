# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

People trying a local support-ticket triage demo with fictional issue reports.

## Product Purpose

Create a fictional support ticket, inspect its generated summary/category/priority, and retrieve a saved ticket by ID. Success means the user can complete either task and clearly see its saved result or recover from an error.

## Capabilities and Constraints

- React and Tailwind CSS frontend; Express, Zod, Gemini and MongoDB backend.
- POST /tickets analyzes and saves; GET /tickets/:id reads an existing record without another AI call.
- Scope stays focused on create and ID lookup. No session ticket list.
- Fictional-data portfolio demo, runnable locally or on Render Free. No authentication, ticket editing, deletion, assignment or resolution workflow. Anyone knowing a ticket ID can retrieve the fictional record.
- Daily AI attempts are capped in MongoDB; failed attempts count and service restarts do not reset the daily budget. Health checks report readiness without calling the model.
- Category and priority are AI suggestions requiring human review. No model-accuracy claim.
- Credentials remain server-side in ignored environment files.

## Brand Commitments

The product name is Triage Desk. Use simple language, clear actions and familiar web controls.

## Evidence on Hand

Working API, automated route/service tests, a previously verified real create/read/restart flow, and browser screenshots with fictional data. No user study or production usage evidence.

## Product Principles

- Put create and find actions before promotional copy.
- Keep issue context and generated suggestions distinguishable.
- Preserve input on failures and explain recovery.
- Keep the code straightforward for study.
