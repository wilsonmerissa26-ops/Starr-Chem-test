(function(){'use strict';
var O=globalThis.Day1Orchestrator,store=localStorage,state=O.load(store),view='home';
var $=function(id){return document.getElementById(id)},root=$('view'),KEY='dr-merissa-day1-ui-v5';
var ui={mathArea:null,mathSessions:{},chemMode:'menu'};try{ui=Object.assign(ui,JSON.parse(store.getItem(KEY)||'{}'));ui.mathSessions=ui.mathSessions||{}}catch(e){}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])})}
function naturalSpeech(s){return String(s).replace(/mL/g,' milliliters ').replace(/mcg/g,' micrograms ').replace(/mmol/g,' millimoles ').replace(/mol/g,' moles ').replace(/\bL\b/g,' liters ').replace(/\bmg\b/g,' milligrams ').replace(/\bg\b/g,' grams ').replace(/×/g,' times ').replace(/÷/g,' divided by ').replace(/≈/g,' approximately ').replace(/−/g,' minus ').replace(/\^/g,' to the power of ')}
function speak(t){if(!('speechSynthesis'in window))return;speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(naturalSpeech(t));u.rate=.86;speechSynthesis.speak(u)}
function save(){store.setItem(KEY,JSON.stringify(ui));O.save(state,store);if($('saveState'))$('saveState').textContent='Saved just now'}
function near(a,b,t){return Math.abs(Number(a)-Number(b))<=(t||1e-9)}
function norm(s){return String(s).trim().toLowerCase().replace(/\s+/g,'').replace(/×/g,'x')}
function num(v){return Number(String(v).replace(/%/g,'').trim())}
function checkFraction(v,n,d){var s=String(v).trim();if(s.indexOf('/')>=0){var p=s.split('/'),a=Number(p[0]),b=Number(p[1]);return b!==0&&near(a/b,n/d)}return near(Number(s),n/d)}
function sci(v,c,e){var s=norm(v),m=s.match(/^([+-]?[0-9]*\.?[0-9]+)x?10\^?([+-]?\d+)$/);return !!m&&near(Number(m[1]),c)&&Number(m[2])===e}
var mental=['Break numbers into friendly parts','Compensate: adjust to 10, 100, or 1000, then correct','Use complements to 10/100/1000','Double one factor and halve the other','Use factor pairs and cancel before multiplying','Estimate first so impossible answers stand out'];
var areas={
fractions_percent:{name:'Fractions & percentages',toolbox:['Common denominator before + or −','Fraction of a number: divide by denominator, multiply by numerator','10% = ÷10','1% = ÷100','5% = half of 10%','25% = one fourth','50% = one half','75% = 50% + 25%','Formal percent = part ÷ whole × 100'],lessons:[
 ['What a fraction means','The denominator tells how many equal pieces make one whole. The numerator tells how many of those pieces you have.','3/8 means 3 pieces when the whole is cut into 8 equal pieces.','Before calculating, picture equal-sized pieces.'],
 ['Subtract fractions step by step','Fractions can only be combined when the pieces are the same size.','5/6 − 1/3\n1/3 = 2/6\n5/6 − 2/6 = 3/6\n3/6 = 1/2','Fast check: 5/6 is a little less than 1. Subtracting 1/3 should leave about 1/2.'],
 ['Fraction of a number','For a/b of N, divide N by b first, then multiply by a. This keeps the arithmetic small.','3/8 of 160\n160 ÷ 8 = 20\n20 × 3 = 60','Mental route: divide first. Smaller numbers are easier to hold in your head.'],
 ['Percent means out of 100','A percent is a fraction with 100 as the reference whole.','25% = 25/100 = 1/4\n50% = 1/2\n75% = 3/4','Translate friendly percentages into fractions when that is faster.'],
 ['Mental percent anchors','Do not reach for a calculator first. Build from anchors.','10% of 80 = 8\n5% of 80 = 4\n15% of 80 = 8 + 4 = 12','This is decomposition: split a harder percent into easy chunks.'],
 ['What percent? Mental route','Ask what familiar percent chunks make the part.','24 is what percent of 300?\n10% of 300 = 30\n1% = 3\n2% = 6\n30 − 6 = 24\n10% − 2% = 8%','Compensation: start at an easy 10%, then correct downward.'],
 ['What percent? Formal route','The formal formula is part divided by whole times 100.','percent = part ÷ whole × 100\n= 24 ÷ 300 × 100\n= 0.08 × 100\n= 8%','Use the mental estimate first, then the formula as proof.'] ],
 problems:[
  {p:'5/6 − 1/3 =',a:function(v){return checkFraction(v,1,2)},help:'Make the denominators match: 1/3 becomes 2/6. Then subtract 5/6 − 2/6 and reduce.'},
  {p:'3/8 of 160 =',a:function(v){return near(v,60)},help:'Divide 160 by 8 first. Then multiply that result by 3.'},
  {p:'15% of 80 =',a:function(v){return near(num(v),12)},help:'Mental route: 10% of 80 is 8. 5% is half of 8, which is 4. Add 8 + 4.'},
  {p:'24 is what percent of 300?',a:function(v){return near(num(v),8)},help:'Mental route: 10% of 300 is 30. 2% is 6. 30 − 6 = 24, so 24 is 8%. Formal route: 24 ÷ 300 × 100.'},
  {p:'25% of 68 =',a:function(v){return near(v,17)},help:'25% is one fourth. Divide 68 by 4.'},
  {p:'18 is what percent of 60?',a:function(v){return near(num(v),30)},help:'10% of 60 is 6. Three groups of 6 make 18, so 30%.'} ]},
algebra:{name:'Algebra',toolbox:['Equals sign means balance','Same operation on both sides','Undo addition/subtraction before multiplication/division','Proportion: multiply diagonally to clear denominators','Check by substituting the answer back'],lessons:[
 ['Equation = balance','An equation says the left side and right side have equal value. Whatever you do to one side, do to the other.','7x + 2 = 3x + 26','Think of a balance scale. One-sided moves break the balance.'],
 ['Collect x terms','Move variable terms together by doing the same subtraction on both sides.','7x + 2 = 3x + 26\n−3x        −3x\n4x + 2 = 26','Say the operation before doing it: subtract 3x from BOTH sides.'],
 ['Move the constant','Undo the +2 with −2 on both sides.','4x + 2 = 26\n     −2   −2\n4x = 24','Opposite operations undo each other.'],
 ['Isolate x','4x means four times x. Division by 4 undoes that multiplication.','4x = 24\n÷4   ÷4\nx = 6','Mental check: 4 × 6 = 24.'],
 ['Cross multiplication explained','In a proportion, multiplying both sides by both denominators produces the diagonal products.','2/x = 6/15\n2 × 15 = 6 × x\n30 = 6x\nx = 5','It is not magic. It is a shortcut for clearing denominators.'],
 ['Fast algebra habit','Before writing, identify the operation trapping x and choose its inverse.','x + 9 → subtract 9\n5x → divide by 5\nx/4 → multiply by 4','Name the inverse operation in your head first.'] ],
 problems:[
  {p:'4x + 5 = x + 20. Solve for x.',a:function(v){return near(v,5)},help:'Subtract x from both sides: 3x + 5 = 20. Subtract 5: 3x = 15. Divide by 3.'},
  {p:'7x + 2 = 3x + 26. Solve for x.',a:function(v){return near(v,6)},help:'Subtract 3x from both sides, subtract 2 from both sides, then divide by 4.'},
  {p:'2/x = 6/15. Solve for x.',a:function(v){return near(v,5)},help:'Multiply diagonally: 2 × 15 = 6x. So 30 = 6x. Divide by 6.'},
  {p:'5x − 7 = 18. Solve for x.',a:function(v){return near(v,5)},help:'Add 7 to both sides to get 5x = 25. Divide both sides by 5.'} ]},
exponents:{name:'Exponents',toolbox:['Exponent = repeated factors','Same base ×: add exponents','Same base ÷: subtract exponents','Power of a power: multiply exponents','Negative exponent = reciprocal','Any nonzero number to power 0 = 1'],lessons:[
 ['What an exponent means','The exponent counts how many copies of the base are multiplied.','2⁴ = 2 × 2 × 2 × 2 = 16','Build meaning before memorizing rules.'],
 ['Multiply same bases','When multiplying the same base, combine all repeated factors, so exponents add.','a⁴ × a³\n= a·a·a·a · a·a·a\n= a⁷','Formula: aᵐaⁿ = aᵐ⁺ⁿ.'],
 ['Divide same bases','Division cancels matching factors, so exponents subtract.','a⁷ / a²\n= a⁵','Formula: aᵐ/aⁿ = aᵐ⁻ⁿ.'],
 ['Power of a power','If a power is raised to another power, every repeated group repeats again. Multiply exponents.','(a³)² = a³ × a³ = a⁶','Formula: (aᵐ)ⁿ = aᵐⁿ.'],
 ['Negative exponent','A negative exponent means reciprocal. It does NOT mean the answer is negative.','2⁻⁴ = 1/2⁴ = 1/16','Say it mentally: negative power sends the factor across the fraction bar.'],
 ['Fast exponent recognition','Before calculating, identify whether the base is the same and which rule applies.','10² × 10³ = 10⁵ = 100000','For powers of ten, the exponent is a place-value shortcut.'] ],
 problems:[
  {p:'2^(-4) =',a:function(v){return checkFraction(v,1,16)},help:'Negative exponent means reciprocal: 2^(-4) = 1/2^4 = 1/16.'},
  {p:'a^4 × a^3 =',a:function(v){return norm(v)==='a^7'},help:'Same base multiplied: add exponents. 4 + 3 = 7.'},
  {p:'a^7 / a^2 =',a:function(v){return norm(v)==='a^5'},help:'Same base divided: subtract exponents. 7 − 2 = 5.'},
  {p:'(x^3)^2 =',a:function(v){return norm(v)==='x^6'},help:'Power of a power: multiply exponents. 3 × 2 = 6.'},
  {p:'10^2 × 10^3 =',a:function(v){return near(v,100000)||norm(v)==='10^5'},help:'Same base 10: add exponents, 2 + 3 = 5. 10^5 = 100000.'} ]},
scientific_notation:{name:'Scientific notation',toolbox:['Coefficient must be at least 1 and less than 10','Large number → positive exponent','Small decimal → negative exponent','Multiply coefficients and add exponents','Divide coefficients and subtract exponents','Renormalize coefficient at the end'],lessons:[
 ['Why scientific notation','Scientific notation separates the important digits from place value.','61000 = 6.1 × 10⁴','The coefficient stays between 1 and 10.'],
 ['Small decimals','Move the decimal until the coefficient is between 1 and 10. Small original numbers use negative exponents.','0.00061 → 6.1\nMoved 4 places\n0.00061 = 6.1 × 10⁻⁴','Mental check: negative exponent should produce a number smaller than 1.'],
 ['Large numbers','Large original numbers use positive exponents.','450000 = 4.5 × 10⁵','Count place moves, then sanity-check the sign.'],
 ['Multiply','Multiply coefficients. Add powers of ten. Then renormalize if needed.','(4 × 10⁶)(2 × 10⁻³)\n4×2 = 8\n6 + (−3) = 3\n= 8 × 10³','Formula: (a×10ᵐ)(b×10ⁿ)=ab×10ᵐ⁺ⁿ.'],
 ['Divide','Divide coefficients. Subtract exponents.','(9 × 10⁻⁵)/(3 × 10⁻²)\n9÷3 = 3\n−5 − (−2) = −3\n= 3 × 10⁻³','Formula: (a×10ᵐ)/(b×10ⁿ)=(a/b)×10ᵐ⁻ⁿ.'],
 ['Fast mental check','Estimate magnitude before exact work.','8 × 10³ = 8000\n3 × 10⁻³ = 0.003','The exponent tells roughly how big or small the answer must be.'] ],
 problems:[
  {p:'Write 0.00061 in scientific notation.',a:function(v){return sci(v,6.1,-4)},help:'Move the decimal 4 places right to make 6.1. Because the original number is less than 1, the exponent is −4.'},
  {p:'Write 450000 in scientific notation.',a:function(v){return sci(v,4.5,5)},help:'Move the decimal 5 places left: 4.5 × 10^5.'},
  {p:'(4×10^6)(2×10^-3) =',a:function(v){return sci(v,8,3)||near(v,8000)},help:'Multiply 4×2=8. Add exponents: 6 + (−3)=3.'},
  {p:'(9×10^-5)/(3×10^-2) =',a:function(v){return sci(v,3,-3)||near(v,.003)},help:'Divide 9÷3=3. Subtract exponents: −5 − (−2)=−3.'},
  {p:'Write 0.0072 in scientific notation.',a:function(v){return sci(v,7.2,-3)},help:'Move the decimal 3 places right to get 7.2. Small number means negative exponent.'} ]},
logs:{name:'Logs & estimation',toolbox:['log(1)=0','log(10)=1','log(100)=2','log(2)≈0.30','log(3)≈0.48','log(5)≈0.70','Product rule: log(ab)=log(a)+log(b)','For −log(a×10⁻ⁿ): n − log(a)'],lessons:[
 ['What a log asks','A base-10 logarithm asks: ten to what power gives this number?','10³ = 1000\nlog(1000) = 3','Translate log into an exponent question.'],
 ['Exact powers of ten','These are exact anchors, not estimates.','log(1)=0\nlog(10)=1\nlog(100)=2\nlog(0.1)=−1','Powers of ten should become automatic.'],
 ['Tiny landmark set','Do not memorize log 1 through 29. Learn a tiny useful set.','log(2)≈0.30\nlog(3)≈0.48\nlog(5)≈0.70','Build other values from these when possible.'],
 ['Build log(6)','Six factors into 2×3, so use the product rule.','log(6)=log(2)+log(3)\n≈0.30+0.48\n≈0.78','Factor first. This is faster than memorizing log(6).'],
 ['Negative log with scientific notation','Separate the power of ten from the front number.','−log(6×10⁻⁶)\n= 6 − log(6)\n≈ 6 − 0.78\n≈ 5.22','Mental structure first: answer must be a little above 5 because 6×10⁻⁶ lies between 10⁻⁵ and 10⁻⁶.'] ],
 problems:[
  {p:'log(10000) =',a:function(v){return near(v,4)},help:'10000 = 10^4, so log(10000)=4.'},
  {p:'If log(x) = −4, x =',a:function(v){return near(v,.0001)},help:'Rewrite as 10^(-4)=x. That is 0.0001.'},
  {p:'Estimate log(6) using log(2)≈0.30 and log(3)≈0.48.',a:function(v){return near(v,.78,.03)},help:'6=2×3. Product rule: log(6)=log(2)+log(3)≈0.30+0.48=0.78.'},
  {p:'Estimate −log(6×10^-6) to one decimal.',a:function(v){return near(v,5.2,.12)},help:'Use 6 − log(6). Since log(6)≈0.78, 6−0.78≈5.22, which is 5.2 to one decimal.'} ]},
unit_conversions:{name:'Unit conversions',toolbox:['1 L = 1000 mL','1 g = 1000 mg','1 mg = 1000 mcg','1 mol = 1000 mmol','1 min = 60 s','1 h = 60 min','1 gal = 4 qt','1 qt = 2 pt','1 pt = 2 cups','Big unit → smaller unit: numerical value gets bigger','Small unit → bigger unit: numerical value gets smaller'],lessons:[
 ['What conversion means','A conversion changes the unit label without changing the amount. Start with an equality you trust.','1 L = 1000 mL','Same liquid amount, different-sized measuring units.'],
 ['Big unit to small unit','A liter is a bigger unit than a milliliter. One liter contains 1000 milliliters, so the number gets bigger.','2.5 L → mL\n2.5 × 1000 = 2500\n2.5 L = 2500 mL','Mental shortcut: multiplying by 1000 moves the decimal 3 places right.'],
 ['Small unit to big unit','Going from small units to a larger unit means fewer units are needed.','750 mL → L\n750 ÷ 1000 = 0.75\n750 mL = 0.75 L','Mental shortcut: dividing by 1000 moves the decimal 3 places left.'],
 ['Dimensional analysis formula','Write the starting value, multiply by a conversion fraction, and place the unwanted unit opposite itself so it cancels.','0.062 L × (1000 mL / 1 L)\nL cancels\n0.062 × 1000 = 62\n= 62 mL','The labels tell you whether your factor is upside down.'],
 ['Pharmacy metric ladder','The same ×1000 or ÷1000 pattern appears repeatedly.','L ↔ mL\ng ↔ mg\nmg ↔ mcg\nmol ↔ mmol','Before calculating, ask: am I moving to a smaller or larger unit?'],
 ['Rate conversion one unit at a time','A rate has more than one unit. Convert each label separately instead of doing everything in one jump.','0.015 mol/s × (1000 mmol/1 mol) × (60 s/1 min)\nmol cancels; s cancels\n0.015 × 1000 × 60\n= 900 mmol/min','Cancel the written units first, then calculate.'],
 ['Mental cancellation','Simplify factors before multiplying large numbers.','8 g/5 min × 12 min\n= 8×12/5 g\n= 96/5 g\n= 19.2 g','Look for cancellation and friendly factors before punching numbers into a calculator.'],
 ['U.S. liquid anchors','For common U.S. liquid units, learn a short chain.','1 gal = 4 qt\n1 qt = 2 pt\n1 pt = 2 cups\ntherefore 1 gal = 16 cups','Build longer conversions from a small anchor set.'] ],
 problems:[
  {p:'0.062 L to mL =',a:function(v){return near(v,62)},help:'L is larger than mL, so multiply by 1000. 0.062 × 1000 = 62 mL.'},
  {p:'750 mL to L =',a:function(v){return near(v,.75)},help:'mL is smaller than L, so divide by 1000. 750 ÷ 1000 = 0.75 L.'},
  {p:'2.4 g to mg =',a:function(v){return near(v,2400)},help:'1 g = 1000 mg. Move to the smaller unit: 2.4 × 1000 = 2400 mg.'},
  {p:'3500 mcg to mg =',a:function(v){return near(v,3.5)},help:'1000 mcg = 1 mg. Move to the larger unit: 3500 ÷ 1000 = 3.5 mg.'},
  {p:'0.015 mol/s to mmol/min =',a:function(v){return near(v,900)},help:'First mol→mmol: ×1000. Then per second→per minute: ×60. 0.015×1000×60=900 mmol/min.'},
  {p:'8 g/5 min for 12 min = how many g?',a:function(v){return near(v,19.2)},help:'Rate × time: (8 g/5 min)×12 min. Minutes cancel. 8×12÷5 = 96÷5 = 19.2 g.'},
  {p:'2 gal to qt =',a:function(v){return near(v,8)},help:'1 gal = 4 qt, so 2×4 = 8 qt.'} ]}
};
function sess(id){if(!ui.mathSessions[id])ui.mathSessions[id]={phase:'entry',step:0,history:[],historyIndex:-1,problemCursor:0,correct:0,attempts:0,status:'Not started',idk:false};return ui.mathSessions[id]}
function problem(a,s,fresh){if(fresh||s.historyIndex<0){var q=a.problems[s.problemCursor%a.problems.length];s.problemCursor++;s.history=s.history.slice(0,s.historyIndex+1);s.history.push(q);s.historyIndex=s.history.length-1;save()}return s.history[s.historyIndex]}
function toolbox(a){return '<details class="card" open><summary><b>Math Toolbox</b></summary><div class="chips">'+a.toolbox.map(function(x){return '<span class="pill">'+esc(x)+'</span>'}).join('')+'</div><h3>Mental Math Lab</h3><div class="chips">'+mental.map(function(x){return '<span class="pill">'+esc(x)+'</span>'}).join('')+'</div></details>'}
function allSkills(){return '<button class="btn ghost" id="mathMenu">← All math skills</button>'}
function mathMenu(){return '<div class="card"><div class="phase">Math Foundation</div><h2>Choose any skill</h2><p>Every skill has teaching, mental-math strategy, toolbox, practice, retry, and saved progress.</p><div class="grid">'+Object.keys(areas).map(function(id){var s=sess(id);return '<button class="mathArea" data-area="'+id+'"><b>'+esc(areas[id].name)+'</b><span class="status">'+esc(s.status)+(s.phase!=='entry'?' • Resume':'')+'</span></button>'}).join('')+'</div></div>'}
function entry(a){return allSkills()+'<div class="card"><div class="phase">'+esc(a.name)+'</div><h2>How do you want to start?</h2><p>You can change routes at any time.</p><div class="actions"><button class="btn" id="teachFirst">▶ Teach me the full skill</button><button class="btn secondary" id="tryFirst">✏️ Let me try problems first</button></div></div>'+toolbox(a)}
function lesson(a,s){var x=a.lessons[s.step];return allSkills()+'<div class="card teacher"><div class="avatar">🎓</div><div class="bubble"><b>Dr. Merissa</b><div>'+esc(x[1])+'</div></div></div><div class="card"><div class="phase">Learning • '+(s.step+1)+' of '+a.lessons.length+'</div><h2>'+esc(x[0])+'</h2><div class="stage"><div class="visual small" style="white-space:pre-line">'+esc(x[2])+'</div></div><div class="warning" style="margin-top:12px"><b>Mental / no-calculator thinking</b><div>'+esc(x[3])+'</div></div><div class="actions" style="margin-top:12px"><button class="btn secondary" id="lessonBack" '+(s.step===0?'disabled':'')+'>← Back</button><button class="btn" id="lessonNext">'+(s.step===a.lessons.length-1?'Practice this skill →':'Next step →')+'</button><button class="btn secondary" id="replay">Replay explanation</button><button class="btn ghost" id="anotherWay">Teach this another way</button></div><div id="altTeach"></div></div>'+toolbox(a)}
function practice(a,s){var q=problem(a,s,false),prev=s.historyIndex>0,next=s.historyIndex<s.history.length-1;return allSkills()+'<div class="card"><div class="phase">Practice • '+esc(a.name)+'</div><div class="question">'+esc(q.p)+'</div><input id="answer" class="input" inputmode="text" autocomplete="off"><div class="actions" style="margin-top:12px"><button class="btn" id="check">Check answer</button><button class="btn secondary" id="idk">I don’t know yet</button><button class="btn ghost" id="teachFull">Teach this skill</button></div><div class="actions" style="margin-top:10px"><button class="btn secondary" id="prevProblem" '+(prev?'':'disabled')+'>← Previous problem</button><button class="btn secondary" id="nextHistory" '+(next?'':'disabled')+'>Next seen problem →</button><button class="btn ghost" id="skipProblem">Skip → new '+esc(a.name)+' problem</button></div><div id="feedback">'+(s.idk?'<div class="idkbox"><b>Let me break THIS problem down.</b><p>'+esc(q.help)+'</p><p>Stay here and retry when ready.</p></div>':'')+'</div></div>'+toolbox(a)}
function home(){return '<div class="hero"><div class="phase">DAY 1</div><h1>Choose where you want to work.</h1><p>Phone, tablet, and computer use the same lesson content and controls.</p></div><div class="grid"><div class="card"><h2>Math</h2><p>Six no-calculator foundation skills with mental-math training.</p><button class="btn" data-go="math">Open math</button></div><div class="card"><h2>Chemistry</h2><p>Teacher-led Lewis structures plus fresh molecule practice.</p><button class="btn secondary" data-go="chemistry">Open chemistry</button></div></div><div class="card"><button class="btn ghost" id="printPage">Print / Save this page</button><p class="muted">This gives you a browser print/save option when a device does not offer a full-page screenshot.</p></div>'}
function chemistry(){if(ui.chemMode==='teach')return '<button class="btn ghost" id="chemMenu">← Chemistry menu</button><div class="card iframeWrap"><iframe src="../chemistry-teacher-preview/" title="Chemistry teacher"></iframe></div>';if(ui.chemMode==='practice')return '<button class="btn ghost" id="chemMenu">← Chemistry menu</button><div class="card iframeWrap"><iframe src="../chemistry-teacher-preview/#practice" title="Chemistry practice"></iframe></div>';return '<div class="card"><h2>Chemistry Foundation</h2><p>Choose teaching or practice. You can return here at any time.</p><div class="actions"><button class="btn" id="chemTeach">▶ Teach me the lesson</button><button class="btn secondary" id="chemPractice">✏️ Let me practice</button></div></div>'}
function notebook(){return '<div class="card"><h2>Notebook</h2>'+(state.notebook.length?state.notebook.map(function(f){return '<div class="notebookFact">'+esc(f)+'</div>'}).join(''):'<p>No facts yet. Teaching facts appear here as lessons are completed.</p>')+'</div>'}
function review(){var q=(state.sameSessionReview||[]).concat(state.nextSessionQueue||[]);return '<div class="card"><h2>Review</h2>'+(q.length?q.map(function(x){return '<div class="queue">'+esc(x)+'</div>'}).join(''):'<p>Nothing queued right now.</p>')+'</div>'}
function summary(){return '<div class="card"><h2>Day 1 Summary</h2><table class="summaryTable">'+Object.keys(areas).map(function(id){var s=sess(id);return '<tr><td>'+esc(areas[id].name)+'</td><td>'+esc(s.status)+'</td><td>'+s.correct+' correct / '+s.attempts+' attempts</td></tr>'}).join('')+'</table><p><b>Notebook facts:</b> '+state.notebook.length+'</p></div>'}
function math(){if(!ui.mathArea)return mathMenu();var a=areas[ui.mathArea],s=sess(ui.mathArea);return s.phase==='entry'?entry(a):s.phase==='teach'?lesson(a,s):practice(a,s)}
function render(){root.innerHTML=view==='home'?home():view==='math'?math():view==='chemistry'?chemistry():view==='notebook'?notebook():view==='review'?review():summary();bind()}
function setView(v){view=v;if(v==='chemistry')ui.chemMode='menu';document.querySelectorAll('#navTabs button').forEach(function(b){b.classList.toggle('on',b.dataset.view===v)});render()}
$('navTabs').addEventListener('click',function(e){if(e.target.dataset.view){if(e.target.dataset.view==='math')ui.mathArea=null;setView(e.target.dataset.view)}});
function bind(){
 document.querySelectorAll('[data-go]').forEach(function(b){b.onclick=function(){setView(b.dataset.go)}});document.querySelectorAll('[data-area]').forEach(function(b){b.onclick=function(){ui.mathArea=b.dataset.area;save();render()}});
 if($('mathMenu'))$('mathMenu').onclick=function(){ui.mathArea=null;save();render()};if($('printPage'))$('printPage').onclick=function(){window.print()};
 if($('teachFirst'))$('teachFirst').onclick=function(){var s=sess(ui.mathArea),a=areas[ui.mathArea];s.phase='teach';s.step=0;s.status='Learning';save();render();speak(a.lessons[0][1]+' '+a.lessons[0][2])};
 if($('tryFirst'))$('tryFirst').onclick=function(){var s=sess(ui.mathArea),a=areas[ui.mathArea];s.phase='practice';s.status='Practicing';problem(a,s,true);render()};
 if($('lessonBack'))$('lessonBack').onclick=function(){var s=sess(ui.mathArea),a=areas[ui.mathArea];if(s.step>0)s.step--;save();render();speak(a.lessons[s.step][1]+' '+a.lessons[s.step][2])};
 if($('lessonNext'))$('lessonNext').onclick=function(){var s=sess(ui.mathArea),a=areas[ui.mathArea];if(s.step<a.lessons.length-1){s.step++;save();render();speak(a.lessons[s.step][1]+' '+a.lessons[s.step][2])}else{s.phase='practice';s.status='Practicing';problem(a,s,true);save();render()}};
 if($('replay'))$('replay').onclick=function(){var s=sess(ui.mathArea),x=areas[ui.mathArea].lessons[s.step];speak(x[1]+' '+x[2]+' '+x[3])};
 if($('anotherWay'))$('anotherWay').onclick=function(){var s=sess(ui.mathArea),x=areas[ui.mathArea].lessons[s.step],msg='Start with the mental check first: '+x[3]+' Then read the worked steps one line at a time. Do not move forward until each line explains where the next line came from.';$('altTeach').innerHTML='<div class="idkbox"><b>Another route</b><p>'+esc(msg)+'</p></div>';speak(msg)};
 if($('teachFull'))$('teachFull').onclick=function(){var s=sess(ui.mathArea);s.phase='teach';s.step=0;s.idk=false;save();render()};
 if($('prevProblem'))$('prevProblem').onclick=function(){var s=sess(ui.mathArea);if(s.historyIndex>0)s.historyIndex--;s.idk=false;save();render()};
 if($('nextHistory'))$('nextHistory').onclick=function(){var s=sess(ui.mathArea);if(s.historyIndex<s.history.length-1)s.historyIndex++;s.idk=false;save();render()};
 if($('skipProblem'))$('skipProblem').onclick=function(){var s=sess(ui.mathArea),a=areas[ui.mathArea];O.scheduleReview(state,ui.mathArea,'skip');s.idk=false;problem(a,s,true);save();render()};
 if($('idk'))$('idk').onclick=function(){var s=sess(ui.mathArea),a=areas[ui.mathArea],q=problem(a,s,false);s.idk=true;O.scheduleReview(state,ui.mathArea,'repeated_idk');save();render();speak(q.help)};
 if($('check'))$('check').onclick=function(){var s=sess(ui.mathArea),a=areas[ui.mathArea],q=problem(a,s,false),v=$('answer').value.trim();if(!v)return;s.attempts++;if(q.a(v)){s.correct++;s.status='In progress';s.idk=false;save();$('feedback').innerHTML='<div class="feedback good"><b>Correct.</b> Before moving on, say the shortcut or rule you used in your head.</div>';setTimeout(function(){problem(a,s,true);render()},850)}else{s.idk=true;save();$('feedback').innerHTML='<div class="feedback bad"><b>Not yet. Same problem. Try again.</b><p>'+esc(q.help)+'</p></div>';speak(q.help)}};
 if($('chemTeach'))$('chemTeach').onclick=function(){ui.chemMode='teach';save();render()};if($('chemPractice'))$('chemPractice').onclick=function(){ui.chemMode='practice';save();render()};if($('chemMenu'))$('chemMenu').onclick=function(){ui.chemMode='menu';save();render()};
}
window.addEventListener('message',function(e){if(e.data&&e.data.type==='dr-merissa-notebook-fact'&&e.data.fact){O.addNotebookFact(state,e.data.fact,'TEACH');save()}});
render();
})();