"use strict";

var fs=require("fs"),path=require("path"),JSDOM=require("jsdom").JSDOM;
var adapterPath="./course-units/unit1/bond-line/bond-line-guided.js";
var Guided=fs.existsSync(path.join(__dirname,adapterPath))?require(adapterPath):null;
var failed=0;
function check(label,condition){if(condition)console.log("PASS  "+label);else{console.log("FAIL  "+label);failed++;}}
function read(rel){return fs.readFileSync(path.join(__dirname,rel),"utf8");}
function evalFile(win,rel){win.eval(read(rel)+"\n//# sourceURL="+rel);}
function byText(root,text){return Array.prototype.slice.call(root.querySelectorAll("button")).find(function(b){return b.textContent.trim()===text;})||null;}
function activate(node){var w=node.ownerDocument.defaultView;node.dispatchEvent(new w.MouseEvent("click",{bubbles:true,cancelable:true}));}
function tap(node,x,y){var w=node.ownerDocument.defaultView,e=new w.MouseEvent("click",{bubbles:true,cancelable:true});Object.defineProperty(e,"offsetX",{value:x});Object.defineProperty(e,"offsetY",{value:y});node.dispatchEvent(e);}

console.log("=== SLICE 11 PURE GUIDED CONTRACT ===");
check("Guided adapter exists",!!Guided);
if(Guided){
  check("fresh Guided molecule is 2-methylbutane",Guided.GUIDED_TASK&&Guided.GUIDED_TASK.molecule==="2-methylbutane"&&Guided.GUIDED_TASK.formula==="CH3CH(CH3)CH2CH3");
  check("Guided is supported and never independent evidence",Guided.GUIDED_TASK.supported===true&&Guided.GUIDED_TASK.evidenceKind==="guided");
  var s=Guided.createSession();
  check("Guided begins at atom inventory with explicit support",s.phase==="atom_inventory"&&s.scaffoldLevel===3&&s.supportFaded===false&&s.cleanDecisionStreak===0);
  var hint=Guided.requestHint(s);
  check("hint is learner-requested and contaminates only current guided item",hint.accepted===true&&hint.itemSupported===true&&/including the one inside parentheses/i.test(hint.text));
  var a=Guided.submitAtomCount(s,5);
  check("five carbons advances to connectivity",a.correct===true&&s.phase==="connectivity"&&s.cleanDecisionStreak===1);
  var b=Guided.submitBranchHost(s,2);
  check("second clean guided decision fades support",b.correct===true&&s.phase==="build_skeleton"&&s.cleanDecisionStreak===2&&s.supportFaded===true&&s.scaffoldLevel===2);
  check("fade removes numbered setup tokens and directives but keeps on-demand hints",Guided.viewPolicy(s).showNumberedTokens===false&&Guided.viewPolicy(s).directivePrompts===false&&Guided.viewPolicy(s).hintAvailable===true);
  var build=Guided.submitSkeleton(s,{nodes:["C1","C2","C3","C4","B1"],edges:[["C1","C2"],["C2","C3"],["C3","C4"],["C2","B1"]]});
  check("correct 5-carbon branched topology advances to hydrogen task",build.correct===true&&s.phase==="hydrogen_inference");
  var done=Guided.submitBranchedHydrogen(s,1);
  check("branched carbon has one implied hydrogen",done.correct===true&&done.complete===true&&s.phase==="complete");
  check("Guided completion logs supported success only",s.events.some(function(e){return e.type==="GUIDED_SUCCESS"&&e.supported===true&&e.evidenceKind==="guided";})&&!Object.prototype.hasOwnProperty.call(s,"evidence"));

  var repair=Guided.createSession();Guided.submitAtomCount(repair,5);
  var wrong=Guided.submitBranchHost(repair,3);
  check("wrong branch host opens visual connectivity repair and resets clean streak",wrong.correct===false&&wrong.repairRequired===true&&repair.phase==="connectivity_repair"&&repair.cleanDecisionStreak===0);
  check("repair explicitly maps host and branch without floating parentheses",/atom immediately before the parentheses/i.test(Guided.connectivityRepair().explanation)&&Guided.connectivityRepair().hostFormulaCarbon===2&&Guided.connectivityRepair().hostSkeletonCarbon===2);
  var oneTap=Guided.submitRepairMapping(repair,2,3);
  check("repair requires both formula and skeleton host taps to be carbon 2",oneTap.correct===false&&repair.phase==="connectivity_repair");
  var repaired=Guided.submitRepairMapping(repair,2,2);
  check("successful mapping returns without counting as a clean fade decision",repaired.correct===true&&repair.phase==="build_skeleton"&&repair.cleanDecisionStreak===0&&repair.supportFaded===false);
  var extraMid=Guided.submitSkeleton(repair,{nodes:["C1","C2","C3","C4","B1"],edges:[["C1","C2"],["C2","C3"],["C3","C4"],["C3","B1"]]});
  check("branch on wrong carbon is rejected",extraMid.correct===false&&extraMid.code==="WRONG_BRANCH_HOST");
}

console.log("\n=== SLICE 11 SOURCE/UI CONTRACT ===");
var uiPath="course-units/unit1/bond-line/bond-line-guided-ui.js";
check("Guided UI exists",fs.existsSync(path.join(__dirname,uiPath)));
if(fs.existsSync(path.join(__dirname,uiPath))){
  var src=read(uiPath);
  check("Guided UI has no timer-driven advancement",src.indexOf("setTimeout(")===-1&&src.indexOf("setInterval(")===-1);
  check("Guided UI exposes learner-requested Hint control",/Hint/.test(src)&&/requestHint/.test(src));
  check("Guided UI renders host and branch markers for connectivity repair",/host/i.test(src)&&/branch/i.test(src)&&/renderRepair/.test(src)&&/submitRepairMapping/.test(src));
  check("Guided UI contains empty-stage branched skeleton builder",/data-guided-canvas/.test(src)&&/data-guided-carbon/.test(src));
  check("Guided UI ends at cold Independent boundary",/Independent/.test(src)&&/cold/i.test(src));
}

console.log("\n=== SUMMARY: "+(failed?"FAIL":"PASS")+" ===");if(failed)process.exit(1);
