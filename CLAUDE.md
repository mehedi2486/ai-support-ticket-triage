# Project guidance

- Scope: a local, fictional-data support-ticket API. Keep its two-route design small and understandable.
- Prefer straightforward syntax and explicit steps. Use advanced syntax only when it provides a necessary benefit, and explain unfamiliar constructs when introducing them. Match the owner's Express/Router/Mongoose/Zod learning baseline.
- Finish the agreed backend implementation and verification before beginning the teaching walkthrough. Do not make owner quiz answers a dependency for authorized implementation. Explain the completed code afterward when requested.
- Before editing, read README.md and the files the change touches. Preserve unrelated work.
- Validate HTTP input and AI output. Keep keys/connection strings in ignored local environment files; never print or commit them.
- Use `npm ci --ignore-scripts`, `npm test`, and `npm audit --omit=dev` for dependency and regression checks. Networked checks use real credentials/quota; run them only when needed and keep their generated records local.
- Document new behavior and meaningful limits. Describe AI-assisted work accurately.
- Mehedi authorizes committing and pushing verified major changes to this project's origin during active work sessions. Review the intended files/diff, run appropriate checks, use descriptive commits and verify the remote SHA afterward. Do not force-push or rewrite published history. No background publishing is configured.
- Keep AGENTS.md and CLAUDE.md aligned when changing shared project guidance.
