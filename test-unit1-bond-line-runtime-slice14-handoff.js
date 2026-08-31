"use strict";

var fs=require("fs"),path=require("path"),JSDOM=require("jsdom").JSDOM;
var Router=require("./student-model-idk-router.js");
var failed=0;
function check(label,condition){if(condition)console.log("PASS  "+label);else{console.log("FAIL  "+label);failed++;}}
function read(rel){return fs.readFileSync(path.join(__dirname,rel),"utf8");}

console.log("=== SLICE 14 EXPLAIN WHY -> TRANSFER HANDOFF ===");
var dom=new JSDOM('<!doctype html><html><head></head><body><div id="phaseLabel">Explain Why · reasoning evidence</div><button id="nextBtn" disabled>Transfer next</button></body></html>',{runScripts:"outside-only",pretendToBeVisual:true,url:"https://example.test/course-units/unit1/bond-line/"});
var win=dom.window,started=0,received=null;
var skill=Router.createSkill("chem.representation.bond_line");skill.scaffoldLevel=Router.SCAFFOLD.COLD;Router.recordIndependentAttempt(skill,"BL-I1",true,true,1000,"cold");
var explainSession={skill:skill,currentPromptId:"E-W3"};
win.BondLineExplainWhyUI={getSession:function(){return explainSession;}};
win.BondLineTransferUI={start:function(s){started++;received=s;win.document.getElementById("phaseLabel").textContent="Transfer · BL-T1";}};
win.eval(read("course-units/unit1/bond-line/bond-line-transfer-handoff.js"));
var phase=win.document.getElementById("phaseLabel"),next=win.document.getElementById("nextBtn");
check("Transfer stays locked before Explain Why completion",next.disabled===true&&started===0);
phase.textContent="Explain Why · complete";win.BondLineTransferHandoff.sync();
check("Explain Why completion enables learner-controlled Transfer",next.disabled===false&&next.textContent==="Start Transfer");
next.dispatchEvent(new win.MouseEvent("click",{bubbles:true,cancelable:true}));
check("handoff passes exact live Explain Why session",started===1&&received===explainSession&&received.skill===skill);
check("handoff preserves existing cold evidence",received.skill.independentSuccesses.length===1&&received.skill.independentSuccesses[0].correctExplanation===true);
next.dispatchEvent(new win.MouseEvent("click",{bubbles:true,cancelable:true}));
check("Transfer handoff is single-fire",started===1);

dom.window.close();
console.log("\n=== SUMMARY: "+(failed?"FAIL":"PASS")+" ===");if(failed)process.exit(1);
