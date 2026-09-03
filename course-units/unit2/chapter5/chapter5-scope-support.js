(function(root,factory){
  var base=typeof module==='object'&&module.exports?require('./chapter5-support.js'):root.Chapter5AdaptiveSupport;
  var api=factory(base);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else{root.Chapter5CoreSupport=base;root.Chapter5AdaptiveSupport=api;root.Chapter5ScopeSupport=api;}
})(typeof globalThis!=='undefined'?globalThis:this,function(Base){
'use strict';if(!Base)throw new Error('Chapter 5 core support missing');
var EXTRA_LABELS=Object.freeze({SPECIFIC_ROTATION_SETUP:'specific-rotation setup',EE_DIFFERENCE:'enantiomeric-excess difference',EE_COMPOSITION:'enantiomer composition',CHIRALITY_WITHOUT_CENTER:'whole-molecule chirality test',AXIAL_ALLENE:'allene axial-chirality check',DYNAMIC_CONFORMER:'configuration versus conformation'});
var FIRST=Object.freeze({
SPECIFIC_ROTATION_SETUP:'Write [α] = αobs/(l·c). Put observed rotation on top. Put path length in dm and concentration in g/mL together in the denominator before calculating.',
EE_DIFFERENCE:'Write the two enantiomer percentages under each other and subtract minor from major. Do not add them; their sum is already 100%.',
EE_COMPOSITION:'Use two facts at once: major + minor = 100 and major - minor = ee. Solve by major=(100+ee)/2.',
CHIRALITY_WITHOUT_CENTER:'Ignore center-counting for a moment. Compare the entire 3D molecule with its mirror image and ask whether they superimpose.',
AXIAL_ALLENE:'Look at one allene end at a time. Each terminal carbon needs two different substituents before the axis can carry handedness.',
DYNAMIC_CONFORMER:'Ask what motion connects the two shapes. If ordinary low-barrier bond rotation converts one into the other, treat them as interconverting conformations rather than automatically as stable configurations.'
});
var PREREQ=Object.freeze({
SPECIFIC_ROTATION_SETUP:'Prerequisite: distinguish observed rotation, path length, and concentration as three different measured quantities before using the specific-rotation equation.',
EE_DIFFERENCE:'Prerequisite: percentages of the two enantiomers must add to 100%. Then ee measures their imbalance.',
EE_COMPOSITION:'Prerequisite: solve a two-number sum-and-difference relationship: the two percentages sum to 100 and differ by ee.',
CHIRALITY_WITHOUT_CENTER:'Prerequisite: chirality is defined by mirror-image superposition, not by the presence of a particular atom.',
AXIAL_ALLENE:'Prerequisite: identify the two substituents attached to each terminal carbon of the allene.',
DYNAMIC_CONFORMER:'Prerequisite: distinguish conformational change by ordinary bond rotation from a change in fixed configuration.'
});
var EXAMPLE=Object.freeze({
SPECIFIC_ROTATION_SETUP:'Example: αobs=+4°, l=1 dm, c=0.20 g/mL gives [α]=+4/(1×0.20)=+20.',
EE_DIFFERENCE:'Example: 70% major and 30% minor gives 40% ee because 70−30=40.',
EE_COMPOSITION:'Example: 50% ee gives major=(100+50)/2=75% and minor=25%.',
CHIRALITY_WITHOUT_CENTER:'Example: some substituted allenes are chiral even though no tetrahedral carbon has four different groups; the handedness is organized around an axis.',
AXIAL_ALLENE:'Example: an allene with H/CH3 on one end and Cl/Br on the other has two different groups at each end, so axial chirality can be possible.',
DYNAMIC_CONFORMER:'Example: two mirror-image conformations that rapidly exchange through easy bond rotation are snapshots of one conformationally mobile system, not automatically isolable enantiomers.'
});
var ALT=Object.freeze({
SPECIFIC_ROTATION_SETUP:'Switch representation: use a fraction card. Put αobs in the top box. Put l and c in two multiplied boxes underneath. Fill the boxes before doing arithmetic.',
EE_DIFFERENCE:'Switch representation: picture 100 molecules as tokens. Put the major enantiomer tokens in one pile and minor tokens in the other. The extra unmatched major tokens are the ee percentage.',
EE_COMPOSITION:'Switch representation: draw a 100-unit bar. Start with 50/50, then move half of the ee amount from the minor side to the major side.',
CHIRALITY_WITHOUT_CENTER:'Switch representation: replace the stereocenter checklist with a mirror test. Draw the whole object and its mirror, then ask only whether ordinary rotation can superimpose them.',
AXIAL_ALLENE:'Switch representation: look straight down the C=C=C axis like a Newman-style view. Check whether the two labels at the front differ and the two labels at the back differ.',
DYNAMIC_CONFORMER:'Switch representation: draw two boxes labeled SNAPSHOT A and SNAPSHOT B with a rotation arrow between them. If ordinary bond rotation connects them easily, the arrow represents conformational interconversion, not a new fixed configuration.'
});
function isExtra(code){return Object.prototype.hasOwnProperty.call(EXTRA_LABELS,code);}
function label(code){return isExtra(code)?EXTRA_LABELS[code]:Base.label(code);}
function text(lesson,code,reason,fieldLabel){if(!isExtra(code))return Base.text(lesson,code,reason,fieldLabel);var fallback=lesson&&lesson.reteach&&lesson.reteach[code]||FIRST[code];if(reason==='dont_understand_concept')return fallback;if(reason==='dont_know_how_to_start')return 'Start with only '+label(code)+'. '+FIRST[code];if(reason==='forgot_prerequisite')return PREREQ[code];if(reason==='started_but_stuck')return 'Keep the part you already did. Repair only '+label(code)+'. '+FIRST[code];if(reason==='show_me_example')return EXAMPLE[code];if(reason==='explanation_not_making_sense')return ALT[code];return fallback;}
function route(lesson,code,reason,fieldLabel){if(!isExtra(code))return Base.route(lesson,code,reason,fieldLabel);return{errorCode:code,label:label(code),reason:reason,text:text(lesson,code,reason,fieldLabel),foundationHref:null};}
var labels={};Object.keys(Base.LABELS||{}).forEach(function(k){labels[k]=Base.LABELS[k];});Object.keys(EXTRA_LABELS).forEach(function(k){labels[k]=EXTRA_LABELS[k];});
return Object.freeze({REASONS:Base.REASONS,LABELS:Object.freeze(labels),label:label,text:text,route:route});
});
