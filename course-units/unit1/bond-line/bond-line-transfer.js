/* U1-01 Transfer: different-looking application tasks. Transfer is not mastery evidence. */
(function(root,factory){
  var router=typeof module==="object"&&module.exports?require("../../../student-model-idk-router.js"):root.StudentModelIdkRouter;
  var api=factory(router);
  if(typeof module==="object"&&module.exports)module.exports=api;
  else root.BondLineTransfer=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(Router){
  "use strict";
  if(!Router)throw new Error("StudentModelIdkRouter is required");

  var TASKS=Object.freeze({
    T1:Object.freeze({
      id:"BL-T1",
      prompt:"A classmate says this bond-line structure has only four atoms because she sees four corners. Without redrawing the whole molecule, explain what she is missing and determine the actual number of carbon atoms."
    }),
    T2:Object.freeze({
      id:"BL-T2",
      prompt:"A selected carbon in a bond-line structure has one double bond and two single bonds. How many hydrogens can be attached to that carbon in the neutral structure? Explain."
    })
  });

  function createSession(skill){
    if(!skill)throw new Error("Transfer requires the existing lesson skill state");
    return{
      skill:skill,
      phase:"t1",
      currentTaskId:"BL-T1",
      seenTaskIds:["BL-T1"],
      t1Contaminated:false,
      repairEnds:[],
      transferAttempts:[],
      events:[]
    };
  }

  function normalize(text){return String(text||"").toLowerCase().replace(/[—–]/g,"-").replace(/\s+/g," ").trim();}
  function pushEvent(session,taskId,correct,code){
    session.events.push({type:"BONDLINE_TRANSFER_RESULT",taskId:taskId,correct:!!correct,code:code||null,supported:session.t1Contaminated&&taskId==="BL-T1"});
  }
  function remember(session,id){if(session.seenTaskIds.indexOf(id)===-1)session.seenTaskIds.push(id);}

  function gradeT1Explanation(text){
    var t=normalize(text);
    var bondCenter=/bond\s+cent(?:er|re)|middle of (?:a |the )?(?:bond|line)/i.test(t);
    var bondCenterAsCarbon=bondCenter&&/(?:carbon|carbons|atom|atoms)/i.test(t)&&/(?:count|counts|are|is|represent|represents)/i.test(t);
    if(bondCenterAsCarbon)return{correct:false,code:"BOND_CENTER_AS_CARBON"};
    var ends=/(?:both|two|2).{0,24}(?:line )?ends?|(?:line )?ends?.{0,28}(?:also|represent|count|carbon)/i.test(t);
    var endsCarbon=/(?:line )?ends?.{0,35}(?:represent|are|count as|mean).{0,18}(?:carbon|carbons|carbon positions?|atoms?)|(?:carbon|carbons|carbon positions?).{0,35}(?:line )?ends?/i.test(t);
    if(!(ends&&endsCarbon))return{correct:false,code:"MISSING_LINE_END_RELATION"};
    return{correct:true,code:null};
  }

  function submitT1(session,response,timestamp){
    if(!session||session.phase!=="t1"||session.currentTaskId!=="BL-T1")return{accepted:false,correct:false,reason:"wrong_phase"};
    response=response||{};
    var countOk=Number(response.carbonCount)===6;
    var explanation=gradeT1Explanation(response.explanation);
    var code=!countOk?"CARBON_COUNT":explanation.code;
    session.transferAttempts.push({taskId:"BL-T1",correct:countOk&&explanation.correct,response:response,timestamp:timestamp||Date.now(),code:code||null});
    if(!countOk||!explanation.correct){
      session.phase="t1_repair";session.currentTaskId=null;pushEvent(session,"BL-T1",false,code);
      return{accepted:true,correct:false,complete:false,code:code,repairRequired:true};
    }
    session.phase="complete";session.currentTaskId=null;pushEvent(session,"BL-T1",true,null);
    return{accepted:true,correct:true,complete:true,nextPhase:"later_retrieval"};
  }

  function repairStatus(session){
    var found=Array.isArray(session&&session.repairEnds)?session.repairEnds.length:0;
    return{endsFound:found,complete:found===2};
  }

  function enterT2(session,timestamp){
    if(Router.isRemediationActive(session.skill)){
      Router.recordRemediationCheck(session.skill,true,"BL-T1-END-REPAIR",timestamp);
      var exited=Router.exitRemediation(session.skill,[{id:"BL-T2"}]);
      if(!exited.allowed)return{accepted:false,complete:false,reason:exited.reason};
    }
    session.phase="t2";session.currentTaskId="BL-T2";remember(session,"BL-T2");
    return{accepted:true,complete:true,nextTaskId:"BL-T2"};
  }

  function tapT1Repair(session,targetId,timestamp){
    if(!session||session.phase!=="t1_repair")return{accepted:false,reason:"wrong_phase",complete:false};
    if(/^BOND_CENTER_/i.test(targetId||""))return{accepted:false,reason:"bond_center",complete:false,endsFound:session.repairEnds.length};
    if(["END_LEFT","END_RIGHT"].indexOf(targetId)===-1)return{accepted:false,reason:"unknown_target",complete:false};
    if(session.repairEnds.indexOf(targetId)===-1)session.repairEnds.push(targetId);
    if(session.repairEnds.length<2)return{accepted:true,complete:false,endsFound:session.repairEnds.length};
    return enterT2(session,timestamp);
  }

  function requestHelp(session,reason,timestamp){
    if(!session||session.phase!=="t1"||session.currentTaskId!=="BL-T1")return{accepted:false,reason:"help_unavailable"};
    session.t1Contaminated=true;
    var route=Router.handleIdk(session.skill,reason,"BL-T1","chem.representation.bond_line",timestamp);
    session.phase="t1_repair";session.currentTaskId=null;
    return{accepted:true,action:route.action,remediationActive:route.remediationActive,repairRequired:true};
  }

  function gradeT2Explanation(text){
    var t=normalize(text);
    if(/neighbor(?:ing|s)?.{0,25}(?:three|3).{0,25}(?:hydrogen|h\b)/i.test(t))return{correct:false,code:"NEIGHBORS_NOT_BOND_ORDER"};
    var doubleTwo=/(?:double bond).{0,24}(?:bond order )?(?:two|2)|(?:two|2).{0,22}(?:from|for|because of).{0,15}(?:double bond)/i.test(t);
    var singles=/(?:two|2).{0,24}(?:single bonds?).{0,28}(?:one|1).{0,15}(?:each)?|(?:single bonds?).{0,28}(?:one|1).{0,15}(?:each)/i.test(t);
    var totalFour=/(?:total|adds? up to|equals?|=).{0,15}(?:four|4)|(?:four|4).{0,18}(?:total|bond order)/i.test(t);
    var noH=/(?:no|zero|0).{0,18}(?:hydrogen|hydrogens|h\b)|(?:cannot|can't).{0,25}(?:hydrogen|h\b)/i.test(t);
    var ok=doubleTwo&&singles&&totalFour&&noH;
    return{correct:ok,code:ok?null:"MISSING_BOND_ORDER_REASONING"};
  }

  function submitT2(session,response,timestamp){
    if(!session||session.phase!=="t2"||session.currentTaskId!=="BL-T2")return{accepted:false,correct:false,reason:"wrong_phase"};
    response=response||{};
    var countOk=Number(response.hydrogenCount)===0;
    var explanation=gradeT2Explanation(response.explanation);
    var code=!countOk?"HYDROGEN_COUNT":explanation.code;
    session.transferAttempts.push({taskId:"BL-T2",correct:countOk&&explanation.correct,response:response,timestamp:timestamp||Date.now(),code:code||null});
    if(!countOk||!explanation.correct){
      session.phase="remediation_required";session.currentTaskId=null;pushEvent(session,"BL-T2",false,code);
      return{accepted:true,correct:false,complete:false,code:code,remediationRequired:true};
    }
    session.phase="complete";session.currentTaskId=null;pushEvent(session,"BL-T2",true,null);
    return{accepted:true,correct:true,complete:true,nextPhase:"later_retrieval"};
  }

  function status(session){
    return{phase:session.phase,complete:session.phase==="complete",nextPhase:session.phase==="complete"?"later_retrieval":session.phase};
  }

  return Object.freeze({TASKS:TASKS,createSession:createSession,submitT1:submitT1,repairStatus:repairStatus,tapT1Repair:tapT1Repair,requestHelp:requestHelp,submitT2:submitT2,status:status,gradeT1Explanation:gradeT1Explanation,gradeT2Explanation:gradeT2Explanation});
});
