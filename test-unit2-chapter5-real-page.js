'use strict';
const assert=require('assert'),fs=require('fs'),J=require('jsdom'),JSDOM=J.JSDOM,ResourceLoader=J.ResourceLoader,VirtualConsole=J.VirtualConsole;
const html=fs.readFileSync('course-units/unit2/chapter5/index.html','utf8'),errors=[];
class RepoLoader extends ResourceLoader{fetch(url){const u=new URL(url),p=decodeURIComponent(u.pathname).replace(/^\//,'');if(fs.existsSync(p)&&fs.statSync(p).isFile())return Promise.resolve(Buffer.from(fs.readFileSync(p)));return null;}}
const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(String(e&&e.message||e)));
function submit(d,value){const form=d.querySelector('[data-answer]');assert(form,'answer form exists');const input=form.querySelector('input');assert(input,'answer input exists');input.value=value;form.dispatchEvent(new d.defaultView.Event('submit',{bubbles:true,cancelable:true}));}
async function tick(){await new Promise(r=>setTimeout(r,12));}
(async()=>{
 const dom=new JSDOM(html,{url:'https://example.test/course-units/unit2/chapter5/',runScripts:'dangerously',resources:new RepoLoader(),pretendToBeVisual:true,virtualConsole:vc});
 const w=dom.window,d=w.document;w.addEventListener('error',e=>errors.push(String(e.error||e.message)));
 await new Promise(resolve=>{if(d.readyState==='complete')return resolve();w.addEventListener('load',resolve,{once:true});setTimeout(resolve,900);});await tick();
 assert(w.StudentModelIdkRouter,'shared Student Model loads');
 assert(w.Chapter5AdaptiveData,'Chapter 5 curriculum loads');
 assert(w.Chapter5CoreData&&w.Chapter5ScopeData,'core and current-edition scope data both load');
 assert(w.Chapter5AdaptiveSupport,'Chapter 5 support loads');
 assert(w.Chapter5CoreSupport&&w.Chapter5ScopeSupport,'core and current-edition support layers both load');
 assert(w.Chapter5EngineBridge,'Chapter 5 engine bridge loads');
 assert(w.Chapter5AdaptiveEngine,'Chapter 5 adopts the adaptive runtime');
 assert.strictEqual(w.Chapter5AdaptiveEngine,w.Test1AdaptiveEngine,'Chapter 5 uses the exact existing adaptive engine object');
 assert(w.Chapter5VisualData&&w.Chapter5Visuals,'structured Chapter 5 visual layers load');
 assert(w.Chapter5CoreVisualData&&w.Chapter5ScopeVisualData,'core and current-edition visual data both load');
 assert(w.LearnerTools,'shared learner tools load');
 assert.strictEqual(w.Chapter5AdaptiveData.lessonIds().length,10,'runtime curriculum exposes ten current-edition Chapter 5 skills');
 assert.strictEqual(d.querySelectorAll('[data-open]').length,10,'real page renders ten Chapter 5 skill cards');
 assert(d.querySelector('[data-open="enantiomer-mixtures-quantitative"]'),'specific rotation and ee skill card is learner-facing');
 assert(d.querySelector('[data-open="other-chirality"]'),'other chirality skill card is learner-facing');
 assert(d.querySelector('[data-unit-nav]'),'Unit 2 nav visible');
 assert(d.querySelector('[data-home-nav]'),'Home nav visible');
 assert(d.querySelector('[data-periodic-tool]'),'Periodic Table visible');
 assert(d.querySelector('[data-help-tool]'),'Help visible');

 // Real wrong-answer -> diagnosis -> changed-representation repair -> Watch path.
 d.querySelector('[data-open="isomer-classification"]').click();await tick();
 assert(/Quick Diagnostic/.test(d.getElementById('phaseLabel').textContent),'Chapter 5 skill starts with diagnostic');
 assert(/same molecular formula but different atom connectivity/i.test(d.querySelector('.prompt').textContent),'first diagnostic starts with connectivity reasoning');
 submit(d,'stereoisomers');await tick();
 assert(d.querySelector('.diagnosis-card'),'wrong diagnostic visibly opens diagnosis');
 assert(/connectivity check/i.test(d.querySelector('.diagnosis-card').textContent),'diagnosis names the exact connectivity step');
 assert.strictEqual(d.querySelectorAll('[data-reason]').length,6,'all six learner support reasons are available');
 d.querySelector('[data-reason="explanation_not_making_sense"]').click();await tick();
 assert(d.querySelector('.repair-card'),'support choice opens targeted repair');
 assert(/switch representation|neighbor list|number/i.test(d.querySelector('.repair-card').textContent),'repair visibly changes representation instead of repeating the probe');
 assert(!/Two compounds have the same molecular formula but different atom connectivity\. What relationship do they have\?/i.test(d.querySelector('.repair-check .prompt').textContent),'repair check is not the identical original question');
 submit(d,'connectivity');await tick();
 assert(/Watch/.test(d.getElementById('phaseLabel').textContent),'passing repair enters Watch rather than replaying diagnostic');
 assert(d.querySelector('.stereo-visual'),'Watch contains a real stereochemistry visual');
 assert(d.querySelector('.connect-visual'),'connectivity Watch uses structured two-structure comparison visual');

 // Clean diagnostic fast-track then cold IDK must contaminate and teach before a fresh item.
 d.querySelector('[data-back-skills]').click();await tick();
 d.querySelector('[data-open="chirality-stereocenters"]').click();await tick();
 submit(d,'yes');await tick();submit(d,'no');await tick();
 assert(/Cold Independent/.test(d.getElementById('phaseLabel').textContent),'2/2 clean chirality diagnostic fast-tracks to cold confirmation');
 const coldPrompt=d.querySelector('.prompt').textContent;
 d.querySelector('[data-help]').click();await tick();
 assert(d.querySelector('.cold-choice'),'cold I-dont-know first asks what kind of stuck this is');
 assert(!d.querySelector('.repair-card'),'opening cold help chooser alone does not silently pick an intervention');
 d.querySelector('.cold-choice [data-reason="dont_know_how_to_start"]').click();await tick();
 assert(d.querySelector('.repair-card'),'choosing a cold reason opens targeted teaching');
 assert(/start|four-different|substituent/i.test(d.querySelector('.repair-card').textContent),'cold repair teaches the first broken step');
 assert(!d.querySelector('.repair-card').textContent.includes(coldPrompt),'cold repair does not simply repeat the cold item');
 submit(d,'no');await tick();
 assert(/Cold Independent/.test(d.getElementById('phaseLabel').textContent),'successful cold repair returns to Independent');
 assert.notStrictEqual(d.querySelector('.prompt').textContent,coldPrompt,'post-help cold item is fresh');

 // Force a spatial R/S guided item through the real learner UI and verify the visual carries orientation.
 d.querySelector('[data-back-skills]').click();await tick();
 let rs=w.Chapter5AdaptiveEngine.createSession('cip-rs',Date.now());w.Chapter5AdaptiveEngine.setPhase(rs,'guided');rs.guidedIndex=1;
 w.localStorage.setItem('chm221.unit2.chapter5.cip-rs.v1',JSON.stringify(rs));
 d.querySelector('[data-open="cip-rs"]').click();await tick();
 assert(/Guided Practice/.test(d.getElementById('phaseLabel').textContent),'forced spatial case is on real Guided Practice');
 assert(d.querySelector('.rs-visual'),'R/S guided item renders a structured orientation visual');
 assert(/away/i.test(d.querySelector('.rs-visual').textContent),'R/S visual explicitly shows priority 4 direction');
 assert(/counterclockwise/i.test(d.querySelector('.rs-visual').textContent),'R/S visual explicitly shows the 1-2-3 turn');

 // Current-edition quantitative extension must be real learner content, not an orphaned data file.
 d.querySelector('[data-back-skills]').click();await tick();
 d.querySelector('[data-open="enantiomer-mixtures-quantitative"]').click();await tick();
 assert(/Quick Diagnostic/.test(d.getElementById('phaseLabel').textContent),'specific-rotation skill starts with the same quick diagnostic contract');
 assert(/observed rotation/i.test(d.querySelector('.prompt').textContent),'specific-rotation diagnostic is visible');
 assert(d.querySelector('.polarimetry-visual'),'specific-rotation diagnostic renders a structured equation visual');
 submit(d,'wrong');await tick();
 assert(/specific-rotation setup/i.test(d.querySelector('.diagnosis-card').textContent),'wrong quantitative answer identifies specific-rotation setup');
 d.querySelector('[data-reason="explanation_not_making_sense"]').click();await tick();
 assert(/Switch representation:/i.test(d.querySelector('.repair-card').textContent),'quantitative explanation failure visibly changes representation');
 assert(/numerator or denominator/i.test(d.querySelector('.repair-check .prompt').textContent),'quantitative repair uses a smaller setup check rather than repeating arithmetic');
 submit(d,'denominator');await tick();
 assert(/Watch/.test(d.getElementById('phaseLabel').textContent),'passing quantitative repair enters Watch');
 assert(d.querySelector('.polarimetry-visual'),'specific-rotation Watch retains structured equation teaching');

 // Current-edition other-chirality extension must render axial and dynamic reasoning.
 d.querySelector('[data-back-skills]').click();await tick();
 let oc=w.Chapter5AdaptiveEngine.createSession('other-chirality',Date.now());w.Chapter5AdaptiveEngine.setPhase(oc,'guided');oc.guidedIndex=0;
 w.localStorage.setItem('chm221.unit2.chapter5.other-chirality.v1',JSON.stringify(oc));
 d.querySelector('[data-open="other-chirality"]').click();await tick();
 assert(/Guided Practice/.test(d.getElementById('phaseLabel').textContent),'other-chirality extension runs on real Guided Practice');
 assert(/allene/i.test(d.querySelector('.prompt').textContent),'other-chirality guided case asks about an allene');
 assert(d.querySelector('.allene-visual'),'allene case renders a structured chirality-axis visual');
 assert(/terminal carbon/i.test(d.querySelector('.allene-visual').textContent),'allene visual makes the terminal-carbon check explicit');

 let dyn=w.Chapter5AdaptiveEngine.createSession('other-chirality',Date.now());w.Chapter5AdaptiveEngine.setPhase(dyn,'guided');dyn.guidedIndex=1;
 w.localStorage.setItem('chm221.unit2.chapter5.other-chirality.v1',JSON.stringify(dyn));
 d.querySelector('[data-back-skills]').click();await tick();d.querySelector('[data-open="other-chirality"]').click();await tick();
 assert(d.querySelector('.dynamic-visual'),'dynamic chirality case renders a structured interconversion visual');
 assert(/ordinary low-barrier rotation/i.test(d.querySelector('.dynamic-visual').textContent),'dynamic visual distinguishes conformational interconversion from fixed configuration');

 // Mobile safeguards are source contracts while real phone/iPad remains the release gate.
 assert(/@media\(max-width:860px\)[\s\S]*\.topbar\{position:static/.test(html),'tablet/phone layout lets the tall header scroll away');
 assert(/@media\(max-width:620px\)[\s\S]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/.test(html),'phone learner tools compact to a four-control row');
 assert(/min-height:48px/.test(html),'primary learner controls retain touch-sized targets');
 assert(html.indexOf('chapter5-scope-data.js')!==-1&&html.indexOf('chapter5-scope-support.js')!==-1&&html.indexOf('chapter5-scope-visual-data.js')!==-1,'real page loads all current-edition scope layers before the engine');
 assert(html.indexOf('../../unit1/test1/test1-engine.js')!==-1,'learner page loads exact existing adaptive engine file');
 assert(html.indexOf('chapter5-engine.js')===-1,'learner page does not load a copied Chapter 5 engine');
 assert.strictEqual(errors.length,0,'real Chapter 5 page has no uncaught runtime errors: '+errors.join(' | '));
 console.log('PASS  Real Chapter 5 page: ten-skill current-edition scope, locked engine, structured visual teaching, six-way IDK repair, fresh cold evidence, and mobile safeguards work in production script order');
 dom.window.close();
})().catch(e=>{console.error(e);process.exit(1);});
