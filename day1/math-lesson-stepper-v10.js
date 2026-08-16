(function(){'use strict';
function text(el){return (el&&el.textContent||'').replace(/\u00a0/g,' ').trim();}
function cleanSpeech(s){return String(s)
 .replace(/mL/g,' milliliters ').replace(/mcg/g,' micrograms ').replace(/mmol/g,' millimoles ')
 .replace(/\bmol\b/g,' moles ').replace(/\bmg\b/g,' milligrams ').replace(/\bg\b/g,' grams ').replace(/\bL\b/g,' liters ')
 .replace(/×/g,' times ').replace(/÷/g,' divided by ').replace(/≈/g,' approximately ').replace(/−/g,' minus ')
 .replace(/\^\(-?(\d+)\)/g,' to the power of $1 ').replace(/\^(-?\d+)/g,' to the power of $1 ')
 .replace(/↔/g,' converts back and forth with ').replace(/→/g,' converts to ');
}
function speak(s){if(!('speechSynthesis' in window))return;try{speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(cleanSpeech(s));u.rate=.82;u.pitch=1.03;speechSynthesis.speak(u)}catch(e){}}
function transitionWhy(title,prev,curr){var all=(title+' '+prev+' '+curr).toLowerCase();
 if(/fraction/.test(all)&&/\//.test(curr))return 'We rewrite the fractions so the pieces are the same size before combining them. The value stays equivalent; only the form changes.';
 if(/percent/.test(all))return 'We are building the target percent from easier anchor percents. Each line should come from a percent you can calculate mentally.';
 if(/equation|collect x|isolate|algebra|constant/.test(all))return 'This move keeps the equation balanced. Whatever operation changes one side must also be applied to the other side before simplifying.';
 if(/cross multiplication/.test(all))return 'The diagonal products appear because multiplying by the denominators cancels the fractions. Cross multiplication is the shortcut after you understand that cancellation.';
 if(/exponent|same bases|power of a power|negative exponent/.test(all))return 'This line comes from the meaning of repeated factors. The exponent rule is a shortcut for counting or cancelling those repeated factors.';
 if(/scientific|notation|small decimals|large numbers|multiply|divide/.test(all)&&/10/.test(all))return 'Keep the coefficient and the power of ten as two separate jobs. Finish those jobs first, then recombine and check that the coefficient is between 1 and 10.';
 if(/log/.test(all))return 'Translate the logarithm into a power-of-ten question first. Then use exact powers or the small landmark values already taught.';
 if(/conversion|liter|milliliter|metric|rate|liquid|cancel/.test(all))return 'Follow the units before the numbers. The unwanted unit must cancel, and the remaining unit tells you whether the conversion factor is facing the correct direction.';
 return 'This line must follow from the line before it. Ask what single operation or relationship changed the expression, then verify that move before continuing.';
}
function install(){
 var view=document.getElementById('view');if(!view)return;
 var learning=[].slice.call(view.querySelectorAll('.card')).find(function(c){return /Learning\s*•\s*\d+\s*of\s*\d+/i.test(text(c));});
 if(!learning||learning.dataset.stepperV10)return;
 var stage=learning.querySelector('.stage .visual');if(!stage)return;
 var raw=stage.textContent||'',lines=raw.split(/\n+/).map(function(x){return x.trim()}).filter(Boolean);if(lines.length<2)return;
 learning.dataset.stepperV10='1';stage.dataset.originalSteps=raw;
 var title=text(learning.querySelector('h2'));
 var idx=0;
 var teacherCard=[].slice.call(view.querySelectorAll('.teacher')).find(function(c){return /Dr\. Merissa/i.test(text(c));});
 var teacherIntro=teacherCard?text(teacherCard.querySelector('.bubble div')):'';
 var shell=document.createElement('div');shell.setAttribute('data-stepper-controls','1');shell.style.marginTop='12px';
 shell.innerHTML='<div class="warning"><b data-step-count></b><div data-step-why style="margin-top:7px"></div></div><div class="actions" style="margin-top:10px"><button class="btn secondary" data-step-prev>← Previous teaching step</button><button class="btn" data-step-next>Next teaching step →</button><button class="btn ghost" data-step-read>🔊 Read this step</button></div>';
 stage.closest('.stage').insertAdjacentElement('afterend',shell);
 function renderStep(){
   stage.textContent=lines.slice(0,idx+1).join('\n');
   shell.querySelector('[data-step-count]').textContent='Teaching step '+(idx+1)+' of '+lines.length;
   var prev=idx?lines[idx-1]:'';var why=idx===0?(teacherIntro||'Start by identifying what this first line represents before doing any calculation.'):transitionWhy(title,prev,lines[idx]);
   shell.querySelector('[data-step-why]').textContent=why;
   shell.querySelector('[data-step-prev]').disabled=idx===0;
   shell.querySelector('[data-step-next]').textContent=idx===lines.length-1?'All worked steps shown':'Next teaching step →';
   shell.querySelector('[data-step-next]').disabled=idx===lines.length-1;
 }
 shell.querySelector('[data-step-prev]').onclick=function(){if(idx>0){idx--;renderStep();speak(lines[idx]+'. '+shell.querySelector('[data-step-why]').textContent)}};
 shell.querySelector('[data-step-next]').onclick=function(){if(idx<lines.length-1){idx++;renderStep();speak(lines[idx]+'. '+shell.querySelector('[data-step-why]').textContent)}};
 shell.querySelector('[data-step-read]').onclick=function(){speak(lines[idx]+'. '+shell.querySelector('[data-step-why]').textContent)};
 renderStep();
}
new MutationObserver(function(){setTimeout(install,0)}).observe(document.getElementById('view'),{childList:true,subtree:true});install();
})();