/* Chemistry progression controller. Curriculum owns chemistry content; AdaptiveMastery owns evidence. */
(function(root,factory){var api=factory(typeof require==='function'?require('./adaptive-mastery-engine.js'):root.AdaptiveMastery);if(typeof module==='object'&&module.exports)module.exports=api;else root.ChemistryProgression=api;})(typeof self!=='undefined'?self:this,function(M){'use strict';
var ITEMS=[
{id:'nh3-teach',molecule:'NH3',phase:'learning',form:'teacher-demo',support:'teacher',purpose:'teach',fresh:false},
{id:'h2o-guided',molecule:'H2O',phase:'practicing-together',form:'guided-build',support:'guided',purpose:'practice',fresh:true},
{id:'ch4-independent',molecule:'CH4',phase:'your-turn',form:'independent-build',support:'none',purpose:'practice',fresh:true},
{id:'h2s-independent',molecule:'H2S',phase:'your-turn',form:'error-analysis',support:'none',purpose:'practice',fresh:true},
{id:'ph3-transfer',molecule:'PH3',phase:'fresh-check',form:'transfer-build',support:'none',purpose:'transfer',fresh:true,isTransfer:true}
];
function create(opts){opts=opts||{};return{index:0,items:ITEMS.slice(),mastery:M.createSession({learnerId:opts.learnerId||'local',subject:'chemistry',concept:'lewis_structure',policy:opts.policy||{minIndependentCorrect:3,minForms:2,requireTransfer:true}}),repair:null};}
function current(s){return s.items[s.index]||null;}
function record(s,data){var item=current(s);if(!item)return null;var supported=item.support!=='none'||!!data.supported;var a=M.record(s.mastery,{itemId:item.id,template:item.form,molecule:item.molecule,subskill:data.subskill||'full_build',response:data.response||null,correctness:!!data.correct,independent:!supported,supportLevel:supported?item.support:'none',errorType:data.errorType||null,representation:data.representation||'lewis',hints:data.hints||0,replays:data.replays||0,toolboxUsed:!!data.toolboxUsed,isTransfer:!!item.isTransfer,prerequisiteBlocked:!!data.prerequisiteBlocked,prerequisiteResolved:!!data.prerequisiteResolved});if(!data.correct){s.repair={molecule:item.molecule,subskill:data.subskill||'full_build',errorType:data.errorType||'unresolved',representation:M.nextRepresentation(s.mastery,data.errorType||'unresolved',data.representation||'lewis')};}else{s.repair=null;}return a;}
function canAdvance(s){var item=current(s);if(!item)return false;if(item.purpose==='teach')return true;var a=s.mastery.attempts.filter(function(x){return x.itemId===item.id;});return a.length>0&&a[a.length-1].correctness;}
function next(s){if(!canAdvance(s))return{advanced:false,reason:'current-evidence-incomplete',repair:s.repair};if(s.index<s.items.length-1){s.index++;return{advanced:true,item:current(s)};}var result=M.completeIfMastered(s.mastery);if(result.mastered)M.scheduleRetrieval(s.mastery,3);return{advanced:false,finished:true,mastery:result,retrieval:s.mastery.retrievalTarget};}
function status(s){return{item:current(s),phase:current(s)?current(s).phase:'complete',evidence:M.evidence(s.mastery),mastery:M.mastery(s.mastery),repair:s.repair};}
return{ITEMS:ITEMS,create:create,current:current,record:record,canAdvance:canAdvance,next:next,status:status};});
