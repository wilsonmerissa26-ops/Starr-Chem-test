(function(root,factory){
'use strict';
var manifest=typeof module==='object'&&module.exports?require('./semester-manifest.js'):root.AStarryiaSemesterManifest;
var api=factory(manifest);
if(typeof module==='object'&&module.exports)module.exports=api;
else root.AStarryiaSemesterStore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(Manifest){
'use strict';
if(!Manifest)throw new Error('Semester manifest missing');
var KEY='astarryia.semester.chm221.f26.v1';
var BACKUP_KEY='astarryia.semester.chm221.f26.v1.backup';
var PROBE_KEY='astarryia.semester.storage.probe';
var VERSION=1;
var STATES=Object.freeze(['NOT_STARTED','DIAGNOSTIC','GAP','LEARNING','PRACTICING','PROVISIONAL','MASTERED','EXTENDED','NEEDS_REVIEW']);
function nowIso(at){return new Date(at==null?Date.now():at).toISOString();}
function dateKey(at){var d=new Date(at==null?Date.now():at);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function clone(x){return JSON.parse(JSON.stringify(x));}
function safeParse(raw){if(!raw)return null;try{return JSON.parse(raw);}catch(_){return null;}}
function validState(v){return STATES.indexOf(v)!==-1;}
function fresh(at){var t=nowIso(at);return{
  version:VERSION,
  student:{id:Manifest.COURSE.studentId,name:Manifest.COURSE.studentName},
  course:{id:Manifest.COURSE.id,title:Manifest.COURSE.title,term:Manifest.COURSE.term},
  createdAt:t,updatedAt:t,
  resume:null,
  modules:{},skills:{},
  evidence:[],exposures:{},reviewQueue:[],history:[],
  streak:{current:0,longest:0,lastStudyDate:null,totalStudyDays:0},
  legacy:{imports:{},lastScanAt:null},
  storage:{mode:'UNKNOWN',lastVerifiedAt:null,lastSaveOk:null}
};}
function validate(r){
  if(!r||typeof r!=='object'||r.version!==VERSION)return false;
  if(!r.student||r.student.id!==Manifest.COURSE.studentId)return false;
  if(!r.course||r.course.id!==Manifest.COURSE.id)return false;
  if(!r.modules||typeof r.modules!=='object'||Array.isArray(r.modules))return false;
  if(!r.skills||typeof r.skills!=='object'||Array.isArray(r.skills))return false;
  if(!Array.isArray(r.evidence)||!Array.isArray(r.reviewQueue)||!Array.isArray(r.history))return false;
  if(!r.exposures||typeof r.exposures!=='object'||Array.isArray(r.exposures))return false;
  return true;
}
function health(storage){
  if(!storage||typeof storage.setItem!=='function'||typeof storage.getItem!=='function')return{ok:false,reason:'storage_unavailable'};
  var token='probe-'+Date.now()+'-'+Math.random();
  try{storage.setItem(PROBE_KEY,token);var ok=storage.getItem(PROBE_KEY)===token;storage.removeItem(PROBE_KEY);return{ok:ok,reason:ok?null:'probe_mismatch'};}catch(e){return{ok:false,reason:String(e&&e.message||e)};}
}
function load(storage){
  var raw=null;try{raw=storage&&storage.getItem?storage.getItem(KEY):null;}catch(_){return fresh();}
  var parsed=safeParse(raw);
  if(validState(parsed))return parsed;
  return fresh();
}
function loadWithStatus(storage){
  var raw=null;try{raw=storage&&storage.getItem?storage.getItem(KEY):null;}catch(e){return{record:fresh(),found:false,valid:false,error:String(e&&e.message||e)};}
  if(!raw)return{record:fresh(),found:false,valid:true,error:null};
  var parsed=safeParse(raw);if(validState(parsed))return{record:parsed,found:true,valid:true,error:null};
  return{record:fresh(),found:true,valid:false,error:'saved_record_invalid'};
}
function save(storage,record){
  if(!validate(record))throw new Error('REFUSE_INVALID_SEMESTER_RECORD');
  var h=health(storage);if(!h.ok)throw new Error('PERSISTENCE_HEALTH_FAILED: '+h.reason);
  var next=clone(record);next.updatedAt=nowIso();next.storage=next.storage||{};next.storage.lastSaveOk=true;next.storage.lastVerifiedAt=next.updatedAt;
  var nextRaw=JSON.stringify(next),oldRaw=null;
  try{
    oldRaw=storage.getItem(KEY);
    if(oldRaw)storage.setItem(BACKUP_KEY,oldRaw);
    storage.setItem(KEY,nextRaw);
    if(storage.getItem(KEY)!==nextRaw)throw new Error('round_trip_mismatch');
    return next;
  }catch(e){
    try{if(oldRaw!=null)storage.setItem(KEY,oldRaw);}catch(_){ }
    throw new Error('PERSISTENCE_WRITE_FAILED: '+String(e&&e.message||e));
  }
}
function transaction(storage,mutator){var current=loadWithStatus(storage);if(current.found&&!current.valid)throw new Error('REFUSE_TO_OVERWRITE_INVALID_SAVED_RECORD');var next=clone(current.record);var out=mutator(next)||next;return save(storage,out);}
function pushHistory(r,type,payload,at){r.history.push({id:'h'+(r.history.length+1),type:type,payload:payload||null,at:nowIso(at)});}
function touchStreak(r,at){var today=dateKey(at),last=r.streak.lastStudyDate;if(last===today)return;var d=new Date(today+'T12:00:00'),prev=new Date(d);prev.setDate(prev.getDate()-1);var prevKey=dateKey(prev);r.streak.current=last===prevKey?(r.streak.current||0)+1:1;r.streak.longest=Math.max(r.streak.longest||0,r.streak.current);r.streak.totalStudyDays=(r.streak.totalStudyDays||0)+1;r.streak.lastStudyDate=today;}
function ensureModule(r,moduleId,at){var m=Manifest.moduleById(moduleId);if(!m)throw new Error('UNKNOWN_SEMESTER_MODULE: '+moduleId);if(!r.modules[moduleId])r.modules[moduleId]={id:moduleId,unitId:m.unitId,title:m.title,status:'NOT_STARTED',startedAt:null,updatedAt:null,completedAt:null,lastHref:m.href||null,observedLegacyStatus:null};if(!r.modules[moduleId].startedAt)r.modules[moduleId].startedAt=nowIso(at);r.modules[moduleId].updatedAt=nowIso(at);return r.modules[moduleId];}
function ensureSkill(r,skillId,moduleId,at){var meta=Manifest.skillById(skillId);var mid=moduleId||(meta&&meta.moduleId);if(!mid)throw new Error('UNKNOWN_SEMESTER_SKILL: '+skillId);if(!r.skills[skillId])r.skills[skillId]={id:skillId,moduleId:mid,title:meta&&meta.title||skillId,state:'NOT_STARTED',phase:null,evidenceCount:0,lastItemId:null,reviewDue:null,assistanceCount:0,startedAt:null,updatedAt:null,masteredAt:null};if(!r.skills[skillId].startedAt)r.skills[skillId].startedAt=nowIso(at);r.skills[skillId].updatedAt=nowIso(at);return r.skills[skillId];}
function setResume(r,data,at){r.resume={href:data.href,title:data.title||null,moduleId:data.moduleId||null,skillId:data.skillId||null,phase:data.phase||null,updatedAt:nowIso(at)};}
function recordModuleVisit(storage,data,at){return transaction(storage,function(r){var m=ensureModule(r,data.moduleId,at);if(m.status==='NOT_STARTED')m.status='IN_PROGRESS';if(data.href)m.lastHref=data.href;setResume(r,{href:data.href||m.lastHref,title:data.title||m.title,moduleId:data.moduleId,skillId:data.skillId||null,phase:data.phase||null},at);touchStreak(r,at);pushHistory(r,'MODULE_VISIT',{moduleId:data.moduleId,href:data.href||null},at);return r;});}
function recordSkillSnapshot(storage,data,at){return transaction(storage,function(r){ensureModule(r,data.moduleId,at);var s=ensureSkill(r,data.skillId,data.moduleId,at);if(data.state&&validState(data.state))s.state=data.state;if(data.phase!=null)s.phase=data.phase;if(data.reviewDue!==undefined)s.reviewDue=data.reviewDue;if(data.lastItemId!==undefined)s.lastItemId=data.lastItemId;if(data.href)setResume(r,{href:data.href,title:data.title||s.title,moduleId:data.moduleId,skillId:data.skillId,phase:data.phase||s.phase},at);var m=r.modules[data.moduleId];if(s.state==='NEEDS_REVIEW')m.status='NEEDS_REVIEW';else if(m.status==='NOT_STARTED')m.status='IN_PROGRESS';touchStreak(r,at);pushHistory(r,'SKILL_SNAPSHOT',{moduleId:data.moduleId,skillId:data.skillId,state:s.state,phase:s.phase},at);return r;});}
function recordEvidence(storage,data,at){return transaction(storage,function(r){ensureModule(r,data.moduleId,at);var s=ensureSkill(r,data.skillId,data.moduleId,at);var ev={id:'e'+(r.evidence.length+1),moduleId:data.moduleId,skillId:data.skillId,itemId:data.itemId||null,evidenceClass:data.evidenceClass||'UNKNOWN',correct:data.correct===true,assistance:data.assistance||'none',cold:data.cold===true,validForMastery:data.validForMastery===true,source:data.source||'lesson',at:nowIso(at)};r.evidence.push(ev);s.evidenceCount=(s.evidenceCount||0)+1;if(ev.itemId)s.lastItemId=ev.itemId;if(ev.assistance!=='none')s.assistanceCount=(s.assistanceCount||0)+1;touchStreak(r,at);pushHistory(r,'EVIDENCE_RECORDED',{evidenceId:ev.id,skillId:data.skillId,itemId:ev.itemId,validForMastery:ev.validForMastery},at);return r;});}
function recordExposure(storage,data,at){return transaction(storage,function(r){var id=data.itemId;if(!id)throw new Error('ITEM_ID_REQUIRED');var x=r.exposures[id]||{itemId:id,moduleId:data.moduleId||null,skillId:data.skillId||null,count:0,assistanceCount:0,firstSeenAt:null,lastSeenAt:null};x.count++;if(data.assistanceUsed)x.assistanceCount++;if(!x.firstSeenAt)x.firstSeenAt=nowIso(at);x.lastSeenAt=nowIso(at);r.exposures[id]=x;pushHistory(r,'ITEM_EXPOSURE',{itemId:id,skillId:data.skillId||null,assistanceUsed:!!data.assistanceUsed},at);return r;});}
function markMastered(storage,data,at){return transaction(storage,function(r){var s=ensureSkill(r,data.skillId,data.moduleId,at);s.state='MASTERED';s.masteredAt=nowIso(at);s.reviewDue=data.reviewDue||null;var m=ensureModule(r,data.moduleId,at);var manifestModule=Manifest.moduleById(data.moduleId);var all=(manifestModule.skills||[]).length>0&&(manifestModule.skills||[]).every(function(meta){return r.skills[meta.id]&&r.skills[meta.id].state==='MASTERED';});m.status=all?'MASTERED':'IN_PROGRESS';if(all)m.completedAt=nowIso(at);pushHistory(r,'MASTERY_CONFIRMED',{moduleId:data.moduleId,skillId:data.skillId},at);return r;});}
function queueReview(storage,data,at){return transaction(storage,function(r){var due=data.due||nowIso(at),id=data.skillId;var s=ensureSkill(r,id,data.moduleId,at);s.state='NEEDS_REVIEW';s.reviewDue=due;if(!r.reviewQueue.some(function(q){return q.skillId===id;}))r.reviewQueue.push({moduleId:data.moduleId,skillId:id,due:due,reason:data.reason||'scheduled_review'});ensureModule(r,data.moduleId,at).status='NEEDS_REVIEW';pushHistory(r,'REVIEW_QUEUED',{moduleId:data.moduleId,skillId:id,due:due,reason:data.reason||null},at);return r;});}
function completeReview(storage,data,at){return transaction(storage,function(r){r.reviewQueue=r.reviewQueue.filter(function(q){return q.skillId!==data.skillId;});var s=ensureSkill(r,data.skillId,data.moduleId,at);if(s.state==='NEEDS_REVIEW')s.state=data.nextState&&validState(data.nextState)?data.nextState:'PROVISIONAL';s.reviewDue=data.nextDue||null;pushHistory(r,'REVIEW_COMPLETED',{moduleId:data.moduleId,skillId:data.skillId,nextState:s.state},at);return r;});}
function observeLegacy(storage,data,at){return transaction(storage,function(r){var k=data.sourceKey;if(!k)throw new Error('LEGACY_SOURCE_KEY_REQUIRED');r.legacy.imports[k]={sourceKey:k,moduleId:data.moduleId||null,observedStatus:data.observedStatus||null,observedAt:nowIso(at),note:data.note||null};r.legacy.lastScanAt=nowIso(at);if(data.moduleId){var m=ensureModule(r,data.moduleId,at);m.observedLegacyStatus=data.observedStatus||m.observedLegacyStatus;if(m.status==='NOT_STARTED'&&data.observedStatus)m.status=data.observedStatus==='OPEN'?'PROVISIONAL':'IN_PROGRESS';}pushHistory(r,'LEGACY_OBSERVED',{sourceKey:k,moduleId:data.moduleId||null,observedStatus:data.observedStatus||null},at);return r;});}
function setStorageMode(storage,mode,at){return transaction(storage,function(r){r.storage.mode=mode;r.storage.lastVerifiedAt=nowIso(at);pushHistory(r,'STORAGE_MODE',{mode:mode},at);return r;});}
async function requestDurability(navigatorRef,storage){var mode='BEST_EFFORT';try{var s=navigatorRef&&navigatorRef.storage;if(s&&typeof s.persisted==='function'&&await s.persisted())mode='PERSISTENT';else if(s&&typeof s.persist==='function'&&await s.persist())mode='PERSISTENT';}catch(_){mode='BEST_EFFORT';}try{setStorageMode(storage,mode);}catch(_){ }return mode;}
function exportRecord(storage){var r=loadWithStatus(storage);if(r.found&&!r.valid)throw new Error('CANNOT_EXPORT_INVALID_RECORD');return JSON.stringify(r.record,null,2);}
function importRecord(storage,text){var incoming=safeParse(text);if(!validate(incoming))throw new Error('INVALID_IMPORT_RECORD');var current=loadWithStatus(storage);if(current.found&&!current.valid)throw new Error('REFUSE_IMPORT_OVER_INVALID_UNRECOVERED_RECORD');if(current.found)try{storage.setItem(BACKUP_KEY,JSON.stringify(current.record));}catch(_){ }return save(storage,incoming);}
function restoreBackup(storage){var b=safeParse(storage&&storage.getItem?storage.getItem(BACKUP_KEY):null);if(!validate(b))throw new Error('NO_VALID_BACKUP');return save(storage,b);}
return Object.freeze({KEY:KEY,BACKUP_KEY:BACKUP_KEY,PROBE_KEY:PROBE_KEY,VERSION:VERSION,STATES:STATES,fresh:fresh,validate:validate,health:health,load:load,loadWithStatus:loadWithStatus,save:save,transaction:transaction,recordModuleVisit:recordModuleVisit,recordSkillSnapshot:recordSkillSnapshot,recordEvidence:recordEvidence,recordExposure:recordExposure,markMastered:markMastered,queueReview:queueReview,completeReview:completeReview,observeLegacy:observeLegacy,setStorageMode:setStorageMode,requestDurability:requestDurability,exportRecord:exportRecord,importRecord:importRecord,restoreBackup:restoreBackup});
});