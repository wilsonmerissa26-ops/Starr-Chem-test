'use strict';

/* ============================================================
   DAY 1 ADAPTIVE LEARNER RUNTIME

   Pure integration layer. Student Model owns learner evidence/state.
   Adaptive Math Model owns route planning and prerequisite graph.
   Prerequisite Content owns remediation teaching/checks.
   No DOM and no localStorage calls live here.
   ============================================================ */

var sm=require('./student-model-idk-router.js');
var math=require('./day1-adaptive-math-model.js');
var prereq=require('./math-prerequisite-content.js');

function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
function clone(v){return JSON.parse(JSON.stringify(v));}
function now(){return Date.now();}

function createLearnerState(opts){
  opts=opts||{};
  return{
    version:1,
    studentId:opts.studentId||null,
    skills:{},
    current:null,
    events:[],
    createdAt:opts.createdAt||now(),
    updatedAt:opts.createdAt||now()
  };
}

function restoreLearnerState(raw){
  if(!raw||typeof raw!=='object')return createLearnerState();
  var s=raw;
  s.version=s.version||1;
  s.skills=s.skills||{};
  s.events=Array.isArray(s.events)?s.events:[];
  s.current=s.current||null;
  s.createdAt=s.createdAt||now();
  s.updatedAt=s.updatedAt||now();
  return s;
}

function ensureSkill(state,id){
  if(!state.skills[id])state.skills[id]=sm.createSkill(id);
  return state.skills[id];
}

function fluencyOfSkill(skill){
  if(!skill)return 0;
  var attempts=(skill.attempts||[]).slice(-8);
  if(!attempts.length)return 0;
  var balance=attempts.reduce(function(sum,a){return sum+(a.correct?1:-1);},0);
  // Shrink small samples toward neutral so one answer can inform a tie but
  // cannot dominate route choice. Eight recent answers can approach ±0.8.
  var score=balance/(attempts.length+2);
  var cold=(skill.independentSuccesses||[]).filter(function(x){return x.scaffoldLevel===sm.SCAFFOLD.COLD&&x.correctExplanation;}).length;
  if(cold>=2)score=Math.max(score,0.85);
  return Math.round(clamp(score,-1,1)*1000)/1000;
}

function studentFluency(state){
  var out={};
  Object.keys(state.skills||{}).forEach(function(id){out[id]=fluencyOfSkill(state.skills[id]);});
  return out;
}

function event(state,type,data){
  state.events.push({type:type,data:data||null,timestamp:now()});
  if(state.events.length>200)state.events.shift();
  state.updatedAt=now();
}

function startProblem(state,problem){
  state=restoreLearnerState(state);
  var parentSkillId=problem.family||problem.area;
  ensureSkill(state,parentSkillId);
  var plan=math.planProblem(problem,{studentFluency:studentFluency(state)});
  state.current={
    problem:clone(problem),
    parentSkillId:parentSkillId,
    plan:plan,
    session:math.createSession({area:problem.area,problem:problem,activeSkillId:parentSkillId}),
    supportUsed:false,
    supportHistory:[],
    remediationOwnerSkillId:null,
    originalPrerequisiteSkillId:null,
    activePrerequisiteSkillId:null,
    prerequisiteSeen:{},
    activeCheckItemId:null
  };
  event(state,'PROBLEM_STARTED',{sourceId:problem.sourceId||null,skillId:parentSkillId,strategyId:plan.chosenStrategyId});
  return{state:state,plan:plan};
}

function requireCurrent(state){if(!state||!state.current)throw new Error('no active math problem');return state.current;}

function requestSupport(state,mode){
  var cur=requireCurrent(state);
  var result=math.supportFor(mode,cur.plan);
  cur.supportUsed=true;
  cur.supportHistory.push({mode:mode,strategyId:result.strategyId,timestamp:now()});
  event(state,'SUPPORT_USED',{mode:mode,sourceId:cur.problem.sourceId||null,strategyId:result.strategyId});
  return result;
}

function freshCheck(cur,skillId){
  var bank=prereq.getCheckBank(skillId),seen=cur.prerequisiteSeen[skillId]||[];
  var item=bank.find(function(x){return seen.indexOf(x.id)<0;})||null;
  if(item)cur.activeCheckItemId=item.id;
  return item;
}
function markCheckSeen(cur,skillId,itemId){
  if(!cur.prerequisiteSeen[skillId])cur.prerequisiteSeen[skillId]=[];
  if(cur.prerequisiteSeen[skillId].indexOf(itemId)<0)cur.prerequisiteSeen[skillId].push(itemId);
}

function openPrerequisiteRepair(state,prerequisiteSkillId,reason){
  var cur=requireCurrent(state);
  var owner=ensureSkill(state,cur.parentSkillId);
  if(!math.prerequisiteNode(prerequisiteSkillId))throw new Error('unknown prerequisite '+prerequisiteSkillId);
  sm.handleIdk(owner,reason,cur.problem.sourceId,prerequisiteSkillId,now());
  var descent=math.descendToPrerequisite(cur.session,owner,prerequisiteSkillId);
  if(descent.action!=='teach_prerequisite')return descent;
  ensureSkill(state,prerequisiteSkillId);
  cur.remediationOwnerSkillId=cur.parentSkillId;
  cur.originalPrerequisiteSkillId=prerequisiteSkillId;
  cur.activePrerequisiteSkillId=prerequisiteSkillId;
  var check=freshCheck(cur,prerequisiteSkillId);
  event(state,'PREREQUISITE_OPENED',{parentSkillId:cur.parentSkillId,prerequisiteSkillId:prerequisiteSkillId});
  return{action:'teach_prerequisite',skillId:prerequisiteSkillId,lesson:prereq.getLesson(prerequisiteSkillId),checkItem:check,intervention:owner.remediation.interventionType};
}

function submitPrerequisiteCheck(state,itemId,input){
  var cur=requireCurrent(state),skillId=cur.activePrerequisiteSkillId;
  if(!skillId)throw new Error('no active prerequisite');
  var bank=prereq.getCheckBank(skillId),item=bank.find(function(x){return x.id===itemId;});
  if(!item)throw new Error('unknown prerequisite check '+itemId+' for '+skillId);
  markCheckSeen(cur,skillId,itemId);
  var correct=!!item.check(input),activeSkill=ensureSkill(state,skillId);
  sm.recordAttempt(activeSkill,itemId,correct,correct?null:'PREREQUISITE_CHECK_WRONG',now(),input);
  var depth=cur.session.returnStack.length;
  var owner=ensureSkill(state,cur.remediationOwnerSkillId||cur.parentSkillId);

  if(correct){
    if(depth>1){
      var back=math.completePrerequisite(cur.session,skillId,true);
      cur.activePrerequisiteSkillId=cur.session.activeSkillId;
      var parentCheck=freshCheck(cur,cur.activePrerequisiteSkillId);
      event(state,'DEEP_PREREQUISITE_PASSED',{skillId:skillId,returnTo:cur.activePrerequisiteSkillId});
      return{correct:true,action:'return_to_parent_prerequisite',skillId:cur.activePrerequisiteSkillId,lesson:prereq.getLesson(cur.activePrerequisiteSkillId),nextCheckItem:parentCheck,return:back};
    }

    var gate=sm.recordRemediationCheck(owner,true,itemId,now());
    if(!gate.passed)throw new Error('Student Model refused a correct prerequisite check');
    var returned=math.completePrerequisite(cur.session,skillId,true);
    var resolved=sm.resolveRemediationAtCurrentItem(owner,cur.problem.sourceId);
    if(!resolved.allowed)throw new Error('same-problem remediation resolution failed: '+resolved.reason);
    cur.activePrerequisiteSkillId=null;
    cur.activeCheckItemId=null;
    event(state,'PREREQUISITE_RESOLVED',{skillId:skillId,sourceId:cur.problem.sourceId});
    return{correct:true,action:'return_to_parent_problem',problem:clone(cur.problem),return:returned};
  }

  // Wrong on the original prerequisite check feeds the Student Model's real
  // remediation gate and representation rotation.
  if(depth===1){
    var failed=sm.recordRemediationCheck(owner,false,itemId,now());
    if(failed.needsEscalation){
      var deeper=math.nextMissingDependency(skillId,studentFluency(state));
      if(deeper && cur.session.activePath.indexOf(deeper)<0){
        var descent=math.descendToPrerequisite(cur.session,activeSkill,deeper);
        if(descent.action==='teach_prerequisite'){
          cur.activePrerequisiteSkillId=deeper;
          ensureSkill(state,deeper);
          var deepCheck=freshCheck(cur,deeper);
          event(state,'PREREQUISITE_DESCENDED',{from:skillId,to:deeper});
          return{correct:false,action:'teach_deeper_prerequisite',skillId:deeper,lesson:prereq.getLesson(deeper),nextCheckItem:deepCheck,representation:failed.representation};
        }
      }
      var switched=prereq.getRepresentation(skillId,failed.representation);
      var nextAfterSwitch=freshCheck(cur,skillId);
      return{correct:false,action:nextAfterSwitch?'switch_representation':'prerequisite_bank_exhausted',representation:failed.representation,representationContent:switched,nextCheckItem:nextAfterSwitch};
    }
    var next=freshCheck(cur,skillId);
    return{correct:false,action:next?'retry_prerequisite':'prerequisite_bank_exhausted',representation:failed.representation,representationContent:prereq.getRepresentation(skillId,failed.representation),nextCheckItem:next};
  }

  // Deeper prerequisite failure is evidence on that prerequisite skill. Two
  // wrongs may descend one more graph level, but never re-enter an active path.
  if(activeSkill.consecutiveWrong>=2){
    var deeper2=math.nextMissingDependency(skillId,studentFluency(state));
    activeSkill.consecutiveWrong=0;
    if(deeper2 && cur.session.activePath.indexOf(deeper2)<0){
      var d2=math.descendToPrerequisite(cur.session,activeSkill,deeper2);
      if(d2.action==='teach_prerequisite'){
        cur.activePrerequisiteSkillId=deeper2;ensureSkill(state,deeper2);
        return{correct:false,action:'teach_deeper_prerequisite',skillId:deeper2,lesson:prereq.getLesson(deeper2),nextCheckItem:freshCheck(cur,deeper2)};
      }
    }
    var rep=sm.nextRepresentation(activeSkill);
    return{correct:false,action:'switch_representation',representation:rep,representationContent:prereq.getRepresentation(skillId,rep),nextCheckItem:freshCheck(cur,skillId)};
  }
  return{correct:false,action:'retry_prerequisite',nextCheckItem:freshCheck(cur,skillId)};
}

function recordCurrentAnswer(state,correct,input,opts){
  opts=opts||{};var cur=requireCurrent(state),skill=ensureSkill(state,cur.parentSkillId),ts=opts.timestamp||now();
  var independent=!!opts.independent && !cur.supportUsed && skill.scaffoldLevel===sm.SCAFFOLD.COLD;
  if(correct){
    if(independent)sm.recordIndependentAttempt(skill,cur.problem.sourceId,true,!!opts.correctExplanation,ts,input);
    else sm.recordAttempt(skill,cur.problem.sourceId,true,null,ts,input);
    event(state,'ANSWER_CORRECT',{sourceId:cur.problem.sourceId||null,independent:independent});
    return{correct:true,independent:independent,mastery:sm.evaluateMastery(skill)};
  }
  var wrong=sm.handleWrongAttempt(skill,cur.problem.sourceId,opts.errorCode||'WRONG',cur.problem.sourceId,ts,input);
  var first=(cur.plan.chosenPlan.steps||[])[0],suggested=first&&first.prerequisiteSkillIds&&first.prerequisiteSkillIds[0]||null;
  event(state,'ANSWER_WRONG',{sourceId:cur.problem.sourceId||null,action:wrong.action,suggestedPrerequisiteSkillId:suggested});
  return{correct:false,action:wrong.action,representation:wrong.representation||null,suggestedPrerequisiteSkillId:suggested};
}

function mastery(state,skillId){return sm.evaluateMastery(ensureSkill(state,skillId));}

module.exports={
  createLearnerState:createLearnerState,
  restoreLearnerState:restoreLearnerState,
  ensureSkill:ensureSkill,
  fluencyOfSkill:fluencyOfSkill,
  studentFluency:studentFluency,
  startProblem:startProblem,
  requestSupport:requestSupport,
  openPrerequisiteRepair:openPrerequisiteRepair,
  submitPrerequisiteCheck:submitPrerequisiteCheck,
  recordCurrentAnswer:recordCurrentAnswer,
  mastery:mastery
};
