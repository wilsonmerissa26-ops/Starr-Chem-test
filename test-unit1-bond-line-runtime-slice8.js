"use strict";

var fs=require("fs"),path=require("path"),JSDOM=require("jsdom").JSDOM;
var Slice=require("./course-units/unit1/bond-line/bond-line-slice1.js");
var failed=0;
function check(label,condition){if(condition)console.log("PASS  "+label);else{console.log("FAIL  "+label);failed++;}}
function read(rel){return fs.readFileSync(path.join(__dirname,rel),"utf8");}
function evalFile(win,rel){win.eval(read(rel)+"\n//# sourceURL="+rel);}
function byText(root,text){return Array.prototype.slice.call(root.querySelectorAll("button")).find(function(b){return b.textContent.trim()===text;})||null;}
function activate(node){var w=node.ownerDocument.defaultView;node.dispatchEvent(new w.MouseEvent("click",{bubbles:true,cancelable:true}));}
function animationEnd(node,name){var w=node.ownerDocument.defaultView,e=new w.Event("animationend",{bubbles:true});Object.defineProperty(e,"animationName",{value:name});node.dispatchEvent(e);}
function buildApp(){
  var dom=new JSDOM(read("course-units/unit1/bond-line/index.html"),{runScripts:"outside-only",pretendToBeVisual:true,url:"https://example.test/course-units/unit1/bond-line/"});
  dom.window.matchMedia=function(q){return{matches:false,media:q,addListener:function(){},removeListener:function(){},addEventListener:function(){},removeEventListener:function(){},dispatchEvent:function(){return true;}};};
  Object.defineProperty(dom.window,"speechSynthesis",{configurable:true,value:{cancel:function(){},speak:function(){}}});
  dom.window.SpeechSynthesisUtterance=function(t){this.text=t;};
  evalFile(dom.window,"watch-mode.js");evalFile(dom.window,"unit1-skill-registry.js");evalFile(dom.window,"course-units/unit1/bond-line/bond-line-slice1.js");evalFile(dom.window,"course-units/unit1/bond-line/bond-line-app.js");
  return dom;
}
function reachStep8(dom){
  var d=dom.window.document;
  byText(d,"The drawing may be using a shortcut.").click();byText(d,"4").click();byText(d,"A covalent bond").click();
  ["C1","C2","C3","C4"].forEach(function(id){activate(d.querySelector('[data-carbon-id="'+id+'"]'));});d.getElementById("nextBtn").click();
  byText(d,"No").click();d.getElementById("nextBtn").click();byText(d,"3").click();d.getElementById("nextBtn").click();
  animationEnd(d.querySelector('[data-step4-label="C2"]'),"step4HideCarbon");byText(d,"No, the corner now stands for the carbon").click();animationEnd(d.querySelector('[data-step4-label="C4"]'),"step4HideCarbon");d.getElementById("nextBtn").click();
  ["C1","C2","C3","C4"].forEach(function(id){activate(d.querySelector('[data-step5-carbon="'+id+'"]'));});d.getElementById("nextBtn").click();
  byText(d,"2").click();byText(d,"3").click();d.getElementById("nextBtn").click();byText(d,"No").click();d.getElementById("nextBtn").click();
  return d;
}

console.log("=== SLICE 8 PURE CONTRACT ===");
check("Watch sequence exposes an eighth step",Slice.WATCH_SEQUENCE.steps.length>=8);
var step=Slice.WATCH_SEQUENCE.steps[7]||null;
check("Step 8 has stable identity",!!step&&step.id==="bl_watch_8");
check("Step 8 preserves multiple bond order",!!step&&step.visual&&step.visual.representation==="multiple_bond_visible"&&step.visual.doubleBondOrder===2);
check("Step 8 narration says shortcut does not erase bond order",!!step&&/does not erase bond order/i.test(step.narration||"")&&/double bond/i.test(step.narration||"")&&/triple bond/i.test(step.narration||""));
check("Step 8 prompt is frozen",!!step&&step.interaction&&step.interaction.prompt==="This carbon already has bond order 3: one single bond plus one double bond. How many C—H bonds are implied?");
check("Step 8 answer is one implied hydrogen",!!step&&step.interaction&&step.interaction.answer===1);
check("neighbor-count misconception feedback is frozen",!!step&&step.interaction&&step.interaction.neighborCountFeedback==="You counted two neighboring atoms, which is useful, but hydrogen counting depends on bond order. The double bond contributes 2 and the single bond contributes 1. That gives 3 already, leaving room for only one hydrogen.");
var s=Slice.createSession();
check("session initializes Step 8 response empty",s.watchStep8Response===null);
check("session initializes Step 8 incomplete",s.watchStep8Complete===false);
check("pure runtime exposes Step 8 submission",typeof Slice.submitWatchStep8Hydrogen==="function");
if(typeof Slice.submitWatchStep8Hydrogen==="function"){
  s.phase="watch_step_8";var before=s.evidence.length;
  var two=Slice.submitWatchStep8Hydrogen(s,2);
  check("answer 2 triggers neighbor-vs-bond-order repair",two&&two.accepted&&two.correct===false&&two.feedback===step.interaction.neighborCountFeedback&&s.watchStep8Complete===false);
  check("wrong supported answer creates no mastery evidence",s.evidence.length===before);
  var one=Slice.submitWatchStep8Hydrogen(s,1);
  check("answer 1 completes supported Step 8",one&&one.accepted&&one.correct===true&&s.watchStep8Complete===true);
  check("correct supported answer creates no mastery evidence",s.evidence.length===before);
}

console.log("\n=== SLICE 8 REAL LEARNER PAGE ===");
var dom=buildApp(),doc=reachStep8(dom);
check("Next from Step 7 opens Step 8",/Step 8/i.test(doc.getElementById("phaseLabel").textContent));
check("Step 8 renders a multiple-bond visual",!!doc.querySelector("[data-step8-visual]"));
check("Step 8 renders two parallel lines for the C=C bond",doc.querySelectorAll("[data-step8-double-bond] line").length===2);
check("Step 8 visibly asks bond-order-3 question",doc.getElementById("lessonPanel").textContent.indexOf("This carbon already has bond order 3: one single bond plus one double bond. How many C—H bonds are implied?")!==-1);
check("Next is gated before interaction",doc.getElementById("nextBtn").disabled===true);
var twoButton=byText(doc,"2");if(twoButton)twoButton.click();
check("neighbor-count error shows exact bond-order correction",doc.getElementById("lessonPanel").textContent.indexOf("The double bond contributes 2 and the single bond contributes 1.")!==-1);
check("wrong answer keeps Next gated",doc.getElementById("nextBtn").disabled===true);
var oneButton=byText(doc,"1");if(oneButton)oneButton.click();
check("correct answer enables learner-controlled Next",doc.getElementById("nextBtn").disabled===false);
check("Step 8 adds no timer-driven advancement",read("course-units/unit1/bond-line/bond-line-app.js").indexOf("setTimeout(")===-1&&read("course-units/unit1/bond-line/bond-line-app.js").indexOf("setInterval(")===-1);
dom.window.close();
console.log("\n=== SUMMARY: "+(failed?"FAIL":"PASS")+" ===");if(failed)process.exit(1);
