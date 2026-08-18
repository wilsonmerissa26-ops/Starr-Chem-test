(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.MathStrategyAdapters=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';

function finiteNumber(v, label) {
  var n = Number(v);
  if (!Number.isFinite(n)) throw new Error(label + ' must be a finite number');
  return n;
}

function normalize(problem) {
  if (!problem || typeof problem !== 'object') throw new Error('problem object required');
  var out = {
    area: problem.area || 'fractions_percentages',
    family: problem.family,
    source: problem.source || 'unknown',
    sourceId: problem.sourceId || null
  };
  if (problem.family === 'percent_of_whole') {
    out.percent = finiteNumber(problem.percent, 'percent');
    out.whole = finiteNumber(problem.whole, 'whole');
    if (out.whole < 0 || out.percent < 0) throw new Error('negative percent/whole is out of scope');
  } else if (problem.family === 'what_percent_of') {
    out.part = finiteNumber(problem.part, 'part');
    out.whole = finiteNumber(problem.whole, 'whole');
    if (out.whole <= 0 || out.part < 0) throw new Error('invalid part/whole');
  } else if (problem.family === 'fraction_of_whole') {
    out.numerator = finiteNumber(problem.numerator, 'numerator');
    out.denominator = finiteNumber(problem.denominator, 'denominator');
    out.whole = finiteNumber(problem.whole, 'whole');
    if (!Number.isInteger(out.numerator) || !Number.isInteger(out.denominator) || out.denominator <= 0 || out.numerator < 0 || out.whole < 0) {
      throw new Error('invalid fraction_of_whole input');
    }
  } else {
    throw new Error('unsupported problem family: ' + problem.family);
  }
  return out;
}

function fromClassroomPrompt(prompt, metadata) {
  metadata = metadata || {};
  var s = String(prompt || '').trim();
  var m;
  m = s.match(/^([0-9]+(?:\.[0-9]+)?)%\s+of\s+([0-9]+(?:\.[0-9]+)?)\s*=?\s*$/i);
  if (m) return normalize({area:'fractions_percentages',family:'percent_of_whole',percent:m[1],whole:m[2],source:'classroom',sourceId:metadata.sourceId});
  m = s.match(/^([0-9]+)\s*\/\s*([0-9]+)\s+of\s+([0-9]+(?:\.[0-9]+)?)\s*=?\s*$/i);
  if (m) return normalize({area:'fractions_percentages',family:'fraction_of_whole',numerator:m[1],denominator:m[2],whole:m[3],source:'classroom',sourceId:metadata.sourceId});
  m = s.match(/^([0-9]+(?:\.[0-9]+)?)\s+is\s+what\s+percent\s+of\s+([0-9]+(?:\.[0-9]+)?)\s*\??\s*$/i);
  if (m) return normalize({area:'fractions_percentages',family:'what_percent_of',part:m[1],whole:m[2],source:'classroom',sourceId:metadata.sourceId});
  throw new Error('unsupported classroom prompt');
}

function fromMathGymItem(item) {
  if (!item || typeof item !== 'object') throw new Error('Math Gym item required');
  if (!item.strategyInput) throw new Error('Math Gym item must expose structured strategyInput');
  var input = Object.assign({}, item.strategyInput, {
    area: item.strategyInput.area || item.area || 'fractions_percentages',
    source: 'math_gym',
    sourceId: item.id || null
  });
  return normalize(input);
}

return { normalize: normalize, fromClassroomPrompt: fromClassroomPrompt, fromMathGymItem: fromMathGymItem };
});
