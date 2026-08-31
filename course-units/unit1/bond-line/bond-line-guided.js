/* U1-01 Guided Practice adapter: 2-methylbutane. Pure state, no DOM. */
(function(root,factory){
  var api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  else root.BondLineGuided=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";

  var GUIDED_TASK=Object.freeze({
    id:"bond_line_guided_2_methylbutane_v1",
    lessonId:"chm221.u1.01",
    skillId:"chem.representation.bond_line",
    molecule:"2-methylbutane",
    formula:"CH3CH(CH3)CH2CH3",
    supported:true,
    evidenceKind:"guided"
  });

  function createSession(){
    return {
      lessonId:GUIDED_TASK.lessonId,skillId:GUIDED_TASK.skillId,molecule:GUIDED_TASK.molecule,
      supported:true,evidenceKind:"guided",phase:"atom_inventory",scaffoldLevel:3,
      supportFaded:false,cleanDecisionStreak:0,currentItemSupported:true,hintsRequested:[],
      correctiveReveals:0,atomCount:null,branchHost:null,repairAttempts:[],skeletonAttempts:[],
      branchedHydrogen:null,events:[]
    };
  }

  function recordDecision(session,correct,correctiveReveal){
    if(!correct||correctiveReveal){session.cleanDecisionStreak=0;return;}
    session.cleanDecisionStreak+=1;
    if(session.cleanDecisionStreak>=2){session.supportFaded=true;session.scaffoldLevel=2;}
  }

  function viewPolicy(session){
    return {
      scaffoldLevel:session.scaffoldLevel,
      showNumberedTokens:!session.supportFaded,
      directivePrompts:!session.supportFaded,
      hintAvailable:true,
      notebookAvailable:true,
      cold:false
    };
  }

  function requestHint(session){
    if(!session||session.phase==="complete")return{accepted:false,reason:"unavailable"};
    var text="Help is available for this step.";
    if(session.phase==="atom_inventory")text="Count every written C, including the one inside parentheses.";
    else if(session.phase==="connectivity")text="The group in parentheses attaches to the atom immediately before the parentheses.";
    else if(session.phase==="build_skeleton")text="Preserve the four-carbon main sequence, then attach the fifth carbon as a branch to the correct host carbon.";
    else if(session.phase==="hydrogen_inference")text="Count the visible bond order on the branched carbon first, then ask how many more bonds carbon needs to reach four.";
    session.hintsRequested.push({phase:session.phase,text:text});
    session.currentItemSupported=true;
    return{accepted:true,itemSupported:true,text:text};
  }

  function submitAtomCount(session,value){
    if(!session||session.phase!=="atom_inventory")return{accepted:false,correct:false,reason:"wrong_phase"};
    var n=Number(value);session.atomCount=n;
    if(n!==5){recordDecision(session,false,false);return{accepted:true,correct:false,feedback:"Count every written C in the full condensed formula, including inside parentheses."};}
    recordDecision(session,true,false);session.phase="connectivity";
    return{accepted:true,correct:true,nextPhase:session.phase,feedback:"Right. There are five carbon atoms total."};
  }

  function connectivityRepair(){
    return Object.freeze({
      boxedSubstring:"CH(CH3)",hostFormulaCarbon:2,hostSkeletonCarbon:2,branchCarbon:"B1",
      explanation:"Parentheses do not create a separate floating piece. The group inside the parentheses is attached to the atom immediately before the parentheses. Here the branch CH3 attaches to the host CH, carbon 2 in the main sequence."
    });
  }

  function submitBranchHost(session,value){
    if(!session||session.phase!=="connectivity")return{accepted:false,correct:false,reason:"wrong_phase"};
    var n=Number(value);session.branchHost=n;
    if(n!==2){
      recordDecision(session,false,true);session.correctiveReveals+=1;session.phase="connectivity_repair";
      return{accepted:true,correct:false,repairRequired:true,nextPhase:session.phase,repair:connectivityRepair(),feedback:"Let's map the parentheses to the host carbon visually."};
    }
    recordDecision(session,true,false);session.phase="build_skeleton";
    return{accepted:true,correct:true,nextPhase:session.phase,supportFaded:session.supportFaded,feedback:"Correct. The branch is attached to carbon 2."};
  }

  function submitRepairMapping(session,formulaHost,skeletonHost){
    if(!session||session.phase!=="connectivity_repair")return{accepted:false,correct:false,reason:"wrong_phase"};
    var attempt={formulaHost:Number(formulaHost),skeletonHost:Number(skeletonHost)};session.repairAttempts.push(attempt);
    if(attempt.formulaHost!==2||attempt.skeletonHost!==2){
      return{accepted:true,correct:false,freshExampleRequired:true,feedback:"Keep the host and branch markers visible. The host must match in both representations before we return."};
    }
    session.phase="build_skeleton";session.cleanDecisionStreak=0;
    return{accepted:true,correct:true,nextPhase:session.phase,feedback:"Yes. Carbon 2 is the same host in the formula and the skeleton. Now build the molecule."};
  }

  function edgeKey(edge){return edge.slice().sort().join("~");}
  function submitSkeleton(session,model){
    if(!session||session.phase!=="build_skeleton")return{accepted:false,correct:false,reason:"wrong_phase"};
    model=model||{};var nodes=Array.isArray(model.nodes)?model.nodes.slice():[];var edges=Array.isArray(model.edges)?model.edges.slice():[];
    session.skeletonAttempts.push({nodes:nodes.slice(),edges:edges.map(function(e){return e.slice();}),placedAtBondCenter:!!model.placedAtBondCenter});
    if(model.placedAtBondCenter){recordDecision(session,false,false);return{accepted:true,correct:false,code:"CARBON_AT_BOND_CENTER",feedback:"A bond center is the connection between carbons, not another carbon position."};}
    if(nodes.length!==5||new Set(nodes).size!==5){recordDecision(session,false,false);return{accepted:true,correct:false,code:"CARBON_COUNT",feedback:"The skeleton must contain exactly five carbon positions."};}
    var allowed=["C1","C2","C3","C4","B1"];
    if(nodes.some(function(n){return allowed.indexOf(n)===-1;})){recordDecision(session,false,false);return{accepted:true,correct:false,code:"UNKNOWN_CARBON",feedback:"Use the four main-sequence carbons plus one branch carbon."};}
    var keys=edges.map(edgeKey);
    var expected=[edgeKey(["C1","C2"]),edgeKey(["C2","C3"]),edgeKey(["C3","C4"]),edgeKey(["C2","B1"])];
    var branchEdge=keys.find(function(k){return k.indexOf("B1")!==-1;});
    if(branchEdge!==edgeKey(["C2","B1"])){recordDecision(session,false,false);return{accepted:true,correct:false,code:"WRONG_BRANCH_HOST",feedback:"The branch carbon must attach to carbon 2, the CH immediately before the parentheses."};}
    if(keys.length!==4||expected.some(function(k){return keys.indexOf(k)===-1;})){recordDecision(session,false,false);return{accepted:true,correct:false,code:"WRONG_CONNECTIVITY",feedback:"Five carbons is not enough by itself. Preserve the four-carbon main sequence and the branch on carbon 2."};}
    recordDecision(session,true,false);session.phase="hydrogen_inference";
    return{accepted:true,correct:true,nextPhase:session.phase,feedback:"Correct topology: five carbons total with the branch attached to carbon 2."};
  }

  function submitBranchedHydrogen(session,value){
    if(!session||session.phase!=="hydrogen_inference")return{accepted:false,correct:false,reason:"wrong_phase"};
    var n=Number(value);session.branchedHydrogen=n;
    if(n!==1){recordDecision(session,false,false);return{accepted:true,correct:false,complete:false,feedback:"Count the three visible C–C single bonds first. Carbon reaches four total bonds."};}
    recordDecision(session,true,false);session.phase="complete";
    session.events.push({type:"GUIDED_SUCCESS",lessonId:session.lessonId,skillId:session.skillId,molecule:session.molecule,supported:true,evidenceKind:"guided",scaffoldLevel:session.scaffoldLevel});
    return{accepted:true,correct:true,complete:true,nextPhase:session.phase,feedback:"Three visible single bonds give bond order 3. Carbon reaches four with one C–H bond."};
  }

  return Object.freeze({GUIDED_TASK:GUIDED_TASK,createSession:createSession,viewPolicy:viewPolicy,requestHint:requestHint,connectivityRepair:connectivityRepair,submitAtomCount:submitAtomCount,submitBranchHost:submitBranchHost,submitRepairMapping:submitRepairMapping,submitSkeleton:submitSkeleton,submitBranchedHydrogen:submitBranchedHydrogen});
});
