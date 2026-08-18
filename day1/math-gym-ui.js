(function(root){'use strict';
function shouldAutoAdvance(mode){return mode==='speed';}
function ensureAdaptiveItem(deps,state,item){
  if(!deps||!deps.runtime||!deps.adapters||!state||!item)return null;
  var problem=deps.adapters.fromMathGymItem(item);
  if(!state.current||!state.current.problem||state.current.problem.sourceId!==problem.sourceId){deps.runtime.startProblem(state,problem);state.current.mathGymHadWrong=false;}
  return{problem:problem,plan:state.current.plan};
}
function applyAdaptiveHint(deps,state,item){
  var ready=ensureAdaptiveItem(deps,state,item);if(!ready)return null;
  var result=deps.runtime.requestSupport(state,'mental');
  return{problem:ready.problem,plan:ready.plan,strategyId:result.strategyId,hint:result.hint||''};
}
function applyAdaptiveSubmission(deps,state,item,mode,raw,unit){
  var ready=ensureAdaptiveItem(deps,state,item);if(!ready)return null;
  var correct=deps.checker.check(ready.problem,raw,ready.plan);
  var hadWrongBefore=!!state.current.mathGymHadWrong;
  if(!correct)state.current.mathGymHadWrong=true;
  var ids=correct?deps.runtime.recordPlanFluency(state,true,{input:raw,assisted:hadWrongBefore}):[];
  return{correct:correct,problem:ready.problem,plan:ready.plan,runtimeResult:{correct:correct,routeFluencySkillIds:ids,mode:mode||'practice',hadWrongBeforeCorrect:correct&&hadWrongBefore}};
}
var rules={shouldAutoAdvance:shouldAutoAdvance,ensureAdaptiveItem:ensureAdaptiveItem,applyAdaptiveHint:applyAdaptiveHint,applyAdaptiveSubmission:applyAdaptiveSubmission};
if(typeof module!=='undefined'&&module.exports)module.exports=rules;
root.MathGymUIRules=rules;
if(typeof document==='undefined')return;
var G=root.MathGymEngine;if(!G)return;var viewRoot=document.getElementById('view'),nav=document.getElementById('navTabs');if(!viewRoot||!nav)return;
var currentArea='fractions_percentages',mode='practice',item=null,correctCount=0,total=0,started=0,timer=null,timeLeft=60;
var names={fractions_percentages:'Fractions & percentages',algebra:'Algebra',exponents:'Exponents',scientific_notation:'Scientific notation',logs_estimation:'Logs & estimation',unit_conversions:'Unit conversions'};
function btn(text,cls){return '<button type="button" class="btn '+(cls||'')+'">'+text+'</button>'}
function addTab(){if(document.getElementById('mathGymTab'))return;var b=document.createElement('button');b.id='mathGymTab';b.textContent='Math Gym';b.type='button';b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();openGym()});nav.appendChild(b)}
function stopTimer(){if(timer){clearInterval(timer);timer=null}}
function adaptiveContext(){
  var C=root.Day1AdaptiveClassroomController,R=root.Day1AdaptiveRuntime,A=root.Day1ProblemSourceAdapters,K=root.MathAnswerChecker;
  if(!C||!R||!A||!K)return null;
  if(!C.getState())C.start();
  var s=C.getState();if(!s)return null;
  return{controller:C,state:s,deps:{runtime:R,adapters:A,checker:K}};
}
function persistAdaptive(ctx){if(ctx&&ctx.controller&&ctx.controller.persist)ctx.controller.persist();}
function newItem(){item=G.generate(currentArea);started=Date.now();var ctx=adaptiveContext();if(ctx){try{ensureAdaptiveItem(ctx.deps,ctx.state,item);persistAdaptive(ctx)}catch(e){if(root.console&&console.warn)console.warn('[MathGym adaptive item]',e)}}renderProblem()}
function modeHelp(){if(mode==='practice')return 'Practice mode: hints are available. Focus on accuracy and mental strategy.';if(mode==='speed')return 'Speed Round: no hints. Work mentally and build automaticity.';if(mode==='challenge')return 'Challenge: mixed, harder thinking. Hints are allowed if you get stuck.';return 'Fresh Mastery: no hints and no calculator. This checks what you can do independently.'}
function openGym(){stopTimer();Array.from(nav.children).forEach(function(x){x.classList.remove('on')});document.getElementById('mathGymTab').classList.add('on');viewRoot.innerHTML='<div class="card"><div class="phase">Math Gym</div><h1>Train it until it is fast.</h1><p>'+modeHelp()+'</p><div class="row" id="gymAreas"></div><div class="row" id="gymModes" style="margin-top:12px"></div></div><div id="gymBody"></div>';
 var a=document.getElementById('gymAreas');Object.keys(names).forEach(function(k){var b=document.createElement('button');b.type='button';b.className='btn '+(k===currentArea?'':'secondary');b.textContent=names[k];b.onclick=function(){currentArea=k;correctCount=0;total=0;openGym()};a.appendChild(b)});
 var m=document.getElementById('gymModes');[['practice','Practice'],['speed','Speed Round'],['challenge','Challenge'],['mastery','Fresh Mastery']].forEach(function(x){var b=document.createElement('button');b.type='button';b.className='btn '+(x[0]===mode?'':'secondary');b.textContent=x[1];b.onclick=function(){mode=x[0];correctCount=0;total=0;openGym()};m.appendChild(b)});
 if(mode==='speed')startSpeed();else newItem();}
function startSpeed(){stopTimer();timeLeft=60;newItem();timer=setInterval(function(){timeLeft--;var t=document.getElementById('gymTimer');if(t)t.textContent=timeLeft+' sec';if(timeLeft<=0){stopTimer();showFinish('Speed Round complete: '+correctCount+' correct out of '+total+' attempts.')}} ,1000)}
function hintFor(it){var a=it.area;if(a==='fractions_percentages')return 'Look for friendly fractions or percent anchors first: 10%, 5%, 25%, 50%, 75%. Break the number into easy chunks.';if(a==='algebra')return 'Name the operation trapping x, then use the inverse on both sides. Keep the equation balanced.';if(a==='exponents')return 'First identify the rule: repeated factors, same-base multiply, same-base divide, power of a power, or reciprocal for a negative exponent.';if(a==='scientific_notation')return 'Keep the coefficient between 1 and 10. Estimate the size first so the exponent sign makes sense.';if(a==='logs_estimation')return 'Translate log into “10 to what power?” Use exact powers of ten and the small landmark set before estimating.';return 'Write the conversion relationship first. Put the unwanted unit opposite so it cancels, then do the number math mentally if possible.'}
function adaptiveHintText(){
  var ctx=adaptiveContext();if(!ctx)return null;
  try{var r=applyAdaptiveHint(ctx.deps,ctx.state,item);persistAdaptive(ctx);return r&&r.hint||null}catch(e){if(root.console&&console.warn)console.warn('[MathGym adaptive hint]',e);return null}
}
function renderProblem(){var body=document.getElementById('gymBody');if(!body||!item)return;body.innerHTML='<div class="card"><div class="phase">'+names[currentArea]+' • '+mode.replace('_',' ')+'</div><div class="row" style="justify-content:space-between"><b id="gymScore">'+correctCount+' correct / '+total+' attempts</b>'+(mode==='speed'?'<b id="gymTimer">'+timeLeft+' sec</b>':'')+'</div><div class="question">'+item.prompt+'</div><input id="gymAnswer" class="input" autocomplete="off" inputmode="text" placeholder="Your answer"><div class="actions" style="margin-top:12px"><button type="button" id="gymCheck" class="btn">Check answer</button>'+(G.MODES[mode].hints?'<button type="button" id="gymHint" class="btn secondary">Mental hint</button>':'')+'<button type="button" id="gymSkip" class="btn ghost">Skip</button></div><div id="gymFeedback"></div></div>';
 document.getElementById('gymCheck').onclick=check;var h=document.getElementById('gymHint');if(h)h.onclick=function(){var text=adaptiveHintText()||hintFor(item);document.getElementById('gymFeedback').innerHTML='<div class="warning"><b>Mental strategy</b><br>'+text+'</div>'};document.getElementById('gymSkip').onclick=function(){total++;newItem()};}
function advance(){if(mode==='mastery'&&correctCount>=3){showFinish('Fresh mastery practice complete with 3 correct answers. Conceptual mastery is tracked separately.')}else if(mode==='challenge'&&correctCount>=5){showFinish('Challenge complete: 5 correct.')}else newItem()}
function check(){
 var v=document.getElementById('gymAnswer').value,ok=false,ctx=adaptiveContext();
 if(ctx){try{var adaptive=applyAdaptiveSubmission(ctx.deps,ctx.state,item,mode,v,'');ok=!!adaptive.correct;persistAdaptive(ctx)}catch(e){if(root.console&&console.warn)console.warn('[MathGym adaptive submission]',e);try{ok=item.check(v)}catch(e2){ok=false}}}
 else{try{ok=item.check(v)}catch(e3){ok=false}}
 total++;
 if(ok){correctCount++;var ms=Date.now()-started;if(shouldAutoAdvance(mode)){document.getElementById('gymFeedback').innerHTML='<div class="feedback good"><b>Correct.</b> Keep moving.</div>';setTimeout(advance,550)}else{document.getElementById('gymFeedback').innerHTML='<div class="feedback good"><b>Correct.</b> Now notice the shortest mental route you could use next time.</div><div class="actions" style="margin-top:8px"><button type="button" id="gymContinue" class="btn">Continue</button></div>';document.getElementById('gymContinue').onclick=advance}}
 else{document.getElementById('gymFeedback').innerHTML='<div class="feedback bad"><b>Not yet.</b> Stay on this same problem and correct it.'+(G.MODES[mode].hints?'<br><br>'+(adaptiveHintText()||hintFor(item)):'')+'</div>'}}
function showFinish(msg){var body=document.getElementById('gymBody');if(body)body.innerHTML='<div class="card success"><h2>'+msg+'</h2><div class="actions"><button type="button" id="gymAgain" class="btn">Do another round</button><button type="button" id="gymBackMath" class="btn secondary">Back to Math</button></div></div>';document.getElementById('gymAgain').onclick=function(){correctCount=0;total=0;openGym()};document.getElementById('gymBackMath').onclick=function(){var b=nav.querySelector('[data-view="math"]');if(b)b.click()}}
addTab();
})(typeof globalThis!=='undefined'?globalThis:this);
