'use strict';

/* ============================================================
   CANONICAL PREREQUISITE CONTENT ENTRY

   Keep the migrated 46-node content bank intact in the core module. Apply only
   reviewed corrections that must remain consistent with the canonical planner.
   This wrapper owns signed-domain scientific-notation corrections so a
   remediation representation cannot contradict the learner-facing route.
   ============================================================ */

var core=require('./math-prerequisite-content-core.js');

function exactText(expected){
  return function(v){
    return String(v==null?'':v).trim().replace(/\s+/g,'').replace(/×/g,'*').replace(/−/g,'-') ===
      String(expected).trim().replace(/\s+/g,'').replace(/×/g,'*').replace(/−/g,'-');
  };
}

var coefficient=core._lessons.scientific_coefficient_range;
if(!coefficient)throw new Error('missing scientific_coefficient_range prerequisite content');
coefficient.concept="In scientific notation, the coefficient's absolute value must be at least 1 and less than 10.";
coefficient.why='Using 1 ≤ |coefficient| < 10 gives one standard scientific-notation form for each nonzero signed number; the coefficient itself may be positive or negative.';
coefficient.representations=[
  {id:'diagram',text:'Mark the allowed coefficient magnitudes: 1 ≤ |coefficient| < 10. Positive and negative coefficients are both allowed.'},
  {id:'worked_example',text:coefficient.workedExample.prompt+' → '+coefficient.workedExample.explanation},
  {id:'concrete_analogy',text:'Think about distance from zero: the coefficient may point positive or negative, but its magnitude must land from 1 up to, but not including, 10.'},
  {id:'build_together',text:"Check the coefficient's absolute value first. If its magnitude is outside [1,10), move the decimal and compensate in the exponent."}
];
coefficient.checks=[
  {id:'scr-1',prompt:'Valid coefficient: 7.2 or 72?',answer:'7.2',check:exactText('7.2')},
  {id:'scr-2',prompt:'Valid coefficient for a negative number: -4.5 or -45?',answer:'-4.5',check:exactText('-4.5')},
  {id:'scr-3',prompt:'Valid coefficient: 9.99 or 99.9?',answer:'9.99',check:exactText('9.99')}
];

var normalize=core._lessons.normalize_scientific;
if(!normalize)throw new Error('missing normalize_scientific prerequisite content');
normalize.concept='After multiplying or dividing in scientific notation, adjust the coefficient so 1 ≤ |coefficient| < 10 and compensate with the exponent.';
normalize.why='Moving the coefficient decimal by one place changes its magnitude by a factor of 10. The exponent changes in the opposite direction so the value stays the same; the sign of the coefficient is preserved.';
normalize.representations=[
  {id:'diagram',text:'Use a linked decimal/exponent move: shift the coefficient magnitude into 1 ≤ |coefficient| < 10, then change the exponent by the opposite power of ten.'},
  {id:'worked_example',text:normalize.workedExample.prompt+' → '+normalize.workedExample.explanation},
  {id:'concrete_analogy',text:'Treat the coefficient and power of ten like two sides of a trade: if the coefficient becomes ten times smaller, the power-of-ten part becomes ten times larger, while the coefficient sign stays the same.'},
  {id:'build_together',text:"First check |coefficient|. Preserve its sign, move the decimal until 1 ≤ |coefficient| < 10, then compensate in the exponent."}
];
normalize.checks=[
  {id:'ns-1',prompt:'Normalize 0.8 × 10^5',answer:'8 × 10^4',check:exactText('8*10^4')},
  {id:'ns-2',prompt:'Normalize -24 × 10^-2',answer:'-2.4 × 10^-1',check:exactText('-2.4*10^-1')},
  {id:'ns-3',prompt:'Normalize 12.5 × 10^6',answer:'1.25 × 10^7',check:exactText('1.25*10^7')}
];

module.exports=core;
