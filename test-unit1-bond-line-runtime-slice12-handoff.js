"use strict";

var fs=require("fs"),path=require("path"),JSDOM=require("jsdom").JSDOM;
var failed=0;
function check(label,condition){if(condition)console.log("PASS  "+label);else{console.log("FAIL  "+label);failed++;}}
function read(rel){return fs.readFileSync(path.join(__dirname,rel),"utf8");}

console.log("=== SLICE 12 GUIDED -> COLD HANDOFF ===");
var dom=new JSDOM('<!doctype html><html><head></head><body><div id="phaseLabel">Guided · Task D</div><button id="nextBtn" disabled>Cold Independent next</button></body></html>',{runScripts:"outside-only",pretendToBeVisual:true,url:"https://example.test/course-units/unit1/bond-line/"});
var win=dom.window,started=0;
win.BondLineIndependentUI={start:function(){started++;win.document.getElementById("phaseLabel").textContent="Independent · Cold Evidence";}};
win.eval(read("course-units/unit1/bond-line/bond-line-independent-handoff.js"));
var phase=win.document.getElementById("phaseLabel"),next=win.document.getElementById("nextBtn");
check("handoff stays locked before Guided completion",next.disabled===true&&started===0);
phase.textContent="Guided · complete";
win.BondLineIndependentHandoff.sync();
check("Guided completion enables a learner-controlled cold-start button",next.disabled===false&&next.textContent==="Start Cold Independent");
next.dispatchEvent(new win.MouseEvent("click",{bubbles:true,cancelable:true}));
check("one click launches the cold Independent UI",started===1&&/Independent · Cold Evidence/.test(phase.textContent));
next.dispatchEvent(new win.MouseEvent("click",{bubbles:true,cancelable:true}));
check("handoff is single-fire and cannot double-start the bank",started===1);

var guidedSource=read("course-units/unit1/bond-line/bond-line-guided.js");
check("browser bootstrap loads shared Student Model before Independent adapter",guidedSource.indexOf("../../../student-model-idk-router.js")<guidedSource.indexOf("bond-line-independent.js"));
check("browser bootstrap loads Independent adapter before UI before handoff",guidedSource.indexOf("bond-line-independent.js")<guidedSource.indexOf("bond-line-independent-ui.js")&&guidedSource.indexOf("bond-line-independent-ui.js")<guidedSource.indexOf("bond-line-independent-handoff.js"));
check("Node/pure Guided use remains DOM-free",/if\(typeof document===\"undefined\"\|\|typeof window===\"undefined\"\)return;/.test(guidedSource));

dom.window.close();
console.log("\n=== SUMMARY: "+(failed?"FAIL":"PASS")+" ===");if(failed)process.exit(1);
