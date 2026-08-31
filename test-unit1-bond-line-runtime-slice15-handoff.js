"use strict";

var fs=require("fs"),path=require("path"),JSDOM=require("jsdom").JSDOM;
var failed=0;
function check(label,condition){if(condition)console.log("PASS  "+label);else{console.log("FAIL  "+label);failed++;}}
function read(rel){return fs.readFileSync(path.join(__dirname,rel),"utf8");}

console.log("=== SLICE 15 TRANSFER -> LATER RETRIEVAL HANDOFF ===");
var dom=new JSDOM('<!doctype html><html><head></head><body><div id="phaseLabel">Transfer · complete</div><button id="nextBtn" disabled>Later Retrieval next</button></body></html>',{runScripts:"outside-only",pretendToBeVisual:true,url:"https://example.test/course-units/unit1/bond-line/"});
var win=dom.window,preparedWith=null,activity=false,due=5000,started=0;
var transferSession={skill:{id:"chem.representation.bond_line"}};
win.BondLineTransferUI={getSession:function(){return transferSession;}};
win.BondLineRetrievalUI={
  prepare:function(s){preparedWith=s;return{};},
  registerInterveningActivity:function(){activity=true;return{accepted:true};},
  readiness:function(now){if(!activity)return{ready:false,reason:"intervening_activity_required"};if(Number(now)<due)return{ready:false,reason:"retrieval_delay_not_met"};return{ready:true,reason:null};},
  startReady:function(){started++;win.document.getElementById("phaseLabel").textContent="Later Retrieval · BL-R1 · cold";return{started:true};}
};
win.eval(read("course-units/unit1/bond-line/bond-line-retrieval-handoff.js"));
var next=win.document.getElementById("nextBtn");
check("Transfer completion prepares retrieval with the exact live Transfer session",preparedWith===transferSession);
check("retrieval remains locked before intervening activity",next.disabled===true&&/another activity/i.test(next.textContent));
win.BondLineRetrievalHandoff.registerInterveningActivity("different_lesson",3000);
check("intervening activity alone does not unlock before delay",next.disabled===true&&/not due/i.test(next.textContent));
win.BondLineRetrievalHandoff.sync(6000);
check("both gates unlock one learner-controlled Later Retrieval button",next.disabled===false&&next.textContent==="Start Later Retrieval");
next.dispatchEvent(new win.MouseEvent("click",{bubbles:true,cancelable:true}));
check("click launches retrieval only after both gates",started===1&&/Later Retrieval · BL-R1 · cold/.test(win.document.getElementById("phaseLabel").textContent));
next.dispatchEvent(new win.MouseEvent("click",{bubbles:true,cancelable:true}));
check("delayed retrieval handoff is single-fire",started===1);
check("handoff contains no timer-driven auto-launch",read("course-units/unit1/bond-line/bond-line-retrieval-handoff.js").indexOf("setTimeout(")===-1&&read("course-units/unit1/bond-line/bond-line-retrieval-handoff.js").indexOf("setInterval(")===-1);

dom.window.close();
console.log("\n=== SUMMARY: "+(failed?"FAIL":"PASS")+" ===");if(failed)process.exit(1);
