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

console.log("=== SLICE 9 PURE CONTRACT ===");
var concept=Slice.CONCEPT_CHECK||null;
check("supported concept check exists",!!concept);
check("concept check is explicitly supported, not independent",!!concept&&concept.supported===true&&concept.evidenceKind!=="independent");
check("concept check has exactly four frozen statements",!!concept&&Array.isArray(concept.items)&&concept.items.length===4);
if(concept&&concept.items){
  check("item 1 freezes bond-line-is-not-carbon misconception",concept.items[0].statement==="Every bond line represents a carbon atom."&&concept.items[0].answer===false);
  check("item 2 freezes line-end rule",concept.items[1].statement==="An unlabeled line end usually represents carbon."&&concept.items[1].answer===true);
  check("item 3 freezes vertex rule",concept.items[2].statement==="An unlabeled vertex usually represents carbon."&&concept.items[2].answer===true);
  check("item 4 freezes implied carbon-hydrogen rule",concept.items[3].statement==="Hydrogens attached to carbon may be implied rather than written."&&concept.items[3].answer===true);
  check("each item has one narrow Watch remediation target",concept.items.every(function(item){return /^watch_step_[1-8]$/.test(item.revisitPhase||"");}));
}
var s=Slice.createSession(),before=s.evidence.length;
check("session initializes concept-check responses",Array.isArray(s.conceptCheckResponses)&&s.conceptCheckResponses.length===4);
check("pure runtime exposes concept-check submission",typeof Slice.submitConceptCheck==="function");
if(typeof Slice.submitConceptCheck==="function"&&concept){
  s.phase="concept_check";
  var wrong=Slice.submitConceptCheck(s,0,true);
  check("wrong concept answer requests only targeted Watch revisit",wrong&&wrong.accepted&&wrong.correct===false&&wrong.revisitPhase===concept.items[0].revisitPhase);
  check("wrong supported concept answer creates no mastery evidence",s.evidence.length===before);
  var right=Slice.submitConceptCheck(s,0,false);
  check("re-answering repaired statement is accepted",right&&right.accepted&&right.correct===true);
  Slice.submitConceptCheck(s,1,true);Slice.submitConceptCheck(s,2,true);var final=Slice.submitConceptCheck(s,3,true);
  check("4/4 correct completes concept check",final&&final.complete===true&&s.conceptCheckComplete===true);
  check("4/4 supported success still creates no mastery evidence",s.evidence.length===before);
}

console.log("\n=== SLICE 9 REAL LEARNER PAGE ===");
var dom=buildApp(),doc=reachStep8(dom);
byText(doc,"1").click();doc.getElementById("nextBtn").click();
check("Next after Watch Step 8 opens supported concept check",/concept check/i.test(doc.getElementById("phaseLabel").textContent));
check("all four frozen statements are visible",[
  "Every bond line represents a carbon atom.",
  "An unlabeled line end usually represents carbon.",
  "An unlabeled vertex usually represents carbon.",
  "Hydrogens attached to carbon may be implied rather than written."
].every(function(text){return doc.getElementById("lessonPanel").textContent.indexOf(text)!==-1;}));
check("concept check identifies itself as supported instruction",/supported/i.test(doc.getElementById("statusText").textContent+" "+doc.getElementById("lessonPanel").textContent));
check("Build Together cannot start before 4\/4 correct",doc.getElementById("nextBtn").disabled===true);
var firstTrue=doc.querySelector('[data-concept-item="0"] [data-answer="true"]');if(firstTrue)activate(firstTrue);
check("wrong statement routes to a narrow Watch revisit instead of replaying all Watch",/^Watch/i.test(doc.getElementById("phaseLabel").textContent)&&!/Step 1\b/.test(doc.getElementById("phaseLabel").textContent));
check("concept check adds no timer-driven advancement",read("course-units/unit1/bond-line/bond-line-app.js").indexOf("setTimeout(")===-1&&read("course-units/unit1/bond-line/bond-line-app.js").indexOf("setInterval(")===-1);
dom.window.close();
console.log("\n=== SUMMARY: "+(failed?"FAIL":"PASS")+" ===");if(failed)process.exit(1);
