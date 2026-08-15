(function(){
'use strict';
var original=window.ClassroomV2&&window.ClassroomV2.checkTargetQuestion;
if(!original)return;
var KEY='astarryia-reasoning-evidence-v1';
var active=null;
function norm(x){return String(x==null?'':x).trim().toLowerCase();}
function esc(x){return String(x==null?'':x).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];});}
function qtext(){var q=document.querySelector('.question');return q?q.textContent.trim():'';}
function fb(){return document.getElementById('feedback');}
function answer(){var a=document.getElementById('answer');return a?a.value:'';}
function evidence(){try{return JSON.parse(localStorage.getItem(KEY)||'[]');}catch(e){return [];}}
function saveRecord(r){var xs=evidence();xs.push(r);if(xs.length>100)xs=xs.slice(-100);localStorage.setItem(KEY,JSON.stringify(xs));}
function choices(prompt,items,fn){return '<div class="info"><b>'+esc(prompt)+'</b><div class="choices">'+items.map(function(x,i){return '<button class="secondary" onclick="ClassroomDiagnosis.'+fn+'('+i+')">'+esc(x)+'</button>';}).join('')+'</div></div>';}
function begin(kind,raw,question){active={kind:kind,rawResponse:raw,question:question,itemId:question,startedAt:Date.now(),reasoningStep:null,errorCode:null,representationHistory:[],repairPassed:null,transferResult:null};}
function intercept(stage){var q=qtext(),raw=answer();
  if(q==='2/x = 6/15. Solve for x.' && norm(raw)!=='5'){
    begin('proportion',raw,q);
    fb().innerHTML=choices('I can see the answer you tried. Before I assume why it went wrong, tell me what 2/x means.',['2 × x','2 ÷ x','x ÷ 2',"I'm not sure"],'propProbe');
    return;
  }
  if(q.indexOf('Estimate -log(6 × 10⁻⁶)')===0 && Math.abs(parseFloat(raw)-5.2)>.15){
    begin('log',raw,q);
    fb().innerHTML=choices('Your answer tells me something went off, but there are several places this problem can break. Which part loses you?',["Why log(10⁻⁶) = -6","What the negative sign outside log does","How to estimate log(6)","How the pieces combine","I'm not sure"],'logProbe');
    return;
  }
  return original(stage);
}
function propProbe(i){
  var steps=[
    {step:'interpret_variable_denominator',code:'PROP_DENOMINATOR_MEANING',text:'In 2/x, the fraction bar means division. It reads “2 divided by x.” x is on the bottom, so this is not 2 times x and not x divided by 2.',check:'What does 3/y mean?',ans:'3 ÷ y'},
    {step:'cross_products_preserve_proportion',code:'PROP_CROSS_PRODUCT_GAP',text:'Good, so the fraction meaning is not the problem. Now let’s teach the next link instead of sending you back to easy algebra. In 2/x = 6/15, the two fractions are equal. Multiply both sides by 15x. The denominators cancel: 15x·(2/x) = 15x·(6/15), which leaves 2×15 = 6×x. That is what “cross multiply” is shortening. It is not magic diagonal multiplication. It comes from multiplying both sides by the denominators.',check:'For 3/y = 9/12, which equation keeps the equal cross-products?',ans:'3×12 = 9y'},
    {step:'fraction_orientation',code:'PROP_FRACTION_ORIENTATION',text:'The order of a fraction matters. 2/x means 2 divided by x. Flipping it to x/2 creates a different number. Read top ÷ bottom every time.',check:'Which expression means a divided by b?',ans:'a/b'},
    {step:'interpret_variable_denominator',code:'PROP_DENOMINATOR_MEANING',text:'That is okay. We found the missing link before continuing. A fraction a/b means a divided by b, so 2/x means 2 divided by x. Once that is clear, we can connect it to equal proportions.',check:'What does 4/z mean?',ans:'4 ÷ z'}
  ];
  var r=steps[i]||steps[3];active.reasoningStep=r.step;active.errorCode=r.code;active.representationHistory.push(i===1?'balance_equation':'fraction_reading');
  fb().innerHTML='<div class="info"><b>Here is the exact step we are fixing.</b><br><br>'+esc(r.text)+'<br><br><b>Quick check:</b> '+esc(r.check)+'<input id="diag-answer" class="input" placeholder="Your answer"><button onclick="ClassroomDiagnosis.microCheck(\''+esc(r.ans).replace(/'/g,"\\'")+'\')">Check this one idea</button></div>';
}
function logProbe(i){
  var steps=[
    {step:'log_power_of_ten',code:'LOG_POWER_TEN_GAP',text:'A base-10 logarithm asks: “10 raised to what power gives this?” Since 10⁻⁶ is already written as a power of 10, log(10⁻⁶) = -6. The logarithm is simply reading the exponent.',check:'What is log(10⁻⁴)?',ans:'-4'},
    {step:'outer_negative_distribution',code:'LOG_OUTER_NEGATIVE_GAP',text:'Keep the negative sign outside the brackets until the inside is finished. If the inside becomes -5.22, then the outside negative gives -(-5.22) = +5.22. The negative of a negative is positive.',check:'What is -(-3.4)?',ans:'3.4'},
    {step:'estimate_log_coefficient',code:'LOG_ESTIMATION_GAP',text:'Because 6 is between 1 and 10, log(6) must be between 0 and 1. With the no-calculator landmarks, log(6) is about 0.78. That is an estimate of the coefficient part only.',check:'Is log(4) between 0 and 1 or between 1 and 2?',ans:'between 0 and 1'},
    {step:'combine_log_parts',code:'LOG_COMBINATION_GAP',text:'Now break the original problem apart: -log(6×10⁻⁶) = -[log(6) + log(10⁻⁶)]. The second part is -6, so we get -[log(6) - 6]. Estimate log(6)≈0.78: -[0.78 - 6] = -[-5.22] = +5.22. The shortcut 6 - log(6) only makes sense after these steps are clear.',check:'In -[0.7 - 5], is the final result positive or negative?',ans:'positive'},
    {step:'diagnostic_uncertain',code:'LOG_NEEDS_MORE_EVIDENCE',text:'I do not want to guess where you are stuck. We will split the problem into one tiny step at a time. Start with the power-of-ten piece: log(10⁻⁶) asks what exponent is already on the 10.',check:'What is log(10⁻⁶)?',ans:'-6'}
  ];
  var r=steps[i]||steps[4];active.reasoningStep=r.step;active.errorCode=r.code;active.representationHistory.push(i===3?'split_expression':'worked_example');
  fb().innerHTML='<div class="info"><b>We found the part to work on.</b><br><br>'+esc(r.text)+'<br><br><b>Quick check:</b> '+esc(r.check)+'<input id="diag-answer" class="input" placeholder="Your answer"><button onclick="ClassroomDiagnosis.microCheck(\''+esc(r.ans).replace(/'/g,"\\'")+'\')">Check this one idea</button></div>';
}
function sameMeaning(got,want){got=norm(got).replace(/×/g,'x').replace(/÷/g,'/').replace(/\s+/g,'');want=norm(want).replace(/×/g,'x').replace(/÷/g,'/').replace(/\s+/g,'');if(got===want)return true;if(want==='3x12=9y'&&(got==='36=9y'||got==='3*12=9y'))return true;if(want==='3/y'&&got==='3/y')return true;return false;}
function microCheck(want){var el=document.getElementById('diag-answer'),got=el?el.value:'';if(!sameMeaning(got,want)){
    active.representationHistory.push('alternate_representation');
    fb().innerHTML+='<div class="info"><b>Not yet, so I am not sending you back to the beginning.</b> We will change the representation and stay on this exact reasoning step. Read the symbols literally and compare each side before trying again.</div>';return;
  }
  active.repairPassed=true;saveRecord(active);
  fb().innerHTML='<div class="good"><b>That missing step is working now.</b> Go back to the original problem above and try it again. I am keeping you on the same problem because we repaired the exact step instead of restarting the whole lesson.</div>';
  var a=document.getElementById('answer');if(a){a.value='';a.focus();}
}
window.ClassroomDiagnosis={propProbe:propProbe,logProbe:logProbe,microCheck:microCheck};
window.ClassroomV2.checkTargetQuestion=intercept;
})();
