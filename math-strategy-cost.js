'use strict';

var WEIGHTS = {
  operationCount: 0.35,
  anchorAcquisition: 1.0,
  divisionDifficulty: 1.0,
  multiplicationDifficulty: 1.0,
  decimalComplexity: 0.65,
  fractionComplexity: 0.65,
  mentalLoad: 0.35,
  benchmarkBonus: -0.55,
  compensationComplexity: 0.45,
  routeOverhead: 1.0
};

// Personalization is deliberately bounded so learner evidence can break close
// calls without making an objectively much harder route look cheap. A fluent
// route can lower cost by at most 0.45; a weak route can raise it by at most
// 0.45. That is intentionally no larger than the engine's current near-tie
// window and can be recalibrated against learner evidence later.
var FLUENCY_MAX_ADJUSTMENT = 0.45;

function decimals(n) {
  n = Number(n);
  if (!Number.isFinite(n) || Number.isInteger(n)) return 0;
  var rounded = Math.round(Math.abs(n) * 1e10) / 1e10;
  if (Number.isInteger(rounded)) return 0;
  var s = rounded.toFixed(10).replace(/0+$/, '');
  var p = s.split('.')[1];
  return p ? Math.min(p.length, 4) : 0;
}

function divisionDifficulty(value, divisor) {
  var result = value / divisor;
  if (Number.isInteger(result)) return divisor === 2 || divisor === 4 || divisor === 8 || divisor === 10 || divisor === 100 ? 0.15 : 0.35;
  var d = decimals(result);
  if (d === 1) return 0.55;
  if (d === 2) return 0.85;
  return 1.25;
}

function multiplicationDifficulty(a, b) {
  a = Number(a); b = Number(b);
  if (a === 0 || b === 0 || a === 1 || b === 1) return 0;
  var small = Math.min(Math.abs(a), Math.abs(b));
  var other = Math.max(Math.abs(a), Math.abs(b));
  var decimalPenalty = (decimals(a) + decimals(b)) * 0.55;
  if (small === 2) return 0.2 + decimalPenalty;
  if (small === 0.5) return 0.15 + decimalPenalty;
  if (Number.isInteger(small) && small <= 5) return 0.45 + decimalPenalty;
  if (Number.isInteger(small) && small <= 10) return 0.7 + decimalPenalty;
  if (Number.isInteger(small) && small <= 20) return 1.0 + decimalPenalty;
  if (Number.isInteger(other) && other < 100 && small < 10) return 0.8 + decimalPenalty;
  return 1.35 + decimalPenalty + Math.min(0.8, Math.log10(other + 1) * 0.2);
}

function addSubtractDifficulty(a, b) {
  return 0.2 + (decimals(a) + decimals(b)) * 0.18 + (Math.max(Math.abs(a),Math.abs(b)) >= 100 ? 0.1 : 0);
}

function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
function candidateSkillIds(candidate){
  var seen={};
  (candidate.steps||[]).forEach(function(st){
    (st.prerequisiteSkillIds||[]).forEach(function(id){seen[id]=true;});
  });
  return Object.keys(seen);
}
function fluencyAdjustment(candidate, studentFluency){
  if (!studentFluency || typeof studentFluency !== 'object') return 0;
  var ids=candidateSkillIds(candidate), values=[];
  ids.forEach(function(id){
    if (Object.prototype.hasOwnProperty.call(studentFluency,id)) {
      var v=Number(studentFluency[id]);
      if (Number.isFinite(v)) values.push(clamp(v,-1,1));
    }
  });
  if(!values.length) return 0;
  var avg=values.reduce(function(a,b){return a+b;},0)/values.length;
  return Math.round((-FLUENCY_MAX_ADJUSTMENT*avg)*1000)/1000;
}

function scoreCandidate(candidate, options) {
  options = options || {};
  var f = candidate.features || {};
  var breakdown = {
    operationCount: (f.operationCount || 0) * WEIGHTS.operationCount,
    anchorAcquisition: f.anchorAcquisition || 0,
    divisionDifficulty: f.divisionDifficulty || 0,
    multiplicationDifficulty: f.multiplicationDifficulty || 0,
    decimalComplexity: (f.decimalComplexity || 0) * WEIGHTS.decimalComplexity,
    fractionComplexity: (f.fractionComplexity || 0) * WEIGHTS.fractionComplexity,
    mentalLoad: (f.mentalLoad || 0) * WEIGHTS.mentalLoad,
    benchmarkBonus: (f.benchmarkBonus || 0) * WEIGHTS.benchmarkBonus,
    compensationComplexity: (f.compensationComplexity || 0) * WEIGHTS.compensationComplexity,
    routeOverhead: f.routeOverhead || 0,
    studentFluencyAdjustment: fluencyAdjustment(candidate, options.studentFluency)
  };
  var total = Object.keys(breakdown).reduce(function(sum,k){ return sum + breakdown[k]; },0);
  return { total: Math.round(total * 1000) / 1000, breakdown: breakdown };
}

module.exports = {
  WEIGHTS: WEIGHTS,
  FLUENCY_MAX_ADJUSTMENT: FLUENCY_MAX_ADJUSTMENT,
  decimals: decimals,
  divisionDifficulty: divisionDifficulty,
  multiplicationDifficulty: multiplicationDifficulty,
  addSubtractDifficulty: addSubtractDifficulty,
  candidateSkillIds: candidateSkillIds,
  fluencyAdjustment: fluencyAdjustment,
  scoreCandidate: scoreCandidate
};
