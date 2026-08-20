/* ============================================================
   SEMANTIC ANSWER EQUIVALENCE
   Small, conservative normalization layer for learner free-text answers.
   It does not decide correctness. It only converts clearly equivalent input
   into the canonical form expected by the existing checker.
   ============================================================ */
(function(root,factory){
  'use strict';
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else{root.SemanticAnswerEquivalence=api;api.install(root.document);}
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function text(v){return String(v==null?'':v).trim().toLowerCase().replace(/−/g,'-').replace(/\s+/g,' ');}
  function strictNumber(v){
    var s=String(v==null?'':v).trim().replace(/,/g,'').replace(/−/g,'-');
    if(!/^[+-]?(?:(?:\d+(?:\.\d*)?)|(?:\.\d+))(?:[eE][+-]?\d+)?$/.test(s))return null;
    var n=Number(s);return Number.isFinite(n)?n:null;
  }
  function canonicalNumber(v){var n=strictNumber(v);return n===null?null:String(n);}

  function operation(v){
    var s=text(v),found=[];
    if(/\bdivide(?:d|s|ing)?\b|\bdivision\b|÷|\//.test(s))found.push('divide');
    if(/\bmultiply(?:ing|ied|ies)?\b|\bmultiplication\b|\btimes\b|×|\*/.test(s))found.push('multiply');
    if(/\badd(?:ed|ing)?\b|\baddition\b|\bplus\b/.test(s))found.push('add');
    if(/\bsubtract(?:ed|ing)?\b|\bsubtraction\b|\bminus\b/.test(s))found.push('subtract');
    found=found.filter(function(x,i,a){return a.indexOf(x)===i;});
    return found.length===1?found[0]:null;
  }

  function direction(v){
    var s=text(v),large=/\b(larger|bigger|greater|increase|increases|increased|goes up)\b/.test(s),small=/\b(smaller|less|decrease|decreases|decreased|goes down)\b/.test(s);
    if(large===small)return null;
    return large?'larger':'smaller';
  }

  function affirmative(v){
    var s=text(v).replace(/[.!?]+$/,'');
    if(/^(y|yes|yeah|yep|correct|they match|the bases match|bases match|same|same base|same bases|both match|both are the same)$/.test(s))return true;
    if(/^(n|no|nope|incorrect|they do not match|they don't match|the bases do not match|different|different base|different bases)$/.test(s))return false;
    return null;
  }

  function numbersIn(v){var m=String(v==null?'':v).replace(/−/g,'-').match(/[+-]?(?:\d+(?:\.\d*)?|\.\d+)/g);return m?m.map(Number):[];}
  function isFactorPair(v,a,b){
    var nums=numbersIn(v);if(nums.length!==2)return false;
    return (nums[0]===Number(a)&&nums[1]===Number(b))||(nums[0]===Number(b)&&nums[1]===Number(a));
  }

  function normalizeShortAnswer(v,question){
    var q=text(question),n=canonicalNumber(v);if(n!==null)return n;
    var op=operation(v);
    if(/what operation|multiply or divide|operation isolates/.test(q)&&op)return op;
    var dir=direction(v);
    if(/larger or smaller|larger or smaller units|value get larger or smaller|numerical value get/.test(q)&&dir)return dir;
    if(/what two landmark numbers multiply to make 6/.test(q)&&isFactorPair(v,2,3))return '2 and 3';
    if(/what is 7x\s*-\s*3x/.test(q)){
      var s=text(v).replace(/\s+/g,'');if(/^(4\*?x|x\*?4)$/.test(s))return '4x';
    }
    if(/what power of 10 equals x/.test(q)){
      var s2=text(v).replace(/\s+/g,'').replace(/\*\*/g,'^');
      if(/^10\^?\(?-4\)?$/.test(s2))return '10^-4';
      if(/^1\/10000$/.test(s2))return '10^-4';
      var numeric=strictNumber(v);if(numeric!==null&&Math.abs(numeric-0.0001)<1e-12)return '10^-4';
    }
    return String(v==null?'':v).trim();
  }

  function normalizeGuidedAnswer(v,question){
    var q=text(question);
    if(/do the bases match/.test(q)){
      var yes=affirmative(v);return yes===true?'yes':yes===false?'no':'__invalid__';
    }
    return normalizeShortAnswer(v,question);
  }

  var UNIT_ALIASES={
    ml:['ml','milliliter','milliliters'],
    l:['l','liter','liters','litre','litres'],
    mg:['mg','milligram','milligrams'],
    mcg:['mcg','ug','µg','μg','microgram','micrograms'],
    g:['g','gram','grams'],
    qt:['qt','qts','quart','quarts'],
    'mmol/min':['mmol/min','mmolpermin','mmol/minute','millimole/min','millimoles/min','millimole/minute','millimoles/minute','millimolesperminute']
  };
  function canonicalUnit(v){
    var s=text(v).replace(/\s+/g,'').replace(/per/g,'per');
    var keys=Object.keys(UNIT_ALIASES);
    for(var i=0;i<keys.length;i++)if(UNIT_ALIASES[keys[i]].indexOf(s)>=0)return keys[i];
    return null;
  }
  function targetUnit(question){
    var q=String(question==null?'':question).replace(/\s+/g,' ').trim();
    var m=q.match(/\bto\s+(mL|L|mg|mcg|g|qt|mmol\/min)\b/i);
    if(m)return canonicalUnit(m[1]);
    if(/how many\s+g\?/i.test(q))return'g';
    return null;
  }
  function normalizeUnitAnswer(question,v){
    var target=targetUnit(question);if(!target)return String(v==null?'':v).trim();
    var bare=canonicalNumber(v);if(bare!==null)return bare;
    var raw=String(v==null?'':v).trim().replace(/−/g,'-').replace(/,/g,'');
    var m=raw.match(/^([+-]?(?:(?:\d+(?:\.\d*)?)|(?:\.\d+))(?:[eE][+-]?\d+)?)\s*(.+)$/);
    if(!m)return raw;
    var unit=canonicalUnit(m[2]);
    return unit===target?String(Number(m[1])):raw;
  }

  function chemistryKind(question){
    var q=text(question);
    if(/how many lone pairs|lone pairs remain/.test(q))return'lone_pairs';
    if(/how many .*single bonds|single bonds .*needed|bonds are needed/.test(q))return'bonds';
    if(/how many total valence electrons|how many electrons are left|how many electrons are represented|total valence electrons does/.test(q))return'electrons';
    return null;
  }
  function normalizeChemistryNumber(v,question){
    var bare=canonicalNumber(v);if(bare!==null)return bare;
    var raw=text(v),m=raw.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*(electrons?|e-|bonds?|lone pairs?|pairs?)$/);
    if(!m)return String(v==null?'':v).trim();
    var kind=chemistryKind(question),suffix=m[2];
    var ok=(kind==='electrons'&&/^(electron|electrons|e-)$/.test(suffix))||(kind==='bonds'&&/^(bond|bonds)$/.test(suffix))||(kind==='lone_pairs'&&/^(lone pair|lone pairs|pair|pairs)$/.test(suffix));
    return ok?String(Number(m[1])):String(v==null?'':v).trim();
  }

  function normalizeChemistryMicro(v,question){
    var q=text(question),s=text(v).replace(/[.!?]+$/,'');
    if(/in h₂o, which atom must connect to both/.test(q)||/in h2o, which atom must connect to both/.test(q))return /^(oxygen|o)$/.test(s)?(s==='o'?'o':'oxygen'):'zzz';
    if(/what is the first thing you count before drawing bonds/.test(q)){
      if(/^(electrons|total electrons|valence electrons|total valence electrons|count valence electrons|count the valence electrons|count total valence electrons|electron count|valence electron count)$/.test(s))return'valence electrons';
      return'zzz';
    }
    return normalizeChemistryNumber(v,question);
  }

  function normalizeLiveMathAnswer(question,v){return normalizeUnitAnswer(question,v);}

  function install(doc){
    if(!doc||!doc.addEventListener||doc.documentElement&&doc.documentElement.dataset.semanticAnswerEquivalenceV25)return;
    if(doc.documentElement)doc.documentElement.dataset.semanticAnswerEquivalenceV25='1';
    doc.addEventListener('click',function(e){
      var target=e.target&&e.target.closest?e.target:null;if(!target)return;
      var check=target.closest('#check');
      if(check){var view=check.closest('#view')||doc.getElementById('view'),q=view&&view.querySelector('.question'),input=view&&view.querySelector('#answer');if(q&&input)input.value=normalizeLiveMathAnswer(q.textContent,input.value);}
      var v9=target.closest('[data-v9-check]');
      if(v9){var h9=v9.closest('.warning'),i9=h9&&h9.querySelector('[data-v9-input]'),p9=h9&&h9.querySelector('p');if(i9)i9.value=normalizeShortAnswer(i9.value,p9?p9.textContent:'');}
      var v13=target.closest('[data-v13-check]');
      if(v13){var h13=v13.closest('.warning'),i13=h13&&h13.querySelector('[data-v13-answer]'),p13=h13&&h13.querySelector('p');if(i13)i13.value=normalizeGuidedAnswer(i13.value,p13?p13.textContent:'');}
      var pc=target.closest('#practiceCheck');
      if(pc){var pi=doc.getElementById('practiceInput'),pq=doc.getElementById('practiceQuestion');if(pi)pi.value=normalizeChemistryNumber(pi.value,pq?pq.textContent:'');}
      var tm=target.closest('#talkMicroCheck');
      if(tm){var ti=doc.getElementById('talkMicroInput'),box=tm.closest('.reteach'),ps=box?box.querySelectorAll('p'):[],tq='';for(var j=0;j<ps.length;j++){if(ps[j].contains(ti)||ps[j].nextElementSibling===ti)continue;if(/\?/.test(ps[j].textContent||'')){tq=ps[j].textContent;break;}}if(!tq){var prev=ti&&ti.previousElementSibling;tq=prev?prev.textContent:'';}if(ti)ti.value=normalizeChemistryMicro(ti.value,tq);}
    },true);
  }

  return{strictNumber:strictNumber,canonicalNumber:canonicalNumber,operation:operation,direction:direction,affirmative:affirmative,isFactorPair:isFactorPair,normalizeShortAnswer:normalizeShortAnswer,normalizeGuidedAnswer:normalizeGuidedAnswer,canonicalUnit:canonicalUnit,targetUnit:targetUnit,normalizeUnitAnswer:normalizeUnitAnswer,normalizeChemistryNumber:normalizeChemistryNumber,normalizeChemistryMicro:normalizeChemistryMicro,normalizeLiveMathAnswer:normalizeLiveMathAnswer,install:install};
});
