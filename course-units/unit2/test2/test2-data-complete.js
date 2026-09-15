(function(root,factory){
  var Base=typeof module==='object'&&module.exports?require('./test2-data.js'):root.Test2AdaptiveData;
  var api=factory(Base);
  if(typeof module==='object'&&module.exports)module.exports=api;else root.Test2AdaptiveData=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(Base){'use strict';
if(!Base)throw new Error('Base Test 2 curriculum missing');
function freezeField(id,label,accepted,errorCode){return Object.freeze({id:id,label:label,accepted:Object.freeze(accepted.slice()),errorCode:errorCode});}
function freezeQuestion(id,prompt,fields,tags){return Object.freeze({id:id,prompt:prompt,fields:Object.freeze(fields.slice()),tags:Object.freeze((tags||[]).slice())});}
function patchedLesson(id,changes){var original=Base.lesson(id);if(!original)throw new Error('Test 2 lesson missing: '+id);return Object.freeze(Object.assign({},original,changes||{}));}
var lessons=Object.assign({},Base.LESSONS);

/* Keep Later Retrieval cold across the mixed tutor. Intervening chemistry from one
   family must not hand the learner the exact answer another family later retrieves. */
var stereo=Base.lesson('stereo-relationships');
lessons['stereo-relationships']=patchedLesson('stereo-relationships',{
  retrieval:Object.freeze([
    stereo.retrieval[0],
    freezeQuestion('T2SR-R2','Later: same connectivity, three stereocenters, and only one center changes configuration. Relationship?',[freezeField('a','Class',['diastereomers','diastereomer'],'STEREO_RELATION')])
  ])
});

var config=Base.lesson('configuration-mixed');
lessons['configuration-mixed']=patchedLesson('configuration-mixed',{
  retrieval:Object.freeze([
    config.retrieval[0],
    freezeQuestion('T2CF-R2','Later: a qualifying alkene has the higher-priority substituent on each carbon drawn on the same side of the double bond. E or Z?',[freezeField('a','Configuration',['z','Z'],'EZ_PRIORITY')])
  ])
});

var original=Base.lesson('resonance-mixed');
var repairChecks=Object.assign({},original.repairChecks,{
  RANK_EQUIVALENT:freezeQuestion('T2RM-RP9','Repair check: if two valid contributors are symmetry-equivalent, do they contribute equally to the resonance hybrid?',[freezeField('a','Answer',['yes','y'],'RANK_EQUIVALENT')])
});
var reteach=Object.assign({},original.reteach,{
  RANK_EQUIVALENT:'First confirm both contributors are valid. If they are related by symmetry and have the same stability, neither is preferred. They contribute equally to the resonance hybrid.'
});
lessons['resonance-mixed']=patchedLesson('resonance-mixed',{
  repairChecks:Object.freeze(repairChecks),
  reteach:Object.freeze(reteach),
  retrieval:Object.freeze([
    original.retrieval[0],
    freezeQuestion('T2RM-R2','Later: can delocalized pi electron density give related bonds partial multiple-bond character?',[freezeField('a','Answer',['yes','y'],'HYBRID_PARTIAL_BOND')])
  ])
});

var proton=Base.lesson('proton-pka');
lessons['proton-pka']=patchedLesson('proton-pka',{
  retrieval:Object.freeze([
    proton.retrieval[0],
    freezeQuestion('T2PP-R2','Later: a larger Ka corresponds to a larger or smaller pKa?',[freezeField('a','pKa',['smaller','lower'],'PKA_KA')])
  ])
});

lessons=Object.freeze(lessons);
function lesson(id){return lessons[id]||null;}
function lessonIds(){return Base.lessonIds();}
function orderedLessons(){return lessonIds().map(lesson);}
return Object.freeze({META:Base.META,LESSONS:lessons,ORDER:Base.ORDER,PRODUCTION_CHECKPOINTS:Base.PRODUCTION_CHECKPOINTS,lesson:lesson,lessons:orderedLessons,lessonIds:lessonIds});
});