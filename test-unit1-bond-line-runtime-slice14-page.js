"use strict";

var fs=require("fs"),path=require("path"),JSDOM=require("jsdom").JSDOM;
var failed=0;
function check(label,condition){if(condition)console.log("PASS  "+label);else{console.log("FAIL  "+label);failed++;}}
function read(rel){return fs.readFileSync(path.join(__dirname,rel),"utf8");}
function evalFile(win,rel){win.eval(read(rel)+"\n//# sourceURL="+rel);}
function click(win,node){node.dispatchEvent(new win.MouseEvent("click",{bubbles:true,cancelable:true}));}

console.log("=== SLICE 14 REAL TRANSFER PAGE ===");
var dom=new JSDOM('<!doctype html><html><head></head><body><div id="phaseLabel"></div><div id="statusText"></div><div id="lessonPanel"></div><nav id="watchControls"><button id="backBtn">Back</button><button id="replayBtn">Replay</button><button id="pauseBtn">Pause</button><button id="nextBtn">Next</button></nav><div id="liveRegion"></div></body></html>',{runScripts:"outside-only",pretendToBeVisual:true,url:"https://example.test/course-units/unit1/bond-line/"});
var win=dom.window,doc=win.document;
evalFile(win,"student-model-idk-router.js");evalFile(win,"course-units/unit1/bond-line/bond-line-transfer.js");evalFile(win,"course-units/unit1/bond-line/bond-line-transfer-ui.js");
var skill=win.StudentModelIdkRouter.createSkill("chem.representation.bond_line");skill.scaffoldLevel=win.StudentModelIdkRouter.SCAFFOLD.COLD;
win.StudentModelIdkRouter.recordIndependentAttempt(skill,"BL-I1",true,true,1000,"cold");
win.StudentModelIdkRouter.recordIndependentAttempt(skill,"BL-I2",true,true,1100,"cold");
var before=skill.independentSuccesses.length;
win.BondLineTransferUI.start({skill:skill});
check("Transfer opens on BL-T1 classmate/four-corners problem",/four corners/i.test(doc.getElementById("lessonPanel").textContent)&&/BL-T1/.test(doc.getElementById("phaseLabel").textContent));
check("Transfer hides Watch controls and exposes I need help",doc.getElementById("watchControls").hidden===true&&!!doc.querySelector("[data-transfer-help]"));
click(win,doc.querySelector('[data-t1-count="6"]'));
doc.querySelector("[data-t1-explanation]").value="She counted the four corners but missed both line ends. Those two line ends also represent carbon, so there are six carbons total.";
click(win,doc.querySelector("[data-submit-t1]"));
check("clean BL-T1 pass ends at Later Retrieval",/Transfer · complete/.test(doc.getElementById("phaseLabel").textContent)&&/Later Retrieval/.test(doc.getElementById("lessonPanel").textContent));
check("Transfer pass creates no new cold success and no mastery",skill.independentSuccesses.length===before&&skill.state!==win.StudentModelIdkRouter.STATES.MASTERED);

var skill2=win.StudentModelIdkRouter.createSkill("chem.representation.bond_line");skill2.scaffoldLevel=win.StudentModelIdkRouter.SCAFFOLD.COLD;
win.StudentModelIdkRouter.recordIndependentAttempt(skill2,"BL-I1",true,true,2000,"cold");
win.BondLineTransferUI.start({skill:skill2});
click(win,doc.querySelector('[data-t1-count="4"]'));doc.querySelector("[data-t1-explanation]").value="Only the four corners count.";click(win,doc.querySelector("[data-submit-t1]"));
check("wrong T1 opens interactive endpoint repair",/interactive repair/i.test(doc.getElementById("phaseLabel").textContent)&&!!doc.querySelector('[data-transfer-repair="END_LEFT"]')&&!!doc.querySelector('[data-transfer-repair="END_RIGHT"]'));
click(win,doc.querySelector('[data-transfer-repair="BOND_CENTER_2"]'));
check("bond-center tap gets a specific correction",/bond center/i.test(doc.getElementById("statusText").textContent));
click(win,doc.querySelector('[data-transfer-repair="END_LEFT"]'));click(win,doc.querySelector('[data-transfer-repair="END_RIGHT"]'));
check("two endpoint taps route to fresh BL-T2 rather than repeating T1",/BL-T2/.test(doc.getElementById("phaseLabel").textContent)&&/one double bond and two single bonds/i.test(doc.getElementById("lessonPanel").textContent));
click(win,doc.querySelector('[data-t2-count="0"]'));doc.querySelector("[data-t2-explanation]").value="The double bond contributes bond order 2 and the two single bonds contribute 1 each. That totals 4, so no hydrogen can be attached.";click(win,doc.querySelector("[data-submit-t2]"));
check("fresh BL-T2 recovery can complete Transfer without mastery",/Transfer · complete/.test(doc.getElementById("phaseLabel").textContent)&&skill2.state!==win.StudentModelIdkRouter.STATES.MASTERED);

dom.window.close();
console.log("\n=== SUMMARY: "+(failed?"FAIL":"PASS")+" ===");if(failed)process.exit(1);
