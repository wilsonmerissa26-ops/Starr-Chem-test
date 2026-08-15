(function(){
'use strict';
var originalCheck=window.ClassroomV2&&window.ClassroomV2.checkTargetQuestion;
var originalIdk=window.ClassroomV2&&window.ClassroomV2.targetIdk;
if(!originalCheck||!originalIdk)return;
var KEY='astarryia-reasoning-evidence-v1';
var active=null;
function norm(x){return String(x==null?'':x).trim().toLowerCase();}
function esc(x){return String(x==null?'':x).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];});}
function qtext(){var q=document.querySelector('.question');return q?q.textContent.trim():'';}
function fb(){return document.getElementById('feedback');}
function answer(){var a=document.getElementById('answer');return a?a.value:'';}
function evidence(){try{return JSON.parse(localStorage.getItem(KEY)||'[]');}catch(e){return [];}}
function saveRecord(r){var xs=evidence();xs.push(r);if(xs.length>100)xs=xs.slice(-100);localStorage.setItem(KEY,JSON.stringify(xs));}
function choices(prompt,items,fn){return '<div class="info diagnostic-panel"><b>'+esc(prompt)+'</b><div class="choices">'+items.map(function(x,i){return '<button class="secondary" onclick="ClassroomDiagnosis.'+fn+'('+i+')">'+esc(x)+'</button>';}).join('')+'</div></div>';}
function begin(kind,raw,question){active={kind:kind,rawResponse:raw,question:question,itemId:question,startedAt:Date.now(),reasoningStep:null,errorCode:null,representationHistory:[],repairPassed:null,transferResult:null};}
function showPropProbe(raw){var q=qtext();begin('proportion',raw,q);fb().innerHTML=choices('We are staying on this exact problem. Before I decide what to reteach, what does 2/x mean to you?',['2 × x','2 ÷ x','x ÷ 2',"I'm not sure"],'propProbe');}
function showLogProbe(raw){var q=qtext();begin('log',raw,q);fb().innerHTML=choices('We are staying on this exact problem. Which part is where you lose the thread?',["Why log(10⁻⁶) = -6","What the negative sign outside log does","How to estimate log(6)","How the pieces combine","I'm not sure"],'logProbe');}
function showGenericProbe(raw){var q=qtext();begin('generic',raw,q);fb().innerHTML=choices('Do not restart the lesson. We will stay on this exact problem and find the first step that stopped making sense. Which description fits best?',["I don't understand what the problem is asking","I understand the question but don't know the first step","I started, but I got stuck in the middle","I know the process but the calculation/symbols lost me","I'm not sure"],'genericProbe');}
function intercept(stage){var q=qtext(),raw=answer();
  if(q==='2/x = 6/15. Solve for x.' && norm(raw)!=='5'){showPropProbe(raw);return;}
  if(q.indexOf('Estimate -log(6 × 10⁻⁶)')===0 && Math.abs(parseFloat(raw)-5.2)>.15){showLogProbe(raw);return;}
  return originalCheck(stage);
}
function interceptIdk(){var q=qtext(),raw=answer();
  if(!q){return originalIdk();}
  if(q==='2/x = 6/15. Solve for x.'){showPropProbe(raw);return;}
  if(q.indexOf('Estimate -log(6 × 10⁻⁶)')===0){showLogProbe(raw);return;}
  showGenericProbe(raw);
}
function propProbe(i){
  var steps=[
    {step:'interpret_variable_denominator',code:'PROP_DENOMINATOR_MEANING',text:'In 2/x, the fraction bar means division. Read it as “2 divided by x.” x is the denominator, so this is not 2 times x and not x divided by 2.',check:'What does 3/y mean?',ans:'3 ÷ y'},
    {step:'cross_products_preserve_proportion',code:'PROP_CROSS_PRODUCT_GAP',text:'Good. The fraction meaning is not the problem, so we do not go backward. The next link is why cross multiplication works. In 2/x = 6/15, multiply BOTH sides by 15x. The denominators cancel: 15x·(2/x) = 15x·(6/15), leaving 2×15 = 6×x. “Cross multiply” is only a shortcut name for that legal operation on both sides.',check:'For 3/y = 9/12, which equation keeps the equal cross-products?',ans:'3×12 = 9y'},
    {step:'fraction_orientation',code:'PROP_FRACTION_ORIENTATION',text:'The order of a fraction matters. 2/x means 2 divided by x. Flipping it to x/2 creates a different value. Read top ÷ bottom every time.',check:'Which expression means a divided by b?',ans:'a/b'},
    {step:'interpret_variable_denominator',code:'PROP_DENOMINATOR_MEANING',text:'That is enough information for me to slow down here instead of restarting algebra. A fraction a/b means a divided by b, so 2/x means 2 divided by x. We will verify that one idea first.',check:'What does 4/z mean?',ans:'4 ÷ z'}
  ];
  var r=steps[i]||steps[3];active.reasoningStep=r.step;active.errorCode=r.code;active.representationHistory.push(i===1?'balance_equation':'fraction_reading');
  fb().innerHTML='<div class="info"><b>Here is the exact step we are fixing.</b><br><br>'+esc(r.text)+'<br><br><b>Quick check:</b> '+esc(r.check)+'<input id="diag-answer" class="input" placeholder="Your answer"><button onclick="ClassroomDiagnosis.microCheck(\''+esc(r.ans).replace(/'/g,"\\'")+'\')">Check this one idea</button></div>';
}
function logProbe(i){
  var steps=[
    {step:'log_power_of_ten',code:'LOG_POWER_TEN_GAP',text:'A base-10 logarithm asks: “10 raised to what power gives this?” Since 10⁻⁶ is already written as a power of 10, log(10⁻⁶) = -6. The logarithm is simply reading the exponent.',check:'What is log(10⁻⁴)?',ans:'-4'},
    {step:'outer_negative_distribution',code:'LOG_OUTER_NEGATIVE_GAP',text:'Keep the negative sign outside the brackets until the inside is finished. If the inside becomes -5.22, then the outside negative gives -(-5.22) = +5.22. The negative of a negative is positive.',check:'What is -(-3.4)?',ans:'3.4'},
    {step:'estimate_log_coefficient',code:'LOG_ESTIMATION_GAP',text:'Because 6 is between 1 and 10, log(6) must be between 0 and 1. With the no-calculator landmarks, log(6) is about 0.78. That estimate belongs only to the coefficient part.',check:'Is log(4) between 0 and 1 or between 1 and 2?',ans:'between 0 and 1'},
    {step:'combine_log_parts',code:'LOG_COMBINATION_GAP',text:'Now split THIS problem instead of jumping to a shortcut: -log(6×10⁻⁶) = -[log(6) + log(10⁻⁶)]. The power-of-ten part is -6, so this becomes -[log(6) - 6]. Estimate log(6)≈0.78: -[0.78 - 6] = -[-5.22] = +5.22. Only after that makes sense should 6 - log(6) be used as a shortcut.',check:'In -[0.7 - 5], is the final result positive or negative?',ans:'positive'},
    {step:'diagnostic_uncertain',code:'LOG_NEEDS_MORE_EVIDENCE',text:'I do not have enough evidence to guess, so I will not send you backward. We will split THIS problem into tiny pieces. Start with the power-of-ten part only: log(10⁻⁶) asks what exponent is already on the 10.',check:'What is log(10⁻⁶)?',ans:'-6'}
  ];
  var r=steps[i]||steps[4];active.reasoningStep=r.step;active.errorCode=r.code;active.representationHistory.push(i===3?'split_expression':'worked_example');
  fb().innerHTML='<div class="info"><b>We found the part to work on.</b><br><br>'+esc(r.text)+'<br><br><b>Quick check:</b> '+esc(r.check)+'<input id="diag-answer" class="input" placeholder="Your answer"><button onclick="ClassroomDiagnosis.microCheck(\''+esc(r.ans).replace(/'/g,"\\'")+'\')">Check this one idea</button></div>';
}
function genericProbe(i){
  var steps=[
    {step:'interpret_prompt',code:'GEN_PROMPT_MEANING',text:'We are not solving yet. Read the current problem and identify exactly what it is asking you to find. Ignore the calculations for a moment.',check:'In one short phrase, what are you being asked to find?',free:true},
    {step:'choose_first_action',code:'GEN_FIRST_DECISION',text:'We are staying on the current problem. Before doing arithmetic, name the first legal move or relationship you would use. The goal is to choose a move, not finish the problem.',check:'What would you do first?',free:true},
    {step:'locate_breakpoint',code:'GEN_MIDDLE_STEP',text:'Do not erase the work you already understand. Find the last step you are confident is correct. We will work only from that point forward.',check:'Type the last step you know is correct.',free:true},
    {step:'symbol_or_calculation',code:'GEN_SYMBOL_CALC',text:'The overall method may be fine. We will isolate the symbol or calculation that broke the chain instead of restarting the topic.',check:'Which symbol, number, or operation is the confusing part?',free:true},
    {step:'need_work_trace',code:'GEN_NEEDS_MORE_EVIDENCE',text:'I do not have enough evidence to diagnose you yet, and I will not pretend I do. Show me the first thing you would try on this exact problem.',check:'What would you write first?',free:true}
  ];
  var r=steps[i]||steps[4];active.reasoningStep=r.step;active.errorCode=r.code;active.representationHistory.push('diagnostic_prompt');
  fb().innerHTML='<div class="info"><b>Good. We are staying right here.</b><br><br>'+esc(r.text)+'<br><br><b>'+esc(r.check)+'</b><input id="diag-free" class="input" placeholder="Type your thinking"><button onclick="ClassroomDiagnosis.captureWorkTrace()">Use this to teach me</button></div>';
}
function captureWorkTrace(){var el=document.getElementById('diag-free'),v=el?el.value.trim():'';if(!v){fb().innerHTML+='<div class="info">Type even a partial thought. “I would divide,” “I do not know what this symbol means,” or the last line you understand is enough.</div>';return;}active.workTrace=v;active.errorCode=active.errorCode||'GEN_WORK_TRACE';active.representationHistory.push('learner_work_trace');saveRecord(active);fb().innerHTML='<div class="info"><b>Thank you. I am keeping this problem in place.</b><br><br>Your thinking is now part of the diagnosis. The next teaching response should address the step you wrote, not replay the original practice set. For this preview build, use the answer box above to retry after reviewing the exact step you identified.</div>';}
function sameMeaning(got,want){got=norm(got).replace(/×/g,'x').replace(/÷/g,'/').replace(/\s+/g,'');want=norm(want).replace(/×/g,'x').replace(/÷/g,'/').replace(/\s+/g,'');if(got===want)return true;if(want==='3x12=9y'&&(got==='36=9y'||got==='3*12=9y'))return true;return false;}
function microCheck(want){var el=document.getElementById('diag-answer'),got=el?el.value:'';if(!sameMeaning(got,want)){
    active.representationHistory.push('alternate_representation');
    fb().innerHTML+='<div class="info"><b>Not yet, and I am still not restarting the lesson.</b> We stay on this reasoning step and change the representation. Read the expression literally, separate one relationship at a time, then try the quick check again.</div>';return;
  }
  active.repairPassed=true;saveRecord(active);
  fb().innerHTML='<div class="good"><b>That missing step is working now.</b> Retry the original problem above. You are staying on the same problem because we repaired the exact link instead of replaying old questions.</div>';
  var a=document.getElementById('answer');if(a){a.value='';a.focus();}
}
window.ClassroomDiagnosis={propProbe:propProbe,logProbe:logProbe,genericProbe:genericProbe,microCheck:microCheck,captureWorkTrace:captureWorkTrace};
window.ClassroomV2.checkTargetQuestion=intercept;
window.ClassroomV2.targetIdk=interceptIdk;
})();
