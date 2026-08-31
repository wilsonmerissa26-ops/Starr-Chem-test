/* U1-01 Later Retrieval. Fresh cold confirmation after time + intervening work. */
(function(root,factory){
  var router=typeof module==="object"&&module.exports?require("../../../student-model-idk-router.js"):root.StudentModelIdkRouter;
  var api=factory(router);
  if(typeof module==="object"&&module.exports)module.exports=api;
  else root.BondLineRetrieval=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(Router){
  "use strict";
  if(!Router)throw new Error("StudentModelIdkRouter is required");

  var RETRIEVAL_ITEM=Object.freeze({
    id:"BL-R1",
    fresh:true,
    evidenceKind:"independent",
    scaffoldLevel:Router.SCAFFOLD.COLD,
    hasBranch:true,
    heteroatom:"O",
    carbonCount:6,
    selectedHydrogenCount:2,
    questions:Object.freeze([
      Object.freeze({id:"BL-R1-Q1",prompt:"What is the total carbon count?",correct:6}),
      Object.freeze({id:"BL-R1-Q2",prompt:"How many hydrogens are implied on the selected carbon?",correct:2})
    ])
  });

  function currentColdSuccesses(skill){
    var cutoff=skill.masteryEvidenceValidAfter||0;
    return skill.independentSuccesses.filter(function(s){return s.scaffoldLevel===Router.SCAFFOLD.COLD&&s.timestamp>cutoff;});
  }
  function anchorSuccess(skill){
    var current=currentColdSuccesses(skill);
    var explained=current.find(function(s){return s.correctExplanation;});
    return explained||current[0]||null;
  }

  function createSession(skill,createdAt){
    if(!skill)throw new Error("Later Retrieval requires the live lesson skill state");
    var anchor=anchorSuccess(skill);
    var due=anchor?anchor.timestamp+Router.MIN_RETRIEVAL_DELAY_MS:null;
    skill.reviewDue=due;
    return{
      skill:skill,
      phase:"not_due",
      itemId:"BL-R1",
      createdAt:createdAt||Date.now(),
      reviewDue:due,
      interveningActivities:[],
      contaminated:false,
      attempts:[],
      events:[]
    };
  }

  function registerInterveningActivity(session,activityId,timestamp){
    if(!session||!activityId)return{accepted:false,reason:"activity_required"};
    if(session.interveningActivities.some(function(a){return a.id===activityId;}))return{accepted:false,reason:"already_recorded"};
    session.interveningActivities.push({id:activityId,timestamp:timestamp||Date.now()});
    return{accepted:true,count:session.interveningActivities.length};
  }

  function readiness(session,now){
    if(!session)return{ready:false,reason:"session_required"};
    if(session.interveningActivities.length<1)return{ready:false,reason:"intervening_activity_required",reviewDue:session.reviewDue};
    if(session.reviewDue==null)return{ready:false,reason:"prior_cold_success_required",reviewDue:null};
    var at=now||Date.now();
    if(at<session.reviewDue)return{ready:false,reason:"retrieval_delay_not_met",reviewDue:session.reviewDue};
    return{ready:true,reason:null,reviewDue:session.reviewDue};
  }

  function begin(session,timestamp){
    if(!session||session.phase!=="not_due")return{started:false,reason:"wrong_phase"};
    var ready=readiness(session,timestamp);
    if(!ready.ready)return{started:false,reason:ready.reason,reviewDue:ready.reviewDue};
    session.skill.scaffoldLevel=Router.SCAFFOLD.COLD;
    session.skill.state=Router.STATES.MASTERY_CHECK;
    session.phase="cold";
    return{started:true,item:RETRIEVAL_ITEM};
  }

  function responseCorrect(response){
    response=response||{};
    return Number(response.carbonCount)===RETRIEVAL_ITEM.carbonCount&&Number(response.impliedHydrogenCount)===RETRIEVAL_ITEM.selectedHydrogenCount;
  }

  function submit(session,response,timestamp){
    if(!session||["cold","remediation_required"].indexOf(session.phase)===-1)return{accepted:false,correct:false,reason:"wrong_phase"};
    var correct=responseCorrect(response),at=timestamp||Date.now();
    session.attempts.push({itemId:"BL-R1",response:response,correct:correct,contaminated:session.contaminated,timestamp:at});

    if(!correct){
      if(!session.contaminated){
        session.skill.scaffoldLevel=Router.SCAFFOLD.COLD;
        Router.recordAttempt(session.skill,"BL-R1",false,"RETRIEVAL_MISS",at,response);
      }
      session.phase="remediation_required";
      session.events.push({type:"BONDLINE_RETRIEVAL_RESULT",itemId:"BL-R1",correct:false,contaminated:session.contaminated,timestamp:at});
      return{accepted:true,correct:false,countedAsIndependent:false,freshItemRequired:true,mastery:{mastered:false,reason:"retrieval not clean"}};
    }

    if(session.contaminated||Router.isRemediationActive(session.skill)||session.skill.scaffoldLevel!==Router.SCAFFOLD.COLD){
      Router.recordAttempt(session.skill,"BL-R1",true,null,at,response);
      session.events.push({type:"BONDLINE_RETRIEVAL_RESULT",itemId:"BL-R1",correct:true,contaminated:true,timestamp:at});
      session.phase="complete_supported";
      return{accepted:true,correct:true,countedAsIndependent:false,freshItemRequired:true,mastery:{mastered:false,reason:"retrieval was supported"}};
    }

    Router.recordIndependentAttempt(session.skill,"BL-R1",true,false,at,response);
    var mastery=Router.evaluateMastery(session.skill);
    session.phase=mastery.mastered?"mastered":"complete_not_mastered";
    session.events.push({type:"BONDLINE_RETRIEVAL_RESULT",itemId:"BL-R1",correct:true,contaminated:false,mastered:mastery.mastered,timestamp:at});
    return{accepted:true,correct:true,countedAsIndependent:true,mastery:mastery};
  }

  function requestHelp(session,reason,timestamp){
    if(!session||session.phase!=="cold")return{accepted:false,reason:"help_unavailable"};
    session.contaminated=true;
    var route=Router.handleIdk(session.skill,reason,"BL-R1","chem.representation.bond_line",timestamp);
    session.phase="remediation_required";
    return{accepted:true,countedAsIndependent:false,action:route.action,remediationActive:route.remediationActive};
  }

  function status(session){
    return{phase:session.phase,ready:readiness(session,Date.now()).ready,mastered:session.skill.state===Router.STATES.MASTERED,reviewDue:session.reviewDue};
  }

  return Object.freeze({RETRIEVAL_ITEM:RETRIEVAL_ITEM,createSession:createSession,registerInterveningActivity:registerInterveningActivity,readiness:readiness,begin:begin,submit:submit,requestHelp:requestHelp,status:status});
});
