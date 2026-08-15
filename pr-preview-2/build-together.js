/* ============================================================
   DR. MERISSA TEACHING ENGINE — PIECE 4: BUILD TOGETHER MODE
   Pure logic. No DOM. No rendering.

   LOCKED TRANSITION RULE, resolved after genuine ambiguity in the frozen
   spec's Section 10 wording: Build Together always starts from an EMPTY
   stage. Watch Mode's completed molecule is never carried forward into it,
   even though both modes teach the same molecule back to back. If Watch
   ended with NH3 fully assembled and Build Together opened with most of it
   already sitting there, she would only ever perform the tail end of a
   process she just watched, which weakens retrieval and production, the
   exact thing this whole engine exists to build. The fading ladder is
   I DO (Watch) -> WE DO (Build Together, empty stage, heavy prompting) ->
   YOU DO WITH SUPPORT (Guided, empty stage, lighter prompting) -> YOU DO
   ALONE (Build Alone, empty stage, no prompting). Every rung after Watch
   starts empty. Do not reintroduce pre-population here.
   ============================================================ */

var BUILD_STATUS = { READY:"READY", ACTIVE:"ACTIVE", COMPLETE:"COMPLETE" };
var ACTION = { PLACE_ATOM:"PLACE_ATOM", ADD_BOND:"ADD_BOND", ADD_LONE_PAIR:"ADD_LONE_PAIR" };

var BUILD_PLANS = {
  NH3: {
    id:"build_together_nh3_v1", skillId:"lewis_structures", molecule:"NH3",
    actions:[
      {id:"nh3_bt_1",type:ACTION.PLACE_ATOM,payload:{element:"N"},prompt:"You place nitrogen in the center.",confirmation:"Right. Nitrogen is the central atom."},
      {id:"nh3_bt_2",type:ACTION.PLACE_ATOM,payload:{element:"H"},prompt:"Now place the first hydrogen.",confirmation:"Good. Hydrogen stays on the outside."},
      {id:"nh3_bt_3",type:ACTION.PLACE_ATOM,payload:{element:"H"},prompt:"Place the second hydrogen.",confirmation:"Good. Keep going."},
      {id:"nh3_bt_4",type:ACTION.PLACE_ATOM,payload:{element:"H"},prompt:"Place the third hydrogen.",confirmation:"Now all four atoms are on the stage."},
      {id:"nh3_bt_5",type:ACTION.ADD_BOND,payload:{between:["N","H1"],order:1},prompt:"Connect nitrogen to the first hydrogen with one bond.",confirmation:"That bond accounts for 2 electrons."},
      {id:"nh3_bt_6",type:ACTION.ADD_BOND,payload:{between:["N","H2"],order:1},prompt:"Add the second N-H bond.",confirmation:"Four electrons are now in bonds."},
      {id:"nh3_bt_7",type:ACTION.ADD_BOND,payload:{between:["N","H3"],order:1},prompt:"Add the third N-H bond.",confirmation:"Six electrons are in bonds. Two are left."},
      {id:"nh3_bt_8",type:ACTION.ADD_LONE_PAIR,payload:{atom:"N",count:1},prompt:"Place the remaining pair where it belongs.",confirmation:"Exactly. One lone pair on nitrogen accounts for the last 2 electrons."}
    ]
  },
  H2O: {
    id:"build_together_h2o_v1", skillId:"lewis_structures", molecule:"H2O",
    actions:[
      {id:"h2o_bt_1",type:ACTION.PLACE_ATOM,payload:{element:"O"},prompt:"You place oxygen in the center.",confirmation:"Right. Oxygen is the central atom here."},
      {id:"h2o_bt_2",type:ACTION.PLACE_ATOM,payload:{element:"H"},prompt:"Place the first hydrogen.",confirmation:"Good."},
      {id:"h2o_bt_3",type:ACTION.PLACE_ATOM,payload:{element:"H"},prompt:"Place the second hydrogen.",confirmation:"All three atoms are on the stage."},
      {id:"h2o_bt_4",type:ACTION.ADD_BOND,payload:{between:["O","H1"],order:1},prompt:"Connect oxygen to the first hydrogen.",confirmation:"One bond uses 2 electrons."},
      {id:"h2o_bt_5",type:ACTION.ADD_BOND,payload:{between:["O","H2"],order:1},prompt:"Add the second O-H bond.",confirmation:"Two bonds use 4 electrons. Four electrons remain."},
      {id:"h2o_bt_6",type:ACTION.ADD_LONE_PAIR,payload:{atom:"O",count:1},prompt:"Place one lone pair on the atom that still needs electrons.",confirmation:"Yes. Oxygen still needs one more pair."},
      {id:"h2o_bt_7",type:ACTION.ADD_LONE_PAIR,payload:{atom:"O",count:1},prompt:"Place the final lone pair.",confirmation:"Exactly. Oxygen now has two bonds and two lone pairs."}
    ]
  }
};

function clone(x){ return JSON.parse(JSON.stringify(x)); }

function elementOfLabel(label){
  var m = /^([A-Za-z]+)\d*$/.exec(label);
  return m ? m[1] : label;
}

// A label used in more than one bond across the whole plan is a central atom
// (N appears in every N-H bond). Only non-central labels get checked for
// reuse, otherwise the central atom would falsely look "already used" the
// moment the first bond is confirmed, and every later bond would reject.
function centralLabelsOf(plan){
  var counts = {};
  plan.actions.forEach(function(a){
    if (a.type === ACTION.ADD_BOND) {
      a.payload.between.forEach(function(l){ counts[l] = (counts[l]||0) + 1; });
    }
  });
  var central = {};
  Object.keys(counts).forEach(function(l){ if (counts[l] > 1) central[l] = true; });
  return central;
}

// The full set of real atom-instance labels this plan's molecule actually
// has, drawn from every ADD_BOND and ADD_LONE_PAIR payload in the plan. Any
// submitted label outside this set gets rejected regardless of whether it
// superficially looks like the right element, "H99" reads as hydrogen to
// elementOfLabel but no such atom was ever placed in this molecule.
function validInstanceLabelsOf(plan){
  var labels = {};
  plan.actions.forEach(function(a){
    if (a.type === ACTION.ADD_BOND) {
      a.payload.between.forEach(function(l){ labels[l] = true; });
    }
    if (a.type === ACTION.ADD_LONE_PAIR) {
      labels[a.payload.atom] = true;
    }
  });
  return labels;
}

// Chemically, which specific hydrogen she bonds first never matters, NH3's
// three hydrogens are interchangeable. This checks element types and bond
// order match, that the submitted labels are real atoms in this molecule,
// not fabricated ones, and that whichever real instance she picked hasn't
// already been used, rather than requiring the exact instance label the
// plan happened to write down for this step.
function samePayload(expected, actual, type, usedInstanceLabels, central, validLabels){
  actual = actual || {};
  if(type===ACTION.PLACE_ATOM) return actual.element===expected.element;

  if(type===ACTION.ADD_BOND){
    if(!Array.isArray(actual.between)||actual.between.length!==2) return false;
    if((actual.order==null?1:actual.order)!==expected.order) return false;

    if (validLabels) {
      var allReal = actual.between.every(function(l){ return !!validLabels[l]; });
      if (!allReal) return false;
    }

    var expEl = expected.between.map(elementOfLabel).sort();
    var actEl = actual.between.map(elementOfLabel).sort();
    if(expEl[0]!==actEl[0] || expEl[1]!==actEl[1]) return false;

    var outerLabels = actual.between.filter(function(l){ return !(central && central[l]); });
    var reused = outerLabels.some(function(l){ return (usedInstanceLabels||[]).indexOf(l) > -1; });
    return !reused;
  }

  if(type===ACTION.ADD_LONE_PAIR){
    if (validLabels && !validLabels[actual.atom]) return false;
    return actual.atom===expected.atom && (actual.count==null?1:actual.count)===expected.count;
  }
  return false;
}

function validatePlan(plan){
  if(!plan||!Array.isArray(plan.actions)||plan.actions.length===0) return {valid:false,reason:"missing_actions"};
  var seen={};
  for(var i=0;i<plan.actions.length;i++){
    var a=plan.actions[i];
    if(!a.id||seen[a.id]) return {valid:false,reason:"duplicate_or_missing_action_id"};
    seen[a.id]=true;
    if(!Object.keys(ACTION).some(function(k){return ACTION[k]===a.type;})) return {valid:false,reason:"unknown_action_type"};
    if(!a.payload||!a.prompt||!a.confirmation) return {valid:false,reason:"incomplete_action"};
  }
  return {valid:true,reason:null};
}

function createBuildTogetherSession(plan, options){
  var check=validatePlan(plan); if(!check.valid) throw new Error("Invalid Build Together plan: "+check.reason);
  options=options||{};
  return {
    planId:plan.id,skillId:plan.skillId,molecule:plan.molecule,
    status:BUILD_STATUS.READY,currentIndex:0,attempts:[],
    correctActionIds:[],wrongAttemptsOnCurrentAction:0,
    usedBondInstanceLabels:[],
    completed:false,startedAt:options.timestamp||Date.now(),completedAt:null
  };
}

function currentAction(session,plan){ return clone(plan.actions[session.currentIndex]); }

function currentPrompt(session,plan){
  var a=currentAction(session,plan);
  return {
    status:session.status,completed:session.completed,
    stepNumber:session.currentIndex+1,totalSteps:plan.actions.length,
    actionId:a.id,expectedType:a.type,prompt:a.prompt
  };
}

function begin(session,plan,timestamp){
  if(session.completed) return {changed:false,reason:"already_complete",prompt:null};
  session.status=BUILD_STATUS.ACTIVE;
  return {
    changed:true,reason:null,prompt:currentPrompt(session,plan),
    event:{type:"BUILD_TOGETHER_STARTED",planId:plan.id,timestamp:timestamp||Date.now()}
  };
}

function diagnoseWrongAction(expected,studentAction){
  if(!studentAction||!studentAction.type)
    return {code:"NO_ACTION",message:"Nothing was placed yet. Do the one move Dr. Merissa asked for, then check it."};
  if(studentAction.type!==expected.type)
    return {code:"WRONG_ACTION_TYPE",message:"That is a different kind of move. Stay with this one step before moving ahead."};
  if(expected.type===ACTION.PLACE_ATOM)
    return {code:"WRONG_ATOM",message:"Check the element Dr. Merissa asked you to place for this step."};
  if(expected.type===ACTION.ADD_BOND)
    return {code:"WRONG_BOND",message:"Check which two atoms this step asked you to connect. Nothing else changes yet."};
  if(expected.type===ACTION.ADD_LONE_PAIR)
    return {code:"WRONG_LONE_PAIR_LOCATION",message:"Check which atom still needs the electron pair. Don't change the bonds."};
  return {code:"ACTION_MISMATCH",message:"That move doesn't match this step yet."};
}

function submitAction(session,plan,studentAction,timestamp){
  if(session.completed) return {accepted:false,advanced:false,reason:"already_complete",prompt:null};
  if(session.status===BUILD_STATUS.READY) begin(session,plan,timestamp);

  var expected=plan.actions[session.currentIndex];
  var actualType=studentAction&&studentAction.type;
  var central=centralLabelsOf(plan);
  var validLabels=validInstanceLabelsOf(plan);
  var correct=actualType===expected.type && samePayload(expected.payload,studentAction.payload,expected.type,session.usedBondInstanceLabels,central,validLabels);

  session.attempts.push({
    actionId:expected.id,
    expectedType:expected.type,
    submittedType:actualType||null,
    submittedPayload:studentAction&&studentAction.payload?clone(studentAction.payload):null,
    correct:correct,
    timestamp:timestamp||Date.now()
  });

  if(!correct){
    session.wrongAttemptsOnCurrentAction+=1;
    return {
      accepted:true,correct:false,advanced:false,reason:"wrong_action",
      error:diagnoseWrongAction(expected,studentAction),
      wrongAttemptsOnCurrentAction:session.wrongAttemptsOnCurrentAction,
      prompt:currentPrompt(session,plan)
    };
  }

  if(expected.type===ACTION.ADD_BOND && studentAction.payload && Array.isArray(studentAction.payload.between)){
    studentAction.payload.between.forEach(function(l){
      if(!central[l] && session.usedBondInstanceLabels.indexOf(l)===-1) session.usedBondInstanceLabels.push(l);
    });
  }

  session.correctActionIds.push(expected.id);
  session.wrongAttemptsOnCurrentAction=0;
  var confirmation=expected.confirmation;

  if(session.currentIndex>=plan.actions.length-1){
    session.completed=true;
    session.status=BUILD_STATUS.COMPLETE;
    session.completedAt=timestamp||Date.now();
    return {
      accepted:true,correct:true,advanced:true,completed:true,reason:"completed",
      confirmation:confirmation,prompt:null,
      completion:{
        type:"BUILD_TOGETHER_COMPLETED",planId:plan.id,skillId:plan.skillId,
        molecule:plan.molecule,completedAt:session.completedAt
      }
    };
  }

  session.currentIndex+=1;
  return {
    accepted:true,correct:true,advanced:true,completed:false,reason:null,
    confirmation:confirmation,prompt:currentPrompt(session,plan)
  };
}

function interventionSignal(session){
  if(session.completed||session.wrongAttemptsOnCurrentAction<2) return null;
  return {
    type:"BUILD_TOGETHER_STUCK",
    skillId:session.skillId,
    molecule:session.molecule,
    actionId:session.planId+":"+session.currentIndex,
    consecutiveWrongOnStep:session.wrongAttemptsOnCurrentAction,
    requestedAction:"SWITCH_REPRESENTATION"
  };
}

function completionEvent(session){
  if(!session.completed) return null;
  return {
    type:"BUILD_TOGETHER_COMPLETED",
    planId:session.planId,skillId:session.skillId,
    molecule:session.molecule,completedAt:session.completedAt
  };
}

var BuildTogether = {
    BUILD_STATUS:BUILD_STATUS,ACTION:ACTION,BUILD_PLANS:BUILD_PLANS,
    validatePlan:validatePlan,createBuildTogetherSession:createBuildTogetherSession,
    currentAction:currentAction,currentPrompt:currentPrompt,begin:begin,
    submitAction:submitAction,diagnoseWrongAction:diagnoseWrongAction,
    interventionSignal:interventionSignal,completionEvent:completionEvent
  };
if(typeof module!=="undefined" && module.exports) module.exports=BuildTogether;
if(typeof globalThis!=="undefined") globalThis.BuildTogether=BuildTogether;
