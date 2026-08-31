(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.Chapter1TeachingData=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function f(id,label,accepted,errorCode){return Object.freeze({id:id,label:label,accepted:accepted,errorCode:errorCode});}
  function item(id,prompt,fields,why){return Object.freeze({id:id,prompt:prompt,fields:Object.freeze(fields),why:why||''});}

  var LEWIS=Object.freeze({
    id:'lewis',lessonId:'chm221.ch1.lewis',skillId:'chem.ch1.lewis_structures',
    title:'Valence Electrons → Lewis Structures → Lone Pairs',
    subtitle:'Build the electron-counting foundation before formal charge.',
    source:'Chapter 1 review · frozen Day 1 chemistry curriculum',
    watch:Object.freeze([
      Object.freeze({title:'Start with valence electrons',text:'Valence electrons are the outer-shell electrons available for bonding. For the common atoms used here: H = 1, C = 4, N = 5, O = 6.',visual:'H 1 · C 4 · N 5 · O 6'}),
      Object.freeze({title:'Use one repeatable Lewis method',text:'1) Count total valence electrons. 2) Arrange atoms; hydrogen is never central. 3) Connect with single bonds. 4) Place lone pairs on outer atoms, then the central atom. 5) Check that every electron you counted is actually drawn.',visual:'COUNT → CONNECT → PLACE → CHECK'}),
      Object.freeze({title:'Watch methane, CH₄',text:'Carbon contributes 4 electrons and four hydrogens contribute 4 more, for 8 total. Four C–H bonds use all 8 electrons. Carbon has an octet and each hydrogen has 2 electrons.',visual:'CH₄ · 8 e⁻ · 4 bonds'}),
      Object.freeze({title:'Watch ammonia, NH₃',text:'Nitrogen contributes 5 and three hydrogens contribute 3, for 8 total. Three N–H bonds use 6 electrons. The remaining 2 electrons make one lone pair on nitrogen.',visual:'NH₃ · 8 e⁻ · 1 lone pair on N'})
    ]),
    concept:Object.freeze([
      item('L-C1','How many valence electrons does neutral oxygen contribute?',[f('v','Valence electrons',['6'],'VALENCE_COUNT')]),
      item('L-C2','One lone pair contains how many electrons?',[f('n','Electrons',['2'],'LONE_PAIR_COUNT')]),
      item('L-C3','Hydrogen is full with how many electrons around it?',[f('h','Electrons',['2'],'HYDROGEN_SHELL')])
    ]),
    build:Object.freeze([
      item('L-B1','Build H₂O with me. H₂O has how many total valence electrons?',[f('total','Total valence electrons',['8'],'TOTAL_ELECTRONS')]),
      item('L-B2','Two O–H single bonds use how many electrons total?',[f('used','Bonding electrons used',['4'],'BOND_ELECTRONS')]),
      item('L-B3','After those two bonds, how many electrons remain?',[f('remaining','Electrons remaining',['4'],'REMAINING_ELECTRONS')]),
      item('L-B4','Those 4 remaining electrons become how many lone pairs on oxygen?',[f('pairs','Lone pairs on O',['2'],'LONE_PAIR_COUNT')])
    ]),
    guided:Object.freeze([
      item('L-G1','Guided CH₃OH: how many total valence electrons are available?',[f('total','Total valence electrons',['14'],'TOTAL_ELECTRONS')]),
      item('L-G2','CH₃OH has five single bonds. How many electrons do those bonds use?',[f('used','Bonding electrons used',['10'],'BOND_ELECTRONS')]),
      item('L-G3','After the five bonds, how many electrons remain, and how many lone pairs does that make on oxygen?',[f('remaining','Electrons remaining',['4'],'REMAINING_ELECTRONS'),f('pairs','Lone pairs on O',['2'],'LONE_PAIR_COUNT')])
    ]),
    independent:Object.freeze([
      item('L-I1','Draw/check CH₃NH₂ from electron bookkeeping. Enter the totals below.',[f('total','Total valence electrons',['14'],'TOTAL_ELECTRONS'),f('bonds','Number of single bonds',['6'],'BOND_COUNT'),f('pairs','Lone pairs on N',['1'],'LONE_PAIR_COUNT')]),
      item('L-I2','Draw/check CH₃OCH₃. Enter the electron bookkeeping.',[f('total','Total valence electrons',['20'],'TOTAL_ELECTRONS'),f('bonds','Number of single bonds',['8'],'BOND_COUNT'),f('pairs','Lone pairs on O',['2'],'LONE_PAIR_COUNT')]),
      item('L-I3','Draw/check HCN. Enter the electron bookkeeping.',[f('total','Total valence electrons',['10'],'TOTAL_ELECTRONS'),f('bondOrder','Total bond order in H–C≡N',['4'],'BOND_ORDER'),f('pairs','Lone pairs on N',['1'],'LONE_PAIR_COUNT')]),
      item('L-I4','Draw/check NH₂OH. Enter the lone-pair counts after completing octets.',[f('total','Total valence electrons',['14'],'TOTAL_ELECTRONS'),f('nPairs','Lone pairs on N',['1'],'N_LONE_PAIRS'),f('oPairs','Lone pairs on O',['2'],'O_LONE_PAIRS')])
    ]),
    explanation:Object.freeze({prompt:'Explain why your Lewis structure is valid. Connect the total valence-electron count, electrons used in bonds, and where the remaining electrons go.',requiredGroups:Object.freeze([Object.freeze(['valence','total']),Object.freeze(['bond','bonds']),Object.freeze(['remain','lone pair','lone pairs'])])}),
    transfer:Object.freeze([
      item('L-T1','Transfer: H₂NNH₂ has one N–N bond and four N–H bonds. How many lone pairs are on each nitrogen?',[f('pairs','Lone pairs on each N',['1'],'LONE_PAIR_COUNT')]),
      item('L-T2','Fresh transfer: in H₂O₂, each oxygen has two single bonds. How many lone pairs are on each oxygen?',[f('pairs','Lone pairs on each O',['2'],'LONE_PAIR_COUNT')])
    ]),
    intervening:item('L-A1','Different chemistry switch: a saturated acyclic alkane has 4 carbon atoms. What is its molecular formula?',[f('formula','Formula',['c4h10','C4H10'],'ALKANE_FORMULA')]),
    retrieval:Object.freeze([
      item('L-R1','Later retrieval: CH₃OCH₃. Without notes, how many total valence electrons and how many lone pairs are on oxygen?',[f('total','Total valence electrons',['20'],'TOTAL_ELECTRONS'),f('pairs','Lone pairs on O',['2'],'LONE_PAIR_COUNT')]),
      item('L-R2','Fresh later retrieval: HCN. Without notes, how many total valence electrons and how many lone pairs are on nitrogen?',[f('total','Total valence electrons',['10'],'TOTAL_ELECTRONS'),f('pairs','Lone pairs on N',['1'],'LONE_PAIR_COUNT')])
    ]),
    repairChecks:Object.freeze({
      TOTAL_ELECTRONS:item('L-RP1','Quick repair check: H₂O has how many total valence electrons?',[f('x','Total valence electrons',['8'],'TOTAL_ELECTRONS')]),
      VALENCE_COUNT:item('L-RP2','Quick repair check: neutral nitrogen contributes how many valence electrons?',[f('x','Valence electrons',['5'],'VALENCE_COUNT')]),
      LONE_PAIR_COUNT:item('L-RP3','Quick repair check: 4 nonbonding electrons make how many lone pairs?',[f('x','Lone pairs',['2'],'LONE_PAIR_COUNT')]),
      BOND_ELECTRONS:item('L-RP4','Quick repair check: three single bonds contain how many bonding electrons?',[f('x','Bonding electrons',['6'],'BOND_ELECTRONS')]),
      BOND_COUNT:item('L-RP5','Quick repair check: CH₄ contains how many C–H bonds?',[f('x','Bonds',['4'],'BOND_COUNT')]),
      BOND_ORDER:item('L-RP6','Quick repair check: one double bond plus one single bond gives what total bond order?',[f('x','Bond order',['3'],'BOND_ORDER')]),
      REMAINING_ELECTRONS:item('L-RP7','Quick repair check: 14 total electrons minus 10 electrons used in bonds leaves how many?',[f('x','Electrons remaining',['4'],'REMAINING_ELECTRONS')]),
      N_LONE_PAIRS:item('L-RP8','Quick repair check: neutral nitrogen with three single bonds usually has how many lone pairs?',[f('x','Lone pairs',['1'],'N_LONE_PAIRS')]),
      O_LONE_PAIRS:item('L-RP9','Quick repair check: neutral oxygen with two single bonds usually has how many lone pairs?',[f('x','Lone pairs',['2'],'O_LONE_PAIRS')]),
      HYDROGEN_SHELL:item('L-RP10','Quick repair check: hydrogen is full with how many electrons?',[f('x','Electrons',['2'],'HYDROGEN_SHELL')])
    }),
    reteach:Object.freeze({TOTAL_ELECTRONS:'Add the neutral-atom valence electrons first. Do not count bonds until you know the electron budget.',VALENCE_COUNT:'Use the periodic-table group pattern for the common main-group atoms: H 1, C 4, N 5, O 6.',LONE_PAIR_COUNT:'One lone pair is two electrons. Count remaining electrons first, then group them into pairs.',BOND_ELECTRONS:'Each ordinary bond line contains two electrons.',BOND_COUNT:'Count every connection once. A single bond is one bond line.',BOND_ORDER:'Single = 1, double = 2, triple = 3. Add bond order, not just neighboring atoms.',REMAINING_ELECTRONS:'Subtract electrons already used in bonds from the total valence-electron budget.',N_LONE_PAIRS:'Neutral nitrogen in these examples commonly has three bonds and one lone pair.',O_LONE_PAIRS:'Neutral oxygen in these examples commonly has two bonds and two lone pairs.',HYDROGEN_SHELL:'Hydrogen follows a duet, not an octet. It is full with 2 electrons.',ALKANE_FORMULA:'A saturated acyclic alkane follows CnH2n+2. With n=4, the formula is C4H10.'})
  });

  var FORMAL=Object.freeze({
    id:'formal-charge',lessonId:'chm221.ch1.formal_charge',skillId:'chem.ch1.formal_charge',
    title:'Formal Charge',subtitle:'Electron ownership → FC = V − N − B → whole-structure check.',
    source:'Chapter 1 review · frozen Day 2 formal-charge curriculum',
    prerequisite:Object.freeze([
      item('F-P1','An oxygen is drawn with two lone pairs. How many nonbonding electrons are shown?',[f('n','Nonbonding electrons',['4'],'NONBONDING_ELECTRONS')]),
      item('F-P2','A nitrogen has three single bonds. What is its total bond order?',[f('b','Total bond order',['3'],'BOND_ORDER')])
    ]),
    watch:Object.freeze([
      Object.freeze({title:'Formal charge is bookkeeping',text:'Pretend every covalent bond is split evenly. Each atom owns all of its lone-pair electrons plus one electron from each bond line. Formal charge compares that bookkeeping ownership with the atom’s normal neutral valence count.',visual:'ownership, not partial charge'}),
      Object.freeze({title:'Build the shortcut',text:'FC = valence electrons − nonbonding electrons − total bond order. Learner cue: Start − dots − lines. Dots means nonbonding electrons, not number of lone pairs.',visual:'FC = V − N − B'}),
      Object.freeze({title:'Worked carbon example',text:'Carbon in CH₄: V = 4, N = 0, B = 4. FC = 4 − 0 − 4 = 0.',visual:'4 − 0 − 4 = 0'}),
      Object.freeze({title:'Worked oxygen example',text:'Oxygen in H₃O⁺: V = 6, one lone pair means N = 2, and three single bonds mean B = 3. FC = 6 − 2 − 3 = +1.',visual:'6 − 2 − 3 = +1'}),
      Object.freeze({title:'Always do the whole-structure check',text:'After assigning every atom, add the signed formal charges. Their sum must equal the overall charge written on the molecule or ion.',visual:'Σ formal charges = species charge'})
    ]),
    concept:Object.freeze([
      item('F-C1','In FC = V − N − B, does N mean lone pairs or nonbonding electrons?',[f('n','Type',['nonbonding electrons','nonbonding electron','electrons'],'NONBONDING_MEANING')]),
      item('F-C2','One double bond contributes what value to B?',[f('b','Bond order',['2'],'BOND_ORDER')]),
      item('F-C3','If all atom formal charges are added, what must that total equal?',[f('sum','Total',['overall charge','species charge','molecule charge','ion charge'],'SUM_CHECK')])
    ]),
    build:Object.freeze([
      item('F-B1','Build hydroxide, OH⁻. What is oxygen’s neutral valence-electron count V?',[f('v','V',['6'],'VALENCE_COUNT')]),
      item('F-B2','Oxygen has three lone pairs in OH⁻. How many nonbonding electrons N?',[f('n','N',['6'],'NONBONDING_ELECTRONS')]),
      item('F-B3','One O–H single bond contributes what total bond order B?',[f('b','B',['1'],'BOND_ORDER')]),
      item('F-B4','Now calculate FC = 6 − 6 − 1.',[f('fc','Formal charge',['-1','−1'],'FORMAL_CHARGE')])
    ]),
    guided:Object.freeze([
      item('F-G1','Guided: nitrogen in NH₄⁺ has four single bonds and no lone pairs. Enter V, N, B, and FC.',[f('v','V',['5'],'VALENCE_COUNT'),f('n','N',['0'],'NONBONDING_ELECTRONS'),f('b','B',['4'],'BOND_ORDER'),f('fc','FC',['+1','1+','1'],'FORMAL_CHARGE')]),
      item('F-G2','Guided: carbonyl oxygen has one double bond and two lone pairs. Enter V, N, B, and FC.',[f('v','V',['6'],'VALENCE_COUNT'),f('n','N',['4'],'NONBONDING_ELECTRONS'),f('b','B',['2'],'BOND_ORDER'),f('fc','FC',['0'],'FORMAL_CHARGE')])
    ]),
    independent:Object.freeze([
      item('F-I1','N in NH₄⁺: four single bonds, no lone pairs. Enter V, N, B, FC.',[f('v','V',['5'],'VALENCE_COUNT'),f('n','N',['0'],'NONBONDING_ELECTRONS'),f('b','B',['4'],'BOND_ORDER'),f('fc','FC',['+1','1+','1'],'FORMAL_CHARGE')]),
      item('F-I2','O in a carbonyl: one double bond, two lone pairs. Enter V, N, B, FC.',[f('v','V',['6'],'VALENCE_COUNT'),f('n','N',['4'],'NONBONDING_ELECTRONS'),f('b','B',['2'],'BOND_ORDER'),f('fc','FC',['0'],'FORMAL_CHARGE')]),
      item('F-I3','C with three single bonds and one lone pair. Enter V, N, B, FC.',[f('v','V',['4'],'VALENCE_COUNT'),f('n','N',['2'],'NONBONDING_ELECTRONS'),f('b','B',['3'],'BOND_ORDER'),f('fc','FC',['-1','−1'],'FORMAL_CHARGE')]),
      item('F-I4','N with three single bonds and one lone pair. Enter V, N, B, FC.',[f('v','V',['5'],'VALENCE_COUNT'),f('n','N',['2'],'NONBONDING_ELECTRONS'),f('b','B',['3'],'BOND_ORDER'),f('fc','FC',['0'],'FORMAL_CHARGE')])
    ]),
    explanation:Object.freeze({prompt:'Explain the formal-charge calculation using V, N, and B. Name what each number represents before giving the arithmetic.',requiredGroups:Object.freeze([Object.freeze(['valence','v']),Object.freeze(['nonbonding','lone pair','n']),Object.freeze(['bond order','bonds','b']),Object.freeze(['formal charge','fc'])])}),
    transfer:Object.freeze([
      item('F-T1','Transfer: methylammonium CH₃NH₃⁺. Nitrogen has four single bonds and no lone pair. What is nitrogen’s formal charge and what is the whole-species charge?',[f('nfc','N formal charge',['+1','1+','1'],'FORMAL_CHARGE'),f('sum','Species charge',['+1','1+','1'],'SUM_CHECK')]),
      item('F-T2','Fresh transfer: NH₂⁻ has two N–H single bonds and two lone pairs. What is nitrogen’s formal charge?',[f('nfc','N formal charge',['-1','−1'],'FORMAL_CHARGE')])
    ]),
    intervening:item('F-A1','Different chemistry switch: what functional group is present in CH₃CH₂OH?',[f('fg','Functional group',['alcohol','hydroxyl'],'FUNCTIONAL_GROUP')]),
    retrieval:Object.freeze([
      item('F-R1','Later retrieval: oxygen has one double bond, one single bond, and one lone pair. Enter V, N, B, FC.',[f('v','V',['6'],'VALENCE_COUNT'),f('n','N',['2'],'NONBONDING_ELECTRONS'),f('b','B',['3'],'BOND_ORDER'),f('fc','FC',['+1','1+','1'],'FORMAL_CHARGE')]),
      item('F-R2','Fresh later retrieval: carbon has one triple bond and one single bond, no lone pairs. Enter V, N, B, FC.',[f('v','V',['4'],'VALENCE_COUNT'),f('n','N',['0'],'NONBONDING_ELECTRONS'),f('b','B',['4'],'BOND_ORDER'),f('fc','FC',['0'],'FORMAL_CHARGE')])
    ]),
    repairChecks:Object.freeze({VALENCE_COUNT:item('F-RP1','Quick repair check: neutral oxygen has what V value?',[f('x','V',['6'],'VALENCE_COUNT')]),NONBONDING_ELECTRONS:item('F-RP2','Quick repair check: three lone pairs contain how many nonbonding electrons?',[f('x','N',['6'],'NONBONDING_ELECTRONS')]),NONBONDING_MEANING:item('F-RP3','Quick repair check: in FC = V − N − B, N counts what?',[f('x','Meaning',['nonbonding electrons','electrons'],'NONBONDING_MEANING')]),BOND_ORDER:item('F-RP4','Quick repair check: one double bond plus one single bond gives what B?',[f('x','B',['3'],'BOND_ORDER')]),FORMAL_CHARGE:item('F-RP5','Quick repair check: V=6, N=4, B=2. What is FC?',[f('x','FC',['0'],'FORMAL_CHARGE')]),SUM_CHECK:item('F-RP6','Quick repair check: the sum of atom formal charges must equal what?',[f('x','Total',['overall charge','species charge','ion charge','molecule charge'],'SUM_CHECK')]),FUNCTIONAL_GROUP:item('F-RP7','Quick repair check: CH₃CH₂OH is what functional group?',[f('x','Group',['alcohol','hydroxyl'],'FUNCTIONAL_GROUP')])}),
    reteach:Object.freeze({VALENCE_COUNT:'V is the neutral free atom’s valence-electron count. Use the periodic table rather than memorizing a charge pattern.',NONBONDING_ELECTRONS:'N counts electrons, not lone pairs. One lone pair = 2 nonbonding electrons.',NONBONDING_MEANING:'In FC = V − N − B, N means nonbonding electrons.',BOND_ORDER:'B is total bond order attached to the atom: single 1, double 2, triple 3.',FORMAL_CHARGE:'Keep the correct V, N, and B and recompute V − N − B. Watch the sign.',SUM_CHECK:'The signed sum of all atom formal charges must match the overall species charge.',FUNCTIONAL_GROUP:'CH₃CH₂OH contains an O–H group attached to carbon, so it is an alcohol.'})
  });

  var LESSONS=Object.freeze([LEWIS,FORMAL]);
  function lesson(id){return LESSONS.find(function(x){return x.id===id;})||null;}
  return Object.freeze({LESSONS:LESSONS,lesson:lesson});
});