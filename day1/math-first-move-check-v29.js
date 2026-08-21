(function(root,factory){'use strict';
var api=factory();
if(typeof module==='object'&&module.exports)module.exports=api;
else{root.MathFirstMoveCheckV29=api;api.install(root.document,root);}
})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
var C={
 '5/6 − 1/3 =':{kind:'fraction',expected:'2/6'},
 '3/8 of 160 =':{kind:'number',expected:20},
 '15% of 80 =':{kind:'number',expected:8},
 '24 is what percent of 300?':{kind:'number',expected:30},
 '25% of 68 =':{kind:'number',expected:17},
 '18 is what percent of 60?':{kind:'number',expected:6},
 '4x + 5 = x + 20. Solve for x.':{kind:'number',expected:3,subkind:'coefficient'},
 '7x + 2 = 3x + 26. Solve for x.':{kind:'algebra',expected:'4x'},
 '2/x = 6/15. Solve for x.':{kind:'number',expected:30},
 '5x − 7 = 18. Solve for x.':{kind:'number',expected:25},
 '2^(-4) =':{kind:'number',expected:16},
 'a^4 × a^3 =':{kind:'number',expected:7},
 'a^7 / a^2 =':{kind:'number',expected:5},
 '(x^3)^2 =':{kind:'number',expected:6},
 '10^2 × 10^3 =':{kind:'number',expected:5},
 'Write 0.00061 in scientific notation.':{kind:'number',expected:4},
 'Write 450000 in scientific notation.':{kind:'number',expected:5},
 '(4×10^6)(2×10^-3) =':{kind:'number',expected:3},
 '(9×10^-5)/(3×10^-2) =':{kind:'number',expected:-3},
 'Write 0.0072 in scientific notation.':{kind:'number',expected:3},
 'log(10000) =':{kind:'number',expected:4},
 'If log(x) = −4, x =':{kind:'power',expected:'10^-4'},
 'Estimate log(6) using log(2)≈0.30 and log(3)≈0.48.':{kind:'pair',expected:'2 and 3'},
 'Estimate −log(6×10^-6) to one decimal.':{kind:'number',expected:.78,tol:.001},
 '0.062 L to mL =':{kind:'direction',expected:'larger'},
 '750 mL to L =':{kind:'operation',expected:'divide'},
 '2.4 g to mg =':{kind:'direction',expected:'larger'},
 '3500 mcg to mg =':{kind:'direction',expected:'smaller'},
 '0.015 mol/s to mmol/min =':{kind:'number',expected:1000},
 '8 g/5 min for 12 min = how many g?':{kind:'unit',expected:'min'},
 '2 gal to qt =':{kind:'number',expected:4}
};
function tidy(v){return String(v==null?'':v).replace(/\s+/g,' ').trim();}
function lower(v){return tidy(v).toLowerCase().replace(/−/g,'-').replace(/×/g,'x').replace(/÷/g,'/');}
function strictNumber(v){var s=tidy(v).replace(/,/g,'');if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s))return null;var n=Number(s);return Number.isFinite(n)?n:null;}
function near(a,b,t){return Number.isFinite(a)&&Math.abs(a-b)<=(t||1e-9)*Math.max(1,Math.abs(b));}
function numbersIn(v){var m=String(v==null?'':v).replace(/−/g,'-').match(/[+-]?(?:\d+(?:\.\d*)?|\.\d+)/g);return m?m.map(Number):[];}
function direction(v,sem){if(sem&&typeof sem.direction==='function')return sem.direction(v);var s=lower(v),big=/\b(larger|bigger|greater|increase|increases|grows|up)\b/.test(s),small=/\b(smaller|less|decrease|decreases|shrinks|down)\b/.test(s);return big===small?null:(big?'larger':'smaller');}
function operation(v,sem){if(sem&&typeof sem.operation==='function')return sem.operation(v);var s=lower(v),d=/\bdivide(?:d|s|ing)?\b|\bdivision\b|\//.test(s),m=/\bmultiply(?:ing|ied|ies)?\b|\bmultiplication\b|\btimes\b|x|\*/.test(s);return d===m?null:(d?'divide':'multiply');}
function normalize(question,prompt,v,sem){var c=C[tidy(question)];if(!c)return null;
 if(c.kind==='number'){var n=strictNumber(v);return n!==null&&near(n,c.expected,c.tol)?String(c.expected):null;}
 if(c.kind==='fraction'){var s=lower(v).replace(/\s+/g,'');return s===c.expected?c.expected:null;}
 if(c.kind==='algebra'){var s2=sem&&typeof sem.normalizeShortAnswer==='function'?sem.normalizeShortAnswer(v,prompt):tidy(v);return lower(s2).replace(/\s+/g,'')==='4x'?'4x':null;}
 if(c.kind==='power'){var s3=sem&&typeof sem.normalizeShortAnswer==='function'?sem.normalizeShortAnswer(v,prompt):tidy(v);return lower(s3).replace(/\s+/g,'')==='10^-4'?'10^-4':null;}
 if(c.kind==='pair'){var s4=sem&&typeof sem.normalizeShortAnswer==='function'?sem.normalizeShortAnswer(v,prompt):tidy(v);var nums=numbersIn(s4);return nums.length===2&&((nums[0]===2&&nums[1]===3)||(nums[0]===3&&nums[1]===2))?'2 and 3':null;}
 if(c.kind==='direction'){var d=direction(v,sem);return d===c.expected?c.expected:null;}
 if(c.kind==='operation'){var o=operation(v,sem);return o===c.expected?c.expected:null;}
 if(c.kind==='unit'){var u=lower(v).replace(/[.!?]+$/,'');return /^(min|mins|minute|minutes)$/.test(u)?'min':null;}
 return null;}
function quote(v){var s=tidy(v);return s.length>40?s.slice(0,37)+'...':s;}
function feedback(question,prompt,value,attempt,last,sem){var q=tidy(question),c=C[q],p=tidy(prompt),prefix=attempt>1&&lower(value)===lower(last)?'That is the same response again. ':'I read “'+quote(value)+'.” ';if(!c)return prefix+'That does not match this first move yet.';
 if(c.kind==='number'){
  var n=strictNumber(value);
  if(n===null){if(/[a-z]/i.test(tidy(value)))return prefix+(c.subkind==='coefficient'?'This step asks for the coefficient only, so enter just the number and leave off x.':'This first move asks for a number. Work only the operation named in the prompt and enter the numerical result.');return prefix+'This first move asks for a numerical result. Enter one number for this step.';}
  if(c.subkind==='coefficient')return prefix+'That coefficient does not match what remains after subtracting the x term from both sides. Combine only the x coefficients shown, then enter the coefficient without x.';
  if(/×|\*|multiply/i.test(p))return prefix+'That product does not match the multiplication shown in this first move. Rework only those two factors; do not jump to the final problem answer.';
  if(/÷|\/|divide/i.test(p))return prefix+'That result does not match the division shown in this first move. Rework only this division before continuing.';
  if(/\+|add/i.test(p))return prefix+'That sum does not match the addition in this first move. Recheck only the terms shown here.';
  if(/−|-|subtract/i.test(p))return prefix+'That result does not match the subtraction in this first move. Keep the signs attached to the terms and recalculate this one step.';
  if(/places move|decimal places/i.test(p))return prefix+'That count does not match the decimal movement shown in the question. Trace the decimal one position at a time and count again.';
  if(/power|exponent/i.test(p))return prefix+'That exponent does not match the power relationship in this first move. Translate the expression into the exponent question again before answering.';
  return prefix+'That number does not match this first move. Rework only the relationship named in the prompt instead of solving the whole problem at once.';
 }
 if(c.kind==='fraction'){
  if(!/^[-+]?\d+\s*\/\s*[-+]?\d+$/.test(tidy(value)))return prefix+'This step asks for a fraction written in sixths. Use numerator/denominator form.';
  return prefix+'That fraction is not the same value written in sixths. Change the denominator to sixths and apply the same scale factor to the numerator.';
 }
 if(c.kind==='algebra'){
  var n2=strictNumber(value);if(n2!==null)return prefix+'You entered only a number, but this first move asks for the remaining x expression. Combine the x terms and keep x attached.';
  if(/x/i.test(tidy(value)))return prefix+'You kept x in the response, which matches the requested form, but the coefficient is off. Subtract the two x coefficients shown in the prompt and keep x.';
  return prefix+'This first move asks for an x expression. Combine the like x terms and include x in the response.';
 }
 if(c.kind==='power')return prefix+'This first move asks for a power of 10. Keep base 10 and translate the logarithm statement into exponential form; do not attach extra text.';
 if(c.kind==='pair'){
  var nums=numbersIn(value);if(nums.length===2)return prefix+'I found '+nums[0]+' and '+nums[1]+'. Multiply your two choices and check whether their product recreates 6. If it does not, choose another pair.';
  return prefix+'This step needs two landmark factors. Give two numbers whose product recreates 6.';
 }
 if(c.kind==='direction'){
  var d=direction(value,sem);if(d)return prefix+'You chose '+d+' for the numerical value. Compare the starting unit with the target unit and ask whether the same amount needs more units or fewer units.';
  return prefix+'This first move asks whether the numerical value gets larger or smaller. Answer the direction, not a unit name or conversion number.';
 }
 if(c.kind==='operation'){
  var o=operation(value,sem);if(o)return prefix+'You chose '+o+'. Rewrite the factor shown in the prompt as one familiar arithmetic operation, then name that operation again.';
  return prefix+'This first move asks for one operation. Name the operation represented by the factor in the prompt.';
 }
 if(c.kind==='unit'){
  return prefix+'This step asks which unit cancels. Look at the unit that appears once in the denominator of the rate and once in the multiplied time; name that unit only.';
 }
 return prefix+'That does not answer this first move yet. Try the requested form again.';}
function install(doc,rootObj){if(!doc||!doc.addEventListener)return;doc.addEventListener('click',function(e){var btn=e.target&&e.target.closest?e.target.closest('[data-v9-check]'):null;if(!btn)return;var view=doc.getElementById('view'),qEl=view&&view.querySelector('.question'),q=qEl&&tidy(qEl.textContent),c=C[q];if(!c)return;var box=btn.closest('.warning'),input=box&&box.querySelector('[data-v9-input]'),out=box&&box.querySelector('[data-v9-result]'),pEl=box&&box.querySelector('p');if(!input||!out||!pEl||!input.value.trim())return;var sem=rootObj&&rootObj.SemanticAnswerEquivalence,canon=normalize(q,pEl.textContent,input.value,sem);if(canon!==null){input.value=canon;return;}e.preventDefault();e.stopImmediatePropagation();var attempt=Number(input.dataset.v29WrongAttempts||0)+1,last=input.dataset.v29LastWrong||'';input.dataset.v29WrongAttempts=String(attempt);input.dataset.v29LastWrong=lower(input.value);out.className='feedback bad';out.textContent='Not yet. '+feedback(q,pEl.textContent,input.value,attempt,last,sem);},true);}
return{CONTRACTS:C,strictNumber:strictNumber,normalize:normalize,feedback:feedback,install:install};
});
