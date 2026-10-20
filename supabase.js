// Supabase client configuration for Mirai Progression Tracker
// Project: mirai-progression-tracker
// Created: 2026-10-16

const SUPABASE_URL = 'https://wxltdcizdzybxfxvzxfg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8MzXiFIAQj2xlp_VHKorJw_eLTuLYiz';

// Initialize Supabase client (requires @supabase/supabase-js via CDN)
// Add this to HTML: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
let supabaseClient = null;

function getSupabase() {
  if (!supabaseClient && typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseClient;
}

// Test connection
async function testSupabaseConnection() {
  const client = getSupabase();
  if (!client) {
    console.error('Supabase client not initialized. Include @supabase/supabase-js CDN.');
    return false;
  }
  try {
    const { data, error } = await client.from('campuses').select('id, name').limit(1);
    if (error) throw error;
    console.log('Supabase connected! Sample:', data);
    return true;
  } catch (e) {
    console.error('Supabase connection failed:', e.message);
    return false;
  }
}

// Dual-write one logged session (localStorage stays the app's source of truth;
// this mirrors the entry into Supabase session_logs so Saved Sessions shows it.
// Fire-and-forget: any failure returns false and never breaks the app flow.)
async function logSessionToDB(e) {
  try {
    const client = getSupabase();
    if (!client || !e || !e.sub) return false;
    const row = {
      log_date: e.date,
      subject_id: e.sub,
      faculty_id: e.fac || null,
      topic_label: e.tlabel || null,
      status: e.status,
      pct: e.pct | 0,
      hours: e.hours || 0,
      covered: e.covered || null,
      leftover: e.leftover || null,
      homework: e.hw || null,
      homework_detail: e.hwd || null,
      notes: e.notes || null
    };
    const { error } = await client.from('session_logs').insert(row);
    return !error;
  } catch (err) {
    return false;
  }
}

// Read every mirrored session log (anon read policy). Returns null when
// offline / unavailable so callers can fall back to local-only state.
async function fetchSessionLogs() {
  try {
    const client = getSupabase();
    if (!client) return null;
    const { data, error } = await client.from('session_logs')
      .select('log_date,subject_id,faculty_id,topic_label,status,pct,hours')
      .order('log_date', { ascending: true });
    if (error) return null;
    return data || [];
  } catch (e) { return null; }
}

// Normalize cloud rows into local log-entry shape: resolve each row's
// topic_label back to a topic index inside its subject, and drop rows that
// are already in the local log store (multiset dedupe on
// sub|topic|status|pct|date), so a session logged on this device is never
// applied twice.
function cloudEntries(rows, subjects, localLogs) {
  if (!rows || !subjects) return [];
  const counts = {};
  (localLogs || []).forEach(function (l) {
    const k = l.sub + '|' + (+l.topic) + '|' + l.status + '|' + (+l.pct || 0) + '|' + l.date;
    counts[k] = (counts[k] || 0) + 1;
  });
  const out = [];
  rows.forEach(function (r) {
    const s = subjects.filter(function (x) { return x.id === r.subject_id; })[0];
    if (!s || !s.topics) return;
    let idx = -1;
    for (let i = 0; i < s.topics.length; i++) { if (s.topics[i].t === r.topic_label) { idx = i; break; } }
    if (idx < 0) {
      const want = String(r.topic_label || '').trim().toLowerCase();
      for (let i = 0; i < s.topics.length; i++) { if (String(s.topics[i].t || '').trim().toLowerCase() === want) { idx = i; break; } }
    }
    if (idx < 0) return;
    const k = r.subject_id + '|' + idx + '|' + r.status + '|' + (+r.pct || 0) + '|' + r.log_date;
    if (counts[k] > 0) { counts[k]--; return; }
    out.push({ date: r.log_date, sub: r.subject_id, topic: idx, tlabel: r.topic_label,
               subtopic: -1, status: r.status, pct: +r.pct || 0, hours: +r.hours || 0,
               fac: r.faculty_id || '', cloud: true });
  });
  return out;
}

// Export for use in pages
if (typeof window !== 'undefined') {
  window.MiraiDB = { getSupabase, testSupabaseConnection, logSession: logSessionToDB, fetchLogs: fetchSessionLogs, cloudEntries, SUPABASE_URL };
}
