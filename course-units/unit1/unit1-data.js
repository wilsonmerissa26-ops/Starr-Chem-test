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

  const CALIBRATION=Object.freeze({
    currentScope:'Fall 2026 CHM 221 syllabus + Klein Organic Chemistry 5e',
    historicalStyle:'Publicly posted Mercer CHM 221 Dr. Meadows Exam 1 / Quiz 1 material is used only to calibrate task style, not copied as a question bank.',
    principles:[
      'favor production over recognition',
      'use molecule/structure interpretation instead of isolated vocabulary only',
      'include multi-step and classification tasks',
      'keep homework/problem-set style application in the mix',
      'preserve current 2026 chapter scope even when older exams used a different chapter order',
      'generate a different full form after each completed attempt'
    ]
  });

  const SKILLS=Object.freeze([
    {
      id:'representations',label:'Bond-line representations',source:'Chapter 2.1–2.2',foundationDay:1,
      teaching:'At every unlabeled line end or vertex, read a carbon atom. Hydrogens on carbon are normally omitted and are implied in the number needed to give carbon four bonds. Heteroatoms are written explicitly.',
      hint:'Count line ends and vertices as carbon first. Then complete each carbon to four bonds with implied hydrogen.',
      items:[
        {id:'R1',task:'structure reading',prompt:'In a bond-line drawing, what atom is represented by an unlabeled line end or vertex, and what happens to the hydrogens on that atom?',rubric:{require:[['carbon','c atom'],['implied','not drawn','omitted'],['four bonds','4 bonds','valence four','valence 4']],error:'REPRESENTATION_INCOMPLETE'}},
        {id:'R2',task:'structure reading',prompt:'An unlabeled internal vertex in a bond-line structure has two single bonds to neighboring atoms and no other bonds. What atom is at that vertex, and how many hydrogens are implied there?',rubric:{require:[['carbon','c atom'],['two hydrogens','2 hydrogens','2 h']],error:'REPRESENTATION_INCOMPLETE'}},
        {id:'R3',task:'production',prompt:'What must be shown explicitly in a bond-line structure even though most carbon atoms and carbon-bound hydrogens are omitted?',rubric:{require:[['heteroatom','heteroatoms','non carbon atom','non-carbon atom'],['hydrogen on heteroatom','h on heteroatom','heteroatom hydrogen','hydrogens on heteroatoms']],error:'REPRESENTATION_INCOMPLETE'}},
        {id:'R4',task:'structure reading',prompt:'A bond-line skeleton has five unlabeled vertices/line ends total and no heteroatoms. How many carbon atoms does the molecule contain?',accepted:['5','five']}
      ]
    },
    {
      id:'functional_groups',label:'Functional-group recognition',source:'Chapter 2.3',foundationDay:1,
      teaching:'Functional groups are recurring atom-and-bond patterns. Identify them from connectivity, not the molecular formula alone.',
      hint:'Find the characteristic atom-and-bond pattern before naming the group.',
      items:[
        {id:'G1',task:'classification',prompt:'What functional group is present in CH3CH2OH?',accepted:['alcohol','hydroxyl']},
        {id:'G2',task:'classification',prompt:'What functional group is present in CH3COCH3?',accepted:['ketone']},
        {id:'G3',task:'classification',prompt:'What functional group is present in CH3CH2OCH3?',accepted:['ether']},
        {id:'G4',task:'multi-part classification',prompt:'CH3COCH2CH2OH contains which two functional groups?',rubric:{require:[['ketone'],['alcohol','hydroxyl']],error:'FUNCTIONAL_GROUP_INCOMPLETE'}}
      ]
    },
    {
      id:'formal_charge',label:'Lone pairs + formal charge',source:'Chapter 1 + Chapter 2.4–2.5',foundationDay:2,
      teaching:'Use usual second-row valence patterns. Neutral oxygen commonly has two bonds and two lone pairs; nitrogen with four bonds is positive; carbon with three bonds and no lone pair is positive; oxygen with one bond and three lone pairs is negative.',
      hint:'Count bonds and lone pairs on the indicated atom instead of guessing from the whole molecule.',
      items:[
        {id:'F1',task:'lone-pair production',prompt:'A neutral oxygen is drawn with two single bonds. How many lone pairs should it have?',accepted:['2','two']},
        {id:'F2',task:'formal-charge production',prompt:'A carbon is drawn with three bonds and no lone pair. What formal charge does that carbon have?',accepted:['+1','1+','positive 1','positive one','positive','carbocation']},
        {id:'F3',task:'formal-charge production',prompt:'A nitrogen atom has four single bonds and no lone pair. What formal charge should be shown on nitrogen?',accepted:['+1','1+','positive 1','positive one','positive']},
        {id:'F4',task:'formal-charge production',prompt:'An oxygen atom has one single bond and three lone pairs. What formal charge should be shown on oxygen?',accepted:['-1','1-','negative 1','negative one','negative']}
      ]
    },
    {
      id:'three_d',label:'Three-dimensional bond-line meaning',source:'Chapter 2.6',foundationDay:null,
      teaching:'Wedge and dash bonds encode direction in three-dimensional space. A solid wedge projects toward the viewer; a dashed wedge projects behind the page; a normal line is approximately in the plane.',
      hint:'Translate the bond symbol into its direction relative to the page.',
      items:[
        {id:'D1',task:'3D interpretation',prompt:'In a three-dimensional bond-line drawing, what does a solid wedge bond mean?',accepted:['toward viewer','toward the viewer','out of page','out of the page','toward you']},
        {id:'D2',task:'3D interpretation',prompt:'In a three-dimensional bond-line drawing, what does a dashed wedge bond mean?',accepted:['behind page','behind the page','away from viewer','away from the viewer','away from you']},
        {id:'D3',task:'concept explanation',prompt:'What information do wedge and dashed bonds add to an ordinary bond-line structure?',rubric:{require:[['three dimensional','3d','spatial','orientation'],['toward','away','front','behind']],error:'THREE_D_INCOMPLETE'}},
        {id:'D4',task:'3D interpretation',prompt:'A bond is drawn as a normal straight line rather than a wedge or dash. What approximate relationship to the page does that indicate?',accepted:['in plane','in the plane','plane of page','plane of the page']}
      ]
    },
    {
      id:'hybridization',label:'Hybridization + local geometry',source:'Chapter 1 review',foundationDay:null,
      teaching:'Use the local bonding pattern. Four electron groups around carbon usually means sp3; a carbon in a double bond is usually sp2; a carbon in a triple bond is sp.',
      hint:'Count the electron-group pattern around the indicated atom: single-bond tetrahedral, double-bond trigonal planar, or triple-bond linear.',
      items:[
        {id:'H1',task:'atom labeling',prompt:'What is the hybridization of a carbon atom that is part of a C=C double bond?',accepted:['sp2','sp^2','sp 2']},
        {id:'H2',task:'atom labeling',prompt:'What is the hybridization of a carbon atom that is part of a C≡C triple bond?',accepted:['sp']},
        {id:'H3',task:'atom labeling',prompt:'A carbon has four single sigma bonds and tetrahedral geometry. What is its hybridization?',accepted:['sp3','sp^3','sp 3']},
        {id:'H4',task:'atom labeling',prompt:'What is the hybridization of the carbonyl carbon in a C=O group?',accepted:['sp2','sp^2','sp 2']}
      ]
    },
    {
      id:'nomenclature',label:'Alkane IUPAC naming',source:'Chapter 4',foundationDay:null,
      teaching:'Choose the longest parent chain, number from the end that gives the first substituent the lowest locant, identify substituents, and assemble the systematic name.',
      hint:'Find the longest continuous carbon chain before numbering branches.',
      items:[
        {id:'N1',task:'name production',prompt:'Give the IUPAC name for CH3-CH(CH3)-CH2-CH2-CH3.',accepted:['2-methylpentane','2 methylpentane']},
        {id:'N2',task:'name production',prompt:'Give the IUPAC name for CH3-CH2-CH(CH3)-CH2-CH3.',accepted:['3-methylpentane','3 methylpentane']},
        {id:'N3',task:'name production',prompt:'Give the IUPAC name for CH3-CH(CH3)-CH(CH3)-CH3.',accepted:['2,3-dimethylbutane','2 3 dimethylbutane','2,3 dimethylbutane']},
        {id:'N4',task:'name production',prompt:'Give the IUPAC name for CH3-C(CH3)2-CH2-CH3.',accepted:['2,2-dimethylbutane','2 2 dimethylbutane','2,2 dimethylbutane']}
      ]
    },
    {
      id:'isomers',label:'Alkane formulas, isomers + relative stability',source:'Chapter 4',foundationDay:null,
      teaching:'Acyclic saturated alkanes follow CnH2n+2. Constitutional isomers have the same formula but different connectivity. For isomeric alkanes, greater branching is generally associated with greater stability and lower heat of combustion.',
      hint:'Separate formula, connectivity, and stability. Redrawing or rotating the same connectivity does not create a constitutional isomer.',
      items:[
        {id:'I1',task:'isomer count',prompt:'How many constitutional isomers does C4H10 have?',accepted:['2','two']},
        {id:'I2',task:'formula production',prompt:'What is the molecular formula of an acyclic saturated alkane with 6 carbon atoms?',accepted:['c6h14','C6H14','c 6 h 14']},
        {id:'I3',task:'classification',prompt:'Two compounds have the same molecular formula but different atom connectivity. What relationship do they have?',accepted:['constitutional isomers','constitutional isomer','structural isomers','structural isomer']},
        {id:'I4',task:'stability reasoning',prompt:'For two constitutional isomeric alkanes with the same formula, which is generally more stable: the more branched isomer or the less branched isomer?',accepted:['more branched','the more branched isomer','branched','more-branched']}
      ]
    },
    {
      id:'conformations',label:'Newman projections + conformational analysis',source:'Chapter 4',foundationDay:null,
      teaching:'Rotation around a carbon-carbon single bond creates conformations. Staggered arrangements reduce torsional strain. Anti places the largest groups 180° apart; gauche places them 60° apart; eclipsed bonds align.',
      hint:'Compare the dihedral angle and whether front/back bonds are aligned or offset.',
      items:[
        {id:'C1',task:'Newman classification',prompt:'In a Newman projection, the two largest groups are 180° apart in a staggered conformation. What is this conformation called?',accepted:['anti']},
        {id:'C2',task:'Newman classification',prompt:'What is the name of a conformation in which the front and back bonds line up when viewed down the C-C bond?',accepted:['eclipsed','eclipse']},
        {id:'C3',task:'Newman classification',prompt:'In a staggered Newman projection, the two largest groups are 60° apart. What relationship is this?',accepted:['gauche']},
        {id:'C4',task:'energy reasoning',prompt:'Which is generally lower in energy around a simple C-C single bond, a staggered conformation or an eclipsed conformation, and why?',rubric:{require:[['staggered'],['lower','more stable','less energy'],['torsional','less repulsion','less strain']],error:'CONFORMATION_REASONING_INCOMPLETE'}}
      ]
    },
    {
      id:'cycloalkanes',label:'Cycloalkanes + cyclohexane stability',source:'Chapter 4',foundationDay:null,
      teaching:'Saturated monocyclic cycloalkanes commonly follow CnH2n. Ring strain includes angle and torsional strain. In cyclohexane chairs, bulky substituents are generally more stable equatorial because that avoids unfavorable axial interactions. Chair flips exchange axial/equatorial while preserving up/down.',
      hint:'For chair stability, compare axial versus equatorial placement and preserve up/down during a chair flip.',
      items:[
        {id:'Y1',task:'chair stability',prompt:'For a monosubstituted cyclohexane with a bulky substituent, is that substituent generally more stable axial or equatorial?',accepted:['equatorial']},
        {id:'Y2',task:'formula production',prompt:'What general molecular formula describes a saturated monocyclic cycloalkane with n carbons?',accepted:['cnh2n','c n h 2n','CnH2n']},
        {id:'Y3',task:'chair-flip reasoning',prompt:'During a cyclohexane chair flip, what happens to axial/equatorial positions and what happens to an up/down designation?',rubric:{require:[['axial becomes equatorial','equatorial becomes axial','axial and equatorial switch','switch axial'],['up stays up','down stays down','up down stays','up/down stays','preserved']],error:'CHAIR_FLIP_INCOMPLETE'}},
        {id:'Y4',task:'stability reasoning',prompt:'Why is the chair conformation of cyclohexane much more stable than a hypothetical planar cyclohexane?',rubric:{require:[['angle strain','bond angles','tetrahedral'],['torsional strain','staggered','eclipsing']],error:'CYCLOHEXANE_STABILITY_INCOMPLETE'}}
      ]
    }
  ]);

  // 13 x 10-point slots = the current 130-point Unit 1 test weight.
  // The skill distribution is held constant across retakes so forms remain comparable.
  const TEST1_BLUEPRINT=Object.freeze([
    {skill:'representations',points:10},
    {skill:'formal_charge',points:10},
    {skill:'functional_groups',points:10},
    {skill:'hybridization',points:10},
    {skill:'three_d',points:10},
    {skill:'nomenclature',points:10},
    {skill:'isomers',points:10},
    {skill:'conformations',points:10},
    {skill:'cycloalkanes',points:10},
    {skill:'formal_charge',points:10},
    {skill:'hybridization',points:10},
    {skill:'nomenclature',points:10},
    {skill:'conformations',points:10}
  ]);

  function skill(id){return SKILLS.find(x=>x.id===id)||null;}
  function item(skillId,itemId){const s=skill(skillId);return s?s.items.find(x=>x.id===itemId)||null:null;}
  function alternate(skillId,itemId,excluded){
    const s=skill(skillId);if(!s)return null;
    const block=new Set(excluded||[]);block.add(itemId);
    return s.items.find(x=>!block.has(x.id))||s.items.find(x=>x.id!==itemId)||s.items[0]||null;
  }

  return {META,CALIBRATION,SKILLS,TEST1_BLUEPRINT,skill,item,alternate};
});
