"use strict";

var fs=require("fs"),path=require("path"),JSDOM=require("jsdom").JSDOM;
var failed=0;
function check(label,condition){if(condition)console.log("PASS  "+label);else{console.log("FAIL  "+label);failed++;}}
function read(rel){return fs.readFileSync(path.join(__dirname,rel),"utf8");}
function evalFile(win,rel){win.eval(read(rel)+"\n//# sourceURL="+rel);}
function click(win,node){node.dispatchEvent(new win.MouseEvent("click",{bubbles:true,cancelable:true}));}

console.log("=== U1-01 PILOT READINESS ===");

// The real Unit 1 skill map exposes the full teaching runtime instead of hiding it behind a URL.
var App=require("./course-units/unit1/unit1-app.js");
var hubDom=new JSDOM('<!doctype html><html><body><div data-practice></div><section data-skill-grid></section><div data-foundation-results></div><div data-readiness></div><div data-error-log></div><button data-start-check></button><button data-start-test></button></body></html>',{url:"https://example.test/course-units/unit1/",pretendToBeVisual:true});
App.mount(hubDom.window);
var fullLesson=hubDom.window.document.querySelector('a[href="./bond-line/"]');
check("Unit 1 exposes a learner-visible full Bond-Line teaching lesson",!!fullLesson&&/Start full teaching lesson/i.test(fullLesson.textContent));
check("full lesson link is attached to Bond-line representations",!!fullLesson&&/Bond-line representations/i.test(fullLesson.closest("article").textContent));
check("generic quick practice remains separate from the full tutor",!!fullLesson&&/Quick practice/i.test(fullLesson.closest("article").textContent));
hubDom.window.close();

// Build a real delayed-retrieval browser handoff with the actual shared Student Model.
var dom=new JSDOM('<!doctype html><html><head></head><body><div id="phaseLabel">Transfer · complete</div><div id="statusText"></div><div id="lessonPanel"></div><nav id="watchControls" hidden><button id="backBtn">Back</button><button id="replayBtn">Replay</button><button id="pauseBtn">Pause</button><button id="nextBtn">Next</button></nav><div id="liveRegion"></div></body></html>',{runScripts:"outside-only",pretendToBeVisual:true,url:"https://example.test/course-units/unit1/bond-line/"});
var win=dom.window,doc=win.document,now=200000;
win.Date.now=function(){return now;};
evalFile(win,"student-model-idk-router.js");evalFile(win,"course-units/unit1/bond-line/bond-line-retrieval.js");evalFile(win,"course-units/unit1/bond-line/bond-line-retrieval-ui.js");
var M=win.StudentModelIdkRouter,skill=M.createSkill("chem.representation.bond_line");
skill.scaffoldLevel=M.SCAFFOLD.COLD;M.recordIndependentAttempt(skill,"BL-I1",true,true,1000,"cold");
win.BondLineTransferUI={getSession:function(){return{skill:skill};}};
evalFile(win,"course-units/unit1/bond-line/bond-line-retrieval-handoff.js");
evalFile(win,"course-units/unit1/bond-line/bond-line-intervening-activity.js");

check("Transfer completion prepares a scheduled retrieval",/Later Retrieval · scheduled/i.test(doc.getElementById("phaseLabel").textContent));
check("scheduled retrieval requires a real different chemistry activity",/saturated acyclic alkane/i.test(doc.getElementById("lessonPanel").textContent)&&/different chemistry skill/i.test(doc.getElementById("lessonPanel").textContent));
check("retrieval controls stay hidden before the activity gate",doc.getElementById("watchControls").hidden===true);
click(win,doc.querySelector('[data-switch-answer="C4H10"]'));
check("correct switch work is recorded as intervening activity, not bond-line evidence",win.BondLineRetrievalUI.getSession().interveningActivities.length===1&&skill.independentSuccesses.length===1);
check("ready retrieval makes the real Start Later Retrieval control visible",doc.getElementById("watchControls").hidden===false&&doc.getElementById("nextBtn").hidden===false&&doc.getElementById("nextBtn").disabled===false&&doc.getElementById("nextBtn").textContent==="Start Later Retrieval");
check("non-retrieval watch controls stay hidden at the delayed handoff",doc.getElementById("backBtn").hidden&&doc.getElementById("replayBtn").hidden&&doc.getElementById("pauseBtn").hidden);
click(win,doc.querySelector("[data-complete-switch]"));
click(win,doc.getElementById("nextBtn"));
check("visible learner control launches the real cold BL-R1 page",/BL-R1 · cold/i.test(doc.getElementById("phaseLabel").textContent)&&/total carbon count/i.test(doc.getElementById("lessonPanel").textContent));
check("cold retrieval hides navigation again while learner answers",doc.getElementById("watchControls").hidden===true);

dom.window.close();

// The bridge never fakes elapsed time and the page remains mobile-first for the iPad/phone pilot.
var bridge=read("course-units/unit1/bond-line/bond-line-intervening-activity.js"),handoff=read("course-units/unit1/bond-line/bond-line-retrieval-handoff.js"),transferHandoff=read("course-units/unit1/bond-line/bond-line-transfer-handoff.js"),page=read("course-units/unit1/bond-line/index.html");
check("intervening bridge contains no timer-driven advancement",bridge.indexOf("setTimeout(")===-1&&bridge.indexOf("setInterval(")===-1);
check("retrieval handoff contains no timer-driven advancement",handoff.indexOf("setTimeout(")===-1&&handoff.indexOf("setInterval(")===-1);
check("Transfer loader includes the meaningful-activity bridge after retrieval runtime",transferHandoff.indexOf('"bond-line-retrieval-handoff.js","bond-line-intervening-activity.js"')!==-1);
check("learner page declares a responsive viewport",page.indexOf('name="viewport"')!==-1&&page.indexOf("viewport-fit=cover")!==-1);
check("learner page has a phone breakpoint",page.indexOf("@media(max-width:620px)")!==-1);
check("primary learner choices keep touch-sized targets",page.indexOf("min-height:54px")!==-1&&page.indexOf("touch-action:manipulation")!==-1);

// Real-phone regression from Sept. 1 pilot: fixed controls must not cover content,
// the header must scroll away on phones, and Step 4 unsure must teach differently
// before asking a simpler check.
var phoneFix=read("course-units/unit1/bond-line/bond-line-phone-release-fix.js");
check("phone release layer reserves bottom space above fixed Watch controls",/padding-bottom:190px!important/.test(phoneFix));
check("phone release layer stops the tall lesson header from staying pinned",/\.topbar\{position:static!important/.test(phoneFix));
check("phone learner tools compact to one four-control row",/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/.test(phoneFix));
check("browser bundle loads the real-device release layer",read("course-units/unit1/bond-line/bond-line-concept-check.js").indexOf("bond-line-phone-release-fix.js")!==-1);

var phoneDom=new JSDOM('<!doctype html><html><head></head><body><main class="shell"><header class="topbar"><div class="brand"><div>brand</div><div class="muted">slogan</div></div><div id="phaseLabel">Watch · I Do · Step 4 · same-position repair</div><div id="statusText"></div></header><div id="lessonPanel"><div class="prediction-feedback" id="step4RepairFocus">same-position animation</div><div class="prompt-card"><div class="eyebrow">Prediction pause</div><h2 id="step4PredictionPrompt">The letter C disappeared from this corner. Did the carbon atom disappear?</h2></div><div class="choice-grid step4-prediction-grid"><button>Yes</button><button>No, the corner now stands for the carbon</button><button>I am not sure yet</button></div></div><nav id="watchControls"><button class="control-btn">Back</button><button class="control-btn">Replay</button><button class="control-btn">Pause</button><button class="control-btn">Next</button></nav></main></body></html>',{runScripts:"outside-only",pretendToBeVisual:true,url:"https://example.test/course-units/unit1/bond-line/"});
evalFile(phoneDom.window,"course-units/unit1/bond-line/bond-line-phone-release-fix.js");
var phoneDoc=phoneDom.window.document;
check("Step 4 repair adds explicit teaching before another question",!!phoneDoc.querySelector("[data-step4-idk-teaching]")&&/corner did not move/i.test(phoneDoc.querySelector("[data-step4-idk-teaching]").textContent));
check("Step 4 repair replaces the repeated original question with a simpler check",/Which statement is true/i.test(phoneDoc.getElementById("step4PredictionPrompt").textContent)&&!/Did the carbon atom disappear\?/.test(phoneDoc.getElementById("step4PredictionPrompt").textContent));
var phoneLabels=Array.prototype.map.call(phoneDoc.querySelectorAll(".step4-prediction-grid button"),function(b){return b.textContent.trim();});
check("Step 4 repair gives a concrete same-corner answer",phoneLabels.indexOf("The same corner is still the carbon")!==-1);
check("Step 4 unsure becomes an explicit show-me-again action",phoneLabels.indexOf("Show me the same-position example again")!==-1);
check("Step 4 repair is idempotent and cannot duplicate its teaching card",phoneDoc.querySelectorAll("[data-step4-idk-teaching]").length===1);
phoneDom.window.close();

console.log("\n=== SUMMARY: "+(failed?"FAIL":"PASS")+" ===");if(failed)process.exit(1);
