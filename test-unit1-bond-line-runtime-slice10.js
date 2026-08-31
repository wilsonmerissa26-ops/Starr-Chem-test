"use strict";

var fs=require("fs"),path=require("path"),JSDOM=require("jsdom").JSDOM;
var B=require("./build-together.js");
var adapterPath="./course-units/unit1/bond-line/bond-line-build-together.js";
var Adapter=fs.existsSync(path.join(__dirname,adapterPath))?require(adapterPath):null;
var failed=0;
function check(label,condition){if(condition)console.log("PASS  "+label);else{console.log("FAIL  "+label);failed++;}}
function read(rel){return fs.readFileSync(path.join(__dirname,rel),"utf8");}
function evalFile(win,rel){win.eval(read(rel)+"\n//# sourceURL="+rel);}
function byText(root,text){return Array.prototype.slice.call(root.querySelectorAll("button")).find(function(b){return b.textContent.trim()===text;})||null;}
function activate(node){var w=node.ownerDocument.defaultView;node.dispatchEvent(new w.MouseEvent("click",{bubbles:true,cancelable:true}));}
function canvasTap(node,x,y){var w=node.ownerDocument.defaultView,e=new w.MouseEvent("click",{bubbles:true,cancelable:true});Object.defineProperty(e,"offsetX",{value:x});Object.defineProperty(e,"offsetY",{value:y});node.dispatchEvent(e);}
function animationEnd(node,name){var w=node.ownerDocument.defaultView,e=new w.Event("animationend",{bubbles:true});Object.defineProperty(e,"animationName",{value:name});node.dispatchEvent(e);}
function buildApp(){
  var dom=new JSDOM(read("course-units/unit1/bond-line/index.html"),{runScripts:"outside-only",pretendToBeVisual:true,url:"https://example.test/course-units/unit1/bond-line/"});
  dom.window.matchMedia=function(q){return{matches:false,media:q,addListener:function(){},removeListener:function(){},addEventListener:function(){},removeEventListener:function(){},dispatchEvent:function(){return true;}};};
  Object.defineProperty(dom.window,"speechSynthesis",{configurable:true,value:{cancel:function(){},speak:function(){}}});dom.window.SpeechSynthesisUtterance=function(t){this.text=t;};
  ["watch-mode.js","unit1-skill-registry.js","build-together.js","course-units/unit1/bond-line/bond-line-slice1.js","course-units/unit1/bond-line/bond-line-concept-check.js","course-units/unit1/bond-line/bond-line-build-together.js","course-units/unit1/bond-line/bond-line-app.js","course-units/unit1/bond-line/bond-line-build-together-ui.js","course-units/unit1/bond-line/bond-line-concept-check-ui.js"].forEach(function(f){if(fs.existsSync(path.join(__dirname,f)))evalFile(dom.window,f);});
  return dom;
}
function reachStep8(dom){var d=dom.window.document;byText(d,"The drawing may be using a shortcut.").click();byText(d,"4").click();byText(d,"A covalent bond").click();["C1","C2","C3","C4"].forEach(function(id){activate(d.querySelector('[data-carbon-id="'+id+'"]'));});d.getElementById("nextBtn").click();byText(d,"No").click();d.getElementById("nextBtn").click();byText(d,"3").click();d.getElementById("nextBtn").click();animationEnd(d.querySelector('[data-step4-label="C2"]'),"step4HideCarbon");byText(d,"No, the corner now stands for the carbon").click();animationEnd(d.querySelector('[data-step4-label="C4"]'),"step4HideCarbon");d.getElementById("nextBtn").click();["C1","C2","C3","C4"].forEach(function(id){activate(d.querySelector('[data-step5-carbon="'+id+'"]'));});d.getElementById("nextBtn").click();byText(d,"2").click();byText(d,"3").click();d.getElementById("nextBtn").click();byText(d,"No").click();d.getElementById("nextBtn").click();return d;}
function reachBuildTogether(dom){var d=reachStep8(dom);byText(d,"1").click();d.getElementById("nextBtn").click();[[0,false],[1,true],[2,true],[3,true]].forEach(function(pair){var b=d.querySelector('[data-concept-item="'+pair[0]+'"] [data-answer="'+String(pair[1])+'"]');activate(b);});d.getElementById("nextBtn").click();return d;}

console.log("=== SLICE 10 PURE CONTRACT ===");
check("Bond-Line Build Together adapter exists",!!Adapter);
if(Adapter){
  var plan=Adapter.PENTANE_PLAN;
  check("fresh Build Together molecule is pentane",!!plan&&plan.molecule==="pentane"&&plan.skillId==="chem.representation.bond_line");
  check("pentane plan requires role-preserving bond instances",plan&&plan.strictBondInstances===true);
  check("pentane plan contains exactly four bond segments",plan&&plan.actions.length===4&&plan.actions.every(function(a){return a.type===B.ACTION.ADD_BOND;}));
  var s=Adapter.createSession();
  check("Build Together begins before canvas with carbon-count decision",s.phase==="count_carbons"&&s.buildSession===null);
  var wrongCount=Adapter.submitCarbonCount(s,4);
  check("wrong carbon count stays local and offers formula-tap support",wrongCount&&wrongCount.correct===false&&wrongCount.tapFormulaSupport===true&&s.phase==="count_carbons");
  check("five carbons advances to connectivity decision",Adapter.submitCarbonCount(s,5).correct===true&&s.phase==="connectivity");
  check("continuous chain decision opens an empty build stage",Adapter.submitConnectivity(s,"continuous_chain").correct===true&&s.phase==="draw_segments"&&s.buildSession&&s.buildSession.currentIndex===0);
  var first=Adapter.submitSegment(s,["C1","C2"]);
  check("first C1-C2 segment is accepted",first&&first.correct===true&&s.buildSession.currentIndex===1);
  var wrongTopology=Adapter.submitSegment(s,["C2","C5"]);
  check("wrong carbon connectivity is rejected even though it is still C-C",wrongTopology&&wrongTopology.correct===false&&s.buildSession.currentIndex===1);
  [["C2","C3"],["C3","C4"],["C4","C5"]].forEach(function(pair){Adapter.submitSegment(s,pair);});
  check("four correct segments route to carbon-position self-check",s.phase==="self_check");
  var bondTap=Adapter.tapSelfCheckCarbon(s,"BOND_2");
  check("bond-center tap is rejected as a carbon",bondTap&&bondTap.accepted===false&&bondTap.reason==="bond_segment");
  ["C1","C2","C3","C4","C5"].forEach(function(id){Adapter.tapSelfCheckCarbon(s,id);});
  check("five carbon positions route to hidden-hydrogen check",s.phase==="hydrogen_check");
  var beforeEvidence=Object.prototype.hasOwnProperty.call(s,"evidence")?s.evidence.length:0;
  var done=Adapter.submitMiddleHydrogen(s,2);
  check("middle carbon answer 2 completes supported Build Together",done&&done.correct===true&&done.complete===true&&s.phase==="complete");
  check("completion logs BUILD_TOGETHER_SUCCESS only",s.events.some(function(e){return e.type==="BUILD_TOGETHER_SUCCESS"&&e.supported===true;})&&!Object.prototype.hasOwnProperty.call(s,"evidence")||Object.prototype.hasOwnProperty.call(s,"evidence")&&s.evidence.length===beforeEvidence);
}

console.log("\n=== SLICE 10 REAL LEARNER PAGE ===");
var dom=buildApp(),doc=reachBuildTogether(dom);
check("4\/4 concept check opens Build Together instead of a placeholder",/Build Together/i.test(doc.getElementById("phaseLabel").textContent)&&/CH3CH2CH2CH2CH3/.test(doc.getElementById("lessonPanel").textContent));
check("pentane workspace starts blank",doc.querySelectorAll("[data-build-segment]").length===0&&doc.querySelectorAll("[data-build-carbon]").length===0);
check("first learner decision asks for five carbons",/How many carbon atoms are in this formula\?/.test(doc.getElementById("lessonPanel").textContent));
byText(doc,"5").click();
check("second learner decision asks chain versus branch",/continuous chain/i.test(doc.getElementById("lessonPanel").textContent)&&/branch/i.test(doc.getElementById("lessonPanel").textContent));
byText(doc,"One continuous chain").click();
var canvas=doc.querySelector("[data-build-canvas]");
check("blank canvas is interactive",!!canvas);
if(canvas){canvasTap(canvas,90,180);canvasTap(canvas,190,120);canvasTap(canvas,290,180);canvasTap(canvas,390,120);canvasTap(canvas,490,180);}
check("learner creates four segments and five carbon positions",doc.querySelectorAll("[data-build-segment]").length===4&&doc.querySelectorAll("[data-build-carbon]").length===5);
check("after drawing, learner must tap all five carbon positions",/Tap the five carbon positions you created/.test(doc.getElementById("lessonPanel").textContent));
var line=doc.querySelector("[data-build-segment]");if(line)activate(line);
check("tapping bond center does not count as a carbon",/bond/i.test(doc.getElementById("statusText").textContent+" "+doc.getElementById("lessonPanel").textContent));
Array.prototype.slice.call(doc.querySelectorAll("[data-build-carbon]")).forEach(activate);
check("final supported check asks middle-carbon hydrogens",/two visible single bonds/i.test(doc.getElementById("lessonPanel").textContent)&&/hydrogens are implied/i.test(doc.getElementById("lessonPanel").textContent));
byText(doc,"2").click();
check("completion explicitly says supported Build Together, not mastery",/supported/i.test(doc.getElementById("statusText").textContent+" "+doc.getElementById("lessonPanel").textContent)&&!/mastered/i.test(doc.getElementById("lessonPanel").textContent));
check("Build Together adds no timer-driven advancement",["course-units/unit1/bond-line/bond-line-build-together-ui.js"].every(function(file){return !fs.existsSync(path.join(__dirname,file))||(read(file).indexOf("setTimeout(")===-1&&read(file).indexOf("setInterval(")===-1);}));
dom.window.close();
console.log("\n=== SUMMARY: "+(failed?"FAIL":"PASS")+" ===");if(failed)process.exit(1);
