/* Pure learner progression engine for Classroom V2. */
(function(root){
'use strict';
const STAGES=['teach','watch','together','guided','alone','fresh','complete'];
const TARGET_ORDER=['logs','algebra','exponents','sci','fractions','units'];
function freshState(){return {
 screen:'home',
 targeted:{skill:'logs',stage:'teach',watchStep:0,togetherPassed:false,guidedIndex:0,guidedCorrect:0,aloneIndex:0,aloneCorrect:0,freshIndex:0,freshCorrect:0,status:{},seen:[],idkCount:0},
 foundation:{lesson:0,stage:'teach',watchStep:0,practiceIndex:0,seen:[]},
 chem:{stage:'teach',teachStep:0,watchStep:0,togetherStep:0,guidedIndex:0,mastery:false,unresolved:[],seen:[]},
 last:null
};}
function clone(x){return JSON.parse(JSON.stringify(x));}
function safeState(saved){const base=freshState();if(!saved||typeof saved!=='object')return base;const s=Object.assign(base,saved);s.targeted=Object.assign(base.targeted,saved.targeted||{});s.foundation=Object.assign(base.foundation,saved.foundation||{});s.chem=Object.assign(base.chem,saved.chem||{});if(!['home','targeted','foundation','chem'].includes(s.screen))s.screen='home';if(!TARGET_ORDER.includes(s.targeted.skill))s.targeted.skill='logs';if(!STAGES.includes(s.targeted.stage))s.targeted.stage='teach';if(!STAGES.includes(s.foundation.stage))s.foundation.stage='teach';if(!STAGES.includes(s.chem.stage))s.chem.stage='teach';s.targeted.seen=Array.isArray(s.targeted.seen)?s.targeted.seen.slice(-100):[];s.foundation.seen=Array.isArray(s.foundation.seen)?s.foundation.seen.slice(-100):[];s.chem.seen=Array.isArray(s.chem.seen)?s.chem.seen.slice(-100):[];s.chem.unresolved=Array.isArray(s.chem.unresolved)?s.chem.unresolved.slice(-20):[];return s;}
function openLane(s,lane){if(!['targeted','foundation','chem'].includes(lane))throw new Error('Unknown lane');s.last=s.screen;s.screen=lane;return s;}
function goHome(s){s.last=s.screen;s.screen='home';return s;}
function stageIndex(stage){return STAGES.indexOf(stage);}
function advanceStage(s,lane){const obj=s[lane];const i=stageIndex(obj.stage);if(i<0||i>=STAGES.length-1)return s;obj.stage=STAGES[i+1];if(obj.stage==='watch')obj.watchStep=0;return s;}
function recordSeen(s,lane,id){if(!id)return;s[lane].seen=s[lane].seen||[];if(!s[lane].seen.includes(id))s[lane].seen.push(id);s[lane].seen=s[lane].seen.slice(-100);}
function canUseFresh(s,lane,id){return !(s[lane].seen||[]).includes(id);}
function skipActivity(s,lane,label){if(lane==='chem'){s.chem.unresolved.push(label||s.chem.stage);s.chem.stage='teach';s.chem.teachStep=0;}else if(lane==='targeted'){s.targeted.status[s.targeted.skill]='Developing';moveToNextTargeted(s);}else if(lane==='foundation'){s.foundation.stage='teach';s.foundation.lesson=Math.min(s.foundation.lesson+1,2);}s.screen='home';return s;}
function moveToNextTargeted(s){const i=TARGET_ORDER.indexOf(s.targeted.skill);if(i<TARGET_ORDER.length-1){s.targeted.skill=TARGET_ORDER[i+1];s.targeted.stage='teach';s.targeted.watchStep=0;s.targeted.togetherPassed=false;s.targeted.guidedIndex=0;s.targeted.guidedCorrect=0;s.targeted.aloneIndex=0;s.targeted.aloneCorrect=0;s.targeted.freshIndex=0;s.targeted.freshCorrect=0;}else{s.targeted.stage='complete';}return s;}
function completeTargetSkill(s,status){s.targeted.status[s.targeted.skill]=status||'Cleared';return moveToNextTargeted(s);}
function idk(s,lane){if(lane==='targeted'){s.targeted.idkCount=(s.targeted.idkCount||0)+1;if(s.targeted.stage==='alone'||s.targeted.stage==='fresh')s.targeted.stage='together';else if(s.targeted.stage==='guided')s.targeted.stage='watch';}if(lane==='chem'){if(s.chem.stage==='alone'||s.chem.stage==='fresh')s.chem.stage='guided';else if(s.chem.stage==='guided')s.chem.stage='watch';}return s;}
function noPrematureCompletion(s){const vals=Object.values(s.targeted.status||{});return !(vals.length<6&&s.targeted.stage==='complete');}
function subjectSwitchPreserves(before,after,lane){return JSON.stringify(before[lane])===JSON.stringify(after[lane]);}
const api={STAGES,TARGET_ORDER,freshState,clone,safeState,openLane,goHome,advanceStage,recordSeen,canUseFresh,skipActivity,moveToNextTargeted,completeTargetSkill,idk,noPrematureCompletion,subjectSwitchPreserves};
root.ClassroomV2Engine=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
