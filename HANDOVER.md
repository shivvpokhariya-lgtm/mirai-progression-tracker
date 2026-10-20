# Handover — Mirai Progression Tracker

Prepared for the MSOT / Mirai team. This repository is the complete, working
application — no build step, no server code to deploy.

## What you received

- The tracker app (9 pages + PWA) — see `README.md` for features and structure.
- A live Supabase backend (project `mirai-progression-tracker`) already
  created and seeded; the app works with or without it (local-first).
- `TEST-REPORT.md` — tests already executed with results, plus the few items
  that need people on campus (TR-03) marked clearly.
- `supabase/` — the full database schema and the idempotent seed file, in case
  you ever need to rebuild the backend from scratch.

## Run it

Host the folder on any static host (GitHub Pages works as-is) or open
`index.html` through a local server:

```bash
python3 -m http.server 8080   # then open http://localhost:8080/index.html
```

Login is role-based demo login (no password verification in this build):
pick **Student**, **Faculty** (then the faculty member), or **Manager**
(Campus Controller).

## Entering your data

Everything is editable inside the app — no code changes needed:

1. Log in as **Manager** → the Setup editor holds the semester (dates,
   working-Saturday rule, holidays, events), the exam windows, the timetable,
   the subject/topic lists and the student roster, **per campus**
   (Hi-Tech / JUG / Rathinam — switch from the topbar).
2. The app currently ships with Hi-Tech's real first-year data (8 faculty,
   13 subjects, 119 students in Sections A & B) and demo starting progress —
   replace or reset it from the same Setup editor. Each browser keeps its own
   working copy (localStorage); use the CSV export in the dashboard to move
   logged sessions between machines.
3. Topics are dated automatically from the timetable; holidays and cancelled
   sessions shift later dates on their own.

## Backend (optional but wired)

- Every session logged in the app is mirrored to Supabase `session_logs`;
  **Saved Sessions** reads them back. Reference tables (faculty, subjects,
  students) are read-only for the app's public key; only the team can write
  them (SQL Editor / this seed).
- To rebuild on a fresh Supabase project: run `supabase/schema-v2.sql`, then
  `supabase/seed-production.sql`, and point `supabase.js` at the new project's
  URL + publishable key.
- Before any wider production rollout, add real authentication (Supabase Auth)
  and per-user RLS — roles in this build are a client-side demo gate, by
  design for the challenge.

## Testing still to do on campus

- **TR-03** (in `TEST-REPORT.md`): 5 faculty log a session from their phones;
  median must be < 60 s. The flow is pre-filled from the timetable and the
  automated end-to-end run completes in seconds — this only needs people.
- **TR-06**: re-run the load harness from the campus network (the report
  explains why the sandbox numbers are pessimistic) and record p95 there.

## Known limits (honest list)

- Demo topic-progress percentages ship as starting data; real progress comes
  from faculty session logs (by design).
- Language Lab, Electrical Lab and Product Development topic lists are
  placeholders to be replaced with the official ones in Setup.
- Attendance is intentionally not part of this app (handled on the MSOT hub).

Questions on the build: Shivansh Singh Pokhariya (MSOT first year).
