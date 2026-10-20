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

/* Batches (sections). Alpha = roster Sec A, Beta = roster Sec B.
   Morning Mirai-track slots alternate DSA/Web-Dev order between the two. */
var BATCHES = [
  {id:'alpha', name:'Section Alpha', sec:'A'},
  {id:'beta',  name:'Section Beta',  sec:'B'}
];
function batchById(id){ return BATCHES.filter(function(b){return b.id===id;})[0]||BATCHES[0]; }

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
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function nextDay(d){ var p=d.split('-'); var x=new Date(Date.UTC(+p[0],+p[1]-1,+p[2])+86400000); return x.toISOString().slice(0,10); }
  function dayNum(d){ var p=d.split('-'); return new Date(Date.UTC(+p[0],+p[1]-1,+p[2])).getUTCDay(); }
  function dateNum(d){ var p=d.split('-'); return new Date(Date.UTC(+p[0],+p[1]-1,+p[2])).getUTCDate(); }
  function durH(s,e){ var a=s.split(':'),b=e.split(':'); return (b[0]*60+ +b[1] - (a[0]*60+ +a[1]))/60; }
  function realToday(){ var d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
  function defaultTT(){
    var T=[];
    function row(batch,day,sub,fac,s,e){ T.push({day:day,sub:sub,fac:fac,s:s,e:e,batch:batch}); }
    var VISHAL='Vishal Rathee', VARUN='Varun Kumar Sharma', GAURAV='Gaurav Singh',
        AMAN='Aman Srivastava', HIMANSHU='Dr. Himanshu Kumar', ZAKIR='Zakir Husain',
        SUMAN='Suman Rajput', SONIYA='Soniya Tyagi';
    var mAlpha={1:['dsa','web'],2:['web','dsa'],3:['dsa','web'],4:['web','dsa'],5:['dsa','web'],6:['web','dsa']};
    var mBeta ={1:['web','dsa'],2:['dsa','web'],3:['web','dsa'],4:['dsa','web'],5:['web','dsa'],6:['dsa','web']};
    function morning(batch, map){
      for(var d=1; d<=6; d++){
        var p=map[d];
        p.forEach(function(sub, i){
          var fac = sub==='dsa'?VISHAL:VARUN;
          if(i===0) row(batch,d,sub,fac,'09:15','10:45');
          else row(batch,d,sub,fac,'11:00','12:30');
        });
      }
    }
    morning('alpha', mAlpha); morning('beta', mBeta);
    var aft=[
      [1,'maths1',GAURAV,'13:20','14:20'],[1,'egd',ZAKIR,'14:25','15:25'],[1,'egd',ZAKIR,'15:30','16:30'],
      [2,'bee',AMAN,'13:20','14:20'],[2,'phy',HIMANSHU,'14:25','15:25'],[2,'phy',HIMANSHU,'15:30','16:30'],
      [3,'prompt',VARUN,'13:20','14:20'],[3,'langlab',SONIYA,'14:25','15:25'],[3,'phylab',SUMAN,'15:30','16:30'],
      [4,'bee',AMAN,'13:20','14:20'],[4,'maths1',GAURAV,'14:25','15:25'],[4,'iks',GAURAV,'15:30','16:30'],
      [5,'pps',VISHAL,'13:20','14:20'],[5,'bee',AMAN,'14:25','15:25'],[5,'maths1',GAURAV,'15:30','16:30']
    ];
    aft.forEach(function(a){ row('alpha',a[0],a[1],a[2],a[3],a[4]); row('beta',a[0],a[1],a[2],a[3],a[4]); });
    return T;
  }
  function defaultSetup(campusName){
    return {
      sem:{name:'Odd Semester 2026-27', campus:campusName, start:'2026-08-03', end:'2026-12-18',
        sat:'1st3rd', cap:6, holidays:['2026-10-20','2026-11-08','2026-12-25'],
        events:[{d:'2026-10-12',label:'Tech fest'},{d:'2026-11-24',label:'Mid-Semester Examinations begin'}]},
      tt:defaultTT(), ttVersion:2,
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
      if(S.sem.sat==='1st3rd'){ var m=Math.ceil(dateNum(d)/7); if(m!==1&&m!==3) return false; }
    }
    return true;
  }
  function ttRows(batch){
    if(!S || !S.tt) return [];
    var b = batch || 'alpha';
    return S.tt.filter(function(r){ return (r.batch||'alpha')===b; });
  }
  function hrsFor(subId, d, batch){
    if(!S) return 0;
    var wd = dayNum(d), h=0;
    ttRows(batch).forEach(function(r){ if(r.sub===subId && r.day===wd) h+=durH(r.s,r.e); });
    return Math.min(h, S.sem.cap);
  }
  function cancelledOn(subId, d){
    if(!S) return false;
    return S.logs.some(function(l){ return l.sub===subId && l.date===d && l.status==='Cancelled'; });
  }
  function computeDates(){
    var M = window.Mirai || null;
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
  /* Spec §3 metrics — computed live, never hardcoded.
     - Hours in scope: Σ planned hours of non-skipped topics.
     - Covered hours: Σ planned hours × % complete (completed count fully).
     - Coverage %: covered ÷ in scope.
     - Available hours: timetable hours on working days from today to the
       subject's target finish date (latest planned topic date).
     - Buffer ratio: available ÷ remaining. ≥1.15 ON TRACK, 1.00–1.15 TIGHT, <1.00 DANGER.
     - Pace vs plan: covered − hours that should have been covered by today
       (topics with planned date ≤ today). Negative = behind. */
  function computeMetrics(subjects){
    if(!S || !subjects) return;
    var today = realToday();
    subjects.forEach(function(s){
      var inScope = (s.topics||[]).filter(function(t){ return !t.skipped; });
      var scopeH = inScope.reduce(function(a,t){ return a+(+t.h||0); },0);
      var coveredH = inScope.reduce(function(a,t){ return a+(+t.h||0)*(+t.pct||0)/100; },0);
      var remainH = Math.max(0, scopeH - coveredH);
      var target = S.sem.end;
      inScope.forEach(function(t){ if(t.d && t.d > target) target = t.d; });
      var availH = 0, d = today, guard = 0;
      while(d <= target && guard++ < 600){
        if(isWorking(d)) availH += hrsFor(s.id, d);
        d = nextDay(d);
      }
      s.buffer = remainH > 0.001 ? availH / remainH : 9.99;
      var shouldH = inScope.filter(function(t){ return t.d && t.d <= today; })
        .reduce(function(a,t){ return a+(+t.h||0); },0);
      s.pace = coveredH - shouldH;
      s._availH = availH; s._remainH = remainH; s._shouldH = shouldH; s._targetFinish = target;
    });
  }
  function bindCampus(id){
    _active = id;
    S = CampusDB.get(id);
    if(!S){ S = defaultSetup(campusById(id).name); CampusDB.save(id, S); }
    if(S.ttVersion!==2){ S.tt = defaultTT(); S.sem.sat='1st3rd'; S.ttVersion = 2; }
    var dirty=false;
    (S.tt||[]).forEach(function(r){ if(!r.batch){ r.batch='alpha'; dirty=true; } });
    if(!S.students || !S.students.length || typeof S.students[0]==='string' || S.students.length<100){
      S.students=(typeof REAL_STUDENTS!=='undefined'?REAL_STUDENTS.slice():[]);
      dirty=true;
    }
    if(dirty) CampusDB.save(id, S);
    computeDates();
    if(window.MiraiSetup) window.MiraiSetup.state = S;
  }
  function save(){ if(S) CampusDB.save(_active, S); }
  function stuName(st){ return (st&&typeof st==='object')?st.n:String(st==null?'':st); }
  function stuSec(st){ return (st&&typeof st==='object')?(st.s||''):''; }
  window.MiraiSetup = {state:null, save:save, computeDates:computeDates, isWorking:isWorking,
    hrsFor:hrsFor, nextDay:nextDay, stuName:stuName, stuSec:stuSec, ttRows:ttRows,
    defaultTT:defaultTT, batches:BATCHES, batchById:batchById, computeMetrics:computeMetrics,
    bindCampus:bindCampus, activeCampus:function(){ return _active; }};
  bindCampus(_active);
})();
