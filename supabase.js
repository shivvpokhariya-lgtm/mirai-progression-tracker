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

// Export for use in pages
if (typeof window !== 'undefined') {
  window.MiraiDB = { getSupabase, testSupabaseConnection, logSession: logSessionToDB, SUPABASE_URL };
}
