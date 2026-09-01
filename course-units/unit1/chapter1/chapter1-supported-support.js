(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.Chapter1SupportedTeaching=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  var REASONS=Object.freeze([
    {id:'dont_understand_concept',label:"I don't understand the concept"},
    {id:'dont_know_how_to_start',label:"I don't know how to start"},
    {id:'forgot_prerequisite',label:'I forgot something I need first'},
    {id:'started_but_stuck',label:'I started, but I got stuck'},
    {id:'show_me_example',label:'Show me a similar example'},
    {id:'explanation_not_making_sense',label:"The explanation isn't making sense"}
  ]);

  function p(label,concept,start,prerequisite,example,alternate){
    return Object.freeze({label:label,concept:concept,start:start,prerequisite:prerequisite,example:example,alternate:alternate});
  }

  var PLANS=Object.freeze({
    lewis:Object.freeze({
      VALENCE_COUNT:p(
        'Valence-electron count',
        'Valence electrons are the outer-shell electrons an atom contributes to the Lewis electron budget. For the atoms used here: H contributes 1, C 4, N 5, and O 6.',
        'Start with the element only. Do not think about bonds yet. Find its periodic-table group pattern, then write the neutral atom valence count.',
        'The prerequisite is reading main-group valence from the periodic table. For this course foundation, use H=1, C=4, N=5, O=6 before doing any Lewis arithmetic.',
        'Example: nitrogen is in the group-15 pattern, so neutral N contributes 5 valence electrons. Oxygen is one group to the right, so neutral O contributes 6.',
        'Picture four labeled electron buckets: H has 1 token, C has 4, N has 5, O has 6. The molecule cannot use electrons that were never put into the starting buckets.'
      ),
      TOTAL_ELECTRONS:p(
        'Total valence-electron budget',
        'A Lewis structure starts with one fixed electron budget. Add the neutral-atom valence contribution from every atom in the formula before drawing or counting any bonds.',
        'Write each atom contribution separately, then add them. Example pattern: oxygen contribution + hydrogen contributions = total electron budget.',
        'The prerequisite is knowing each atom’s neutral valence count. If H, C, N, or O valence is uncertain, repair that count before totaling the molecule.',
        'Example: NH3 has 5 from nitrogen plus 1+1+1 from hydrogen, so the molecule begins with 8 valence electrons.',
        'Think of the molecule as getting a fixed pile of electron coins at the beginning. Bonds and lone pairs can only spend coins from that original pile.'
      ),
      BOND_ELECTRONS:p(
        'Electrons used in bonds',
        'Each ordinary bond line represents one shared electron pair, so each single bond uses 2 electrons from the original Lewis electron budget.',
        'Count the bond lines first. Then multiply that number by 2 to find how many electrons are already placed in bonds.',
        'The prerequisite is the meaning of a covalent bond line: one line stands for one pair of electrons, which is 2 electrons.',
        'Example: three single N-H bonds use 3 x 2 = 6 bonding electrons.',
        'Treat each bond line like a two-seat bench. Every line has exactly two electron seats filled, so count benches and double them.'
      ),
      REMAINING_ELECTRONS:p(
        'Electrons remaining after bonding',
        'Remaining electrons are not a new number to memorize. They are the original total valence-electron budget minus the electrons already placed in bonds.',
        'Keep the total you already calculated. Count the electrons used by bonds, then subtract: total minus used equals remaining.',
        'The prerequisite is having a correct total electron budget and a correct count of bonding electrons. Repair whichever of those two numbers is uncertain first.',
        'Example: CH3OH has 14 total valence electrons and five single bonds use 10, so 4 electrons remain for lone pairs.',
        'Imagine crossing electron coins off a checklist as each bond spends two. Whatever coins are not crossed off must still appear somewhere in the Lewis structure.'
      ),
      LONE_PAIR_COUNT:p(
        'Lone-pair count',
        'A lone pair is a pair of nonbonding electrons. Two leftover electrons make one lone pair, four leftover electrons make two lone pairs, and so on.',
        'Count the nonbonding electrons that still need placement, then group them in twos. Do not count each electron as its own lone pair.',
        'The prerequisite is the difference between an electron and a pair of electrons. One lone pair always contains 2 electrons.',
        'Example: after three N-H bonds in NH3, 2 electrons remain. Those 2 electrons become one lone pair on nitrogen.',
        'Draw dots in pairs: •• is one lone pair. If you have ••••, regroup them as ••  ••, which is two lone pairs.'
      ),
      HYDROGEN_SHELL:p(
        'Hydrogen duet rule',
        'Hydrogen is the exception to the common second-row octet pattern. Its first shell is full with only 2 electrons, normally supplied by one single bond.',
        'For hydrogen, stop counting when it has one bond. One bond gives hydrogen access to 2 electrons, which fills its shell.',
        'The prerequisite is remembering that hydrogen has only the first electron shell. That shell holds 2 electrons, not 8.',
        'Example: each H in H2O has one O-H bond. That one bond gives each hydrogen the 2 electrons it needs.',
        'Think of hydrogen as having a two-seat table while C, N, and O usually need eight seats around them in these examples.'
      ),
      BOND_COUNT:p(
        'Number of bonds',
        'Bond count asks how many atom-to-atom connections are present. Count each connection once. A single bond is one connection.',
        'Trace the structure from one atom to the next and tally every separate connection exactly once.',
        'The prerequisite is distinguishing atoms from connections. Atoms are nodes; bond lines are the connections between them.',
        'Example: CH4 has four separate C-H connections, so it has four single bonds.',
        'Imagine drawing a dot on every bond line after you count it. If every line has one dot, you have counted each connection once.'
      ),
      BOND_ORDER:p(
        'Total bond order',
        'Bond order counts the strength/order of every bond: single=1, double=2, triple=3. Add those values instead of merely counting neighboring atoms.',
        'Label each bond 1, 2, or 3 based on single, double, or triple, then add the labels.',
        'The prerequisite is recognizing single, double, and triple bonds as bond orders 1, 2, and 3.',
        'Example: H-C≡N has one single bond worth 1 and one triple bond worth 3, for total bond order 4.',
        'Think of bond lines as strokes: a single has one stroke, a double two, a triple three. Total bond order is the total number of strokes touching the structure you are counting.'
      ),
      N_LONE_PAIRS:p(
        'Lone pairs on neutral nitrogen',
        'In the neutral nitrogen patterns used here, nitrogen commonly has three bonds and one lone pair. The lone pair completes nitrogen’s octet without adding another bond.',
        'Count nitrogen’s bonds first. With three ordinary bonds, check the electron budget for the remaining pair on nitrogen.',
        'The prerequisite is the octet pattern plus lone-pair counting: three bonds place 6 electrons around N, and one lone pair supplies the remaining 2.',
        'Example: NH3 has three N-H bonds and one lone pair on nitrogen.',
        'Picture nitrogen with four electron regions: three are bonding regions and the fourth is a lone-pair region.'
      ),
      O_LONE_PAIRS:p(
        'Lone pairs on neutral oxygen',
        'In the neutral oxygen patterns used here, oxygen commonly has two bonds and two lone pairs. Those four nonbonding electrons complete oxygen’s octet.',
        'Count oxygen’s bonds first. If neutral oxygen has two ordinary bonds in these examples, account for four more electrons as two lone pairs.',
        'The prerequisite is knowing that four nonbonding electrons form two pairs, not four lone pairs.',
        'Example: water has two O-H bonds and two lone pairs on oxygen.',
        'Picture oxygen with four electron regions: two bond regions and two dot-pair regions.'
      ),
      ALKANE_FORMULA:p(
        'Acyclic alkane formula',
        'A saturated acyclic alkane follows CnH2n+2. The formula comes from carbon making four bonds in an open chain with no rings or multiple bonds.',
        'Confirm it is an open-chain saturated alkane, substitute the carbon count for n, then calculate 2n+2 for hydrogen.',
        'The prerequisite is recognizing an acyclic saturated alkane. Rings and multiple bonds change the hydrogen count.',
        'Example: n=4 gives H=2(4)+2=10, so the formula is C4H10.',
        'Think of an open alkane chain as needing two extra hydrogens at the two ends compared with the 2n hydrogens contributed along the chain pattern.'
      )
    }),
    'formal-charge':Object.freeze({
      VALENCE_COUNT:p(
        'Neutral-atom valence V',
        'In formal charge, V is the valence-electron count of the neutral free atom. It comes from the element, not from the charge drawn on the molecule.',
        'Fill only the V box first. Identify the element and write its neutral valence count before looking at lone pairs or bonds.',
        'The prerequisite is neutral main-group valence counting: C=4, N=5, O=6 for the atoms used here.',
        'Example: oxygen always starts the formal-charge calculation with V=6, even when the oxygen ends up with +1 or -1 formal charge.',
        'Think of V as the atom’s starting allowance before the molecule is drawn. Formal charge asks how far the drawing’s bookkeeping ownership moved from that starting allowance.'
      ),
      NONBONDING_ELECTRONS:p(
        'Nonbonding-electron count N',
        'N counts individual nonbonding electrons on the atom, not the number of lone pairs. Each lone pair contributes 2 to N.',
        'Count lone pairs on the atom, then multiply by 2. Put that electron number into N.',
        'The prerequisite is electron-pair counting: one lone pair=2 electrons, two lone pairs=4, three lone pairs=6.',
        'Example: oxygen with three lone pairs has N=6 because 3 pairs x 2 electrons = 6 nonbonding electrons.',
        'Ignore the word pair for one moment and count the actual dots: every dot is one nonbonding electron. N is the number of dots.'
      ),
      NONBONDING_MEANING:p(
        'What N means in FC = V - N - B',
        'The N term means nonbonding electrons, not lone pairs. Using pair count instead of electron count changes the arithmetic and gives the wrong formal charge.',
        'Before calculating anything, translate every lone pair into two individual electrons and write that number under N.',
        'The prerequisite is distinguishing a lone pair from the two electrons inside that pair.',
        'Example: two lone pairs do not mean N=2. They contain four nonbonding electrons, so N=4.',
        'Use the phrase “Start - dots - lines”: N is the dots, counted one electron at a time.'
      ),
      BOND_ORDER:p(
        'Total bond order B',
        'B is the total bond order attached to the atom. A single bond contributes 1, a double 2, and a triple 3.',
        'Look only at bonds touching the atom. Write 1, 2, or 3 over each bond and add them.',
        'The prerequisite is recognizing single, double, and triple bond orders.',
        'Example: an oxygen with one double bond and one single bond has B=2+1=3.',
        'Count bond strokes touching the atom. One stroke is 1, two parallel strokes are 2, and three are 3.'
      ),
      FORMAL_CHARGE:p(
        'Formal-charge arithmetic',
        'Formal charge uses FC = V - N - B after V, N, and B are independently correct. The sign comes from the arithmetic; do not guess it from whether the atom “looks positive.”',
        'Keep any V, N, and B values you already trust. Then subtract N and B from V in that order and keep the sign on the result.',
        'The prerequisite is having correct V, N, and B values. If one input is wrong, repair that input before recomputing FC.',
        'Example: hydronium oxygen has V=6, N=2, B=3, so FC=6-2-3=+1.',
        'Use three boxes feeding one final box: V and the two deductions N and B. The final box is only the arithmetic result after the three input boxes are correct.'
      ),
      SUM_CHECK:p(
        'Whole-structure charge check',
        'The signed formal charges on every atom must add to the overall charge written for the molecule or ion. This catches local bookkeeping mistakes.',
        'After assigning atom charges, add them with their signs. Compare that sum with the species charge shown outside the structure.',
        'The prerequisite is reading positive, negative, and zero formal charges with their signs.',
        'Example: if a species is written with an overall +1 charge, all atom formal charges together must sum to +1.',
        'Think of each atom charge as a receipt line. The bottom-line total of all receipts must match the charge printed on the whole species.'
      ),
      FUNCTIONAL_GROUP:p(
        'Alcohol functional group',
        'CH3CH2OH contains an O-H group attached to carbon. That connectivity is the alcohol functional group.',
        'Find the oxygen, then check whether it is directly bonded to hydrogen and carbon.',
        'The prerequisite is reading condensed connectivity, especially that OH means O-H at the end of this formula.',
        'Example: CH3OH also contains C-O-H and is an alcohol.',
        'Circle the O-H pair as one recognizable chunk. That circled connection is the alcohol clue.'
      )
    })
  });

  function plan(lessonId,errorCode){var lesson=PLANS[lessonId]||{};return lesson[errorCode]||null;}
  function reasonLabel(reason){var x=REASONS.find(function(r){return r.id===reason;});return x?x.label:reason;}
  function text(lessonId,errorCode,reason){
    var x=plan(lessonId,errorCode);if(!x)return null;
    if(reason==='dont_understand_concept')return x.concept;
    if(reason==='dont_know_how_to_start')return x.start;
    if(reason==='forgot_prerequisite')return x.prerequisite;
    if(reason==='started_but_stuck')return 'Keep any earlier work you know is correct. Repair only '+x.label.toLowerCase()+'. '+x.start;
    if(reason==='show_me_example')return x.example;
    if(reason==='explanation_not_making_sense')return x.alternate;
    return x.concept;
  }
  return Object.freeze({REASONS:REASONS,plan:plan,text:text,reasonLabel:reasonLabel});
});