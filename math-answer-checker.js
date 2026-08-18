(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.MathAnswerChecker=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';

function near(a,b,tol){return Math.abs(Number(a)-Number(b))<=(tol==null?1e-9:tol)*Math.max(1,Math.abs(Number(a)),Math.abs(Number(b)));}
function absoluteNear(a,b,tol){return Math.abs(Number(a)-Number(b))<=tol;}
function norm(v){return String(v==null?'':v).trim().toLowerCase().replace(/\s+/g,'').replace(/×/g,'*').replace(/−/g,'-');}
function numeric(v){
  var s=String(v==null?'':v).trim().replace(/,/g,'').replace(/%/g,'');
  var n=parseFloat(s);
  return Number.isFinite(n)?n:null;
}
function fractionValue(v){
  var s=norm(v),m=s.match(/^([+-]?[0-9]+(?:\.[0-9]+)?)\/([+-]?[0-9]+(?:\.[0-9]+)?)$/);
  if(!m)return null;
  var d=Number(m[2]);return d===0?null:Number(m[1])/d;
}
function numericOrFraction(v){var f=fractionValue(v);return f==null?numeric(v):f;}
function sci(v){
  if(v&&typeof v==='object'&&Number.isFinite(Number(v.coefficient))&&Number.isFinite(Number(v.exponent)))return{coefficient:Number(v.coefficient),exponent:Number(v.exponent)};
  var s=norm(v).replace(/x/g,'*'),m=s.match(/^([+-]?[0-9]*\.?[0-9]+)\*?10\^?([+-]?\d+)$/);
  return m?{coefficient:Number(m[1]),exponent:Number(m[2])}:null;
}
function normalizeExpr(v){return norm(v).replace(/\*/g,'').replace(/^\((.*)\)$/,'$1');}
function expectedFromPlan(plan){return plan&&Object.prototype.hasOwnProperty.call(plan,'answer')?plan.answer:null;}

function check(problem,input,plan){
  if(!problem)throw new Error('problem required');
  var expected=expectedFromPlan(plan);
  var family=problem.family;

  if(family==='convert_to_scientific'||family==='multiply_scientific'||family==='divide_scientific'){
    var got=sci(input);
    if(got&&expected&&typeof expected==='object')return near(got.coefficient,expected.coefficient)&&Number(got.exponent)===Number(expected.exponent);
    var asNumber=numeric(input);
    if(asNumber!==null&&expected&&typeof expected==='object')return near(asNumber,Number(expected.coefficient)*Math.pow(10,Number(expected.exponent)),1e-8);
    return false;
  }

  if(family==='formula_rearrangement'){
    var gotExpr=normalizeExpr(input),ansExpr=normalizeExpr(expected);
    if(gotExpr===ansExpr)return true;
    if(problem.formulaId==='V_lwh_h')return ['v/lw','v/(lw)'].indexOf(gotExpr)>=0;
    if(problem.formulaId==='P_2l2w_w')return ['p/2-l','(p-2l)/2','p-2l/2'].indexOf(gotExpr)>=0;
    return false;
  }

  if(family==='same_base_product'||family==='same_base_quotient'||family==='same_base_mixed'||family==='power_of_power')return normalizeExpr(input)===normalizeExpr(expected);
  if(family==='negative_exponent'){
    var neg=numericOrFraction(input);
    var expVal=numericOrFraction(expected);
    return neg!==null&&expVal!==null&&near(neg,expVal);
  }
  if(family==='fraction_add_subtract'){
    var frac=numericOrFraction(input);
    return frac!==null&&near(frac,expected);
  }

  var got=numericOrFraction(input);
  if(got===null)return false;
  if(family==='estimate_negative_log')return absoluteNear(got,expected,0.15);
  if(family==='log_product_estimate')return absoluteNear(got,expected,0.03);
  return near(got,expected,1e-9);
}

return{check:check,numeric:numeric,fractionValue:fractionValue,sci:sci,normalizeExpr:normalizeExpr,absoluteNear:absoluteNear};
});
