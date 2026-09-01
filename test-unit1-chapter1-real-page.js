"use strict";
var assert=require("assert"),fs=require("fs");
var J=require("jsdom"),JSDOM=J.JSDOM,ResourceLoader=J.ResourceLoader,VirtualConsole=J.VirtualConsole;
var html=fs.readFileSync("course-units/unit1/chapter1/index.html","utf8"),errors=[];
class RepoLoader extends ResourceLoader{fetch(url){var u=new URL(url),p=decodeURIComponent(u.pathname).replace(/^\//,"");if(fs.existsSync(p)&&fs.statSync(p).isFile())return Promise.resolve(Buffer.from(fs.readFileSync(p)));return null;}}
var vc=new VirtualConsole();vc.on("jsdomError",function(e){errors.push(String(e&&e.message||e));});
function submit(form){form.dispatchEvent(new form.ownerDocument.defaultView.Event("submit",{bubbles:true,cancelable:true}));}
(async function(){
  var dom=new JSDOM(html,{url:"https://example.test/course-units/unit1/chapter1/",runScripts:"dangerously",resources:new RepoLoader(),pretendToBeVisual:true,virtualConsole:vc});
  var w=dom.window,d=w.document;w.addEventListener("error",function(e){errors.push(String(e.error||e.message));});
  await new Promise(function(resolve){if(d.readyState==="complete")return resolve();w.addEventListener("load",resolve,{once:true});setTimeout(resolve,700);});
  await new Promise(function(r){setTimeout(r,60);});

  assert(w.Chapter1TeachingData,"real page loads Chapter 1 curriculum");
  assert(w.Chapter1TeachingEngine,"real page loads Chapter 1 teaching engine");
  assert(w.Chapter1TeachingPolicy,"real page loads Chapter 1 evidence policy before app use");
  assert(w.Chapter1SupportedTeaching,"real page loads targeted supported-teaching plans");
  assert(w.LearnerTools,"real page loads shared learner tools");
  assert.strictEqual(d.querySelectorAll("[data-open-lesson]").length,2,"real page renders two Chapter 1 lessons");
  assert(d.querySelector("[data-unit-nav]"),"real page shows Unit 1 navigation");
  assert(d.querySelector("[data-home-nav]"),"real page shows Home navigation");
  assert(d.querySelector("[data-periodic-tool]"),"real page shows Periodic Table");
  assert(d.querySelector("[data-help-tool]"),"real page shows Help");

  d.querySelector('[data-open-lesson="lewis"]').click();
  assert(/Watch/.test(d.getElementById("phaseLabel").textContent),"Lewis opens in Watch teaching, not a quiz");
  var watchAnswers=["Oxygen","Count total valence electrons","8","2"];
  for(var i=0;i<watchAnswers.length;i++){
    var next=d.getElementById("nextWatch");
    assert(next.disabled,"Watch cannot advance before the learner does something with teaching step "+(i+1));
    var choice=[].find.call(d.querySelectorAll('[data-watch-choice]'),function(b){return b.textContent.trim()===watchAnswers[i];});
    assert(choice,"Watch exposes the expected low-risk interaction at step "+(i+1));choice.click();
    assert(!d.getElementById("nextWatch").disabled,"correct Watch interaction unlocks learner-controlled Next at step "+(i+1));
    d.getElementById("nextWatch").click();
  }
  assert(/Supported Concept Check/.test(d.getElementById("phaseLabel").textContent),"final Watch interaction opens supported concept check");
  assert(d.body.textContent.includes("A wrong answer becomes information about what to teach next"),"supported check tells learner misses are diagnostic, not dead ends");

  // Reproduce the iPad failure: wrong oxygen valence must visibly teach instead of doing nothing.
  var form=d.querySelector('[data-answer-form]');form.querySelector('input[name="v"]').value="5";submit(form);
  assert(d.querySelector('[data-supported-diagnosis]'),"wrong supported answer immediately opens visible diagnosis");
  assert(d.body.textContent.includes("Valence-electron count"),"wrong oxygen answer identifies the first broken step");
  assert(d.body.textContent.includes("not going to mark it wrong and stare at you"),"wrong answer explicitly behaves as tutoring rather than a gated worksheet");
  assert(d.getElementById("supportedRetry"),"first supported miss can be treated as a possible slip");
  d.getElementById("supportedDiagnose").click();
  assert.strictEqual(d.querySelectorAll('[data-supported-reason]').length,6,"teaching stage exposes all six IDK reasons");

  d.querySelector('[data-supported-reason="forgot_prerequisite"]').click();
  assert(d.querySelector('[data-supported-teach]'),"selected reason opens targeted teaching before another answer");
  assert(d.body.textContent.includes("H=1, C=4, N=5, O=6"),"prerequisite route teaches the exact valence deficit");
  assert(d.body.textContent.includes("Quick repair")||d.body.textContent.includes("smaller idea"),"targeted teaching includes a low-risk repair check");
  var repair=d.querySelector('.repair-mini [data-answer-form]');repair.querySelector('input[name="x"]').value="5";submit(repair);
  assert(d.body.textContent.includes("One lone pair contains"),"passing repair moves to a different concept item instead of repeating the failed oxygen question");
  assert(!d.body.textContent.includes("How many valence electrons does neutral oxygen contribute?"),"original failed supported item is not immediately repeated after repair");

  // Finish supported concept and prove Build Together has different learner-facing behavior.
  form=d.querySelector('[data-answer-form]');form.querySelector('input').value="2";submit(form);
  form=d.querySelector('[data-answer-form]');form.querySelector('input').value="2";submit(form);
  assert(/Build Together/.test(d.getElementById("phaseLabel").textContent),"concept check advances into a distinct Build Together phase");
  assert(d.body.textContent.includes("We are doing one decision at a time"),"Build Together is not rendered as the same generic quiz");
  form=d.querySelector('[data-answer-form]');form.querySelector('input').value="7";submit(form);
  assert(d.querySelector('[data-supported-diagnosis]'),"wrong Build Together step stops on the broken step");
  assert(d.body.textContent.includes("Total valence-electron budget"),"Build Together identifies the exact electron-budget deficit");
  assert.strictEqual(d.querySelectorAll('[data-supported-reason]').length,6,"Build Together immediately asks why that specific step broke");

  var saved=JSON.parse(w.localStorage.getItem('chm221.chapter1.lewis.v1'));
  var independentSuccesses=(saved.skill&&saved.skill.independentSuccesses)||[];
  assert.strictEqual(independentSuccesses.length,0,"supported diagnosis and repair create no cold independent mastery evidence");
  assert.strictEqual(errors.length,0,"real Chapter 1 production bootstrap has no uncaught runtime errors: "+errors.join(" | "));
  console.log("PASS  Real Chapter 1 page restores adaptive teaching: Watch interaction, wrong-answer diagnosis, six-way support, targeted repair, fresh handoff, and distinct Build Together");
  dom.window.close();
})().catch(function(e){console.error(e);process.exit(1);});