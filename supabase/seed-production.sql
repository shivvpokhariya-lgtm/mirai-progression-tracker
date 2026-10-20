-- ============================================================
-- Mirai Progression Tracker — production seed (idempotent)
-- Run ONCE in the Supabase SQL editor (or via Management API).
-- Safe to re-run: faculty/subjects/faculty_subjects use
-- ON CONFLICT DO NOTHING; students insert only when empty.
-- ============================================================

-- ---------- faculty (8) ----------
insert into faculty (id, name) values
  ('vishal','Vishal Rathee'),
  ('varun','Varun Kumar Sharma'),
  ('gaurav','Gaurav Singh'),
  ('aman','Aman Srivastava'),
  ('suman','Suman Rajput'),
  ('himanshu','Dr. Himanshu Kumar'),
  ('zakir','Zakir Husain'),
  ('soniya','Soniya Tyagi')
on conflict (id) do nothing;

-- ---------- subjects (13, session 2026-27) ----------
insert into subjects (id, code, name, track, session_id) values
  ('maths1','AAS103D','Calculus and Linear Algebra','University','2026-27'),
  ('phy','AAS101E','Quantum Physics and Applications','University','2026-27'),
  ('bee','AEE101A','Fundamentals of Electrical Engineering','University','2026-27'),
  ('pps','ACS101','Programming Languages','University','2026-27'),
  ('egd','ACE151E','Computer Aided Engineering Drawing Lab','University','2026-27'),
  ('web','MR201','Web Development','Mirai Track','2026-27'),
  ('dsa','CS301','Data Structures & Algorithms','Mirai Track','2026-27'),
  ('iks','AAS104','Introduction to Indian Knowledge System','University','2026-27'),
  ('phylab','AAS151','Physics Laboratory','University','2026-27'),
  ('prompt','AAI101','Introduction to AI and Prompt Engineering','University','2026-27'),
  ('langlab','','Language Lab','University','2026-27'),
  ('beelab','','Electrical Engineering Lab','University','2026-27'),
  ('pd','PD101','Product Development','Mirai Track','2026-27')
on conflict (id) do nothing;

-- ---------- faculty_subjects (13) ----------
insert into faculty_subjects (faculty_id, subject_id) values
  ('vishal','dsa'), ('vishal','pps'), ('vishal','pd'),
  ('varun','web'), ('varun','prompt'),
  ('gaurav','maths1'), ('gaurav','iks'),
  ('aman','bee'), ('aman','beelab'),
  ('suman','phylab'),
  ('himanshu','phy'),
  ('zakir','egd'),
  ('soniya','langlab')
on conflict do nothing;

-- ---------- students (119, only when the table is empty) ----------
do $$
begin
  if not exists (select 1 from students limit 1) then
    insert into students (name, section, session_id) values
    ('Aditi singh', 'A', '2026-27'),
    ('ajay yadav', 'A', '2026-27'),
    ('Akash Payra', 'A', '2026-27'),
    ('Akhil Mishra', 'A', '2026-27'),
    ('anjali kumari', 'A', '2026-27'),
    ('Ankur roy', 'A', '2026-27'),
    ('Anshu Yadav', 'A', '2026-27'),
    ('ARYAN JAGGI', 'A', '2026-27'),
    ('Aryan NA', 'A', '2026-27'),
    ('Avi Rishu Sarathe', 'A', '2026-27'),
    ('Ayush Kumar Singh', 'A', '2026-27'),
    ('Bhavyam NA', 'A', '2026-27'),
    ('Bhupesh Singh Shahi', 'A', '2026-27'),
    ('Chanakya Mishra', 'A', '2026-27'),
    ('Chirushi Gupta', 'A', '2026-27'),
    ('Dwij Gondaliya', 'A', '2026-27'),
    ('Hardik Kumar', 'A', '2026-27'),
    ('JEETESH CHAUDHARY', 'A', '2026-27'),
    ('jeevesh chaudhary', 'A', '2026-27'),
    ('kanhai kumar', 'A', '2026-27'),
    ('KAYENAT PRAVEEN', 'A', '2026-27'),
    ('Krishna Chaurasiya', 'A', '2026-27'),
    ('Kumar Gaurav', 'A', '2026-27'),
    ('Kunal Gaur', 'A', '2026-27'),
    ('Kunal Mishra', 'A', '2026-27'),
    ('Lara Kumar', 'A', '2026-27'),
    ('Manav Rana', 'A', '2026-27'),
    ('Mayank Raj', 'A', '2026-27'),
    ('Mohit.', 'A', '2026-27'),
    ('Nishant Sharma', 'A', '2026-27'),
    ('Omkar Yadav', 'A', '2026-27'),
    ('Parth Singhal', 'A', '2026-27'),
    ('Parv Agarwal', 'A', '2026-27'),
    ('Piyush Kumar', 'A', '2026-27'),
    ('Prince Nautiyal', 'A', '2026-27'),
    ('Priya Patel', 'A', '2026-27'),
    ('Radhika Sahay', 'A', '2026-27'),
    ('Raj Kamal', 'A', '2026-27'),
    ('Ranjan Kumar', 'A', '2026-27'),
    ('Ripuhan.', 'A', '2026-27'),
    ('Ritika Saklan', 'A', '2026-27'),
    ('Rupam.', 'A', '2026-27'),
    ('Saksham Chauhan', 'A', '2026-27'),
    ('Sameer Dubey', 'A', '2026-27'),
    ('Shambhavi Sharma', 'A', '2026-27'),
    ('Shaurya Pandey', 'A', '2026-27'),
    ('Shaurya Taliyan', 'A', '2026-27'),
    ('Shivansh Singh Pokhariya', 'A', '2026-27'),
    ('SHOBHIT SOAM', 'A', '2026-27'),
    ('Shreyash Tripathi', 'A', '2026-27'),
    ('Siddharth Sharma', 'A', '2026-27'),
    ('Simran Kumari', 'A', '2026-27'),
    ('Sudhanshu Kumar Gupta', 'A', '2026-27'),
    ('Surodip De', 'A', '2026-27'),
    ('Tanisha Jain', 'A', '2026-27'),
    ('Tejaswi Gupta', 'A', '2026-27'),
    ('Vaanij Jaluthriya', 'A', '2026-27'),
    ('Vicky raj', 'A', '2026-27'),
    ('Aanya Varshney', 'B', '2026-27'),
    ('Abdullah Numair Ahmed', 'B', '2026-27'),
    ('Abhijeet Singh', 'B', '2026-27'),
    ('Adarsh kumar', 'B', '2026-27'),
    ('Adarsh kumar', 'B', '2026-27'),
    ('akshat jain', 'B', '2026-27'),
    ('Amit kumar', 'B', '2026-27'),
    ('ANUP GUPTA', 'B', '2026-27'),
    ('Archit Sharma', 'B', '2026-27'),
    ('Asfiya Siddiqui', 'B', '2026-27'),
    ('AYUSH CHAUHAN', 'B', '2026-27'),
    ('Ayush Kumar', 'B', '2026-27'),
    ('AYUSH YADAV', 'B', '2026-27'),
    ('Dev', 'B', '2026-27'),
    ('Dhruv kashyap', 'B', '2026-27'),
    ('Gauri Singh', 'B', '2026-27'),
    ('Gunjan .', 'B', '2026-27'),
    ('Hari krishna shukla', 'B', '2026-27'),
    ('HARSH KESHRI', 'B', '2026-27'),
    ('harsh singh', 'B', '2026-27'),
    ('Harshvardhan Singh', 'B', '2026-27'),
    ('Kaushik Kumar', 'B', '2026-27'),
    ('Luv .', 'B', '2026-27'),
    ('Mohit goyal', 'B', '2026-27'),
    ('Mradul .', 'B', '2026-27'),
    ('Naman Singh Kushwaha', 'B', '2026-27'),
    ('Neel yuvan', 'B', '2026-27'),
    ('NUPUR SAHA', 'B', '2026-27'),
    ('Prabhanshu Shrivastava', 'B', '2026-27'),
    ('Riddhi .', 'B', '2026-27'),
    ('Rishav Ranjan', 'B', '2026-27'),
    ('Saket Anand', 'B', '2026-27'),
    ('Saksham gusain', 'B', '2026-27'),
    ('saksham soni', 'B', '2026-27'),
    ('Sameer Pandey', 'B', '2026-27'),
    ('Sanskar Singh', 'B', '2026-27'),
    ('SHAURYA PUNDIR', 'B', '2026-27'),
    ('SHIV CHOUDHARY', 'B', '2026-27'),
    ('Shivam Rao', 'B', '2026-27'),
    ('shivangi sharma', 'B', '2026-27'),
    ('Shreyashi Agrawal', 'B', '2026-27'),
    ('Shruti Sharma', 'B', '2026-27'),
    ('Shubham Kumar', 'B', '2026-27'),
    ('Shubham Mehta', 'B', '2026-27'),
    ('Shwetank NA', 'B', '2026-27'),
    ('Siddhant Shrivastava', 'B', '2026-27'),
    ('Siddharth Singh', 'B', '2026-27'),
    ('SIDDHI NA', 'B', '2026-27'),
    ('Suhani Kumari Singh', 'B', '2026-27'),
    ('Sujit Kumar', 'B', '2026-27'),
    ('Sumit kumar', 'B', '2026-27'),
    ('Sunny kumar', 'B', '2026-27'),
    ('TAUSIF RAZA', 'B', '2026-27'),
    ('Tejansh Maurya', 'B', '2026-27'),
    ('Utkarsh Raj', 'B', '2026-27'),
    ('Utkarshini Chaurasia', 'B', '2026-27'),
    ('Vedansh Verma', 'B', '2026-27'),
    ('Yash rana', 'B', '2026-27'),
    ('Yatharth Vishnoi', 'B', '2026-27'),
    ('Kartik Negi', 'B', '2026-27'),
    ('Shreya Kumari', 'B', '2026-27');
  end if;
end $$;

-- ---------- session_logs: allow the app (publishable key) to INSERT ----------
-- The tracker is local-first with a demo login; the browser mirrors each
-- logged session into session_logs. Reads are already permitted.
-- Writes to every other table stay closed to the anon role.
drop policy if exists anon_insert_session_logs on session_logs;
create policy anon_insert_session_logs on session_logs
  for insert to anon with check (true);
