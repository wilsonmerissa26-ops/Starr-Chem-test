(function(root,factory){'use strict';
var api=factory();
if(typeof module==='object'&&module.exports)module.exports=api;
else{root.GuidedResponsiveFeedbackV27=api;api.install(root.document,root);}
})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
var META={
 '0.062 L to mL =':[
  {kind:'direction',expected:'smaller',from:'L',to:'mL'},
  {kind:'factor',expected:1000,from:'L',to:'mL'},
  {kind:'amount',expected:62,unit:'mL',source:.062,direction:'grow'}
 ],
 '750 mL to L =':[
  {kind:'direction',expected:'larger',from:'mL',to:'L'},
  {kind:'operation',expected:'divide',from:'mL',to:'L',direction:'shrink'},
  {kind:'amount',expected:.75,unit:'L',source:750,direction:'shrink'}
 ],
 '2.4 g to mg =':[
  {kind:'count',expected:1000,unit:'mg',from:'g',to:'mg'},
  {kind:'amount',expected:2400,unit:'mg',source:2.4,direction:'grow'}
 ],
 '3500 mcg to mg =':[
  {kind:'count',expected:1000,unit:'mcg',from:'mg',to:'mcg'},
  {kind:'amount',expected:3.5,unit:'mg',source:3500,direction:'shrink'}
 ],
 '2 gal to qt =':[
  {kind:'count',expected:4,unit:'qt',from:'gal',to:'qt'},
  {kind:'amount',expected:8,unit:'qt',source:2,direction:'grow'}
 ]
};
function tidy(v){return String(v==null?'':v).replace(/\s+/g,' ').trim();}
function lower(v){return tidy(v).toLowerCase().replace(/−/g,'-');}
function canonicalUnit(v){
 var s=lower(v).replace(/\./g,'');
 var map={
  'l':'L','liter':'L','liters':'L','litre':'L','litres':'L',
  'ml':'mL','milliliter':'mL','milliliters':'mL','millilitre':'mL','millilitres':'mL',
  'g':'g','gram':'g','grams':'g','mg':'mg','milligram':'mg','milligrams':'mg',
  'mcg':'mcg','ug':'mcg','µg':'mcg','μg':'mcg','microgram':'mcg','micrograms':'mcg',
  'ng':'ng','nanogram':'ng','nanograms':'ng','kg':'kg','kilogram':'kg','kilograms':'kg',
  'gal':'gal','gallon':'gal','gallons':'gal','qt':'qt','qts':'qt','quart':'qt','quarts':'qt'
 };
 return map[s]||null;
}
function unitFamily(u){if(['L','mL'].indexOf(u)>=0)return'volume';if(['g','mg','mcg','ng','kg'].indexOf(u)>=0)return'mass';if(['gal','qt'].indexOf(u)>=0)return'capacity';return null;}
function parseNumberUnit(v){
 var raw=lower(v).replace(/,/g,'');
 var m=raw.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))(?:\s*([a-zµμ]+))?$/i);
 if(!m)return{number:null,unit:canonicalUnit(raw),raw:raw};
 return{number:Number(m[1]),unit:m[2]?canonicalUnit(m[2]):null,raw:raw};
}
function direction(v){var s=lower(v),big=/\b(larger|bigger|greater|increase|increases|grow|grows)\b/.test(s),small=/\b(smaller|less|decrease|decreases|shrink|shrinks)\b/.test(s);if(big===small)return null;return big?'larger':'smaller';}
function operation(v){var s=lower(v),div=/\bdivide(?:d|s|ing)?\b|\bdivision\b|÷|\//.test(s),mul=/\bmultiply(?:ing|ied|ies)?\b|\bmultiplication\b|\btimes\b|×|\*/.test(s);if(div===mul)return null;return div?'divide':'multiply';}
function near(a,b){return Number.isFinite(a)&&Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(b));}
function canonicalFor(meta,v){
 if(!meta)return null;
 if(meta.kind==='direction'){var d=direction(v);return d===meta.expected?d:null;}
 if(meta.kind==='operation'){var o=operation(v);return o===meta.expected?o:null;}
 var p=parseNumberUnit(v);if(p.number===null||!near(p.number,meta.expected))return null;
 if(meta.kind==='factor')return p.unit===null?String(meta.expected):null;
 if(meta.kind==='count'||meta.kind==='amount')return p.unit===null||p.unit===meta.unit?String(meta.expected):null;
 return null;
}
function quoted(v){var s=tidy(v);return s.length>40?s.slice(0,37)+'...':s;}
function unitMismatch(meta,p){
 if(!p.unit)return null;
 var expected=meta.unit||meta.to;
 if(p.unit===expected)return null;
 var fam=unitFamily(p.unit),need=unitFamily(expected);
 if(fam&&need&&fam!==need)return 'You entered '+p.unit+', which is a '+fam+' unit, but this step is working with '+meta.from+' and '+meta.to+'. Stay with the units in this problem.';
 return 'You entered '+p.unit+', but this step is asking about '+expected+'. Keep the unit tied to the quantity the question names.';
}
function feedbackFor(question,index,value,attempt,lastValue){
 var q=tidy(question),meta=META[q]&&META[q][index];if(!meta)return null;
 var p=parseNumberUnit(value),same=attempt>1&&lower(value)===lower(lastValue),prefix=same?'That is the same response again. ':'I read “'+quoted(value)+'.” ';
 if(meta.kind==='direction'){
  if(p.unit)return prefix+'That is a unit name, but this step asks for a size comparison. Compare '+meta.from+' with '+meta.to+' and answer with larger or smaller.';
  var d=direction(value);if(d&&d!==meta.expected)return prefix+'You chose '+d+'. Picture one '+meta.from+' being made from the other unit. Decide which unit represents the smaller-sized piece, then try the comparison again.';
  return prefix+'This step needs a comparison, not a conversion result. Decide whether '+meta.to+' is larger or smaller than '+meta.from+'.';
 }
 if(meta.kind==='operation'){
  if(p.unit)return prefix+'That is a unit, but this step asks for an operation. First predict whether the numerical value should grow or shrink, then choose multiply or divide.';
  var o=operation(value);if(o&&o!==meta.expected)return prefix+'You chose '+o+'. Converting from '+meta.from+' to '+meta.to+' should make the numerical value '+(meta.direction==='shrink'?'smaller':'larger')+'. Choose the operation that produces that direction.';
  return prefix+'This step asks for the operation only. Use the unit-size change to decide between multiply and divide.';
 }
 var mismatch=unitMismatch(meta,p);if(mismatch)return prefix+mismatch;
 if(meta.kind==='factor'){
  if(p.number!==null)return prefix+'That factor does not fit the '+meta.from+' to '+meta.to+' relationship. Think about how many '+meta.to+' units fit into one '+meta.from+'; do not calculate the whole problem yet.';
  return prefix+'This step asks for a numerical conversion factor. Give the factor only; use “Give me a hint” if you want the relationship shown.';
 }
 if(meta.kind==='count'){
  if(direction(value))return prefix+'You gave a direction, but this step asks for a quantity. Give the number of '+meta.unit+' in one '+meta.from+'.';
  if(p.number!==null){if(attempt>=2)return prefix+'That quantity is still off. Rebuild the one-unit relationship first. If you want the actual anchor relationship, use “Give me a hint”; I will not reveal it automatically.';return prefix+'That quantity does not match the one-unit relationship. Keep '+meta.from+' and '+meta.unit+' fixed and think about how many smaller units make one larger unit.';}
  return prefix+'This step asks for a number of '+meta.unit+', not a description. Give the quantity first.';
 }
 if(meta.kind==='amount'){
  if(p.number===null)return prefix+'This step asks for the numerical result of the calculation. Do the number operation shown in the step, then attach '+meta.unit+' only if you want to include a unit.';
  if(meta.direction==='grow'&&p.number<meta.source)return prefix+'Your result became smaller than the starting number, but this conversion moves to smaller units, so the numerical value should grow. Recheck the direction of your decimal move or multiplication.';
  if(meta.direction==='shrink'&&p.number>meta.source)return prefix+'Your result became larger than the starting number, but this conversion moves to larger units, so the numerical value should shrink. Recheck the direction of your decimal move or division.';
  if(attempt>=2)return prefix+'The size direction now looks possible, but the arithmetic is still off. Rework only the calculation shown in this step, or choose “Give me a hint” for the next clue.';
  return prefix+'The unit direction may be reasonable, but that number does not match the calculation in this step. Rework only this arithmetic before moving on.';
 }
 return prefix+'That does not answer this step yet. Try again without jumping to the final problem answer.';
}
function stepIndex(box){var b=box&&box.querySelector('b');var m=b&&String(b.textContent||'').match(/Step\s+(\d+)\s+of/i);return m?Number(m[1])-1:-1;}
function install(doc,rootObj){
 if(!doc||!doc.addEventListener)return;
 doc.addEventListener('click',function(e){
  var btn=e.target&&e.target.closest?e.target.closest('[data-v13-check]'):null;if(!btn)return;
  var view=doc.getElementById('view'),qEl=view&&view.querySelector('.question'),q=qEl&&tidy(qEl.textContent);if(!q||!META[q])return;
  var box=btn.closest('.warning'),input=box&&box.querySelector('[data-v13-answer]'),out=box&&box.querySelector('[data-v13-feedback]'),idx=stepIndex(box);if(!input||!out||idx<0)return;
  var meta=META[q][idx],canonical=canonicalFor(meta,input.value);
  if(canonical!==null){input.value=canonical;return;}
  e.preventDefault();e.stopImmediatePropagation();
  var attempt=Number(input.dataset.v27WrongAttempts||0)+1,last=input.dataset.v27LastWrong||'';
  input.dataset.v27WrongAttempts=String(attempt);input.dataset.v27LastWrong=lower(input.value);
  out.className='feedback bad';out.textContent='Not yet. '+feedbackFor(q,idx,input.value,attempt,last);
 },true);
}
return{META:META,canonicalUnit:canonicalUnit,unitFamily:unitFamily,parseNumberUnit:parseNumberUnit,direction:direction,operation:operation,canonicalFor:canonicalFor,feedbackFor:feedbackFor,install:install};
});
