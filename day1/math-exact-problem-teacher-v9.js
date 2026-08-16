(function(){'use strict';
function t(e){return(e&&e.textContent||'').replace(/\s+/g,' ').trim()}
function n(s){return String(s).replace(/\s+/g,' ').trim()}
var X={
'5/6 − 1/3 =':['Your pieces are different sizes. First turn 1/3 into sixths. Since 1/3 = 2/6, the problem becomes 5/6 − 2/6.','What does 1/3 equal when written in sixths?','2/6'],
'3/8 of 160 =':['The denominator tells the first move. Divide 160 into 8 equal groups before using the numerator: 160 ÷ 8 = 20. Then take 3 groups.','What is 160 ÷ 8?','20'],
'15% of 80 =':['Build 15% from easy anchors. Ten percent of 80 is 8. Five percent is half of that, 4. Then combine 8 + 4.','What is 10% of 80?','8'],
'24 is what percent of 300?':['Start at a friendly anchor. Ten percent of 300 is 30. One percent is 3, so two percent is 6. Since 30 − 6 = 24, you need 10% − 2%.','What is 10% of 300?','30'],
'25% of 68 =':['Twenty-five percent is exactly one fourth. So this problem is asking for one fourth of 68.','What is 68 ÷ 4?','17'],
'18 is what percent of 60?':['Use 10% chunks. Ten percent of 60 is 6. Ask how many groups of 6 make 18.','What is 10% of 60?','6'],
'4x + 5 = x + 20. Solve for x.':['There are x terms on both sides. Remove the smaller x term first by subtracting x from BOTH sides: 4x − x + 5 = 20, giving 3x + 5 = 20.','After subtracting x from both sides, what coefficient is left on x?','3'],
'7x + 2 = 3x + 26. Solve for x.':['Move the x terms together first. Subtract 3x from BOTH sides. That gives 4x + 2 = 26. Then remove the +2 and finally divide by 4.','What is 7x − 3x?','4x'],
'2/x = 6/15. Solve for x.':['Clear the denominators without treating cross multiplication like magic. Multiply both sides by 15x. The denominators cancel, leaving 2×15 = 6x.','What is 2 × 15?','30'],
'5x − 7 = 18. Solve for x.':['Undo the −7 first. Add 7 to BOTH sides, so 5x = 25. Then divide both sides by 5.','After adding 7 to both sides, what is on the right?','25'],
'2^(-4) =':['The negative exponent means reciprocal, not a negative value. Rewrite 2^(-4) as 1/2^4.','What is 2^4?','16'],
'a^4 × a^3 =':['The bases match and you are multiplying, so count all the a factors together. Four a factors plus three a factors makes seven.','What is 4 + 3?','7'],
'a^7 / a^2 =':['The bases match and you are dividing, so two a factors cancel from seven. That leaves five a factors.','What is 7 − 2?','5'],
'(x^3)^2 =':['A power of a power repeats the whole x^3 group twice: x^3 × x^3. That means the exponents multiply, 3×2.','What is 3 × 2?','6'],
'10^2 × 10^3 =':['The base is 10 on both factors and the operation is multiplication, so add exponents: 2 + 3 = 5.','What exponent belongs on 10 after combining them?','5'],
'Write 0.00061 in scientific notation.':['Move the decimal until the coefficient is 6.1. It moves four places to the right. Because the original number is smaller than 1, the exponent is negative.','How many decimal places move to turn 0.00061 into 6.1?','4'],
'Write 450000 in scientific notation.':['Move the decimal left until the coefficient is 4.5. That is five places. A large original number uses a positive exponent.','How many places move to turn 450000 into 4.5?','5'],
'(4×10^6)(2×10^-3) =':['Do two jobs separately. Coefficients: 4×2 = 8. Exponents: 6 + (−3) = 3. Then recombine them.','What is 6 + (−3)?','3'],
'(9×10^-5)/(3×10^-2) =':['Do two jobs separately. Coefficients: 9÷3 = 3. Exponents: −5 − (−2). Subtracting a negative becomes addition, so −5 + 2 = −3.','What is −5 − (−2)?','-3'],
'Write 0.0072 in scientific notation.':['Move the decimal right until the coefficient is 7.2. It moves three places. Because the original is smaller than 1, use a negative exponent.','How many places move to turn 0.0072 into 7.2?','3'],
'log(10000) =':['Translate the log: 10 to what power equals 10000? Write 10000 as a power of ten first.','10 to what power equals 10000?','4'],
'If log(x) = −4, x =':['Rewrite the logarithm in exponential form. log(x)=−4 means 10^(−4)=x. A negative power of ten moves the decimal four places left.','What power of 10 equals x?','10^-4'],
'Estimate log(6) using log(2)≈0.30 and log(3)≈0.48.':['Factor 6 into the landmarks you were given: 6=2×3. Then use log(2×3)=log(2)+log(3).','What two landmark numbers multiply to make 6?','2 and 3'],
'Estimate −log(6×10^-6) to one decimal.':['Separate the coefficient from the power of ten: −log(6×10^-6)=6−log(6). Use log(6)≈0.78, then round only at the end.','Using the landmark estimate, about what is log(6)?','0.78'],
'0.062 L to mL =':['You are moving from liters to the smaller milliliter unit, so the number must get larger. Use 0.062 L × (1000 mL / 1 L). Liters cancel.','Should the numerical value get larger or smaller?','larger'],
'750 mL to L =':['You are moving from milliliters to the larger liter unit, so the number must get smaller. Use 750 mL × (1 L / 1000 mL).','What operation does 750 × 1/1000 mean?','divide'],
'2.4 g to mg =':['A milligram is smaller than a gram, so you need more of them. Use 2.4 g × (1000 mg / 1 g).','Should the numerical value get larger or smaller?','larger'],
'3500 mcg to mg =':['A milligram is larger than a microgram, so the numerical value gets smaller. Use 3500 mcg × (1 mg / 1000 mcg).','Should the numerical value get larger or smaller?','smaller'],
'0.015 mol/s to mmol/min =':['This rate has two units to convert. First mol→mmol gives ×1000. Then per second→per minute gives ×60 because one minute contains 60 seconds. Cancel the written units before multiplying.','What factor converts mol to mmol?','1000'],
'8 g/5 min for 12 min = how many g?':['Rate × time: (8 g/5 min)×12 min. The minute units cancel, leaving grams. Then compute 8×12÷5.','Which unit cancels when the rate is multiplied by 12 min?','min'],
'2 gal to qt =':['Use the anchor 1 gal = 4 qt. Two gallons means two groups of four quarts.','How many quarts are in 1 gallon?','4']
};
function speak(s){if(!('speechSynthesis'in window))return;try{speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(String(s).replace(/mL/g,'milliliters').replace(/mg/g,'milligrams').replace(/mcg/g,'micrograms').replace(/\^/g,' to the power of '));u.rate=.86;speechSynthesis.speak(u)}catch(e){}}
function same(v,w){v=n(v).toLowerCase();w=n(w).toLowerCase();return v===w||v.indexOf(w)>=0}
function install(){var box=document.querySelector('#view .idkbox'),q=document.querySelector('#view .question');if(!box||!q||box.dataset.exactV9)return;var key=n(t(q)),x=X[key];if(!x)return;box.dataset.exactV9='1';var card=document.createElement('div');card.className='card';card.style.cssText='box-shadow:none;margin:10px 0;background:#fff';card.innerHTML='<div class="phase">This exact problem</div><p>'+x[0]+'</p><button class="btn ghost" data-v9-read>Read this explanation</button><div class="warning" style="margin-top:10px"><b>First move check</b><p>'+x[1]+'</p><input class="input" data-v9-input autocomplete="off"><button class="btn" data-v9-check style="margin-top:8px">Check first move</button><div data-v9-result style="margin-top:8px"></div></div>';box.insertBefore(card,box.firstChild);card.querySelector('[data-v9-read]').onclick=function(){speak(x[0])};card.querySelector('[data-v9-check]').onclick=function(){var out=card.querySelector('[data-v9-result]'),ok=same(card.querySelector('[data-v9-input]').value,x[2]);out.className='feedback '+(ok?'good':'bad');out.innerHTML=ok?'<b>Yes.</b> That is the correct first move. Keep going on the original problem.':'<b>Not yet.</b> Re-read the explanation above and answer only this first move.';if(ok)speak('Yes. That is the correct first move. Keep going on the original problem.')};}
new MutationObserver(function(){setTimeout(install,0)}).observe(document.getElementById('view'),{childList:true,subtree:true});install();
})();