(function(root){
'use strict';
var M=root.AStarryiaSemesterManifest,S=root.AStarryiaSemesterStore,L=root.AStarryiaSemesterLegacyImport;if(!M||!S)return;
var doc=root.document;
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function statusForModule(r,m){var x=r.modules[m.id];if(x&&x.status)return x.status;if(m.buildStatus==='live'||m.buildStatus==='preview')return'NOT_STARTED';return'PLANNED';}
function unitStats(r,u){var skills=[];u.modules.forEach(function(m){m.skills.forEach(function(s){skills.push(s);});});var mastered=skills.filter(function(s){return r.skills[s.id]&&r.skills[s.id].state==='MASTERED';}).length;return{mastered:mastered,total:skills.length};}
function currentWeek(){var today=new Date(),stamp=today.getTime(),found=M.WEEKS[0];M.WEEKS.forEach(function(w){var d=new Date(w.start+'T00:00:00');if(d.getTime()<=stamp)found=w;});return found;}
function prettyDate(iso){if(!iso)return'';var d=new Date(iso.length===10?iso+'T12:00:00':iso);return d.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});}
function render(){
 var r=S.load(root.localStorage),week=currentWeek();
 var resume=doc.querySelector('[data-resume]');
 if(r.resume&&r.resume.href){resume.innerHTML='<div class="eyebrow">Continue where you left off</div><h2>'+esc(r.resume.title||'Continue studying')+'</h2><p>'+esc(r.resume.skillId||'')+(r.resume.phase?' · '+esc(r.resume.phase):'')+'</p><a class="primary" href="'+esc(r.resume.href)+'">Resume</a>';}else{resume.innerHTML='<div class="eyebrow">Start here</div><h2>Chapter 5 is the current course block.</h2><p>Your semester record will remember the exact skill and phase after you begin.</p><a class="primary" href="../course-units/unit2/chapter5/">Open Chapter 5</a>';}
 doc.querySelector('[data-current-focus]').textContent=week.focus;
 doc.querySelector('[data-current-lab]').textContent=week.lab;
 doc.querySelector('[data-streak]').textContent=(r.streak.current||0)+' day'+((r.streak.current||0)===1?'':'s');
 doc.querySelector('[data-longest]').textContent=(r.streak.longest||0)+' day'+((r.streak.longest||0)===1?'':'s');
 doc.querySelector('[data-saved]').textContent=prettyDate(r.updatedAt);
 doc.querySelector('[data-storage-mode]').textContent=r.storage&&r.storage.mode||'UNKNOWN';
 var total=M.modules().reduce(function(n,m){return n+m.skills.length;},0),mastered=Object.keys(r.skills).filter(function(id){return r.skills[id]&&r.skills[id].state==='MASTERED'&&M.skillById(id);}).length;
 doc.querySelector('[data-mastered]').textContent=mastered+' / '+total;
 doc.querySelector('[data-units]').innerHTML=M.UNITS.map(function(u){var st=unitStats(r,u),pct=st.total?Math.round(st.mastered/st.total*100):0;return'<article class="unit-card"><div class="unit-top"><div><div class="eyebrow">'+esc(u.id.toUpperCase())+'</div><h3>'+esc(u.title)+'</h3></div><span class="test-date">Test: '+esc(prettyDate(u.testDate))+'</span></div><div class="meter"><span style="width:'+pct+'%"></span></div><p class="muted">'+st.mastered+' of '+st.total+' mapped skills mastered</p><div class="module-list">'+u.modules.map(function(m){var s=statusForModule(r,m),action=(m.href&&(m.buildStatus==='live'||m.buildStatus==='preview'))?'<a href="'+esc(m.href)+'">Open</a>':'<span>Build queued</span>';return'<div class="module-row"><div><b>'+esc(m.title)+'</b><small>'+esc(m.chapter||'')+'</small></div><div class="module-actions"><span class="badge '+s.toLowerCase().replace(/_/g,'-')+'">'+esc(s.replace(/_/g,' '))+'</span>'+action+'</div></div>';}).join('')+'</div></article>';}).join('');
 var due=(r.reviewQueue||[]).slice().sort(function(a,b){return String(a.due).localeCompare(String(b.due));});doc.querySelector('[data-review]').innerHTML=due.length?due.map(function(q){var sm=M.skillById(q.skillId);return'<li><b>'+esc(sm&&sm.title||q.skillId)+'</b><span>'+esc(q.reason||'Review')+' · '+esc(prettyDate(q.due))+'</span></li>';}).join(''):'<li class="empty">No semester-level reviews are queued yet.</li>';
}
function exportData(){var text=S.exportRecord(root.localStorage),blob=new Blob([text],{type:'application/json'}),a=doc.createElement('a');a.href=URL.createObjectURL(blob);a.download='AStarryia-CHM221-progress-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(function(){URL.revokeObjectURL(a.href);},1000);}
function importData(file){var reader=new FileReader();reader.onload=function(){try{S.importRecord(root.localStorage,String(reader.result));render();root.alert('Progress restored.');}catch(e){root.alert('Could not restore this file: '+String(e&&e.message||e));}};reader.readAsText(file);}
async function boot(){
 try{if(L)L.scan(root.localStorage);}catch(_){ }
 var mode=await S.requestDurability(root.navigator,root.localStorage);doc.documentElement.setAttribute('data-storage-mode',mode);render();
 doc.querySelector('[data-export]').addEventListener('click',exportData);
 var input=doc.querySelector('[data-import]');input.addEventListener('change',function(){if(input.files&&input.files[0])importData(input.files[0]);input.value='';});
 doc.querySelector('[data-backup]').addEventListener('click',function(){if(!root.confirm('Restore the previous saved semester record?'))return;try{S.restoreBackup(root.localStorage);render();}catch(e){root.alert('No valid previous backup was available.');}});
}
if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',boot);else boot();
})(typeof globalThis!=='undefined'?globalThis:this);
