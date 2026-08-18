'use strict';

/* Source-specific normalization only. This module understands current
   classroom prompt shapes; the adaptive model never reparses display text. */

var UNIT_FACTORS={
  'L>mL':1000,'mL>L':0.001,
  'g>mg':1000,'mg>g':0.001,
  'mg>mcg':1000,'mcg>mg':0.001,
  'mol>mmol':1000,'mmol>mol':0.001,
  'min>s':60,'s>min':1/60,'h>min':60,'min>h':1/60,
  'gal>qt':4,'qt>pt':2,'pt>cups':2,'cups>fl oz':8
};

function n(v){var x=Number(v);if(!Number.isFinite(x))throw new Error('invalid number '+v);return x;}
function signed(op,value){return op==='-'||op==='−'?-n(value):n(value);}
function base(area,family,metadata){metadata=metadata||{};return{area:area,family:family,source:'classroom',sourceId:metadata.sourceId||null};}
function normalizeMinus(s){return String(s).replace(/−/g,'-').trim();}

function fromClassroomPrompt(area,prompt,metadata){
  var raw=String(prompt||'').trim(),s=normalizeMinus(raw),m,p;

  if(area==='fractions_percent'){
    m=s.match(/^(\d+)\s*\/\s*(\d+)\s*([+-])\s*(\d+)\s*\/\s*(\d+)\s*=?$/);
    if(m){p=base(area,'fraction_add_subtract',metadata);p.leftNumerator=n(m[1]);p.leftDenominator=n(m[2]);p.operation=m[3]==='+'?'add':'subtract';p.rightNumerator=n(m[4]);p.rightDenominator=n(m[5]);return p;}
    m=s.match(/^([0-9]+(?:\.[0-9]+)?)%\s+of\s+([0-9]+(?:\.[0-9]+)?)\s*=?$/i);
    if(m){p=base(area,'percent_of_whole',metadata);p.percent=n(m[1]);p.whole=n(m[2]);return p;}
    m=s.match(/^(\d+)\s*\/\s*(\d+)\s+of\s+([0-9]+(?:\.[0-9]+)?)\s*=?$/i);
    if(m){p=base(area,'fraction_of_whole',metadata);p.numerator=n(m[1]);p.denominator=n(m[2]);p.whole=n(m[3]);return p;}
    m=s.match(/^([0-9]+(?:\.[0-9]+)?)\s+is\s+what\s+percent\s+of\s+([0-9]+(?:\.[0-9]+)?)\s*\??$/i);
    if(m){p=base(area,'what_percent_of',metadata);p.part=n(m[1]);p.whole=n(m[2]);return p;}
  }

  if(area==='algebra'){
    m=s.match(/^(\d*)x\s*([+-])\s*(\d+)\s*=\s*(\d*)x\s*([+-])\s*(\d+)\.?(?:\s*Solve for x\.)?$/i);
    if(m){p=base(area,'two_sided_linear',metadata);p.a=n(m[1]||1);p.b=signed(m[2],m[3]);p.c=n(m[4]||1);p.d=signed(m[5],m[6]);return p;}
    m=s.match(/^(\d+)\/x\s*=\s*(\d+)\/(\d+)\.?(?:\s*Solve for x\.)?$/i);
    if(m){p=base(area,'proportion',metadata);p.leftNumerator=n(m[1]);p.rightNumerator=n(m[2]);p.rightDenominator=n(m[3]);return p;}
    m=s.match(/^(\d*)x\s*([+-])\s*(\d+)\s*=\s*([+-]?\d+(?:\.\d+)?)\.?(?:\s*Solve for x\.)?$/i);
    if(m){p=base(area,'one_sided_linear',metadata);p.a=n(m[1]||1);p.b=signed(m[2],m[3]);p.d=n(m[4]);return p;}
  }

  if(area==='exponents'){
    m=s.match(/^([0-9]+)\^\((-?\d+)\)\s*=$/i);
    if(m){p=base(area,'negative_exponent',metadata);p.base=n(m[1]);p.exponent=n(m[2]);return p;}
    m=s.match(/^\(([a-z])\^(\d+)\)\^(\d+)\s*=$/i);
    if(m){p=base(area,'power_of_power',metadata);p.base=m[1];p.innerExponent=n(m[2]);p.outerExponent=n(m[3]);return p;}
    m=s.match(/^([a-z0-9]+)\^(\d+)\s*[×*]\s*\1\^(\d+)\s*=$/i);
    if(m){p=base(area,'same_base_product',metadata);p.base=/^\d+$/.test(m[1])?n(m[1]):m[1];p.leftExponent=n(m[2]);p.rightExponent=n(m[3]);return p;}
    m=s.match(/^([a-z0-9]+)\^(\d+)\s*\/\s*\1\^(\d+)\s*=$/i);
    if(m){p=base(area,'same_base_quotient',metadata);p.base=/^\d+$/.test(m[1])?n(m[1]):m[1];p.leftExponent=n(m[2]);p.rightExponent=n(m[3]);return p;}
  }

  if(area==='scientific_notation'){
    m=s.match(/^Write\s+([0-9.eE+-]+)\s+in scientific notation\.?$/i);
    if(m){p=base(area,'convert_to_scientific',metadata);p.value=n(m[1]);return p;}
    m=s.match(/^\(([0-9.]+)[×*]10\^([+-]?\d+)\)\(([0-9.]+)[×*]10\^([+-]?\d+)\)\s*=$/i);
    if(m){p=base(area,'multiply_scientific',metadata);p.leftCoefficient=n(m[1]);p.leftExponent=n(m[2]);p.rightCoefficient=n(m[3]);p.rightExponent=n(m[4]);return p;}
    m=s.match(/^\(([0-9.]+)[×*]10\^([+-]?\d+)\)\/\(([0-9.]+)[×*]10\^([+-]?\d+)\)\s*=$/i);
    if(m){p=base(area,'divide_scientific',metadata);p.leftCoefficient=n(m[1]);p.leftExponent=n(m[2]);p.rightCoefficient=n(m[3]);p.rightExponent=n(m[4]);return p;}
  }

  if(area==='logs'){
    m=s.match(/^log\(([0-9.eE+-]+)\)\s*=$/i);
    if(m){p=base(area,'exact_log10',metadata);p.value=n(m[1]);return p;}
    m=s.match(/^If\s+log\(x\)\s*=\s*([+-]?\d+),\s*x\s*=$/i);
    if(m){p=base(area,'inverse_log10',metadata);p.exponent=n(m[1]);return p;}
    m=s.match(/^Estimate\s+log\((\d+)\)\s+using\s+log\((\d+)\)≈([0-9.]+)\s+and\s+log\((\d+)\)≈([0-9.]+)\.?$/i);
    if(m){p=base(area,'log_product_estimate',metadata);p.value=n(m[1]);p.factors=[n(m[2]),n(m[4])];p.landmarks={};p.landmarks[m[2]]=n(m[3]);p.landmarks[m[4]]=n(m[5]);return p;}
    m=s.match(/^Estimate\s+-log\(([0-9.]+)[×*]10\^(-?\d+)\)\s+to one decimal\.?$/i);
    if(m){p=base(area,'estimate_negative_log',metadata);p.front=n(m[1]);p.exponent=Math.abs(n(m[2]));return p;}
  }

  if(area==='unit_conversions'){
    m=s.match(/^([0-9.]+)\s+([A-Za-z]+)\s+to\s+([A-Za-z ]+)\s*=$/i);
    if(m){
      var from=m[2],to=m[3].trim(),factor=UNIT_FACTORS[from+'>'+to];
      if(factor!=null){p=base(area,'single_conversion',metadata);p.value=n(m[1]);p.from=from;p.to=to;p.factor=factor;return p;}
    }
    m=s.match(/^([0-9.]+)\s+mol\/s\s+to\s+mmol\/min\s*=$/i);
    if(m){p=base(area,'stacked_rate',metadata);p.value=n(m[1]);p.from='mol/s';p.to='mmol/min';p.factors=[1000,60];return p;}
    m=s.match(/^([0-9.]+)\s+g\/(\d+)\s+min\s+for\s+([0-9.]+)\s+min\s*=\s*how many g\??$/i);
    if(m){p=base(area,'rate_times_duration',metadata);p.amount=n(m[1]);p.perMinutes=n(m[2]);p.durationMinutes=n(m[3]);p.unit='g';return p;}
  }

  throw new Error('unsupported classroom problem: '+area+' :: '+raw);
}

function fromMathGymItem(item){
  if(!item||typeof item!=='object')throw new Error('Math Gym item required');
  if(!item.strategyInput)throw new Error('Math Gym item is missing structured strategyInput');
  var out=Object.assign({},item.strategyInput);
  out.source='math_gym';out.sourceId=item.id||null;
  return out;
}

module.exports={UNIT_FACTORS:UNIT_FACTORS,fromClassroomPrompt:fromClassroomPrompt,fromMathGymItem:fromMathGymItem};
