(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.Chapter5AdaptiveData=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';

function f(id,label,accepted,errorCode){return Object.freeze({id:id,label:label,accepted:Object.freeze(accepted),errorCode:errorCode});}
function q(id,prompt,fields,tags,visual){return Object.freeze({id:id,prompt:prompt,fields:Object.freeze(fields),tags:Object.freeze(tags||[]),visual:visual||null});}
function w(title,text,visual,check){return Object.freeze({title:title,text:text,visual:visual||null,check:check||null});}
function freezeLesson(x){x.probe=Object.freeze(x.probe||[]);x.watch=Object.freeze(x.watch||[]);x.concept=Object.freeze(x.concept||[]);x.build=Object.freeze(x.build||[]);x.guided=Object.freeze(x.guided||[]);x.independent=Object.freeze(x.independent||[]);x.transfer=Object.freeze(x.transfer||[]);x.retrieval=Object.freeze(x.retrieval||[]);x.requiredTags=Object.freeze(x.requiredTags||[]);x.prerequisites=Object.freeze(x.prerequisites||[]);x.repairChecks=Object.freeze(x.repairChecks||{});x.reteach=Object.freeze(x.reteach||{});return Object.freeze(x);}

var META=Object.freeze({
  course:'CHM 221 Organic Chemistry',
  unit:'Unit 2 / Test 2',
  chapter:'Chapter 5: Stereoisomerism',
  syllabusWeek:'2026-09-07',
  test2Week:'2026-09-28',
  status:'curriculum-authored-not-live',
  sourceNote:'Dr. Meadows Fall 2026 syllabus controls schedule; Canvas and Mercer email control live changes.',
  engineBoundary:'Reuse the locked adaptive lesson and shared Student Model. This data file defines curriculum only.'
});

var LESSONS=Object.freeze({

'isomer-classification':freezeLesson({
  id:'isomer-classification',skillId:'u2.c5.isomer_classification',title:'Identical vs Constitutional vs Stereoisomers',chapter:'Chapter 5',priority:1,
  prerequisites:['bond-line','constitutional-isomers'],
  objective:'Classify a pair only after checking molecular formula, connectivity, and then three-dimensional arrangement.',requiredTags:['connectivity','stereo'],
  probe:[
    q('IC-P1','Two compounds have the same molecular formula but different atom connectivity. What relationship do they have?',[f('a','Relationship',['constitutional isomers','constitutional','structural isomers'],'CONNECTIVITY_FIRST')],['connectivity']),
    q('IC-P2','Two nonidentical compounds have the same connectivity but differ in a fixed three-dimensional arrangement. What relationship do they have?',[f('a','Relationship',['stereoisomers','stereo isomers','stereoisomer'],'STEREO_DEFINITION')],['stereo'])
  ],
  watch:[
    w('Ask connectivity before shape','Same formula is only the starting point. If connectivity changes, stop: they are constitutional isomers. Only when connectivity is the same should three-dimensional arrangement decide whether the pair is stereoisomeric.','decision: formula -> connectivity -> 3D',q('IC-W1','Same formula, different connectivity: constitutional isomers or stereoisomers?',[f('a','Choice',['constitutional isomers','constitutional'],'CONNECTIVITY_FIRST')])),
    w('Redrawing is not a new compound','Rotation around ordinary single bonds or turning a drawing on the page can make one molecule look different without changing its identity.','same connectivity + superimposable = identical',q('IC-W2','If two drawings become the same molecule after a legal rotation and superposition, are they identical or stereoisomers?',[f('a','Choice',['identical','same molecule','same'],'SAME_MOLECULE')]))
  ],
  concept:[
    q('IC-C1','What feature changes in constitutional isomers: connectivity or only 3D arrangement?',[f('a','Feature',['connectivity','bonding connectivity','which atoms are connected'],'CONNECTIVITY_FIRST')]),
    q('IC-C2','What feature stays the same in stereoisomers?',[f('a','Feature',['connectivity','atom connectivity','bonding connectivity'],'STEREO_DEFINITION')])
  ],
  build:[
    q('IC-B1','Build the decision: 1-bromopropane and 2-bromopropane have the same formula. Does their connectivity match?',[f('a','Answer',['no','n'],'CONNECTIVITY_FIRST')]),
    q('IC-B2','Because their connectivity differs, classify 1-bromopropane and 2-bromopropane.',[f('a','Relationship',['constitutional isomers','constitutional'],'CONNECTIVITY_FIRST')],['connectivity'])
  ],
  guided:[
    q('IC-G1','Guided: cis-1,2-dimethylcyclohexane and trans-1,2-dimethylcyclohexane have the same atom connectivity. Are they identical or stereoisomers?',[f('a','Relationship',['stereoisomers','stereo isomers'],'STEREO_DEFINITION')],['stereo']),
    q('IC-G2','Guided: two drawings of n-butane differ only because one is rotated around a C-C single bond. Classify them.',[f('a','Relationship',['identical','same molecule','conformers','same compound'],'SAME_MOLECULE')])
  ],
  independent:[
    q('IC-I1','Classify n-butane and 2-methylpropane.',[f('a','Relationship',['constitutional isomers','constitutional'],'CONNECTIVITY_FIRST')],['connectivity']),
    q('IC-I2','Classify cis-2-butene and trans-2-butene.',[f('a','Relationship',['stereoisomers','stereo isomers'],'STEREO_DEFINITION')],['stereo']),
    q('IC-I3','Two structures have the same formula and connectivity and are superimposable after rotation. Classify them.',[f('a','Relationship',['identical','same molecule','same compound'],'SAME_MOLECULE')]),
    q('IC-I4','Two compounds share formula C5H12, but one has a continuous five-carbon chain and the other has a four-carbon chain with one methyl branch. Classify them.',[f('a','Relationship',['constitutional isomers','constitutional'],'CONNECTIVITY_FIRST')],['connectivity'])
  ],
  explanation:{prompt:'Explain the order of questions you should ask to decide whether two drawings are identical, constitutional isomers, or stereoisomers.',requiredGroups:[['formula'],['connectivity','connected'],['three-dimensional','3d','spatial','superimposable']]},
  transfer:[q('IC-T1','Transfer: two cycloalkane drawings have identical connectivity, but one has both substituents on the same face and the other has them on opposite faces. Classify the pair.',[f('a','Relationship',['stereoisomers','stereo isomers'],'STEREO_DEFINITION')],['stereo'])],
  intervening:q('IC-A1','Different skill: in a cyclohexane chair, a bulky substituent is generally more stable axial or equatorial?',[f('a','Position',['equatorial'],'CHAIR_POSITION')]),
  retrieval:[
    q('IC-R1','Later: same molecular formula but different connectivity means what relationship?',[f('a','Relationship',['constitutional isomers','constitutional'],'CONNECTIVITY_FIRST')],['connectivity']),
    q('IC-R2','Later: same connectivity, non-superimposable fixed spatial arrangements mean what broad relationship?',[f('a','Relationship',['stereoisomers','stereo isomers'],'STEREO_DEFINITION')],['stereo'])
  ],
  repairChecks:{
    CONNECTIVITY_FIRST:q('IC-RP1','Repair check: before comparing 3D shape, what must you compare first?',[f('a','Feature',['connectivity','atom connectivity','bonding connectivity'],'CONNECTIVITY_FIRST')]),
    STEREO_DEFINITION:q('IC-RP2','Repair check: stereoisomers have the same connectivity. Yes or no?',[f('a','Answer',['yes','y'],'STEREO_DEFINITION')]),
    SAME_MOLECULE:q('IC-RP3','Repair check: can rotating a molecule around an ordinary single bond by itself create a constitutional isomer?',[f('a','Answer',['no','n'],'SAME_MOLECULE')])
  },
  reteach:{
    CONNECTIVITY_FIRST:'Trace which atom is bonded to which. If that pattern changes, the pair is constitutional and you do not need a stereochemical label.',
    STEREO_DEFINITION:'Stereoisomers keep the same atom connectivity but differ in a spatial arrangement that makes the compounds nonidentical.',
    SAME_MOLECULE:'A new drawing is not automatically a new molecule. Legal rotation and superposition can reveal that two pictures are the same compound.'
  }
}),

'chirality-stereocenters':freezeLesson({
  id:'chirality-stereocenters',skillId:'u2.c5.chirality_stereocenters',title:'Chirality and Stereocenters',chapter:'Chapter 5',priority:1,
  prerequisites:['bond-line','isomer-classification'],
  objective:'Decide whether a mirror image is superimposable and identify tetrahedral carbons with four different substituent paths.',requiredTags:['stereocenter','chirality'],
  probe:[
    q('CH-P1','A tetrahedral carbon is attached to H, Br, CH3, and CH2CH3. Is that carbon a stereocenter?',[f('a','Answer',['yes','y'],'FOUR_DIFFERENT')],['stereocenter']),
    q('CH-P2','A tetrahedral carbon is attached to H, OH, CH3, and another CH3. Is that carbon a stereocenter?',[f('a','Answer',['no','n'],'FOUR_DIFFERENT')],['chirality'])
  ],
  watch:[
    w('Chiral means the mirror image cannot be superimposed','Chirality is a whole-object relationship. A chiral molecule and its mirror image cannot be placed on top of each other so every atom matches.','left hand vs right hand -> mirror, not superimposable',q('CH-W1','If a molecule is superimposable on its mirror image, is it chiral or achiral?',[f('a','Answer',['achiral','not chiral'],'MIRROR_TEST')])),
    w('A common stereocenter has four different paths','For the carbon centers in this chapter, first confirm a tetrahedral sp3 carbon, then compare all four substituent paths. Repeated groups mean that carbon is not a stereocenter.','sp3 C + four different substituents',q('CH-W2','A carbon bonded to two identical methyl groups can be a four-different-groups stereocenter. Yes or no?',[f('a','Answer',['no','n'],'FOUR_DIFFERENT')]))
  ],
  concept:[
    q('CH-C1','What test defines a chiral object: whether it is superimposable on its mirror image or whether it contains carbon?',[f('a','Test',['superimposable on its mirror image','mirror image superimposable','mirror image','superimposable'],'MIRROR_TEST')]),
    q('CH-C2','For a common tetrahedral carbon stereocenter, how many different substituent groups or paths are required?',[f('a','Number',['4','four'],'FOUR_DIFFERENT')])
  ],
  build:[
    q('CH-B1','Build the check for CH3-CH(OH)-CH2-CH3. At carbon 2, are the four attached groups H, OH, CH3, and CH2CH3 all different?',[f('a','Answer',['yes','y'],'FOUR_DIFFERENT')]),
    q('CH-B2','Therefore, is carbon 2 of 2-butanol a stereocenter?',[f('a','Answer',['yes','y'],'FOUR_DIFFERENT')],['stereocenter'])
  ],
  guided:[
    q('CH-G1','Guided: the middle carbon of 2-propanol is attached to H, OH, CH3, and CH3. Stereocenter or not?',[f('a','Answer',['not a stereocenter','no','not stereocenter'],'FOUR_DIFFERENT')]),
    q('CH-G2','Guided: a molecule is experimentally or geometrically superimposable on its mirror image. Chiral or achiral?',[f('a','Answer',['achiral','not chiral'],'MIRROR_TEST')],['chirality'])
  ],
  independent:[
    q('CH-I1','Is carbon 2 in CH3-CH(Cl)-CH2-CH2-CH3 a stereocenter?',[f('a','Answer',['yes','y'],'FOUR_DIFFERENT')],['stereocenter']),
    q('CH-I2','Is the central carbon in CH3-CH(CH3)-CH2-CH3 a stereocenter?',[f('a','Answer',['no','n'],'FOUR_DIFFERENT')]),
    q('CH-I3','A molecule and its mirror image cannot be superimposed. Is the molecule chiral or achiral?',[f('a','Answer',['chiral'],'MIRROR_TEST')],['chirality']),
    q('CH-I4','A tetrahedral carbon is bonded to F, Cl, CH3, and H. Is it a stereocenter?',[f('a','Answer',['yes','y'],'FOUR_DIFFERENT')],['stereocenter'])
  ],
  explanation:{prompt:'Explain why an sp3 carbon with two identical substituent groups is not a stereocenter, and connect that idea to the mirror-image test for chirality.',requiredGroups:[['two identical','same group','repeated'],['four different','four substituents'],['mirror','superimposable']]},
  transfer:[q('CH-T1','Transfer: a tetrahedral carbon is bonded to H, OH, CH2OH, and CH2CH3. Is it a stereocenter?',[f('a','Answer',['yes','y'],'FOUR_DIFFERENT')],['stereocenter'])],
  intervening:q('CH-A1','Different skill: cis-2-butene and trans-2-butene are constitutional isomers or stereoisomers?',[f('a','Relationship',['stereoisomers','stereo isomers'],'STEREO_DEFINITION')]),
  retrieval:[
    q('CH-R1','Later: a tetrahedral carbon has four different substituent paths. What kind of center is it commonly called in this chapter?',[f('a','Center',['stereocenter','stereogenic center','chiral center'],'FOUR_DIFFERENT')],['stereocenter']),
    q('CH-R2','Later: a molecule is superimposable on its mirror image. Chiral or achiral?',[f('a','Answer',['achiral'],'MIRROR_TEST')],['chirality'])
  ],
  repairChecks:{
    FOUR_DIFFERENT:q('CH-RP1','Repair check: if two substituents on a tetrahedral carbon are identical, does that carbon satisfy the four-different-groups rule?',[f('a','Answer',['no','n'],'FOUR_DIFFERENT')]),
    MIRROR_TEST:q('CH-RP2','Repair check: non-superimposable mirror image means chiral or achiral?',[f('a','Answer',['chiral'],'MIRROR_TEST')])
  },
  reteach:{
    FOUR_DIFFERENT:'Trace each of the four paths leaving the tetrahedral carbon. If any two paths are identical, stop: that carbon is not a four-different-groups stereocenter.',
    MIRROR_TEST:'Imagine the molecule and its mirror image as 3D objects. If every atom can be aligned by ordinary rotation, the molecule is achiral; if not, it is chiral.'
  }
}),

'cip-rs':freezeLesson({
  id:'cip-rs',skillId:'u2.c5.cip_rs',title:'CIP Priority and R/S Configuration',chapter:'Chapter 5',priority:1,
  prerequisites:['chirality-stereocenters'],
  objective:'Rank substituents with CIP rules and assign R/S only after accounting for the direction of priority 4.',requiredTags:['cip','rs'],
  probe:[
    q('RS-P1','At a stereocenter, which directly attached atom has higher CIP priority: Br or Cl?',[f('a','Higher priority',['br','bromine'],'CIP_PRIORITY')],['cip']),
    q('RS-P2','When priority 4 points away, a 1 -> 2 -> 3 clockwise path is R or S?',[f('a','Configuration',['r','R'],'RS_ORIENTATION')],['rs'])
  ],
  watch:[
    w('Rank from the atom touching the stereocenter outward','CIP priority starts with the atomic number of the directly attached atom. Higher atomic number gets higher priority. If there is a tie, compare the next set of atoms outward until the first difference.','higher atomic number -> higher priority',q('RS-W1','Between O and N directly attached to a stereocenter, which has higher priority?',[f('a','Atom',['o','oxygen'],'CIP_PRIORITY')])),
    w('Orientation is read only after priority 4 is handled','Put the lowest-priority substituent away from you. Then 1 -> 2 -> 3 clockwise is R and counterclockwise is S. If priority 4 points toward you, reverse the apparent result.','4 away: clockwise R, counterclockwise S; 4 toward: invert',q('RS-W2','Priority 4 points toward you and the visible 1 -> 2 -> 3 order is clockwise. After inversion, R or S?',[f('a','Configuration',['s','S'],'RS_ORIENTATION')]))
  ],
  concept:[
    q('RS-C1','CIP priority between F and O directly attached to the stereocenter: which is higher?',[f('a','Atom',['f','fluorine'],'CIP_PRIORITY')]),
    q('RS-C2','If priority 4 is already pointing away, do you invert the clockwise/counterclockwise result?',[f('a','Answer',['no','n'],'RS_ORIENTATION')])
  ],
  build:[
    q('RS-B1','Build priorities for a center attached directly to Br, OH, CH3, and H. Which group is priority 1?',[f('a','Priority 1',['br','bromine'],'CIP_PRIORITY')]),
    q('RS-B2','For the same center, which directly attached group is priority 4?',[f('a','Priority 4',['h','hydrogen'],'CIP_PRIORITY')],['cip'])
  ],
  guided:[
    q('RS-G1','Guided: directly attached atoms are Cl, O, C, and H. Give them in priority order from highest to lowest.',[f('a','Order',['cl > o > c > h','cl,o,c,h','chlorine oxygen carbon hydrogen','cl o c h'],'CIP_PRIORITY')],['cip']),
    q('RS-G2','Guided visual: priority 4 is drawn away; 1 -> 2 -> 3 proceeds counterclockwise. Assign the configuration.',[f('a','Configuration',['s','S'],'RS_ORIENTATION')],['rs'],'rs-counterclockwise-4-away')
  ],
  independent:[
    q('RS-I1','Rank I, Br, Cl, and F directly attached to a stereocenter from highest to lowest CIP priority.',[f('a','Order',['i > br > cl > f','i,br,cl,f','iodine bromine chlorine fluorine','i br cl f'],'CIP_PRIORITY')],['cip']),
    q('RS-I2','Visual A: priority 4 points away and 1 -> 2 -> 3 is clockwise. Assign R/S.',[f('a','Configuration',['r','R'],'RS_ORIENTATION')],['rs'],'rs-visual-a-clockwise-4-away'),
    q('RS-I3','Visual B: priority 4 points toward the viewer and the apparent 1 -> 2 -> 3 order is counterclockwise. Assign R/S.',[f('a','Configuration',['r','R'],'RS_ORIENTATION')],['rs'],'rs-visual-b-counterclockwise-4-toward'),
    q('RS-I4','At a tie where both directly attached atoms are carbon, what do you do next: guess from group size or compare the next attached atoms outward?',[f('a','Rule',['compare next attached atoms','compare outward','look at next atoms','next atoms'],'CIP_TIE')],['cip'])
  ],
  explanation:{prompt:'Explain how to assign R/S from a wedge-dash structure, including how CIP priorities are chosen and why the direction of priority 4 matters.',requiredGroups:[['atomic number','priority'],['lowest','4','away'],['clockwise','counterclockwise','invert']]},
  transfer:[q('RS-T1','Transfer visual: priority 4 is toward you and 1 -> 2 -> 3 is clockwise. What configuration results after correcting the viewpoint?',[f('a','Configuration',['s','S'],'RS_ORIENTATION')],['rs'],'rs-transfer-clockwise-4-toward')],
  intervening:q('RS-A1','Different skill: a tetrahedral carbon with two identical substituents is a stereocenter. Yes or no?',[f('a','Answer',['no','n'],'FOUR_DIFFERENT')]),
  retrieval:[
    q('RS-R1','Later: which has higher CIP priority when directly attached: O or C?',[f('a','Atom',['o','oxygen'],'CIP_PRIORITY')],['cip']),
    q('RS-R2','Later visual: priority 4 points away and 1 -> 2 -> 3 is counterclockwise. R or S?',[f('a','Configuration',['s','S'],'RS_ORIENTATION')],['rs'],'rs-retrieval-counterclockwise-4-away')
  ],
  repairChecks:{
    CIP_PRIORITY:q('RS-RP1','Repair check: higher atomic number gets higher or lower CIP priority?',[f('a','Answer',['higher','higher priority'],'CIP_PRIORITY')]),
    CIP_TIE:q('RS-RP2','Repair check: if the directly attached atoms tie, where do you compare next?',[f('a','Answer',['next atoms outward','next attached atoms','outward','one bond farther'],'CIP_TIE')]),
    RS_ORIENTATION:q('RS-RP3','Repair check: with priority 4 away, clockwise 1 -> 2 -> 3 is R or S?',[f('a','Configuration',['r','R'],'RS_ORIENTATION')])
  },
  reteach:{
    CIP_PRIORITY:'Do not rank by visual size. Compare atomic number of the atom directly attached to the stereocenter first.',
    CIP_TIE:'When directly attached atoms tie, write the next layer of atoms for each substituent and compare at the first point of difference.',
    RS_ORIENTATION:'Physically track priority 4. If it points away, read 1-2-3 directly. If it points toward you, reverse the apparent clockwise/counterclockwise result.'
  }
}),

'stereoisomer-relationships':freezeLesson({
  id:'stereoisomer-relationships',skillId:'u2.c5.stereoisomer_relationships',title:'Enantiomers, Diastereomers, or Identical',chapter:'Chapter 5',priority:1,
  prerequisites:['cip-rs'],
  objective:'Compare configuration at every stereocenter to classify a pair as identical, enantiomers, or diastereomers.',requiredTags:['enantiomer','diastereomer'],
  probe:[
    q('REL-P1','For an unsymmetrical molecule with two stereocenters, compare (2R,3R) with (2S,3S). What relationship is expected?',[f('a','Relationship',['enantiomers','enantiomer'],'REL_ALL_INVERT')],['enantiomer']),
    q('REL-P2','For an unsymmetrical molecule with two stereocenters, compare (2R,3R) with (2R,3S). What relationship is expected?',[f('a','Relationship',['diastereomers','diastereomer'],'REL_SOME_INVERT')],['diastereomer'])
  ],
  watch:[
    w('Compare every stereocenter, not just one','After confirming the same connectivity, list configurations center by center. If every corresponding stereocenter is inverted, the pair is normally enantiomeric. If some but not all invert, the pair is diastereomeric. Symmetry can create special identical/meso cases that must be checked.','all invert -> enantiomer; some invert -> diastereomer',q('REL-W1','Same connectivity, two centers: one configuration changes and one stays the same. Enantiomers or diastereomers?',[f('a','Relationship',['diastereomers','diastereomer'],'REL_SOME_INVERT')])),
    w('Identical means the entire 3D object matches','The same configuration at all corresponding stereocenters is a strong identical-structure signal after legal rotations are considered. Do not call a pair enantiomeric just because two drawings look mirrored.','compare configs + symmetry + superposition',q('REL-W2','Same connectivity and same R/S configuration at every stereocenter: first classification to test?',[f('a','Relationship',['identical','same molecule','same compound'],'REL_IDENTICAL')]))
  ],
  concept:[
    q('REL-C1','All corresponding stereocenters inverted in an unsymmetrical framework usually gives what relationship?',[f('a','Relationship',['enantiomers','enantiomer'],'REL_ALL_INVERT')]),
    q('REL-C2','Some but not all corresponding stereocenters inverted gives what relationship?',[f('a','Relationship',['diastereomers','diastereomer'],'REL_SOME_INVERT')])
  ],
  build:[
    q('REL-B1','Build the comparison: (R,R,R) versus (S,S,S). How many of the three centers are inverted?',[f('a','Number',['3','three','all three','all'],'REL_ALL_INVERT')]),
    q('REL-B2','For an unsymmetrical framework, classify that all-inverted pair.',[f('a','Relationship',['enantiomers','enantiomer'],'REL_ALL_INVERT')],['enantiomer'])
  ],
  guided:[
    q('REL-G1','Guided: (R,S,R) versus (R,R,R). Some or all stereocenters changed?',[f('a','Answer',['some','one','not all'],'REL_SOME_INVERT')]),
    q('REL-G2','Therefore, for the same unsymmetrical connectivity, classify the pair.',[f('a','Relationship',['diastereomers','diastereomer'],'REL_SOME_INVERT')],['diastereomer'])
  ],
  independent:[
    q('REL-I1','Same unsymmetrical connectivity: (R,S) versus (S,R). Classify the pair.',[f('a','Relationship',['enantiomers','enantiomer'],'REL_ALL_INVERT')],['enantiomer']),
    q('REL-I2','Same unsymmetrical connectivity: (R,R) versus (R,S). Classify the pair.',[f('a','Relationship',['diastereomers','diastereomer'],'REL_SOME_INVERT')],['diastereomer']),
    q('REL-I3','Same connectivity and the same configuration at every stereocenter after legal redrawing. Classify the pair.',[f('a','Relationship',['identical','same molecule','same compound'],'REL_IDENTICAL')]),
    q('REL-I4','Same unsymmetrical connectivity with three centers: (R,S,S) versus (S,R,R). Classify the pair.',[f('a','Relationship',['enantiomers','enantiomer'],'REL_ALL_INVERT')],['enantiomer'])
  ],
  explanation:{prompt:'Explain how you distinguish identical structures, enantiomers, and diastereomers by comparing all stereocenters rather than judging the picture by appearance.',requiredGroups:[['same connectivity'],['all','every','invert'],['some','not all'],['identical','same configuration']]},
  transfer:[q('REL-T1','Transfer: same unsymmetrical connectivity, configurations (R,R,S) and (R,S,S). Classify.',[f('a','Relationship',['diastereomers','diastereomer'],'REL_SOME_INVERT')],['diastereomer'])],
  intervening:q('REL-A1','Different skill: when priority 4 points away, clockwise 1 -> 2 -> 3 is R or S?',[f('a','Configuration',['r','R'],'RS_ORIENTATION')]),
  retrieval:[
    q('REL-R1','Later: same unsymmetrical connectivity, (R,R) versus (S,S). Relationship?',[f('a','Relationship',['enantiomers','enantiomer'],'REL_ALL_INVERT')],['enantiomer']),
    q('REL-R2','Later: same unsymmetrical connectivity, (R,S) versus (R,R). Relationship?',[f('a','Relationship',['diastereomers','diastereomer'],'REL_SOME_INVERT')],['diastereomer'])
  ],
  repairChecks:{
    REL_ALL_INVERT:q('REL-RP1','Repair check: for an ordinary unsymmetrical case, if every stereocenter inverts, what relationship results?',[f('a','Relationship',['enantiomers','enantiomer'],'REL_ALL_INVERT')]),
    REL_SOME_INVERT:q('REL-RP2','Repair check: if only some stereocenters invert, what relationship results?',[f('a','Relationship',['diastereomers','diastereomer'],'REL_SOME_INVERT')]),
    REL_IDENTICAL:q('REL-RP3','Repair check: same connectivity and same configuration at all centers points first toward what relationship?',[f('a','Relationship',['identical','same molecule'],'REL_IDENTICAL')])
  },
  reteach:{
    REL_ALL_INVERT:'Make a small configuration table. For an unsymmetrical molecule, every center switching R<->S is the mirror-image pattern for enantiomers.',
    REL_SOME_INVERT:'If at least one center stays the same while another changes, the pair is not a mirror-image all-inversion pair; it is diastereomeric.',
    REL_IDENTICAL:'Do not trust drawing orientation. Match connectivity and configuration center by center, then test legal rotations/superposition.'
  }
}),

'meso-symmetry':freezeLesson({
  id:'meso-symmetry',skillId:'u2.c5.meso_symmetry',title:'Meso Compounds and Symmetry',chapter:'Chapter 5',priority:1,
  prerequisites:['stereoisomer-relationships'],
  objective:'Recognize when internal molecular symmetry makes a molecule achiral despite the presence of stereocenters.',requiredTags:['meso','symmetry'],
  probe:[
    q('ME-P1','Can a molecule contain stereocenters and still be achiral?',[f('a','Answer',['yes','y'],'MESO_CONCEPT')],['meso']),
    q('ME-P2','A meso compound is chiral or achiral?',[f('a','Answer',['achiral','not chiral'],'MESO_CONCEPT')],['symmetry'])
  ],
  watch:[
    w('Count stereocenters, then inspect the whole molecule','Stereocenters are local features; chirality belongs to the whole molecule. Internal symmetry can make a molecule with stereocenters superimposable on its mirror image.','local stereocenters != automatic whole-molecule chirality',q('ME-W1','Does "two stereocenters" automatically mean the molecule is chiral?',[f('a','Answer',['no','n'],'MESO_CONCEPT')])),
    w('Meso requires the right symmetry, not a memorized R/S slogan','A meso structure has stereocenters and an internal symmetry relationship in the molecular framework that makes the whole molecule achiral. Opposite labels by themselves are not enough if the two halves are not constitutionally equivalent.','symmetry check across whole framework',q('ME-W2','Opposite R/S labels alone always prove a molecule is meso. Yes or no?',[f('a','Answer',['no','n'],'SYMMETRY_REQUIRED')]))
  ],
  concept:[
    q('ME-C1','What whole-molecule feature is the key meso check: internal symmetry or molecular mass?',[f('a','Feature',['internal symmetry','symmetry','plane of symmetry'],'SYMMETRY_REQUIRED')]),
    q('ME-C2','A meso molecule is superimposable on its mirror image. Yes or no?',[f('a','Answer',['yes','y'],'MESO_CONCEPT')])
  ],
  build:[
    q('ME-B1','Build the 2,3-dibromobutane check: the (2R,3S) form has two stereocenters. Does that fact alone settle chirality?',[f('a','Answer',['no','n'],'MESO_CONCEPT')]),
    q('ME-B2','If the structure has an internal symmetry plane that maps one half onto the other, classify the whole molecule as chiral or achiral.',[f('a','Answer',['achiral','not chiral'],'SYMMETRY_REQUIRED')],['meso'])
  ],
  guided:[
    q('ME-G1','Guided visual: a two-stereocenter molecule has equivalent left/right halves and an internal mirror plane. What special term applies if it is achiral?',[f('a','Term',['meso','meso compound'],'MESO_CONCEPT')],['meso'],'meso-symmetry-plane-a'),
    q('ME-G2','Guided: a molecule has configurations R,S but the two halves are not equivalent and no internal symmetry exists. Can you call it meso from R,S alone?',[f('a','Answer',['no','n'],'SYMMETRY_REQUIRED')],['symmetry'])
  ],
  independent:[
    q('ME-I1','A molecule has two stereocenters and a genuine internal plane of symmetry that makes it superimposable on its mirror image. Chiral, achiral meso, or constitutional isomer?',[f('a','Classification',['achiral meso','meso','meso compound'],'MESO_CONCEPT')],['meso'],'meso-independent-a'),
    q('ME-I2','A molecule has two stereocenters but no internal symmetry and is not superimposable on its mirror image. Chiral or achiral?',[f('a','Answer',['chiral'],'SYMMETRY_REQUIRED')],['symmetry']),
    q('ME-I3','For 2,3-dibromobutane, the symmetric R,S form is commonly classified as what special type?',[f('a','Type',['meso','meso compound'],'MESO_CONCEPT')],['meso']),
    q('ME-I4','Does the statement "one center is R and one is S" prove meso without checking molecular symmetry?',[f('a','Answer',['no','n'],'SYMMETRY_REQUIRED')],['symmetry'])
  ],
  explanation:{prompt:'Explain how a molecule can contain stereocenters yet still be achiral, and why R/S labels alone are not enough to identify a meso compound.',requiredGroups:[['stereocenter'],['symmetry','plane'],['superimposable','achiral'],['labels','r','s']]},
  transfer:[q('ME-T1','Transfer visual: a molecule has two stereocenters and a visible internal symmetry plane. Its mirror image superimposes. What classification fits best?',[f('a','Classification',['meso','meso compound','achiral meso'],'MESO_CONCEPT')],['meso'],'meso-transfer-b')],
  intervening:q('ME-A1','Different skill: same connectivity, some but not all stereocenters inverted gives enantiomers or diastereomers?',[f('a','Relationship',['diastereomers','diastereomer'],'REL_SOME_INVERT')]),
  retrieval:[
    q('ME-R1','Later: meso compounds are chiral or achiral?',[f('a','Answer',['achiral'],'MESO_CONCEPT')],['meso']),
    q('ME-R2','Later: what must be checked before using opposite R/S labels to claim meso?',[f('a','Feature',['symmetry','internal symmetry','plane of symmetry'],'SYMMETRY_REQUIRED')],['symmetry'])
  ],
  repairChecks:{
    MESO_CONCEPT:q('ME-RP1','Repair check: can an achiral meso compound contain stereocenters?',[f('a','Answer',['yes','y'],'MESO_CONCEPT')]),
    SYMMETRY_REQUIRED:q('ME-RP2','Repair check: what whole-molecule feature can make a stereocenter-containing molecule achiral?',[f('a','Feature',['symmetry','internal symmetry','plane of symmetry'],'SYMMETRY_REQUIRED')])
  },
  reteach:{
    MESO_CONCEPT:'Separate local and global questions: first find stereocenters, then test whether the whole molecular framework has symmetry that makes the mirror image superimposable.',
    SYMMETRY_REQUIRED:'Do not use R,S as a shortcut. Draw or inspect the whole framework and ask whether one half maps onto the other through a real internal symmetry element.'
  }
}),

'fischer-projections':freezeLesson({
  id:'fischer-projections',skillId:'u2.c5.fischer_projections',title:'Fischer Projections',chapter:'Chapter 5',priority:2,
  prerequisites:['cip-rs'],
  objective:'Read Fischer projection geometry and perform only manipulations that preserve configuration.',requiredTags:['fischer','orientation'],
  probe:[
    q('FI-P1','In a Fischer projection, horizontal bonds point toward the viewer or away from the viewer?',[f('a','Direction',['toward','toward the viewer','out','out of page'],'FISCHER_GEOMETRY')],['fischer']),
    q('FI-P2','A Fischer projection may be rotated 180 degrees in the plane without changing configuration. Yes or no?',[f('a','Answer',['yes','y'],'FISCHER_ROTATION')],['orientation'])
  ],
  watch:[
    w('A Fischer cross is a 3D convention','Horizontal bonds project toward you; vertical bonds project away. The crossing point is a tetrahedral stereocenter when it has four different substituents.','horizontal -> toward; vertical -> away',q('FI-W1','In a Fischer projection, the vertical bonds point toward or away?',[f('a','Direction',['away','away from viewer','back','into page'],'FISCHER_GEOMETRY')])),
    w('Preserve the convention during manipulation','Rotating the entire Fischer projection 180 degrees in the page preserves configuration. A 90-degree rotation does not. A single swap of two groups inverts configuration.','180 valid; 90 invalid; one swap inverts',q('FI-W2','Is a 90-degree in-plane rotation of a Fischer projection configuration-preserving?',[f('a','Answer',['no','n'],'FISCHER_ROTATION')]))
  ],
  concept:[
    q('FI-C1','Fischer horizontal bonds are toward; vertical bonds are what?',[f('a','Direction',['away','back','into page'],'FISCHER_GEOMETRY')]),
    q('FI-C2','Which whole-projection rotation preserves configuration: 90 degrees or 180 degrees?',[f('a','Rotation',['180','180 degrees','180°'],'FISCHER_ROTATION')])
  ],
  build:[
    q('FI-B1','Build the 3D view: in a Fischer cross, are the left and right groups coming toward you or going away?',[f('a','Direction',['toward','toward viewer','out'],'FISCHER_GEOMETRY')]),
    q('FI-B2','Are the top and bottom groups toward or away?',[f('a','Direction',['away','away from viewer','back'],'FISCHER_GEOMETRY')],['fischer'])
  ],
  guided:[
    q('FI-G1','Guided: you rotate an entire Fischer projection 180 degrees in the page. Same configuration or inverted configuration?',[f('a','Result',['same configuration','same','preserved','unchanged'],'FISCHER_ROTATION')],['orientation']),
    q('FI-G2','Guided: you swap exactly one pair of groups in a Fischer projection. Does configuration stay the same or invert?',[f('a','Result',['invert','inverted','changes','opposite configuration'],'FISCHER_SWAP')],['fischer'])
  ],
  independent:[
    q('FI-I1','In a Fischer projection, which pair of bonds points toward the viewer: horizontal or vertical?',[f('a','Pair',['horizontal','horizontal bonds'],'FISCHER_GEOMETRY')],['fischer']),
    q('FI-I2','You rotate a Fischer projection 180 degrees in its plane. Does the stereochemical identity change?',[f('a','Answer',['no','n','unchanged','same'],'FISCHER_ROTATION')],['orientation']),
    q('FI-I3','You rotate a Fischer projection 90 degrees in its plane and treat it as equivalent. Is that valid?',[f('a','Answer',['no','n','invalid'],'FISCHER_ROTATION')],['orientation']),
    q('FI-I4','One swap of two groups in a Fischer projection changes the configuration. Yes or no?',[f('a','Answer',['yes','y'],'FISCHER_SWAP')],['fischer'])
  ],
  explanation:{prompt:'Explain the 3D meaning of horizontal and vertical bonds in a Fischer projection and why a 180-degree rotation is allowed while a 90-degree rotation is not.',requiredGroups:[['horizontal','toward'],['vertical','away'],['180'],['90']]},
  transfer:[q('FI-T1','Transfer: after two successive swaps of two groups in a Fischer projection, is the net configuration preserved or inverted?',[f('a','Result',['preserved','same','unchanged'],'FISCHER_SWAP')],['fischer'])],
  intervening:q('FI-A1','Different skill: higher atomic number gives higher or lower CIP priority?',[f('a','Answer',['higher','higher priority'],'CIP_PRIORITY')]),
  retrieval:[
    q('FI-R1','Later: Fischer vertical bonds point which direction relative to the viewer?',[f('a','Direction',['away','back','into page'],'FISCHER_GEOMETRY')],['fischer']),
    q('FI-R2','Later: which in-plane rotation preserves a Fischer projection, 90 or 180 degrees?',[f('a','Rotation',['180','180 degrees','180°'],'FISCHER_ROTATION')],['orientation'])
  ],
  repairChecks:{
    FISCHER_GEOMETRY:q('FI-RP1','Repair check: Fischer horizontal bonds project toward or away?',[f('a','Direction',['toward','toward viewer','out'],'FISCHER_GEOMETRY')]),
    FISCHER_ROTATION:q('FI-RP2','Repair check: is 180-degree rotation allowed for an entire Fischer projection?',[f('a','Answer',['yes','y'],'FISCHER_ROTATION')]),
    FISCHER_SWAP:q('FI-RP3','Repair check: one swap of two groups preserves or inverts configuration?',[f('a','Result',['inverts','invert','inverted'],'FISCHER_SWAP')])
  },
  reteach:{
    FISCHER_GEOMETRY:'Treat the cross like four bonds in 3D: left/right come toward you; top/bottom go away.',
    FISCHER_ROTATION:'A 180-degree turn puts every Fischer bond back into the same toward/away relationship. A 90-degree turn exchanges horizontal and vertical roles, so it is not equivalent.',
    FISCHER_SWAP:'One swap changes parity and inverts configuration. Two swaps restore the original configuration relationship.'
  }
}),

'ez-alkenes':freezeLesson({
  id:'ez-alkenes',skillId:'u2.c5.ez_alkenes',title:'Alkene E/Z Configuration',chapter:'Chapter 5',priority:1,
  prerequisites:['cip-rs','isomer-classification'],
  objective:'Determine whether E/Z applies, rank one substituent on each alkene carbon by CIP priority, and classify higher-priority groups as same side or opposite sides.',requiredTags:['ez','eligibility'],
  probe:[
    q('EZ-P1','If either alkene carbon has two identical substituents, can that double bond receive an E/Z descriptor?',[f('a','Answer',['no','n'],'EZ_ELIGIBILITY')],['eligibility']),
    q('EZ-P2','For an E/Z-eligible alkene, the higher-priority groups are on opposite sides. E or Z?',[f('a','Configuration',['e','E'],'EZ_SIDE')],['ez'])
  ],
  watch:[
    w('First decide whether E/Z exists','Each alkene carbon must have two different substituents. If one alkene carbon has two identical groups, there is no E/Z pair to name.','eligibility: two different groups on each alkene carbon',q('EZ-W1','CH2=CCl2 has two H groups on one alkene carbon. Does E/Z apply?',[f('a','Answer',['no','n'],'EZ_ELIGIBILITY')])),
    w('Rank separately, then compare sides','Use CIP to identify the higher-priority substituent on the left alkene carbon and separately on the right. Higher priorities on the same side give Z; opposite sides give E.','Z together; E opposite',q('EZ-W2','Higher-priority substituents on the same side give E or Z?',[f('a','Configuration',['z','Z'],'EZ_SIDE')]))
  ],
  concept:[
    q('EZ-C1','Before assigning E or Z, what must be true about the two substituents on each alkene carbon?',[f('a','Requirement',['different','not identical','two different substituents'],'EZ_ELIGIBILITY')]),
    q('EZ-C2','Higher-priority groups opposite sides: E or Z?',[f('a','Configuration',['e','E'],'EZ_SIDE')])
  ],
  build:[
    q('EZ-B1','Build the left-side priority for an alkene carbon bonded to CH3 and H. Which is higher priority?',[f('a','Higher',['ch3','methyl','carbon group'],'EZ_PRIORITY')]),
    q('EZ-B2','If the higher-priority group on each alkene carbon ends up on the same side, assign E/Z.',[f('a','Configuration',['z','Z'],'EZ_SIDE')],['ez'])
  ],
  guided:[
    q('EZ-G1','Guided visual: each alkene carbon has two different groups; the higher-priority groups are drawn opposite. Assign E/Z.',[f('a','Configuration',['e','E'],'EZ_SIDE')],['ez'],'ez-guided-opposite'),
    q('EZ-G2','Guided: one alkene carbon is bonded to H and H. Assign E, Z, or neither.',[f('a','Configuration',['neither','no e/z','no ez','not applicable'],'EZ_ELIGIBILITY')],['eligibility'])
  ],
  independent:[
    q('EZ-I1','An alkene has two different substituents on each double-bond carbon. The two higher-priority groups lie on the same side. Assign E/Z.',[f('a','Configuration',['z','Z'],'EZ_SIDE')],['ez']),
    q('EZ-I2','An E/Z-eligible alkene has its two higher-priority groups on opposite sides. Assign E/Z.',[f('a','Configuration',['e','E'],'EZ_SIDE')],['ez']),
    q('EZ-I3','Does CH2=CHCl receive E/Z notation?',[f('a','Answer',['no','n','neither','not applicable'],'EZ_ELIGIBILITY')],['eligibility']),
    q('EZ-I4','On one alkene carbon the choices are Cl and CH3. Which has higher CIP priority?',[f('a','Higher',['cl','chlorine'],'EZ_PRIORITY')],['ez'])
  ],
  explanation:{prompt:'Explain the full E/Z decision: when E/Z is allowed, how CIP is used on each alkene carbon, and how the positions of the two higher-priority groups determine E or Z.',requiredGroups:[['different','each alkene carbon'],['priority','cip'],['same side','z'],['opposite','e']]},
  transfer:[q('EZ-T1','Transfer visual: E/Z is valid and the higher-priority groups are opposite. What descriptor belongs to the double bond?',[f('a','Configuration',['e','E'],'EZ_SIDE')],['ez'],'ez-transfer-opposite-b')],
  intervening:q('EZ-A1','Different skill: a molecule and its mirror image are superimposable. Chiral or achiral?',[f('a','Answer',['achiral'],'MIRROR_TEST')]),
  retrieval:[
    q('EZ-R1','Later: E/Z requires two different substituents on each alkene carbon. Yes or no?',[f('a','Answer',['yes','y'],'EZ_ELIGIBILITY')],['eligibility']),
    q('EZ-R2','Later: higher-priority groups on the same side correspond to E or Z?',[f('a','Configuration',['z','Z'],'EZ_SIDE')],['ez'])
  ],
  repairChecks:{
    EZ_ELIGIBILITY:q('EZ-RP1','Repair check: if one alkene carbon has two identical substituents, is E/Z defined?',[f('a','Answer',['no','n'],'EZ_ELIGIBILITY')]),
    EZ_PRIORITY:q('EZ-RP2','Repair check: between Cl and C directly attached, which gets higher CIP priority?',[f('a','Higher',['cl','chlorine'],'EZ_PRIORITY')]),
    EZ_SIDE:q('EZ-RP3','Repair check: higher-priority groups opposite sides means E or Z?',[f('a','Configuration',['e','E'],'EZ_SIDE')])
  },
  reteach:{
    EZ_ELIGIBILITY:'Inspect each double-bond carbon separately. Two identical groups on either carbon means there is only one arrangement for that side, so E/Z is not defined.',
    EZ_PRIORITY:'Use the same CIP idea as R/S: compare directly attached atoms first by atomic number, then move outward only for ties.',
    EZ_SIDE:'After selecting one higher-priority group on each alkene carbon, ignore the lower-priority groups. Same side is Z; opposite is E.'
  }
}),

'optical-activity':freezeLesson({
  id:'optical-activity',skillId:'u2.c5.optical_activity',title:'Optical Activity and Enantiomer Mixtures',chapter:'Chapter 5',priority:2,
  prerequisites:['stereoisomer-relationships'],
  objective:'Relate enantiomers to equal-and-opposite optical rotation and interpret racemic versus non-racemic mixtures without equating R/S with rotation sign.',requiredTags:['rotation','racemic'],
  probe:[
    q('OA-P1','Does an R configuration automatically mean positive optical rotation?',[f('a','Answer',['no','n'],'RS_NOT_SIGN')],['rotation']),
    q('OA-P2','An exact 50:50 mixture of two enantiomers is called what?',[f('a','Mixture',['racemic mixture','racemate','racemic'],'RACEMIC')],['racemic'])
  ],
  watch:[
    w('R/S and optical sign are different labels','R/S describes spatial configuration from CIP rules. The sign of optical rotation is measured experimentally. R does not predict + and S does not predict -.','configuration != measured rotation sign',q('OA-W1','Can you determine + or - optical rotation from R/S alone?',[f('a','Answer',['no','n'],'RS_NOT_SIGN')])),
    w('Enantiomer rotations cancel in an equal mixture','Under the same conditions, pure enantiomers rotate plane-polarized light by equal magnitude in opposite directions. A 50:50 racemic mixture therefore has zero net rotation.','equal + opposite -> racemate net 0',q('OA-W2','A racemic mixture has nonzero or zero net optical rotation?',[f('a','Result',['zero','0','zero net rotation'],'RACEMIC')]))
  ],
  concept:[
    q('OA-C1','R/S is assigned from geometry and CIP; optical + or - is assigned from what kind of observation?',[f('a','Answer',['experiment','experimental measurement','measurement','polarimetry'],'RS_NOT_SIGN')]),
    q('OA-C2','What happens to equal-and-opposite enantiomer rotations in a 50:50 mixture?',[f('a','Result',['cancel','cancel out','zero net rotation'],'RACEMIC')])
  ],
  build:[
    q('OA-B1','Build the mixture: 50% one enantiomer and 50% its mirror-image enantiomer. Racemic or non-racemic?',[f('a','Mixture',['racemic','racemic mixture','racemate'],'RACEMIC')]),
    q('OA-B2','What is the expected net optical rotation of that ideal racemic mixture?',[f('a','Rotation',['0','zero','zero net rotation'],'RACEMIC')],['racemic'])
  ],
  guided:[
    q('OA-G1','Guided: a pure enantiomer rotates +12 degrees under fixed conditions. Its pure enantiomer under the same conditions rotates approximately what value?',[f('a','Rotation',['-12','-12 degrees','negative 12','−12'],'ENANTIOMER_ROTATION')],['rotation']),
    q('OA-G2','Guided: a mixture is 70:30 in favor of one enantiomer. Is it racemic or non-racemic?',[f('a','Mixture',['non-racemic','nonracemic','not racemic'],'RACEMIC')],['racemic'])
  ],
  independent:[
    q('OA-I1','Can the label (S) alone tell you whether a compound is dextrorotatory (+) or levorotatory (-)?',[f('a','Answer',['no','n'],'RS_NOT_SIGN')],['rotation']),
    q('OA-I2','A 50:50 enantiomer mixture has what ideal net optical rotation?',[f('a','Rotation',['0','zero','zero net rotation'],'RACEMIC')],['racemic']),
    q('OA-I3','If one pure enantiomer rotates +25 degrees under given conditions, what does the pure opposite enantiomer do under the same conditions?',[f('a','Rotation',['-25','-25 degrees','negative 25','−25'],'ENANTIOMER_ROTATION')],['rotation']),
    q('OA-I4','A sample contains 60% one enantiomer and 40% the other. Is it racemic?',[f('a','Answer',['no','n','non-racemic','nonracemic'],'RACEMIC')],['racemic'])
  ],
  explanation:{prompt:'Explain why R/S configuration cannot predict the sign of optical rotation and why an exact racemic mixture has zero net rotation.',requiredGroups:[['r','s','configuration'],['experiment','measured'],['enantiomer','opposite'],['50','50','racemic','cancel']]},
  transfer:[q('OA-T1','Transfer: a pure enantiomer rotates -8 degrees under fixed conditions. What rotation should its pure enantiomer show under the same conditions?',[f('a','Rotation',['+8','8','positive 8','+8 degrees'],'ENANTIOMER_ROTATION')],['rotation'])],
  intervening:q('OA-A1','Different skill: for an unsymmetrical molecule, all stereocenters inverted usually gives enantiomers or diastereomers?',[f('a','Relationship',['enantiomers','enantiomer'],'REL_ALL_INVERT')]),
  retrieval:[
    q('OA-R1','Later: does R mean positive optical rotation?',[f('a','Answer',['no','n'],'RS_NOT_SIGN')],['rotation']),
    q('OA-R2','Later: what name is given to an exact 1:1 mixture of enantiomers?',[f('a','Mixture',['racemic','racemic mixture','racemate'],'RACEMIC')],['racemic'])
  ],
  repairChecks:{
    RS_NOT_SIGN:q('OA-RP1','Repair check: is optical rotation sign measured experimentally or assigned from R/S?',[f('a','Answer',['measured experimentally','experiment','measured'],'RS_NOT_SIGN')]),
    RACEMIC:q('OA-RP2','Repair check: 50:50 enantiomers is called what?',[f('a','Mixture',['racemic','racemic mixture','racemate'],'RACEMIC')]),
    ENANTIOMER_ROTATION:q('OA-RP3','Repair check: pure enantiomers rotate with equal magnitude in the same direction or opposite directions?',[f('a','Direction',['opposite directions','opposite'],'ENANTIOMER_ROTATION')])
  },
  reteach:{
    RS_NOT_SIGN:'Keep two systems separate: R/S comes from a structural ranking convention; + or - rotation comes from experiment.',
    RACEMIC:'A racemate contains equal amounts of both enantiomers. Their equal-and-opposite rotations cancel in the bulk sample.',
    ENANTIOMER_ROTATION:'Under identical conditions, enantiomers have optical rotations equal in magnitude and opposite in sign.'
  }
})

});

var ORDER=Object.freeze(['isomer-classification','chirality-stereocenters','cip-rs','stereoisomer-relationships','meso-symmetry','fischer-projections','ez-alkenes','optical-activity']);

var PRODUCTION_CHECKPOINTS=Object.freeze([
  Object.freeze({id:'C5-D1',skill:'isomer-classification',task:'Compare two original structures and mark whether atom connectivity changed before classifying the pair.',grading:'structured interaction; not arbitrary handwriting'}),
  Object.freeze({id:'C5-D2',skill:'chirality-stereocenters',task:'Tap the stereocenter in an original wedge-dash structure, then identify the four substituent paths.',grading:'structured hotspot + choices'}),
  Object.freeze({id:'C5-D3',skill:'cip-rs',task:'Rank four substituents around a stereocenter by CIP priority.',grading:'ordered structured response'}),
  Object.freeze({id:'C5-D4',skill:'cip-rs',task:'Assign R/S to a fresh wedge-dash stereocenter after orienting priority 4.',grading:'structured visual response'}),
  Object.freeze({id:'C5-D5',skill:'stereoisomer-relationships',task:'Compare two multi-stereocenter structures as identical, enantiomers, or diastereomers.',grading:'structured visual response'}),
  Object.freeze({id:'C5-D6',skill:'meso-symmetry',task:'Identify the internal symmetry relationship in a meso candidate.',grading:'structured symmetry overlay / hotspot'}),
  Object.freeze({id:'C5-D7',skill:'fischer-projections',task:'Read a Fischer projection and label horizontal bonds toward and vertical bonds away.',grading:'structured directional labels'}),
  Object.freeze({id:'C5-D8',skill:'ez-alkenes',task:'Assign E/Z to a fresh eligible alkene after choosing the high-priority group on each alkene carbon.',grading:'structured visual response'})
]);

function lesson(id){return LESSONS[id]||null;}
function lessons(){return ORDER.map(function(id){return LESSONS[id];});}
function lessonIds(){return ORDER.slice();}

return{META:META,LESSONS:LESSONS,ORDER:ORDER,PRODUCTION_CHECKPOINTS:PRODUCTION_CHECKPOINTS,lesson:lesson,lessons:lessons,lessonIds:lessonIds};
});
