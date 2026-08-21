(function(root){'use strict';

var VALENCE={H:1,C:4,N:5,O:6,F:7,Cl:7};

function formalCharge(element,nonbondingElectrons,bondOrderSum){
  var v=VALENCE[element];
  if(v==null)throw new Error('Unsupported element: '+element);
  return v-Number(nonbondingElectrons)-Number(bondOrderSum);
}
function parseNumber(v){
  var s=String(v==null?'':v).trim().replace(/−/g,'-');
  if(!s)return NaN;
  var n=Number(s);
  return Number.isFinite(n)?n:NaN;
}
function parseCharge(v){
  var s=String(v==null?'':v).trim().toLowerCase().replace(/−/g,'-').replace(/\s+/g,' ');
  if(!s)return NaN;
  if(/^\+?0(?:\.0+)?$/.test(s))return 0;
  var m=s.match(/^(?:positive|plus)\s*([0-9]+(?:\.[0-9]+)?)$/);
  if(m)return Number(m[1]);
  m=s.match(/^(?:negative|minus)\s*([0-9]+(?:\.[0-9]+)?)$/);
  if(m)return-Number(m[1]);
  var n=Number(s);
  return Number.isFinite(n)?n:NaN;
}
function chargeText(n){n=Number(n);return n>0?'+'+n:String(n);}
function sumCharges(values){return(values||[]).reduce(function(a,b){return a+Number(b||0);},0);}
function diagnose(item,answer){
  answer=answer||{};
  var checks=[['V',parseNumber(answer.V),item.V],['N',parseNumber(answer.N),item.N],['B',parseNumber(answer.B),item.B],['FC',parseCharge(answer.FC),item.FC]];
  for(var i=0;i<checks.length;i++)if(checks[i][1]!==checks[i][2])return checks[i][0];
  return null;
}
function masteryCreditAllowed(helpTier,priorWrong){return Number(helpTier||0)===0&&!priorWrong;}
function sufficientEvidence(records){
  records=records||[];
  var clean=records.filter(function(r){return r.correct&&r.clean;});
  return{
    met:clean.length>=3&&clean.some(function(r){return r.tags&&r.tags.indexOf('charged')>=0;})&&clean.some(function(r){return r.tags&&r.tags.indexOf('multiple')>=0;}),
    cleanCount:clean.length,
    charged:clean.some(function(r){return r.tags&&r.tags.indexOf('charged')>=0;}),
    multiple:clean.some(function(r){return r.tags&&r.tags.indexOf('multiple')>=0;})
  };
}

var GATE_A=[
  {id:'GA1',prompt:'An oxygen is drawn with two lone pairs. How many nonbonding electrons are shown on oxygen?',answer:4},
  {id:'GA2',prompt:'A nitrogen has three single bonds. What is its total bond order?',answer:3}
];
var GATE_B=[
  {id:'GB1',prompt:'Three lone pairs contain how many nonbonding electrons?',answer:6},
  {id:'GB2',prompt:'One double bond plus one single bond gives what total bond order?',answer:3}
];
function gateMisses(bank,values){
  bank=bank||[];
  values=values||[];
  return bank.filter(function(q,i){return parseNumber(values[i])!==q.answer;}).map(function(q){return q.id;});
}
function gateReminderParts(misses){
  misses=misses||[];
  var out=[];
  if(misses.indexOf('GA1')>=0)out.push('One lone pair = 2 nonbonding electrons. Count electrons, not the number of pairs.');
  if(misses.indexOf('GA2')>=0)out.push('Bond order counts lines: single = 1, double = 2, triple = 3.');
  return out;
}

var LESSONS=[
  {
    title:'Formal charge is bookkeeping',
    body:'Pretend each covalent bond is split evenly. An atom gets all of its own lone-pair electrons and one electron from each bond line. Formal charge compares that bookkeeping total with the neutral atom’s usual valence-electron count.',
    note:'Formal charge is not the same as partial charge and does not mean the atom literally carries that full ionic charge in every molecule.'
  },
  {
    title:'Build the rule from electron ownership',
    body:'Full form: formal charge = valence electrons − nonbonding electrons − one-half of bonding electrons. Since half of the bonding electrons equals the total bond order attached to the atom, the working shortcut is FC = V − N − B.',
    note:'Memory cue: Start − dots − lines. Start = the neutral atom’s valence-electron count. Dots = nonbonding electrons, not the number of lone pairs. Lines = total bond order, so a double bond counts as 2.'
  },
  {
    title:'Worked example: carbon in methane',
    body:'Carbon starts with 4 valence electrons. It has 0 nonbonding electrons and 4 single bonds. FC = 4 − 0 − 4 = 0.',
    note:'Why: for bookkeeping, carbon owns one electron from each of its four C–H bonds, so it still owns four electrons.'
  },
  {
    title:'Worked example: oxygen in hydronium',
    body:'In H₃O⁺, oxygen has 6 valence electrons, one lone pair = 2 nonbonding electrons, and 3 single bonds. FC = 6 − 2 − 3 = +1.',
    note:'The three hydrogens each have formal charge 0, so the formal charges add to +1, matching H₃O⁺.'
  },
  {
    title:'Always do the sum check',
    body:'After assigning formal charge to every atom, add the signed charges. A neutral molecule must sum to 0. An ion must sum to the written ion charge.',
    note:'The sum check is an error detector. If the total is wrong, at least one atom needs to be rechecked.'
  }
];

var OWNERSHIP_CHECK=[
  {id:'lone',prompt:'In H₂O, oxygen has two lone pairs. For formal-charge bookkeeping, how many electrons does oxygen own from those lone pairs?',answer:4},
  {id:'bonds',prompt:'Oxygen also has two O–H single bonds. If each bond is split evenly, how many bonding electrons does oxygen own from those two bonds?',answer:2},
  {id:'total',prompt:'How many electrons does oxygen own altogether in this bookkeeping picture?',answer:6}
];
function ownershipDiagnosis(values){
  values=values||{};
  for(var i=0;i<OWNERSHIP_CHECK.length;i++){
    var q=OWNERSHIP_CHECK[i];
    if(parseNumber(values[q.id])!==q.answer)return q.id;
  }
  return null;
}

var GUIDED={id:'G1',element:'O',context:'Guided: oxygen in OH⁻ has three lone pairs and one O–H single bond.',V:6,N:6,B:1,FC:-1,tags:['charged']};
var GUIDED_STEPS=[
  {code:'V',prompt:'Oxygen’s neutral valence count?',answer:6,kind:'number'},
  {code:'N',prompt:'Three lone pairs contain how many nonbonding electrons?',answer:6,kind:'number'},
  {code:'B',prompt:'One O–H single bond contributes what total bond order?',answer:1,kind:'number'},
  {code:'FC',prompt:'Now compute FC = 6 − 6 − 1.',answer:-1,kind:'charge'},
  {code:'H',prompt:'Hydrogen has 1 valence electron, no lone pairs, and one single bond. What is hydrogen’s formal charge?',answer:0,kind:'charge'},
  {code:'sum',prompt:'Add oxygen’s formal charge and hydrogen’s formal charge. What is the total for OH⁻?',answer:-1,kind:'charge'}
];
function guidedStepCorrect(index,value){
  var s=GUIDED_STEPS[index];
  if(!s)return false;
  return s.kind==='charge'?parseCharge(value)===s.answer:parseNumber(value)===s.answer;
}

var ITEMS=[
  {id:'FC-I1',element:'N',context:'Nitrogen in NH₄⁺: four single bonds, no lone pairs.',V:5,N:0,B:4,FC:1,tags:['charged']},
  {id:'FC-I2',element:'O',context:'Oxygen in a carbonyl: one double bond, two lone pairs.',V:6,N:4,B:2,FC:0,tags:['multiple']},
  {id:'FC-I3',element:'C',context:'Carbon with three single bonds and one lone pair.',V:4,N:2,B:3,FC:-1,tags:['charged']},
  {id:'FC-I4',element:'N',context:'Nitrogen with three single bonds and one lone pair.',V:5,N:2,B:3,FC:0,tags:['neutral']},
  {id:'FC-I5',element:'O',context:'Oxygen with one double bond, one single bond, and one lone pair.',V:6,N:2,B:3,FC:1,tags:['multiple','charged']},
  {id:'FC-I6',element:'C',context:'Carbon with one triple bond, one single bond, and no lone pairs.',V:4,N:0,B:4,FC:0,tags:['multiple']}
];
function walkthroughSteps(item){
  return[
    {code:'V',prompt:'What neutral valence-electron count belongs to '+item.element+'?',answer:item.V,kind:'number'},
    {code:'N',prompt:'How many nonbonding electrons are shown on '+item.element+' in this exact structure?',answer:item.N,kind:'number'},
    {code:'B',prompt:'What total bond order is attached to '+item.element+'?',answer:item.B,kind:'number'},
    {code:'FC',prompt:'Using the V, N, and B you just found, what is V − N − B?',answer:item.FC,kind:'charge'}
  ];
}
function walkthroughStepCorrect(item,index,value){
  var s=walkthroughSteps(item)[index];
  if(!s)return false;
  return s.kind==='charge'?parseCharge(value)===s.answer:parseNumber(value)===s.answer;
}
function updateErrorStreak(streak,code){
  streak=streak||{code:null,count:0};
  var next=streak.code===code?{code:code,count:Number(streak.count||0)+1}:{code:code,count:1};
  next.switchRepresentation=next.count>=2;
  return next;
}

var TRANSFERS=[
  {
    id:'T1',
    title:'Fresh transfer: methylammonium, CH₃NH₃⁺',
    body:'Carbon is bonded to three H and to N. Nitrogen is bonded to carbon and three H and has no lone pair.',
    fields:{carbon:0,nitrogen:1,hydrogen:0,total:1},
    explain:{V:5,N:0,B:4,charge:1},
    help:'Focus on nitrogen: identify its neutral valence count, its nonbonding electrons, and the four bonds before calculating. Carbon has four bonds and no lone pairs.'
  },
  {
    id:'T2',
    title:'Fresh transfer: NH₂⁻',
    body:'Nitrogen is bonded to two H and has two lone pairs.',
    fields:{nitrogen:-1,hydrogen:0,total:-1},
    explain:{V:5,N:4,B:2,charge:-1},
    help:'For nitrogen, translate the two lone pairs into nonbonding electrons and count the two single bonds before calculating.'
  }
];

function pushNumber(list,v){
  var n=Number(v);
  if(Number.isFinite(n))list.push(n);
}
function wordCount(word){
  return{one:1,two:2,three:3,four:4,five:5,six:6}[String(word||'').toLowerCase()];
}
function collectMatches(s,re,index,list){
  var m;
  while((m=re.exec(s)))pushNumber(list,m[index]);
}
function componentValues(text,component){
  var s=String(text||'').toLowerCase().replace(/−/g,'-');
  var vals=[];
  if(component==='V'){
    collectMatches(s,/\b([+-]?\d+(?:\.\d+)?)\s+valence(?:\s+electrons?)?\b/g,1,vals);
    collectMatches(s,/\bvalence(?:\s+electrons?)?\s*(?:=|is|:)?\s*([+-]?\d+(?:\.\d+)?)\b/g,1,vals);
    collectMatches(s,/\bstarts?\s+with\s+([+-]?\d+(?:\.\d+)?)\b/g,1,vals);
    collectMatches(s,/\bv\s*(?:=|is|:)\s*([+-]?\d+(?:\.\d+)?)\b/g,1,vals);
  }else if(component==='N'){
    collectMatches(s,/\b([+-]?\d+(?:\.\d+)?)\s+nonbonding(?:\s+electrons?)?\b/g,1,vals);
    collectMatches(s,/\bnonbonding(?:\s+electrons?)?\s*(?:=|is|:)?\s*([+-]?\d+(?:\.\d+)?)\b/g,1,vals);
    collectMatches(s,/\bn\s*(?:=|is|:)\s*([+-]?\d+(?:\.\d+)?)\b/g,1,vals);
    if(/\bno\s+(?:lone\s+pairs?|nonbonding(?:\s+electrons?)?)\b/.test(s))vals.push(0);
    var lp=/\b(\d+|one|two|three|four|five|six)\s+lone\s+pairs?\b/g,m;
    while((m=lp.exec(s))){
      var c=/^\d+$/.test(m[1])?Number(m[1]):wordCount(m[1]);
      if(Number.isFinite(c))vals.push(c*2);
    }
  }else if(component==='B'){
    collectMatches(s,/\b([+-]?\d+(?:\.\d+)?)\s+(?:single\s+)?bonds?\b/g,1,vals);
    collectMatches(s,/\bbond\s+order\s*(?:=|is|:)?\s*([+-]?\d+(?:\.\d+)?)\b/g,1,vals);
    collectMatches(s,/\bb\s*(?:=|is|:)\s*([+-]?\d+(?:\.\d+)?)\b/g,1,vals);
  }
  return vals;
}
function finalChargeValue(text){
  var s=String(text||'').toLowerCase().replace(/−/g,'-');
  var matches=[],m;
  var re=/(?:formal\s+charge|fc)\s*(?:=|is|:)?\s*(positive\s+\d+|plus\s+\d+|negative\s+\d+|minus\s+\d+|[+-]?\d+(?:\.\d+)?)/g;
  while((m=re.exec(s)))matches.push(parseCharge(m[1]));
  if(matches.length)return matches[matches.length-1];
  m=s.match(/=\s*([+-]?\d+(?:\.\d+)?)\s*[.!]?\s*$/);
  return m?parseCharge(m[1]):NaN;
}
function allAssociatedMatch(values,expected){
  return values.length>0&&values.every(function(v){return v===expected;});
}
function explanationLooksRight(text,transfer){
  var s=String(text||'');
  if(s.trim().length<12)return false;
  var ex=transfer.explain||{};
  return allAssociatedMatch(componentValues(s,'V'),ex.V)&&
    allAssociatedMatch(componentValues(s,'N'),ex.N)&&
    allAssociatedMatch(componentValues(s,'B'),ex.B)&&
    finalChargeValue(s)===ex.charge;
}
function transferDiagnosis(transfer,answers,explanation){
  answers=answers||{};
  if(transfer.fields.carbon!=null&&parseCharge(answers.carbon)!==transfer.fields.carbon)return'carbon';
  if(parseCharge(answers.nitrogen)!==transfer.fields.nitrogen)return'nitrogen';
  if(parseCharge(answers.hydrogen)!==transfer.fields.hydrogen)return'hydrogen';
  if(parseCharge(answers.total)!==transfer.fields.total)return'sum';
  if(!explanationLooksRight(explanation,transfer))return'explanation';
  return null;
}
function transferFeedback(code,transfer){
  if(code==='carbon')return 'Recheck carbon only. Count the bonds and lone-pair electrons attached to carbon, then use carbon’s neutral valence count in V − N − B.';
  if(code==='nitrogen'){
    if(transfer&&transfer.id==='T1')return 'Recheck nitrogen only. In this structure nitrogen has no lone pair and four single bonds. Use neutral nitrogen’s valence count, then compute V − N − B.';
    return 'Recheck nitrogen only. In this structure nitrogen has two lone pairs and two single bonds. Convert the lone pairs to nonbonding electrons, then compute V − N − B.';
  }
  if(code==='hydrogen')return 'Recheck hydrogen only. For each H: V = 1, N = 0, and B = 1. Recompute its formal charge from those three pieces.';
  if(code==='sum')return 'Your atom charges need a whole-structure check. Add the signed formal charges and compare the total with the written species charge.';
  if(code==='explanation')return 'The charge entries may be right, but the explanation still has to connect nitrogen’s V, N, and B to its formal charge. State what each component means and use the values from this structure.';
  return 'Recheck this transfer one component at a time.';
}
function upsertTransferRecord(records,record){
  records=(records||[]).slice();
  var i=records.findIndex(function(r){return r.id===record.id;});
  if(i>=0)records[i]=Object.assign({},records[i],record);
  else records.push(Object.assign({},record));
  return records;
}

var API={
  VALENCE:VALENCE,formalCharge:formalCharge,parseCharge:parseCharge,chargeText:chargeText,sumCharges:sumCharges,
  diagnose:diagnose,masteryCreditAllowed:masteryCreditAllowed,sufficientEvidence:sufficientEvidence,
  GATE_A:GATE_A,GATE_B:GATE_B,gateMisses:gateMisses,gateReminderParts:gateReminderParts,
  LESSONS:LESSONS,OWNERSHIP_CHECK:OWNERSHIP_CHECK,ownershipDiagnosis:ownershipDiagnosis,
  GUIDED:GUIDED,GUIDED_STEPS:GUIDED_STEPS,guidedStepCorrect:guidedStepCorrect,
  ITEMS:ITEMS,walkthroughSteps:walkthroughSteps,walkthroughStepCorrect:walkthroughStepCorrect,updateErrorStreak:updateErrorStreak,
  TRANSFERS:TRANSFERS,componentValues:componentValues,finalChargeValue:finalChargeValue,
  explanationLooksRight:explanationLooksRight,transferDiagnosis:transferDiagnosis,transferFeedback:transferFeedback,
  upsertTransferRecord:upsertTransferRecord
};
if(typeof module!=='undefined'&&module.exports)module.exports=API;
if(typeof document==='undefined')return;

var KEY='dr-merissa-day2-formal-charge-v1',view=document.getElementById('view');
var state={
  screen:'home',gateRound:'A',gateMisses:[],lesson:0,ownershipComplete:false,
  records:[],itemIndex:0,itemAttempts:0,itemHelp:0,itemErrorStreak:{code:null,count:0},
  walkStep:0,walkActive:false,guidedStep:0,guidedAnswers:{},
  transferIndex:0,transferRecords:[],status:'Not started',errors:[]
};
try{
  state=Object.assign(state,JSON.parse(localStorage.getItem(KEY)||'{}'));
  state.records=state.records||[];
  state.errors=state.errors||[];
  state.gateMisses=state.gateMisses||[];
  state.guidedAnswers=state.guidedAnswers||{};
  state.itemErrorStreak=state.itemErrorStreak||{code:null,count:0};
  state.transferRecords=state.transferRecords||[];
}catch(e){}

function esc(s){
  return String(s).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]);});
}
function save(){
  try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}
  var n=document.getElementById('saveState');
  if(n)n.textContent='Saved';
}
function speak(text){
  if(!('speechSynthesis'in window))return;
  window.speechSynthesis.cancel();
  var u=new SpeechSynthesisUtterance(String(text).replace(/FC/g,'formal charge').replace(/−/g,' minus ').replace(/\+/g,' plus '));
  u.rate=.84;
  window.speechSynthesis.speak(u);
}
function shell(inner){return '<div class="topline"><div><div class="phase">DAY 2</div><h1>Formal Charge</h1></div><div class="save" id="saveState">Saved</div></div>'+inner;}
function home(){
  return shell('<div class="hero"><h2>Today you will stop guessing charge from patterns.</h2><p>You will calculate it from the Lewis structure, prove where each number came from, and finish on a fresh whole-structure transfer.</p></div><div class="card"><h3>First: electron ownership</h3><p>Before the shortcut appears, you will see exactly which electrons an atom gets to count in formal-charge bookkeeping.</p><button class="btn" id="startDay2">Start the 2-question foundation check</button></div><div class="card subtle"><b>Day 1 stays intact.</b> This page only checks the Lewis-structure pieces formal charge needs.</div>');
}
function gate(){
  var bank=state.gateRound==='A'?GATE_A:GATE_B;
  return shell('<div class="card"><div class="phase">Lewis prerequisite check</div><h2>'+(state.gateRound==='A'?'Two quick checks before formal charge':'Fresh check after the reminder')+'</h2><p>No notes for these two. They only test counting lone-pair electrons and bond order.</p>'+bank.map(function(q,i){return '<label class="q"><b>'+esc(q.prompt)+'</b><input class="input gateInput" data-i="'+i+'" inputmode="numeric" autocomplete="off"></label>';}).join('')+'<button class="btn" id="checkGate">Check both</button><div id="gateFeedback"></div></div>');
}
function gateRefresh(){
  var parts=gateReminderParts(state.gateMisses);
  return shell('<div class="card teacher"><div class="avatar">DM</div><div><h2>Only the counting rule that missed</h2>'+parts.map(function(x){return '<p><b>'+esc(x)+'</b></p>';}).join('')+'<p>I am not restarting Lewis structures. Now prove both prerequisite counts on different examples.</p><button class="btn" id="freshGate">Try the fresh 2-question check</button></div></div>');
}
function prerequisiteStop(){
  return shell('<div class="card"><div class="phase badText">Prerequisite needs a short repair</div><h2>Formal charge is waiting on one Lewis-structure counting skill.</h2><p>Go back to the Day 1 Lewis review, repair lone-pair or bond-order counting, then return here. We are not teaching around a missing prerequisite.</p><a class="btn linkBtn" href="../day1/">Open Day 1 Lewis review</a><button class="btn secondary" id="retryGate">Retry this gate later</button></div>');
}
function teach(){
  var x=LESSONS[state.lesson];
  return shell('<div class="card teacher"><div class="avatar">DM</div><div class="bubble"><b>Dr. Merissa</b><p>'+esc(x.body)+'</p></div></div><div class="card"><div class="phase">Learn • '+(state.lesson+1)+' of '+LESSONS.length+'</div><h2>'+esc(x.title)+'</h2><div class="board">'+esc(x.body)+'</div><div class="warning"><b>Keep this straight</b><p>'+esc(x.note)+'</p></div><div class="actions"><button class="btn secondary" id="lessonBack" '+(state.lesson===0?'disabled':'')+'>← Back</button><button class="btn" id="lessonNext">'+(state.lesson===LESSONS.length-1?'Work one together →':'Next →')+'</button><button class="btn ghost" id="readLesson">Read aloud</button></div></div>');
}
function ownership(){
  return shell('<div class="card"><div class="phase">Ownership check • before the shortcut</div><h2>Which electrons does oxygen get to count?</h2><p>Use H₂O only as a bookkeeping picture. Do not calculate formal charge yet.</p><div class="board">H—O—H<br><span style="font-size:.8em">oxygen also has two lone pairs</span></div>'+OWNERSHIP_CHECK.map(function(q){return '<label class="q"><b>'+esc(q.prompt)+'</b><input class="input ownershipInput" data-id="'+q.id+'" inputmode="numeric" autocomplete="off"></label>';}).join('')+'<div class="actions"><button class="btn secondary" id="ownershipBack">← Back</button><button class="btn" id="checkOwnership">Check electron ownership</button></div><div id="ownershipFeedback"></div></div>');
}
function fourFields(item,prefix){
  prefix=prefix||'';
  return '<div class="calcGrid"><label>V <span>valence electrons</span><input id="'+prefix+'V" class="input" inputmode="numeric"></label><label>N <span>nonbonding electrons</span><input id="'+prefix+'N" class="input" inputmode="numeric"></label><label>B <span>total bond order</span><input id="'+prefix+'B" class="input" inputmode="numeric"></label><label>FC <span>formal charge</span><input id="'+prefix+'FC" class="input" inputmode="text" placeholder="0, +1, −1..."></label></div>';
}
function readFields(prefix){
  prefix=prefix||'';
  return{V:document.getElementById(prefix+'V').value,N:document.getElementById(prefix+'N').value,B:document.getElementById(prefix+'B').value,FC:document.getElementById(prefix+'FC').value};
}
function guided(){
  if(state.guidedStep>=GUIDED_STEPS.length){
    return shell('<div class="card"><div class="phase">Guided practice complete</div><h2>OH⁻ checks out atom by atom and as a whole ion.</h2><div class="chips"><span>O FC = −1 ✓</span><span>H FC = 0 ✓</span><span>Total = −1 ✓</span></div><p>You supplied each bookkeeping step yourself. This remains supported practice, so the next items are fresh and independent.</p><button class="btn" id="startIndependent">Start fresh independent work →</button></div>');
  }
  var step=GUIDED_STEPS[state.guidedStep];
  var done=GUIDED_STEPS.slice(0,state.guidedStep).map(function(s){return '<span>'+esc(s.code)+' = '+esc(state.guidedAnswers[s.code])+' ✓</span>';}).join('');
  return shell('<div class="card"><div class="phase">Guided practice • '+(state.guidedStep+1)+' of '+GUIDED_STEPS.length+'</div><h2>OH⁻: one bookkeeping decision at a time</h2><p>'+esc(GUIDED.context)+'</p>'+(done?'<div class="chips">'+done+'</div>':'')+'<label class="q"><b>'+esc(step.prompt)+'</b><input id="guidedStepInput" class="input" inputmode="'+(step.kind==='charge'?'text':'numeric')+'" autocomplete="off"></label><button class="btn" id="checkGuidedStep">Check this step</button><div id="guidedFeedback"></div></div><div class="card subtle"><b>This is supported practice.</b> It does not count as independent mastery evidence.</div>');
}
function evidenceLine(){
  var e=sufficientEvidence(state.records);
  return '<div class="evidence"><b>Independent evidence:</b> '+e.cleanCount+'/3 clean correct &nbsp; • &nbsp; charged '+(e.charged?'✓':'○')+' &nbsp; • &nbsp; multiple bond '+(e.multiple?'✓':'○')+'</div>';
}
function practice(){
  if(state.itemIndex>=ITEMS.length)return developing('The six fresh atom items are complete, but the evidence rule was not met.');
  var item=ITEMS[state.itemIndex];
  return shell(evidenceLine()+'<div class="card"><div class="phase">Independent formal charge</div><h2>'+esc(item.context)+'</h2><p>Enter each component. The first wrong component tells us what actually needs repair.</p>'+fourFields(item)+'<div class="actions"><button class="btn" id="checkPractice">Check</button><button class="btn secondary" id="hint">Give me a hint</button><button class="btn secondary" id="firstStep">Give me the first step</button><button class="btn ghost" id="walk">Walk me through it</button></div><div id="practiceFeedback"></div><div id="helpPanel"></div></div>');
}
function transfer(){
  var t=TRANSFERS[state.transferIndex];
  var carbon=t.fields.carbon!=null?'<label>Carbon FC<input id="tCarbon" class="input" inputmode="text"></label>':'';
  var fields='<div class="calcGrid">'+carbon+'<label>Nitrogen FC<input id="tNitrogen" class="input" inputmode="text"></label><label>Hydrogen FC <span>each H</span><input id="tHydrogen" class="input" inputmode="text"></label><label>Total formal charge<input id="tTotal" class="input" inputmode="text"></label></div>';
  return shell(evidenceLine()+'<div class="card"><div class="phase">Cold whole-structure transfer</div><h2>'+esc(t.title)+'</h2><p>'+esc(t.body)+'</p>'+fields+'<label class="q"><b>Explain nitrogen using V, N, and B.</b><textarea id="tExplain" class="input textarea" placeholder="Explain why nitrogen’s charge follows from the structure."></textarea></label><div class="actions"><button class="btn" id="checkTransfer">Check transfer</button><button class="btn secondary" id="transferHelp">I need help — make this practice</button></div><div id="transferFeedback"></div></div>');
}
function transferRecordText(r){
  if(r.correct&&r.cold)return r.id+': clean transfer ✓';
  if(r.supported)return r.id+': supported practice';
  return r.id+': needs repair'+(r.error?' ('+r.error+')':'');
}
function mastered(){
  return shell('<div class="card success"><div class="phase">Day 2 cleared</div><h2>Formal charge is independently available.</h2><p>You produced clean atom-level calculations, handled a multiple bond, handled a charged atom, and passed a fresh whole-structure sum check.</p><div class="formula">FC = V − N − B</div><p><b>Next dependency:</b> resonance can now build on this without guessing where charges came from.</p></div>'+summaryCard());
}
function developing(reason){
  return shell('<div class="card"><div class="phase badText">Formal charge: Developing</div><h2>Stop the loop here.</h2><p>'+esc(reason)+'</p><p>The next session should target the specific component errors below, then use fresh problems. Repeating the same six questions is not the plan.</p></div>'+summaryCard());
}
function summaryCard(){
  var e=sufficientEvidence(state.records),counts={V:0,N:0,B:0,FC:0,sum:0};
  state.errors.forEach(function(x){if(counts[x]!=null)counts[x]++;});
  var transfers=state.transferRecords.length?state.transferRecords.map(function(r){return '<span>'+esc(transferRecordText(r))+'</span>';}).join(''):'<span>No transfer recorded yet</span>';
  return '<div class="card"><h3>Evidence record</h3><p>Final status: <b>'+esc(state.status)+'</b><br>Clean independent correct: <b>'+e.cleanCount+'</b><br>Supported/repaired correct: <b>'+state.records.filter(function(r){return r.correct&&!r.clean;}).length+'</b></p><div class="chips"><span>Charged-atom coverage '+(e.charged?'✓':'○')+'</span><span>Multiple-bond coverage '+(e.multiple?'✓':'○')+'</span></div><h4>Transfer evidence</h4><div class="chips">'+transfers+'</div><h4>Error history</h4><div class="chips"><span>V errors '+counts.V+'</span><span>N errors '+counts.N+'</span><span>B errors '+counts.B+'</span><span>FC errors '+counts.FC+'</span><span>Sum errors '+counts.sum+'</span></div></div>';
}
function render(){
  if(!view)return;
  view.innerHTML=state.screen==='home'?home():
    state.screen==='gate'?gate():
    state.screen==='gateRefresh'?gateRefresh():
    state.screen==='prerequisiteStop'?prerequisiteStop():
    state.screen==='teach'?teach():
    state.screen==='ownership'?ownership():
    state.screen==='guided'?guided():
    state.screen==='practice'?practice():
    state.screen==='transfer'?transfer():
    state.screen==='mastered'?mastered():
    developing(state.developReason||'More fresh evidence is needed.');
  bind();save();
}
function targetedMessage(code){
  if(code==='V')return 'Valence count is the first mismatch. Use the neutral atom’s group valence before doing any subtraction.';
  if(code==='N')return 'Nonbonding-electron count is the first mismatch. Count electrons, not lone pairs: one lone pair contains 2 electrons.';
  if(code==='B')return 'Bond order is the first mismatch. Single = 1, double = 2, triple = 3.';
  if(code==='H')return 'Use hydrogen’s own bookkeeping: 1 valence electron, 0 nonbonding electrons, and one single bond.';
  if(code==='sum')return 'Add the signed atom charges you already found and compare the total with the written ion charge.';
  return 'Your V, N, and B are right. Recompute the signed arithmetic: V − N − B.';
}
function representationChange(code,item){
  if(code==='V')return '<div class="warning"><b>Switching representation: use the group map</b><div class="chips"><span>H → 1</span><span>C → 4</span><span>N → 5</span><span>O → 6</span></div><p>Find '+esc(item.element)+' on this map, then enter V again. Do not calculate FC yet.</p></div>';
  if(code==='N')return '<div class="warning"><b>Switching representation: count dots in pairs</b><p><b>•• = 2 nonbonding electrons.</b> Count the lone pairs described in this exact structure, then multiply the number of pairs by 2.</p></div>';
  if(code==='B')return '<div class="warning"><b>Switching representation: translate bond marks</b><div class="chips"><span>single — = 1</span><span>double = = 2</span><span>triple ≡ = 3</span></div><p>Add only the bond orders attached to '+esc(item.element)+'.</p></div>';
  return '<div class="warning"><b>Switching representation: stack the subtraction</b><p>Keep your correct components visible:</p><div class="formula" style="font-size:1.5rem">V ('+item.V+') − N ('+item.N+') − B ('+item.B+')</div><p>Subtract in two small moves. The structure numbers are already right; only the signed arithmetic needs repair.</p></div>';
}
function renderWalkthrough(){
  var host=document.getElementById('helpPanel');
  if(!host)return;
  var item=ITEMS[state.itemIndex],steps=walkthroughSteps(item);
  if(state.walkStep>=steps.length){
    host.innerHTML='<div class="warning"><b>Walkthrough complete.</b><p>You produced V, N, B, and FC one step at a time. Now fill the four boxes above yourself. This item remains supported practice and cannot count as clean mastery evidence.</p></div>';
    return;
  }
  var s=steps[state.walkStep];
  host.innerHTML='<div class="warning"><b>Walkthrough • step '+(state.walkStep+1)+' of '+steps.length+'</b><p>'+esc(s.prompt)+'</p><input id="walkInput" class="input" inputmode="'+(s.kind==='charge'?'text':'numeric')+'" autocomplete="off"><button class="btn" id="checkWalkStep" style="margin-top:8px">Check this step</button><div id="walkFeedback"></div></div>';
  var b=document.getElementById('checkWalkStep');
  if(b)b.onclick=function(){
    var input=document.getElementById('walkInput'),out=document.getElementById('walkFeedback');
    if(!input||!input.value.trim())return;
    if(walkthroughStepCorrect(item,state.walkStep,input.value)){
      out.innerHTML='<div class="feedback good"><b>Yes.</b> Keep that result and move one step forward.</div>';
      state.walkStep++;save();setTimeout(renderWalkthrough,250);
    }else{
      out.innerHTML='<div class="feedback bad"><b>Not yet.</b> '+esc(targetedMessage(s.code))+' Stay on this walkthrough step.</div>';
    }
  };
}
function startIndependent(){
  state.screen='practice';state.itemIndex=0;state.itemAttempts=0;state.itemHelp=0;
  state.itemErrorStreak={code:null,count:0};state.walkStep=0;state.walkActive=false;
  state.records=[];state.errors=[];state.transferRecords=[];state.status='Independent practice';
  save();render();
}
function readTransferAnswers(t){
  return{
    carbon:t.fields.carbon!=null?document.getElementById('tCarbon').value:null,
    nitrogen:document.getElementById('tNitrogen').value,
    hydrogen:document.getElementById('tHydrogen').value,
    total:document.getElementById('tTotal').value
  };
}

function bind(){
  var el;
  if((el=document.getElementById('startDay2')))el.onclick=function(){
    state.screen='gate';state.gateRound='A';state.gateMisses=[];state.status='Checking prerequisite';save();render();
  };
  if((el=document.getElementById('checkGate')))el.onclick=function(){
    var bank=state.gateRound==='A'?GATE_A:GATE_B,inputs=[].slice.call(document.querySelectorAll('.gateInput'));
    var values=inputs.map(function(inp){return inp.value;});
    var misses=gateMisses(bank,values);
    if(!misses.length){
      state.gateMisses=[];state.screen='teach';state.lesson=0;state.status='Learning formal charge';save();render();
    }else if(state.gateRound==='A'){
      state.gateMisses=misses;state.screen='gateRefresh';save();render();
    }else{
      state.screen='prerequisiteStop';state.status='Needs Lewis refresh';save();render();
    }
  };
  if((el=document.getElementById('freshGate')))el.onclick=function(){state.gateRound='B';state.screen='gate';save();render();};
  if((el=document.getElementById('retryGate')))el.onclick=function(){state.gateRound='A';state.gateMisses=[];state.screen='gate';save();render();};
  if((el=document.getElementById('lessonBack')))el.onclick=function(){if(state.lesson>0)state.lesson--;save();render();};
  if((el=document.getElementById('lessonNext')))el.onclick=function(){
    if(state.lesson===0&&!state.ownershipComplete){state.screen='ownership';save();render();return;}
    if(state.lesson<LESSONS.length-1){state.lesson++;save();render();}
    else{state.screen='guided';state.guidedStep=0;state.guidedAnswers={};state.status='Guided';save();render();}
  };
  if((el=document.getElementById('readLesson')))el.onclick=function(){var x=LESSONS[state.lesson];speak(x.title+'. '+x.body+'. '+x.note);};
  if((el=document.getElementById('ownershipBack')))el.onclick=function(){state.screen='teach';state.lesson=0;save();render();};
  if((el=document.getElementById('checkOwnership')))el.onclick=function(){
    var vals={};
    document.querySelectorAll('.ownershipInput').forEach(function(inp){vals[inp.dataset.id]=inp.value;});
    var code=ownershipDiagnosis(vals),host=document.getElementById('ownershipFeedback');
    if(code){
      var msg=code==='lone'?'One lone pair contains 2 electrons. Count the electrons in both lone pairs and try that box again.':code==='bonds'?'Split each O–H bond evenly. Oxygen owns one electron from each bond; count how many O–H bonds are shown.':'Add the two ownership amounts you already worked out instead of recounting the structure from scratch.';
      host.innerHTML='<div class="feedback bad"><b>Not yet.</b> '+esc(msg)+'</div>';return;
    }
    state.ownershipComplete=true;
    host.innerHTML='<div class="feedback good"><b>Yes.</b> Oxygen owns 4 lone-pair electrons + 2 bonding electrons = 6. Now the shortcut will come from that ownership idea.<div class="actions"><button class="btn" id="continueFormula">Build the formal-charge rule →</button></div></div>';
    document.getElementById('continueFormula').onclick=function(){state.screen='teach';state.lesson=1;save();render();};
  };
  if((el=document.getElementById('startIndependent')))el.onclick=startIndependent;
  if((el=document.getElementById('checkGuidedStep')))el.onclick=function(){
    var step=GUIDED_STEPS[state.guidedStep],input=document.getElementById('guidedStepInput'),host=document.getElementById('guidedFeedback');
    if(!input||!input.value.trim())return;
    if(!guidedStepCorrect(state.guidedStep,input.value)){host.innerHTML='<div class="feedback bad"><b>Not yet.</b> '+esc(targetedMessage(step.code))+'</div>';return;}
    state.guidedAnswers[step.code]=step.kind==='charge'?chargeText(step.answer):String(step.answer);
    state.guidedStep++;save();render();
  };
  if((el=document.getElementById('hint')))el.onclick=function(){
    state.itemHelp=Math.max(state.itemHelp,1);save();
    var item=ITEMS[state.itemIndex];
    document.getElementById('helpPanel').innerHTML='<div class="warning"><b>Hint</b><p>Read only what is attached to the '+esc(item.element)+': neutral valence count, nonbonding electrons, then total bond order. Do not use the overall ion charge as the atom’s answer.</p></div>';
  };
  if((el=document.getElementById('firstStep')))el.onclick=function(){
    state.itemHelp=Math.max(state.itemHelp,2);save();
    var item=ITEMS[state.itemIndex];
    document.getElementById('helpPanel').innerHTML='<div class="warning"><b>First step</b><p>'+esc(item.element)+' starts with <b>'+item.V+'</b> valence electrons. You still have to count N and B from the structure.</p></div>';
  };
  if((el=document.getElementById('walk')))el.onclick=function(){
    state.itemHelp=Math.max(state.itemHelp,3);state.walkStep=0;state.walkActive=true;save();renderWalkthrough();
  };
  if((el=document.getElementById('checkPractice')))el.onclick=function(){
    var item=ITEMS[state.itemIndex],a=readFields(''),priorWrong=state.itemAttempts>0,code=diagnose(item,a);
    state.itemAttempts++;
    if(code){
      state.errors.push(code);state.itemErrorStreak=updateErrorStreak(state.itemErrorStreak,code);save();
      var host=document.getElementById('practiceFeedback'),extra='';
      if(state.itemErrorStreak.switchRepresentation){extra=representationChange(code,item);state.itemErrorStreak={code:null,count:0};}
      host.innerHTML='<div class="feedback bad"><b>Not yet.</b> '+esc(targetedMessage(code))+(extra?' <b>You have missed this same component twice, so I am changing the representation instead of repeating the same explanation.</b>':' Stay on this same problem and repair that component.')+'</div>'+extra;
      return;
    }
    var clean=masteryCreditAllowed(state.itemHelp,priorWrong);
    state.records.push({id:item.id,correct:true,clean:clean,tags:item.tags.slice(),helpTier:state.itemHelp,attempts:state.itemAttempts});
    var e=sufficientEvidence(state.records);
    if(e.met){state.screen='transfer';state.transferIndex=0;state.status='Transfer';save();render();return;}
    state.itemIndex++;state.itemAttempts=0;state.itemHelp=0;state.itemErrorStreak={code:null,count:0};state.walkStep=0;state.walkActive=false;
    if(state.itemIndex>=ITEMS.length){state.screen='developing';state.developReason='The six fresh atom items are complete, but 3 clean correct with charged and multiple-bond coverage was not established.';}
    save();render();
  };
  if((el=document.getElementById('transferHelp')))el.onclick=function(){
    var t=TRANSFERS[state.transferIndex];
    state.transferRecords=upsertTransferRecord(state.transferRecords,{id:t.id,correct:false,cold:false,supported:true,error:'help'});
    state.status='Transfer supported';save();
    var host=document.getElementById('transferFeedback');
    host.innerHTML='<div class="warning"><b>This transfer is now practice, not mastery evidence.</b><p>'+esc(t.help)+'</p><button class="btn" id="freshTransfer">Use a fresh transfer</button></div>';
    document.getElementById('freshTransfer').onclick=function(){
      if(state.transferIndex+1<TRANSFERS.length){state.transferIndex++;state.screen='transfer';state.status='Fresh transfer';save();render();}
      else{state.screen='developing';state.status='Developing';state.developReason='Both transfer items required support.';save();render();}
    };
  };
  if((el=document.getElementById('checkTransfer')))el.onclick=function(){
    var t=TRANSFERS[state.transferIndex],answers=readTransferAnswers(t),explain=document.getElementById('tExplain').value;
    var code=transferDiagnosis(t,answers,explain);
    if(!code){
      state.transferRecords=upsertTransferRecord(state.transferRecords,{id:t.id,correct:true,cold:true,supported:false,error:null});
      state.screen='mastered';state.status='Independent';save();render();return;
    }
    if(code==='sum')state.errors.push('sum');
    state.transferRecords=upsertTransferRecord(state.transferRecords,{id:t.id,correct:false,cold:false,supported:false,error:code});
    var message=transferFeedback(code,t);
    if(state.transferIndex+1<TRANSFERS.length){
      var host=document.getElementById('transferFeedback');
      host.innerHTML='<div class="feedback bad"><b>Not yet.</b> '+esc(message)+' This transfer no longer counts as cold evidence.<div class="actions"><button class="btn" id="nextTransfer">Try fresh transfer →</button></div></div>';
      document.getElementById('nextTransfer').onclick=function(){state.transferIndex++;state.status='Fresh transfer';save();render();};
    }else{
      state.screen='developing';state.status='Developing';state.developReason=message+' The fresh transfer still needs repair before resonance opens.';save();render();
    }
  };
}
render();
})(typeof globalThis!=='undefined'?globalThis:this);
