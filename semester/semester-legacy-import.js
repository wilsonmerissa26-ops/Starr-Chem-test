(function(root,factory){
'use strict';
var Store=typeof module==='object'&&module.exports?require('./semester-store.js'):root.AStarryiaSemesterStore;
var api=factory(Store);
if(typeof module==='object'&&module.exports)module.exports=api;
else root.AStarryiaSemesterLegacyImport=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(Store){
'use strict';if(!Store)throw new Error('Semester store missing');
function parse(raw){try{return raw?JSON.parse(raw):null;}catch(_){return null;}}
function keys(storage){var out=[];if(!storage)return out;try{for(var i=0;i<storage.length;i++){var k=storage.key(i);if(k)out.push(k);}}catch(_){ }return out;}
function hasAny(storage,list){return list.some(function(k){try{return storage.getItem(k)!=null;}catch(_){return false;}});}
function moduleObservedFromSessions(sessions){if(!sessions.length)return null;if(sessions.every(function(s){return s&&((s.mastered===true)||(s.phase==='complete'));}))return'MASTERED';if(sessions.some(function(s){return s&&(s.repair&&s.repair.active||s.phase==='retrieval-wait');}))return'NEEDS_REVIEW';return'IN_PROGRESS';}
function mapEngineState(session){if(!session)return'NOT_STARTED';if(session.mastered===true||session.phase==='complete'||session.skill&&session.skill.state==='MASTERED')return'MASTERED';if(session.repair&&session.repair.active)return'GAP';if(session.phase==='probe')return'DIAGNOSTIC';if(session.phase==='watch'||session.phase==='concept'||session.phase==='build')return'LEARNING';if(session.phase==='guided'||session.phase==='independent'||session.phase==='explain'||session.phase==='transfer')return'PRACTICING';if(session.phase==='retrieval-wait'||session.phase==='retrieval')return'PROVISIONAL';return'PRACTICING';}
function scan(storage){
 var report={foundation:false,test1:0,chapter5:0,importedSkills:0,errors:[]};
 var foundationKeys=['dr-merissa-day1-state-v1','dr-merissa-day1-ui-v5','astarryia-chemistry-mastery-v1','dr-merissa-math-evidence-v23','dr-merissa-day2-formal-charge-v1','dr-merissa-day3-resonance-v1','astarryia.day4.v1','astarryia.day5.v1','astarryia.day6.v1','astarryia.day7.v1','astarryia.day8.v1','astarryia.day9.v1'];
 if(hasAny(storage,foundationKeys)){
   report.foundation=true;
   try{Store.observeLegacy(storage,{sourceKey:'foundation-library-legacy-aggregate',moduleId:'u1-foundations',observedStatus:'IN_PROGRESS',note:'Observed pre-semester-store Day 1-9 progress. Canonical mastery remains in original lesson records.'});}catch(e){report.errors.push(String(e&&e.message||e));}
 }
 var all=keys(storage);
 var testKeys=all.filter(function(k){return /^chm221\.test1\..+\.v2$/.test(k);});
 var testSessions=testKeys.map(function(k){return parse(storage.getItem(k));}).filter(Boolean);report.test1=testSessions.length;
 if(testSessions.length){
   try{Store.observeLegacy(storage,{sourceKey:'test1-legacy-aggregate',moduleId:'u1-test1',observedStatus:moduleObservedFromSessions(testSessions),note:'Imported from locked Test 1 adaptive sessions.'});}catch(e){report.errors.push(String(e&&e.message||e));}
   testSessions.forEach(function(s){if(!s.skill||!s.skill.id)return;try{Store.recordSkillSnapshot(storage,{moduleId:'u1-test1',skillId:s.skill.id,state:mapEngineState(s),phase:s.phase,href:'../course-units/unit1/test1/?skill='+encodeURIComponent(s.lessonId||'')});report.importedSkills++;}catch(e){report.errors.push(String(e&&e.message||e));}});
 }
 var c5Keys=all.filter(function(k){return /^chm221\.unit2\.chapter5\..+\.v1$/.test(k);});
 var c5Sessions=c5Keys.map(function(k){return parse(storage.getItem(k));}).filter(Boolean);report.chapter5=c5Sessions.length;
 if(c5Sessions.length){
   try{Store.observeLegacy(storage,{sourceKey:'chapter5-legacy-aggregate',moduleId:'u2-ch5',observedStatus:moduleObservedFromSessions(c5Sessions),note:'Imported from Chapter 5 adaptive sessions.'});}catch(e){report.errors.push(String(e&&e.message||e));}
   c5Sessions.forEach(function(s){if(!s.skill||!s.skill.id)return;try{Store.recordSkillSnapshot(storage,{moduleId:'u2-ch5',skillId:s.skill.id,state:mapEngineState(s),phase:s.phase,href:'../course-units/unit2/chapter5/?skill='+encodeURIComponent(s.lessonId||'')});report.importedSkills++;}catch(e){report.errors.push(String(e&&e.message||e));}});
 }
 return report;
}
return Object.freeze({scan:scan,mapEngineState:mapEngineState,moduleObservedFromSessions:moduleObservedFromSessions});
});