(function(root,factory){
  var core=typeof module==='object'&&module.exports?require('./chapter5-data.js'):root.Chapter5AdaptiveData;
  var api=factory(core);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else{root.Chapter5CoreData=core;root.Chapter5AdaptiveData=api;root.Chapter5ScopeData=api;}
})(typeof globalThis!=='undefined'?globalThis:this,function(Core){
'use strict';
if(!Core)throw new Error('Chapter 5 core curriculum missing');
function f(id,label,accepted,errorCode){return Object.freeze({id:id,label:label,accepted:Object.freeze(accepted),errorCode:errorCode});}
function q(id,prompt,fields,tags,visual){return Object.freeze({id:id,prompt:prompt,fields:Object.freeze(fields),tags:Object.freeze(tags||[]),visual:visual||null});}
function w(title,text,visual,check){return Object.freeze({title:title,text:text,visual:visual||null,check:check||null});}
function freezeLesson(x){['probe','watch','concept','build','guided','independent','transfer','retrieval','requiredTags','prerequisites'].forEach(function(k){x[k]=Object.freeze(x[k]||[]);});x.repairChecks=Object.freeze(x.repairChecks||{});x.reteach=Object.freeze(x.reteach||{});return Object.freeze(x);}

var MIX=freezeLesson({
  id:'enantiomer-mixtures-quantitative',skillId:'u2.c5.enantiomer_mixtures_quantitative',title:'Specific Rotation and Enantiomeric Excess',chapter:'Chapter 5',priority:2,
  prerequisites:['optical-activity'],requiredTags:['specific-rotation','ee'],
  objective:'Calculate specific rotation, enantiomeric excess, and enantiomer composition while keeping measured rotation separate from R/S configuration.',
  probe:[
    q('MX-P1','A sample has observed rotation +4.0°, path length 1.0 dm, and concentration 0.20 g/mL. Using [α] = αobs/(l·c), what is the specific rotation?',[f('a','Specific rotation',['20','+20','20 degrees','+20 degrees'],'SPECIFIC_ROTATION_SETUP')],['specific-rotation'],'polarimetry-equation-a'),
    q('MX-P2','A mixture is 70% one enantiomer and 30% the other. What is the enantiomeric excess?',[f('a','ee',['40','40%','40 percent'],'EE_DIFFERENCE')],['ee'],'ee-balance-a')
  ],
  watch:[
    w('Specific rotation normalizes the measurement','Observed rotation depends on how much material the light passes through and how concentrated the solution is. Divide observed rotation by path length in dm and concentration in g/mL: [α] = αobs/(l·c).','specific rotation equation: observed rotation divided by path length times concentration',q('MX-W1','If αobs = +6°, l = 2 dm, and c = 0.50 g/mL, what is [α]?',[f('a','Specific rotation',['6','+6','6 degrees','+6 degrees'],'SPECIFIC_ROTATION_SETUP')],['specific-rotation'],'polarimetry-equation-b')),
    w('Enantiomeric excess measures imbalance','ee is the absolute difference between the percentages of the two enantiomers. For a two-enantiomer mixture, %major = (100 + ee)/2 and %minor = (100 - ee)/2.','ee = major percent minus minor percent',q('MX-W2','A sample is 80% major enantiomer and 20% minor. What is ee?',[f('a','ee',['60','60%','60 percent'],'EE_DIFFERENCE')],['ee'],'ee-balance-b'))
  ],
  concept:[
    q('MX-C1','In the specific-rotation equation, observed rotation is divided by path length and what other quantity?',[f('a','Quantity',['concentration','c','sample concentration'],'SPECIFIC_ROTATION_SETUP')],['specific-rotation']),
    q('MX-C2','For a two-enantiomer mixture, ee is the difference between the major and minor percentages. Yes or no?',[f('a','Answer',['yes','y'],'EE_DIFFERENCE')],['ee'])
  ],
  build:[
    q('MX-B1','Build the calculation: αobs = -3.0°, l = 1.0 dm, c = 0.25 g/mL. What denominator l·c do you use?',[f('a','l·c',['0.25','.25'],'SPECIFIC_ROTATION_SETUP')],['specific-rotation']),
    q('MX-B2','Using that denominator, what is the specific rotation?',[f('a','Specific rotation',['-12','−12','-12 degrees'],'SPECIFIC_ROTATION_SETUP')],['specific-rotation'])
  ],
  guided:[
    q('MX-G1','Guided: a mixture is 65% major and 35% minor. Calculate ee.',[f('a','ee',['30','30%','30 percent'],'EE_DIFFERENCE')],['ee'],'ee-balance-c'),
    q('MX-G2','Guided: a sample has 50% ee. What percentage is the major enantiomer?',[f('a','Major enantiomer',['75','75%','75 percent'],'EE_COMPOSITION')],['ee'],'ee-composition-a')
  ],
  independent:[
    q('MX-I1','Cold: αobs = +2.4°, l = 2.0 dm, c = 0.20 g/mL. Calculate [α].',[f('a','Specific rotation',['6','+6','6 degrees','+6 degrees'],'SPECIFIC_ROTATION_SETUP')],['specific-rotation'],'polarimetry-independent-a'),
    q('MX-I2','Cold: a sample is 90% one enantiomer and 10% the other. Calculate ee.',[f('a','ee',['80','80%','80 percent'],'EE_DIFFERENCE')],['ee'],'ee-balance-independent-a'),
    q('MX-I3','Cold: a two-enantiomer mixture has 36% ee. What percentage is the major enantiomer?',[f('a','Major enantiomer',['68','68%','68 percent'],'EE_COMPOSITION')],['ee'],'ee-composition-independent-a'),
    q('MX-I4','Cold: αobs = -5.0°, l = 1.0 dm, c = 0.40 g/mL. Calculate [α].',[f('a','Specific rotation',['-12.5','−12.5','-12.5 degrees'],'SPECIFIC_ROTATION_SETUP')],['specific-rotation'],'polarimetry-independent-b')
  ],
  explanation:{prompt:'Explain why observed rotation must be normalized by path length and concentration to get specific rotation, and explain how enantiomeric excess measures the imbalance between two enantiomers.',requiredGroups:[['observed rotation','alpha'],['path length','concentration'],['specific rotation'],['major','minor','difference','excess']]},
  transfer:[q('MX-T1','Transfer: a two-enantiomer sample is 84% major and 16% minor. What is ee?',[f('a','ee',['68','68%','68 percent'],'EE_DIFFERENCE')],['ee'],'ee-transfer-a')],
  intervening:q('MX-A1','Different skill: Does an R descriptor by itself predict positive optical rotation?',[f('a','Answer',['no','n'],'RS_NOT_SIGN')]),
  retrieval:[
    q('MX-R1','Later: αobs = +3.0°, l = 1.5 dm, c = 0.20 g/mL. Calculate [α].',[f('a','Specific rotation',['10','+10','10 degrees','+10 degrees'],'SPECIFIC_ROTATION_SETUP')],['specific-rotation'],'polarimetry-retrieval-a'),
    q('MX-R2','Later: a sample is 72% major and 28% minor. Calculate ee.',[f('a','ee',['44','44%','44 percent'],'EE_DIFFERENCE')],['ee'],'ee-retrieval-a')
  ],
  repairChecks:{
    SPECIFIC_ROTATION_SETUP:q('MX-RP1','Repair check: in [α] = αobs/(l·c), do path length and concentration belong in the numerator or denominator?',[f('a','Place',['denominator','bottom'],'SPECIFIC_ROTATION_SETUP')]),
    EE_DIFFERENCE:q('MX-RP2','Repair check: for 60% major and 40% minor, what is major minus minor?',[f('a','Difference',['20','20%','20 percent'],'EE_DIFFERENCE')]),
    EE_COMPOSITION:q('MX-RP3','Repair check: if ee = 0%, what must the two enantiomer percentages be?',[f('a','Composition',['50/50','50 50','50% and 50%','50 and 50'],'EE_COMPOSITION')])
  },
  reteach:{
    SPECIFIC_ROTATION_SETUP:'Separate the measured angle from the standardized property. Put the measured rotation on top, then divide by path length in dm times concentration in g/mL.',
    EE_DIFFERENCE:'Picture a 100-molecule sample. ee is how many more molecules of the major enantiomer exist than the minor enantiomer, expressed as a percentage.',
    EE_COMPOSITION:'For two enantiomers, the percentages add to 100 and their difference is ee. Solve those two facts together: major=(100+ee)/2 and minor=(100-ee)/2.'
  }
});

var OTHER=freezeLesson({
  id:'other-chirality',skillId:'u2.c5.other_chirality',title:'Chirality Without a Tetrahedral Stereocenter',chapter:'Chapter 5',priority:2,
  prerequisites:['chirality-stereocenters','stereoisomer-relationships'],requiredTags:['axial-chirality','dynamic-chirality'],
  objective:'Recognize that chirality is a whole-molecule property, including axial chirality and mirror-image conformations that may interconvert.',
  probe:[
    q('OC-P1','Must every chiral molecule contain a tetrahedral carbon stereocenter?',[f('a','Answer',['no','n'],'CHIRALITY_WITHOUT_CENTER')],['axial-chirality']),
    q('OC-P2','An allene has two different substituents on each terminal carbon. Can that arrangement support axial chirality?',[f('a','Answer',['yes','y'],'AXIAL_ALLENE')],['axial-chirality'],'allene-axis-a')
  ],
  watch:[
    w('Chirality belongs to the whole 3D object','A tetrahedral stereocenter is a common source of chirality, not the definition of chirality. A molecule is chiral when its mirror image is non-superimposable, and that can happen around an axis as well as around a single carbon center.','whole molecule mirror-image test, not center counting',q('OC-W1','If a molecule has no tetrahedral stereocenter, is it automatically achiral?',[f('a','Answer',['no','n'],'CHIRALITY_WITHOUT_CENTER')],['axial-chirality'],'chirality-whole-object-a')),
    w('A snapshot is not always an isolable stereoisomer','Some conformations can look like non-superimposable mirror images at one instant but interconvert rapidly through ordinary conformational motion. Ask whether the forms are stable distinct configurations or merely interconverting conformers.','mirror-image conformers may interconvert',q('OC-W2','If two mirror-image conformations rapidly interconvert by ordinary bond rotation, should you automatically treat the snapshots as separately isolable enantiomers?',[f('a','Answer',['no','n'],'DYNAMIC_CONFORMER')],['dynamic-chirality'],'dynamic-mirror-a'))
  ],
  concept:[
    q('OC-C1','What defines chirality: possessing a tetrahedral carbon center, or being non-superimposable on the mirror image?',[f('a','Definition',['non-superimposable mirror image','not superimposable on mirror image','mirror image non-superimposable','non superimposable'],'CHIRALITY_WITHOUT_CENTER')],['axial-chirality']),
    q('OC-C2','When mirror-image shapes interconvert rapidly through ordinary conformational motion, what must you check before calling them distinct stable stereoisomers?',[f('a','Check',['whether they interconvert','interconversion','barrier to interconversion','stable configurations','isolable'],'DYNAMIC_CONFORMER')],['dynamic-chirality'])
  ],
  build:[
    q('OC-B1','Build the allene check: each terminal carbon of C=C=C has two substituents. For axial chirality, should the two substituents on each end be different or identical?',[f('a','Requirement',['different','two different','different substituents'],'AXIAL_ALLENE')],['axial-chirality'],'allene-axis-b'),
    q('OC-B2','If both ends satisfy that different-substituent condition, can the allene have non-superimposable mirror images even without a tetrahedral chiral carbon?',[f('a','Answer',['yes','y'],'AXIAL_ALLENE')],['axial-chirality'])
  ],
  guided:[
    q('OC-G1','Guided: an allene has H and CH3 on one terminal carbon, and Cl and Br on the other. Are the substituents on each end different enough to make axial chirality possible?',[f('a','Answer',['yes','y'],'AXIAL_ALLENE')],['axial-chirality'],'allene-guided-a'),
    q('OC-G2','Guided: two mirror-image conformations are connected by a very low-barrier ordinary bond rotation. Distinct isolable enantiomers or rapidly interconverting conformers?',[f('a','Classification',['rapidly interconverting conformers','interconverting conformers','conformers'],'DYNAMIC_CONFORMER')],['dynamic-chirality'],'dynamic-guided-a')
  ],
  independent:[
    q('OC-I1','Cold: Can a molecule be chiral because of an axis even when it has no tetrahedral stereocenter?',[f('a','Answer',['yes','y'],'CHIRALITY_WITHOUT_CENTER')],['axial-chirality'],'allene-independent-a'),
    q('OC-I2','Cold: one terminal carbon of an allene has two identical methyl groups. Is axial chirality from that allene axis possible?',[f('a','Answer',['no','n'],'AXIAL_ALLENE')],['axial-chirality'],'allene-independent-b'),
    q('OC-I3','Cold: two mirror-image conformations rapidly interconvert by ordinary rotation. Are they necessarily a pair of stable, separately isolable enantiomers?',[f('a','Answer',['no','n'],'DYNAMIC_CONFORMER')],['dynamic-chirality'],'dynamic-independent-a'),
    q('OC-I4','Cold: what whole-molecule test still decides chirality even when no tetrahedral stereocenter is present?',[f('a','Test',['mirror image superposition','superimposable on mirror image','non-superimposable mirror image','mirror-image test'],'CHIRALITY_WITHOUT_CENTER')],['dynamic-chirality'])
  ],
  explanation:{prompt:'Explain how a molecule can be chiral without a tetrahedral stereocenter, and explain why rapidly interconverting mirror-image conformations are not automatically separately isolable enantiomers.',requiredGroups:[['mirror','non-superimposable','chirality'],['axis','allene','without stereocenter'],['interconvert','rotation','conformation'],['stable','isolable','configuration']]},
  transfer:[q('OC-T1','Transfer: an allene has F/Cl at one terminal carbon and H/CH3 at the other. Can axial chirality be possible?',[f('a','Answer',['yes','y'],'AXIAL_ALLENE')],['axial-chirality'],'allene-transfer-a')],
  intervening:q('OC-A1','Different skill: a molecule with stereocenters and a real internal symmetry plane can be what special achiral type?',[f('a','Type',['meso','meso compound'],'MESO_CONCEPT')]),
  retrieval:[
    q('OC-R1','Later: Is a tetrahedral stereocenter required for every possible kind of molecular chirality?',[f('a','Answer',['no','n'],'CHIRALITY_WITHOUT_CENTER')],['axial-chirality']),
    q('OC-R2','Later: mirror-image conformations connected by easy ordinary bond rotation are best treated as stable enantiomers or interconverting conformers?',[f('a','Classification',['interconverting conformers','conformers','rapidly interconverting conformers'],'DYNAMIC_CONFORMER')],['dynamic-chirality'],'dynamic-retrieval-a')
  ],
  repairChecks:{
    CHIRALITY_WITHOUT_CENTER:q('OC-RP1','Repair check: is chirality defined by center-counting or by mirror-image superposition?',[f('a','Definition',['mirror-image superposition','mirror image superposition','superposition','mirror-image test'],'CHIRALITY_WITHOUT_CENTER')]),
    AXIAL_ALLENE:q('OC-RP2','Repair check: for an allene axis to support chirality, must each terminal carbon have two different substituents?',[f('a','Answer',['yes','y'],'AXIAL_ALLENE')]),
    DYNAMIC_CONFORMER:q('OC-RP3','Repair check: if two shapes convert into each other by easy ordinary bond rotation, are they conformations or constitutional isomers?',[f('a','Classification',['conformations','conformers','conformational isomers'],'DYNAMIC_CONFORMER')])
  },
  reteach:{
    CHIRALITY_WITHOUT_CENTER:'Stop counting chiral carbons and return to the definition: compare the entire molecule with its mirror image. Non-superimposable mirror images can arise from an axis as well as a tetrahedral center.',
    AXIAL_ALLENE:'Picture the allene as two perpendicular terminal planes. If either end has two identical groups, the axial handedness collapses; each end needs two different substituents.',
    DYNAMIC_CONFORMER:'Separate configuration from conformation. If ordinary low-barrier motion converts the mirror-image shapes into one another, the snapshots are not automatically stable isolable enantiomers.'
  }
});

var extra=Object.freeze({'enantiomer-mixtures-quantitative':MIX,'other-chirality':OTHER});
var lessons={};Object.keys(Core.LESSONS).forEach(function(k){lessons[k]=Core.LESSONS[k];});Object.keys(extra).forEach(function(k){lessons[k]=extra[k];});lessons=Object.freeze(lessons);
var order=Object.freeze(Core.ORDER.concat(['enantiomer-mixtures-quantitative','other-chirality']));
var checkpoints=Object.freeze(Core.PRODUCTION_CHECKPOINTS.concat([
  Object.freeze({id:'C5-D9',skill:'stereoisomer-relationships',task:'Construct or select the mirror-image enantiomer by inverting every stereocenter while preserving connectivity.',grading:'structured configuration selection; not arbitrary handwriting'}),
  Object.freeze({id:'C5-D10',skill:'fischer-projections',task:'Convert a fresh wedge-dash stereocenter to a Fischer projection while preserving the same absolute configuration.',grading:'structured directional placement'}),
  Object.freeze({id:'C5-D11',skill:'enantiomer-mixtures-quantitative',task:'Complete a specific-rotation setup by placing observed rotation, path length, and concentration in the correct equation positions.',grading:'structured equation placement'}),
  Object.freeze({id:'C5-D12',skill:'other-chirality',task:'Inspect an allene and identify whether both terminal carbons meet the different-substituent requirement for axial chirality.',grading:'structured substituent comparison'})
]));
var meta=Object.freeze(Object.assign({},Core.META,{status:'current-5e-scope-authored-not-live',scopeNote:'Core stereoisomerism plus current 5e SkillBuilder coverage for specific rotation, enantiomeric excess, Fischer conversion, enantiomer construction, and other chirality.'}));
function lesson(id){return lessons[id]||null;}function lessonIds(){return order.slice();}function all(){return order.map(function(id){return lessons[id];});}
return Object.freeze({META:meta,LESSONS:lessons,ORDER:order,PRODUCTION_CHECKPOINTS:checkpoints,lesson:lesson,lessons:all,lessonIds:lessonIds});
});
