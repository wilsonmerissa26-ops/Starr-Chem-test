(function(root,factory){
  var Base=typeof module==='object'&&module.exports?require('./test2-data.js'):root.Test2AdaptiveData;
  var api=factory(Base);
  if(typeof module==='object'&&module.exports)module.exports=api;else root.Test2AdaptiveData=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(Base){'use strict';
if(!Base)throw new Error('Base Test 2 curriculum missing');
function freezeField(id,label,accepted,errorCode){return Object.freeze({id:id,label:label,accepted:Object.freeze(accepted.slice()),errorCode:errorCode});}
function freezeQuestion(id,prompt,fields,tags){return Object.freeze({id:id,prompt:prompt,fields:Object.freeze(fields.slice()),tags:Object.freeze((tags||[]).slice())});}
var original=Base.lesson('resonance-mixed');
if(!original)throw new Error('Test 2 resonance-mixed lesson missing');
var repairChecks=Object.assign({},original.repairChecks,{
  RANK_EQUIVALENT:freezeQuestion('T2RM-RP9','Repair check: if two valid contributors are symmetry-equivalent, do they contribute equally to the resonance hybrid?',[freezeField('a','Answer',['yes','y'],'RANK_EQUIVALENT')])
});
var reteach=Object.assign({},original.reteach,{
  RANK_EQUIVALENT:'First confirm both contributors are valid. If they are related by symmetry and have the same stability, neither is preferred. They contribute equally to the resonance hybrid.'
});
var repaired=Object.freeze(Object.assign({},original,{repairChecks:Object.freeze(repairChecks),reteach:Object.freeze(reteach)}));
var lessons=Object.assign({},Base.LESSONS,{'resonance-mixed':repaired});
lessons=Object.freeze(lessons);
function lesson(id){return lessons[id]||null;}
function lessonIds(){return Base.lessonIds();}
function orderedLessons(){return lessonIds().map(lesson);}
return Object.freeze({META:Base.META,LESSONS:lessons,ORDER:Base.ORDER,PRODUCTION_CHECKPOINTS:Base.PRODUCTION_CHECKPOINTS,lesson:lesson,lessons:orderedLessons,lessonIds:lessonIds});
});