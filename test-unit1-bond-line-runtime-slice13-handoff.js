"use strict";

var fs=require("fs"),path=require("path"),JSDOM=require("jsdom").JSDOM;
var Router=require("./student-model-idk-router.js");
var failed=0;
function check(label,condition){if(condition)console.log("PASS  "+label);else{console.log("FAIL  "+label);failed++;}}
function read(rel){return fs.readFileSync(path.join(__dirname,rel),"utf8");}

console.log("=== SLICE 13 COLD -> EXPLAIN WHY HANDOFF ===");
var dom=new JSDOM('<!doctype html><html><head></head><body><div id="phaseLabel">Independent · Cold Evidence</div><button id="nextBtn" disabled>Explain Why next</button></body></html>',{runScripts:"outside-only",pretendToBeVisual:true,url:"https://example.test/course-units/unit1/bond-line/"});
var win=dom.window,started=0,received=null;
var skill=Router.createSkill("chem.representation.bond_line");skill.scaffoldLevel=Router.SCAFFOLD.COLD;Router.recordIndependentAttempt(skill,"BL-I3",true,false,1000,"answer");
var independentSession={skill:skill,currentItemId:"BL-I6"};
win.BondLineIndependentUI={getSession:function(){return independentSession;}};
win.BondLineExplainWhyUI={start:function(s){started++;received=s;win.document.getElementById("phaseLabel").textContent="Explain Why · reasoning evidence";}};
win.eval(read("course-units/unit1/bond-line/bond-line-explain-why-handoff.js"));
var phase=win.document.getElementById("phaseLabel"),next=win.document.getElementById("nextBtn");
check("Explain Why handoff remains locked before bank completion",next.disabled===true&&started===0);
phase.textContent="Independent bank · attempted";win.BondLineExplainWhyHandoff.sync();
check("bank completion enables learner-controlled Explain Why start",next.disabled===false&&next.textContent==="Start Explain Why");
next.dispatchEvent(new win.MouseEvent("click",{bubbles:true,cancelable:true}));
check("handoff passes the exact live Independent session",started===1&&received===independentSession&&received.skill===skill);
check("handoff does not clone or reset cold evidence",received.skill.independentSuccesses.length===1&&received.skill.independentSuccesses[0].itemId==="BL-I3");
next.dispatchEvent(new win.MouseEvent("click",{bubbles:true,cancelable:true}));
check("Explain Why handoff is single-fire",started===1);

dom.window.close();
console.log("\n=== SUMMARY: "+(failed?"FAIL":"PASS")+" ===");if(failed)process.exit(1);
