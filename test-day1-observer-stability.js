"use strict";
const assert=require('assert');
const fs=require('fs');
const {JSDOM}=require('jsdom');

function source(path){return fs.readFileSync(path,'utf8');}
function wait(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
function observe(dom,root){let count=0;const obs=new dom.window.MutationObserver(records=>{count+=records.length;});obs.observe(root,{childList:true,subtree:true});return{count:()=>count,stop:()=>obs.disconnect()};}
async function settle(dom,tracker,label,max){await wait(90);tracker.stop();const n=tracker.count();assert(n<=max,label+' should settle instead of self-triggering; observed '+n+' child-list mutations');dom.window.close();return n;}

(async()=>{
  // Practice-end decoration used to set the same textContent after every mutation,
  // which made its own observer schedule another decoration forever.
  {
    const dom=new JSDOM('<!doctype html><div id="view"><button id="continueProblem">Continue</button></div>',{url:'https://example.test/day1/',runScripts:'outside-only'});
    dom.window.localStorage.setItem('dr-merissa-day1-ui-v5',JSON.stringify({mathArea:'fractions_percent',mathSessions:{fractions_percent:{problemCursor:6}}}));
    const root=dom.window.document.getElementById('view'),tracker=observe(dom,root);
    dom.window.eval(source('day1/practice-stop-v22.js'));
    await wait(15);
    assert.strictEqual(dom.window.document.getElementById('continueProblem').textContent,'Finish skill ✓','practice-end button is decorated');
    const n=await settle(dom,tracker,'practice-end observer',8);
    console.log('PASS  practice-end observer settles at '+n+' mutations');
  }

  // Fresh teaching examples used to rewrite already-correct visual text on every
  // observed mutation. The patched example should be written once and settle.
  {
    const html='<!doctype html><div id="view"><div class="card teacher"><div class="bubble"><div>Teacher intro</div></div></div><div class="card"><h2>Equation = balance</h2><div class="stage"><div class="visual small">7x + 2 = 3x + 26</div></div></div></div>';
    const dom=new JSDOM(html,{url:'https://example.test/day1/',runScripts:'outside-only'});
    dom.window.speechSynthesis={cancel(){},speak(){}};dom.window.SpeechSynthesisUtterance=function(t){this.text=t;};
    const root=dom.window.document.getElementById('view'),tracker=observe(dom,root);
    dom.window.eval(source('day1/fresh-teaching-examples-v21.js'));
    await wait(15);
    assert(/6x \+ 4 = 2x \+ 28/.test(root.querySelector('.visual.small').textContent),'fresh teaching example is applied');
    const n=await settle(dom,tracker,'fresh-teaching observer',8);
    console.log('PASS  fresh-teaching observer settles at '+n+' mutations');
  }

  // The targeted unit-conversion repair used to reassign the same corrected text
  // from inside an observer callback. Both corrected strings should settle.
  {
    const html='<!doctype html><div id="view"><div class="question">2.4 g to mg =</div><div data-guided-v13><h3>Guided step</h3><p>First identify which unit is smaller.</p><div data-v13-work><div class="warning"><p>What is the relationship between 1 g and mg?</p></div></div></div></div>';
    const dom=new JSDOM(html,{url:'https://example.test/day1/',runScripts:'outside-only'});
    const root=dom.window.document.getElementById('view'),tracker=observe(dom,root);
    dom.window.eval(source('day1/guided-unit-conversion-prompt-v26.js'));
    await wait(15);
    assert(/exact gram-to-milligram conversion factor/i.test(root.querySelector('[data-guided-v13] > p').textContent),'guided intro is repaired');
    assert(/How many milligrams are in 1 gram\?/i.test(root.querySelector('[data-v13-work] p').textContent),'guided step prompt is repaired');
    const n=await settle(dom,tracker,'guided-conversion observer',10);
    console.log('PASS  guided-conversion observer settles at '+n+' mutations');
  }

  // Summary evidence used to remove and recreate its own box on every observer
  // callback. With stored evidence it should create one stable box and stop.
  {
    const dom=new JSDOM('<!doctype html><div id="view"><div class="card"><h2>Day 1 Summary</h2></div></div>',{url:'https://example.test/day1/',runScripts:'outside-only'});
    dom.window.localStorage.setItem('dr-merissa-math-evidence-v23',JSON.stringify({areas:{algebra:{independentCorrect:2,supportedCorrect:1}}}));
    const root=dom.window.document.getElementById('view'),tracker=observe(dom,root);
    dom.window.eval(source('day1/math-evidence-v23.js'));
    await wait(15);
    assert.strictEqual(root.querySelectorAll('[data-math-evidence-v23]').length,1,'summary renders exactly one math-evidence box');
    assert(/2 independent/.test(root.querySelector('[data-math-evidence-v23]').textContent),'summary preserves stored evidence');
    const n=await settle(dom,tracker,'math-evidence observer',8);
    console.log('PASS  math-evidence observer settles at '+n+' mutations');
  }

  console.log('PASS  Day 1 observer stability regressions');
})().catch(err=>{console.error(err);process.exit(1);});
