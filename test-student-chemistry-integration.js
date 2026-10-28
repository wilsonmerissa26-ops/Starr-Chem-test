"use strict";
const fs=require("fs");
const assert=require("assert");
const vm=require("vm");
const appHtml=fs.readFileSync("student-app/index.html","utf8");
const appSource=fs.readFileSync("student-app/app.js","utf8");
const coachHtml=fs.readFileSync("unit3-coach/index.html","utf8");
assert.match(appHtml,/<section id="chemistry" class="screen">/);
const sidebar = appHtml.match(/<nav aria-label="App navigation">([\s\S]*?)<\/nav>/);
const bottomBar = appHtml.match(/<div class="mobilebar" aria-label="Bottom navigation">([\s\S]*?)<\/div>/);
assert(sidebar && bottomBar,"both iPad and desktop navigation are present");
for (const fragment of [sidebar[1],bottomBar[1]]) {
 const keys=[...fragment.matchAll(/data-go="([^"]+)"/g)].map(x=>x[1]);
 assert.deepStrictEqual(keys,["today","subjects","calendar","settings"],"four familiar navigation choices");
}
assert.match(appHtml,/class="grid home-classes"/,"simple class-first home screen exists");
assert.match(appHtml,/<button[^>]*data-go="chemistry"[^>]*>Start Chemistry/,"Chemistry has a clear primary action");
assert.match(appHtml,/<button[^>]*data-subject="ap"[^>]*>Open A&amp;P/,"A&P is visible on the home screen");
assert.match(appHtml,/<details class="home-more">/,"optional recommendations are available without clutter");

assert.match(appHtml,/<section id="resource" class="screen">/,"in-app resource classroom exists");
for(const key of ["day1","foundation","unit1","physiology"]) assert.match(appHtml,new RegExp('data-resource="'+key+'"'),"resource "+key+" is reachable inside the app");
assert.match(appHtml,/data-src="\.\.\/unit3-coach\/\?embed=1"/);
assert.match(appHtml,/id="chem-weak-list"/);
assert.match(appSource,/astarryia-unit3-v1/);
assert.match(coachHtml,/astarryia-unit3-bridge/);
assert.match(coachHtml,/u3s.lastQuiz=\{module:u3s.module/);
assert.match(coachHtml,/body.classList.add\("unit3-embedded"\)/);
for(const match of coachHtml.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)){
  new vm.Script(match[1],{filename:"unit3-inline"});
}
const els=new Map();
function element(key){
  if(!els.has(key))els.set(key,{
    style:{},attrs:{},dataset:{src:"../unit3-coach/?embed=1"},contentWindow:{},
    classList:{toggle(){}},innerHTML:"",textContent:"",value:"",
    addEventListener(type,fn){this[type]=fn},
    getAttribute(k){return this.attrs[k]||null},setAttribute(k,v){this.attrs[k]=v},
    focus(){},reset(){}
  });
  return els.get(key);
}
const document={
 querySelector:element,querySelectorAll(){return[]},
 addEventListener(type,fn){this[type]=fn}
};
const localMap=new Map();
const localStorage={
 getItem(key){return localMap.has(key)?localMap.get(key):null},
 setItem(key,value){localMap.set(key,value)}
};
const handlers={};
const window={addEventListener(k,fn){handlers[k]=fn},scrollTo(){}};
const location={hash:"",protocol:"http:",origin:"https://wilsonmerissa26-ops.github.io"};
const history={replaceState(){}};
class FixedDate extends Date{
 constructor(...args){super(...(args.length?args:["2026-10-26T16:00:00.000Z"]))}
 static now(){return new Date("2026-10-26T16:00:00Z").getTime()}
}
const ctx={document,window,location,history,localStorage,Date:FixedDate,
 navigator:{},console,alert(message){throw Error(message)},confirm(){return true}};
vm.runInNewContext(appSource,ctx,{filename:"student-app/app.js"});
async function flush(){for(let i=0;i<8;i++)await Promise.resolve();}
(async()=>{
 await flush();
 assert.match(element("#coach-today").innerHTML,/The 5-check reaction triage/,"first lesson is recommended when not started");
 assert.match(element("#calendar-grid").innerHTML,/Learn \+ practice/,"study calendar includes coach plan");
 document.click({target:{closest(sel){return sel==="[data-go]"?{dataset:{go:"chemistry"}}:null}}});
 assert.equal(element("#coach-frame").attrs.src,"../unit3-coach/?embed=1");
 document.click({target:{closest(sel){return sel==="[data-resource]"?{dataset:{resource:"physiology"}}:null}}});
 assert.equal(element("#resource-frame").attrs.src,"../physiology-song-lab/","A&P lab opens in the app frame");
 assert.match(element("#resource-title").textContent,/Anatomy & Physiology/);
 document.click({target:{closest(sel){return sel==="[data-resource]"?{dataset:{resource:"foundation"}}:null}}});
 assert.equal(element("#resource-frame").attrs.src,"../course-hub/","all Chemistry foundation days open in the app frame");
 document.click({target:{closest(sel){return sel==="[data-resource]"?{dataset:{resource:"unit1"}}:null}}});
 assert.equal(element("#resource-frame").attrs.src,"../course-units/unit1/","Unit 1 lessons open in the app frame");

 // Evidence as the coach saves it: module 1 answered correctly on first try, module 2 mostly wrong on first try.
 const ev=Array.from({length:8},(_,i)=>({index:i,status:"not-started",firstTry:0,firstTryCorrect:0}));
 ev[0]={index:0,status:"strong",firstTry:4,firstTryCorrect:4};ev[1]={index:1,status:"needs-review",firstTry:4,firstTryCorrect:1};
 const snap={module:1,mode:"quiz",attempts:{"0":{n:4,c:4},"1":{n:4,c:1}},wrong:{"1-0":2},evidence:ev,evidenceVersion:2,lastQuiz:{module:1,correct:1,total:4,completedAt:"2026-10-26T14:00:00Z"}};
 localStorage.setItem("astarryia-unit3-v1",JSON.stringify(snap));
 handlers.message({origin:location.origin,source:element("#coach-frame").contentWindow,
   data:{source:"astarryia-unit3-bridge",type:"progress",version:1}});
 assert.equal(element("#chem-progress-title").textContent,"1 / 8 modules with strong first-try evidence");
 assert.match(element("#coach-today").innerHTML,/Review weak lesson: Energy diagrams \+ thermodynamics/);
 assert.match(element("#calendar-grid").innerHTML,/Energy diagrams \+ thermodynamics/);
 assert.match(element("#chem-weak-list").innerHTML,/First try: 1\/4/);
 // A record saved before the evidence system (4 of 4 correct, no first-try data) is practice only, never strong evidence.
 localStorage.setItem("astarryia-unit3-v1",JSON.stringify({attempts:{"0":{n:4,c:4}},latestByModule:{"0":{module:0,correct:4,total:4}}}));
 handlers.message({origin:location.origin,source:element("#coach-frame").contentWindow,data:{source:"astarryia-unit3-bridge",type:"progress",version:1}});
 assert.equal(element("#chem-progress-title").textContent,"0 / 8 modules with strong first-try evidence","old records never count as evidence");
 localStorage.setItem("astarryia-unit3-v1",JSON.stringify(snap));
 handlers.message({origin:location.origin,source:element("#coach-frame").contentWindow,data:{source:"astarryia-unit3-bridge",type:"progress",version:1}});
 const before=element("#chem-progress-title").textContent;
 localStorage.setItem("astarryia-unit3-v1",JSON.stringify({attempts:{"0":{n:4,c:4},"1":{n:4,c:4}}}));
 handlers.message({origin:"https://attacker.example",source:element("#coach-frame").contentWindow,
   data:{source:"astarryia-unit3-bridge",type:"progress",version:1}});
 assert.equal(element("#chem-progress-title").textContent,before,"untrusted origin cannot trigger refresh");
 handlers.message({origin:location.origin,source:element("#coach-frame").contentWindow,
   data:{source:"astarryia-unit3-bridge",type:"resize",height:2400}});
 assert.equal(element("#coach-frame").style.height,"2412px");
 assert(!localMap.has("dr-merissa-day1-state-v1"),"integration does not touch earlier course progress");
 console.log("AStarryia unified Chemistry app tests passed: calendar, embedded coach, quiz bridge, adaptive recommendation, origin gate, persistence isolation.");
})().catch(e=>{console.error(e);process.exitCode=1;});