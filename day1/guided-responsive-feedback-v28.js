(function(root,factory){'use strict';
var api=factory();
if(typeof module==='object'&&module.exports)module.exports=api;
else{root.GuidedResponsiveFeedbackV28=api;api.install(root.document,root);}
})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
function tidy(v){return String(v==null?'':v).replace(/\s+/g,' ').trim();}
function lower(v){return tidy(v).toLowerCase().replace(/−/g,'-').replace(/×/g,'x').replace(/÷/g,'/');}
function quoted(v){var s=tidy(v);return s.length>42?s.slice(0,39)+'...':s;}
function strictNumber(v){var s=tidy(v).replace(/,/g,'').replace(/%$/,'');if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s))return null;var n=Number(s);return Number.isFinite(n)?n:null;}
function fraction(v){var m=lower(v).replace(/\s+/g,'').match(/^([+-]?\d+)\/([+-]?\d+)$/);if(!m||Number(m[2])===0)return null;return{n:Number(m[1]),d:Number(m[2])};}
function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){var t=a%b;a=b;b=t;}return a||1;}
function scientific(v){var s=lower(v).replace(/\s+/g,'').replace(/\*/g,'x');var m=s.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))x?10\^?\(?([+-]?\d+)\)?$/);return m?{coefficient:Number(m[1]),exponent:Number(m[2])}:null;}
function yesNo(v){var s=lower(v).replace(/[.!?]+$/,'');if(/^(y|yes|yeah|yep|correct|same|same base|same bases|they match|bases match)$/.test(s))return'yes';if(/^(n|no|nope|different|different base|different bases|they do not match|they don't match)$/.test(s))return'no';return null;}
function signChoice(v){var s=lower(v);var pos=/\bpositive\b|^\+$/.test(s),neg=/\bnegative\b|^-$/.test(s);return pos===neg?null:(pos?'positive':'negative');}
function hasUnitLike(v){return /\d\s*(?:ml|l|mg|mcg|ug|µg|μg|ng|kg|g|qt|gal|mol|mmol)\b/i.test(tidy(v));}
function repeatedPrefix(value,attempt,last){if(attempt>1&&lower(value)===lower(last))return 'That is the same response again. ';return 'I read “'+quoted(value)+'.” ';}
function arithmeticOperation(prompt){var p=lower(prompt);if(p.indexOf('/')>=0||/\bdivide|half of|one fourth/.test(p))return'division';if(/\bx\b|\bmultiply|copies|groups/.test(p))return'multiplication';if(/\+|\badd|combine|total exponent/.test(p))return'addition';if(/\-|subtract|remaining/.test(p))return'subtraction';return'arithmetic';}
function feedbackForStep(question,prompt,value,attempt,last){
 var q=tidy(question),p=tidy(prompt),pl=lower(prompt),prefix=repeatedPrefix(value,attempt,last),num=strictNumber(value),fr=fraction(value),yn=yesNo(value),sc=scientific(value);
 if(/do the bases match/i.test(p)){
  if(yn)return prefix+'You answered '+yn+'. Compare only the base symbols first; the exponents do not decide whether the bases match. Check the two bases and answer yes or no again.';
  return prefix+'This step asks for a yes-or-no comparison of the two bases. Answer whether the base symbols match.';
 }
 if(/positive or negative/i.test(p)){
  var sg=signChoice(value);if(sg)return prefix+'You chose '+sg+'. Before choosing the sign, compare the original number with 1 and notice which direction the decimal had to move. Then choose the sign again.';
  return prefix+'This step asks only for the exponent sign. Decide between positive and negative after comparing the original number with 1.';
 }
 if(/written in sixths/i.test(p)){
  if(!fr)return prefix+'This step asks for an equivalent fraction with denominator 6. Write a fraction, not a decimal or description.';
  if(fr.d!==6)return prefix+'Your denominator is '+fr.d+', but the step specifically asks for sixths. Change the denominator to 6 while keeping the fraction equivalent.';
  return prefix+'You reached sixths, but the fraction is not equivalent to the original. Whatever factor changes the denominator must also change the numerator.';
 }
 if(/simplified fraction|reduce 3\/6/i.test(p)){
  if(!fr)return prefix+'This step asks for a reduced fraction. Write the answer as numerator over denominator.';
  if(gcd(fr.n,fr.d)>1)return prefix+'That fraction can still be reduced because the numerator and denominator share a common factor. Divide both by the same common factor.';
  return prefix+'Your fraction is reduced, but it is not equivalent to the fraction you started with. Check the value before simplifying.';
 }
 if(/rewrite .* reciprocal|as a reciprocal/i.test(p)){
  if(!fr&&!/^1\//.test(lower(value).replace(/\s+/g,'')))return prefix+'A reciprocal should put 1 over the original positive power. Keep the base and exponent together in the denominator.';
  return prefix+'You used reciprocal form, but it does not preserve the original base and power. Check what belongs in the denominator.';
 }
 if(/write (?:the )?(?:combined|remaining|final) power|combined power of ten/i.test(p)){
  if(num!==null)return prefix+'This step asks for power notation, not the evaluated ordinary number. Keep the base and write an exponent.';
  if(!/\^|[⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(tidy(value)))return prefix+'I do not see power notation in that response. Keep the base from the problem and attach the exponent produced by the previous step.';
  return prefix+'Your format looks like a power, but one part does not match the work from the previous step. Check the base first, then check the exponent separately.';
 }
 if(/coefficient.*between 1 and 10/i.test(p)){
  if(num===null)return prefix+'This step asks for the numerical coefficient only. Enter the number that remains after moving the decimal.';
  if(!(Math.abs(num)>=1&&Math.abs(num)<10))return prefix+'A scientific-notation coefficient must be at least 1 in magnitude and less than 10. Move the decimal until your coefficient is in that range.';
  return prefix+'Your coefficient is in the allowed range, but the digit placement does not match the original number. Move the decimal without changing the order of the digits.';
 }
 if(/how many places did the decimal move/i.test(p)){
  if(num===null)return prefix+'This step asks for a count of decimal-place moves. Enter a number of places.';
  return prefix+'That count does not match the move from the original decimal position to the coefficient. Trace each decimal jump one place at a time and count again.';
 }
 if(/full scientific notation|final scientific notation|recombine.*10\^exponent|recombine coefficient and exponent/i.test(p)){
  if(num!==null)return prefix+'You entered an ordinary number, but this step asks for scientific notation in coefficient × 10^exponent form.';
  if(!sc)return prefix+'I do not see a complete coefficient × 10^exponent expression. Use the coefficient and exponent you already found, without re-solving the whole problem.';
  return prefix+'The scientific-notation structure is there, but either the coefficient or exponent conflicts with an earlier step. Check those two pieces separately.';
 }
 if(/two landmark numbers multiply to make 6/i.test(p)){
  var nums=String(value==null?'':value).match(/[+-]?(?:\d+(?:\.\d*)?|\.\d+)/g);if(nums&&nums.length===2)return prefix+'I found '+nums[0]+' and '+nums[1]+'. Multiply those two numbers and check whether they recreate 6. If not, choose a different factor pair.';
  return prefix+'This step needs two factor numbers. Give a pair whose product recreates 6.';
 }
 if(/what is the part in this problem/i.test(p)){
  if(num===null)return prefix+'This step asks for the numerical part. Look at the original sentence and identify the amount being compared to the whole.';
  return prefix+'That number is not the part used in the original percent question. Re-read the original wording and pick the amount being compared.';
 }
 if(/what is the whole\?/i.test(p)){
  if(num===null)return prefix+'This step asks for the numerical whole. In the original percent sentence, identify the full reference amount.';
  return prefix+'That number is not the whole from the original question. Look for the full reference amount after the comparison wording.';
 }
 if(/how many groups of .* make /i.test(p)){
  if(num===null)return prefix+'This step asks for a number of equal groups. Compare the part with the chunk you already found and enter the group count.';
  return prefix+'That group count does not rebuild the part from the chunk. Check how many copies of the chunk are needed to reach the part.';
 }
 if(/if each group is 10%/i.test(p)){
  if(num===null)return prefix+'This step asks for a percent value. Use the number of 10% groups you just found and convert that group count into percent.';
  return prefix+'That percent does not match the number of 10% groups from the previous step. Keep the group count fixed and translate each group as 10%.';
 }
 if(hasUnitLike(value))return prefix+'You attached a measurement unit, but this step is asking for a math relationship or number only. Remove the unit and answer the calculation shown here.';
 if(/what is |what does it equal|what exponent belongs|how many copies|what ordinary number|what final value|what is half|combine/i.test(pl)){
  if(num===null&&!fr)return prefix+'This step asks for a numerical result. Work only the '+arithmeticOperation(prompt)+' shown in this step and enter that result.';
  return prefix+'That result does not match the '+arithmeticOperation(prompt)+' in this step. Rework only this one calculation; I will not give the result automatically. Use “Give me a hint” if you want another clue.';
 }
 return prefix+'That response does not answer the specific thing this step is asking for. Re-read the step, identify whether it wants a number, comparison, sign, fraction, or notation, and try again.';
}
function stepIndex(box){var b=box&&box.querySelector('b');var m=b&&String(b.textContent||'').match(/Step\s+(\d+)\s+of/i);return m?Number(m[1])-1:-1;}
function isUnitHandled(rootObj,q){return !!(rootObj&&rootObj.GuidedResponsiveFeedbackV27&&rootObj.GuidedResponsiveFeedbackV27.META&&rootObj.GuidedResponsiveFeedbackV27.META[q]);}
function correctByExistingPlan(rootObj,q,idx,prompt,value){
 try{
  var tutor=rootObj&&rootObj.Day1GuidedTutorV13,plan=tutor&&tutor.planFor?tutor.planFor(q):null,step=plan&&plan.steps&&plan.steps[idx];if(!step||typeof step.a!=='function')return null;
  var candidate=value,sem=rootObj&&rootObj.SemanticAnswerEquivalence;if(sem&&typeof sem.normalizeGuidedAnswer==='function')candidate=sem.normalizeGuidedAnswer(value,prompt);
  return !!step.a(candidate);
 }catch(e){return null;}
}
function install(doc,rootObj){
 if(!doc||!doc.addEventListener)return;
 doc.addEventListener('click',function(e){
  var btn=e.target&&e.target.closest?e.target.closest('[data-v13-check]'):null;if(!btn)return;
  var view=doc.getElementById('view'),qEl=view&&view.querySelector('.question'),q=qEl&&tidy(qEl.textContent);if(!q||isUnitHandled(rootObj,q))return;
  var box=btn.closest('.warning'),input=box&&box.querySelector('[data-v13-answer]'),out=box&&box.querySelector('[data-v13-feedback]'),pEl=box&&box.querySelector('p'),idx=stepIndex(box);if(!input||!out||!pEl||idx<0||!input.value.trim())return;
  var correct=correctByExistingPlan(rootObj,q,idx,pEl.textContent,input.value);if(correct===null)return;if(correct)return;
  e.preventDefault();e.stopImmediatePropagation();
  var attempt=Number(input.dataset.v28WrongAttempts||0)+1,last=input.dataset.v28LastWrong||'';
  input.dataset.v28WrongAttempts=String(attempt);input.dataset.v28LastWrong=lower(input.value);
  out.className='feedback bad';out.textContent='Not yet. '+feedbackForStep(q,pEl.textContent,input.value,attempt,last);
 },true);
}
return{tidy:tidy,strictNumber:strictNumber,fraction:fraction,scientific:scientific,yesNo:yesNo,signChoice:signChoice,feedbackForStep:feedbackForStep,correctByExistingPlan:correctByExistingPlan,install:install};
});
