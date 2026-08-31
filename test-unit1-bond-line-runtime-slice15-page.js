"use strict";

var fs=require("fs"),path=require("path"),JSDOM=require("jsdom").JSDOM;
var failed=0;
function check(label,condition){if(condition)console.log("PASS  "+label);else{console.log("FAIL  "+label);failed++;}}
function read(rel){return fs.readFileSync(path.join(__dirname,rel),"utf8");}
function evalFile(win,rel){win.eval(read(rel)+"\n//# sourceURL="+rel);}
function click(win,node){node.dispatchEvent(new win.MouseEvent("click",{bubbles:true,cancelable:true}));}

console.log("=== SLICE 15 REAL LATER RETRIEVAL PAGE ===");
var dom=new JSDOM('<!doctype html><html><head></head><body><div id="phaseLabel"></div><div id="statusText"></div><div id="lessonPanel"></div><nav id="watchControls"><button id="backBtn">Back</button><button id="replayBtn">Replay</button><button id="pauseBtn">Pause</button><button id="nextBtn">Next</button></nav><div id="liveRegion"></div></body></html>',{runScripts:"outside-only",pretendToBeVisual:true,url:"https://example.test/course-units/unit1/bond-line/"});
var win=dom.window,doc=win.document;
evalFile(win,"student-model-idk-router.js");evalFile(win,"course-units/unit1/bond-line/bond-line-retrieval.js");evalFile(win,"course-units/unit1/bond-line/bond-line-retrieval-ui.js");
var M=win.StudentModelIdkRouter;
var skill=M.createSkill("chem.representation.bond_line");skill.scaffoldLevel=M.SCAFFOLD.COLD;M.recordIndependentAttempt(skill,"BL-I1",true,true,1000,"cold");
var transferSession={skill:skill};
win.BondLineRetrievalUI.prepare(transferSession,1100);
check("retrieval page starts scheduled rather than immediately cold",/Later Retrieval · scheduled/.test(doc.getElementById("phaseLabel").textContent));
win.BondLineRetrievalUI.registerInterveningActivity("chm221.u1.02",2000);
var started=win.BondLineRetrievalUI.startReady(1000+M.MIN_RETRIEVAL_DELAY_MS+1000);
check("cold retrieval starts only when explicitly reopened after both gates",started.started===true&&/BL-R1 · cold/.test(doc.getElementById("phaseLabel").textContent));
check("fresh retrieval visual includes explicit oxygen and a branch",/O/.test(doc.getElementById("lessonPanel").textContent)&&/branched/i.test(doc.querySelector("svg").getAttribute("aria-label")));
check("retrieval exposes only the two chemistry questions plus optional help",/total carbon count/i.test(doc.getElementById("lessonPanel").textContent)&&/implied hydrogens/i.test(doc.getElementById("lessonPanel").textContent)&&!!doc.querySelector("[data-retrieval-help]"));
click(win,doc.querySelector('[data-retrieval-carbon="6"]'));click(win,doc.querySelector('[data-retrieval-h="2"]'));click(win,doc.querySelector("[data-submit-retrieval]"));
check("clean delayed retrieval produces shared Mastered verdict",skill.state===M.STATES.MASTERED&&/Mastery · bond-line structures/.test(doc.getElementById("phaseLabel").textContent)&&/^Mastered\./.test(doc.querySelector("h1").textContent));
check("retrieval added one cold success without inventing an explanation",skill.independentSuccesses.length===2&&skill.independentSuccesses[1].itemId==="BL-R1"&&skill.independentSuccesses[1].correctExplanation===false);

var skill2=M.createSkill("chem.representation.bond_line");skill2.scaffoldLevel=M.SCAFFOLD.COLD;M.recordIndependentAttempt(skill2,"BL-I1",true,true,10000,"cold");
win.BondLineRetrievalUI.prepare({skill:skill2},10100);win.BondLineRetrievalUI.registerInterveningActivity("different_lesson",11000);win.BondLineRetrievalUI.startReady(10000+M.MIN_RETRIEVAL_DELAY_MS+1000);
click(win,doc.querySelector("[data-retrieval-help]"));click(win,doc.querySelector('[data-retrieval-help-reason="started_but_stuck"]'));
check("asking for retrieval help stops cold scoring and opens remediation",/remediation required/i.test(doc.getElementById("phaseLabel").textContent)&&M.isRemediationActive(skill2)&&skill2.state!==M.STATES.MASTERED);
check("helped retrieval screen does not display Mastered",!/Mastered\./.test(doc.getElementById("lessonPanel").textContent));

dom.window.close();
console.log("\n=== SUMMARY: "+(failed?"FAIL":"PASS")+" ===");if(failed)process.exit(1);
