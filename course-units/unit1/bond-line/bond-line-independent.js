/* U1-01 cold Independent evidence bank. Pure state; shared Student Model owns evidence/mastery. */
(function(root,factory){
  var router=typeof module==="object"&&module.exports?require("../../../student-model-idk-router.js"):root.StudentModelIdkRouter;
  var api=factory(router);
  if(typeof module==="object"&&module.exports)module.exports=api;
  else root.BondLineIndependent=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(Router){
  "use strict";
  if(!Router)throw new Error("StudentModelIdkRouter is required");

  var INDEPENDENT_BANK=Object.freeze([
    Object.freeze({id:"BL-I1",kind:"carbon_read",evidenceKind:"independent",scaffoldLevel:Router.SCAFFOLD.COLD,fresh:true,correct:6,prompt:"How many carbon atoms are represented?"}),
    Object.freeze({id:"BL-I2",kind:"branched_hydrogen",evidenceKind:"independent",scaffoldLevel:Router.SCAFFOLD.COLD,fresh:true,correct:1,prompt:"How many hydrogens are implied on the selected carbon?"}),
    Object.freeze({id:"BL-I3",kind:"heteroatom_read",evidenceKind:"independent",scaffoldLevel:Router.SCAFFOLD.COLD,fresh:true,carbonCount:3,nonCarbonAtom:"O",prompt:"How many carbons are represented, and which written atom is not carbon?"}),
    Object.freeze({id:"BL-I4",kind:"multiple_bond_hydrogen",evidenceKind:"independent",scaffoldLevel:Router.SCAFFOLD.COLD,fresh:true,correct:1,prompt:"How many hydrogens are implied on the selected carbon?"}),
    Object.freeze({id:"BL-I5",kind:"condensed_to_bond_line",evidenceKind:"independent",scaffoldLevel:Router.SCAFFOLD.COLD,fresh:true,formula:"CH3CH2CH(CH3)CH2CH3",prompt:"Draw the bond-line structure for CH3CH2CH(CH3)CH2CH3."}),
    Object.freeze({id:"BL-I6",kind:"bond_line_to_condensed",evidenceKind:"independent",scaffoldLevel:Router.SCAFFOLD.COLD,fresh:true,acceptedCondensed:Object.freeze(["CH3C(CH3)2CH3","C(CH3)4"]),prompt:"Write a correct condensed formula for this structure."})
  ]);

  function freshItemState(id){return{itemId:id,contaminated:false,coldEligible:true,awaitingExplanation:false,answerCorrect:false,attempts:0};}
  function createSession(timestamp){
    var skill=Router.createSkill("chem.representation.bond_line");
    skill.state=Router.STATES.INDEPENDENT_ATTEMPTED;
    skill.scaffoldLevel=Router.SCAFFOLD.COLD;
    return{lessonId:"chm221.u1.01",skill:skill,currentItemId:"BL-I1",itemState:freshItemState("BL-I1"),completedItemIds:[],attemptedItemIds:[],startedAt:timestamp||Date.now()};
  }
  function itemById(id){return INDEPENDENT_BANK.find(function(i){return i.id===id;})||null;}
  function markAttempted(session,id){if(session.attemptedItemIds.indexOf(id)===-1)session.attemptedItemIds.push(id);}
  function markCompleted(session,id){if(session.completedItemIds.indexOf(id)===-1)session.completedItemIds.push(id);}
  function advanceTo(session,id){
    if(!itemById(id))return{accepted:false,reason:"unknown_item"};
    session.currentItemId=id;session.itemState=freshItemState(id);
    if(!Router.isRemediationActive(session.skill)){session.skill.state=Router.STATES.INDEPENDENT_ATTEMPTED;session.skill.scaffoldLevel=Router.SCAFFOLD.COLD;}
    return{accepted:true,item:itemById(id)};
  }
  function advance(session){
    var index=INDEPENDENT_BANK.findIndex(function(i){return i.id===session.currentItemId;});
    if(index<0||index>=INDEPENDENT_BANK.length-1)return{accepted:false,reason:"bank_end",nextPhase:"explain_why"};
    return advanceTo(session,INDEPENDENT_BANK[index+1].id);
  }

  function wrong(session,code,timestamp,input){
    var id=session.currentItemId;session.itemState.attempts+=1;session.itemState.coldEligible=false;markAttempted(session,id);
    var route=Router.handleWrongAttempt(session.skill,id,code,id,timestamp,input);
    return{accepted:true,correct:false,code:code,countedAsIndependent:false,remediationActive:!!route.remediationActive,action:route.action,representation:route.representation||null};
  }
  function correct(session,correctExplanation,timestamp,input){
    var id=session.currentItemId;session.itemState.attempts+=1;markAttempted(session,id);
    if(session.itemState.contaminated||!session.itemState.coldEligible||session.skill.scaffoldLevel!==Router.SCAFFOLD.COLD||Router.isRemediationActive(session.skill)){
      Router.recordAttempt(session.skill,id,true,null,timestamp,input);
      return{accepted:true,correct:true,countedAsIndependent:false,freshItemRequired:true};
    }
    Router.recordIndependentAttempt(session.skill,id,true,!!correctExplanation,timestamp,input);
    markCompleted(session,id);
    return{accepted:true,correct:true,countedAsIndependent:true,correctExplanation:!!correctExplanation};
  }

  function normalize(text){return String(text||"").toLowerCase().replace(/[—–]/g,"-").replace(/\s+/g," ").trim();}
  function gradeI1Explanation(text){
    var t=normalize(text);
    var reversed=/(?:vertices?|corners?).{0,24}(?:are|=|represent).{0,16}(?:bonds?|lines?|segments?)|(?:lines?|segments?).{0,24}(?:are|=|represent).{0,16}(?:carbons?|carbon atoms?)|middle of (?:each |the )?line.{0,24}(?:carbon|atom)/i.test(t);
    if(reversed)return{correct:false,code:"ROLE_REVERSAL"};
    var endCarbon=/(?:line )?ends?.{0,35}(?:carbon|carbons|carbon positions)|(?:carbon|carbons|carbon positions).{0,35}(?:line )?ends?/i.test(t);
    var vertexCarbon=/(?:vertices?|vertex|corners?|corner).{0,35}(?:carbon|carbons|carbon positions)|(?:carbon|carbons|carbon positions).{0,35}(?:vertices?|vertex|corners?|corner)/i.test(t);
    return{correct:endCarbon&&vertexCarbon,code:endCarbon&&vertexCarbon?null:"MISSING_ROLE_RELATION"};
  }
  function gradeI2Explanation(text){
    var t=normalize(text);
    var reversed=/hydrogen.{0,30}(?:makes?|creates?|gives?).{0,35}visible.{0,20}bonds?|visible.{0,20}bonds?.{0,30}(?:become|are).{0,15}implied/i.test(t);
    if(reversed)return{correct:false,code:"CAUSAL_REVERSAL"};
    var visibleThree=/(?:three|3).{0,25}visible.{0,20}(?:c-?c )?(?:single )?bonds?|visible.{0,25}(?:bond order|order).{0,12}(?:three|3)|(?:bond order|order).{0,12}(?:three|3)/i.test(t);
    var reachesFour=/(?:reach|reaches|reaching|needs?.{0,30}reach).{0,20}(?:four|4)|total.{0,15}(?:bond order )?(?:four|4)/i.test(t);
    var oneH=/(?:one|1).{0,15}(?:c-?h|hydrogen|h\b).{0,12}(?:bond)?|(?:needs?|requires?).{0,20}(?:one|1).{0,15}(?:bond|hydrogen|c-?h)/i.test(t);
    return{correct:visibleThree&&reachesFour&&oneH,code:visibleThree&&reachesFour&&oneH?null:"MISSING_REASONING_RELATION"};
  }

  function submitI1Count(session,value,timestamp){
    if(session.currentItemId!=="BL-I1")return{accepted:false,correct:false,reason:"wrong_item"};
    if(Number(value)!==6)return wrong(session,"CARBON_COUNT",timestamp,value);
    session.itemState.answerCorrect=true;session.itemState.awaitingExplanation=true;return{accepted:true,correct:true,awaitingExplanation:true,countedAsIndependent:false};
  }
  function submitI1Explanation(session,text,timestamp){
    if(session.currentItemId!=="BL-I1"||!session.itemState.awaitingExplanation)return{accepted:false,correct:false,reason:"explanation_not_due"};
    var grade=gradeI1Explanation(text);
    if(!grade.correct)return wrong(session,grade.code,timestamp,text);
    session.itemState.awaitingExplanation=false;return correct(session,true,timestamp,text);
  }
  function submitI2Hydrogen(session,value,timestamp){
    if(session.currentItemId!=="BL-I2")return{accepted:false,correct:false,reason:"wrong_item"};
    if(Number(value)!==1)return wrong(session,"IMPLIED_H",timestamp,value);
    session.itemState.answerCorrect=true;session.itemState.awaitingExplanation=true;return{accepted:true,correct:true,awaitingExplanation:true,countedAsIndependent:false};
  }
  function submitI2Explanation(session,text,timestamp){
    if(session.currentItemId!=="BL-I2"||!session.itemState.awaitingExplanation)return{accepted:false,correct:false,reason:"explanation_not_due"};
    var grade=gradeI2Explanation(text);
    if(!grade.correct)return wrong(session,grade.code,timestamp,text);
    session.itemState.awaitingExplanation=false;return correct(session,true,timestamp,text);
  }
  function submitI3(session,response,timestamp){
    if(session.currentItemId!=="BL-I3")return{accepted:false,correct:false,reason:"wrong_item"};
    response=response||{};var ok=Number(response.carbonCount)===3&&String(response.nonCarbonAtom||"").toUpperCase()==="O";
    if(!ok)return wrong(session,"HETEROATOM_READ",timestamp,response);
    return correct(session,false,timestamp,response);
  }
  function submitI4Hydrogen(session,value,timestamp){
    if(session.currentItemId!=="BL-I4")return{accepted:false,correct:false,reason:"wrong_item"};
    if(Number(value)!==1)return wrong(session,"MULTIPLE_BOND_H",timestamp,value);
    return correct(session,false,timestamp,value);
  }

  function graphShape(model){
    model=model||{};var nodes=Array.isArray(model.nodes)?Array.from(new Set(model.nodes)):[],edges=Array.isArray(model.edges)?model.edges:[];
    if(nodes.length!==6)return{ok:false,code:"CARBON_COUNT"};
    var degree={};nodes.forEach(function(n){degree[n]=0;});
    var adj={};nodes.forEach(function(n){adj[n]=[];});
    var seen={};
    for(var i=0;i<edges.length;i++){
      var e=edges[i];if(!Array.isArray(e)||e.length!==2||!degree.hasOwnProperty(e[0])||!degree.hasOwnProperty(e[1])||e[0]===e[1])return{ok:false,code:"WRONG_CONNECTIVITY"};
      var key=e.slice().sort().join("~");if(seen[key])return{ok:false,code:"WRONG_CONNECTIVITY"};seen[key]=true;
      degree[e[0]]++;degree[e[1]]++;adj[e[0]].push(e[1]);adj[e[1]].push(e[0]);
    }
    if(edges.length!==5)return{ok:false,code:"WRONG_CONNECTIVITY"};
    var degrees=nodes.map(function(n){return degree[n];}).sort(function(a,b){return a-b;});
    if(degrees.join(",")!=="1,1,1,2,2,3")return{ok:false,code:"WRONG_CONNECTIVITY"};
    var branch=nodes.find(function(n){return degree[n]===3;});
    var leaves=nodes.filter(function(n){return degree[n]===1;});
    function distance(start,target){var q=[[start,0]],visited={};visited[start]=true;while(q.length){var cur=q.shift();if(cur[0]===target)return cur[1];adj[cur[0]].forEach(function(next){if(!visited[next]){visited[next]=true;q.push([next,cur[1]+1]);}});}return Infinity;}
    var arms=leaves.map(function(l){return distance(branch,l);}).sort(function(a,b){return a-b;});
    if(arms.join(",")!=="1,2,2")return{ok:false,code:"WRONG_BRANCH_HOST"};
    return{ok:true,code:null};
  }
  function submitI5Skeleton(session,model,timestamp){
    if(session.currentItemId!=="BL-I5")return{accepted:false,correct:false,reason:"wrong_item"};
    var shape=graphShape(model);if(!shape.ok)return wrong(session,shape.code,timestamp,model);
    return correct(session,false,timestamp,model);
  }
  function normalizedFormula(text){return String(text||"").toUpperCase().replace(/[\s\-—–]/g,"");}
  function submitI6Condensed(session,text,timestamp){
    if(session.currentItemId!=="BL-I6")return{accepted:false,correct:false,reason:"wrong_item"};
    var n=normalizedFormula(text);var ok=INDEPENDENT_BANK[5].acceptedCondensed.some(function(v){return normalizedFormula(v)===n;});
    if(!ok)return wrong(session,"CONDENSED_FORMULA",timestamp,text);
    return correct(session,false,timestamp,text);
  }

  function requestHelp(session,reason,timestamp){
    if(!session||!session.itemState)return{accepted:false,reason:"no_current_item"};
    if(!Router.IDK_REASONS||!Object.keys(Router.IDK_REASONS).some(function(k){return Router.IDK_REASONS[k]===reason;}))return{accepted:false,reason:"unknown_help_reason"};
    session.itemState.contaminated=true;session.itemState.coldEligible=false;markAttempted(session,session.currentItemId);
    var route=Router.handleIdk(session.skill,reason,session.currentItemId,"chem.representation.bond_line",timestamp);
    return{accepted:true,countedAsIndependent:false,currentItemContaminated:true,action:route.action,remediationActive:route.remediationActive};
  }
  function bankStatus(session){
    var unique=Array.from(new Set(session.completedItemIds));
    return{completedColdItems:unique.length,attemptedItems:Array.from(new Set(session.attemptedItemIds)).length,complete:unique.length>=INDEPENDENT_BANK.length,nextPhase:unique.length>=INDEPENDENT_BANK.length?"explain_why":"independent"};
  }

  return Object.freeze({
    INDEPENDENT_BANK:INDEPENDENT_BANK,createSession:createSession,itemById:itemById,advanceTo:advanceTo,advance:advance,
    requestHelp:requestHelp,gradeI1Explanation:gradeI1Explanation,gradeI2Explanation:gradeI2Explanation,
    submitI1Count:submitI1Count,submitI1Explanation:submitI1Explanation,submitI2Hydrogen:submitI2Hydrogen,submitI2Explanation:submitI2Explanation,
    submitI3:submitI3,submitI4Hydrogen:submitI4Hydrogen,submitI5Skeleton:submitI5Skeleton,submitI6Condensed:submitI6Condensed,
    graphShape:graphShape,bankStatus:bankStatus
  });
});
