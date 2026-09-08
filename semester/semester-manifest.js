(function(root,factory){
'use strict';
var api=factory();
if(typeof module==='object'&&module.exports)module.exports=api;
else root.AStarryiaSemesterManifest=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function skill(id,title){return Object.freeze({id:id,title:title});}
function moduleDef(id,title,chapter,href,skills,status){return Object.freeze({id:id,title:title,chapter:chapter||null,href:href||null,skills:Object.freeze(skills||[]),buildStatus:status||'planned'});}
function unit(id,title,testDate,modules){return Object.freeze({id:id,title:title,testDate:testDate,modules:Object.freeze(modules)});}

var COURSE=Object.freeze({
  id:'chm221-fall-2026',
  studentId:'astarryia',
  studentName:'AStarryia',
  title:'CHM 221 Organic Chemistry',
  instructor:'Dr. Meadows',
  term:'Fall 2026',
  finalDate:'2026-12-10',
  finalTime:'19:00',
  cumulativeTests:true
});

var UNITS=Object.freeze([
  unit('unit1','Unit 1 - Foundations, structure, and alkanes','2026-09-03',[
    moduleDef('u1-foundations','Readiness and foundation repair','Foundation','../course-hub/#foundation',[], 'live'),
    moduleDef('u1-bond-line','Bond-Line Reading','Chapter 1 / 2','../course-units/unit1/bond-line/',[], 'live'),
    moduleDef('u1-test1','Adaptive Test 1 Tutor','Chapters 1, 2.1-2.6, and 4','../course-units/unit1/test1/',[], 'live')
  ]),
  unit('unit2','Unit 2 - Stereochemistry, resonance, acids and bases','2026-09-28',[
    moduleDef('u2-ch5','Chapter 5 Stereoisomerism','Chapter 5','../course-units/unit2/chapter5/',[
      skill('u2.c5.isomer_classification','Isomer classification and connectivity'),
      skill('u2.c5.chirality_stereocenters','Chirality and stereocenters'),
      skill('u2.c5.cip_rs','CIP priority and R/S configuration'),
      skill('u2.c5.stereoisomer_relationships','Enantiomer, diastereomer, and identical relationships'),
      skill('u2.c5.meso_symmetry','Meso compounds and internal symmetry'),
      skill('u2.c5.fischer_projections','Fischer projections'),
      skill('u2.c5.ez_alkenes','E/Z alkene configuration'),
      skill('u2.c5.optical_activity','Optical activity and racemic mixtures'),
      skill('u2.c5.enantiomer_mixtures_quantitative','Specific rotation and enantiomeric excess'),
      skill('u2.c5.other_chirality','Chirality without a tetrahedral stereocenter')
    ],'preview'),
    moduleDef('u2-ch2-resonance','Chapter 2.7-2.13 Resonance Continuation','Chapter 2.7-2.13','../course-units/unit2/chapter2-resonance/',[
      skill('u2.c2.rank_resonance','Rank the significance of resonance contributors'),
      skill('u2.c2.resonance_hybrid','Draw and interpret a resonance hybrid'),
      skill('u2.c2.localized_delocalized','Identify localized and delocalized lone pairs'),
      skill('u2.c2.arrow_reasoning','Use valid electron movement and preserve atom connectivity'),
      skill('u2.c2.resonance_transfer','Apply resonance reasoning in unfamiliar structures')
    ],'planned'),
    moduleDef('u2-ch3','Chapter 3 Acids and Bases','Chapter 3','../course-units/unit2/chapter3/',[
      skill('u2.c3.proton_transfer','Draw proton-transfer mechanisms and products'),
      skill('u2.c3.pka_acidity','Use pKa values to compare acids'),
      skill('u2.c3.pka_basicity','Use pKa values to compare basicity'),
      skill('u2.c3.equilibrium_pka','Use pKa values to predict equilibrium position'),
      skill('u2.c3.stability_atom','Conjugate-base stability: atom'),
      skill('u2.c3.stability_resonance','Conjugate-base stability: resonance'),
      skill('u2.c3.stability_induction','Conjugate-base stability: inductive effects'),
      skill('u2.c3.stability_orbitals','Conjugate-base stability: orbitals'),
      skill('u2.c3.stability_all','Combine all four stability factors'),
      skill('u2.c3.cationic_acids','Assess relative acidity of cationic acids'),
      skill('u2.c3.equilibrium_no_pka','Predict equilibrium without a pKa table'),
      skill('u2.c3.reagent_choice','Choose an appropriate proton-transfer reagent'),
      skill('u2.c3.lewis_acid_base','Identify Lewis acids and Lewis bases')
    ],'planned'),
    moduleDef('u2-test2','Cumulative Test 2 Tutor','Unit 2 cumulative','../course-units/unit2/test2/',[],'planned')
  ]),
  unit('unit3','Unit 3 - Reactivity, mechanisms, substitution and elimination','2026-10-26',[
    moduleDef('u3-ch6','Chapter 6 Chemical Reactivity and Mechanisms','Chapter 6','../course-units/unit3/chapter6/',[
      skill('u3.c6.delta_h','Predict reaction enthalpy from bond changes'),
      skill('u3.c6.nuc_elec','Identify nucleophilic and electrophilic centers'),
      skill('u3.c6.arrow_patterns','Identify arrow-pushing patterns'),
      skill('u3.c6.arrow_sequence','Identify a sequence of arrow-pushing patterns'),
      skill('u3.c6.curved_arrows','Draw chemically valid curved arrows'),
      skill('u3.c6.carbocation_rearrangement','Predict carbocation rearrangements')
    ],'planned'),
    moduleDef('u3-ch7','Chapter 7 Substitution and Elimination','Chapter 7','../course-units/unit3/chapter7/',[
      skill('u3.c7.sn2','SN2 mechanism and product'),
      skill('u3.c7.sn2_transition','SN2 transition state'),
      skill('u3.c7.e2_regio','E2 regiochemical outcome'),
      skill('u3.c7.e2_stereo','E2 stereochemical outcome'),
      skill('u3.c7.e2_product','E2 product prediction'),
      skill('u3.c7.sn1','SN1 mechanism and product'),
      skill('u3.c7.competition','Substitution versus elimination product selection'),
      skill('u3.c7.retrosynthesis','Retrosynthesis and synthesis of a target molecule'),
      skill('u3.c7.alkene_synthesis','Alkene target synthesis using elimination')
    ],'planned'),
    moduleDef('u3-test3','Cumulative Test 3 Tutor','Unit 3 cumulative','../course-units/unit3/test3/',[],'planned')
  ]),
  unit('unit4','Unit 4 - Alkene additions and alkynes','2026-11-16',[
    moduleDef('u4-ch8','Chapter 8 Alkene Reactions','Chapter 8','../course-units/unit4/chapter8/',[
      skill('u4.c8.hydrohalogenation','Hydrohalogenation mechanism'),
      skill('u4.c8.hydrohalogenation_rearrangement','Hydrohalogenation with carbocation rearrangement'),
      skill('u4.c8.acid_hydration','Acid-catalyzed hydration mechanism and product'),
      skill('u4.c8.hydroboration','Hydroboration-oxidation products'),
      skill('u4.c8.hydrogenation','Catalytic hydrogenation products'),
      skill('u4.c8.halohydrin','Halohydrin formation'),
      skill('u4.c8.syn_dihydroxylation','Syn-dihydroxylation products'),
      skill('u4.c8.ozonolysis','Ozonolysis products'),
      skill('u4.c8.reaction_selection','Predict products from alkene reaction conditions'),
      skill('u4.c8.one_step_synthesis','Plan a one-step synthesis'),
      skill('u4.c8.move_halogen_oh','Change the position of a halogen or OH group'),
      skill('u4.c8.move_pi','Change the position of a pi bond')
    ],'planned'),
    moduleDef('u4-ch9','Chapter 9 Alkynes','Chapter 9','../course-units/unit4/chapter9/',[
      skill('u4.c9.alkyne_naming','Assemble the systematic name of an alkyne'),
      skill('u4.c9.keto_enol','Acid-catalyzed keto-enol tautomerization'),
      skill('u4.c9.alkyne_hydration','Choose reagents for alkyne hydration'),
      skill('u4.c9.terminal_base','Select a base for deprotonating a terminal alkyne'),
      skill('u4.c9.alkylation','Alkylate terminal alkynes'),
      skill('u4.c9.synthesis','Use alkynes in synthesis')
    ],'planned'),
    moduleDef('u4-test4','Cumulative Test 4 Tutor','Unit 4 cumulative','../course-units/unit4/test4/',[],'planned')
  ]),
  unit('unit5','Unit 5 - Radicals, synthesis, and cumulative final','2026-12-10',[
    moduleDef('u5-ch11','Chapter 11 Synthesis','Chapter 11','../course-units/unit5/chapter11/',[
      skill('u5.c11.functional_group_change','Change functional-group identity or position'),
      skill('u5.c11.carbon_skeleton','Change the carbon skeleton'),
      skill('u5.c11.synthesis_strategy','Approach a synthesis problem'),
      skill('u5.c11.retrosynthesis','Perform multistep retrosynthetic analysis')
    ],'planned'),
    moduleDef('u5-ch10','Chapter 10 Radical Reactions','Chapter 10','../course-units/unit5/chapter10/',[
      skill('u5.c10.radical_resonance','Draw resonance structures of radicals'),
      skill('u5.c10.weakest_ch','Identify the weakest C-H bond'),
      skill('u5.c10.fishhook','Draw fishhook arrows for radical processes'),
      skill('u5.c10.halogenation_mechanism','Draw radical halogenation mechanisms'),
      skill('u5.c10.bromination_major','Predict the major product of radical bromination'),
      skill('u5.c10.bromination_stereo','Predict stereochemical outcomes of radical bromination'),
      skill('u5.c10.allylic_bromination','Predict allylic bromination products'),
      skill('u5.c10.hbr_radical_addition','Predict radical HBr addition to an alkene')
    ],'planned'),
    moduleDef('u5-final','Test 5 and Cumulative Final Tutor','Entire semester','../course-units/unit5/final/',[],'planned')
  ])
]);

var LABS=Object.freeze([
  Object.freeze({id:'lab1',week:'2026-08-24',title:'IR, Functional Groups, and Molecular Models',supportOnly:true}),
  Object.freeze({id:'lab2',week:'2026-08-31',title:'Panacetin - Separations',supportOnly:true}),
  Object.freeze({id:'lab3',week:'2026-09-14',title:'NMR Theory - Online',supportOnly:true}),
  Object.freeze({id:'lab4',week:'2026-09-21',title:'NMR Problem Solving and NMR ID',supportOnly:true}),
  Object.freeze({id:'lab5',week:'2026-10-05',title:'Panacetin - Recrystallization',supportOnly:true}),
  Object.freeze({id:'lab6',week:'2026-10-12',title:'Panacetin - Characterization 1',supportOnly:true}),
  Object.freeze({id:'lab7',week:'2026-10-19',title:'Panacetin - Characterization 2',supportOnly:true}),
  Object.freeze({id:'lab8',week:'2026-10-26',title:'Unimolecular Solvolysis',supportOnly:true}),
  Object.freeze({id:'lab9a',week:'2026-11-09',title:'Ester Distillation',supportOnly:true}),
  Object.freeze({id:'lab9b',week:'2026-11-16',title:'Ester NMR',supportOnly:true})
]);

var WEEKS=Object.freeze([
  Object.freeze({start:'2026-08-17',focus:'Chapter 1 and Chapter 2.1-2.6',lab:'No lab'}),
  Object.freeze({start:'2026-08-24',focus:'Chapter 4',lab:'Lab 1'}),
  Object.freeze({start:'2026-08-31',focus:'Chapter 4, Practice Test 1, Test 1',lab:'Lab 2'}),
  Object.freeze({start:'2026-09-07',focus:'Chapter 5',lab:'No lab'}),
  Object.freeze({start:'2026-09-14',focus:'Chapter 2.7-2.13 and Chapter 3',lab:'Lab 3'}),
  Object.freeze({start:'2026-09-21',focus:'Chapter 3 and Test 2 practice',lab:'Lab 4'}),
  Object.freeze({start:'2026-09-28',focus:'Test 2 and Fall Break',lab:'No lab'}),
  Object.freeze({start:'2026-10-05',focus:'Chapter 6 and Chapter 7',lab:'Lab 5'}),
  Object.freeze({start:'2026-10-12',focus:'Chapter 7',lab:'Lab 6'}),
  Object.freeze({start:'2026-10-19',focus:'Chapter 7 and Test 3 practice',lab:'Lab 7'}),
  Object.freeze({start:'2026-10-26',focus:'Test 3 and Chapter 8',lab:'Lab 8'}),
  Object.freeze({start:'2026-11-02',focus:'Chapter 8',lab:'No lab'}),
  Object.freeze({start:'2026-11-09',focus:'Chapter 9',lab:'Lab 9 Part 1'}),
  Object.freeze({start:'2026-11-16',focus:'Chapter 9 practice and Test 4',lab:'Lab 9 Part 2'}),
  Object.freeze({start:'2026-11-23',focus:'Chapter 11',lab:'No lab'}),
  Object.freeze({start:'2026-11-30',focus:'Chapter 10 and course wrap-up',lab:'No lab'}),
  Object.freeze({start:'2026-12-07',focus:'Cumulative final review and Test 5 + Final',lab:'No lab'})
]);

function modules(){var out=[];UNITS.forEach(function(u){u.modules.forEach(function(m){out.push(Object.freeze(Object.assign({unitId:u.id,testDate:u.testDate},m)));});});return out;}
function moduleById(id){return modules().find(function(m){return m.id===id;})||null;}
function skillById(id){var found=null;modules().some(function(m){return m.skills.some(function(s){if(s.id===id){found=Object.freeze({moduleId:m.id,unitId:m.unitId,id:s.id,title:s.title});return true;}return false;});});return found;}
return Object.freeze({COURSE:COURSE,UNITS:UNITS,WEEKS:WEEKS,LABS:LABS,modules:modules,moduleById:moduleById,skillById:skillById});
});