/* ============================================================
   MATH GYM ENGINE V2 — SEMANTIC CORRECTION LAYER

   The original answer-first fraction-of-a-whole generator can reduce a
   displayed fraction while retaining the unreduced denominator when it builds
   the whole. That can make the visible prompt disagree with the hidden answer,
   e.g. displaying 3/4 of 80 while expecting 30 instead of 60.

   V2 keeps the accepted Math Gym generators and mode rules, but enforces two
   learner-facing answer contracts before items reach the UI:
   1. Fraction-of-a-whole answers are recalculated from the displayed prompt.
   2. Numeric algebra solutions accept conservative equivalent forms such as
      5, x=5, x equals 5, x is 5, and 5=x.
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

  function strictNumber(v){
    var raw=String(v==null?'':v).trim().replace(/,/g,'').replace(/−/g,'-');
    if(!/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw))return null;
    var n=Number(raw);return Number.isFinite(n)?n:null;
  }

  function algebraNumber(v){
    var direct=strictNumber(v);if(direct!==null)return direct;
    var raw=String(v==null?'':v).trim().replace(/,/g,'').replace(/−/g,'-');
    var num='([+-]?(?:(?:\\d+(?:\\.\\d*)?)|(?:\\.\\d+)))';
    var left=raw.match(new RegExp('^x\\s*(?:=|equals|is)\\s*'+num+'$','i'));
    if(left)return Number(left[1]);
    var right=raw.match(new RegExp('^'+num+'\\s*(?:=|equals)\\s*x$','i'));
    if(right)return Number(right[1]);
    return null;
  }

  function repairFractionOfWhole(item){
    if(!item||item.type!=='fraction_of_whole')return item;
    var m=String(item.prompt||'').trim().match(/^([+-]?\d+)\/([+-]?\d+)\s+of\s+([+-]?(?:\d+(?:\.\d*)?|\.\d+))$/i);
    if(!m)return item;
    var numerator=Number(m[1]),denominator=Number(m[2]),whole=Number(m[3]);
    if(!Number.isFinite(numerator)||!Number.isFinite(denominator)||denominator===0||!Number.isFinite(whole))return item;
    var semanticAnswer=numerator/denominator*whole;
    item.answer=semanticAnswer;
    item.check=function(v){var n=strictNumber(v);return n!==null&&near(n,semanticAnswer,1e-10);};
    item.semanticSource='displayed_prompt';
    return item;
  }

  function repairAlgebraNumeric(item){
    if(!item||(item.type!=='two_sided_linear'&&item.type!=='proportion'))return item;
    var semanticAnswer=Number(item.answer);if(!Number.isFinite(semanticAnswer))return item;
    item.check=function(v){var n=algebraNumber(v);return n!==null&&near(n,semanticAnswer,1e-10);};
    item.answerEquivalence='numeric_x_value';
    return item;
  }

  function repair(item){return repairAlgebraNumeric(repairFractionOfWhole(item));}
  function generateFractionOfWhole(rng){return repairFractionOfWhole(base.generateFractionOfWhole(rng));}
  function generateLinearEquation(rng){return repairAlgebraNumeric(base.generateLinearEquation(rng));}
  function generateProportion(rng){return repairAlgebraNumeric(base.generateProportion(rng));}
  function generate(area,rng){return repair(base.generate(area,rng));}

  return Object.assign({},base,{
    generate:generate,
    generateFractionOfWhole:generateFractionOfWhole,
    generateLinearEquation:generateLinearEquation,
    generateProportion:generateProportion,
    repairFractionOfWhole:repairFractionOfWhole,
    repairAlgebraNumeric:repairAlgebraNumeric,
    algebraNumber:algebraNumber,
    strictNumber:strictNumber
  });
});
