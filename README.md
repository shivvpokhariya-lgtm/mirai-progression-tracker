# Mirai Progression Tracker

Course progression tracker for MSOT (Mirai School of Technology) — Mirai Track + University Track (AKTU 2026-27 scheme) in one dashboard.

## Run it

No build step. Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

then visit http://localhost:8000

Works on GitHub Pages as-is (all relative links, no backend).

## Demo logins

- **Student** — pick Student, any name/email, continue.
- **Faculty** — pick Faculty, then choose a faculty member. Each member only controls their own subjects:
  - Vishal Rathee — Data Structures & Algorithms, Programming Languages
  - Varun Kumar Sharma — Web Development, AI & Prompt Engineering
  - Gaurav Singh — Calculus and Linear Algebra, Indian Knowledge System
  - Aman Srivastava — Fundamentals of Electrical Engineering
  - Suman Rajput — Physics Laboratory
  - Dr. Himanshu Kumar — Quantum Physics and Applications
  - Zakir Husain — Computer Aided Engineering Drawing Lab

## What it does

- Semester setup (term, campus, working Saturdays, holidays, exam windows)
- Weekly timetable editor → automatic planned dates per topic
- Per-subject coverage, buffer and pace tracking (10 subjects)
- Faculty session logging (status, hours, homework, notes) + Quick Log (paste a message, Hinglish parser)
- Per-exam readiness (Sessional 1, Mid-Sem, PUT, End-Term) with syllabus scope marking
- Student "Up next", missed-log alerts, AI weekly summary
- Faculty feedback on students + homework given, visible on faculty profiles
- CSV exports, exam calendar (.ics / Google Calendar)

## Honest limits

- 100% client-side. All data lives in the browser's localStorage (`mirai_setup_v1`, `mirai_feedback_v1`) — no backend, no real multi-user auth. Two people on two devices will not see each other's data.
- "AI" features (Quick Log parsing, weekly summary) are deterministic rules-based code, not an LLM.
- Subtopic percentages ship with demo starting data; real distribution comes from faculty session input.
- Visiting-faculty "Campus Manager notified" is a UI state, not a real notification.
- Calendar buttons generate files/links; there is no two-way sync.
- Syllabus labels are short paraphrases of the official AKTU scheme, not the official text.
