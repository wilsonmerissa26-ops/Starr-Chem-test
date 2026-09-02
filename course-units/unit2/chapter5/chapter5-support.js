(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.Chapter5AdaptiveSupport=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';

var REASONS=Object.freeze([
  {id:'dont_understand_concept',label:"I don't understand the concept"},
  {id:'dont_know_how_to_start',label:"I don't know how to start"},
  {id:'forgot_prerequisite',label:'I forgot something I need first'},
  {id:'started_but_stuck',label:'I started, but I got stuck'},
  {id:'show_me_example',label:'Show me a similar example'},
  {id:'explanation_not_making_sense',label:"The explanation isn't making sense"}
]);

var LABELS=Object.freeze({
  CONNECTIVITY_FIRST:'connectivity check',STEREO_DEFINITION:'stereoisomer definition',SAME_MOLECULE:'same-molecule check',
  FOUR_DIFFERENT:'four-different-substituent check',MIRROR_TEST:'mirror-image superposition test',
  CIP_PRIORITY:'CIP priority',CIP_TIE:'CIP tie break',RS_ORIENTATION:'R/S orientation',
  REL_ALL_INVERT:'all-centers relationship',REL_SOME_INVERT:'partial-inversion relationship',REL_IDENTICAL:'identical-structure check',
  MESO_CONCEPT:'meso concept',SYMMETRY_REQUIRED:'whole-molecule symmetry check',
  FISCHER_GEOMETRY:'Fischer 3D geometry',FISCHER_ROTATION:'Fischer rotation rule',FISCHER_SWAP:'Fischer swap rule',
  EZ_ELIGIBILITY:'E/Z eligibility',EZ_PRIORITY:'alkene CIP priority',EZ_SIDE:'E/Z side comparison',
  RS_NOT_SIGN:'R/S versus optical sign',RACEMIC:'racemic-mixture concept',ENANTIOMER_ROTATION:'enantiomer optical rotation'
});

var FIRST=Object.freeze({
  CONNECTIVITY_FIRST:'Trace which atom is connected to which before looking at wedges, dashes, cis/trans, or drawing orientation.',
  STEREO_DEFINITION:'First prove the connectivity is the same. Then ask whether a fixed three-dimensional arrangement is different.',
  SAME_MOLECULE:'Try a legal rotation or superposition before calling the second drawing a new compound.',
  FOUR_DIFFERENT:'Stand at the tetrahedral carbon and trace all four substituent paths. Stop as soon as two paths are identical.',
  MIRROR_TEST:'Compare the molecule with its mirror image as 3D objects and ask whether every atom can superimpose.',
  CIP_PRIORITY:'Compare only the atoms directly attached to the stereocenter first. Higher atomic number gets higher priority.',
  CIP_TIE:'When the first atoms tie, move one layer outward and compare the attached-atom lists at the first point of difference.',
  RS_ORIENTATION:'Locate priority 4 before reading clockwise/counterclockwise. Put 4 away or plan to invert the visible result.',
  REL_ALL_INVERT:'Write the R/S labels for both molecules in matching columns and compare every center.',
  REL_SOME_INVERT:'Mark which stereocenters changed and which stayed the same. Some-but-not-all change is the key pattern.',
  REL_IDENTICAL:'Ignore picture orientation and compare connectivity plus configuration at every corresponding center.',
  MESO_CONCEPT:'Separate the local question (are there stereocenters?) from the whole-molecule question (is the mirror image superimposable?).',
  SYMMETRY_REQUIRED:'Inspect the complete framework for a real internal symmetry relationship. Opposite R/S labels by themselves are not enough.',
  FISCHER_GEOMETRY:'Translate the cross into 3D first: horizontal bonds come toward you and vertical bonds go away.',
  FISCHER_ROTATION:'Ask whether the move preserves horizontal-versus-vertical roles. A 180-degree turn does; a 90-degree turn does not.',
  FISCHER_SWAP:'Count swaps. One swap inverts configuration; two swaps restore the original parity.',
  EZ_ELIGIBILITY:'Inspect each alkene carbon separately. Each one must have two different substituents for E/Z to exist.',
  EZ_PRIORITY:'Choose the higher-priority substituent independently on the left alkene carbon and on the right alkene carbon.',
  EZ_SIDE:'After priorities are chosen, compare only the two high-priority groups: same side Z, opposite side E.',
  RS_NOT_SIGN:'Keep the naming systems separate: R/S comes from structural priority rules; optical + or - comes from experiment.',
  RACEMIC:'Check the composition first. Equal amounts of the two enantiomers make a racemic mixture.',
  ENANTIOMER_ROTATION:'Under the same conditions, enantiomers rotate by equal magnitude in opposite directions.'
});

var PREREQ=Object.freeze({
  CONNECTIVITY_FIRST:'Prerequisite: reliable bond-line connectivity reading. If line ends and vertices are not automatic, use the Bond-Line lesson first.',
  STEREO_DEFINITION:'Prerequisite: distinguish same connectivity from different connectivity before comparing 3D arrangement.',
  SAME_MOLECULE:'Prerequisite: recognize that rotation around ordinary single bonds can change a drawing without changing connectivity.',
  FOUR_DIFFERENT:'Prerequisite: read the full substituent path from a tetrahedral carbon, including implied carbons in bond-line notation.',
  MIRROR_TEST:'Prerequisite: understand that drawing orientation can change while molecular identity stays the same.',
  CIP_PRIORITY:'Prerequisite: identify the atom directly bonded to the stereocenter before comparing substituents.',
  CIP_TIE:'Prerequisite: stable first-atom CIP comparison. Only move outward after a true tie.',
  RS_ORIENTATION:'Prerequisite: priorities 1-4 must already be correct before assigning R/S.',
  REL_ALL_INVERT:'Prerequisite: assign or read R/S at each stereocenter first.',
  REL_SOME_INVERT:'Prerequisite: compare configurations center by center, not picture by picture.',
  REL_IDENTICAL:'Prerequisite: same connectivity must be established before stereochemical identity is compared.',
  MESO_CONCEPT:'Prerequisite: distinguish a stereocenter from whole-molecule chirality.',
  SYMMETRY_REQUIRED:'Prerequisite: identify corresponding halves/paths in the molecular framework.',
  FISCHER_GEOMETRY:'Prerequisite: tetrahedral stereocenter geometry and toward/away bond meaning.',
  FISCHER_ROTATION:'Prerequisite: horizontal Fischer bonds are toward and vertical bonds are away.',
  FISCHER_SWAP:'Prerequisite: understand that exchanging two groups changes stereochemical parity.',
  EZ_ELIGIBILITY:'Prerequisite: identify the two substituents attached to each alkene carbon.',
  EZ_PRIORITY:'Prerequisite: basic CIP priority rules from the R/S skill.',
  EZ_SIDE:'Prerequisite: correctly choose one higher-priority group on each alkene carbon.',
  RS_NOT_SIGN:'Prerequisite: R/S is a structural descriptor assigned from CIP rules.',
  RACEMIC:'Prerequisite: recognize the two members of an enantiomeric pair.',
  ENANTIOMER_ROTATION:'Prerequisite: understand that enantiomers are non-superimposable mirror images.'
});

var EXAMPLE=Object.freeze({
  CONNECTIVITY_FIRST:'Example: 1-bromopropane and 2-bromopropane share a formula but Br is connected to a different carbon, so they are constitutional isomers.',
  STEREO_DEFINITION:'Example: cis-2-butene and trans-2-butene keep the same atom connectivity but differ in fixed 3D arrangement, so they are stereoisomers.',
  SAME_MOLECULE:'Example: two staggered drawings of the same open-chain alkane can look different after bond rotation while still representing the same molecule.',
  FOUR_DIFFERENT:'Example: carbon 2 of 2-butanol is attached to H, OH, CH3, and CH2CH3, four different paths, so it is a stereocenter.',
  MIRROR_TEST:'Example: a left hand and right hand are mirror images but cannot superimpose; that is the chirality idea.',
  CIP_PRIORITY:'Example: for directly attached Br, O, C, and H, the priority order is Br > O > C > H by atomic number.',
  CIP_TIE:'Example: if two substituents both begin with C, compare the atoms attached to those carbons in descending atomic-number order until a difference appears.',
  RS_ORIENTATION:'Example: with priority 4 away, clockwise 1-2-3 is R. If 4 were toward you, the same visible clockwise path would be S after inversion.',
  REL_ALL_INVERT:'Example: in an unsymmetrical two-center molecule, R,R versus S,S is an all-inverted enantiomer pattern.',
  REL_SOME_INVERT:'Example: R,R versus R,S changes only one center, so the pair is diastereomeric.',
  REL_IDENTICAL:'Example: R,S and another legal drawing that is also R,S at the same centers may be identical even if the pictures face different directions.',
  MESO_CONCEPT:'Example: meso-2,3-dibromobutane contains two stereocenters but the symmetric whole molecule is achiral.',
  SYMMETRY_REQUIRED:'Example: an R,S label pattern in an unsymmetrical framework is not automatically meso because the two halves may not map onto each other.',
  FISCHER_GEOMETRY:'Example: in a Fischer projection, left/right groups project toward you; top/bottom groups project away.',
  FISCHER_ROTATION:'Example: turn the whole Fischer cross 180 degrees and horizontal groups remain horizontal and vertical remain vertical; 90 degrees swaps those roles.',
  FISCHER_SWAP:'Example: one swap of two groups inverts a Fischer stereocenter; making a second swap restores the original configuration relationship.',
  EZ_ELIGIBILITY:'Example: CH2=CHCl has two identical H groups on one alkene carbon, so E/Z is not defined.',
  EZ_PRIORITY:'Example: if one alkene carbon bears Cl and CH3, Cl is the higher-priority group because Cl has higher atomic number than C.',
  EZ_SIDE:'Example: once high-priority groups are chosen, opposite sides give E and same side gives Z.',
  RS_NOT_SIGN:'Example: an R enantiomer can be + or - experimentally. The R label alone does not tell you the optical sign.',
  RACEMIC:'Example: 50% one enantiomer plus 50% the other is racemic and has zero ideal net rotation.',
  ENANTIOMER_ROTATION:'Example: if one pure enantiomer rotates +12 degrees under fixed conditions, the other rotates -12 degrees under the same conditions.'
});

var ALT=Object.freeze({
  CONNECTIVITY_FIRST:'Switch representation: number the atoms and write a neighbor list for each structure. Compare neighbor lists instead of pictures.',
  STEREO_DEFINITION:'Switch representation: use a two-row table: connectivity SAME? then 3D arrangement SAME? Only the second row is stereochemistry.',
  SAME_MOLECULE:'Switch representation: imagine the structure made from a molecular model kit. Rotate bonds and the whole model before deciding the models differ.',
  FOUR_DIFFERENT:'Switch representation: draw four boxes around the candidate carbon and write one substituent path in each box. Cross out the center if any boxes match.',
  MIRROR_TEST:'Switch representation: use a glove/hand model. Mirror it, then test whether ordinary rotation can place every feature on top of the original.',
  CIP_PRIORITY:'Switch representation: make four element cards for the directly attached atoms and sort them by atomic number before looking at the rest of each group.',
  CIP_TIE:'Switch representation: build a comparison tree. First atoms tie -> write the next-shell atom lists -> sort each list -> compare at the first difference.',
  RS_ORIENTATION:'Switch representation: hide priorities 1-3 for a moment and mark only group 4 as TOWARD or AWAY. Then restore 1-3 and trace the turn.',
  REL_ALL_INVERT:'Switch representation: create a center-by-center table with molecule A and molecule B. Circle every R<->S change.',
  REL_SOME_INVERT:'Switch representation: use green marks for centers that stay and red marks for centers that invert. A mix of green and red means diastereomers.',
  REL_IDENTICAL:'Switch representation: ignore wedges temporarily and compare connectivity, then write the final R/S list for each structure side by side.',
  MESO_CONCEPT:'Switch representation: use two layers: LOCAL centers first, WHOLE-MOLECULE symmetry second. The second layer decides chirality.',
  SYMMETRY_REQUIRED:'Switch representation: draw a candidate mirror line/plane and test whether every atom/group on one side maps to the matching group on the other.',
  FISCHER_GEOMETRY:'Switch representation: hold your hands like a cross: left/right point toward your face, top/bottom point away. Map the Fischer groups onto those directions.',
  FISCHER_ROTATION:'Switch representation: mark H for horizontal and V for vertical on the four positions. Rotate 180 versus 90 and see which move preserves H/V roles.',
  FISCHER_SWAP:'Switch representation: count swaps with tokens. Odd number of swaps inverts; even number preserves.',
  EZ_ELIGIBILITY:'Switch representation: draw two boxes, one for each alkene carbon. Put its two substituents in the box and check whether the pair is different.',
  EZ_PRIORITY:'Switch representation: rank only the left carbon pair first, then only the right carbon pair. Do not compare groups across the double bond.',
  EZ_SIDE:'Switch representation: circle the winner on each alkene carbon. Now cover every other group and compare only the two circles.',
  RS_NOT_SIGN:'Switch representation: use two separate cards: CONFIGURATION = R/S from structure; ROTATION = +/- from experiment. Never move an answer from one card to the other.',
  RACEMIC:'Switch representation: picture 100 molecules: 50 of one enantiomer and 50 of the other. Equal opposite rotations cancel.',
  ENANTIOMER_ROTATION:'Switch representation: put the rotations on a number line. Enantiomers under the same conditions sit at equal distances on opposite sides of zero.'
});

var LINKS=Object.freeze({
  CONNECTIVITY_FIRST:'../../unit1/bond-line/',STEREO_DEFINITION:'../../unit1/bond-line/',SAME_MOLECULE:'../../unit1/bond-line/',FOUR_DIFFERENT:'../../unit1/bond-line/'
});

function label(code){return LABELS[code]||String(code||'skill').replace(/_/g,' ').toLowerCase();}
function text(lesson,errorCode,reason,fieldLabel){
  var base=(lesson&&lesson.reteach&&lesson.reteach[errorCode])||'Repair this exact step before moving on.';
  var name=label(errorCode);
  if(reason==='dont_understand_concept')return base;
  if(reason==='dont_know_how_to_start')return 'Start with only '+name+'. '+(FIRST[errorCode]||base);
  if(reason==='forgot_prerequisite')return PREREQ[errorCode]||base;
  if(reason==='started_but_stuck')return 'Keep the steps you know. Do not restart the entire problem. Repair only '+name+'. '+(FIRST[errorCode]||base);
  if(reason==='show_me_example')return EXAMPLE[errorCode]||base;
  if(reason==='explanation_not_making_sense')return ALT[errorCode]||base;
  return base;
}
function route(lesson,errorCode,reason,fieldLabel){return{errorCode:errorCode,label:label(errorCode),reason:reason,text:text(lesson,errorCode,reason,fieldLabel),foundationHref:reason==='forgot_prerequisite'?(LINKS[errorCode]||null):null};}

return Object.freeze({REASONS:REASONS,LABELS:LABELS,label:label,text:text,route:route});
});
