(function(root){'use strict';

var DAY2_KEY='dr-merissa-day2-formal-charge-v1';
var DAY3_KEY='dr-merissa-day3-resonance-v1';

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
function normalize(v){return String(v==null?'':v).trim().toLowerCase().replace(/−/g,'-').replace(/\s+/g,'_');}

var GATES=[
  {id:'FG1',title:'Cold formal-charge retrieval',context:'Oxygen has three bonds and one lone pair.',V:6,N:2,B:3,FC:1},
  {id:'FG2',title:'Fresh formal-charge retrieval',context:'Nitrogen has four single bonds and no lone pairs.',V:5,N:0,B:4,FC:1},
  {id:'FG3',title:'Second fresh formal-charge retrieval',context:'Carbon has one double bond, one single bond, and one lone pair.',V:4,N:2,B:3,FC:-1}
];
function gateDiagnosis(item,a){
  a=a||{};
  if(parseNumber(a.V)!==item.V)return'V';
  if(parseNumber(a.N)!==item.N)return'N';
  if(parseNumber(a.B)!==item.B)return'B';
  if(parseCharge(a.FC)!==item.FC)return'FC';
  return null;
}
function lastDay2Error(day2){
  var errors=day2&&Array.isArray(day2.errors)?day2.errors:[];
  if(errors.length)return errors[errors.length-1];
  var trs=day2&&Array.isArray(day2.transferRecords)?day2.transferRecords:[];
  for(var i=trs.length-1;i>=0;i--)if(trs[i]&&trs[i].error)return trs[i].error==='sum'?'sum':'transfer';
  return null;
}
function day2GatePlan(day2){
  if(!day2||typeof day2!=='object')return{mode:'missing',repair:null};
  if(day2.status==='Independent')return{mode:'cold',repair:null};
  if(day2.status==='Developing')return{mode:'repair',repair:lastDay2Error(day2)||'FC'};
  return{mode:'incomplete',repair:null};
}
function gateRepairText(code){
  if(code==='V')return 'Repair only valence count: use the neutral atom’s group valence before any subtraction.';
  if(code==='N')return 'Repair only nonbonding electrons: one lone pair contains two electrons.';
  if(code==='B')return 'Repair only bond order: single = 1, double = 2, triple = 3.';
  if(code==='sum')return 'Repair only the signed sum: add the atom formal charges and compare with the species charge.';
  if(code==='transfer')return 'Repair only whole-structure bookkeeping: calculate each atom, then check the signed total.';
  return 'Keep V, N, and B separate, then compute V − N − B. Do not guess charge from a memorized atom pattern.';
}

var VOCAB=[
  {id:'contributor',term:'resonance contributor',meaning:'one valid electron-placement drawing of the same species'},
  {id:'hybrid',term:'resonance hybrid',meaning:'the real structure represented by the contributors together'},
  {id:'delocalized',term:'delocalized electrons',meaning:'electrons represented as spread across more than one atom or bond position'},
  {id:'pi',term:'pi bond (π bond)',meaning:'the electron pair in the second bond of a double bond that can participate in resonance'},
  {id:'arrow',term:'curved arrow',meaning:'shows where an electron pair starts and where that pair goes'}
];

var TEACH=[
  {
    id:'fixed',
    title:'Resonance moves electrons, not atoms',
    body:'The atom identities and sigma-bond skeleton stay fixed. Lone pairs, pi bonds, and the formal charges created by those electron placements can change. If a hydrogen moves to a different atom, that is not resonance.'
  },
  {
    id:'arrows',
    title:'A curved arrow starts at electrons',
    body:'The tail starts at a lone pair or a pi bond. A plus sign is not an electron source. The head points to the adjacent atom or bond that receives the pair.'
  },
  {
    id:'allyl',
    title:'Watch one pi pair move',
    body:'Allyl cation: C1H2=C2H−C3H2+  ↔  +C1H2−C2H=C3H2. The atoms stay fixed. The C1=C2 pi pair becomes the C2=C3 pi bond, so the positive charge appears on C1.'
  },
  {
    id:'acetate',
    title:'Sometimes two arrows must move together',
    body:'Acetate: a lone pair on the singly bonded O− forms a new C=O pi bond while the old C=O pi pair moves onto the other oxygen. Both arrows are needed so carbon never exceeds an octet.'
  },
  {
    id:'ranking',
    title:'Valid does not mean equally important',
    body:'R2C=O and R2C+−O− are both valid resonance contributors. The neutral carbonyl contributor is larger because carbon has a full octet there and the drawing avoids charge separation.'
  }
];

var TEACH_CHECKS={
  fixed:{
    prompt:'Which pair can be resonance?',
    options:[
      {value:'pair_a',label:'Pair A: same atoms and sigma skeleton; only the pi bond and charge placement change'},
      {value:'pair_b',label:'Pair B: a hydrogen moves from one carbon to another'}
    ],
    answer:'pair_a',
    error:'The hydrogen-moving pair changes connectivity. Resonance keeps the atom/sigma skeleton fixed.'
  },
  arrows:{
    prompt:'For the allyl-cation move, what kind of thing can be the arrow tail?',
    options:[
      {value:'pi_pair',label:'The existing C1=C2 pi-electron pair'},
      {value:'plus_sign',label:'The + sign on C3'}
    ],
    answer:'pi_pair',
    error:'The + sign marks electron deficiency; it does not contain the electron pair that moves.'
  },
  allyl:{
    prompt:'Where does that C1=C2 pi pair go?',
    options:[
      {value:'c2c3',label:'Into the C2−C3 bond to make C2=C3'},
      {value:'c1',label:'Onto C1 as a lone pair'}
    ],
    answer:'c2c3',
    error:'The allyl-cation resonance move makes the adjacent C2=C3 pi bond.'
  },
  acetate:{
    prompt:'Why must the old C=O pi pair also move when the O− lone pair forms a new C=O?',
    options:[
      {value:'avoid_over_octet',label:'So carbon does not exceed eight electrons'},
      {value:'move_atoms',label:'So the oxygen atoms can exchange positions'}
    ],
    answer:'avoid_over_octet',
    error:'The atoms do not exchange positions. The second arrow preserves carbon’s octet.'
  },
  ranking:{
    prompt:'Is the charge-separated carbonyl drawing invalid just because carbon has an incomplete octet?',
    options:[
      {value:'valid_smaller',label:'No. It is valid, but it is a smaller contributor.'},
      {value:'invalid',label:'Yes. Any incomplete octet is automatically invalid.'}
    ],
    answer:'valid_smaller',
    error:'A carbocation-like incomplete octet can be a valid contributor. It is lower-weight than the comparable full-octet contributor.'
  }
};

var GUIDED=[
  {
    id:'G1',
    title:'Guided: allyl anion',
    structure:'C1H2 = C2H − C3H2−',
    steps:[
      {prompt:'What is the electron source?',options:['c3_lone_pair','minus_sign','c1c2_pi'],answer:'c3_lone_pair',code:'ARROW_TAIL_EMPTY'},
      {prompt:'Where does that pair form a new pi bond?',options:['c2_c3','c1_c2','c1_atom'],answer:'c2_c3',code:'NOT_ADJACENT'},
      {prompt:'Which existing pi pair must move so C2 does not exceed an octet?',options:['c1_c2','c2_c3','none'],answer:'c1_c2',code:'OCTET_EXCEEDED'},
      {prompt:'Where does the old pi pair go?',options:['c1_atom','c3_atom','c2_atom'],answer:'c1_atom',code:'ELECTRONS_NOT_CONSERVED'},
      {prompt:'Which carbon carries −1 in the new contributor?',options:['c1','c2','c3'],answer:'c1',code:'FC_MISMATCH'},
      {prompt:'What is the overall charge after the move?',options:['-1','0','+1'],answer:'-1',code:'CHARGE_SUM'}
    ]
  },
  {
    id:'G2',
    title:'Guided: nitrite, NO2−',
    structure:'O1=N−O2−  (N has one lone pair)',
    steps:[
      {prompt:'What is the electron source?',options:['o2_lone_pair','minus_sign','n_lone_pair'],answer:'o2_lone_pair',code:'ARROW_TAIL_EMPTY'},
      {prompt:'Where does that pair form the new pi bond?',options:['n_o2','n_o1','o1_o2'],answer:'n_o2',code:'NOT_ADJACENT'},
      {prompt:'Which old pi pair moves?',options:['n_o1','n_o2','none'],answer:'n_o1',code:'OCTET_EXCEEDED'},
      {prompt:'Where does that old pi pair go?',options:['o1_atom','o2_atom','n_atom'],answer:'o1_atom',code:'ELECTRONS_NOT_CONSERVED'},
      {prompt:'Nitrogen formal charge in either contributor?',options:['0','+1','-1'],answer:'0',code:'FC_MISMATCH'},
      {prompt:'Singly bonded oxygen formal charge?',options:['-1','0','+1'],answer:'-1',code:'FC_MISMATCH'},
      {prompt:'Overall charge?',options:['-1','0','+1'],answer:'-1',code:'CHARGE_SUM'},
      {prompt:'Are the two nitrite contributors equivalent?',options:['yes','no'],answer:'yes',code:'EQUIVALENT_MISSED'}
    ]
  }
];

function F(key,label,options,answer,code){return{key:key,label:label,options:options,answer:answer,code:code};}
function C(key,label,answer,code){return{key:key,label:label,type:'charge',answer:answer,code:code};}

var ITEMS=[
  {
    id:'I1',title:'True resonance or not?',structure:'Pair: the double bond changes position AND a hydrogen moves to a different carbon.',
    tags:['validity','connectivity'],
    fields:[
      F('validity','Are these resonance contributors?',['resonance','not_resonance'],'not_resonance','CONNECTIVITY_CHANGED'),
      F('reason','Why?',['only_electrons_move','hydrogen_connectivity_changed','looks_asymmetric'],'hydrogen_connectivity_changed','CONNECTIVITY_CHANGED')
    ],
    hint:'Compare the atom-to-atom connections before looking at the double bond.',
    firstStep:'First compare the sigma skeleton and where every hydrogen is attached.',
    walkthrough:['validity','reason']
  },
  {
    id:'I2',title:'Build a substituted allylic-anion move',structure:'C1H3−C2H=C3H−C4H2−',
    tags:['generate','carbon-only','charge-conservation'],
    fields:[
      F('source','Electron source',['c4_lone_pair','minus_sign','c2c3_pi'],'c4_lone_pair','ARROW_TAIL_EMPTY'),
      F('newBond','New pi bond',['c3_c4','c2_c3','c1_c2'],'c3_c4','NOT_ADJACENT'),
      F('oldPi','Old pi pair that must move',['c2_c3','c3_c4','none'],'c2_c3','OCTET_EXCEEDED'),
      F('oldDest','Where old pi pair lands',['c2_atom','c3_atom','c4_atom'],'c2_atom','ELECTRONS_NOT_CONSERVED'),
      F('chargeAtom','Carbon carrying −1 in new contributor',['c1','c2','c3','c4'],'c2','FC_MISMATCH'),
      C('total','Overall charge',-1,'CHARGE_SUM')
    ],
    hint:'Find the lone pair on the anionic carbon that is directly next to the pi bond.',
    firstStep:'This move starts from a lone pair adjacent to the existing pi bond.',
    walkthrough:['source','newBond','oldPi','oldDest','chargeAtom','total']
  },
  {
    id:'I3',title:'Build the other formate contributor',structure:'H−C(=O1)−O2−',
    tags:['generate','heteroatom','equivalent','formal-charge'],
    fields:[
      F('source','Electron source',['o2_lone_pair','minus_sign','c_o1_pi'],'o2_lone_pair','ARROW_TAIL_EMPTY'),
      F('newBond','New pi bond',['c_o2','c_o1','o1_o2'],'c_o2','NOT_ADJACENT'),
      F('oldPi','Old pi pair that moves',['c_o1','c_o2','none'],'c_o1','OCTET_EXCEEDED'),
      F('oldDest','Where old pi pair lands',['o1_atom','o2_atom','c_atom'],'o1_atom','ELECTRONS_NOT_CONSERVED'),
      C('carbonFC','Carbon FC',0,'FC_MISMATCH'),
      C('newDoubleOFC','New double-bonded O2 FC',0,'FC_MISMATCH'),
      C('oldDoubleOFC','Now singly bonded O1 FC',-1,'FC_MISMATCH'),
      C('total','Overall charge',-1,'CHARGE_SUM'),
      F('equivalent','Are the two contributors equivalent?',['yes','no'],'yes','EQUIVALENT_MISSED'),
      F('reason','Why?',['oxygens_exchange_identical_roles','more_symmetric_picture','negative_charge_disappears'],'oxygens_exchange_identical_roles','EQUIVALENT_MISSED')
    ],
    hint:'The singly bonded O− has a lone pair adjacent to the carbonyl.',
    firstStep:'This move starts from a lone pair on the singly bonded oxygen.',
    walkthrough:['source','newBond','oldPi','oldDest','carbonFC','newDoubleOFC','oldDoubleOFC','total','equivalent','reason']
  },
  {
    id:'I4',title:'Rank two acetone contributors',structure:'neutral (CH3)2C=O  ↔  charge-separated (CH3)2C+−O−',
    tags:['rank','octet','charge-separation'],
    fields:[
      F('major','Larger contributor',['neutral','charge_separated'],'neutral','INCOMPLETE_OCTET_RANK'),
      F('neutralOctet','Carbon octet in neutral contributor',['full','incomplete','over_octet'],'full','INCOMPLETE_OCTET_RANK'),
      F('separatedOctet','Carbon octet in charge-separated contributor',['full','incomplete','over_octet'],'incomplete','INCOMPLETE_OCTET_RANK'),
      F('separation','Charge separation comparison',['neutral_has_less','same','separated_has_less'],'neutral_has_less','RANK_CHARGE_SEPARATION')
    ],
    hint:'Compare carbon’s octet before comparing anything else.',
    firstStep:'First compare whether carbon has a full octet in each valid contributor.',
    walkthrough:['neutralOctet','separatedOctet','separation','major']
  },
  {
    id:'I5',title:'Reject a nonadjacent arrow',structure:'A lone pair is separated from a C=C pi bond by a saturated sp3 carbon. Proposed arrow jumps across that carbon.',
    tags:['validity','adjacency','arrow-source'],
    fields:[
      F('validity','Does the proposed arrow make a resonance contributor?',['valid','invalid'],'invalid','NOT_ADJACENT'),
      F('reason','Why?',['continuous_adjacent_path_missing','hydrogen_moved','octet_is_incomplete'],'continuous_adjacent_path_missing','NOT_ADJACENT')
    ],
    hint:'Trace whether the electron source is directly connected into a continuous conjugated path.',
    firstStep:'First check adjacency. A saturated sp3 interruption breaks the resonance path.',
    walkthrough:['validity','reason']
  },
  {
    id:'I6',title:'Build the other nitro contributor',structure:'R−N+(=O1)−O2−',
    tags:['generate','heteroatom','equivalent','formal-charge'],
    fields:[
      F('source','Electron source',['o2_lone_pair','minus_sign','n_o1_pi'],'o2_lone_pair','ARROW_TAIL_EMPTY'),
      F('newBond','New pi bond',['n_o2','n_o1','o1_o2'],'n_o2','NOT_ADJACENT'),
      F('oldPi','Old pi pair that moves',['n_o1','n_o2','none'],'n_o1','OCTET_EXCEEDED'),
      F('oldDest','Where old pi pair lands',['o1_atom','o2_atom','n_atom'],'o1_atom','ELECTRONS_NOT_CONSERVED'),
      C('nFC','Nitrogen FC',1,'FC_MISMATCH'),
      C('doubleOFC','Double-bonded O FC',0,'FC_MISMATCH'),
      C('singleOFC','Singly bonded O FC',-1,'FC_MISMATCH'),
      C('total','Overall nitro-fragment charge',0,'CHARGE_SUM'),
      F('equivalent','Equivalent contributors?',['yes','no'],'yes','EQUIVALENT_MISSED')
    ],
    hint:'Use the singly bonded O− lone pair and protect nitrogen from an over-octet.',
    firstStep:'This move starts from a lone pair on the singly bonded oxygen.',
    walkthrough:['source','newBond','oldPi','oldDest','nFC','doubleOFC','singleOFC','total','equivalent']
  }
];

function fieldCorrect(field,value){
  if(field.type==='charge')return parseCharge(value)===field.answer;
  return normalize(value)===normalize(field.answer);
}
function diagnoseItem(item,answers){
  answers=answers||{};
  for(var i=0;i<item.fields.length;i++){
    var field=item.fields[i];
    if(!fieldCorrect(field,answers[field.key]))return field.code;
  }
  return null;
}
function masteryCreditAllowed(helpTier,priorWrong){return Number(helpTier||0)===0&&!priorWrong;}
function sufficientEvidence(records,gateResolved){
  records=records||[];
  var clean=records.filter(function(r){return r.correct&&r.clean;});
  function tagged(tag){return clean.some(function(r){return (r.tags||[]).indexOf(tag)>=0;});}
  var rankOrEquivalent=tagged('rank')||tagged('equivalent');
  return{
    met:!!gateResolved&&clean.length>=3&&tagged('validity')&&tagged('generate')&&rankOrEquivalent&&tagged('heteroatom'),
    cleanCount:clean.length,
    validity:tagged('validity'),
    generate:tagged('generate'),
    rankOrEquivalent:rankOrEquivalent,
    heteroatom:tagged('heteroatom')
  };
}
function updateErrorStreak(streak,code){
  streak=streak||{code:null,count:0};
  var next=streak.code===code?{code:code,count:Number(streak.count||0)+1}:{code:code,count:1};
  next.switchRepresentation=next.count>=2;
  return next;
}
function representationText(code){
  if(code==='CONNECTIVITY_CHANGED'||code==='SIGMA_BOND_CHANGED')return 'Freeze the atom labels and sigma skeleton. Compare only electron placement.';
  if(code==='ARROW_TAIL_EMPTY')return 'Switch to electron tokens: point to the actual lone pair or pi pair before drawing any arrow.';
  if(code==='NOT_ADJACENT')return 'Trace the conjugated path one bond at a time. A saturated interruption stops the resonance path.';
  if(code==='OCTET_EXCEEDED')return 'Count electrons around the receiving second-row atom before and after the proposed move.';
  if(code==='INCOMPLETE_OCTET_RANK')return 'Use a side-by-side octet table. Incomplete octet can be valid, but full octet is usually the larger contributor.';
  if(code==='FC_MISMATCH'||code==='CHARGE_SUM')return 'Keep the electron move fixed and switch back to V − N − B bookkeeping only on the changed atom(s).';
  if(code==='EQUIVALENT_MISSED')return 'Map atom roles side by side instead of judging which picture looks more symmetric.';
  return 'Account for the same electron pair before and after the move.';
}

var TRANSFERS=[
  {
    id:'T1',title:'Cold transfer: nitrate, NO3−',structure:'Start: O1=N+(−O2−)−O3−',
    fields:[
      F('source','Choose one O− lone-pair source',['o2_lone_pair','o3_lone_pair','plus_sign'],'either_single_o','ARROW_TAIL_EMPTY'),
      F('newBond','New pi bond',['n_o2','n_o3','n_o1'],'match_source','NOT_ADJACENT'),
      F('oldPi','Old pi pair that must move',['n_o1','n_o2','n_o3'],'n_o1','OCTET_EXCEEDED'),
      F('oldDest','Where the old pi pair lands',['o1_atom','o2_atom','o3_atom'],'o1_atom','ELECTRONS_NOT_CONSERVED'),
      C('nFC','Nitrogen FC',1,'FC_MISMATCH'),
      C('newDoubleOFC','New double-bonded O FC',0,'FC_MISMATCH'),
      C('oldDoubleOFC','Former double-bonded O1 FC',-1,'FC_MISMATCH'),
      C('otherSingleOFC','Other singly bonded O FC',-1,'FC_MISMATCH'),
      C('total','Overall charge',-1,'CHARGE_SUM'),
      F('equivalent','The three nitrate contributors are equivalent?',['yes','no'],'yes','EQUIVALENT_MISSED')
    ],
    explanation:'same_skeleton_electrons',
    help:'Freeze N and the three O atoms. Pick one singly bonded O− lone pair, form that N=O, and move the old N=O pi pair back onto O1.'
  },
  {
    id:'T2',title:'Fresh transfer: amide resonance',structure:'CH3−C(=O)−NH2',
    fields:[
      F('source','Electron source',['n_lone_pair','o_lone_pair','c_o_pi'],'n_lone_pair','ARROW_TAIL_EMPTY'),
      F('newBond','New pi bond',['c_n','c_o','n_h'],'c_n','NOT_ADJACENT'),
      F('oldPi','Old pi pair that moves',['c_o','c_n','none'],'c_o','OCTET_EXCEEDED'),
      F('oldDest','Where old pi pair lands',['o_atom','n_atom','c_atom'],'o_atom','ELECTRONS_NOT_CONSERVED'),
      C('oFC','Oxygen FC in charge-separated contributor',-1,'FC_MISMATCH'),
      C('nFC','Nitrogen FC in charge-separated contributor',1,'FC_MISMATCH'),
      C('total','Overall charge',0,'CHARGE_SUM'),
      F('major','Larger contributor',['neutral_amide','charge_separated'],'neutral_amide','RANK_CHARGE_SEPARATION')
    ],
    explanation:'amide_ranking',
    help:'Start from nitrogen’s lone pair, form C=N, and move the C=O pi pair onto oxygen. Then compare charge separation.'
  }
];
function transferFieldCorrect(transfer,field,answers){
  if(transfer.id==='T1'&&field.key==='source')return answers.source==='o2_lone_pair'||answers.source==='o3_lone_pair';
  if(transfer.id==='T1'&&field.key==='newBond'){
    if(answers.source==='o2_lone_pair')return answers.newBond==='n_o2';
    if(answers.source==='o3_lone_pair')return answers.newBond==='n_o3';
    return false;
  }
  return fieldCorrect(field,answers[field.key]);
}
function explanationLooksRight(text,kind){
  var s=String(text||'').toLowerCase().replace(/−/g,'-');
  if(s.trim().length<18)return false;
  if(kind==='same_skeleton_electrons'){
    var skeleton=/(same|unchanged|fixed).*(atom|skeleton|connect)|(atom|skeleton|connect).*(same|unchanged|fixed)/.test(s);
    var electrons=/(electron|lone pair|pi)/.test(s);
    var charge=/(charge).*(same|remain|stays|-1)|(same|remain|stays|-1).*(charge)/.test(s);
    return skeleton&&electrons&&charge;
  }
  if(kind==='amide_ranking'){
    return /(neutral).*(larger|major|more important|contributes more)/.test(s)&&/(charge separation|separated charges|avoids charges|fewer charges)/.test(s);
  }
  return false;
}
function diagnoseTransfer(transfer,answers,explanation){
  answers=answers||{};
  for(var i=0;i<transfer.fields.length;i++){
    var field=transfer.fields[i];
    if(!transferFieldCorrect(transfer,field,answers))return field.code;
  }
  if(!explanationLooksRight(explanation,transfer.explanation))return transfer.explanation==='amide_ranking'?'RANK_CHARGE_SEPARATION':'ELECTRONS_NOT_CONSERVED';
  return null;
}

var API={
  DAY2_KEY:DAY2_KEY,DAY3_KEY:DAY3_KEY,parseNumber:parseNumber,parseCharge:parseCharge,chargeText:chargeText,
  GATES:GATES,gateDiagnosis:gateDiagnosis,lastDay2Error:lastDay2Error,day2GatePlan:day2GatePlan,gateRepairText:gateRepairText,
  VOCAB:VOCAB,TEACH:TEACH,TEACH_CHECKS:TEACH_CHECKS,GUIDED:GUIDED,ITEMS:ITEMS,
  fieldCorrect:fieldCorrect,diagnoseItem:diagnoseItem,masteryCreditAllowed:masteryCreditAllowed,sufficientEvidence:sufficientEvidence,
  updateErrorStreak:updateErrorStreak,representationText:representationText,
  TRANSFERS:TRANSFERS,transferFieldCorrect:transferFieldCorrect,explanationLooksRight:explanationLooksRight,diagnoseTransfer:diagnoseTransfer
};
if(typeof module!=='undefined'&&module.exports)module.exports=API;
if(typeof document==='undefined')return;

var view=document.getElementById('view');
var state={
  screen:'home',day2Plan:null,gateIndex:0,gateResolved:false,gateNeedsFresh:false,
  vocabIndex:0,vocab:{},vocabReveal:false,teachIndex:0,teachPassed:{},
  guidedIndex:0,guidedStep:0,
  records:[],itemIndex:0,itemAttempts:0,itemHelp:0,errorStreak:{code:null,count:0},errors:[],
  walkActive:false,walkStep:0,
  transferIndex:0,transferRecords:[],status:'Not started'
};
try{
  var saved=JSON.parse(localStorage.getItem(DAY3_KEY)||'{}');
  state=Object.assign(state,saved);
  state.vocab=state.vocab||{};
  state.teachPassed=state.teachPassed||{};
  state.records=state.records||[];
  state.errors=state.errors||[];
  state.errorStreak=state.errorStreak||{code:null,count:0};
  state.transferRecords=state.transferRecords||[];
}catch(e){}

function esc(s){return String(s).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]);});}
function save(){try{localStorage.setItem(DAY3_KEY,JSON.stringify(state));}catch(e){}var n=document.getElementById('saveState');if(n)n.textContent='Saved';}
function loadDay2(){try{return JSON.parse(localStorage.getItem(DAY2_KEY)||'null');}catch(e){return null;}}
function shell(inner){return '<div class="topline"><div><div class="phase">DAY 3</div><h1>Resonance</h1></div><div class="save" id="saveState">Saved</div></div>'+inner;}
function speak(text){if(!('speechSynthesis'in window))return;window.speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(String(text).replace(/π/g,' pi ').replace(/−/g,' minus ').replace(/\+/g,' plus '));u.rate=.86;window.speechSynthesis.speak(u);}

function home(){
  return shell('<div class="hero"><h2>Today you will move electrons without moving atoms.</h2><p>Resonance is not a picture-matching lesson. You will identify where an electron pair starts, where it goes, what else must move, and what the formal charges become.</p></div><div class="card"><h3>First dependency</h3><p>Day 3 reads your Day 2 formal-charge record before resonance opens.</p><button class="btn" id="startDay3">Check Day 2 handoff</button></div>');
}
function missingDay2(){
  var incomplete=state.day2Plan&&state.day2Plan.mode==='incomplete';
  return shell('<div class="card"><div class="phase badText">'+(incomplete?'Day 2 is not finished':'Day 2 record not found')+'</div><h2>Formal charge has to come first.</h2><p>'+(incomplete?'Your Day 2 record exists, but it has not ended Independent or Developing yet.':'I cannot open resonance without a Day 2 formal-charge record.')+' Complete or reopen Day 2, then return here.</p><a class="btn linkBtn" href="../day2/">Open Day 2 Formal Charge</a><button class="btn secondary" id="retryDay2">Check again</button></div>');
}
function prerequisiteStop(){
  return shell('<div class="card"><div class="phase badText">Formal-charge prerequisite still unresolved</div><h2>Do not build resonance on top of unstable bookkeeping.</h2><p>You used the available fresh Day 3 retrievals and still needed repair. Return to Day 2 formal charge, repair the specific bookkeeping gap, then come back.</p><a class="btn linkBtn" href="../day2/">Open Day 2 Formal Charge</a></div>');
}
function repairIntro(){
  var code=state.day2Plan&&state.day2Plan.repair||'FC';
  return shell('<div class="card teacher"><div class="avatar">DM</div><div><div class="phase">Targeted prerequisite repair</div><h2>Only the formal-charge piece that needs repair</h2><p>'+esc(gateRepairText(code))+'</p><p>I am not restarting Day 2. After this reminder, you get one fresh formal-charge retrieval.</p><button class="btn" id="startFreshGate">Try the fresh retrieval</button></div></div>');
}
function gate(){
  var g=GATES[state.gateIndex];
  return shell('<div class="card"><div class="phase">Formal-charge gate</div><h2>'+esc(g.title)+'</h2><div class="structure">'+esc(g.context)+'</div><p>Enter the bookkeeping pieces so I can diagnose the first mismatch instead of guessing.</p><div class="grid"><label>V<span>neutral valence</span><input id="gV" class="input" inputmode="numeric"></label><label>N<span>nonbonding electrons</span><input id="gN" class="input" inputmode="numeric"></label><label>B<span>total bond order</span><input id="gB" class="input" inputmode="numeric"></label><label>FC<span>formal charge</span><input id="gFC" class="input" inputmode="text"></label></div><button class="btn" id="checkGate">Check retrieval</button><div id="gateFeedback"></div></div>');
}
function vocab(){
  if(state.vocabIndex>=VOCAB.length){
    return shell('<div class="card success"><div class="phase">Vocabulary check complete</div><h2>Word gaps are recorded separately.</h2><p>Not knowing a term does not erase chemistry understanding. Now we teach the resonance idea itself.</p><button class="btn" id="startTeach">Start resonance teaching</button></div>');
  }
  var v=VOCAB[state.vocabIndex];
  if(state.vocabReveal){
    return shell('<div class="card"><div class="phase">Vocabulary review</div><h2>'+esc(v.term)+'</h2><div class="subtleBox"><b>Meaning</b><p>'+esc(v.meaning)+'</p></div><p>This is a word review only. It does not count as resonance mastery evidence.</p><button class="btn" id="nextVocab">Continue</button></div>');
  }
  return shell('<div class="card"><div class="phase">Vocabulary • '+(state.vocabIndex+1)+' of '+VOCAB.length+'</div><h2>'+esc(v.term)+'</h2><p>Before I define it: do you already know what this term means?</p><div class="actions"><button class="btn secondary vocabChoice" data-value="know">I know this word</button><button class="btn ghost vocabChoice" data-value="review">I need the word review</button></div></div>');
}
function teach(){
  var t=TEACH[state.teachIndex],c=TEACH_CHECKS[t.id];
  var opts=c.options.map(function(o){return '<button class="choice teachChoice" data-value="'+esc(o.value)+'">'+esc(o.label)+'</button>';}).join('');
  return shell('<div class="card teacher"><div class="avatar">DM</div><div class="bubble"><b>Dr. Merissa</b><p>'+esc(t.body)+'</p></div></div><div class="card"><div class="phase">Teach • '+(state.teachIndex+1)+' of '+TEACH.length+'</div><h2>'+esc(t.title)+'</h2><div class="structure">'+esc(t.body)+'</div><button class="btn ghost" id="readTeach">Read aloud</button><div class="lowRisk"><b>'+esc(c.prompt)+'</b>'+opts+'<div id="teachFeedback"></div></div></div>');
}
function guided(){
  var g=GUIDED[state.guidedIndex];
  if(!g)return shell('<div class="card success"><div class="phase">Guided complete</div><h2>Now you build fresh resonance moves alone.</h2><p>The independent items start empty of support. Help is still available, but using it turns that item into practice rather than mastery evidence.</p><button class="btn" id="startIndependent">Start independent resonance</button></div>');
  var step=g.steps[state.guidedStep];
  if(!step){
    return shell('<div class="card success"><div class="phase">'+esc(g.id)+' complete</div><h2>'+esc(g.title)+' checked out.</h2><p>That was supported practice, so it does not count as clean evidence.</p><button class="btn" id="nextGuided">'+(state.guidedIndex+1<GUIDED.length?'Next guided form':'Finish guided practice')+'</button></div>');
  }
  var opts=step.options.map(function(o){return '<button class="choice guidedChoice" data-value="'+esc(o)+'">'+esc(pretty(o))+'</button>';}).join('');
  return shell('<div class="card"><div class="phase">'+esc(g.id)+' • step '+(state.guidedStep+1)+' of '+g.steps.length+'</div><h2>'+esc(g.title)+'</h2><div class="structure">'+esc(g.structure)+'</div><p><b>'+esc(step.prompt)+'</b></p>'+opts+'<div id="guidedFeedback"></div></div><div class="card subtle"><b>Guided is supported.</b> It never counts as clean independent mastery evidence.</div>');
}
function pretty(v){
  return String(v).replace(/_/g,' ').replace(/\bc(\d)\b/g,'C$1').replace(/\bo(\d)\b/g,'O$1').replace(/\bn\b/g,'N').replace(/\bfc\b/ig,'FC');
}
function evidenceLine(){
  var e=sufficientEvidence(state.records,state.gateResolved);
  return '<div class="evidence"><b>Clean evidence '+e.cleanCount+'/3</b><span>validity '+(e.validity?'✓':'○')+'</span><span>generate '+(e.generate?'✓':'○')+'</span><span>rank/equivalent '+(e.rankOrEquivalent?'✓':'○')+'</span><span>heteroatom '+(e.heteroatom?'✓':'○')+'</span></div>';
}
function fieldHtml(field){
  if(field.type==='charge')return '<label class="field"><b>'+esc(field.label)+'</b><input class="input itemInput" data-key="'+esc(field.key)+'" inputmode="text" placeholder="0, +1, −1..."></label>';
  return '<label class="field"><b>'+esc(field.label)+'</b><select class="input itemInput" data-key="'+esc(field.key)+'"><option value="">Choose…</option>'+field.options.map(function(o){return '<option value="'+esc(o)+'">'+esc(pretty(o))+'</option>';}).join('')+'</select></label>';
}
function practice(){
  if(state.itemIndex>=ITEMS.length)return developing('The six fresh resonance items are exhausted without enough clean coverage.');
  var item=ITEMS[state.itemIndex];
  return shell(evidenceLine()+'<div class="card"><div class="phase">Independent resonance • '+(state.itemIndex+1)+' of up to '+ITEMS.length+'</div><h2>'+esc(item.title)+'</h2><div class="structure">'+esc(item.structure)+'</div><div class="builder">'+item.fields.map(fieldHtml).join('')+'</div><div class="actions"><button class="btn" id="checkItem">Check my build</button><button class="btn secondary" id="hint">Give me a hint</button><button class="btn secondary" id="firstStep">Give me the first step</button><button class="btn ghost" id="walk">Walk me through it</button></div><div id="itemFeedback"></div><div id="helpPanel"></div></div>');
}
function transfer(){
  var t=TRANSFERS[state.transferIndex];
  return shell(evidenceLine()+'<div class="card"><div class="phase">Cold whole-concept transfer</div><h2>'+esc(t.title)+'</h2><div class="structure">'+esc(t.structure)+'</div><div class="builder">'+t.fields.map(fieldHtml).join('')+'</div><label class="field"><b>Explain your reasoning</b><textarea id="transferExplain" class="input textarea" placeholder="'+(t.id==='T1'?'Explain what stayed fixed, what moved, and why charge stayed the same.':'Explain why the neutral amide contributor is larger than the charge-separated contributor.')+'"></textarea></label><div class="actions"><button class="btn" id="checkTransfer">Check transfer</button><button class="btn secondary" id="transferHelp">I need help — make this practice</button></div><div id="transferFeedback"></div></div>');
}
function summaryCard(){
  var e=sufficientEvidence(state.records,state.gateResolved);
  var supported=state.records.filter(function(r){return r.correct&&!r.clean;}).length;
  return '<div class="card"><h3>Day 3 evidence</h3><p>Clean independent: <b>'+e.cleanCount+'</b><br>Supported/repaired: <b>'+supported+'</b><br>Validity: <b>'+(e.validity?'cleared':'not yet')+'</b><br>Generate: <b>'+(e.generate?'cleared':'not yet')+'</b><br>Rank/equivalent: <b>'+(e.rankOrEquivalent?'cleared':'not yet')+'</b><br>Heteroatom formal-charge resonance: <b>'+(e.heteroatom?'cleared':'not yet')+'</b></p><p>Cold transfer: <b>'+(state.transferRecords.some(function(r){return r.correct&&r.cold;})?'passed':'not passed')+'</b></p></div>';
}
function mastered(){return shell('<div class="card success"><div class="phase">Day 3 cleared</div><h2>Resonance is independently available.</h2><p>You distinguished atom movement from electron movement, generated fresh contributors, preserved charge/formal charges, reasoned about contributor weight/equivalence, and passed a cold whole-concept transfer.</p><p><b>Next sessions can now use resonance as reasoning instead of as a memorized word.</b></p></div>'+summaryCard());}
function developing(reason){return shell('<div class="card"><div class="phase badText">Resonance: Developing</div><h2>Stop the loop here.</h2><p>'+esc(reason)+'</p><p>The next session should target the specific unresolved error codes below, then use fresh resonance structures rather than replaying this bank.</p><div class="chips">'+state.errors.map(function(x){return '<span>'+esc(x)+'</span>';}).join('')+'</div></div>'+summaryCard());}

function renderWalkthrough(){
  var host=document.getElementById('helpPanel');if(!host)return;
  var item=ITEMS[state.itemIndex],keys=item.walkthrough||[],key=keys[state.walkStep];
  if(!key){host.innerHTML='<div class="warning"><b>Walkthrough complete.</b><p>You supplied the move one step at a time. This item is supported practice; fill the builder above to finish it, then the next clean evidence will be a different item.</p></div>';return;}
  var field=item.fields.find(function(f){return f.key===key;});
  host.innerHTML='<div class="warning"><b>Walkthrough • step '+(state.walkStep+1)+' of '+keys.length+'</b><p>'+esc(field.label)+'</p>'+fieldHtml(Object.assign({},field,{key:'walkValue'}))+'<button class="btn" id="checkWalk" style="margin-top:10px">Check this step</button><div id="walkFeedback"></div></div>';
  var b=document.getElementById('checkWalk');
  if(b)b.onclick=function(){
    var inp=document.querySelector('[data-key="walkValue"]'),out=document.getElementById('walkFeedback');
    if(!inp||!inp.value)return;
    if(fieldCorrect(field,inp.value)){out.innerHTML='<div class="feedback good"><b>Yes.</b> Keep that result and move one step forward.</div>';state.walkStep++;save();setTimeout(renderWalkthrough,220);}
    else out.innerHTML='<div class="feedback bad"><b>Not yet.</b> '+esc(representationText(field.code))+'</div>';
  };
}

function readBuilder(prefix){
  var out={};
  document.querySelectorAll(prefix||'.itemInput').forEach(function(el){out[el.dataset.key]=el.value;});
  return out;
}
function targeted(code){return representationText(code);}
function persistTransfer(record){
  var i=state.transferRecords.findIndex(function(r){return r.id===record.id;});
  if(i>=0)state.transferRecords[i]=Object.assign({},state.transferRecords[i],record);
  else state.transferRecords.push(record);
}
function render(){
  if(!view)return;
  var html=state.screen==='home'?home():
    state.screen==='missingDay2'?missingDay2():
    state.screen==='prerequisiteStop'?prerequisiteStop():
    state.screen==='repairIntro'?repairIntro():
    state.screen==='gate'?gate():
    state.screen==='vocab'?vocab():
    state.screen==='teach'?teach():
    state.screen==='guided'?guided():
    state.screen==='practice'?practice():
    state.screen==='transfer'?transfer():
    state.screen==='mastered'?mastered():
    developing(state.developReason||'More fresh resonance evidence is needed.');
  view.innerHTML=html;bind();save();
}

function bind(){
  var el;
  if((el=document.getElementById('startDay3')))el.onclick=function(){
    var d2=loadDay2();state.day2Plan=day2GatePlan(d2);
    if(state.day2Plan.mode==='missing'||state.day2Plan.mode==='incomplete'){state.screen='missingDay2';}
    else if(state.day2Plan.mode==='cold'){state.gateIndex=0;state.gateNeedsFresh=false;state.screen='gate';}
    else{state.screen='repairIntro';}
    save();render();
  };
  if((el=document.getElementById('retryDay2')))el.onclick=function(){state.screen='home';save();render();};
  if((el=document.getElementById('startFreshGate')))el.onclick=function(){state.gateIndex=1;state.gateNeedsFresh=false;state.screen='gate';save();render();};
  if((el=document.getElementById('checkGate')))el.onclick=function(){
    var g=GATES[state.gateIndex],a={V:document.getElementById('gV').value,N:document.getElementById('gN').value,B:document.getElementById('gB').value,FC:document.getElementById('gFC').value};
    var code=gateDiagnosis(g,a),host=document.getElementById('gateFeedback');
    if(code){
      state.gateNeedsFresh=true;state.errors.push('PREREQ_'+code);
      host.innerHTML='<div class="feedback bad"><b>Not yet.</b> '+esc(gateRepairText(code))+' Repair this item, but it can no longer be the clean retrieval that opens resonance.</div>';
      save();return;
    }
    if(state.gateNeedsFresh){
      if(state.gateIndex+1<GATES.length){
        state.gateIndex++;state.gateNeedsFresh=false;state.screen='gate';save();render();return;
      }
      state.status='Needs formal-charge repair';state.screen='prerequisiteStop';save();render();return;
    }
    state.gateResolved=true;state.screen='vocab';state.vocabIndex=0;state.vocabReveal=false;state.status='Vocabulary';save();render();
  };
  document.querySelectorAll('.vocabChoice').forEach(function(b){b.onclick=function(){var v=VOCAB[state.vocabIndex];state.vocab[v.id]=b.dataset.value;if(b.dataset.value==='review'){state.vocabReveal=true;}else{state.vocabIndex++;state.vocabReveal=false;}save();render();};});
  if((el=document.getElementById('nextVocab')))el.onclick=function(){state.vocabIndex++;state.vocabReveal=false;save();render();};
  if((el=document.getElementById('startTeach')))el.onclick=function(){state.screen='teach';state.teachIndex=0;save();render();};
  if((el=document.getElementById('readTeach')))el.onclick=function(){var t=TEACH[state.teachIndex];speak(t.title+'. '+t.body);};
  document.querySelectorAll('.teachChoice').forEach(function(b){b.onclick=function(){var t=TEACH[state.teachIndex],c=TEACH_CHECKS[t.id],host=document.getElementById('teachFeedback');if(b.dataset.value!==c.answer){host.innerHTML='<div class="feedback bad"><b>Not yet.</b> '+esc(c.error)+'</div>';return;}state.teachPassed[t.id]=true;if(state.teachIndex+1<TEACH.length){state.teachIndex++;save();render();}else{state.screen='guided';state.guidedIndex=0;state.guidedStep=0;save();render();}};});
  document.querySelectorAll('.guidedChoice').forEach(function(b){b.onclick=function(){var g=GUIDED[state.guidedIndex],step=g.steps[state.guidedStep],host=document.getElementById('guidedFeedback');if(b.dataset.value!==step.answer){host.innerHTML='<div class="feedback bad"><b>Not yet.</b> '+esc(targeted(step.code))+'</div>';return;}state.guidedStep++;save();render();};});
  if((el=document.getElementById('nextGuided')))el.onclick=function(){state.guidedIndex++;state.guidedStep=0;save();render();};
  if((el=document.getElementById('startIndependent')))el.onclick=function(){state.screen='practice';state.itemIndex=0;state.itemAttempts=0;state.itemHelp=0;state.errorStreak={code:null,count:0};state.records=[];state.status='Independent practice';save();render();};
  if((el=document.getElementById('hint')))el.onclick=function(){state.itemHelp=Math.max(state.itemHelp,1);save();document.getElementById('helpPanel').innerHTML='<div class="warning"><b>Hint</b><p>'+esc(ITEMS[state.itemIndex].hint)+'</p><p>This item is now supported practice.</p></div>';};
  if((el=document.getElementById('firstStep')))el.onclick=function(){state.itemHelp=Math.max(state.itemHelp,2);save();document.getElementById('helpPanel').innerHTML='<div class="warning"><b>First step</b><p>'+esc(ITEMS[state.itemIndex].firstStep)+'</p><p>This item is now supported practice.</p></div>';};
  if((el=document.getElementById('walk')))el.onclick=function(){state.itemHelp=Math.max(state.itemHelp,3);state.walkStep=0;state.walkActive=true;save();renderWalkthrough();};
  if((el=document.getElementById('checkItem')))el.onclick=function(){
    var item=ITEMS[state.itemIndex],a=readBuilder('.itemInput'),priorWrong=state.itemAttempts>0,code=diagnoseItem(item,a);state.itemAttempts++;
    if(code){
      state.errors.push(code);state.errorStreak=updateErrorStreak(state.errorStreak,code);save();
      var extra=state.errorStreak.switchRepresentation?'<div class="warning"><b>Switching representation.</b><p>'+esc(representationText(code))+'</p></div>':'';
      if(state.errorStreak.switchRepresentation)state.errorStreak={code:null,count:0};
      document.getElementById('itemFeedback').innerHTML='<div class="feedback bad"><b>Not yet.</b> '+esc(targeted(code))+' Stay on this same structure and repair the first mismatch.</div>'+extra;
      return;
    }
    var clean=masteryCreditAllowed(state.itemHelp,priorWrong);
    state.records.push({id:item.id,correct:true,clean:clean,tags:item.tags.slice(),attempts:state.itemAttempts,helpTier:state.itemHelp});
    var e=sufficientEvidence(state.records,state.gateResolved);
    if(e.met){state.screen='transfer';state.transferIndex=0;state.status='Cold transfer';save();render();return;}
    state.itemIndex++;state.itemAttempts=0;state.itemHelp=0;state.errorStreak={code:null,count:0};state.walkStep=0;state.walkActive=false;
    if(state.itemIndex>=ITEMS.length){state.status='Developing';state.screen='developing';state.developReason='The six fresh resonance items are exhausted without enough clean coverage.';}
    save();render();
  };
  if((el=document.getElementById('transferHelp')))el.onclick=function(){
    var t=TRANSFERS[state.transferIndex];persistTransfer({id:t.id,correct:false,cold:false,supported:true,error:'help'});
    if(state.transferIndex===0){
      document.getElementById('transferFeedback').innerHTML='<div class="warning"><b>This transfer is now practice, not mastery evidence.</b><p>'+esc(t.help)+'</p><button class="btn" id="freshTransfer">Use fresh amide transfer</button></div>';
      document.getElementById('freshTransfer').onclick=function(){state.transferIndex=1;save();render();};
    }else{state.status='Developing';state.screen='developing';state.developReason='The fresh amide transfer required support.';save();render();}
  };
  if((el=document.getElementById('checkTransfer')))el.onclick=function(){
    var t=TRANSFERS[state.transferIndex],a=readBuilder('.itemInput'),ex=document.getElementById('transferExplain').value,code=diagnoseTransfer(t,a,ex);
    if(code){
      state.errors.push(code);persistTransfer({id:t.id,correct:false,cold:false,supported:false,error:code});save();
      if(state.transferIndex===0){
        document.getElementById('transferFeedback').innerHTML='<div class="feedback bad"><b>Not yet.</b> '+esc(targeted(code))+' T1 no longer counts as cold evidence.<div class="actions"><button class="btn" id="freshTransfer">Use fresh amide transfer →</button></div></div>';
        document.getElementById('freshTransfer').onclick=function(){state.transferIndex=1;save();render();};
      }else{state.status='Developing';state.screen='developing';state.developReason='The fresh amide transfer still has an unresolved '+code+' error.';save();render();}
      return;
    }
    persistTransfer({id:t.id,correct:true,cold:true,supported:false,error:null});
    state.status='Independent';state.screen='mastered';save();render();
  };
}
render();
})(typeof globalThis!=='undefined'?globalThis:this);
