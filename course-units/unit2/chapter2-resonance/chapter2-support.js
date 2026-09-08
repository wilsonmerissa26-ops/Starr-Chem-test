(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.Chapter2AdaptiveSupport=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
var REASONS=Object.freeze([
 Object.freeze({id:'dont_understand_concept',label:'I do not understand the concept'}),
 Object.freeze({id:'dont_know_how_to_start',label:'I do not know how to start'}),
 Object.freeze({id:'forgot_prerequisite',label:'I forgot a prerequisite'}),
 Object.freeze({id:'started_but_stuck',label:'I started but got stuck'}),
 Object.freeze({id:'show_me_example',label:'Show me another example'}),
 Object.freeze({id:'explanation_not_making_sense',label:'The explanation is not making sense'})
]);
var LABELS=Object.freeze({
 RANK_VALIDITY:'resonance validity before ranking',RANK_OCTET:'octet comparison',RANK_CHARGE_SEPARATION:'charge-separation comparison',RANK_ELECTRONEGATIVITY:'charge placement and electronegativity',RANK_EQUIVALENT:'equivalent-contributor recognition',
 HYBRID_NOT_SWITCHING:'resonance hybrid meaning',HYBRID_EQUIVALENT_BONDS:'equivalent bonds in the hybrid',HYBRID_PARTIAL_BOND:'partial bond character',HYBRID_PARTIAL_CHARGE:'partial charge distribution',HYBRID_WEIGHT:'contributor weighting',
 LONE_PAIR_ADJACENCY:'lone-pair adjacency',CONJUGATION_INTERRUPTED:'conjugation interruption',LONE_PAIR_VALIDITY:'valid lone-pair resonance move',LONE_PAIR_DELOCALIZED:'localized versus delocalized lone pair',
 ARROW_SOURCE:'curved-arrow source',ARROW_DESTINATION:'curved-arrow destination',ARROW_CONNECTIVITY:'fixed sigma connectivity',ARROW_OCTET:'octet-preserving companion move',
 TRANSFER_FIRST_STEP:'first resonance step on an unfamiliar structure',TRANSFER_INVARIANT:'fixed resonance invariant',TRANSFER_VALIDATION:'formal-charge and octet validation',TRANSFER_RANK:'contributor ranking into the hybrid',CONNECTIVITY_FIXED:'fixed atom connectivity',PKA_DIRECTION:'pKa direction'
});
var FIRST=Object.freeze({
 RANK_VALIDITY:'Freeze the atom identities and sigma-bond skeleton first. If a hydrogen or other atom moved to a new neighbor, stop: that drawing is not resonance.',
 RANK_OCTET:'Compare the carbon octet before worrying about smaller preferences. A normal second-row carbon with eight electrons is usually a much stronger contributor than a comparable six-electron carbon.',
 RANK_CHARGE_SEPARATION:'After octets are comparable, count unnecessary separated formal charges. Less charge separation is usually favored.',
 RANK_ELECTRONEGATIVITY:'For otherwise comparable forms, place negative charge on the more electronegative atom and positive charge on the less electronegative atom when possible.',
 RANK_EQUIVALENT:'Look for a symmetry operation or exchange of identical atom roles. If it converts one contributor into the other, their weights are equal.',
 HYBRID_NOT_SWITCHING:'Contributors are drawings, not molecules taking turns. The real molecule has one resonance hybrid electron distribution.',
 HYBRID_EQUIVALENT_BONDS:'If equal contributors place a pi bond in equivalent positions, the real hybrid makes those bonds equivalent rather than permanently single versus double.',
 HYBRID_PARTIAL_BOND:'Shared pi electron density gives partial multiple-bond character to more than one bond.',
 HYBRID_PARTIAL_CHARGE:'When equivalent contributors place charge on different equivalent atoms, the hybrid shares that charge over those atoms.',
 HYBRID_WEIGHT:'The hybrid is weighted toward the more stable contributors. Equal contributors contribute equally; unequal contributors do not.',
 LONE_PAIR_ADJACENCY:'First ask whether the lone-pair atom is directly next to a compatible pi bond or p orbital.',
 CONJUGATION_INTERRUPTED:'An intervening saturated sp3 carbon usually breaks continuous p-orbital overlap.',
 LONE_PAIR_VALIDITY:'Test the lone pair by drawing a valid electron move while keeping atom connectivity fixed.',
 LONE_PAIR_DELOCALIZED:'A lone pair is delocalized when valid contributors place that electron density over multiple connected positions.',
 ARROW_SOURCE:'Find the actual electrons first. The tail belongs on a lone pair or pi bond, never on a plus sign.',
 ARROW_DESTINATION:'Follow the electron pair to the atom or bond that receives it. That receiving location is where the arrow head points.',
 ARROW_CONNECTIVITY:'Resonance arrows may change pi bonds and lone-pair placement, but not the sigma skeleton.',
 ARROW_OCTET:'If forming a new pi bond would overfill carbon, move an existing adjacent pi pair away in the same step.',
 TRANSFER_FIRST_STEP:'On a new structure, identify a real adjacent electron source and test one valid resonance move before trying to rank anything.',
 TRANSFER_INVARIANT:'No matter how unfamiliar the molecule looks, atoms stay connected to the same neighbors across resonance contributors.',
 TRANSFER_VALIDATION:'After each proposed move, check formal charges, octets, and the total molecular charge before accepting the contributor.',
 TRANSFER_RANK:'Only after contributors are valid should you rank them and translate those weights into the hybrid.'
});
var ALT=Object.freeze({
 RANK_VALIDITY:'Switch representation: make two lists labeled ATOM NEIGHBORS. If the neighbor lists differ between drawings, they are not resonance contributors.',
 RANK_OCTET:'Switch representation: put an electron-count box over the key carbon. Write 8 in one contributor and 6 in the other before comparing anything else.',
 RANK_CHARGE_SEPARATION:'Switch representation: circle every formal charge in each contributor. Compare the number of separated + and - charges after octets are checked.',
 RANK_ELECTRONEGATIVITY:'Switch representation: place C and O on a simple electronegativity ladder. Ask which atom better stabilizes extra electron density.',
 RANK_EQUIVALENT:'Switch representation: cover the left/right orientation and relabel identical atoms A and B. If swapping A and B creates the other form, they tie.',
 HYBRID_NOT_SWITCHING:'Switch representation: draw one molecule in the center and contributor sketches around it like evidence cards. The center molecule is the real hybrid.',
 HYBRID_EQUIVALENT_BONDS:'Switch representation: replace single/double labels with two identical partial-bond bars. Equal contributors produce equal bars.',
 HYBRID_PARTIAL_BOND:'Switch representation: use a bond-order slider between single and double. Delocalization can place the real bond between those endpoints.',
 HYBRID_PARTIAL_CHARGE:'Switch representation: split one negative-charge token across the equivalent atoms rather than parking it permanently on one atom.',
 HYBRID_WEIGHT:'Switch representation: use a balance scale. Larger contributors get heavier weights and pull the hybrid closer to their features.',
 LONE_PAIR_ADJACENCY:'Switch representation: highlight only adjacent atom pairs. If the lone-pair atom and pi system are separated by another saturated atom, stop.',
 CONJUGATION_INTERRUPTED:'Switch representation: draw a row of p orbitals. An sp3 carbon is the missing link that breaks the continuous row.',
 LONE_PAIR_VALIDITY:'Switch representation: make a before/after neighbor list plus electron arrows. If neighbors change, the move is not resonance.',
 LONE_PAIR_DELOCALIZED:'Switch representation: color the same electron pair in every valid contributor position. Multiple valid positions means delocalized.',
 ARROW_SOURCE:'Switch representation: label SOURCES and SINKS. Lone pairs and pi bonds go under SOURCES; positive centers can be SINKS but not electron sources.',
 ARROW_DESTINATION:'Switch representation: trace one pair as a token from its starting box into the receiving atom/bond box.',
 ARROW_CONNECTIVITY:'Switch representation: lock every sigma bond in gray. Only the colored lone-pair and pi-electron marks are allowed to move.',
 ARROW_OCTET:'Switch representation: give carbon eight electron slots. If a new pair enters, another pair must leave before the move can be valid.',
 TRANSFER_FIRST_STEP:'Switch representation: use a four-box workflow - freeze connectivity, find electrons, test one move, validate the result.',
 TRANSFER_INVARIANT:'Switch representation: write the atom-neighbor table once and keep it beside every contributor. The table must never change.',
 TRANSFER_VALIDATION:'Switch representation: run a checklist after the arrow move: connectivity same, octets allowed, formal charges recalculated, total charge conserved.',
 TRANSFER_RANK:'Switch representation: sort only the already-valid contributors into larger, smaller, or equivalent piles before drawing hybrid features.'
});
var EXAMPLE=Object.freeze({
 RANK_OCTET:'Example: neutral C=O usually contributes more than C+ - O- because the neutral form gives carbon a full octet and avoids charge separation.',
 RANK_EQUIVALENT:'Example: the two carboxylate drawings that exchange identical oxygens are equivalent and contribute equally.',
 HYBRID_EQUIVALENT_BONDS:'Example: carboxylate has two equivalent C-O bonds in the hybrid, each with partial double-bond character.',
 LONE_PAIR_DELOCALIZED:'Example: an amide nitrogen lone pair can form C=N while the C=O pi pair moves to oxygen, so that lone pair is delocalized.',
 CONJUGATION_INTERRUPTED:'Example: lone pair - CH2 - C=C is not directly conjugated through the saturated CH2 center.',
 ARROW_SOURCE:'Example: an allyl anion resonance arrow starts at the carbon lone pair, not at the minus sign.',
 ARROW_OCTET:'Example: when O- forms a new C=O, the old C=O pi pair moves onto the other oxygen so carbon stays at an octet.',
 TRANSFER_RANK:'Example: after generating three valid contributors, first identify any equivalent forms, then rank non-equivalent forms before describing the hybrid.'
});
function label(code){return LABELS[code]||String(code||'reasoning step').toLowerCase().replace(/_/g,' ');}
function foundationHref(code){if(code==='PKA_DIRECTION')return'../../../day4/';return'../../../day3/';}
function text(lesson,code,reason,fieldLabel){var fallback=lesson&&lesson.reteach&&lesson.reteach[code]||FIRST[code]||'Return to the first chemical decision and rebuild it one step at a time.';if(reason==='dont_understand_concept')return fallback;if(reason==='dont_know_how_to_start')return 'Start with only '+label(code)+'. '+(FIRST[code]||fallback);if(reason==='forgot_prerequisite')return 'Prerequisite repair: '+(code==='PKA_DIRECTION'?'review pKa direction before continuing.':'review Day 3 resonance rules: electrons move, atoms do not; arrow tails start at electrons; formal charge and total charge must remain valid.');if(reason==='started_but_stuck')return 'Keep the part you already completed. Repair only '+label(code)+'. '+(FIRST[code]||fallback);if(reason==='show_me_example')return EXAMPLE[code]||('Example focus: '+fallback);if(reason==='explanation_not_making_sense')return ALT[code]||('Switch representation: '+fallback);return fallback;}
function route(lesson,code,reason,fieldLabel){return{errorCode:code,label:label(code),reason:reason,text:text(lesson,code,reason,fieldLabel),foundationHref:reason==='forgot_prerequisite'?foundationHref(code):null};}
return Object.freeze({REASONS:REASONS,LABELS:LABELS,label:label,text:text,route:route});
});