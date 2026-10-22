# Mirai Progression Tracker . ( Team Prometheus)

Course-progression tracking for the Mirai School of Technology (MSOT) — built for Student Challenge Problem 1 (Course Progression Tracker) by Shivansh Singh and Saksham Chauhan . .

Faculty log every teaching session in under a minute; the tracker computes planned vs. covered hours, buffer and pace per subject, exam-scope readiness, and early warnings — across all three MSOT campuses (Hi-Tech Ghaziabad, JUG Jaipur, Rathinam Bengaluru).

## ▶ Open the live app

**[shivvpokhariya-lgtm.github.io/mirai-progression-tracker](https://shivvpokhariya-lgtm.github.io/mirai-progression-tracker/)** — the app opens and runs right there in the browser. No install, no setup: pick a role on the first screen (Student / Faculty / Campus Controller) and start.

**Live roles:** Student (read-only) · Faculty (own subjects) · Campus Controller / Manager (full control, all campuses).

## Features

- **Semester setup (per campus):** start/end dates, working-Saturday rule (all / none / 1st & 3rd / 2nd & 4th), holidays & events, exam windows, timetable, CSV import.
- **Automatic planned dates:** topics are dated from the timetable; holidays, weekends and cancelled sessions shift later dates forward automatically.
- **Session logging (< 60 s, phone-friendly):** status (Completed / In Progress / Skipped / Merged / Cancelled), % complete, covered / leftover / carry-forward, classwork & homework, notes — pre-filled from the timetable. Quick Log accepts one line (`sub:topic:status:pct`).
- **Dashboard math (spec formulas, hours-weighted):**
  - Coverage % = covered hours ÷ in-scope planned hours (Skipped topics excluded)
  - Buffer = available hours ÷ remaining hours → **≥ 1.15 On Track · 1.00–1.15 Tight · < 1.00 Danger**
  - Pace = covered − should-be-covered by today; track rollup = worst subject, not the average
- **Exam readiness:** per upcoming exam, % of in-scope topics covered + hours still needed, from the real exam scope — never hardcoded.
- **Early warnings:** missed-log reminders (end of day; unlogged after 48 h → Campus Manager notified), overdue topics, danger list.
- **Students:** read-only view with "Up next" per subject, full roster with section filter and per-student homework/feedback profiles.
- **Calendar:** month grid with holidays/exams, 60-day upcoming list, Google Calendar links and .ics export.
- **PWA:** installable, offline-capable shell (service worker), phone layout with bottom navigation.

## Run it

It's a static app — no build step.

```bash
# any static server, e.g.
python3 -m http.server 8080
# open http://localhost:8080/index.html
```

Pick a role on the login screen (demo login — no password is verified in this build), choose a faculty member for the faculty view, and explore. Data you log is stored locally in the browser (localStorage) per campus, so it works fully offline.

## Backend (Supabase)

- Project `mirai-progression-tracker` (Postgres, RLS enabled). The browser uses only the publishable key; writes to reference tables stay closed to the anon role.
- **Local-first dual-write:** every logged session is saved locally (the dashboard engine's working state) and mirrored into `session_logs`. On load, dashboards merge the cloud logs back in (deduplicated) — a fresh browser rebuilds true progress from the database alone — and the **Saved Sessions** page is a pure database view.
- Setup: run `supabase/schema-v2.sql`, then `supabase/seed-production.sql` (idempotent — 8 faculty, 13 subjects, 119 students, faculty–subject map, and the `session_logs` insert policy).

## Testing

See **TEST-REPORT.md** — hand-calculated verification of the dashboard math against the app (2-decimal match), Saturday-rule and holiday-shift calendar tests, logging-UX timing, permission tests per role, and load tests at 50 / 100 / 200 concurrent users.

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | Role login (Student / Faculty / Manager) |
| `dashboard.html` | Faculty dashboard — subjects, alerts, exam readiness, logging |
| `manager.html` | Campus Controller portal — setup editor, campus switcher, controller activity |
| `subjects.html` · `exams.html` | Subject detail + exam-scope readiness |
| `faculty.html` · `students.html` | Faculty profiles + student directory |
| `calendar.html` · `saved-sessions.html` | Academic calendar · database-backed session history |
| `campus.js` | Shared engine — setup state, date planning, metrics (single source of truth) |
| `DESIGN.md` | Architecture + design document (this build's design decisions and trade-offs) |
| `students.js` | Real 119-student roster (Sections A & B) |
| `supabase.js` | Supabase client + session mirror |
| `starfield.js` · `mobile.css` · `sw.js` · `manifest.json` | Brand background · phone layout · PWA |

Built by Shivansh Singh Pokhariya (MSOT, first year) with Nyx.
