(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.CHM221Unit1Data=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const META=Object.freeze({
    course:'CHM 221 Organic Chemistry',
    unit:'Unit 1 / Test 1',
    testDate:'2026-09-03',
    testPoints:130,
    currentChapter:'Chapter 4: Alkanes and Cycloalkanes',
    cumulativeCoverage:['Chapter 1 review','Chapter 2.1–2.6 molecular representations','Chapter 4 alkanes and cycloalkanes'],
    note:'Course schedule is tentative. Canvas and Mercer email remain the source for live assignments and due dates.'
  });

  const SKILLS=Object.freeze([
    {
      id:'representations',
      lessonId:'representations',
      label:'Bond-line representations',
      source:'Chapter 2.1–2.3',
      foundationDay:null,
      teaching:'Read each unlabeled line end and vertex as carbon, then infer the hydrogens needed to give carbon four bonds. Heteroatoms are written explicitly.',
      hint:'Count each line end and vertex as carbon first. Then complete each carbon to four bonds with implied hydrogen.',
      items:[
        {id:'R1',prompt:'In a bond-line drawing, what atom is represented by an unlabeled line end or vertex, and what happens to the hydrogens on that atom?',rubric:{require:[['carbon','c atom'],['implied','not drawn','omitted'],['four bonds','4 bonds','valence four','valence 4']],error:'REPRESENTATION_INCOMPLETE'}},
        {id:'R2',prompt:'Why can most hydrogens attached to carbon be left out of a bond-line structure?',rubric:{require:[['implied','understood','not shown','omitted'],['four bonds','4 bonds','valence four','valence 4']],error:'REPRESENTATION_INCOMPLETE'}},
        {id:'R3',prompt:'An unlabeled carbon vertex has two single bonds to neighboring carbons. How many hydrogens are implied on that carbon?',accepted:['2','two']},
        {id:'R4',prompt:'In a bond-line structure, what atoms must be written explicitly instead of being assumed at unlabeled vertices?',accepted:['heteroatoms','hetero atoms','noncarbon atoms','non carbon atoms']}
      ]
    },
    {
      id:'formal_charge',
      lessonId:'formal_charge',
      label:'Lone pairs + formal charge',
      source:'Chapter 1 + Chapter 2.5–2.6',
      foundationDay:2,
      teaching:'Use the atom’s valence-electron pattern and electron bookkeeping to assign lone pairs and formal charge.',
      hint:'Use the atom’s usual valence pattern instead of guessing from the whole molecule.',
      items:[
        {id:'F1',prompt:'A neutral oxygen is drawn with two single bonds. How many lone pairs should it have?',accepted:['2','two']},
        {id:'F2',prompt:'A carbon is drawn with three bonds and no lone pair. What formal charge does that carbon have?',accepted:['+1','1+','positive 1','positive one','positive','carbocation']},
        {id:'F3',prompt:'An oxygen has three single bonds and one lone pair. What formal charge does that oxygen have?',accepted:['+1','1+','positive 1','positive one','positive']},
        {id:'F4',prompt:'A carbon has three single bonds and one lone pair. What formal charge does that carbon have?',accepted:['-1','1-','negative 1','negative one','negative']}
      ]
    },
    {
      id:'functional_groups',
      lessonId:'functional_groups',
      label:'Functional-group recognition',
      source:'Chapter 2.4',
      foundationDay:null,
      teaching:'Identify functional groups from the actual atom-and-bond connectivity. An OH attached to a saturated carbon is an alcohol, while a carbonyl carbon bonded to two carbons is a ketone.',
      hint:'Look for the characteristic atom-and-bond pattern, not just the element symbols.',
      items:[
        {id:'G1',prompt:'What functional group is present in CH3CH2OH?',accepted:['alcohol','hydroxyl']},
        {id:'G2',prompt:'What functional group is present in CH3COCH3?',accepted:['ketone']},
        {id:'G3',prompt:'What functional group is present in CH3CH2CH2OH?',accepted:['alcohol','hydroxyl']},
        {id:'G4',prompt:'What functional group is present in CH3CH2COCH3?',accepted:['ketone']}
      ]
    },
    {
      id:'nomenclature',
      lessonId:'nomenclature',
      label:'Alkane IUPAC naming',
      source:'Chapter 4',
      foundationDay:null,
      teaching:'Choose the longest parent chain, number from the end that gives the first substituent the lowest locant, name each substituent, and assemble the name with locants.',
      hint:'First find the longest continuous carbon chain. Only after that should you number it and name branches.',
      items:[
        {id:'N1',prompt:'Give the IUPAC name for CH3-CH(CH3)-CH2-CH2-CH3.',accepted:['2-methylpentane','2 methylpentane']},
        {id:'N2',prompt:'Give the IUPAC name for CH3-CH2-CH(CH3)-CH2-CH3.',accepted:['3-methylpentane','3 methylpentane']},
        {id:'N3',prompt:'Give the IUPAC name for CH3-CH(CH3)-CH2-CH2-CH2-CH3.',accepted:['2-methylhexane','2 methylhexane']},
        {id:'N4',prompt:'Give the IUPAC name for CH3-CH2-CH(CH3)-CH2-CH2-CH3.',accepted:['3-methylhexane','3 methylhexane']}
      ]
    },
    {
      id:'isomers',
      lessonId:'isomers',
      label:'Alkane formulas + constitutional isomers',
      source:'Chapter 1 + Chapter 4',
      foundationDay:null,
      teaching:'Acyclic saturated alkanes follow CnH2n+2. Constitutional isomers have the same molecular formula but different atom connectivity.',
      hint:'Ask whether connectivity changed. Rotation or redrawing alone does not create a new constitutional isomer.',
      items:[
        {id:'I1',prompt:'How many constitutional isomers does C4H10 have?',accepted:['2','two']},
        {id:'I2',prompt:'What is the molecular formula of an acyclic saturated alkane with 6 carbon atoms?',accepted:['c6h14','C6H14','c 6 h 14']},
        {id:'I3',prompt:'What is the molecular formula of an acyclic saturated alkane with 5 carbon atoms?',accepted:['c5h12','C5H12','c 5 h 12']},
        {id:'I4',prompt:'What do we call compounds that have the same molecular formula but different atom connectivity?',accepted:['constitutional isomers','constitutional isomer','structural isomers','structural isomer']}
      ]
    },
    {
      id:'conformations',
      lessonId:'conformations',
      label:'Newman projections + conformations',
      source:'Chapter 4',
      foundationDay:null,
      teaching:'Rotation around a carbon-carbon single bond creates conformations. Anti, gauche, staggered, and eclipsed arrangements are distinguished by dihedral angle and bond alignment.',
      hint:'For a Newman projection, compare the dihedral angle and whether front/back bonds are aligned or offset.',
      items:[
        {id:'C1',prompt:'In a Newman projection, the two largest groups are 180° apart in a staggered conformation. What is this conformation called?',accepted:['anti']},
        {id:'C2',prompt:'What is the name of a conformation in which the front and back C-H bonds line up with each other when viewed down the C-C bond?',accepted:['eclipsed','eclipse']},
        {id:'C3',prompt:'In a staggered Newman projection, the two largest groups are 60° apart. What is this conformation called?',accepted:['gauche']},
        {id:'C4',prompt:'Which general arrangement has lower torsional strain: staggered or eclipsed?',accepted:['staggered']}
      ]
    },
    {
      id:'cycloalkanes',
      lessonId:'cycloalkanes',
      label:'Cycloalkanes + cyclohexane stability',
      source:'Chapter 4',
      foundationDay:null,
      teaching:'Saturated monocyclic cycloalkanes commonly follow CnH2n. In a monosubstituted cyclohexane chair, a bulky substituent is generally more stable equatorial.',
      hint:'For chair stability, compare axial versus equatorial placement of the largest group.',
      items:[
        {id:'Y1',prompt:'For a monosubstituted cyclohexane with a bulky substituent, is that substituent generally more stable axial or equatorial?',accepted:['equatorial']},
        {id:'Y2',prompt:'What general molecular formula describes a saturated monocyclic cycloalkane with n carbons?',accepted:['cnh2n','c n h 2n','CnH2n']},
        {id:'Y3',prompt:'What is the molecular formula of a saturated monocyclic cycloalkane with 5 carbons?',accepted:['c5h10','C5H10','c 5 h 10']},
        {id:'Y4',prompt:'A bulky substituent is axial in one cyclohexane chair and equatorial after a chair flip. Which position is generally more stable?',accepted:['equatorial']}
      ]
    }
  ]);

  const TEST1_MIX=Object.freeze([
    {skill:'representations',item:'R2'},
    {skill:'formal_charge',item:'F2'},
    {skill:'functional_groups',item:'G2'},
    {skill:'nomenclature',item:'N1'},
    {skill:'isomers',item:'I1'},
    {skill:'conformations',item:'C1'},
    {skill:'cycloalkanes',item:'Y1'},
    {skill:'nomenclature',item:'N2'},
    {skill:'formal_charge',item:'F1'},
    {skill:'cycloalkanes',item:'Y2'}
  ]);

  function skill(id){return SKILLS.find(function(x){return x.id===id;})||null;}
  function item(skillId,itemId){const s=skill(skillId);return s?s.items.find(function(x){return x.id===itemId;})||null:null;}
  function alternate(skillId,itemId){const s=skill(skillId);if(!s)return null;return s.items.find(function(x){return x.id!==itemId;})||s.items[0]||null;}

  return {META: META,SKILLS: SKILLS,TEST1_MIX: TEST1_MIX,skill: skill,item: item,alternate: alternate};
});