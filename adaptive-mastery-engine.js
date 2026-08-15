/* Universal adaptive practice + mastery evidence engine.
   AStarryia Release #1 uses this for BOTH math and chemistry.
   Curriculum supplies item pools/policies; this file owns evidence and gating. */
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.AdaptiveMastery=api;
})(typeof self!=='undefined'?self:this,function(){
  'use strict';
  var DEFAULT_POLICY={minIndependentCorrect:3,minForms:2,requireTransfer:true};
  function clone(x){return JSON.parse(JSON.stringify(x));}
  function createSession(opts){opts=opts||{};return {learnerId:opts.learnerId||'local',subject:opts.subject||'unknown',concept:opts.concept||'unknown',phase:'learning',policy:Object.assign({},DEFAULT_POLICY,opts.policy||{}),attempts:[],seenItemIds:[],seenTemplates:[],misconceptionCounts:{},unresolvedPrerequisite:false,retrievalTarget:null,completed:false};}
  function phase(s,p){s.phase=p;return s;}
  function record(s,a){var x=Object.assign({timestamp:new Date().toISOString(),supportLevel:'none',independent:true,correctness:false,errorType:null,representation:'default',hints:0,replays:0,toolboxUsed:false,countsTowardMastery:false,isTransfer:false},a||{});x.countsTowardMastery=!!(x.correctness&&x.independent&&x.supportLevel==='none');s.attempts.push(x);if(x.itemId&&s.seenItemIds.indexOf(x.itemId)<0)s.seenItemIds.push(x.itemId);if(x.template&&s.seenTemplates.indexOf(x.template)<0)s.seenTemplates.push(x.template);if(x.errorType)s.misconceptionCounts[x.errorType]=(s.misconceptionCounts[x.errorType]||0)+1;if(x.prerequisiteBlocked)s.unresolvedPrerequisite=true;if(x.prerequisiteResolved)s.unresolvedPrerequisite=false;return x;}
  function evidence(s){var good=s.attempts.filter(function(a){return a.countsTowardMastery;});var forms={};good.forEach(function(a){forms[a.template||a.form||a.itemId||'unknown']=1;});return {independentCorrect:good.length,forms:Object.keys(forms).length,transferCorrect:good.some(function(a){return a.isTransfer;}),unresolvedPrerequisite:s.unresolvedPrerequisite};}
  function mastery(s){var e=evidence(s),p=s.policy;var ok=e.independentCorrect>=p.minIndependentCorrect&&e.forms>=p.minForms&&!e.unresolvedPrerequisite&&(!p.requireTransfer||e.transferCorrect);return {mastered:ok,evidence:e,policy:clone(p)};}
  function completeIfMastered(s){var m=mastery(s);s.completed=m.mastered;if(m.mastered)s.phase='complete';return m;}
  function nextRepresentation(s,errorType,current){var n=s.misconceptionCounts[errorType]||0;if(n<2)return current||'default';var cycle=['visual','manipulative','worked-example','verbal','error-analysis'];var i=cycle.indexOf(current);return cycle[(i+1+cycle.length)%cycle.length];}
  function freshItems(s,pool,count,opts){opts=opts||{};count=count||1;return (pool||[]).filter(function(it){if(s.seenItemIds.indexOf(it.id)>=0)return false;if(opts.transferOnly&&!it.isTransfer)return false;return true;}).slice(0,count);}
  function scheduleRetrieval(s,days){days=days||3;var d=new Date();d.setDate(d.getDate()+days);s.retrievalTarget={concept:s.concept,subject:s.subject,dueAt:d.toISOString(),status:'scheduled'};return s.retrievalTarget;}
  function subskillEvidence(s,subskill){return s.attempts.filter(function(a){return a.subskill===subskill;}).map(clone);}
  return {DEFAULT_POLICY:DEFAULT_POLICY,createSession:createSession,setPhase:phase,record:record,evidence:evidence,mastery:mastery,completeIfMastered:completeIfMastered,nextRepresentation:nextRepresentation,freshItems:freshItems,scheduleRetrieval:scheduleRetrieval,subskillEvidence:subskillEvidence};
});
