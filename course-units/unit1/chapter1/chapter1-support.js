(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.Chapter1TeachingSupport=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
var ROUTES={
  lewis:{
    dont_understand_concept:{code:'TOTAL_ELECTRONS',text:'Lewis structures are electron bookkeeping pictures. First find the total electron budget. Bonds spend two electrons each. Whatever electrons remain must be placed as lone pairs while hydrogen reaches 2 electrons and the common second-row atoms used here reach an octet.'},
    dont_know_how_to_start:{code:'TOTAL_ELECTRONS',text:'Do only the first decision: count the total valence electrons. Do not draw bonds yet. Write the electron budget first, then the rest of the structure has a number it must obey.'},
    forgot_prerequisite:{code:'VALENCE_COUNT',text:'The prerequisite is the neutral-atom valence count. For today: H=1, C=4, N=5, O=6. Use the Periodic Table button if you do not remember one of them.'},
    started_but_stuck:{code:'REMAINING_ELECTRONS',text:'Keep the work you already trust. Count how many electrons your drawn bonds have used, subtract that from the original valence-electron total, then place only the electrons that remain.'},
    show_me_example:{code:'LONE_PAIR_COUNT',text:'Similar example: NH₃ has 8 total valence electrons. Three N–H bonds use 6. The 2 electrons left over become one lone pair on nitrogen. The pattern is total → bonds used → electrons left → lone pairs.'},
    explanation_not_making_sense:{code:'TOTAL_ELECTRONS',text:'Switch representations: think of valence electrons as a fixed budget. Bonds cost 2 electrons each. Lone pairs also use 2. A valid Lewis structure balances the budget exactly; you cannot spend electrons you did not count or leave counted electrons missing.'}
  },
  'formal-charge':{
    dont_understand_concept:{code:'FORMAL_CHARGE',text:'Formal charge is bookkeeping, not a claim about the atom’s real partial charge. Pretend every bond is split evenly, then compare what the atom owns in the drawing with how many valence electrons the neutral atom normally starts with.'},
    dont_know_how_to_start:{code:'VALENCE_COUNT',text:'Make four small boxes: V, N, B, FC. Fill only V first from the neutral atom. Then count nonbonding electrons for N, total bond order for B, and calculate FC last.'},
    forgot_prerequisite:{code:'NONBONDING_ELECTRONS',text:'The prerequisite is electron and bond-order counting. One lone pair = 2 nonbonding electrons. Single/double/triple bonds contribute 1/2/3 to total bond order.'},
    started_but_stuck:{code:'FORMAL_CHARGE',text:'Do not restart. Keep any V, N, or B value you know is correct. Find the first uncertain box, repair only that box, then compute V − N − B.'},
    show_me_example:{code:'FORMAL_CHARGE',text:'Similar example: oxygen in H₃O⁺ has V=6, one lone pair so N=2, and three single bonds so B=3. FC = 6 − 2 − 3 = +1.'},
    explanation_not_making_sense:{code:'NONBONDING_MEANING',text:'Switch representations: “Start − dots − lines.” Start = neutral valence electrons. Dots = individual nonbonding electrons, not pairs. Lines = total bond order. That sentence is only a map for FC = V − N − B.'}
  }
};
function route(lessonId,reason){var lesson=ROUTES[lessonId]||{};return lesson[reason]||null;}
return Object.freeze({route:route});
});