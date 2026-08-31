"use strict";

var fs=require("fs"),path=require("path"),JSDOM=require("jsdom").JSDOM;
var failed=0;
function check(label,condition){if(condition)console.log("PASS  "+label);else{console.log("FAIL  "+label);failed++;}}
function read(rel){return fs.readFileSync(path.join(__dirname,rel),"utf8");}
function evalFile(win,rel){win.eval(read(rel)+"\n//# sourceURL="+rel);}
function click(win,node){node.dispatchEvent(new win.MouseEvent("click",{bubbles:true,cancelable:true}));}

console.log("=== SLICE 12 REAL COLD PAGE ===");
var dom=new JSDOM('<!doctype html><html><head></head><body><div id="phaseLabel"></div><div id="statusText"></div><div id="lessonPanel"></div><nav id="watchControls"><button id="backBtn">Back</button><button id="replayBtn">Replay</button><button id="pauseBtn">Pause</button><button id="nextBtn">Next</button></nav><div id="liveRegion"></div></body></html>',{runScripts:"outside-only",pretendToBeVisual:true,url:"https://example.test/course-units/unit1/bond-line/"});
var win=dom.window,doc=win.document;
evalFile(win,"student-model-idk-router.js");
evalFile(win,"course-units/unit1/bond-line/bond-line-independent.js");
evalFile(win,"course-units/unit1/bond-line/bond-line-independent-ui.js");
win.BondLineIndependentUI.start();
check("cold bank opens on BL-I1 at scaffold level 0",/BL-I1/.test(doc.getElementById("lessonPanel").textContent)&&/scaffold level 0/i.test(doc.getElementById("statusText").textContent));
check("cold page hides shared Watch controls",doc.getElementById("watchControls").hidden===true);
check("cold page exposes help as I-need-help, not a hint",!!doc.querySelector("[data-independent-help]")&&!doc.querySelector("[data-independent-hint]"));
check("cold page contains no numbered carbon overlay",!doc.querySelector("[data-carbon-counter]")&&!doc.querySelector("[data-atom-overlay]"));
var six=doc.querySelector('[data-i1-count="6"]');click(win,six);
check("correct BL-I1 count asks for explanation before evidence feedback",!!doc.querySelector("[data-i1-explanation]")&&!/Recorded as cold Independent evidence/.test(doc.getElementById("lessonPanel").textContent));
var text=doc.querySelector("[data-i1-explanation]");text.value="I counted both line ends and every corner as carbon positions. The line segments are the bonds connecting them.";
click(win,doc.querySelector("[data-submit-i1-explanation]"));
check("correct role-preserving explanation is shown as cold Independent evidence",/Recorded as cold Independent evidence/.test(doc.getElementById("lessonPanel").textContent));
click(win,doc.querySelector("[data-next-fresh]"));
check("learner-controlled next advances to fresh BL-I2",/BL-I2/.test(doc.getElementById("lessonPanel").textContent)&&/Cold item 2 of 6/.test(doc.getElementById("statusText").textContent));

dom.window.close();
console.log("\n=== SUMMARY: "+(failed?"FAIL":"PASS")+" ===");if(failed)process.exit(1);
