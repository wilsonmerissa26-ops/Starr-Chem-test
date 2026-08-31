"use strict";

var fs=require("fs"),path=require("path"),JSDOM=require("jsdom").JSDOM;
var failed=0;
function check(label,condition){if(condition)console.log("PASS  "+label);else{console.log("FAIL  "+label);failed++;}}
function read(rel){return fs.readFileSync(path.join(__dirname,rel),"utf8");}
function evalFile(win,rel){win.eval(read(rel)+"\n//# sourceURL="+rel);}
function click(win,node){node.dispatchEvent(new win.MouseEvent("click",{bubbles:true,cancelable:true}));}
function answer(win,doc,text){doc.querySelector("[data-explain-response]").value=text;click(win,doc.querySelector("[data-submit-explain]"));}
function next(win,doc){click(win,doc.querySelector("[data-next-explain]"));}

console.log("=== SLICE 13 REAL EXPLAIN WHY PAGE ===");
var dom=new JSDOM('<!doctype html><html><head></head><body><div id="phaseLabel"></div><div id="statusText"></div><div id="lessonPanel"></div><nav id="watchControls"><button id="backBtn">Back</button><button id="replayBtn">Replay</button><button id="pauseBtn">Pause</button><button id="nextBtn">Next</button></nav><div id="liveRegion"></div></body></html>',{runScripts:"outside-only",pretendToBeVisual:true,url:"https://example.test/course-units/unit1/bond-line/"});
var win=dom.window,doc=win.document;
evalFile(win,"student-model-idk-router.js");evalFile(win,"course-units/unit1/bond-line/bond-line-explain-why.js");evalFile(win,"course-units/unit1/bond-line/bond-line-explain-why-ui.js");
var skill=win.StudentModelIdkRouter.createSkill("chem.representation.bond_line");skill.scaffoldLevel=win.StudentModelIdkRouter.SCAFFOLD.COLD;
win.StudentModelIdkRouter.recordIndependentAttempt(skill,"BL-I1",true,false,1000,"6");
win.StudentModelIdkRouter.recordIndependentAttempt(skill,"BL-I2",true,false,1100,"1");
win.StudentModelIdkRouter.recordIndependentAttempt(skill,"BL-I3",true,false,1200,{carbonCount:3,nonCarbonAtom:"O"});
var independentSession={skill:skill};
win.BondLineExplainWhyUI.start(independentSession);
check("Explain Why starts on frozen E-W1",/E-W1/.test(doc.getElementById("lessonPanel").textContent)&&/three-segment unbranched/i.test(doc.getElementById("lessonPanel").textContent));
check("Explain Why hides Watch controls",doc.getElementById("watchControls").hidden===true);
answer(win,doc,"The three line segments are bonds connecting carbon positions. The carbons are at both line ends and the two corners, so there are four carbons.");
check("E-W1 accepted explanation says it attached to cold evidence",/attached to an existing cold Independent success/i.test(doc.getElementById("lessonPanel").textContent)&&skill.independentSuccesses[0].correctExplanation===true);
next(win,doc);
check("learner-controlled next opens E-W2",/E-W2/.test(doc.getElementById("lessonPanel").textContent));
answer(win,doc,"It has two visible C-C single bonds, so visible bond order is 2. Carbon needs four total bonds, leaving two implied C-H bonds, so it is CH2.");next(win,doc);
check("second correct explanation upgrades BL-I2",skill.independentSuccesses[1].correctExplanation===true&&/E-W3/.test(doc.getElementById("lessonPanel").textContent));
answer(win,doc,"An unlabeled line end or corner defaults to carbon. Oxygen is a heteroatom, so its O symbol must be written.");
check("E-W3 upgrades the existing heteroatom cold success",skill.independentSuccesses[2].correctExplanation===true);
next(win,doc);
check("Explain Why ends at Transfer boundary without mastery verdict",/Explain Why · complete/.test(doc.getElementById("phaseLabel").textContent)&&/Transfer/.test(doc.getElementById("lessonPanel").textContent)&&skill.state!==win.StudentModelIdkRouter.STATES.MASTERED);

dom.window.close();
console.log("\n=== SUMMARY: "+(failed?"FAIL":"PASS")+" ===");if(failed)process.exit(1);
