'use strict';

/* ============================================================
   FULL DAY 1 ADAPTIVE MATH MODEL

   Pure logic. No DOM. This is the shared model/controller layer that sits
   between problem sources and learner-facing renderers.

   Responsibilities:
   - one deterministic planProblem entry point for every Day 1 math area
   - one support-depth controller for Hint / Understand / First Step / Walkthrough
   - prerequisite graph + descent / return stack with loop protection
   - Student Model compatible fluency seam
   - no live rendering and no direct localStorage ownership
   ============================================================ */

var strategy = require('./math-strategy-engine.js');
var cost = require('./math-strategy-cost.js');

var SUPPORTED_AREAS = [
  'fractions_percent',
  'algebra',
  'exponents',
  'scientific_notation',
  'logs',
  'unit_conversions'
];

var PREREQUISITES = {
  halving:{id:'halving',area:'fractions_percent',dependsOn:['divide_by_2']},
  quartering:{id:'quartering',area:'fractions_percent',dependsOn:['halving']},
  eighths:{id:'eighths',area:'fractions_percent',dependsOn:['halving','quartering']},
  divide_by_2:{id:'divide_by_2',area:'fractions_percent',dependsOn:[]},
  divide_by_10:{id:'divide_by_10',area:'fractions_percent',dependsOn:['place_value']},
  divide_by_100:{id:'divide_by_100',area:'fractions_percent',dependsOn:['place_value']},
  place_value:{id:'place_value',area:'fractions_percent',dependsOn:[]},
  multiply_by_small_whole:{id:'multiply_by_small_whole',area:'fractions_percent',dependsOn:['basic_multiplication']},
  basic_multiplication:{id:'basic_multiplication',area:'fractions_percent',dependsOn:[]},
  add_friendly_chunks:{id:'add_friendly_chunks',area:'fractions_percent',dependsOn:['basic_addition']},
  subtract_friendly_chunks:{id:'subtract_friendly_chunks',area:'fractions_percent',dependsOn:['basic_subtraction']},
  basic_addition:{id:'basic_addition',area:'fractions_percent',dependsOn:[]},
  basic_subtraction:{id:'basic_subtraction',area:'fractions_percent',dependsOn:[]},
  fraction_denominator_first:{id:'fraction_denominator_first',area:'fractions_percent',dependsOn:['division_meaning']},
  fraction_simplification:{id:'fraction_simplification',area:'fractions_percent',dependsOn:['factor_pairs']},
  factor_pairs:{id:'factor_pairs',area:'fractions_percent',dependsOn:['basic_multiplication']},
  division_meaning:{id:'division_meaning',area:'fractions_percent',dependsOn:[]},
  part_whole_relationship:{id:'part_whole_relationship',area:'fractions_percent',dependsOn:['division_meaning']},
  place_value_decimal_shift:{id:'place_value_decimal_shift',area:'fractions_percent',dependsOn:['place_value']},

  equation_balance:{id:'equation_balance',area:'algebra',dependsOn:[]},
  inverse_add_subtract:{id:'inverse_add_subtract',area:'algebra',dependsOn:['equation_balance']},
  inverse_multiply_divide:{id:'inverse_multiply_divide',area:'algebra',dependsOn:['equation_balance','division_meaning']},
  combine_like_terms:{id:'combine_like_terms',area:'algebra',dependsOn:['basic_addition','basic_subtraction']},
  signed_arithmetic:{id:'signed_arithmetic',area:'algebra',dependsOn:['basic_addition','basic_subtraction']},
  proportion_structure:{id:'proportion_structure',area:'algebra',dependsOn:['fraction_denominator_first']},
  substitution_check:{id:'substitution_check',area:'algebra',dependsOn:['basic_multiplication','basic_addition']},

  exponent_meaning:{id:'exponent_meaning',area:'exponents',dependsOn:['basic_multiplication']},
  same_base_rule:{id:'same_base_rule',area:'exponents',dependsOn:['exponent_meaning']},
  reciprocal_meaning:{id:'reciprocal_meaning',area:'exponents',dependsOn:['fraction_denominator_first']},

  scientific_coefficient_range:{id:'scientific_coefficient_range',area:'scientific_notation',dependsOn:['place_value']},
  exponent_sign_magnitude:{id:'exponent_sign_magnitude',area:'scientific_notation',dependsOn:['exponent_meaning','place_value']},
  normalize_scientific:{id:'normalize_scientific',area:'scientific_notation',dependsOn:['scientific_coefficient_range','place_value_decimal_shift']},

  power_of_ten_landmarks:{id:'power_of_ten_landmarks',area:'logs',dependsOn:['exponent_meaning']},
  log_inverse_relationship:{id:'log_inverse_relationship',area:'logs',dependsOn:['power_of_ten_landmarks']},
  log_landmarks:{id:'log_landmarks',area:'logs',dependsOn:['power_of_ten_landmarks']},
  estimation:{id:'estimation',area:'logs',dependsOn:['place_value']},

  unit_relationship:{id:'unit_relationship',area:'unit_conversions',dependsOn:[]},
  dimensional_cancellation:{id:'dimensional_cancellation',area:'unit_conversions',dependsOn:['fraction_denominator_first']},
  magnitude_prediction:{id:'magnitude_prediction',area:'unit_conversions',dependsOn:['estimation']},
  multiply_by_conversion_factor:{id:'multiply_by_conversion_factor',area:'unit_conversions',dependsOn:['basic_multiplication']}
};

function clone(x){ return JSON.parse(JSON.stringify(x)); }
function near(a,b){ return Math.abs(Number(a)-Number(b)) <= 1e-9*Math.max(1,Math.abs(Number(a)),Math.abs(Number(b))); }
function step(id,prompt,expected,skills,hint){
  return {id:id,prompt:prompt,expected:expected,prerequisiteSkillIds:skills||[],hint:hint||''};
}
function candidate(id,answer,steps,copy,features){
  return {
    strategyId:id,
    answer:answer,
    valid:true,
    steps:steps||[],
    concept:(copy&&copy.concept)||'',
    mentalRoute:(copy&&copy.mentalRoute)||'',
    hint:(copy&&copy.hint)||'',
    features:features||{}
  };
}
function scoreOne(c,options){
  var s=cost.scoreCandidate(c,options||{});
  return Object.assign({},c,{cost:s.total,costBreakdown:s.breakdown});
}
function finalize(problem,candidates,options){
  if(!candidates || !candidates.length) throw new Error('no strategy candidates for '+problem.area+'/'+problem.family);
  var valid=candidates.filter(function(c){return c.valid!==false;}).map(function(c){return scoreOne(c,options);});
  if(!valid.length) throw new Error('no valid strategy candidates for '+problem.area+'/'+problem.family);
  valid.sort(function(a,b){ if(a.cost!==b.cost)return a.cost-b.cost; return a.strategyId.localeCompare(b.strategyId); });
  var chosen=valid[0];
  return {
    problem:clone(problem),
    answer:chosen.answer,
    candidates:valid,
    chosenStrategyId:chosen.strategyId,
    chosenPlan:{
      concept:chosen.concept||'',
      mentalRoute:chosen.mentalRoute||'',
      hint:chosen.hint||'',
      firstStep:(chosen.steps||[])[0]||null,
      steps:chosen.steps||[]
    },
    nearTies:valid.slice(1).filter(function(c){return c.cost-chosen.cost<=0.5;})
  };
}

function algebraPlan(p,options){
  var out=[];
  if(p.family==='two_sided_linear'){
    var a=Number(p.a),b=Number(p.b),c=Number(p.c),d=Number(p.d);
    if(![a,b,c,d].every(Number.isFinite) || near(a,c)) throw new Error('invalid two_sided_linear problem');
    var answer=(d-b)/(a-c);
    if(a>c){
      var coef=a-c, rhs=d-b;
      out.push(candidate('algebra_keep_positive_left',answer,[
        step('variables','Subtract '+c+'x from both sides.',null,['equation_balance','combine_like_terms'],'Keep the x coefficient positive when that makes the arithmetic cleaner.'),
        step('constant','Subtract '+b+' from both sides.',rhs,['inverse_add_subtract','signed_arithmetic'],'Undo the constant on the x side.'),
        step('divide','Divide both sides by '+coef+'.',answer,['inverse_multiply_divide'],'Undo multiplication by the coefficient.'),
        step('check','Substitute x = '+answer+' into the original equation.',true,['substitution_check'],'Both sides should match.')
      ],{concept:'An equation is a balance. Use the same operation on both sides until x is alone.',mentalRoute:'Keep the variable coefficient positive when possible.',hint:'Move the smaller x-term first.'},{operationCount:4,mentalLoad:1,divisionDifficulty:cost.divisionDifficulty(rhs,coef),benchmarkBonus:0.3}));
    } else {
      var coef2=c-a, left=b, rhs2=d-b;
      out.push(candidate('algebra_keep_positive_right',answer,[
        step('variables','Subtract '+a+'x from both sides.',null,['equation_balance','combine_like_terms'],'Move the smaller x-term so the remaining coefficient stays positive.'),
        step('constant','Subtract '+d+' from both sides, or move constants equivalently.',null,['inverse_add_subtract','signed_arithmetic'],'Keep the arithmetic organized.'),
        step('divide','Divide by the remaining coefficient.',answer,['inverse_multiply_divide'],'Isolate x.'),
        step('check','Substitute x = '+answer+' into the original equation.',true,['substitution_check'],'Both sides should match.')
      ],{concept:'An equation is a balance. Prefer an equivalent route that avoids unnecessary negative coefficients.',mentalRoute:'Keep the remaining x coefficient positive.',hint:'Move the smaller x-term first.'},{operationCount:4,mentalLoad:1,divisionDifficulty:cost.divisionDifficulty(Math.abs(rhs2),coef2),benchmarkBonus:0.3}));
    }
  } else if(p.family==='one_sided_linear'){
    var aa=Number(p.a),bb=Number(p.b),dd=Number(p.d);
    var x=(dd-bb)/aa;
    out.push(candidate('algebra_inverse_operations',x,[
      step('constant',(bb>=0?'Subtract ':'Add ')+Math.abs(bb)+' on both sides.',dd-bb,['equation_balance','inverse_add_subtract'],'Undo the constant first.'),
      step('coefficient','Divide both sides by '+aa+'.',x,['inverse_multiply_divide'],'Undo multiplication by the coefficient.'),
      step('check','Substitute x = '+x+'.',true,['substitution_check'],'Check the original equation.')
    ],{concept:'Undo operations in reverse order while keeping the equation balanced.',mentalRoute:'Undo the constant, then the coefficient.',hint:'What operation is trapping x on the outside?'},{operationCount:3,divisionDifficulty:cost.divisionDifficulty(dd-bb,aa),mentalLoad:1}));
  } else if(p.family==='proportion'){
    var leftN=Number(p.leftNumerator), rightN=Number(p.rightNumerator), rightD=Number(p.rightDenominator);
    if(!Number.isFinite(leftN) || !Number.isFinite(rightN) || !Number.isFinite(rightD)) throw new Error('invalid proportion');
    var px=leftN*rightD/rightN;
    out.push(candidate('algebra_clear_denominators',px,[
      step('structure','Recognize the proportion as two equal ratios.',null,['proportion_structure'],'Equal fractions can be cleared by multiplying through denominators.'),
      step('cross','Multiply diagonal values: '+leftN+' × '+rightD+' = '+rightN+'x.',leftN*rightD,['basic_multiplication'],'This comes from clearing denominators, not a magic rule.'),
      step('divide','Divide by '+rightN+'.',px,['inverse_multiply_divide'],'Isolate x.')
    ],{concept:'Cross multiplication is shorthand for clearing denominators in an equation of equal ratios.',mentalRoute:'Clear denominators, then divide.',hint:'Make the diagonal products equal.'},{operationCount:3,divisionDifficulty:cost.divisionDifficulty(leftN*rightD,rightN),mentalLoad:1}));
  } else throw new Error('unsupported algebra family '+p.family);
  return finalize(p,out,options);
}

function exponentPlan(p,options){
  var out=[];
  if(p.family==='same_base_product'){
    var sum=Number(p.leftExponent)+Number(p.rightExponent);
    out.push(candidate('exponent_add_same_base',String(p.base)+'^'+sum,[
      step('classify','The base is the same and the expressions are multiplied.',null,['same_base_rule'],'Same base multiplied means combine repeated factors.'),
      step('exponents','Add the exponents: '+p.leftExponent+' + '+p.rightExponent+' = '+sum+'.',sum,['basic_addition'],'Count all repeated factors.'),
      step('result','Keep the same base.',String(p.base)+'^'+sum,['exponent_meaning'],'Only the exponent changes.')
    ],{concept:'Multiplying powers with the same base combines all repeated factors, so exponents add.',mentalRoute:'same base × → add exponents',hint:'Check whether the bases match.'},{operationCount:2,benchmarkBonus:0.5}));
  } else if(p.family==='same_base_quotient'){
    var diff=Number(p.leftExponent)-Number(p.rightExponent);
    out.push(candidate('exponent_subtract_same_base',String(p.base)+'^'+diff,[
      step('classify','The base is the same and the expressions are divided.',null,['same_base_rule'],'Division cancels matching factors.'),
      step('exponents','Subtract exponents: '+p.leftExponent+' - '+p.rightExponent+' = '+diff+'.',diff,['basic_subtraction'],'Cancel repeated factors.'),
      step('result','Keep the same base.',String(p.base)+'^'+diff,['exponent_meaning'],'Write the simplified power.')
    ],{concept:'Dividing powers with the same base cancels repeated factors, so exponents subtract.',mentalRoute:'same base ÷ → subtract exponents',hint:'Same base division uses subtraction.'},{operationCount:2,benchmarkBonus:0.5}));
  } else if(p.family==='power_of_power'){
    var prod=Number(p.innerExponent)*Number(p.outerExponent);
    out.push(candidate('exponent_multiply_power_of_power',String(p.base)+'^'+prod,[
      step('meaning','A power of a power repeats the entire inner power.',null,['exponent_meaning'],'Think of repeated groups.'),
      step('multiply','Multiply exponents: '+p.innerExponent+' × '+p.outerExponent+' = '+prod+'.',prod,['basic_multiplication'],'Count factors across all groups.'),
      step('result','Keep the same base.',String(p.base)+'^'+prod,['same_base_rule'],'Write the simplified power.')
    ],{concept:'A power raised to a power repeats groups, so exponents multiply.',mentalRoute:'power of a power → multiply exponents',hint:'How many groups of the inner power are there?'},{operationCount:2,benchmarkBonus:0.4}));
  } else if(p.family==='negative_exponent'){
    var den=Math.pow(Number(p.base),Math.abs(Number(p.exponent)));
    out.push(candidate('exponent_negative_reciprocal','1/'+den,[
      step('reciprocal','Move the factor across the fraction bar.',null,['reciprocal_meaning'],'A negative exponent means reciprocal, not a negative answer.'),
      step('positive','Evaluate '+p.base+'^'+Math.abs(Number(p.exponent))+'.',den,['exponent_meaning','basic_multiplication'],'Now use a positive exponent.'),
      step('result','Write the reciprocal.','1/'+den,['fraction_denominator_first'],'Place the power in the denominator.')
    ],{concept:'A negative exponent means reciprocal.',mentalRoute:'negative power → reciprocal',hint:'Do not make the answer negative; flip the factor instead.'},{operationCount:2,mentalLoad:1}));
  } else throw new Error('unsupported exponent family '+p.family);
  return finalize(p,out,options);
}

function normalizeSci(coef,exp){
  coef=Number(coef); exp=Number(exp);
  while(Math.abs(coef)>=10){coef/=10;exp+=1;}
  while(Math.abs(coef)>0&&Math.abs(coef)<1){coef*=10;exp-=1;}
  return {coefficient:coef,exponent:exp};
}
function scientificPlan(p,options){
  var out=[];
  if(p.family==='convert_to_scientific'){
    var v=Number(p.value); if(!Number.isFinite(v)||v===0) throw new Error('invalid scientific conversion value');
    var exp=Math.floor(Math.log10(Math.abs(v))), coef=v/Math.pow(10,exp), ans=normalizeSci(coef,exp);
    out.push(candidate('scientific_move_decimal',ans,[
      step('coefficient','Move the decimal until the coefficient is at least 1 and less than 10.',ans.coefficient,['scientific_coefficient_range','place_value_decimal_shift'],'The coefficient must stay between 1 and 10.'),
      step('count','Count the decimal moves.',Math.abs(ans.exponent),['place_value'],'Each move changes a power of ten.'),
      step('sign','Choose the exponent sign from the original magnitude.',ans.exponent,['exponent_sign_magnitude'],'Large original number → positive; small decimal → negative.'),
      step('check','Check that '+ans.coefficient+' × 10^'+ans.exponent+' has the original magnitude.',true,['estimation'],'Sanity-check size.')
    ],{concept:'Scientific notation separates significant digits from place value.',mentalRoute:'coefficient 1–10, count shifts, choose exponent sign',hint:'First make the coefficient between 1 and 10.'},{operationCount:3,mentalLoad:1,benchmarkBonus:0.4}));
  } else if(p.family==='multiply_scientific'){
    var m=normalizeSci(Number(p.leftCoefficient)*Number(p.rightCoefficient),Number(p.leftExponent)+Number(p.rightExponent));
    out.push(candidate('scientific_multiply_then_normalize',m,[
      step('coefficients','Multiply the coefficients.',Number(p.leftCoefficient)*Number(p.rightCoefficient),['basic_multiplication'],'Work with the front numbers first.'),
      step('exponents','Add the powers of ten.',Number(p.leftExponent)+Number(p.rightExponent),['same_base_rule','signed_arithmetic'],'Same base 10 multiplied means add exponents.'),
      step('normalize','Renormalize the coefficient if needed.',m,['normalize_scientific'],'Coefficient must be between 1 and 10.')
    ],{concept:'Multiply coefficients, add exponents, then normalize.',mentalRoute:'multiply fronts, add powers',hint:'Handle coefficients and powers of ten separately.'},{operationCount:3,mentalLoad:1}));
  } else if(p.family==='divide_scientific'){
    var q=normalizeSci(Number(p.leftCoefficient)/Number(p.rightCoefficient),Number(p.leftExponent)-Number(p.rightExponent));
    out.push(candidate('scientific_divide_then_normalize',q,[
      step('coefficients','Divide the coefficients.',Number(p.leftCoefficient)/Number(p.rightCoefficient),['division_meaning'],'Work with the front numbers first.'),
      step('exponents','Subtract the powers of ten.',Number(p.leftExponent)-Number(p.rightExponent),['same_base_rule','signed_arithmetic'],'Same base 10 divided means subtract exponents.'),
      step('normalize','Renormalize the coefficient if needed.',q,['normalize_scientific'],'Coefficient must be between 1 and 10.')
    ],{concept:'Divide coefficients, subtract exponents, then normalize.',mentalRoute:'divide fronts, subtract powers',hint:'Handle coefficients and powers of ten separately.'},{operationCount:3,mentalLoad:1}));
  } else throw new Error('unsupported scientific notation family '+p.family);
  return finalize(p,out,options);
}

function logPlan(p,options){
  var out=[];
  if(p.family==='exact_log10'){
    var val=Number(p.value); if(!(val>0)) throw new Error('log input must be positive');
    var e=Math.log10(val); if(!near(e,Math.round(e))) throw new Error('exact_log10 requires a power of ten');
    e=Math.round(e);
    out.push(candidate('log_power_of_ten_inverse',e,[
      step('translate','Ask: 10 to what power equals '+val+'?',null,['log_inverse_relationship'],'A base-10 log is an exponent question.'),
      step('landmark','Match '+val+' to a power of ten.',e,['power_of_ten_landmarks'],'Use the exact power-of-ten landmarks.'),
      step('answer','Therefore log('+val+') = '+e+'.',e,['log_inverse_relationship'],'The exponent is the logarithm.')
    ],{concept:'log base 10 asks which exponent on 10 produces the number.',mentalRoute:'translate log into a power-of-ten question',hint:'What power of 10 gives this number?'},{operationCount:1,benchmarkBonus:1}));
  } else if(p.family==='inverse_log10'){
    var x=Math.pow(10,Number(p.exponent));
    out.push(candidate('log_inverse_to_power',x,[
      step('translate','Rewrite log(x) = '+p.exponent+' as 10^'+p.exponent+' = x.',x,['log_inverse_relationship'],'Logarithms and exponents undo each other.'),
      step('evaluate','Evaluate the power of ten.',x,['power_of_ten_landmarks'],'Use place value.')
    ],{concept:'Logarithms and powers of ten are inverse operations.',mentalRoute:'log(x)=n ↔ x=10^n',hint:'Rewrite it as a power of ten.'},{operationCount:1,benchmarkBonus:1}));
  } else if(p.family==='estimate_negative_log'){
    var front=Number(p.front), exponent=Number(p.exponent), answer=exponent-Math.log10(front);
    out.push(candidate('log_landmark_estimate',answer,[
      step('structure','Use −log(a×10^−n) = n − log(a).',null,['log_inverse_relationship','signed_arithmetic'],'Separate the power of ten from the front number.'),
      step('landmark','Estimate log('+front+') using known landmarks.',Math.log10(front),['log_landmarks','estimation'],'Use a small landmark set rather than memorizing a huge table.'),
      step('subtract','Compute '+exponent+' − log('+front+').',answer,['basic_subtraction','estimation'],'The result should be near '+exponent+'.')
    ],{concept:'For a small scientific-notation number, the power-of-ten exponent gives the main size and log(a) is the correction.',mentalRoute:'n − log(a)',hint:'Start from the power-of-ten exponent.'},{operationCount:3,mentalLoad:1}));
  } else throw new Error('unsupported logs family '+p.family);
  return finalize(p,out,options);
}

function unitPlan(p,options){
  var out=[];
  if(p.family==='single_conversion'){
    var value=Number(p.value), factor=Number(p.factor); if(!Number.isFinite(value)||!Number.isFinite(factor)||factor===0) throw new Error('invalid conversion');
    var ans=value*factor;
    var grows=Math.abs(factor)>1;
    out.push(candidate('unit_dimensional_analysis',ans,[
      step('predict','Predict whether the number should get '+(grows?'larger':'smaller')+'.',grows,['magnitude_prediction'],'Changing to a smaller unit makes the number larger; changing to a larger unit makes it smaller.'),
      step('relationship','Use 1 '+p.from+' = '+factor+' '+p.to+'.',factor,['unit_relationship'],'State the conversion relationship before calculating.'),
      step('setup','Arrange the conversion factor so '+p.from+' cancels.',null,['dimensional_cancellation'],'Put the unwanted unit on opposite sides of the fraction bar.'),
      step('calculate','Multiply '+value+' × '+factor+'.',ans,['multiply_by_conversion_factor'],'Calculate only after units are aligned.'),
      step('check','Confirm the answer is '+(grows?'larger':'smaller')+' as predicted.',true,['magnitude_prediction'],'Use magnitude to catch direction mistakes.')
    ],{concept:'Unit conversion changes the numerical label while preserving the same physical quantity.',mentalRoute:'predict direction → cancel units → calculate',hint:'First decide whether the number should grow or shrink.'},{operationCount:3,multiplicationDifficulty:cost.multiplicationDifficulty(value,factor),mentalLoad:1,benchmarkBonus:0.3}));
  } else if(p.family==='stacked_rate'){
    var v2=Number(p.value), factors=(p.factors||[]).map(Number); if(!factors.length) throw new Error('stacked_rate requires factors');
    var ans2=factors.reduce(function(a,f){return a*f;},v2);
    out.push(candidate('unit_stacked_dimensional_analysis',ans2,[
      step('predict','Predict the rough magnitude before calculating.',null,['magnitude_prediction'],'Use the direction of each unit change.'),
      step('stack','Stack conversion factors so unwanted units cancel.',null,['dimensional_cancellation'],'Every unwanted unit should appear once on top and once on bottom.'),
      step('calculate','Multiply the remaining numerical factors.',ans2,['multiply_by_conversion_factor'],'After cancellation, calculate the numbers.'),
      step('units','Keep only the surviving target units.',p.to,['unit_relationship'],'Units are part of the answer.')
    ],{concept:'Dimensional analysis is unit bookkeeping: stack equal conversion relationships so unwanted units cancel.',mentalRoute:'stack factors → cancel units → multiply',hint:'Set up the units before touching the numbers.'},{operationCount:factors.length+2,mentalLoad:2}));
  } else throw new Error('unsupported unit conversion family '+p.family);
  return finalize(p,out,options);
}

function planProblem(problem,options){
  if(!problem || SUPPORTED_AREAS.indexOf(problem.area)<0) throw new Error('unsupported Day 1 math area');
  options=options||{};
  if(problem.area==='fractions_percent') return strategy.plan(problem,options);
  if(problem.area==='algebra') return algebraPlan(problem,options);
  if(problem.area==='exponents') return exponentPlan(problem,options);
  if(problem.area==='scientific_notation') return scientificPlan(problem,options);
  if(problem.area==='logs') return logPlan(problem,options);
  if(problem.area==='unit_conversions') return unitPlan(problem,options);
  throw new Error('unsupported area');
}

function supportFor(mode,plan){
  if(!plan || !plan.chosenPlan) throw new Error('support requires a chosen plan');
  var p=plan.chosenPlan, base={mode:mode,strategyId:plan.chosenStrategyId,answerRevealed:false,concept:'',hint:'',steps:[]};
  if(mode==='hint'){
    base.hint=p.hint || (p.firstStep&&p.firstStep.hint) || '';
    return base;
  }
  if(mode==='understand'){
    base.concept=p.concept||'';
    base.hint=p.mentalRoute||'';
    return base;
  }
  if(mode==='first_step'){
    base.concept=p.concept||'';
    base.steps=p.firstStep?[clone(p.firstStep)]:[];
    return base;
  }
  if(mode==='walkthrough'){
    base.concept=p.concept||'';
    base.steps=clone(p.steps||[]);
    return base;
  }
  if(mode==='mental'){
    base.hint=p.mentalRoute||'';
    return base;
  }
  throw new Error('unknown support mode '+mode);
}

function inferParentSkill(problem){
  if(problem.family) return problem.family;
  return problem.area;
}
function createSession(opts){
  opts=opts||{};
  if(!opts.problem) throw new Error('session requires problem');
  return {
    version:1,
    area:opts.area||opts.problem.area,
    originalProblem:clone(opts.problem),
    currentProblem:clone(opts.problem),
    activeSkillId:opts.activeSkillId||inferParentSkill(opts.problem),
    returnStack:[],
    activePath:[opts.activeSkillId||inferParentSkill(opts.problem)],
    prerequisiteHistory:[],
    supportHistory:[],
    createdAt:opts.createdAt||Date.now()
  };
}
function prerequisiteNode(id){ return PREREQUISITES[id]||null; }
function descendToPrerequisite(session,parentSkill,prerequisiteSkillId){
  if(!session || !prerequisiteSkillId) throw new Error('descent requires session and prerequisite');
  if(!prerequisiteNode(prerequisiteSkillId)) return {action:'unknown_prerequisite',skillId:prerequisiteSkillId};
  if(session.activePath.indexOf(prerequisiteSkillId)>=0){
    return {action:'prerequisite_loop_blocked',skillId:prerequisiteSkillId,path:session.activePath.slice()};
  }
  session.returnStack.push({
    skillId:session.activeSkillId,
    problem:clone(session.currentProblem),
    parentState:parentSkill?clone(parentSkill):null
  });
  session.activeSkillId=prerequisiteSkillId;
  session.activePath.push(prerequisiteSkillId);
  session.prerequisiteHistory.push({action:'descend',to:prerequisiteSkillId,at:Date.now()});
  return {action:'teach_prerequisite',skillId:prerequisiteSkillId,node:clone(prerequisiteNode(prerequisiteSkillId))};
}
function completePrerequisite(session,skillId,passed){
  if(!session) throw new Error('completion requires session');
  if(session.activeSkillId!==skillId) return {action:'prerequisite_mismatch',expected:session.activeSkillId,received:skillId};
  session.prerequisiteHistory.push({action:'check',skillId:skillId,passed:!!passed,at:Date.now()});
  if(!passed){
    return {action:'reteach_prerequisite',skillId:skillId,node:clone(prerequisiteNode(skillId))};
  }
  var parent=session.returnStack.pop();
  if(!parent){
    session.activePath=[skillId];
    return {action:'prerequisite_complete',skillId:skillId};
  }
  session.activePath.pop();
  session.activeSkillId=parent.skillId;
  session.currentProblem=clone(parent.problem);
  return {action:'return_to_parent_problem',skillId:parent.skillId,problem:clone(parent.problem),parentState:parent.parentState};
}
function nextMissingDependency(skillId,fluency){
  var node=prerequisiteNode(skillId); if(!node) return null;
  fluency=fluency||{};
  for(var i=0;i<node.dependsOn.length;i++){
    var dep=node.dependsOn[i];
    if(!fluency[dep] || Number(fluency[dep])<0.7) return dep;
  }
  return null;
}

module.exports={
  SUPPORTED_AREAS:SUPPORTED_AREAS,
  PREREQUISITES:PREREQUISITES,
  planProblem:planProblem,
  supportFor:supportFor,
  createSession:createSession,
  descendToPrerequisite:descendToPrerequisite,
  completePrerequisite:completePrerequisite,
  nextMissingDependency:nextMissingDependency,
  prerequisiteNode:prerequisiteNode,
  _private:{algebraPlan:algebraPlan,exponentPlan:exponentPlan,scientificPlan:scientificPlan,logPlan:logPlan,unitPlan:unitPlan,finalize:finalize}
};
