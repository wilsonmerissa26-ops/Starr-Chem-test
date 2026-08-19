(function(){'use strict';
var view=document.getElementById('view');if(!view)return;
var examples={
 'Subtract fractions step by step':'7/8 − 1/4\n1/4 = 2/8\n7/8 − 2/8 = 5/8',
 'Fraction of a number':'2/5 of 150\n150 ÷ 5 = 30\n30 × 2 = 60',
 'Mental percent anchors':'10% of 60 = 6\n5% of 60 = 3\n15% of 60 = 6 + 3 = 9',
 'What percent? Mental route':'18 is what percent of 200?\n10% of 200 = 20\n1% = 2\n20 − 2 = 18\n10% − 1% = 9%',
 'What percent? Formal route':'percent = part ÷ whole × 100\n= 18 ÷ 200 × 100\n= 0.09 × 100\n= 9%',
 'Equation = balance':'6x + 4 = 2x + 28',
 'Collect x terms':'6x + 4 = 2x + 28\n−2x        −2x\n4x + 4 = 28',
 'Move the constant':'4x + 4 = 28\n     −4   −4\n4x = 24',
 'Isolate x':'4x = 24\n÷4   ÷4\nx = 6',
 'Cross multiplication explained':'3/x = 9/18\n3 × 18 = 9 × x\n54 = 9x\nx = 6',
 'Multiply same bases':'b⁵ × b²\n= b·b·b·b·b · b·b\n= b⁷',
 'Divide same bases':'c⁸ / c³\n= c⁵',
 'Power of a power':'(y²)³ = y² × y² × y² = y⁶',
 'Negative exponent':'3⁻² = 1/3² = 1/9',
 'Fast exponent recognition':'10¹ × 10⁴ = 10⁵ = 100000',
 'Small decimals':'0.0048 → 4.8\nMoved 3 places\n0.0048 = 4.8 × 10⁻³',
 'Large numbers':'720000 = 7.2 × 10⁵',
 'Multiply':'(3 × 10⁵)(2 × 10⁻²)\n3×2 = 6\n5 + (−2) = 3\n= 6 × 10³',
 'Divide':'(8 × 10⁻⁴)/(2 × 10⁻¹)\n8÷2 = 4\n−4 − (−1) = −3\n= 4 × 10⁻³',
 'Build log(6)':'log(15)=log(3)+log(5)\n≈0.48+0.70\n≈1.18',
 'Negative log with scientific notation':'−log(3×10⁻⁵)\n= −[log(3) + log(10⁻⁵)]\n= −[0.48 + (−5)]\n= −(−4.52)\n≈ 4.52',
 'Small unit to big unit':'640 mL → L\n640 ÷ 1000 = 0.64\n640 mL = 0.64 L',
 'Dimensional analysis formula':'0.045 L × (1000 mL / 1 L)\nL cancels\n0.045 × 1000 = 45\n= 45 mL',
 'Rate conversion one unit at a time':'0.02 mol/s × (1000 mmol/1 mol) × (60 s/1 min)\nmol cancels; s cancels\n0.02 × 1000 × 60\n= 1200 mmol/min',
 'Mental cancellation':'6 g/4 min × 10 min\n= 6×10/4 g\n= 60/4 g\n= 15 g'
};
var explanations={
 'Build log(6)':'Use the product rule on a number built from landmarks you already know. Fifteen is 3×5, so log(15)=log(3)+log(5).',
 'Negative log with scientific notation':'Use two rules you have already learned: log(ab)=log(a)+log(b), and log(10^n)=n. Work the plain log first. Only after that do you apply the negative sign in front of log.'
};
function title(){var h=view.querySelector('.stage')&&view.querySelector('.stage').closest('.card');h=h&&h.querySelector('h2');return h?(h.textContent||'').trim():'';}
function addLogTools(){
 if(!/Logs & estimation/i.test(view.textContent||''))return;
 var details=[].slice.call(view.querySelectorAll('details.card')).find(function(d){return /Math Toolbox/i.test((d.querySelector('summary')||{}).textContent||'');});
 if(!details||details.querySelector('[data-log-power-rule]'))return;
 var chips=details.querySelector('.chips');if(!chips)return;
 ['log(10^n) = n','log(a×10^n) = log(a) + n'].forEach(function(t){var s=document.createElement('span');s.className='pill';s.setAttribute('data-log-power-rule','1');s.textContent=t;chips.appendChild(s);});
}
function apply(){
 var t=title(),visual=view.querySelector('.stage .visual.small');
 if(visual&&examples[t])visual.textContent=examples[t];
 if(explanations[t]){var b=view.querySelector('.teacher .bubble div');if(b)b.textContent=explanations[t];}
 addLogTools();
}
function readPatchedLesson(){
 var bubble=view.querySelector('.teacher .bubble div'),visual=view.querySelector('.stage .visual.small'),mental=view.querySelector('.warning div');
 if(!visual)return;
 try{speechSynthesis.cancel();var u=new SpeechSynthesisUtterance([(bubble&&bubble.textContent)||'',visual.textContent||'',(mental&&mental.textContent)||''].join('. '));u.rate=.86;speechSynthesis.speak(u)}catch(e){}
}
['click','pointerup'].forEach(function(type){view.addEventListener(type,function(e){var b=e.target&&e.target.closest?e.target.closest('#lessonNext,#lessonBack,#replay,#teachFirst'):null;if(!b)return;setTimeout(function(){apply();readPatchedLesson();},0);},true);});
new MutationObserver(function(){setTimeout(apply,0);}).observe(view,{childList:true,subtree:true});
apply();
})();
