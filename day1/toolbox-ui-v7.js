(function(){'use strict';
var references={
 'Fractions & percentages':{title:'Fractions & percentages',rule:'Fractions need equal-size pieces before adding or subtracting. Percent means out of 100.',meaning:'Use a common denominator for fraction addition/subtraction. For a percent of a number, convert the percent to a decimal or build it from friendly mental anchors.',example:'27% of 80 = 0.27 × 80 = 21.6',mental:'If easier: 20% of 80 = 16, 5% = 4, 2% = 1.6; total = 21.6.'},
 'Algebra':{title:'Algebra',rule:'Keep the equation balanced: do the same operation to both sides.',meaning:'Undo operations around the unknown until the variable is alone.',example:'4x + 5 = 20 → subtract 5 from both sides → 4x = 15 → divide both sides by 4.',mental:'Before writing, name the operation trapping x and its inverse.'},
 'Exponents':{title:'Exponents',rule:'Exponent = repeated factors. Same base ×: add exponents. Same base ÷: subtract exponents. Power of a power: multiply exponents.',meaning:'The rule comes from counting repeated copies of the same base.',example:'a⁴ × a³ = a⁷ because four a factors plus three a factors make seven.',mental:'Identify the operation and whether the base is the same before choosing a rule.'},
 'Scientific notation':{title:'Scientific notation',rule:'Write a number as a coefficient from 1 up to 10 multiplied by a power of 10.',meaning:'The coefficient holds the important digits; the exponent records place value.',example:'0.00061 = 6.1 × 10⁻⁴.',mental:'Estimate size first: a negative exponent should give a number smaller than 1.'},
 'Logs & estimation':{title:'Logs & estimation',rule:'log₁₀(x) asks: 10 to what power equals x?',meaning:'Use powers-of-ten anchors and a small landmark set instead of memorizing dozens of log values.',example:'log(6) = log(2×3) ≈ 0.30 + 0.48 = 0.78.',mental:'Know log(1)=0, log(10)=1, log(100)=2 and useful landmarks log(2)≈0.30, log(3)≈0.48, log(5)≈0.70.'},
 'Unit conversions':{title:'Unit conversions',rule:'Multiply by a conversion ratio equal to 1 so the unwanted unit cancels.',meaning:'The amount does not change, only the unit used to describe it.',example:'750 mL × (1 L / 1000 mL) = 0.750 L. The mL units cancel.',mental:'Predict direction first: going to a bigger unit makes the numerical value smaller; going to a smaller unit makes it larger.'}
};
function txt(el){return (el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function currentReference(){var body=txt(document.getElementById('view'));var keys=Object.keys(references);for(var i=0;i<keys.length;i++){if(body.indexOf(keys[i])>=0)return references[keys[i]];}return null;}
function upgrade(){
 var view=document.getElementById('view');if(!view)return;
 var oldPercent=view.querySelector('[data-percent-toolbox]');if(oldPercent)oldPercent.remove();
 var details=[].slice.call(view.querySelectorAll('details.card')).find(function(d){var s=d.querySelector('summary');return s&&/Math Toolbox/i.test(txt(s));});
 if(!details||details.dataset.toolboxV7)return;
 var ref=currentReference();if(!ref)return;
 details.dataset.toolboxV7='1';details.removeAttribute('open');details.style.margin='10px 0 14px';
 details.innerHTML='<summary style="cursor:pointer;display:inline-flex;align-items:center;gap:8px;border:1px solid #d9cbe7;border-radius:13px;background:white;color:#513567;padding:10px 13px;font-weight:800;list-style:none">🧰 Toolbox</summary><div class="card" style="margin:10px 0 0;box-shadow:none"><div class="phase">'+ref.title+' quick reference</div><p><b>Rule / relationship</b><br>'+ref.rule+'</p><p><b>What it means</b><br>'+ref.meaning+'</p><p><b>One example</b><br><span style="white-space:pre-line">'+ref.example+'</span></p><p><b>Mental shortcut</b><br>'+ref.mental+'</p><p class="muted">This is a reminder only. Dr. Merissa teaches additional examples and strategies in the lesson.</p></div>';
 var firstCard=view.querySelector('.card');if(firstCard&&firstCard!==details)firstCard.parentNode.insertBefore(details,firstCard);
}
new MutationObserver(function(){setTimeout(upgrade,0);}).observe(document.getElementById('view'),{childList:true,subtree:true});
upgrade();
})();