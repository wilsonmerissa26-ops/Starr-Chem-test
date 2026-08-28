(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.CHM221Unit1LessonData=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const LESSONS=Object.freeze({
    representations:Object.freeze({
      id:'representations',
      title:'Bond-line representations',
      objective:'Read every unlabeled line end and vertex as carbon, then infer the hydrogens required to give carbon four bonds.',
      watch:Object.freeze([
        {id:'rep-1',phase:'TEACH',narration:'Start with the full carbon skeleton. Every carbon and hydrogen is visible here.',visual:{kind:'bondline',state:'expanded'},facts:['Carbon normally forms four bonds in these structures.']},
        {id:'rep-2',phase:'WATCH',narration:'Now the carbon labels disappear. The carbon atoms did not disappear. Each line end and corner still represents one carbon.',visual:{kind:'bondline',state:'collapse-carbons'},facts:['An unlabeled line end or vertex represents carbon.']},
        {id:'rep-3',phase:'WATCH',narration:'The hydrogens on carbon disappear too. They are implied by how many bonds carbon still needs to reach four.',visual:{kind:'bondline',state:'collapse-hydrogens'},facts:['Hydrogens attached to carbon are usually omitted and implied.']},
        {id:'rep-4',phase:'WATCH',narration:'Count the structure from left to right: end, corner, end. That is three carbons even though no C letters are written.',visual:{kind:'bondline',state:'count-carbons'},facts:[]}
      ]),
      guided:Object.freeze([
        {id:'rep-g1',phase:'BUILD_TOGETHER',prompt:'A zigzag has two line segments: one left end, one corner, and one right end. How many carbons are represented?',accepted:['3','three'],visual:{kind:'bondline',state:'count-carbons'}},
        {id:'rep-g2',phase:'GUIDED',prompt:'An unlabeled carbon has two single bonds to neighboring carbons. How many hydrogens are implied on that carbon?',accepted:['2','two'],visual:{kind:'bondline',state:'hydrogen-count'}}
      ]),
      representationSwitches:Object.freeze(['labeled-structure','vertex-highlighting','worked-count'])
    }),

    formal_charge:Object.freeze({
      id:'formal_charge',
      title:'Lone pairs + formal charge',
      objective:'Use electron bookkeeping to assign lone pairs and formal charge from a Lewis structure.',
      externalHref:'../../day2/',
      externalLabel:'Open the full Day 2 formal-charge lesson',
      note:'This skill already has a complete teaching lesson. Reuse it instead of duplicating a weaker version here.'
    }),

    functional_groups:Object.freeze({
      id:'functional_groups',
      title:'Functional-group recognition',
      objective:'Identify the atom-and-bond pattern that defines the functional group instead of guessing from the molecular formula.',
      watch:Object.freeze([
        {id:'fg-1',phase:'TEACH',narration:'Look at the connectivity first. The whole molecule matters less than the small recurring atom-and-bond pattern.',visual:{kind:'functional',state:'whole-molecule'},facts:['Functional groups are recurring atom-and-bond patterns.']},
        {id:'fg-2',phase:'WATCH',narration:'Here the O-H bond is attached to a saturated carbon. The O-H region lights up because that pattern identifies an alcohol.',visual:{kind:'functional',state:'alcohol-highlight'},facts:['An O-H attached to a saturated carbon is an alcohol pattern.']},
        {id:'fg-3',phase:'WATCH',narration:'Now compare a carbonyl carbon bonded to two carbons. The C=O region lights up because this pattern is a ketone.',visual:{kind:'functional',state:'ketone-highlight'},facts:['A carbonyl carbon bonded to two carbons is a ketone pattern.']},
        {id:'fg-4',phase:'WATCH',narration:'Same elements can appear in different molecules. The connection pattern, not just the element list, determines the functional group.',visual:{kind:'functional',state:'compare'},facts:[]}
      ]),
      guided:Object.freeze([
        {id:'fg-g1',phase:'BUILD_TOGETHER',prompt:'What functional group is present in CH3CH2OH?',accepted:['alcohol','hydroxyl'],visual:{kind:'functional',state:'alcohol-highlight'}},
        {id:'fg-g2',phase:'GUIDED',prompt:'What functional group is present in CH3COCH3?',accepted:['ketone'],visual:{kind:'functional',state:'ketone-highlight'}}
      ]),
      representationSwitches:Object.freeze(['highlight-pattern','compare-two-molecules','connectivity-map'])
    }),

    nomenclature:Object.freeze({
      id:'nomenclature',
      title:'Alkane IUPAC naming',
      objective:'Find the parent chain first, number it correctly, identify substituents, and assemble the name with locants.',
      watch:Object.freeze([
        {id:'name-1',phase:'TEACH',narration:'Do not name branches first. Trace the longest continuous carbon chain. That chain gives the parent name.',visual:{kind:'naming',state:'trace-parent'},facts:['Choose the longest continuous carbon chain before naming substituents.']},
        {id:'name-2',phase:'WATCH',narration:'Number from the end that gives the first substituent the lower number. Watch both directions appear, then the better direction stays.',visual:{kind:'naming',state:'number-chain'},facts:['Number from the end that gives the first substituent the lower locant.']},
        {id:'name-3',phase:'WATCH',narration:'The branch is a methyl group on carbon 2. The parent chain has five carbons, so the parent is pentane.',visual:{kind:'naming',state:'label-substituent'},facts:['A five-carbon alkane parent is pentane.']},
        {id:'name-4',phase:'WATCH',narration:'Put the locant, substituent, and parent together: 2-methylpentane.',visual:{kind:'naming',state:'assemble-name'},facts:[]}
      ]),
      guided:Object.freeze([
        {id:'name-g1',phase:'BUILD_TOGETHER',prompt:'For CH3-CH(CH3)-CH2-CH2-CH3, how many carbons are in the longest parent chain?',accepted:['5','five'],visual:{kind:'naming',state:'trace-parent'}},
        {id:'name-g2',phase:'GUIDED',prompt:'Give the IUPAC name for CH3-CH(CH3)-CH2-CH2-CH3.',accepted:['2-methylpentane','2 methylpentane'],visual:{kind:'naming',state:'assemble-name'}}
      ]),
      representationSwitches:Object.freeze(['trace-chain','number-both-directions','name-assembly'])
    }),

    isomers:Object.freeze({
      id:'isomers',
      title:'Alkane formulas + constitutional isomers',
      objective:'Separate molecular formula from connectivity and recognize when two structures are genuinely different constitutional isomers.',
      watch:Object.freeze([
        {id:'iso-1',phase:'TEACH',narration:'Acyclic saturated alkanes follow CnH2n+2. For four carbons, that gives C4H10.',visual:{kind:'isomers',state:'formula'},facts:['Acyclic saturated alkanes follow CnH2n+2.']},
        {id:'iso-2',phase:'WATCH',narration:'Keep C4H10 fixed at the top. Now compare two different ways to connect those four carbons.',visual:{kind:'isomers',state:'two-connectivities'},facts:['Constitutional isomers have the same molecular formula but different connectivity.']},
        {id:'iso-3',phase:'WATCH',narration:'Rotating or redrawing the same connections does not make a new constitutional isomer. The atom-to-atom connections must actually change.',visual:{kind:'isomers',state:'redraw-same'},facts:['A different drawing of the same connectivity is not a new constitutional isomer.']},
        {id:'iso-4',phase:'WATCH',narration:'For C4H10 the two distinct connectivities are the straight chain and the branched chain.',visual:{kind:'isomers',state:'compare'},facts:[]}
      ]),
      guided:Object.freeze([
        {id:'iso-g1',phase:'BUILD_TOGETHER',prompt:'Two molecules have the same molecular formula but different atom connectivity. What are they called?',accepted:['constitutional isomers','constitutional isomer','structural isomers','structural isomer'],visual:{kind:'isomers',state:'two-connectivities'}},
        {id:'iso-g2',phase:'GUIDED',prompt:'What is the molecular formula of an acyclic saturated alkane with 5 carbon atoms?',accepted:['c5h12','C5H12','c 5 h 12'],visual:{kind:'isomers',state:'formula-five'}}
      ]),
      representationSwitches:Object.freeze(['formula-fixed','connectivity-map','same-vs-different'])
    }),

    conformations:Object.freeze({
      id:'conformations',
      title:'Newman projections + conformations',
      objective:'Read rotation around a carbon-carbon single bond and distinguish eclipsed, staggered, gauche, and anti arrangements.',
      watch:Object.freeze([
        {id:'conf-1',phase:'TEACH',narration:'A Newman projection looks straight down a carbon-carbon bond. The front carbon is the center point and the back carbon is the circle.',visual:{kind:'newman',state:'view-axis'},facts:['A Newman projection views a molecule along a carbon-carbon bond.']},
        {id:'conf-2',phase:'WATCH',narration:'When front and back bonds line up, the conformation is eclipsed. The overlap creates more torsional strain.',visual:{kind:'newman',state:'eclipsed'},facts:['Eclipsed conformations have aligned bonds and higher torsional strain.']},
        {id:'conf-3',phase:'WATCH',narration:'Rotate the back carbon 60 degrees. The bonds become staggered. If the largest groups are 60 degrees apart, that staggered arrangement is gauche.',visual:{kind:'newman',state:'gauche'},facts:['Gauche places the largest groups 60 degrees apart in a staggered conformation.']},
        {id:'conf-4',phase:'WATCH',narration:'Keep rotating until the largest groups are 180 degrees apart. That staggered arrangement is anti.',visual:{kind:'newman',state:'anti'},facts:['Anti places the largest groups 180 degrees apart.']}
      ]),
      guided:Object.freeze([
        {id:'conf-g1',phase:'BUILD_TOGETHER',prompt:'In a staggered Newman projection, the two largest groups are 180 degrees apart. What is this called?',accepted:['anti'],visual:{kind:'newman',state:'anti'}},
        {id:'conf-g2',phase:'GUIDED',prompt:'What is the conformation called when front and back bonds line up with each other?',accepted:['eclipsed','eclipse'],visual:{kind:'newman',state:'eclipsed'}}
      ]),
      representationSwitches:Object.freeze(['rotate-newman','angle-labels','energy-comparison'])
    }),

    cycloalkanes:Object.freeze({
      id:'cycloalkanes',
      title:'Cycloalkanes + cyclohexane stability',
      objective:'Use ring formulas and chair geometry to reason about cycloalkane strain and substituent stability.',
      watch:Object.freeze([
        {id:'cyc-1',phase:'TEACH',narration:'Closing an alkane chain into one saturated ring removes two hydrogens compared with the open chain. Saturated monocyclic cycloalkanes therefore commonly follow CnH2n.',visual:{kind:'cyclo',state:'close-ring'},facts:['A saturated monocyclic cycloalkane commonly follows CnH2n.']},
        {id:'cyc-2',phase:'WATCH',narration:'Cyclohexane avoids a flat hexagon. It folds into a chair, which reduces angle and torsional strain.',visual:{kind:'cyclo',state:'chair'},facts:['The cyclohexane chair reduces angle and torsional strain.']},
        {id:'cyc-3',phase:'WATCH',narration:'Put a bulky substituent axial. It points roughly up or down and experiences unfavorable interactions with other axial groups.',visual:{kind:'cyclo',state:'axial'},facts:['Bulky axial substituents experience unfavorable axial interactions.']},
        {id:'cyc-4',phase:'WATCH',narration:'Now perform a chair flip. The substituent becomes equatorial. For a bulky group, this is generally the more stable position.',visual:{kind:'cyclo',state:'equatorial'},facts:['A bulky substituent is generally more stable equatorial in a monosubstituted cyclohexane chair.']}
      ]),
      guided:Object.freeze([
        {id:'cyc-g1',phase:'BUILD_TOGETHER',prompt:'What general formula describes a saturated monocyclic cycloalkane with n carbons?',accepted:['cnh2n','CnH2n','c n h 2n'],visual:{kind:'cyclo',state:'close-ring'}},
        {id:'cyc-g2',phase:'GUIDED',prompt:'For a monosubstituted cyclohexane with a bulky substituent, is the substituent generally more stable axial or equatorial?',accepted:['equatorial'],visual:{kind:'cyclo',state:'equatorial'}}
      ]),
      representationSwitches:Object.freeze(['ring-vs-chain','chair-flip','axial-equatorial-compare'])
    })
  });

  function lesson(id){return LESSONS[id]||null;}
  function all(){return Object.keys(LESSONS).map(function(k){return LESSONS[k];});}

  return {LESSONS:LESSONS,lesson:lesson,all:all};
});