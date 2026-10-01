'use strict';

/* ============================================================
   CANONICAL PREREQUISITE CONTENT ENTRY

   Keep the migrated 46-node content bank intact in the core module. Apply only
   reviewed corrections that must remain consistent with the canonical planner.
   This wrapper owns signed-domain scientific-notation corrections and the
   human-reviewed representation-quality policy.
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
  {id:'concrete_analogy',text:'Think of a camera zoom dial: the sign tells which side of zero the value is on, while the zoom keeps the visible coefficient magnitude in the readable 1-to-10 window.'},
  {id:'build_together',text:"Check the coefficient's absolute value first. If its magnitude is outside [1,10), move the decimal and compensate in the exponent."}
];
coefficient.checks=[
  {id:'scr-1',prompt:'Valid coefficient: 7.2 or 72?',answer:'7.2',check:exactText('7.2')},
  {id:'scr-2',prompt:'Valid coefficient for a negative number: -4.5 or -45?',answer:'-4.5',check:exactText('-4.5')},
  {id:'scr-3',prompt:'Valid coefficient: 9.99 or 99.9?',answer:'9.99',check:exactText('9.99')}
];

var normalize=core._lessons.normalize_scientific;
if(!normalize)throw new Error('missing normalize_scientific prerequisite content');
normalize.concept="After multiplying or dividing in scientific notation, adjust the coefficient so its absolute value satisfies 1 ≤ |coefficient| < 10, then compensate with the exponent.";
normalize.why='Moving the coefficient decimal by one place changes its magnitude by a factor of 10. The exponent changes in the opposite direction so the value stays the same; the sign of the coefficient is preserved.';
normalize.representations=[
  {id:'diagram',text:"Use a linked decimal/exponent move: shift the coefficient until its absolute value satisfies 1 ≤ |coefficient| < 10, then change the exponent by the opposite power of ten."},
  {id:'worked_example',text:normalize.workedExample.prompt+' → '+normalize.workedExample.explanation},
  {id:'concrete_analogy',text:'Think of moving weight between two sides of the same backpack: if the coefficient gives up a factor of 10, the exponent carries that factor instead, so the total load stays unchanged.'},
  {id:'build_together',text:"First check the coefficient's absolute value. Preserve its sign, move the decimal until 1 ≤ |coefficient| < 10, then compensate in the exponent."}
];
normalize.checks=[
  {id:'ns-1',prompt:'Normalize 0.8 × 10^5',answer:'8 × 10^4',check:exactText('8*10^4')},
  {id:'ns-2',prompt:'Normalize -24 × 10^-2',answer:'-2.4 × 10^-1',check:exactText('-2.4*10^-1')},
  {id:'ns-3',prompt:'Normalize 12.5 × 10^6',answer:'1.25 × 10^7',check:exactText('1.25*10^7')}
];

/*
   A representation switch must actually change the teaching representation.
   The migrated builder used lesson.why as the default concrete_analogy text,
   which meant the label changed while the explanation did not. Every current
   prerequisite now receives an explicit concrete analogy instead.
*/
var ANALOGIES={
  halving:'Imagine sharing 18 study cards evenly between two students. If the split is fair, each student must receive 9.',
  quartering:'Picture a pizza cut into four equal sections. One quarter is exactly one of those four equal sections, no matter how large the pizza is.',
  eighths:'Picture an ice tray with 8 equal compartments. One eighth is the amount that fits into exactly one compartment.',
  divide_by_2:'Think of two identical baskets sharing the same pile. Dividing by 2 asks how much belongs in each basket.',
  divide_by_10:'Think of exchanging one dollar for ten dimes: the same value is being described in ten equal smaller parts.',
  divide_by_100:'Think of one dollar as 100 cents. Dividing by 100 asks for one hundredth of the original amount.',
  place_value:'Digits are like people sitting in labeled seats. The same digit has a different value when it moves from the ones seat to the tens or tenths seat.',
  multiply_by_small_whole:'Imagine 4 identical bags with 12 items in each bag. Multiplication totals the equal groups without counting every item one at a time.',
  basic_multiplication:'Think of theater seats arranged in equal rows and columns. Rows times seats per row gives the total number of seats.',
  add_friendly_chunks:'Think of paying a bill with easy pieces first: combine the large easy amounts, then add the small leftover amount.',
  subtract_friendly_chunks:'Think of aiming a little high on purpose, then giving back the extra change to land on the exact amount.',
  basic_addition:'Imagine pouring two separate piles of beads into one bowl. Addition tells how many beads are in the combined bowl.',
  basic_subtraction:'Imagine starting with a stack of cards and removing some. Subtraction tells what remains or how far apart two stacks are.',
  fraction_denominator_first:'Think of a tray divided into equal slots. The denominator tells how many slots make the whole tray; finding one slot comes before taking several slots.',
  fraction_simplification:'Imagine the same pizza first cut into 8 small slices and then regrouped into 4 larger slices. The amount of pizza stays the same even though the slice names change.',
  common_denominator:'Imagine trying to combine measuring scoops of different sizes. First rename them using the same scoop size so the counts are comparable.',
  fraction_combine_numerators:'Once every slice is the same size, the denominator is the slice size and the numerator is just the number of slices you have.',
  factor_pairs:'Picture arranging 24 tiles into rectangles. Different row-and-column arrangements reveal the factor pairs that make the same total.',
  division_meaning:'Imagine packing 24 bottles into boxes that hold 6 each. Division asks how many full boxes you can make.',
  part_whole_relationship:'Think of 18 students wearing blue shirts inside a class of 60. The part is the blue-shirt group; the whole is everyone in the class.',
  place_value_decimal_shift:'Think of a metric staircase: multiplying or dividing by powers of ten moves the value up or down fixed place-value steps.',
  equation_balance:'Picture a balance scale. If you remove the same weight from both pans, the scale can stay balanced; changing only one pan breaks the equality.',
  inverse_add_subtract:'Think of an elevator: going up 9 floors is undone by going down 9 floors. Opposite moves bring you back to where you started.',
  inverse_multiply_divide:'Think of packing items into equal groups and then unpacking them. Multiplying builds the groups; dividing by the same number undoes that grouping.',
  combine_like_terms:'Think of sorting groceries before counting: apples can combine with apples and cans with cans, but an apple and a can are not one like item.',
  signed_arithmetic:'Use a thermometer or elevator. Positive moves go one direction, negative moves the opposite direction, and the sign tells which side of zero you are on.',
  proportion_structure:'Think of a recipe that keeps the same taste when doubled. If 2 cups of one ingredient match 3 cups of another, every scaled batch must preserve that same ratio.',
  substitution_check:'Think of a key being tested in a lock. Put the proposed x-value back into the original equation; if both sides match, the key fits.',
  formula_inverse_operations:'Think of the target variable wrapped in layers. Undo the outermost layer first, then the next, until the target is by itself.',
  exponent_meaning:'Think of an exponent as a repeat button. A power of 4 means press the multiply-by-the-base instruction four times.',
  same_base_rule:'Imagine identical building blocks labeled with the same base. Multiplication joins the stacks; division removes matching blocks from both stacks.',
  reciprocal_meaning:'Think of 4 as 4/1 on a flip card. Turning the card over gives 1/4, and multiplying the two returns one whole.',
  scientific_coefficient_range:'Think of a camera zoom dial: the sign tells which side of zero the value is on, while the zoom keeps the visible coefficient magnitude in the readable 1-to-10 window.',
  exponent_sign_magnitude:'Think of zooming a map. Positive powers of ten zoom outward to much larger scales; negative powers zoom inward to tiny scales.',
  normalize_scientific:'Think of moving weight between two sides of the same backpack: if the coefficient gives up a factor of 10, the exponent carries that factor instead, so the total load stays unchanged.',
  power_of_ten_landmarks:'Think of a place-value ladder with 1, 10, 100, 1000 on successive rungs. Each step changes the value by a factor of ten.',
  log_inverse_relationship:'Think of logarithms and powers of ten as a two-way translator: one direction turns an exponent into a number, the other recovers the exponent from the number.',
  log_landmarks:'Think of a tiny reference card with only a few trusted mile markers. You locate unfamiliar log values by building from those known markers.',
  log_product_rule:'Think of two trips whose distances on an exponent scale add together. Multiplying the original numbers combines those exponent distances, so the logs add.',
  estimation:'Think of checking a grocery cart before checkout. You do not need the exact cents to know whether a total near $30, $300, or $3000 makes sense.',
  unit_relationship:'Think of the same bottle labeled two ways: 1 liter and 1000 milliliters describe the same liquid, only with different-sized units.',
  dimensional_cancellation:'Treat unit labels like matching puzzle tags. A tag on top and the same tag on the bottom cancel, leaving only the unit you want.',
  magnitude_prediction:'Think of counting the same jar of coins in dollars versus cents. Smaller units require a larger number; larger units require a smaller number.',
  multiply_by_conversion_factor:'Think of exchanging currency at an exact rate. The form of the amount changes, but the underlying value is preserved by the conversion ratio.',
  rate_meaning:'Think of a speedometer reading miles per hour. A rate always tells how much of one quantity occurs for each unit of another quantity.',
  cancel_rate_time:'Think of driving 60 miles per hour for 2 hours. The hour labels cancel between “per hour” and “hours,” leaving miles traveled.'
};

Object.keys(core._lessons).forEach(function(id){
  var lesson=core._lessons[id],analogy=ANALOGIES[id];
  if(!analogy)throw new Error('missing concrete analogy for prerequisite '+id);
  var rep=(lesson.representations||[]).find(function(r){return r.id==='concrete_analogy';});
  if(!rep)throw new Error('missing concrete_analogy representation for '+id);
  rep.text=analogy;
});

module.exports=core;
