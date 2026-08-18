/* ============================================================
   PHASE 2A ADAPTIVE CORE — GENERATED GENERALIZATION CONTRACT

   Independent generated problems for the new Phase 2A families. These are
   constructed from mathematical identities, not copied from classroom items.
   Phase 1 percent generalization remains protected by its separate 351-case
   suite and is not duplicated here.
   ============================================================ */
'use strict';
var assert=require('assert');
var full=require('./day1-adaptive-math-model.js');

var count=0,byArea={};
function near(a,b,tol){return Math.abs(Number(a)-Number(b))<=(tol||1e-9)*Math.max(1,Math.abs(Number(a)),Math.abs(Number(b)));}
function record(area){count++;byArea[area]=(byArea[area]||0)+1;}
function structural(plan,problem){
  assert.ok(plan&&plan.chosenStrategyId,'missing chosen strategy: '+JSON.stringify(problem));
  assert.ok(plan.chosenPlan&&Array.isArray(plan.chosenPlan.steps)&&plan.chosenPlan.steps.length>0,'missing steps: '+JSON.stringify(problem));
  plan.chosenPlan.steps.forEach(function(st){assert.ok(Array.isArray(st.prerequisiteSkillIds),'missing prerequisite metadata: '+JSON.stringify(problem));});
  assert.ok(Array.isArray(plan.candidates)&&plan.candidates.length>0,'missing candidates');
  plan.candidates.forEach(function(c){assert.ok(Number.isFinite(c.cost),'non-finite candidate cost for '+c.strategyId);});
}
function numericCase(problem,expected){
  var p=Object.assign({source:'phase2-generalization'},problem),a=full.planProblem(p),b=full.planProblem(p);
  structural(a,p);assert.ok(near(a.answer,expected,1e-8),'wrong answer for '+JSON.stringify(p)+': '+a.answer+' vs '+expected);
  assert.strictEqual(a.chosenStrategyId,b.chosenStrategyId,'non-deterministic strategy for '+JSON.stringify(p));
  assert.ok(near(b.answer,expected,1e-8));record(problem.area);return a;
}
function stringCase(problem,expected){
  var p=Object.assign({source:'phase2-generalization'},problem),a=full.planProblem(p),b=full.planProblem(p);
  structural(a,p);assert.strictEqual(a.answer,expected,'wrong symbolic answer for '+JSON.stringify(p));
  assert.strictEqual(a.chosenStrategyId,b.chosenStrategyId,'non-deterministic symbolic strategy');record(problem.area);return a;
}
function sciValue(answer){return Number(answer.coefficient)*Math.pow(10,Number(answer.exponent));}
function scientificCase(problem,expectedValue){
  var p=Object.assign({source:'phase2-generalization'},problem),a=full.planProblem(p),b=full.planProblem(p);
  structural(a,p);assert.ok(a.answer&&Number.isFinite(Number(a.answer.coefficient))&&Number.isInteger(Number(a.answer.exponent)),'invalid scientific answer object');
  assert.ok(Math.abs(Number(a.answer.coefficient))>=1&&Math.abs(Number(a.answer.coefficient))<10,'scientific coefficient not normalized');
  assert.ok(near(sciValue(a.answer),expectedValue,1e-8),'scientific answer reconstructs wrong value for '+JSON.stringify(p));
  assert.deepStrictEqual(a.answer,b.answer,'scientific planning must be deterministic');record(problem.area);return a;
}

// Fraction addition/subtraction: independent rational arithmetic.
var denoms=[2,3,4,5,6,8,9,10,12];
['add','subtract'].forEach(function(op){
  denoms.forEach(function(ld){denoms.forEach(function(rd){
    [1,2,3].forEach(function(ln){[1,2].forEach(function(rn){
      numericCase({area:'fractions_percent',family:'fraction_add_subtract',leftNumerator:ln,leftDenominator:ld,operation:op,rightNumerator:rn,rightDenominator:rd},op==='add'?ln/ld+rn/rd:ln/ld-rn/rd);
    });});
  });});
});

// Algebra: construct equations around known x rather than trusting planner math.
[-7,-3,-1,0,2,5,9].forEach(function(x){
  [[7,2],[5,-4],[3,8],[-2,6]].forEach(function(ac){
    var a=ac[0],c=ac[1];[-11,-2,4,13].forEach(function(b){
      var d=(a-c)*x+b;
      numericCase({area:'algebra',family:'two_sided_linear',a:a,b:b,c:c,d:d},x);
    });
  });
  [-6,-3,2,5,9].forEach(function(a){[-8,0,7].forEach(function(b){
    numericCase({area:'algebra',family:'one_sided_linear',a:a,b:b,d:a*x+b},x);
  });});
});
[[1,2,3],[2,5,7],[3,4,11],[5,6,13]].forEach(function(row){
  var left=row[0],right=row[1],den=row[2];
  numericCase({area:'algebra',family:'proportion',leftNumerator:left,rightNumerator:right,rightDenominator:den},left*den/right);
});
stringCase({area:'algebra',family:'formula_rearrangement',formulaId:'V_lwh_h',target:'h'},'V/(lw)');
stringCase({area:'algebra',family:'formula_rearrangement',formulaId:'P_2l2w_w',target:'w'},'(P-2l)/2');

// Exponents: identity-based symbolic checks including zero/negative results.
['a','b','x','10'].forEach(function(base){
  [-4,-1,0,2,5].forEach(function(left){[-3,0,1,4].forEach(function(right){
    stringCase({area:'exponents',family:'same_base_product',base:base,leftExponent:left,rightExponent:right},base+'^'+(left+right));
    stringCase({area:'exponents',family:'same_base_quotient',base:base,leftExponent:left,rightExponent:right},base+'^'+(left-right));
  });});
  [-2,1,3].forEach(function(a){[0,2,5].forEach(function(b){[-1,2,4].forEach(function(d){
    stringCase({area:'exponents',family:'same_base_mixed',base:base,leftExponent:a,rightExponent:b,denominatorExponent:d},base+'^'+(a+b-d));
  });});});
  [-3,-1,2,4].forEach(function(inner){[-2,1,3].forEach(function(outer){
    stringCase({area:'exponents',family:'power_of_power',base:base,innerExponent:inner,outerExponent:outer},base+'^'+(inner*outer));
  });});
});
[2,3,5,10].forEach(function(base){[-1,-2,-3,-4].forEach(function(exp){
  stringCase({area:'exponents',family:'negative_exponent',base:base,exponent:exp},'1/'+Math.pow(base,Math.abs(exp)));
});});

// Scientific notation: validate by reconstructing the numeric quantity.
[1.2,3.75,6.04,9.9].forEach(function(coef){[-8,-4,-1,2,6,9].forEach(function(exp){
  var value=coef*Math.pow(10,exp);
  scientificCase({area:'scientific_notation',family:'convert_to_scientific',value:value},value);
});});
[[1.2,3.5],[2.5,8],[7.2,4.4],[9.9,1.1]].forEach(function(cs){
  [-6,-2,0,5].forEach(function(le){[-4,1,7].forEach(function(re){
    scientificCase({area:'scientific_notation',family:'multiply_scientific',leftCoefficient:cs[0],leftExponent:le,rightCoefficient:cs[1],rightExponent:re},cs[0]*Math.pow(10,le)*cs[1]*Math.pow(10,re));
    scientificCase({area:'scientific_notation',family:'divide_scientific',leftCoefficient:cs[0],leftExponent:le,rightCoefficient:cs[1],rightExponent:re},cs[0]*Math.pow(10,le)/(cs[1]*Math.pow(10,re)));
  });});
});

// Logs: exact inverse identities plus product-landmark addition.
for(var e=-8;e<=8;e++){
  numericCase({area:'logs',family:'exact_log10',value:Math.pow(10,e)},e);
  numericCase({area:'logs',family:'inverse_log10',exponent:e},Math.pow(10,e));
}
[[2,3],[2,5],[3,5],[4,5],[5,7]].forEach(function(fs){
  var landmarks={};landmarks[String(fs[0])]=Math.log10(fs[0]);landmarks[String(fs[1])]=Math.log10(fs[1]);
  numericCase({area:'logs',family:'log_product_estimate',value:fs[0]*fs[1],factors:fs,landmarks:landmarks},Math.log10(fs[0])+Math.log10(fs[1]));
});
[2,3,5,7,9].forEach(function(front){[2,4,6,8].forEach(function(exp){
  numericCase({area:'logs',family:'estimate_negative_log',front:front,exponent:exp},exp-Math.log10(front));
});});

// Unit conversions and rates: direct dimensional arithmetic.
[0.004,0.25,2.4,17,350].forEach(function(value){[0.001,0.01,10,1000].forEach(function(factor){
  numericCase({area:'unit_conversions',family:'single_conversion',value:value,from:'u1',to:'u2',factor:factor},value*factor);
});});
[[1000,60],[0.001,60],[100,0.01],[2,3,5]].forEach(function(factors){
  [0.02,1.5,12].forEach(function(value){
    numericCase({area:'unit_conversions',family:'stacked_rate',value:value,from:'source-rate',to:'target-rate',factors:factors},factors.reduce(function(v,f){return v*f;},value));
  });
});
[2,5,8,12].forEach(function(amount){[2,5,8].forEach(function(per){[0,7,20,60].forEach(function(duration){
  numericCase({area:'unit_conversions',family:'rate_times_duration',amount:amount,perMinutes:per,durationMinutes:duration,unit:'g'},amount*duration/per);
});});});

assert.ok(count>=1000,'expected at least 1000 generated Phase 2A cases, got '+count);
['fractions_percent','algebra','exponents','scientific_notation','logs','unit_conversions'].forEach(function(area){assert.ok(byArea[area]>0,'no generated coverage for '+area);});
console.log('PHASE2_GENERALIZATION_CASES',count);
console.log('PHASE2_GENERALIZATION_BY_AREA',JSON.stringify(byArea));
console.log('PASS Phase 2A generated correctness and determinism invariants');
