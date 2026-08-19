/* ============================================================
   MATH GYM ENGINE V2 — SEMANTIC CORRECTION LAYER

   The original answer-first generator can reduce a displayed fraction while
   retaining the unreduced denominator when constructing the whole. That can
   make the visible prompt disagree with the hidden answer, e.g. displaying
   3/4 of 80 while expecting 30 instead of 60.

   V2 keeps every existing Math Gym generator and mode rule, but recalculates
   fraction-of-a-whole answers from the exact learner-facing prompt before an
   item reaches the UI.
   ============================================================ */
(function(root,factory){
  var base=typeof module==='object'&&module.exports?require('./math-gym-engine.js'):root.MathGymEngine;
  var api=factory(base);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.MathGymEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(base){
  'use strict';
  if(!base)throw new Error('MathGymEngine base is required');

  function near(a,b,tol){return Math.abs(Number(a)-Number(b))<=(tol==null?1e-10:tol);}

  function repairFractionOfWhole(item){
    if(!item||item.type!=='fraction_of_whole')return item;
    var m=String(item.prompt||'').trim().match(/^([+-]?\d+)\/([+-]?\d+)\s+of\s+([+-]?(?:\d+(?:\.\d*)?|\.\d+))$/i);
    if(!m)return item;
    var numerator=Number(m[1]),denominator=Number(m[2]),whole=Number(m[3]);
    if(!Number.isFinite(numerator)||!Number.isFinite(denominator)||denominator===0||!Number.isFinite(whole))return item;
    var semanticAnswer=numerator/denominator*whole;
    item.answer=semanticAnswer;
    item.check=function(v){
      var raw=String(v==null?'':v).trim();
      if(!/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw))return false;
      return near(Number(raw),semanticAnswer,1e-10);
    };
    item.semanticSource='displayed_prompt';
    return item;
  }

  function generateFractionOfWhole(rng){return repairFractionOfWhole(base.generateFractionOfWhole(rng));}
  function generate(area,rng){return repairFractionOfWhole(base.generate(area,rng));}

  return Object.assign({},base,{
    generate:generate,
    generateFractionOfWhole:generateFractionOfWhole,
    repairFractionOfWhole:repairFractionOfWhole
  });
});
