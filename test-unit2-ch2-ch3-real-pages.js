'use strict';
const assert=require('assert'),fs=require('fs'),J=require('jsdom'),JSDOM=J.JSDOM,ResourceLoader=J.ResourceLoader,VirtualConsole=J.VirtualConsole;
class RepoLoader extends ResourceLoader{fetch(url){const u=new URL(url),p=decodeURIComponent(u.pathname).replace(/^\//,'');if(fs.existsSync(p)&&fs.statSync(p).isFile())return Promise.resolve(Buffer.from(fs.readFileSync(p)));return null;}}
async function tick(ms=12){await new Promise(r=>setTimeout(r,ms));}
function submit(d,value){const form=d.querySelector('[data-answer]');assert(form,'answer form exists');const input=form.querySelector('input');assert(input,'answer input exists');input.value=value;form.dispatchEvent(new d.defaultView.Event('submit',{bubbles:true,cancelable:true}));}
async function boot(path){const html=fs.readFileSync(path,'utf8'),errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(String(e&&e.message||e)));const dom=new JSDOM(html,{url:'https://example.test/'+path.replace(/index\.html$/,''),runScripts:'dangerously',resources:new RepoLoader(),pretendToBeVisual:true,virtualConsole:vc});const w=dom.window,d=w.document;w.addEventListener('error',e=>errors.push(String(e.error||e.message)));await new Promise(resolve=>{if(d.readyState==='complete')return resolve();w.addEventListener('load',resolve,{once:true});setTimeout(resolve,1200);});await tick();return{html,dom,w,d,errors};}
(async()=>{
 console.log('=== CHAPTER 2 REAL PAGE ===');
 let x=await boot('course-units/unit2/chapter2-resonance/index.html'),w=x.w,d=x.d;
 assert(w.StudentModelIdkRouter,'Chapter 2 loads shared Student Model');
 assert(w.Chapter2AdaptiveEngine&&w.Chapter2AdaptiveEngine===w.Test1AdaptiveEngine,'Chapter 2 adopts exact existing adaptive engine');
 assert(w.Chapter2AdaptiveData&&w.Chapter2AdaptiveSupport&&w.Chapter2Visuals,'Chapter 2 curriculum, support, and visuals load');
 assert.strictEqual(d.querySelectorAll('[data-open]').length,5,'Chapter 2 renders five course skills');
 assert(d.querySelector('[data-unit-nav]')&&d.querySelector('[data-home-nav]'),'Chapter 2 shared navigation loads');
 assert(d.querySelector('[data-periodic-tool]')&&d.querySelector('[data-help-tool]'),'Chapter 2 shared learner tools load');
 d.querySelector('[data-open="rank-resonance"]').click();await tick();
 assert(/Quick Diagnostic/.test(d.getElementById('phaseLabel').textContent),'Chapter 2 starts with diagnostic');
 assert(d.querySelector('.chem-visual'),'Chapter 2 diagnostic has structured chemistry visual');
 submit(d,'wrong');await tick();
 assert(d.querySelector('.diagnosis-card'),'wrong Chapter 2 diagnostic opens exact-step diagnosis');
 assert.strictEqual(d.querySelectorAll('[data-reason]').length,6,'Chapter 2 exposes all six learner reasons');
 d.querySelector('[data-reason="explanation_not_making_sense"]').click();await tick();
 assert(d.querySelector('.repair-card'),'Chapter 2 changed-explanation route opens repair');
 assert(/Different representation first/i.test(d.querySelector('.repair-card').textContent),'Chapter 2 repair visibly changes representation first');
 assert(d.querySelector('.chem-visual'),'Chapter 2 repair includes structured visual support');
 let saved=w.localStorage.getItem('chm221.unit2.chapter2.rank-resonance.v1');assert(saved,'Chapter 2 session saves under its own page-level key');
 assert(JSON.parse(saved).repair&&JSON.parse(saved).repair.active,'Chapter 2 saved record preserves active repair state');
 d.querySelector('[data-back-skills]').click();await tick();d.querySelector('[data-open="rank-resonance"]').click();await tick();
 assert(d.querySelector('.repair-card'),'Chapter 2 reopening the skill resumes the saved repair instead of restarting');
 assert(/Targeted repair/i.test(d.querySelector('.repair-card').textContent),'Chapter 2 resume restores the exact learning phase');
 assert.strictEqual(x.errors.length,0,'Chapter 2 real page has no uncaught runtime errors: '+x.errors.join(' | '));
 x.dom.window.close();

 console.log('=== CHAPTER 3 REAL PAGE ===');
 x=await boot('course-units/unit2/chapter3/index.html');w=x.w;d=x.d;
 assert(w.StudentModelIdkRouter,'Chapter 3 loads shared Student Model');
 assert(w.Chapter3AdaptiveEngine&&w.Chapter3AdaptiveEngine===w.Test1AdaptiveEngine,'Chapter 3 adopts exact existing adaptive engine');
 assert(w.Chapter3AdaptiveData&&w.Chapter3AdaptiveSupport&&w.Chapter3Visuals,'Chapter 3 curriculum, support, and visuals load');
 assert.strictEqual(d.querySelectorAll('[data-open]').length,12,'Chapter 3 renders twelve course skills');
 assert(d.querySelector('[data-unit-nav]')&&d.querySelector('[data-home-nav]'),'Chapter 3 shared navigation loads');
 d.querySelector('[data-open="pka-acidity"]').click();await tick();
 assert(d.querySelector('.chem-visual'),'Chapter 3 pKa lesson renders a structured pKa visual');
 submit(d,'wrong');await tick();
 assert(d.querySelector('.diagnosis-card'),'wrong Chapter 3 diagnostic opens diagnosis');
 d.querySelector('[data-reason="forgot_prerequisite"]').click();await tick();
 assert(d.querySelector('.repair-card'),'Chapter 3 prerequisite reason opens targeted repair');
 const foundation=d.querySelector('.foundation-link');assert(foundation&&/day4\/$/.test(foundation.getAttribute('href')),'Chapter 3 pKa prerequisite routes to existing Day 4');
 let c3saved=w.localStorage.getItem('chm221.unit2.chapter3.pka-acidity.v1');assert(c3saved,'Chapter 3 session saves under its own page-level key');
 assert.strictEqual(w.localStorage.getItem('chm221.unit2.chapter2.rank-resonance.v1'),null,'Chapter 3 storage namespace cannot overwrite Chapter 2 namespace');
 d.querySelector('[data-back-skills]').click();await tick();d.querySelector('[data-open="pka-acidity"]').click();await tick();
 assert(d.querySelector('.repair-card'),'Chapter 3 reopening resumes saved repair');
 d.querySelector('[data-back-skills]').click();await tick();d.querySelector('[data-open="stability-orbitals"]').click();await tick();
 assert(d.querySelector('.chem-visual')&&/s character/i.test(d.querySelector('.chem-visual').textContent),'Chapter 3 orbital lesson renders s-character comparison');
 assert.strictEqual(x.errors.length,0,'Chapter 3 real page has no uncaught runtime errors: '+x.errors.join(' | '));
 x.dom.window.close();

 console.log('=== MOBILE AND ENGINE BOUNDARY ===');
 const css=fs.readFileSync('course-units/unit2/adaptive-chapter.css','utf8'),app=fs.readFileSync('course-units/unit2/adaptive-chapter-app.js','utf8'),c2html=fs.readFileSync('course-units/unit2/chapter2-resonance/index.html','utf8'),c3html=fs.readFileSync('course-units/unit2/chapter3/index.html','utf8');
 assert(/@media\(max-width:860px\)[\s\S]*\.topbar\{position:static/.test(css),'tablet/phone header scrolls away');
 assert(/@media\(max-width:620px\)[\s\S]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/.test(css),'phone learner tools compact to four controls');
 assert(/min-height:48px/.test(css),'primary touch targets stay at least 48px');
 assert(c2html.includes('../../unit1/test1/test1-engine.js')&&c3html.includes('../../unit1/test1/test1-engine.js'),'both pages load exact existing engine file');
 assert(!/evaluateMastery|MIN_RETRIEVAL_DELAY_MS\s*=|recordIndependentAttempt\s*=/.test(app),'new learner shell contains no mastery or retrieval-policy implementation');
 assert(/localStorage\.setItem\(key\(active\.lessonId\)/.test(app),'new learner shell preserves page-level localStorage save pattern');
 console.log('PASS  Chapter 2 and Chapter 3 real pages save, resume, teach visually, and preserve the frozen engine boundary');
})().catch(e=>{console.error(e);process.exit(1);});
