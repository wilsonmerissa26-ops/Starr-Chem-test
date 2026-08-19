(function(root){'use strict';
function shouldAutoAdvance(mode){return mode==='speed';}
function scoreText(correct,total){return correct+' correct / '+total+' '+(total===1?'attempt':'attempts');}
function cleanNumber(n){n=Number(n);if(!Number.isFinite(n))return String(n);return Math.abs(n-Math.round(n))<1e-10?String(Math.round(n)):String(Math.round(n*1000000)/1000000);}
function fractionPercentHint(it){
 var type=it&&it.type,prompt=String(it&&it.prompt||'');
 if(type==='fraction_of_whole'){
  var m=prompt.match(/^([+-]?\d+)\/([+-]?\d+)\s+of\s+([+-]?(?:\d+(?:\.\d*)?|\.\d+))$/i);
  if(m){
   var n=Number(m[1]),d=Number(m[2]),whole=Number(m[3]),one=whole/d;
   if(Number.isFinite(one)&&d!==0)return 'This question wants an amount, not a percent. Divide '+cleanNumber(whole)+' by the denominator '+d+' first: '+cleanNumber(whole)+' ÷ '+d+' = '+cleanNumber(one)+'. Then multiply that amount by the numerator '+n+'.';
  }
  return 'This question wants an amount, not a percent. Divide the whole by the denominator first, then multiply by the numerator.';
 }
 if(type==='percent'){
  var p=prompt.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s+is\s+what\s+percent\s+of\s+([+-]?(?:\d+(?:\.\d*)?|\.\d+))\??$/i);
  var target=Number(it&&it.answer);
  if(p&&Number.isFinite(target)){
   var part=Number(p[1]),wholePct=Number(p[2]),anchors=[10,20,30,40,50,60,70,80,90],anchor=anchors[0];
   anchors.forEach(function(x){if(Math.abs(x-target)<Math.abs(anchor-target))anchor=x;});
   var anchorAmount=wholePct*anchor/100,delta=Math.abs(anchorAmount-part),direction=part<anchorAmount?'lower':'higher';
   if(delta<1e-10)return 'Use a familiar anchor: '+anchor+'% of '+cleanNumber(wholePct)+' = '+cleanNumber(anchorAmount)+'. Compare that anchor amount with the part in the question.';
   return 'Start from a nearby percent anchor: '+anchor+'% of '+cleanNumber(wholePct)+' = '+cleanNumber(anchorAmount)+'. The target part, '+cleanNumber(part)+', is '+cleanNumber(delta)+' '+direction+'. Find what percent '+cleanNumber(delta)+' is of '+cleanNumber(wholePct)+', then '+(direction==='lower'?'subtract that percent from ':'add that percent to ')+anchor+'%.';
  }
  return 'This question asks for a percent. Estimate with a nearby percent anchor first, then adjust or use part ÷ whole × 100 to verify.';
 }
 if(type==='fraction')return 'This is fraction addition or subtraction. Make equal-sized pieces first: rewrite the fractions with a common denominator, combine the numerators, then reduce.';
 return 'First identify what the question wants: a fraction result, an amount, or a percent. Then choose the matching route instead of switching between them.';
}
function hintFor(it){var a=it&&it.area;if(a==='fractions_percentages')return fractionPercentHint(it);if(a==='algebra')return 'Name the operation trapping x, then use the inverse on both sides. Keep the equation balanced.';if(a==='exponents')return 'First identify the rule: repeated factors, same-base multiply, same-base divide, power of a power, or reciprocal for a negative exponent.';if(a==='scientific_notation')return 'Keep the coefficient between 1 and 10. Estimate the size first so the exponent sign makes sense.';if(a==='logs_estimation')return 'Translate log into “10 to what power?” Use exact powers of ten and the small landmark set before estimating.';return 'Write the conversion relationship first. Put the unwanted unit opposite so it cancels, then do the number math mentally if possible.';}
var rules={shouldAutoAdvance:shouldAutoAdvance,scoreText:scoreText,hintFor:hintFor,fractionPercentHint:fractionPercentHint};
if(typeof module!=='undefined'&&module.exports)module.exports=rules;
root.MathGymUIRules=rules;
if(typeof document==='undefined')return;
var G=root.MathGymEngine;if(!G)return;var viewRoot=document.getElementById('view'),nav=document.getElementById('navTabs');if(!viewRoot||!nav)return;
var currentArea='fractions_percentages',mode='practice',item=null,correctCount=0,total=0,started=0,timer=null,timeLeft=60;
var names={fractions_percentages:'Fractions & percentages',algebra:'Algebra',exponents:'Exponents',scientific_notation:'Scientific notation',logs_estimation:'Logs & estimation',unit_conversions:'Unit conversions'};
function btn(text,cls){return '<button type="button" class="btn '+(cls||'')+'">'+text+'</button>'}
function addTab(){if(document.getElementById('mathGymTab'))return;var b=document.createElement('button');b.id='mathGymTab';b.textContent='Math Gym';b.type='button';b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();openGym()});nav.appendChild(b)}
function stopTimer(){if(timer){clearInterval(timer);timer=null}}
function newItem(){item=G.generate(currentArea);started=Date.now();renderProblem()}
function modeHelp(){if(mode==='practice')return 'Practice mode: hints are available. Focus on accuracy and mental strategy.';if(mode==='speed')return 'Speed Round: no hints. Work mentally and build automaticity.';if(mode==='challenge')return 'Challenge: mixed, harder thinking. Hints are allowed if you get stuck.';return 'Fresh Mastery: no hints and no calculator. This checks what you can do independently.'}
function openGym(){stopTimer();Array.from(nav.children).forEach(function(x){x.classList.remove('on')});document.getElementById('mathGymTab').classList.add('on');viewRoot.innerHTML='<div class="card"><div class="phase">Math Gym</div><h1>Train it until it is fast.</h1><p>'+modeHelp()+'</p><div class="row" id="gymAreas"></div><div class="row" id="gymModes" style="margin-top:12px"></div></div><div id="gymBody"></div>';
 var a=document.getElementById('gymAreas');Object.keys(names).forEach(function(k){var b=document.createElement('button');b.type='button';b.className='btn '+(k===currentArea?'':'secondary');b.textContent=names[k];b.onclick=function(){currentArea=k;correctCount=0;total=0;openGym()};a.appendChild(b)});
 var m=document.getElementById('gymModes');[['practice','Practice'],['speed','Speed Round'],['challenge','Challenge'],['mastery','Fresh Mastery']].forEach(function(x){var b=document.createElement('button');b.type='button';b.className='btn '+(x[0]===mode?'':'secondary');b.textContent=x[1];b.onclick=function(){mode=x[0];correctCount=0;total=0;openGym()};m.appendChild(b)});
 if(mode==='speed')startSpeed();else newItem();}
function startSpeed(){stopTimer();timeLeft=60;newItem();timer=setInterval(function(){timeLeft--;var t=document.getElementById('gymTimer');if(t)t.textContent=timeLeft+' sec';if(timeLeft<=0){stopTimer();showFinish('Speed Round complete: '+correctCount+' correct out of '+total+' attempts.')}} ,1000)}
function updateScore(){var s=document.getElementById('gymScore');if(s)s.textContent=scoreText(correctCount,total);}
function renderProblem(){var body=document.getElementById('gymBody');if(!body||!item)return;body.innerHTML='<div class="card"><div class="phase">'+names[currentArea]+' • '+mode.replace('_',' ')+'</div><div class="row" style="justify-content:space-between"><b id="gymScore">'+scoreText(correctCount,total)+'</b>'+(mode==='speed'?'<b id="gymTimer">'+timeLeft+' sec</b>':'')+'</div><div class="question">'+item.prompt+'</div><input id="gymAnswer" class="input" autocomplete="off" inputmode="text" placeholder="Your answer"><div class="actions" style="margin-top:12px"><button type="button" id="gymCheck" class="btn">Check answer</button>'+(G.MODES[mode].hints?'<button type="button" id="gymHint" class="btn secondary">Mental hint</button>':'')+'<button type="button" id="gymSkip" class="btn ghost">Skip</button></div><div id="gymFeedback"></div></div>';
 document.getElementById('gymCheck').onclick=check;var h=document.getElementById('gymHint');if(h)h.onclick=function(){document.getElementById('gymFeedback').innerHTML='<div class="warning"><b>Mental strategy</b><br>'+hintFor(item)+'</div>'};document.getElementById('gymSkip').onclick=function(){total++;newItem()};}
function advance(){if(mode==='mastery'&&correctCount>=3){showFinish('Fresh mastery passed with 3 independent correct answers.')}else if(mode==='challenge'&&correctCount>=5){showFinish('Challenge complete: 5 correct.')}else newItem()}
function check(){var v=document.getElementById('gymAnswer').value,ok=false;try{ok=item.check(v)}catch(e){ok=false}total++;if(ok)correctCount++;updateScore();if(ok){var ms=Date.now()-started;if(shouldAutoAdvance(mode)){document.getElementById('gymFeedback').innerHTML='<div class="feedback good"><b>Correct.</b> Keep moving.</div>';setTimeout(advance,550)}else{document.getElementById('gymFeedback').innerHTML='<div class="feedback good"><b>Correct.</b> Now notice the shortest mental route you could use next time.</div><div class="actions" style="margin-top:8px"><button type="button" id="gymContinue" class="btn">Continue</button></div>';document.getElementById('gymContinue').onclick=advance}}else{document.getElementById('gymFeedback').innerHTML='<div class="feedback bad"><b>Not yet.</b> Stay on this same problem and correct it.'+(G.MODES[mode].hints?'<br><br>'+hintFor(item):'')+'</div>'}}
function showFinish(msg){var body=document.getElementById('gymBody');if(body)body.innerHTML='<div class="card success"><h2>'+msg+'</h2><div class="actions"><button type="button" id="gymAgain" class="btn">Do another round</button><button type="button" id="gymBackMath" class="btn secondary">Back to Math</button></div></div>';document.getElementById('gymAgain').onclick=function(){correctCount=0;total=0;openGym()};document.getElementById('gymBackMath').onclick=function(){var b=nav.querySelector('[data-view="math"]');if(b)b.click()}}
addTab();
})(typeof globalThis!=='undefined'?globalThis:this);
