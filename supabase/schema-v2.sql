-- Mirai Progression Tracker — Supabase schema v2 (spec-compliant)
-- Run in Supabase Dashboard → SQL Editor
-- Covers spec §3 (metrics), §4 (roles), §5 (database)

-- ============ campuses (spec §4: Admin sets up campuses) ============
create table if not exists campuses (
  id text primary key,              -- 'hitech', 'jug', 'rathinam'
  name text not null,               -- 'Hi-Tech'
  city text
);

-- ============ sessions (academic years, from 2025-26) ============
create table if not exists sessions (
  id text primary key,              -- '2025-26', '2026-27'
  name text not null,
  start_date date not null,
  end_date date not null
);

-- ============ semesters (spec §4: Admin sets up semesters) ============
create table if not exists semesters (
  id text primary key,              -- '2026-27-odd-hitech'
  session_id text not null references sessions(id),
  campus_id text not null references campuses(id),
  name text not null,               -- 'Odd Semester 2026-27'
  start_date date not null,
  end_date date not null,
  saturday_rule text default '1st3rd'  -- 'all' | 'none' | '1st3rd' | '2nd4th'
);

-- ============ holidays (spec §4: Admin sets up calendars) ============
create table if not exists holidays (
  id uuid primary key default gen_random_uuid(),
  semester_id text not null references semesters(id) on delete cascade,
  holiday_date date not null,
  label text,
  unique(semester_id, holiday_date)
);
create index if not exists holidays_semester_idx on holidays(semester_id);

-- ============ students ============
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  roll_no text,
  section text,                       -- 'A' | 'B'
  session_id text not null references sessions(id),
  created_at timestamptz default now()
);
create index if not exists students_session_idx on students(session_id);

-- ============ faculty ============
create table if not exists faculty (
  id text primary key,              -- 'vishal', 'varun', ...
  name text not null,
  title text,                       -- nullable: unverified titles stay NULL
  dept text,
  email text,
  visiting boolean default false
);

-- ============ subjects ============
create table if not exists subjects (
  id text primary key,              -- 'dsa', 'pps', 'web', ...
  code text not null,
  name text not null,
  track text not null,              -- 'Mirai Track' | 'University'
  session_id text not null references sessions(id)
);

-- ============ faculty_subjects (many-to-many) ============
create table if not exists faculty_subjects (
  faculty_id text not null references faculty(id) on delete cascade,
  subject_id text not null references subjects(id) on delete cascade,
  primary key (faculty_id, subject_id)
);

-- ============ topics ============
create table if not exists topics (
  id uuid primary key default gen_random_uuid(),
  subject_id text not null references subjects(id) on delete cascade,
  title text not null,
  hours_planned numeric default 0,
  planned_date date,
  position int default 0,
  skipped boolean default false
);
create index if not exists topics_subject_idx on topics(subject_id);

-- ============ subtopics ============
create table if not exists subtopics (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references topics(id) on delete cascade,
  title text not null,
  position int default 0
);
create index if not exists subtopics_topic_idx on subtopics(topic_id);

-- ============ timetable (per batch: alpha/beta) ============
create table if not exists timetable (
  id uuid primary key default gen_random_uuid(),
  semester_id text not null references semesters(id) on delete cascade,
  batch text not null default 'alpha',  -- 'alpha' | 'beta'
  day_of_week int not null check (day_of_week between 0 and 6),
  subject_id text not null references subjects(id),
  faculty_id text references faculty(id),
  start_time text not null,
  end_time text not null
);
create index if not exists timetable_semester_idx on timetable(semester_id);

-- ============ session_logs ============
create table if not exists session_logs (
  id uuid primary key default gen_random_uuid(),
  log_date date not null,
  subject_id text not null references subjects(id),
  faculty_id text references faculty(id),
  topic_id uuid references topics(id),
  topic_label text,
  status text not null,
  pct int default 0,
  hours numeric default 0,
  covered text,
  leftover text,
  homework text,
  homework_detail text,
  notes text,
  created_at timestamptz default now()
);
create index if not exists logs_subject_date_idx on session_logs(subject_id, log_date);
create index if not exists logs_faculty_idx on session_logs(faculty_id);

-- ============ lesson_plans (spec §4: faculty uploads lesson plan) ============
create table if not exists lesson_plans (
  id uuid primary key default gen_random_uuid(),
  subject_id text not null references subjects(id) on delete cascade,
  faculty_id text references faculty(id),
  file_name text not null,
  file_type text,
  file_size int,
  file_data text,                   -- base64 data URL (≤2MB)
  uploaded_at timestamptz default now(),
  unique(subject_id)
);

-- ============ feedback ============
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  faculty_id text not null references faculty(id),
  student_id uuid not null references students(id) on delete cascade,
  subject_id text not null references subjects(id),
  comment text not null,
  log_date date not null,
  created_at timestamptz default now()
);
create index if not exists feedback_faculty_idx on feedback(faculty_id);
create index if not exists feedback_student_idx on feedback(student_id);

-- ============ exams (spec §4: Admin sets up exam windows) ============
create table if not exists exams (
  id text primary key,
  semester_id text not null references semesters(id) on delete cascade,
  name text not null,
  exam_date date not null
);

-- ============ exam_scope ============
create table if not exists exam_scope (
  exam_id text not null references exams(id) on delete cascade,
  subject_id text not null references subjects(id) on delete cascade,
  topic_ids uuid[] not null default '{}',
  primary key (exam_id, subject_id)
);

-- ============ Row Level Security ============
-- Testing phase: open access via anon key. BEFORE production: replace with
-- auth-based policies (faculty writes own subjects only, students read-only).
alter table campuses enable row level security;
alter table sessions enable row level security;
alter table semesters enable row level security;
alter table holidays enable row level security;
alter table students enable row level security;
alter table faculty enable row level security;
alter table subjects enable row level security;
alter table faculty_subjects enable row level security;
alter table topics enable row level security;
alter table subtopics enable row level security;
alter table timetable enable row level security;
alter table session_logs enable row level security;
alter table lesson_plans enable row level security;
alter table feedback enable row level security;
alter table exams enable row level security;
alter table exam_scope enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'campuses','sessions','semesters','holidays','students','faculty',
    'subjects','faculty_subjects','topics','subtopics','timetable',
    'session_logs','lesson_plans','feedback','exams','exam_scope']
  loop
    execute format('drop policy if exists open_all on %I', t);
    execute format('create policy open_all on %I for all using (true) with check (true)', t);
  end loop;
end $$;
