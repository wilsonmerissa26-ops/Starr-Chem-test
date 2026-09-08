(function(root,factory){
'use strict';
var Store=typeof module==='object'&&module.exports?require('./semester-store.js'):root.AStarryiaSemesterStore;
var api=factory(Store);
if(typeof module==='object'&&module.exports)module.exports=api;
else root.AStarryiaSemesterAdaptiveBridge=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(Store){
'use strict';if(!Store)throw new Error('Semester store missing');
function stateFor(session){
 if(!session)return'NOT_STARTED';
 if(session.mastered===true||session.phase==='complete'||session.skill&&session.skill.state==='MASTERED')return'MASTERED';
 if(session.repair&&session.repair.active)return'GAP';
 if(session.phase==='probe')return'DIAGNOSTIC';
 if(session.phase==='watch'||session.phase==='concept'||session.phase==='build')return'LEARNING';
 if(session.phase==='guided'||session.phase==='independent'||session.phase==='explain'||session.phase==='transfer'||session.phase==='activity')return'PRACTICING';
 if(session.phase==='retrieval-wait'||session.phase==='retrieval')return'PROVISIONAL';
 return'PRACTICING';
}
function href(config,session){var base=config.hrefBase||'';var id=session&&session.lessonId;return id?base+(base.indexOf('?')===-1?'?':'&')+'skill='+encodeURIComponent(id):base;}
function capture(storage,config,session,at){
 if(!session||!config||!config.moduleId)return null;
 var skillId=session.skill&&session.skill.id||config.moduleId+'.'+(session.lessonId||'unknown');
 var target=href(config,session),state=stateFor(session);
 var record=Store.recordSkillSnapshot(storage,{moduleId:config.moduleId,skillId:skillId,state:state,phase:session.phase||null,lastItemId:session.currentColdItemId||null,reviewDue:session.skill&&session.skill.reviewDue||null,href:target,title:config.title||null},at);
 if(state==='MASTERED')record=Store.markMastered(storage,{moduleId:config.moduleId,skillId:skillId,reviewDue:session.skill&&session.skill.reviewDue||null},at);
 return record;
}
function visit(storage,config,session,at){return Store.recordModuleVisit(storage,{moduleId:config.moduleId,href:href(config,session),title:config.title||null,skillId:session&&session.skill&&session.skill.id||null,phase:session&&session.phase||null},at);}
return Object.freeze({stateFor:stateFor,capture:capture,visit:visit});
});