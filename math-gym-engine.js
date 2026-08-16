/* ============================================================
   MATH GYM ENGINE
   Implements Math_Gym_Specification.md infrastructure.

   Governing rule: generate the answer first, then build the problem
   around that answer. Chemistry is intentionally absent from this
   file because chemistry must use a curated verified bank.
   ============================================================ */

(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  else root.MathGymEngine=api;
})(typeof self!=='undefined'?self:this,function(){
  'use strict';

  var MODES={
    practice:{id:'practice',hints:true,timed:false,changesStatus:false},
    speed:{id:'speed',hints:false,timed:true,changesStatus:false},
    challenge:{id:'challenge',hints:true,timed:false,changesStatus:false},
    mastery:{id:'mastery',hints:false,timed:false,changesStatus:true,fresh:true,unaided:true}
  };

  function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){var t=b;b=a%b;a=t;}return a||1;}
  function reduce(n,d){if(d===0)throw new Error('zero denominator');if(d<0){n=-n;d=-d;}var g=gcd(n,d);return{n:n/g,d:d/g};}
  function fracText(f){return f.d===1?String(f.n):f.n+'/'+f.d;}
  function pick(arr,rng){rng=rng||Math.random;return arr[Math.floor(rng()*arr.length)%arr.length];}
  function randInt(min,max,rng){rng=rng||Math.random;return min+Math.floor(rng()*(max-min+1));}
  function near(a,b,tol){return Math.abs(Number(a)-Number(b))<=tol;}

  /* ---------------- Fractions / percentages ---------------- */
  function generateFraction(rng){
    // Answer first: choose the reduced target, then choose an operand and derive the other.
    var d=pick([4,5,6,8,10,12],rng);
    var targetN=randInt(1,d-1,rng);
    var target=reduce(targetN,d);
    var operation=pick(['add','subtract'],rng);
    var bN=randInt(1,Math.max(1,d-targetN),rng);
    var aN=operation==='add'?targetN-bN:targetN+bN;
    if(operation==='add'&&aN<=0){bN=1;aN=targetN-1;if(aN<=0){targetN=2;target=reduce(targetN,d);aN=1;bN=1;}}
    var a=reduce(aN,d),b=reduce(bN,d);
    return{
      id:'fraction-'+Math.random().toString(36).slice(2),area:'fractions_percentages',type:'fraction',
      prompt:fracText(a)+(operation==='add'?' + ':' - ')+fracText(b),
      answer:fracText(target),answerFraction:target,operation:operation,
      check:function(v){var s=String(v).trim();if(s.indexOf('/')>=0){var p=s.split('/');var f=reduce(Number(p[0]),Number(p[1]));return f.n===target.n&&f.d===target.d;}return near(Number(v),target.n/target.d,1e-10);}
    };
  }

  function generatePercent(rng){
    // Answer first: select the percent, then derive a divisible whole and part.
    var pct=pick([5,8,10,20,25,40,50,75],rng);
    var baseUnit=pct===8?25:20;
    var whole=baseUnit*randInt(5,20,rng);
    var part=whole*pct/100;
    return{
      id:'percent-'+Math.random().toString(36).slice(2),area:'fractions_percentages',type:'percent',
      prompt:part+' is what percent of '+whole+'?',answer:pct,unit:'%',
      check:function(v){return near(parseFloat(String(v).replace('%','')),pct,1e-10);}
    };
  }

  function generateFractionOfWhole(rng){
    var d=pick([2,4,5,8,10],rng),n=randInt(1,d-1,rng);var f=reduce(n,d);
    var answer=randInt(4,40,rng);while((answer*d)%f.n!==0)answer++;
    var whole=answer*d/f.n;
    return{
      id:'ofwhole-'+Math.random().toString(36).slice(2),area:'fractions_percentages',type:'fraction_of_whole',
      prompt:fracText(f)+' of '+whole,answer:answer,
      check:function(v){return near(v,answer,1e-10);}
    };
  }

  /* ---------------- Algebra ---------------- */
  function generateLinearEquation(rng){
    // Answer first: choose x, then coefficients, and compute d so the equation is guaranteed clean.
    var x=randInt(2,12,rng),a=randInt(3,9,rng),c=randInt(1,a-1,rng),b=randInt(-8,8,rng);
    var d=(a-c)*x+b;
    function side(coef,constant){return coef+'x'+(constant===0?'':constant>0?' + '+constant:' - '+Math.abs(constant));}
    return{
      id:'linear-'+Math.random().toString(36).slice(2),area:'algebra',type:'two_sided_linear',
      prompt:side(a,b)+' = '+side(c,d),answer:x,params:{a:a,b:b,c:c,d:d},
      check:function(v){return near(v,x,1e-10);}
    };
  }

  var FORMULAS=[
    {id:'V_lwh_h',prompt:'Solve V = lwh for h',answer:'V/(lw)'},
    {id:'d_rt_t',prompt:'Solve d = rt for t',answer:'d/r'},
    {id:'P_2l2w_w',prompt:'Solve P = 2l + 2w for w',answer:'(P-2l)/2'}
  ];
  function normalizeExpr(s){return String(s).replace(/\s+/g,'').replace(/\*/g,'').toLowerCase();}
  function generateFormulaRearrangement(rng){
    var f=pick(FORMULAS,rng);
    return{
      id:'formula-'+f.id+'-'+Math.random().toString(36).slice(2),area:'algebra',type:'formula_rearrangement',
      prompt:f.prompt,answer:f.answer,
      check:function(v){var got=normalizeExpr(v),ans=normalizeExpr(f.answer);var accepted=[ans];
        if(f.id==='V_lwh_h')accepted.push('v/lw','v/(l*w)');
        if(f.id==='P_2l2w_w')accepted.push('p/2-l','(p-2*l)/2');
        return accepted.indexOf(got)>=0;}
    };
  }

  function generateProportion(rng){
    // Choose x first and construct a/x=c/d exactly.
    var x=randInt(2,15,rng),a=randInt(2,10,rng),c=randInt(2,12,rng);var d=c*x/a;
    while(Math.abs(d-Math.round(d))>1e-10){a=randInt(2,10,rng);c=randInt(2,12,rng);d=c*x/a;}
    d=Math.round(d);
    return{
      id:'prop-'+Math.random().toString(36).slice(2),area:'algebra',type:'proportion',
      prompt:a+'/x = '+c+'/'+d,answer:x,
      check:function(v){return near(v,x,1e-10);}
    };
  }

  /* ---------------- Exponents ---------------- */
  function generateNegativeExponent(rng){
    var base=randInt(2,6,rng),exp=-randInt(2,4,rng);var den=Math.pow(base,-exp);var ans=reduce(1,den);
    return{
      id:'negexp-'+Math.random().toString(36).slice(2),area:'exponents',type:'negative_exponent',
      prompt:base+'^('+exp+')',answer:fracText(ans),answerFraction:ans,
      check:function(v){var s=String(v).trim();if(s.indexOf('/')>=0){var p=s.split('/');var f=reduce(Number(p[0]),Number(p[1]));return f.n===ans.n&&f.d===ans.d;}return near(v,1/den,1e-10);}
    };
  }

  function generateExponentRule(rng){
    var base=pick(['a','b','c','d','e'],rng),kind=pick(['product','quotient','mixed'],rng);
    var p=randInt(2,7,rng),q=randInt(2,6,rng),r=randInt(1,Math.min(5,p+q-1),rng),ansExp,prompt;
    if(kind==='product'){ansExp=p+q;prompt:'('+base+'^'+p+')('+base+'^'+q+')';}
    else if(kind==='quotient'){if(q>=p)q=p-1;ansExp=p-q;prompt:base+'^'+p+' / '+base+'^'+q;}
    else{ansExp=p+q-r;prompt:'('+base+'^'+p+')('+base+'^'+q+') / '+base+'^'+r;}
    var ans=base+'^'+ansExp;
    return{id:'exprule-'+Math.random().toString(36).slice(2),area:'exponents',type:'same_base_rules',prompt:prompt,answer:ans,check:function(v){return normalizeExpr(v)===normalizeExpr(ans);}};
  }

  /* ---------------- Scientific notation ---------------- */
  function normalizeSci(coef,exp){while(Math.abs(coef)>=10){coef/=10;exp++;}while(Math.abs(coef)>0&&Math.abs(coef)<1){coef*=10;exp--;}return{coefficient:coef,exponent:exp};}
  function generateScientificNotation(rng){
    var kind=pick(['convert','multiply','divide'],rng);
    if(kind==='convert'){
      var coef=randInt(1,9,rng)+pick([0,.1,.2,.5],rng),exp=randInt(-6,6,rng);var val=coef*Math.pow(10,exp);
      return{id:'sci-conv-'+Math.random().toString(36).slice(2),area:'scientific_notation',type:'convert',prompt:'Write '+val+' in scientific notation',answer:{coefficient:coef,exponent:exp},check:function(v){return checkSci(v,coef,exp);}};
    }
    // Answer first: choose normalized target then build factors around it.
    var targetCoef=pick([2,4,6,8],rng),targetExp=randInt(-5,7,rng),aCoef=2,aExp=randInt(-3,3,rng),bCoef,bExp,prompt;
    if(kind==='multiply'){bCoef=targetCoef/aCoef;bExp=targetExp-aExp;prompt:'('+aCoef+'×10^'+aExp+')('+bCoef+'×10^'+bExp+')';}
    else{bCoef=aCoef/targetCoef;bExp=aExp-targetExp;prompt:'('+aCoef+'×10^'+aExp+') ÷ ('+bCoef+'×10^'+bExp+')';}
    var norm=normalizeSci(targetCoef,targetExp);
    return{id:'sci-'+kind+'-'+Math.random().toString(36).slice(2),area:'scientific_notation',type:kind,prompt:prompt,answer:norm,check:function(v){return checkSci(v,norm.coefficient,norm.exponent);}};
  }
  function checkSci(v,coef,exp){
    if(v&&typeof v==='object')return near(v.coefficient,coef,1e-10)&&Number(v.exponent)===exp;
    var s=String(v).replace(/\s+/g,'').replace(/×/g,'x').toLowerCase();
    var m=s.match(/^([+-]?[0-9]*\.?[0-9]+)x?10\^?([+-]?\d+)$/);if(!m)return false;
    return near(Number(m[1]),coef,1e-10)&&Number(m[2])===exp;
  }

  /* ---------------- Logs ---------------- */
  function generateExactLog(rng){
    var exponent=randInt(-7,6,rng);var x=Math.pow(10,exponent);
    var type=pick(['log','inverse'],rng);
    if(type==='log')return{id:'logexact-'+Math.random().toString(36).slice(2),area:'logs_estimation',type:'exact_log',prompt:'log('+x+')',answer:exponent,tolerance:0,check:function(v){return near(v,exponent,1e-10);}};
    return{id:'loginverse-'+Math.random().toString(36).slice(2),area:'logs_estimation',type:'inverse_log',prompt:'If log(x) = '+exponent+', find x',answer:x,tolerance:0,check:function(v){return near(v,x,Math.abs(x)*1e-10+1e-12);}};
  }
  function generateLogEstimate(rng){
    var front=pick([2,3,4,5,6,7,8],rng),n=randInt(3,10,rng);var x=front*Math.pow(10,-n);var ans=-Math.log10(x);
    return{id:'logest-'+Math.random().toString(36).slice(2),area:'logs_estimation',type:'estimate_negative_log',prompt:'Estimate −log('+front+'×10^−'+n+')',answer:ans,tolerance:.15,check:function(v){return near(v,ans,.15);}};
  }

  /* ---------------- Unit conversions ---------------- */
  var CONVERSIONS=[
    {from:'L',to:'mL',factor:1000},{from:'mL',to:'L',factor:.001},
    {from:'mol',to:'mmol',factor:1000},{from:'mmol',to:'mol',factor:.001},
    {from:'min',to:'s',factor:60},{from:'s',to:'min',factor:1/60},
    {from:'h',to:'min',factor:60},{from:'min',to:'h',factor:1/60}
  ];
  function generateUnitConversion(rng){
    var c=pick(CONVERSIONS,rng),answer=pick([3.3,6.2,8,12,15,33,62,90,120,228],rng);var source=answer/c.factor;
    return{id:'unit-'+Math.random().toString(36).slice(2),area:'unit_conversions',type:'single_conversion',prompt:source+' '+c.from+' to '+c.to,answer:answer,unit:c.to,conversion:c,check:function(v,unit){var raw=typeof v==='string'?parseFloat(v):Number(v);var u=unit||String(v).replace(/[0-9.\-\s]/g,'');return near(raw,answer,1e-9)&&(!u||u===c.to);}};
  }
  function generateStackedRate(rng){
    // Mirrors the curriculum's mol/s -> mmol/min pattern, answer first.
    var answer=pick([90,126,180,228,270,360,720],rng);var source=answer/(1000*60);
    return{id:'rate-'+Math.random().toString(36).slice(2),area:'unit_conversions',type:'stacked_rate',prompt:source+' mol/s to mmol/min',answer:answer,unit:'mmol/min',check:function(v,unit){var raw=typeof v==='string'?parseFloat(v):Number(v);var u=unit||String(v).replace(/[0-9.\-\s]/g,'');return near(raw,answer,1e-8)&&u==='mmol/min';}};
  }

  /* ---------------- Tracking / mode rules ---------------- */
  function createAttemptRecord(item,mode,opts){opts=opts||{};var m=typeof mode==='string'?MODES[mode]:mode;return{
    itemId:item.id,area:item.area,type:item.type,mode:m.id,startedAt:opts.startedAt||Date.now(),endedAt:null,
    correct:false,attemptsBeforeCorrect:0,hintTier:0,timeMs:null,calculatorUsed:false,countsTowardStatus:!!m.changesStatus
  };}
  function recordSubmission(rec,correct,opts){opts=opts||{};rec.attemptsBeforeCorrect++;rec.correct=!!correct;if(opts.hintTier!=null)rec.hintTier=Math.max(rec.hintTier,opts.hintTier);if(opts.calculatorUsed)rec.calculatorUsed=true;if(correct){rec.endedAt=opts.timestamp||Date.now();rec.timeMs=rec.endedAt-rec.startedAt;}return rec;}
  function canUseHint(mode){var m=typeof mode==='string'?MODES[mode]:mode;return !!m.hints;}
  function masteryEligible(mode,item,history){var m=typeof mode==='string'?MODES[mode]:mode;if(!m||!m.changesStatus||!m.unaided)return false;history=history||[];return !history.some(function(a){return a.itemId===item.id;});}

  var GENERATORS={
    fractions_percentages:[generateFraction,generatePercent,generateFractionOfWhole],
    algebra:[generateLinearEquation,generateFormulaRearrangement,generateProportion],
    exponents:[generateNegativeExponent,generateExponentRule],
    scientific_notation:[generateScientificNotation],
    logs_estimation:[generateExactLog,generateLogEstimate],
    unit_conversions:[generateUnitConversion,generateStackedRate]
  };
  function generate(area,rng){var list=GENERATORS[area];if(!list)throw new Error('Unknown Math Gym area: '+area);return pick(list,rng)(rng);}

  return{
    MODES:MODES,CONVERSIONS:CONVERSIONS,FORMULAS:FORMULAS,
    gcd:gcd,reduce:reduce,normalizeSci:normalizeSci,checkSci:checkSci,
    generate:generate,generateFraction:generateFraction,generatePercent:generatePercent,generateFractionOfWhole:generateFractionOfWhole,
    generateLinearEquation:generateLinearEquation,generateFormulaRearrangement:generateFormulaRearrangement,generateProportion:generateProportion,
    generateNegativeExponent:generateNegativeExponent,generateExponentRule:generateExponentRule,
    generateScientificNotation:generateScientificNotation,generateExactLog:generateExactLog,generateLogEstimate:generateLogEstimate,
    generateUnitConversion:generateUnitConversion,generateStackedRate:generateStackedRate,
    createAttemptRecord:createAttemptRecord,recordSubmission:recordSubmission,canUseHint:canUseHint,masteryEligible:masteryEligible
  };
});
