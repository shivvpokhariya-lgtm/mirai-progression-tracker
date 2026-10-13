/* campus.js — shared campus registry + per-campus setup state.
   Loaded by dashboard.html, manager.html, subjects.html, exams.html, faculty.html, students.html.
   Setup data lives per campus in localStorage 'mirai_campuses_v1' ({hitech:{...}, jug:{...}, rathinam:{...}}).
   One-time migration: legacy single 'mirai_setup_v1' becomes the Hi-Tech campus setup. */

var CAMPUSES = [
  {id:'hitech',   name:'Hi-Tech',  city:'Ghaziabad'},
  {id:'jug',      name:'JUG',      city:'Jaipur'},
  {id:'rathinam', name:'Rathinam', city:'Bengaluru'}
];
function campusById(id){ return CAMPUSES.filter(function(c){return c.id===id;})[0]||CAMPUSES[0]; }

var CampusDB = {
  _key:'mirai_campuses_v1',
  all:function(){ try{ return JSON.parse(localStorage.getItem(this._key))||{}; }catch(e){ return {}; } },
  _write:function(a){ try{ localStorage.setItem(this._key, JSON.stringify(a)); }catch(e){} },
  get:function(id){ var a=this.all(); return a[id]||null; },
  save:function(id,s){ var a=this.all(); a[id]=s; this._write(a); },
  current:function(){ try{ return localStorage.getItem('mirai_campus')||'hitech'; }catch(e){ return 'hitech'; } },
  setCurrent:function(id){ try{ localStorage.setItem('mirai_campus', id); }catch(e){} },
  migrate:function(){
    try{
      if(localStorage.getItem(this._key)) return;
      var old=null;
      try{ old=JSON.parse(localStorage.getItem('mirai_setup_v1')); }catch(e){}
      if(old && old.sem && old.tt){ var a={}; a['hitech']=old; this._write(a); }
    }catch(e){}
  }
};
CampusDB.migrate();

/* Active campus: manager portal overrides via ?mcampus=xxx, otherwise the stored current campus. */
function resolveCampus(){
  try{
    var m=/[?&]mcampus=([a-z]+)/.exec(location.search||'');
    if(m && CAMPUSES.some(function(c){return c.id===m[1];})) return m[1];
  }catch(e){}
  return CampusDB.current();
}

/* ================= Semester Setup + Planning Engine (per-campus) ================= */
(function(){
  var M = window.Mirai || null;
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function nextDay(d){ var p=d.split('-'); var x=new Date(Date.UTC(+p[0],+p[1]-1,+p[2])+86400000); return x.toISOString().slice(0,10); }
  function dayNum(d){ var p=d.split('-'); return new Date(Date.UTC(+p[0],+p[1]-1,+p[2])).getUTCDay(); }
  function dateNum(d){ var p=d.split('-'); return new Date(Date.UTC(+p[0],+p[1]-1,+p[2])).getUTCDate(); }
  function durH(s,e){ var a=s.split(':'),b=e.split(':'); return (b[0]*60+ +b[1] - (a[0]*60+ +a[1]))/60; }
  function defaultSetup(campusName){
    return {
      sem:{name:'Odd Semester 2026-27', campus:campusName, start:'2026-08-03', end:'2026-12-18',
        sat:'2nd4th', cap:6, holidays:['2026-10-20','2026-11-08','2026-12-25'],
        events:[{d:'2026-10-12',label:'Tech fest'},{d:'2026-11-24',label:'Mid-Semester Examinations begin'}]},
      tt:[],
      exams:[
        {id:'ses1', name:'Sessional 1', date:'2026-09-15', scope:{}},
        {id:'midsem', name:'Mid-Semester Examinations', date:'2026-11-24', scope:{}},
        {id:'put', name:'Pre-University Test (PUT)', date:'2026-12-10', scope:{}},
        {id:'endsem', name:'End-Term Examinations', date:'2026-12-22', scope:{}}
      ],
      logs:[],
      students:(typeof REAL_STUDENTS!=='undefined'?REAL_STUDENTS.slice():[])
    };
  }
  var _active = resolveCampus();
  var S = null;
  function isWorking(d){
    if(!S) return false;
    var wd = dayNum(d);
    if(wd===0) return false;
    if(S.sem.holidays.indexOf(d)>=0) return false;
    if(wd===6){
      if(S.sem.sat==='none') return false;
      if(S.sem.sat==='2nd4th'){ var n=Math.ceil(dateNum(d)/7); if(n!==2&&n!==4) return false; }
    }
    return true;
  }
  function hrsFor(subId, d){
    if(!S) return 0;
    var wd = dayNum(d), h=0;
    S.tt.forEach(function(r){ if(r.sub===subId && r.day===wd) h+=durH(r.s,r.e); });
    return Math.min(h, S.sem.cap);
  }
  function cancelledOn(subId, d){
    if(!S) return false;
    return S.logs.some(function(l){ return l.sub===subId && l.date===d && l.status==='Cancelled'; });
  }
  function computeDates(){
    if(!S || !M || !M.subjects) return;
    M.subjects.forEach(function(s){
      var rem = s.topics.map(function(t){ return t.h; });
      var d = S.sem.start, ti = 0;
      var guard = 0;
      while(ti < s.topics.length && d <= S.sem.end && guard++ < 400){
        if(isWorking(d) && !cancelledOn(s.id, d)){
          var h = hrsFor(s.id, d);
          while(h > 0.001 && ti < s.topics.length){
            var take = Math.min(h, rem[ti]);
            rem[ti]-=take; h-=take;
            if(rem[ti] <= 0.001){ s.topics[ti].d = d; ti++; }
          }
        }
        d = nextDay(d);
      }
      while(ti < s.topics.length){ s.topics[ti].d = S.sem.end; ti++; }
    });
  }
  function bindCampus(id){
    _active = id;
    S = CampusDB.get(id);
    if(!S){ S = defaultSetup(campusById(id).name); CampusDB.save(id, S); }
    if(!S.students || !S.students.length || typeof S.students[0]==='string' || S.students.length<100){
      S.students=(typeof REAL_STUDENTS!=='undefined'?REAL_STUDENTS.slice():[]);
      CampusDB.save(id, S);
    }
    computeDates();
    if(window.MiraiSetup) window.MiraiSetup.state = S;
  }
  function save(){ if(S) CampusDB.save(_active, S); }
  function stuName(st){ return (st&&typeof st==='object')?st.n:String(st==null?'':st); }
  function stuSec(st){ return (st&&typeof st==='object')?(st.s||''):''; }
  window.MiraiSetup = {state:null, save:save, computeDates:computeDates, isWorking:isWorking,
    hrsFor:hrsFor, nextDay:nextDay, stuName:stuName, stuSec:stuSec,
    bindCampus:bindCampus, activeCampus:function(){ return _active; }};
  bindCampus(_active);
})();
