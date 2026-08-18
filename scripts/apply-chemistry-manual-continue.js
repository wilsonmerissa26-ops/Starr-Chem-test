'use strict';

var fs=require('fs');

function replaceOnce(src,from,to,label){
  var first=src.indexOf(from);
  if(first<0)throw new Error('missing patch target: '+label);
  if(src.indexOf(from,first+from.length)>=0)throw new Error('patch target is not unique: '+label);
  return src.slice(0,first)+to+src.slice(first+from.length);
}

var uiPath='chemistry-teacher-preview/chemistry-mastery-ui.js';
var ui=fs.readFileSync(uiPath,'utf8');

ui=replaceOnce(
  ui,
  "var $=function(id){return document.getElementById(id)};\n",
  "var $=function(id){return document.getElementById(id)};\nfunction ensurePracticeContinue(){var b=$('practiceContinue');if(b)return b;b=document.createElement('button');b.id='practiceContinue';b.className='hidden';b.textContent='Continue →';$('practiceIdk').parentNode.appendChild(b);return b}\nfunction setAnswerControlsDisabled(disabled){Array.prototype.forEach.call($('practiceChoices').querySelectorAll('button'),function(b){b.disabled=!!disabled});$('practiceInput').disabled=!!disabled;$('practiceCheck').disabled=!!disabled;$('practiceHint').disabled=!!disabled;$('practiceIdk').disabled=!!disabled}\n",
  'manual continue helpers'
);

ui=replaceOnce(
  ui,
  "function renderStep(){var item=P.current(session),plan=plans[item.molecule],s=plan.steps[step];$('practiceQuestion').textContent=s.q;",
  "function renderStep(){var item=P.current(session),plan=plans[item.molecule],s=plan.steps[step],next=ensurePracticeContinue();next.classList.add('hidden');next.onclick=null;setAnswerControlsDisabled(false);$('practiceQuestion').textContent=s.q;",
  'reset continue state when rendering a step'
);

ui=replaceOnce(
  ui,
  "step++;setTimeout(renderStep,450);return",
  "step++;setAnswerControlsDisabled(true);var next=ensurePracticeContinue();next.textContent='Continue →';next.classList.remove('hidden');next.onclick=function(){renderStep()};return",
  'remove 450ms step auto-advance'
);

ui=replaceOnce(
  ui,
  "speak($('practiceFeedback').textContent);setTimeout(advanceItem,700)}",
  "speak($('practiceFeedback').textContent);setAnswerControlsDisabled(true);var next=ensurePracticeContinue();next.textContent='Continue to next molecule →';next.classList.remove('hidden');next.onclick=function(){advanceItem()}}",
  'remove 700ms molecule auto-advance'
);

ui=replaceOnce(
  ui,
  "function advanceItem(){var r=P.next(session);",
  "function advanceItem(){var next=ensurePracticeContinue();next.classList.add('hidden');next.onclick=null;var r=P.next(session);",
  'hide continue before advancing item'
);

ui=replaceOnce(
  ui,
  "function showComplete(r){$('practicePhase').textContent='Skill evidence complete';",
  "function showComplete(r){var next=ensurePracticeContinue();next.classList.add('hidden');next.onclick=null;$('practicePhase').textContent='Skill evidence complete';",
  'hide continue on mastery completion'
);

if(ui.indexOf('setTimeout(renderStep,450)')>=0)throw new Error('450ms auto-advance survived');
if(ui.indexOf('setTimeout(advanceItem,700)')>=0)throw new Error('700ms auto-advance survived');
if(ui.indexOf("next.onclick=function(){renderStep()}")<0)throw new Error('step Continue handler missing');
if(ui.indexOf("next.onclick=function(){advanceItem()}")<0)throw new Error('molecule Continue handler missing');
fs.writeFileSync(uiPath,ui,'utf8');

var testPath='test-chemistry-mastery-ui.js';
var test=fs.readFileSync(testPath,'utf8');
var marker="ok('retrieval evidence is persisted',js.includes('retrieval')&&js.includes('astarryia-chemistry-mastery-v1'));\n";
var additions=marker+
  "ok('correct chemistry steps wait for explicit Continue',js.includes(\"next.onclick=function(){renderStep()}\")&&!js.includes('setTimeout(renderStep,450)'));\n"+
  "ok('completed molecules wait for explicit Continue',js.includes(\"next.onclick=function(){advanceItem()}\")&&!js.includes('setTimeout(advanceItem,700)'));\n"+
  "ok('manual Continue locks answered controls until learner proceeds',js.includes('setAnswerControlsDisabled(true)')&&js.includes('setAnswerControlsDisabled(false)'));\n";
test=replaceOnce(test,marker,additions,'chemistry mastery manual-continue regressions');
fs.writeFileSync(testPath,test,'utf8');

console.log('Applied chemistry manual-continue repair and regression assertions.');
