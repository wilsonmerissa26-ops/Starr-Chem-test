"use strict";
var assert=require("assert"),fs=require("fs"),path=require("path");
var J=require("jsdom"),JSDOM=J.JSDOM,ResourceLoader=J.ResourceLoader,VirtualConsole=J.VirtualConsole;
var html=fs.readFileSync("course-units/unit1/chapter1/index.html","utf8"),errors=[];
class RepoLoader extends ResourceLoader{fetch(url){var u=new URL(url),p=decodeURIComponent(u.pathname).replace(/^\//,"");if(fs.existsSync(p)&&fs.statSync(p).isFile())return Promise.resolve(Buffer.from(fs.readFileSync(p)));return null;}}
var vc=new VirtualConsole();vc.on("jsdomError",function(e){errors.push(String(e&&e.message||e));});
(async function(){
  var dom=new JSDOM(html,{url:"https://example.test/course-units/unit1/chapter1/",runScripts:"dangerously",resources:new RepoLoader(),pretendToBeVisual:true,virtualConsole:vc});
  var w=dom.window,d=w.document;w.addEventListener("error",function(e){errors.push(String(e.error||e.message));});
  await new Promise(function(resolve){if(d.readyState==="complete")return resolve();w.addEventListener("load",resolve,{once:true});setTimeout(resolve,500);});
  await new Promise(function(r){setTimeout(r,50);});
  assert(w.Chapter1TeachingData,"real page loads Chapter 1 curriculum");
  assert(w.Chapter1TeachingEngine,"real page loads Chapter 1 teaching engine");
  assert(w.Chapter1TeachingPolicy,"real page loads Chapter 1 evidence policy before app use");
  assert(w.LearnerTools,"real page loads shared learner tools");
  assert.strictEqual(d.querySelectorAll("[data-open-lesson]").length,2,"real page renders two Chapter 1 lessons");
  assert(d.querySelector("[data-unit-nav]"),"real page shows Unit 1 navigation");
  assert(d.querySelector("[data-home-nav]"),"real page shows Home navigation");
  assert(d.querySelector("[data-periodic-tool]"),"real page shows Periodic Table");
  assert(d.querySelector("[data-help-tool]"),"real page shows Help");
  d.querySelector('[data-open-lesson="lewis"]').click();
  assert(/Watch/.test(d.getElementById("phaseLabel").textContent),"Lewis opens in Watch teaching, not a quiz");
  for(var i=0;i<4;i++){var btn=d.getElementById("nextWatch");assert(btn,"Watch has learner-controlled next button at step "+(i+1));btn.click();}
  assert(/Supported Concept Check/.test(d.getElementById("phaseLabel").textContent),"one learner click after final Watch step opens supported concept check");
  assert(d.querySelector("[data-answer-form]"),"supported concept check renders an actual learner response form");
  assert.strictEqual(errors.length,0,"real Chapter 1 production bootstrap has no uncaught runtime errors: "+errors.join(" | "));
  console.log("PASS  Real Chapter 1 learner page boots full production script order and reaches supported teaching");
  dom.window.close();
})().catch(function(e){console.error(e);process.exit(1);});