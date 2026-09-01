"use strict";
const assert=require('assert');
const fs=require('fs');
const {JSDOM,ResourceLoader,VirtualConsole}=require('jsdom');
const html=fs.readFileSync('day1/index.html','utf8');
const errors=[];
class RepoLoader extends ResourceLoader{
  fetch(url){
    const u=new URL(url);
    let p=decodeURIComponent(u.pathname).replace(/^\//,'');
    if(p.endsWith('/'))p+='index.html';
    if(fs.existsSync(p)&&fs.statSync(p).isFile())return Promise.resolve(Buffer.from(fs.readFileSync(p)));
    return null;
  }
}
const vc=new VirtualConsole();
vc.on('jsdomError',e=>errors.push(String(e&&e.message||e)));
async function tick(ms=20){await new Promise(r=>setTimeout(r,ms));}
function click(d,sel){const el=d.querySelector(sel);assert(el,'missing '+sel);el.dispatchEvent(new d.defaultView.MouseEvent('click',{bubbles:true,cancelable:true}));}
(async()=>{
  const dom=new JSDOM(html,{url:'https://example.test/day1/',runScripts:'dangerously',resources:new RepoLoader(),pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
    w.HTMLElement.prototype.scrollIntoView=function(){};
    w.print=function(){};
    w.speechSynthesis={cancel(){},speak(){}};
    w.SpeechSynthesisUtterance=function(t){this.text=t;this.rate=1;};
  }});
  const w=dom.window,d=w.document;
  w.addEventListener('error',e=>errors.push(String(e.error||e.message)));
  await new Promise(resolve=>{if(d.readyState==='complete')return resolve();w.addEventListener('load',resolve,{once:true});setTimeout(resolve,1200);});
  await tick(60);
  assert(w.Day1Orchestrator,'Day 1 orchestrator loads');
  assert(d.querySelector('#view'),'Day 1 view root exists');
  assert.strictEqual(d.querySelectorAll('#navTabs button').length,6,'Day 1 navigation renders six tabs');
  assert(/Day 1/i.test(d.body.textContent),'Day 1 initial home view renders');

  click(d,'#navTabs [data-view="math"]');await tick();
  assert(/Math Foundations/i.test(d.querySelector('#view').textContent),'Math tab renders without stalling');
  const firstArea=d.querySelector('[data-area]');
  assert(firstArea,'Math area choices render');
  firstArea.click();await tick();
  assert(d.querySelector('.card'),'Opening a math area renders a lesson card');

  click(d,'#navTabs [data-view="chemistry"]');await tick();
  assert(d.querySelector('#chemTeach')&&d.querySelector('#chemPractice'),'Chemistry tab renders its menu');

  click(d,'#navTabs [data-view="notebook"]');await tick();
  assert(/Notebook/i.test(d.querySelector('#view').textContent),'Notebook tab renders');
  click(d,'#navTabs [data-view="review"]');await tick();
  assert(/Review/i.test(d.querySelector('#view').textContent),'Review tab renders');
  click(d,'#navTabs [data-view="summary"]');await tick();
  assert(/Day 1 Summary/i.test(d.querySelector('#view').textContent),'Summary tab renders');

  assert.strictEqual(errors.length,0,'real Day 1 page has no uncaught runtime errors: '+errors.join(' | '));
  console.log('PASS  Real Day 1 page boots and switches core views in production script order');
  dom.window.close();
})().catch(e=>{console.error(e);process.exit(1);});
