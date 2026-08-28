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

  const F25_EXAM=Object.freeze({
    label:'Dr. Meadows CHM 221 Fall 2025 Test 1',
    points:100,
    minutes:50,
    numberedQuestions:11,
    observations:[
      'all work was written on the exam and time management was explicitly part of the exam',
      'multiple prompts were explicitly sourced from homework or the problem set',
      'the exam required bond-line drawing, formal-charge labeling, hybridization, IR matching, Newman ranking, ring-strain explanation, relationship classification, boiling-point ranking, chair drawing, constitutional-isomer drawing, and Newman/energy-curve work',
      'visual production and structure reasoning carried much more weight than isolated vocabulary recall'
    ]
  });

  const CALIBRATION=Object.freeze({
    currentScope:'Fall 2026 CHM 221 syllabus + current professor materials remain authoritative for what is testable now.',
    strongestHistorical:'The uploaded Dr. Meadows CHM 221 Fall 2025 Test 1 is the strongest historical calibration source currently available.',
    currentPracticeDesign:'The 2025 exam task proportions are normalized from 100 historical points to the current 130-point practice total without copying the old questions.',
    nextSource:'When the official Fall 2026 Practice Test 1 is released, it supersedes the historical blueprint for format and weighting.',
    principles:[
      'favor written production and structure reasoning over recognition-only questions',
      'preserve the current 2026 chapter scope even when historical exams differ',
      'represent the historical 11-question structure with multipart subparts scored separately',
      'include homework/problem-set style transfer rather than trivia',
      'use original molecules and wording instead of copying historical exam questions',
      'generate a different full form after each completed attempt'
    ]
  });

  const SKILLS=Object.freeze([
    {
      id:'representations',label:'Bond-line drawing + molecular representations',source:'Chapter 2.1–2.6',foundationDay:1,
      teaching:'Translate condensed structures into a carbon skeleton first. Every unlabeled line end or vertex is carbon, carbon-bound hydrogens are usually implied, and heteroatoms remain explicit.',
      hint:'Count the carbon skeleton first, then place the heteroatom and verify carbon valence.',
      items:[
        {id:'R1',task:'bond-line production',taskType:'bond_line_draw',paper:true,prompt:'On paper, draw a bond-line structure for CH3CH2CH(CH3)CH2OH. Then type: 5 carbons; OH explicit.',accepted:['5 carbons; OH explicit','5 carbons OH explicit','5; OH explicit']},
        {id:'R2',task:'bond-line production',taskType:'bond_line_draw',paper:true,prompt:'On paper, draw a bond-line structure for (CH3)2CHCH2CH2OH. Then type: 5 carbons; OH explicit.',accepted:['5 carbons; OH explicit','5 carbons OH explicit','5; OH explicit']},
        {id:'R3',task:'structure reading',taskType:'representation_reading',prompt:'An unlabeled internal vertex has two single bonds to neighboring atoms and no other drawn bonds. What atom is there and how many hydrogens are implied?',rubric:{require:[['carbon','c atom'],['two hydrogens','2 hydrogens','2 h']],error:'REPRESENTATION_INCOMPLETE'}},
        {id:'R4',task:'structure reading',taskType:'representation_reading',prompt:'What must normally be shown explicitly in a bond-line structure even though most carbons and carbon-bound hydrogens are omitted?',rubric:{require:[['heteroatom','heteroatoms','non carbon atom','non-carbon atom']],error:'REPRESENTATION_INCOMPLETE'}}
      ]
    },
    {
      id:'intermolecular_forces',label:'Intermolecular forces',source:'Chapter 2.1–2.6',foundationDay:null,
      teaching:'All molecules have London dispersion forces. Polar molecules also have dipole-dipole forces. Molecules with an O-H or N-H donor can hydrogen-bond with appropriate partners.',
      hint:'Start with London dispersion, then ask whether the molecule is polar and whether it has an O-H or N-H donor.',
      items:[
        {id:'M1',task:'property reasoning',taskType:'imf',prompt:'A molecule contains an alcohol O-H group and no ions. Which intermolecular forces can it have with another molecule of itself?',rubric:{require:[['london','dispersion'],['dipole'],['hydrogen bond','hydrogen bonding','h bond']],error:'IMF_INCOMPLETE'}},
        {id:'M2',task:'property reasoning',taskType:'imf',prompt:'Diethyl ether has a polar C-O-C unit but no O-H bond. Which intermolecular forces can one diethyl ether molecule have with another?',rubric:{require:[['london','dispersion'],['dipole']],reject:[{terms:['hydrogen bond','hydrogen bonding']}],error:'IMF_INCOMPLETE'}},
        {id:'M3',task:'property reasoning',taskType:'imf_practice',prompt:'Why does 1-butanol generally boil higher than butane?',rubric:{require:[['hydrogen bond','hydrogen bonding'],['stronger','more energy','higher boiling']],error:'IMF_REASONING_INCOMPLETE'}},
        {id:'M4',task:'property reasoning',taskType:'imf_practice',prompt:'Which force is present in every neutral molecular substance, even nonpolar alkanes?',accepted:['london dispersion','dispersion','london forces','london dispersion forces']}
      ]
    },
    {
      id:'formal_charge',label:'Lone pairs + formal charge',source:'Chapter 1 + Chapter 2.1–2.6',foundationDay:2,
      teaching:'Use local valence patterns. Carbon with three bonds and a lone pair is usually -1; carbon with three bonds and no lone pair is usually +1; oxygen with one bond and three lone pairs is -1; oxygen with three bonds is +1.',
      hint:'Count bonds and lone pairs on the indicated atom before assigning charge.',
      items:[
        {id:'F1',task:'formal-charge labeling',taskType:'formal_charge',prompt:'A carbon has three single bonds and one lone pair. What nonzero formal charge belongs on that carbon?',accepted:['-1','1-','negative 1','negative one','negative']},
        {id:'F2',task:'formal-charge labeling',taskType:'formal_charge',prompt:'An oxygen has three single bonds and one lone pair. What nonzero formal charge belongs on oxygen?',accepted:['+1','1+','positive 1','positive one','positive']},
        {id:'F3',task:'formal-charge practice',taskType:'formal_charge_practice',prompt:'A nitrogen has four single bonds and no lone pair. What formal charge should be shown?',accepted:['+1','1+','positive 1','positive one','positive']},
        {id:'F4',task:'lone-pair practice',taskType:'formal_charge_practice',prompt:'A neutral oxygen has two single bonds. How many lone pairs should it have?',accepted:['2','two']}
      ]
    },
    {
      id:'hybridization',label:'Hybridization + local geometry',source:'Chapter 1 review',foundationDay:null,
      teaching:'Use the local bonding pattern. Four electron groups around carbon usually means sp3, a carbon in a double bond is usually sp2, and a carbon in a triple bond is sp.',
      hint:'Single-bond tetrahedral is sp3, double-bond trigonal planar is sp2, triple-bond linear is sp.',
      items:[
        {id:'H1',task:'hybridization labeling',taskType:'hybridization',prompt:'What is the hybridization of a carbon atom with four single sigma bonds and tetrahedral geometry?',accepted:['sp3','sp^3','sp 3']},
        {id:'H2',task:'hybridization labeling',taskType:'hybridization',prompt:'What is the hybridization of a carbonyl carbon in a C=O group?',accepted:['sp2','sp^2','sp 2']},
        {id:'H3',task:'hybridization practice',taskType:'hybridization_practice',prompt:'What is the hybridization of a carbon in a C≡C triple bond?',accepted:['sp']},
        {id:'H4',task:'hybridization practice',taskType:'hybridization_practice',prompt:'What is the hybridization of a carbon in a C=C double bond?',accepted:['sp2','sp^2','sp 2']}
      ]
    },
    {
      id:'ir',label:'IR spectrum matching',source:'Lab 1 + current Unit 1 molecular recognition',foundationDay:null,
      teaching:'Match the diagnostic feature first: broad O-H, very broad acid O-H, strong C=O near the carbonyl region, or the absence of those features. Use the full pattern only after the diagnostic signal.',
      hint:'Look first for O-H breadth and a strong carbonyl signal before using the fingerprint region.',
      items:[
        {id:'IR1',task:'three-way IR matching',taskType:'ir_match',prompt:'Match: A=2-butanone, B=1-propanol, C=diethyl ether. Spectrum 1 has a broad O-H band around 3200-3600 and no C=O. Spectrum 2 has a strong C=O near 1715 and no broad O-H. Spectrum 3 has neither broad O-H nor C=O. Type 1=B,2=A,3=C.',accepted:['1=B,2=A,3=C','1 B 2 A 3 C','B A C']},
        {id:'IR2',task:'three-way IR matching',taskType:'ir_match',prompt:'Match: A=3-methyl-2-butanone, B=2-methylpropanoic acid, C=methyl propyl ether. Spectrum 1 has a very broad 2500-3300 O-H plus strong C=O. Spectrum 2 has a strong C=O but no broad O-H. Spectrum 3 lacks both. Type 1=B,2=A,3=C.',accepted:['1=B,2=A,3=C','1 B 2 A 3 C','B A C']},
        {id:'IR3',task:'IR practice',taskType:'ir_practice',prompt:'A spectrum has a strong sharp C=O signal but no broad O-H region. Which is more consistent: ketone or alcohol?',accepted:['ketone']},
        {id:'IR4',task:'IR practice',taskType:'ir_practice',prompt:'A spectrum has a broad O-H region and no carbonyl peak. Which is more consistent: alcohol or ketone?',accepted:['alcohol']}
      ]
    },
    {
      id:'functional_groups',label:'Functional-group recognition',source:'Chapter 2.1–2.6',foundationDay:1,
      teaching:'Identify functional groups from connectivity and characteristic bonds, not from molecular formula alone.',
      hint:'Find the characteristic atom-and-bond pattern first.',
      items:[
        {id:'G1',task:'classification',taskType:'functional_group',prompt:'What functional group is present in CH3CH2OH?',accepted:['alcohol','hydroxyl']},
        {id:'G2',task:'classification',taskType:'functional_group',prompt:'What functional group is present in CH3COCH3?',accepted:['ketone']},
        {id:'G3',task:'classification',taskType:'functional_group',prompt:'What functional group is present in CH3CH2OCH3?',accepted:['ether']},
        {id:'G4',task:'classification',taskType:'functional_group',prompt:'What functional group is present in CH3CH2CONH2?',accepted:['amide']}
      ]
    },
    {
      id:'relationships',label:'Relationship between two structures',source:'Chapter 2.1–2.6 + Chapter 4',foundationDay:null,
      teaching:'First compare molecular formula, then connectivity, then three-dimensional arrangement. Same connectivity and same stereochemistry is the same molecule; same formula with different connectivity gives constitutional isomers; same connectivity with different stereochemistry gives stereoisomers.',
      hint:'Use the order formula → connectivity → stereochemistry. Do not classify from how different the drawings look.',
      items:[
        {id:'L1',task:'relationship classification',taskType:'relationship',prompt:'Two drawings both represent n-butane with the same connectivity; one is simply drawn from the opposite end. Relationship?',accepted:['same molecule','same']},
        {id:'L2',task:'relationship classification',taskType:'relationship',prompt:'Ethanol and dimethyl ether both have formula C2H6O but different connectivity. Relationship?',accepted:['constitutional isomers','constitutional isomer','structural isomers','structural isomer']},
        {id:'L3',task:'relationship classification',taskType:'relationship',prompt:'cis-1,2-dimethylcyclohexane and trans-1,2-dimethylcyclohexane have the same connectivity but different spatial arrangement. Relationship?',accepted:['stereoisomers','stereoisomer']},
        {id:'L4',task:'relationship classification',taskType:'relationship',prompt:'Propane and butane do not have the same molecular formula. Relationship under the choices same molecule, constitutional isomers, stereoisomers, or none?',accepted:['none','none of the above']},
        {id:'L5',task:'relationship classification',taskType:'relationship',prompt:'Two chair drawings are related only by a chair flip and represent the same substituted cyclohexane with every substituent keeping its up/down identity. Relationship?',accepted:['same molecule','same']},
        {id:'L6',task:'relationship classification',taskType:'relationship',prompt:'1-butanol and diethyl ether have formula C4H10O but different connectivity. Relationship?',accepted:['constitutional isomers','constitutional isomer','structural isomers','structural isomer']},
        {id:'L7',task:'relationship classification',taskType:'relationship',prompt:'(R)-2-butanol and (S)-2-butanol have the same connectivity but opposite configuration. Relationship?',accepted:['stereoisomers','stereoisomer','enantiomers','enantiomer']},
        {id:'L8',task:'relationship classification',taskType:'relationship',prompt:'Cyclobutane is C4H8 and butane is C4H10. Relationship under the choices same molecule, constitutional isomers, stereoisomers, or none?',accepted:['none','none of the above']}
      ]
    },
    {
      id:'boiling_points',label:'Boiling-point ranking',source:'Chapter 2.1–2.6',foundationDay:null,
      teaching:'Boiling point rises with stronger intermolecular attractions and, within similar nonpolar compounds, often with greater surface area. Hydrogen bonding usually dominates over comparable dispersion-only molecules; branching often lowers boiling point among similar alkanes.',
      hint:'Rank the strongest intermolecular force first, then use molecular size/surface area for close comparisons.',
      items:[
        {id:'B1',task:'four-way boiling ranking',taskType:'boiling_rank',prompt:'Rank lowest to highest boiling point: A=propane, B=dimethyl ether, C=ethanol, D=ethylene glycol. Type A<B<C<D.',accepted:['A<B<C<D','A B C D','ABCD']},
        {id:'B2',task:'four-way boiling ranking',taskType:'boiling_rank',prompt:'Rank lowest to highest boiling point: A=neopentane, B=isopentane, C=n-pentane, D=1-butanol. Type A<B<C<D.',accepted:['A<B<C<D','A B C D','ABCD']},
        {id:'B3',task:'boiling practice',taskType:'boiling_practice',prompt:'Among isomeric alkanes, which usually has the lower boiling point: the more branched or less branched structure?',accepted:['more branched','the more branched','branched']},
        {id:'B4',task:'boiling practice',taskType:'boiling_practice',prompt:'Why does an alcohol often boil higher than a similarly sized ether?',rubric:{require:[['hydrogen bond','hydrogen bonding'],['stronger','higher boiling','more energy']],error:'BOILING_REASONING_INCOMPLETE'}}
      ]
    },
    {
      id:'nomenclature',label:'Alkane IUPAC naming',source:'Chapter 4',foundationDay:null,
      teaching:'Choose the longest parent chain, number from the end that gives the first substituent the lowest locant, identify substituents, and assemble the systematic name.',
      hint:'Find the longest continuous carbon chain before numbering branches.',
      items:[
        {id:'N1',task:'name production',taskType:'name',prompt:'Give the IUPAC name for CH3-CH(CH3)-CH2-CH2-CH3.',accepted:['2-methylpentane','2 methylpentane']},
        {id:'N2',task:'name production',taskType:'name',prompt:'Give the IUPAC name for CH3-CH2-CH(CH3)-CH2-CH3.',accepted:['3-methylpentane','3 methylpentane']},
        {id:'N3',task:'name production',taskType:'name',prompt:'Give the IUPAC name for CH3-CH(CH3)-CH(CH3)-CH3.',accepted:['2,3-dimethylbutane','2 3 dimethylbutane','2,3 dimethylbutane']},
        {id:'N4',task:'name production',taskType:'name',prompt:'Give the IUPAC name for CH3-C(CH3)2-CH2-CH3.',accepted:['2,2-dimethylbutane','2 2 dimethylbutane','2,2 dimethylbutane']}
      ]
    },
    {
      id:'isomers',label:'Constitutional-isomer drawing + formula reasoning',source:'Chapter 2.1–2.6 + Chapter 4',foundationDay:null,
      teaching:'Constitutional isomers share a molecular formula but differ in connectivity. When a prompt requires a particular functional group, satisfy both the formula and the connectivity pattern for that group.',
      hint:'Check atom count and unsaturation first, then verify the requested functional group.',
      items:[
        {id:'I1',task:'two original structures',taskType:'isomer_draw',paper:true,prompt:'On paper, for C3H7NO draw one constitutional isomer containing an amide and a different constitutional isomer containing an amine but not an amide. Then type one valid pair of names: propanamide; 3-aminopropanal.',accepted:['propanamide; 3-aminopropanal','propanamide 3 aminopropanal','propanamide and 3-aminopropanal']},
        {id:'I2',task:'two original structures',taskType:'isomer_draw',paper:true,prompt:'On paper, for C2H5NO draw one constitutional isomer containing an amide and a different constitutional isomer containing an amine but not an amide. Then type one valid pair of names: acetamide; aminoacetaldehyde.',accepted:['acetamide; aminoacetaldehyde','acetamide aminoacetaldehyde','acetamide and aminoacetaldehyde']},
        {id:'I3',task:'isomer practice',taskType:'isomer_practice',prompt:'How many constitutional isomers does C4H10 have?',accepted:['2','two']},
        {id:'I4',task:'isomer practice',taskType:'isomer_practice',prompt:'Two compounds have the same molecular formula but different atom connectivity. What relationship do they have?',accepted:['constitutional isomers','constitutional isomer','structural isomers','structural isomer']}
      ]
    },
    {
      id:'three_d',label:'Three-dimensional bond-line meaning',source:'Chapter 2.1–2.6',foundationDay:null,
      teaching:'Solid wedges project toward the viewer, dashed wedges project behind the page, and ordinary lines lie approximately in the page. Preserve this information when deciding whether two drawings are the same or stereoisomeric.',
      hint:'Translate every wedge/dash into a spatial direction before comparing structures.',
      items:[
        {id:'D1',task:'3D interpretation',taskType:'three_d',prompt:'What does a solid wedge bond mean?',accepted:['toward viewer','toward the viewer','out of page','out of the page','toward you']},
        {id:'D2',task:'3D interpretation',taskType:'three_d',prompt:'What does a dashed wedge bond mean?',accepted:['behind page','behind the page','away from viewer','away from the viewer','away from you']},
        {id:'D3',task:'3D interpretation',taskType:'three_d',prompt:'During a chair flip, does an up substituent become down?',accepted:['no','no it stays up','stays up','up stays up']},
        {id:'D4',task:'3D interpretation',taskType:'three_d',prompt:'A normal straight bond is approximately where relative to the page?',accepted:['in plane','in the plane','plane of page','plane of the page']}
      ]
    },
    {
      id:'conformations',label:'Newman projections + conformational energy',source:'Chapter 4',foundationDay:null,
      teaching:'Staggered conformations are lower than eclipsed ones. Anti is usually the lowest staggered arrangement for large groups, gauche is a higher staggered minimum, and eclipsing raises torsional/steric energy.',
      hint:'Identify staggered versus eclipsed first, then compare anti versus gauche and the size of eclipsing interactions.',
      items:[
        {id:'C1',task:'rank four Newman descriptions',taskType:'newman_rank',prompt:'Rank least stable to most stable: A=eclipsed with CH3/CH3 eclipsing, B=eclipsed with only CH3/H eclipsing, C=staggered gauche, D=staggered anti. Type A<B<C<D.',accepted:['A<B<C<D','A B C D','ABCD']},
        {id:'C2',task:'rank four Newman descriptions',taskType:'newman_rank',prompt:'Rank least stable to most stable: P=staggered anti, Q=eclipsed with the two largest groups eclipsing, R=staggered gauche, S=eclipsed with only large/H eclipsing. Type Q<S<R<P.',accepted:['Q<S<R<P','Q S R P','QSRP']},
        {id:'C3',task:'Newman/energy-curve production',taskType:'newman_energy_draw',paper:true,prompt:'On paper, draw Newman projections for butane at 0°, 180°, and 300°. Then type: 0 eclipsed; 180 anti; 300 gauche.',accepted:['0 eclipsed; 180 anti; 300 gauche','0 eclipsed 180 anti 300 gauche']},
        {id:'C4',task:'Newman/energy-curve production',taskType:'newman_energy_draw',paper:true,prompt:'On paper, draw Newman projections for butane at 60°, 180°, and 240°. Then type: 60 gauche; 180 anti; 240 gauche.',accepted:['60 gauche; 180 anti; 240 gauche','60 gauche 180 anti 240 gauche']},
        {id:'C5',task:'energy explanation',taskType:'newman_energy_explain',prompt:'Why is a gauche staggered butane conformation higher in energy than the anti conformation?',rubric:{require:[['gauche'],['steric','repulsion','crowding'],['anti','farther apart','180']],error:'CONFORMATION_REASONING_INCOMPLETE'}},
        {id:'C6',task:'energy explanation',taskType:'newman_energy_explain',prompt:'Why is an eclipsed conformation higher in energy than a staggered conformation around a C-C single bond?',rubric:{require:[['eclipsed'],['torsional','bond repulsion','electron repulsion'],['staggered','lower']],error:'CONFORMATION_REASONING_INCOMPLETE'}},
        {id:'C7',task:'Newman practice',taskType:'conformation_practice',prompt:'In a staggered Newman projection, the two largest groups are 180° apart. What is this called?',accepted:['anti']},
        {id:'C8',task:'Newman practice',taskType:'conformation_practice',prompt:'In a staggered Newman projection, the two largest groups are 60° apart. What is this called?',accepted:['gauche']}
      ]
    },
    {
      id:'cycloalkanes',label:'Ring strain + cyclohexane chairs',source:'Chapter 4',foundationDay:null,
      teaching:'Small rings pay angle and torsional strain. Cyclohexane chair flips exchange axial/equatorial while preserving up/down. Lower-energy chairs place bulky substituents equatorial whenever stereochemistry permits.',
      hint:'For small rings identify strain; for chairs preserve up/down and compare how many large groups are axial.',
      items:[
        {id:'Y1',task:'ring-strain explanation',taskType:'ring_strain',prompt:'Give one reason cyclopropane is much higher in energy than an open-chain three-carbon alkane.',rubric:{require:[['angle strain','60','bond angle','compressed angle','torsional strain','eclipsed']],error:'RING_STRAIN_INCOMPLETE'}},
        {id:'Y2',task:'ring-strain explanation',taskType:'ring_strain',prompt:'Give one reason cyclobutane is higher in energy than a comparable open-chain alkane.',rubric:{require:[['angle strain','bond angle','torsional strain','eclipsed','strain']],error:'RING_STRAIN_INCOMPLETE'}},
        {id:'Y3',task:'two-chair production',taskType:'chair_draw',paper:true,prompt:'On paper, draw both chair conformations of trans-1,2-dimethylcyclohexane. Then type the lower-energy placement: diequatorial.',accepted:['diequatorial','both equatorial','equatorial equatorial']},
        {id:'Y4',task:'two-chair production',taskType:'chair_draw',paper:true,prompt:'On paper, draw both chair conformations of cis-1,3-dimethylcyclohexane. Then type the lower-energy placement: diequatorial.',accepted:['diequatorial','both equatorial','equatorial equatorial']},
        {id:'Y5',task:'chair-stability choice',taskType:'chair_choice',prompt:'For trans-1,4-dimethylcyclohexane, which arrangement is the lower-energy chair when available: diequatorial or diaxial?',accepted:['diequatorial','both equatorial','equatorial']},
        {id:'Y6',task:'chair-stability choice',taskType:'chair_choice',prompt:'For cis-1,2-dimethylcyclohexane, must a chair have one methyl axial and one methyl equatorial, or can both be equatorial at once?',accepted:['one axial one equatorial','one axial and one equatorial','axial equatorial']},
        {id:'Y7',task:'chair practice',taskType:'chair_practice',prompt:'During a chair flip, what happens to axial/equatorial and what happens to up/down?',rubric:{require:[['axial becomes equatorial','equatorial becomes axial','switch axial'],['up stays up','down stays down','up/down stays','preserved']],error:'CHAIR_FLIP_INCOMPLETE'}},
        {id:'Y8',task:'chair practice',taskType:'chair_practice',prompt:'For a monosubstituted cyclohexane with a bulky substituent, is the substituent generally more stable axial or equatorial?',accepted:['equatorial']}
      ]
    }
  ]);

  // Fall 2025 historical exam proportions normalized from 100 points to the
  // current 130-point practice total. Multipart historical questions are split
  // into scored subslots so the practice system can preserve partial-credit style.
  const TEST1_BLUEPRINT=Object.freeze([
    {section:'1a',skill:'representations',taskType:'bond_line_draw',points:3,paper:true},
    {section:'1b',skill:'intermolecular_forces',taskType:'imf',points:4},
    {section:'2a',skill:'formal_charge',taskType:'formal_charge',points:5},
    {section:'2b',skill:'hybridization',taskType:'hybridization',points:3},
    {section:'3',skill:'ir',taskType:'ir_match',points:12},
    {section:'4',skill:'conformations',taskType:'newman_rank',points:10},
    {section:'5',skill:'cycloalkanes',taskType:'ring_strain',points:5},
    {section:'6a',skill:'relationships',taskType:'relationship',points:7},
    {section:'6b',skill:'relationships',taskType:'relationship',points:7},
    {section:'6c',skill:'relationships',taskType:'relationship',points:6},
    {section:'6d',skill:'relationships',taskType:'relationship',points:6},
    {section:'7',skill:'boiling_points',taskType:'boiling_rank',points:5},
    {section:'8',skill:'cycloalkanes',taskType:'chair_draw',points:21,paper:true},
    {section:'9',skill:'isomers',taskType:'isomer_draw',points:10,paper:true},
    {section:'10',skill:'cycloalkanes',taskType:'chair_choice',points:5},
    {section:'11a',skill:'conformations',taskType:'newman_energy_draw',points:17,paper:true},
    {section:'11b',skill:'conformations',taskType:'newman_energy_explain',points:4}
  ]);

  function skill(id){return SKILLS.find(x=>x.id===id)||null;}
  function item(skillId,itemId){const s=skill(skillId);return s?s.items.find(x=>x.id===itemId)||null:null;}
  function itemsFor(slot){
    const s=skill(slot.skill);if(!s)return[];
    return s.items.filter(x=>!slot.taskType||x.taskType===slot.taskType);
  }
  function alternate(skillId,itemId,excluded,taskType){
    const s=skill(skillId);if(!s)return null;
    const block=new Set(excluded||[]);block.add(itemId);
    const pool=s.items.filter(x=>!taskType||x.taskType===taskType);
    return pool.find(x=>!block.has(x.id))||pool.find(x=>x.id!==itemId)||pool[0]||null;
  }

  return {META,F25_EXAM,CALIBRATION,SKILLS,TEST1_BLUEPRINT,skill,item,itemsFor,alternate};
});
