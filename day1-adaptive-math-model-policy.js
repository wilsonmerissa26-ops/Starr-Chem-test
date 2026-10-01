'use strict';

/* ============================================================
   CANONICAL DAY 1 ADAPTIVE MATH MODEL ENTRY

   The core owns deterministic planner/prerequisite mechanics. This entry owns
   input validation, graph-boundary policy, and learner-support policy, so
   invalid arithmetic never reaches planner loops, prerequisite repair follows
   explicit dependencies, and support roles cannot drift into one another.
   ============================================================ */

var core = require('./day1-adaptive-math-model-core.js');

/*
   HUMAN-REVIEWED PREREQUISITE EDGE CORRECTIONS

   A deeper remediation edge must teach the smaller idea that is actually
   missing, not merely point to something mathematically adjacent.

   - Reciprocal meaning does not depend on the fraction-of-a-whole procedure.
     The reciprocal lesson itself is the correct repair until/unless a genuine
     fraction-meaning prerequisite node is introduced.
   - Proportion structure does not depend on the fraction-of-a-whole procedure.
     Equal-ratio structure is taught directly by the proportion lesson.
   - Dimensional cancellation does not depend on the fraction-of-a-whole
     procedure. Its own lesson teaches factor orientation and unit cancellation;
     a future deeper edge should be added only when there is a genuinely matching
     prerequisite node.
   - Conversion magnitude prediction depends on understanding unit
     relationships (large unit vs small unit), not generic arithmetic
     estimation.
*/
core.PREREQUISITES.reciprocal_meaning.dependsOn=[];
core.PREREQUISITES.proportion_structure.dependsOn=[];
core.PREREQUISITES.dimensional_cancellation.dependsOn=[];
core.PREREQUISITES.magnitude_prediction.dependsOn=['unit_relationship'];

function clone(v){ return JSON.parse(JSON.stringify(v)); }
function finite(v,label){var n=Number(v);if(!Number.isFinite(n))throw new Error(label+' must be finite');return n;}
function integer(v,label){var n=finite(v,label);if(!Number.isInteger(n))throw new Error(label+' must be an integer');return n;}
function nonZero(v,label){var n=finite(v,label);if(n===0)throw new Error(label+' must be nonzero');return n;}
function nonEmpty(v,label){var s=String(v==null?'':v).trim();if(!s)throw new Error(label+' is required');return v;}
function approx(a,b){return Math.abs(Number(a)-Number(b))<=1e-9*Math.max(1,Math.abs(Number(a)),Math.abs(Number(b)));}

function validateProblem(problem){
  if(!problem||typeof problem!=='object')throw new Error('problem object required');
  if(core.SUPPORTED_AREAS.indexOf(problem.area)<0)throw new Error('unsupported Day 1 math area');
  var p=Object.assign({},problem),f=p.family;
  nonEmpty(f,'problem family');

  if(p.area==='fractions_percent'){
    if(f==='fraction_add_subtract'){
      p.leftNumerator=integer(p.leftNumerator,'left numerator');
      p.leftDenominator=integer(p.leftDenominator,'left denominator');
      p.rightNumerator=integer(p.rightNumerator,'right numerator');
      p.rightDenominator=integer(p.rightDenominator,'right denominator');
      if(p.leftDenominator<=0||p.rightDenominator<=0)throw new Error('fraction denominators must be positive');
      if(p.operation!=='add'&&p.operation!=='subtract')throw new Error('fraction operation must be add or subtract');
    }
    // Accepted Phase 1 validates its own percent/fraction-of-whole families.
    return p;
  }

  if(p.area==='algebra'){
    if(f==='two_sided_linear'){
      p.a=finite(p.a,'a');p.b=finite(p.b,'b');p.c=finite(p.c,'c');p.d=finite(p.d,'d');
      if(approx(p.a,p.c))throw new Error('two-sided linear equation must have one determined solution');
    }else if(f==='one_sided_linear'){
      p.a=nonZero(p.a,'a');p.b=finite(p.b,'b');p.d=finite(p.d,'d');
    }else if(f==='proportion'){
      p.leftNumerator=nonZero(p.leftNumerator,'left numerator');
      p.rightNumerator=nonZero(p.rightNumerator,'right numerator');
      p.rightDenominator=nonZero(p.rightDenominator,'right denominator');
    }else if(f==='formula_rearrangement'){
      nonEmpty(p.formulaId,'formulaId');nonEmpty(p.target,'target');
      if(p.formulaId==='V_lwh_h'&&p.target==='h')p.answer='V/(lw)';
      else if(p.formulaId==='P_2l2w_w'&&p.target==='w')p.answer='(P-2l)/2';
      else throw new Error('unsupported formula rearrangement');
    }else throw new Error('unsupported algebra family '+f);
    return p;
  }

  if(p.area==='exponents'){
    if(f==='negative_exponent'){
      p.base=nonZero(p.base,'base');p.exponent=integer(p.exponent,'exponent');
      if(p.exponent>=0)throw new Error('negative_exponent family requires a negative exponent');
    }else if(f==='same_base_product'||f==='same_base_quotient'){
      nonEmpty(p.base,'base');p.leftExponent=integer(p.leftExponent,'left exponent');p.rightExponent=integer(p.rightExponent,'right exponent');
    }else if(f==='same_base_mixed'){
      nonEmpty(p.base,'base');p.leftExponent=integer(p.leftExponent,'left exponent');p.rightExponent=integer(p.rightExponent,'right exponent');p.denominatorExponent=integer(p.denominatorExponent,'denominator exponent');
    }else if(f==='power_of_power'){
      nonEmpty(p.base,'base');p.innerExponent=integer(p.innerExponent,'inner exponent');p.outerExponent=integer(p.outerExponent,'outer exponent');
    }else throw new Error('unsupported exponent family '+f);
    return p;
  }

  if(p.area==='scientific_notation'){
    if(f==='convert_to_scientific'){
      p.value=nonZero(p.value,'scientific value');
    }else if(f==='multiply_scientific'||f==='divide_scientific'){
      p.leftCoefficient=nonZero(p.leftCoefficient,'left coefficient');
      p.rightCoefficient=nonZero(p.rightCoefficient,'right coefficient');
      p.leftExponent=integer(p.leftExponent,'left exponent');p.rightExponent=integer(p.rightExponent,'right exponent');
    }else throw new Error('unsupported scientific notation family '+f);
    return p;
  }

  if(p.area==='logs'){
    if(f==='exact_log10'){
      p.value=finite(p.value,'log value');if(p.value<=0)throw new Error('log input must be positive');
    }else if(f==='inverse_log10'){
      p.exponent=finite(p.exponent,'log exponent');
    }else if(f==='log_product_estimate'){
      p.value=finite(p.value,'log estimate value');if(p.value<=0)throw new Error('log estimate value must be positive');
      if(!Array.isArray(p.factors)||p.factors.length!==2)throw new Error('log product estimate requires exactly two factors');
      p.factors=p.factors.map(function(v,i){var n=finite(v,'factor '+i);if(n<=0)throw new Error('log factors must be positive');return n;});
      if(!approx(p.factors[0]*p.factors[1],p.value))throw new Error('log landmark factors must multiply to the target value');
      if(!p.landmarks||typeof p.landmarks!=='object')throw new Error('log landmarks are required');
      p.factors.forEach(function(v){if(!Number.isFinite(Number(p.landmarks[String(v)])))throw new Error('missing finite log landmark for '+v);});
    }else if(f==='estimate_negative_log'){
      p.front=finite(p.front,'front coefficient');if(p.front<=0)throw new Error('negative-log front coefficient must be positive');
      p.exponent=finite(p.exponent,'power-of-ten magnitude');if(p.exponent<0)throw new Error('negative-log exponent magnitude must be nonnegative');
    }else throw new Error('unsupported logs family '+f);
    return p;
  }

  if(p.area==='unit_conversions'){
    if(f==='single_conversion'){
      p.value=finite(p.value,'conversion value');p.factor=finite(p.factor,'conversion factor');
      if(p.factor<=0)throw new Error('conversion factor must be positive');
      nonEmpty(p.from,'source unit');nonEmpty(p.to,'target unit');
    }else if(f==='stacked_rate'){
      p.value=finite(p.value,'rate value');
      if(!Array.isArray(p.factors)||!p.factors.length)throw new Error('stacked rate requires conversion factors');
      p.factors=p.factors.map(function(v){var n=finite(v,'stacked conversion factor');if(n<=0)throw new Error('stacked conversion factors must be positive');return n;});
      nonEmpty(p.from,'source rate unit');nonEmpty(p.to,'target rate unit');
    }else if(f==='rate_times_duration'){
      p.amount=finite(p.amount,'rate amount');p.perMinutes=finite(p.perMinutes,'rate denominator');p.durationMinutes=finite(p.durationMinutes,'duration');
      if(p.perMinutes<=0)throw new Error('rate denominator must be positive');
      if(p.durationMinutes<0)throw new Error('duration cannot be negative');
      nonEmpty(p.unit,'rate unit');
    }else throw new Error('unsupported unit conversion family '+f);
    return p;
  }

  throw new Error('unsupported Day 1 math area');
}

function planProblem(problem,options){return core.planProblem(validateProblem(problem),options);}

// The first descent comes from a parent problem family and is selected from the
// chosen plan's prerequisite metadata. Once already inside a prerequisite node,
// deeper descent must follow that node's explicit dependsOn edges. Unknown-node
// and recursive-loop behavior remains owned by the core. A rejected cross-graph
// jump returns before any stack/path mutation.
function descendToPrerequisite(session,parentSkill,prerequisiteSkillId){
  if(!session||!prerequisiteSkillId)return core.descendToPrerequisite(session,parentSkill,prerequisiteSkillId);
  var target=core.prerequisiteNode(prerequisiteSkillId);
  if(!target)return core.descendToPrerequisite(session,parentSkill,prerequisiteSkillId);
  if(Array.isArray(session.activePath)&&session.activePath.indexOf(prerequisiteSkillId)>=0){
    return core.descendToPrerequisite(session,parentSkill,prerequisiteSkillId);
  }
  var current=core.prerequisiteNode(session.activeSkillId);
  if(current&&current.dependsOn.indexOf(prerequisiteSkillId)<0){
    return{
      action:'unrelated_prerequisite_blocked',
      from:session.activeSkillId,
      skillId:prerequisiteSkillId,
      allowedDependencies:current.dependsOn.slice()
    };
  }
  return core.descendToPrerequisite(session,parentSkill,prerequisiteSkillId);
}

function supportFor(mode,plan){
  if(!plan||!plan.chosenPlan)throw new Error('support requires a chosen plan');
  var p=plan.chosenPlan;
  var base={mode:mode,strategyId:plan.chosenStrategyId,answerRevealed:false,concept:'',hint:'',steps:[]};
  if(mode==='hint'){base.hint=p.hint||(p.firstStep&&p.firstStep.hint)||'';return base;}
  if(mode==='understand'){
    // Concept/strategy framing only. Do not reuse p.mentalRoute here: mental
    // math is an optional route, not a substitute for conceptual explanation.
    base.concept=p.concept||'';return base;
  }
  if(mode==='first_step'){base.concept=p.concept||'';base.steps=p.firstStep?[clone(p.firstStep)]:[];return base;}
  if(mode==='walkthrough'){base.concept=p.concept||'';base.steps=clone(p.steps||[]);return base;}
  if(mode==='mental'){base.hint=p.mentalRoute||'';return base;}
  throw new Error('unknown support mode '+mode);
}

module.exports = Object.assign({}, core, {
  planProblem:planProblem,
  validateProblem:validateProblem,
  descendToPrerequisite:descendToPrerequisite,
  supportFor:supportFor
});
