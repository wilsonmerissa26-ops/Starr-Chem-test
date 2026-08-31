/* U1-01 Explain Why: role-preserving explanation grading tied to existing cold successes. */
(function(root,factory){
  var router=typeof module==="object"&&module.exports?require("../../../student-model-idk-router.js"):root.StudentModelIdkRouter;
  var api=factory(router);
  if(typeof module==="object"&&module.exports)module.exports=api;
  else root.BondLineExplainWhy=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(Router){
  "use strict";
  if(!Router)throw new Error("StudentModelIdkRouter is required");

  var PROMPTS=Object.freeze([
    Object.freeze({id:"E-W1",targetItemId:"BL-I1",prompt:"Why does a three-segment unbranched bond-line chain contain four carbons instead of three?"}),
    Object.freeze({id:"E-W2",targetItemId:"BL-I2",prompt:"Why is the selected internal carbon CH2 even though no H labels are drawn?"}),
    Object.freeze({id:"E-W3",targetItemId:"BL-I3",prompt:"Why do we write O explicitly but usually omit C labels at ordinary line ends and vertices?"})
  ]);

  var REPAIR_PROMPTS=Object.freeze({
    "E-W1":Object.freeze({id:"E-W1-R1",baseId:"E-W1",targetItemId:"BL-I1",fresh:true,prompt:"A fresh three-bond zig-zag has two ends and two corners. Explain why that represents four carbons even though only three line segments are drawn."}),
    "E-W2":Object.freeze({id:"E-W2-R1",baseId:"E-W2",targetItemId:"BL-I2",fresh:true,prompt:"On a fresh internal carbon with two visible C-C single bonds, explain how you determine the number of hidden C-H bonds."}),
    "E-W3":Object.freeze({id:"E-W3-R1",baseId:"E-W3",targetItemId:"BL-I3",fresh:true,prompt:"On a fresh bond-line drawing, explain what an unlabeled end or corner means and why an oxygen atom cannot be left unlabeled."})
  });

  function normalize(text){return String(text||"").toLowerCase().replace(/[—–]/g,"-").replace(/\s+/g," ").trim();}
  function relation(t,a,b,max){var n=max||45;return new RegExp("(?:"+a+").{0,"+n+"}(?:"+b+")|(?:"+b+").{0,"+n+"}(?:"+a+")","i").test(t);}

  function gradeW1(text){
    var t=normalize(text);
    var vertexAsBond=/(?:vertices?|corners?)(?:\s+\w+){0,2}\s+(?:are|represent|count as)\s+(?:the\s+)?(?:bonds?|lines?|segments?)/i.test(t);
    var lineAsCarbon=/(?:lines?|segments?)(?:\s+\w+){0,4}\s+(?:are|represent|count as)\s+(?:the\s+)?(?:(?:four|4)\s+)?(?:carbons?|carbon atoms?|carbon positions?)/i.test(t);
    var bondCenterAsCarbon=/middle of (?:each |the )?line.{0,25}(?:is|as|means?|represents?).{0,15}(?:carbon|atom)/i.test(t);
    if(vertexAsBond||lineAsCarbon||bondCenterAsCarbon)return{correct:false,code:"ROLE_REVERSAL"};
    var segmentsAreBonds=relation(t,"lines?|segments?","bonds?|connections?",38);
    var endsAreCarbon=relation(t,"(?:line )?ends?","carbons?|carbon positions?",38);
    var verticesAreCarbon=relation(t,"vertices?|corners?","carbons?|carbon positions?",38);
    var totalFour=/(?:four|4).{0,18}(?:carbons?|carbon positions?)|(?:carbons?|carbon positions?).{0,18}(?:four|4)/i.test(t);
    var ok=segmentsAreBonds&&endsAreCarbon&&verticesAreCarbon&&totalFour;
    return{correct:ok,code:ok?null:"MISSING_REQUIRED_RELATION"};
  }

  function gradeW2(text){
    var t=normalize(text);
    var reversed=/hydrogens?.{0,32}(?:make|makes|create|creates|give|gives).{0,35}visible.{0,25}(?:c-?c )?bonds?|visible.{0,25}(?:bonds?|bond order).{0,32}(?:become|are).{0,18}implied/i.test(t);
    if(reversed)return{correct:false,code:"ROLE_REVERSAL"};
    var visibleTwo=/(?:two|2).{0,28}visible.{0,25}(?:c-?c )?(?:single )?bonds?|visible.{0,28}(?:bond order|order).{0,16}(?:two|2)|(?:bond order|order).{0,16}(?:two|2)/i.test(t);
    var carbonFour=/(?:carbon|it).{0,32}(?:needs?|requires?|reaches?|has).{0,25}(?:four|4).{0,15}(?:total )?(?:bonds?|bond order)?|(?:total bond order|four bonds|4 bonds)/i.test(t);
    var twoH=/(?:two|2).{0,24}(?:c-?h|hydrogens?|h bonds?).{0,18}(?:implied|hidden|needed|required)?|(?:implied|hidden|needs?|requires?).{0,24}(?:two|2).{0,18}(?:hydrogens?|c-?h|bonds?)/i.test(t);
    var ok=visibleTwo&&carbonFour&&twoH;
    return{correct:ok,code:ok?null:"MISSING_REQUIRED_RELATION"};
  }

  function gradeW3(text){
    var t=normalize(text);
    var oxygenDefault=/oxygen(?:\s+\w+){0,5}\s+(?:is|means?|represents?|defaults? to)?\s*(?:the\s+)?default(?:\s+atom)?\s+(?:at|for)\s+unlabeled/i.test(t);
    var unlabeledAsO=/(?:unlabeled|without a label).{0,20}(?:ends?|vertices?|corners?).{0,12}(?:are|mean|means|represent|represents|default to|defaults to)\s+(?:an?\s+)?(?:oxygen|o\b)/i.test(t);
    var carbonExplicit=/carbon.{0,35}(?:must|has to|needs to).{0,18}(?:explicit|written|labeled).{0,12}c\b/i.test(t);
    var oxygenOptional=/(?:\bo\b|oxygen).{0,25}(?:optional|can be omitted|can be hidden|does not have to be written)/i.test(t);
    if(oxygenDefault||unlabeledAsO||carbonExplicit||oxygenOptional)return{correct:false,code:"ROLE_REVERSAL"};
    var carbonDefault=/(?:unlabeled|without a label).{0,32}(?:line )?(?:end|ends|vertex|vertices|corner|corners).{0,32}(?:carbon|defaults? to carbon|means? carbon)|(?:end|ends|vertex|vertices|corner|corners).{0,35}(?:unlabeled|without a label).{0,28}(?:carbon|defaults? to carbon|means? carbon)|(?:unlabeled end|unlabeled corner|unlabeled vertex).{0,28}(?:means?|represents?|defaults? to).{0,15}carbon/i.test(t);
    var oxygenExplicit=/(?:oxygen|heteroatom).{0,45}(?:must|has to|needs to|so).{0,30}(?:written|shown|labeled|symbol|\bo\b)|(?:write|show|label).{0,30}(?:oxygen|\bo\b).{0,25}(?:different|heteroatom|not carbon)?/i.test(t);
    var ok=carbonDefault&&oxygenExplicit;
    return{correct:ok,code:ok?null:"MISSING_REQUIRED_RELATION"};
  }

  function baseIdOf(id){return String(id||"").replace(/-R\d+$/i,"");}
  function promptById(id){var base=PROMPTS.find(function(p){return p.id===id;});if(base)return base;return Object.keys(REPAIR_PROMPTS).map(function(k){return REPAIR_PROMPTS[k];}).find(function(p){return p.id===id;})||null;}
  function grade(id,text){var base=baseIdOf(id);if(base==="E-W1")return gradeW1(text);if(base==="E-W2")return gradeW2(text);if(base==="E-W3")return gradeW3(text);return{correct:false,code:"UNKNOWN_PROMPT"};}

  function createSession(skill){
    if(!skill)throw new Error("Explain Why requires the existing lesson skill state");
    skill.state=Router.STATES.EXPLAIN_WHY;
    return{skill:skill,currentPromptId:"E-W1",currentPromptFresh:true,freshPromptRequired:false,completedPromptIds:[],failedBaseIds:[],results:[]};
  }
  function advanceTo(session,id){var prompt=promptById(id);if(!prompt)return{accepted:false,reason:"unknown_prompt"};session.currentPromptId=id;session.currentPromptFresh=true;session.freshPromptRequired=false;return{accepted:true,prompt:prompt};}
  function targetFor(id){var base=baseIdOf(id);var p=PROMPTS.find(function(x){return x.id===base;});return p?p.targetItemId:null;}
  function markCompleted(session,baseId){if(session.completedPromptIds.indexOf(baseId)===-1)session.completedPromptIds.push(baseId);}

  function submit(session,text,timestamp){
    var id=session.currentPromptId,base=baseIdOf(id),result=grade(id,text),targetItemId=targetFor(id);
    if(!targetItemId)return{accepted:false,correct:false,reason:"unknown_prompt"};
    var wasFresh=session.currentPromptFresh;
    var alreadyFailed=session.failedBaseIds.indexOf(base)!==-1&&id===base;
    if(!result.correct){
      Router.recordIndependentExplanation(session.skill,targetItemId,false,timestamp,text);
      if(session.failedBaseIds.indexOf(base)===-1)session.failedBaseIds.push(base);
      session.currentPromptFresh=false;session.freshPromptRequired=true;
      session.results.push({promptId:id,baseId:base,correct:false,countedAsExplanationEvidence:false,code:result.code});
      return{accepted:true,correct:false,code:result.code,countedAsExplanationEvidence:false,freshPromptRequired:true};
    }
    if(!wasFresh||alreadyFailed){
      session.results.push({promptId:id,baseId:base,correct:true,countedAsExplanationEvidence:false,code:null});
      session.freshPromptRequired=true;
      return{accepted:true,correct:true,countedAsExplanationEvidence:false,freshPromptRequired:true};
    }
    var attached=Router.recordIndependentExplanation(session.skill,targetItemId,true,timestamp,text);
    var counted=!!(attached&&attached.accepted&&attached.attached);
    markCompleted(session,base);session.currentPromptFresh=false;session.freshPromptRequired=false;
    session.results.push({promptId:id,baseId:base,correct:true,countedAsExplanationEvidence:counted,code:null});
    return{accepted:true,correct:true,countedAsExplanationEvidence:counted,attachment:attached,freshPromptRequired:false};
  }

  function nextFreshPrompt(session){if(!session.freshPromptRequired)return null;var base=baseIdOf(session.currentPromptId),fresh=REPAIR_PROMPTS[base];if(!fresh)return null;session.currentPromptId=fresh.id;session.currentPromptFresh=true;session.freshPromptRequired=false;return fresh;}
  function advance(session){if(session.freshPromptRequired)return{accepted:false,reason:"fresh_repair_required"};var base=baseIdOf(session.currentPromptId),index=PROMPTS.findIndex(function(p){return p.id===base;});if(index<0||index>=PROMPTS.length-1)return{accepted:false,reason:"explain_end",nextPhase:"transfer"};session.currentPromptId=PROMPTS[index+1].id;session.currentPromptFresh=true;return{accepted:true,prompt:PROMPTS[index+1]};}
  function status(session){var unique=Array.from(new Set(session.completedPromptIds));return{completed:unique.length>=3,completedPromptIds:unique,nextPhase:unique.length>=3?"transfer":"explain_why",mastered:session.skill.state===Router.STATES.MASTERED};}

  return Object.freeze({PROMPTS:PROMPTS,REPAIR_PROMPTS:REPAIR_PROMPTS,createSession:createSession,advanceTo:advanceTo,advance:advance,nextFreshPrompt:nextFreshPrompt,promptById:promptById,grade:grade,submit:submit,status:status});
});
