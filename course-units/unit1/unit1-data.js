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

  const TEACHER_STUDY_TEST=Object.freeze({
    label:'Dr. Meadows teacher-issued 2026 Test 1 study test',
    documentHeader:'CHM 221 F25 Test 1',
    currentUse:'Provided by Dr. Meadows to the Fall 2026 class as the Test 1 study material.',
    points:100,
    minutes:50,
    numberedQuestions:11,
    note:'Although the document header says F25, its current instructional role is teacher-issued Fall 2026 study material. Treat it as the primary current study-test source, not merely historical evidence.',
    questionMap:[
      {section:'1',focus:'bond-line drawing + intermolecular forces'},
      {section:'2',focus:'formal charge + hybridization'},
      {section:'3',focus:'IR spectrum matching'},
      {section:'4',focus:'Newman stability ranking'},
      {section:'5',focus:'cyclopropane ring-strain explanation'},
      {section:'6',focus:'relationship classification across four structure pairs'},
      {section:'7',focus:'boiling-point ranking'},
      {section:'8',focus:'draw two cyclohexane chairs + choose lower-energy chair'},
      {section:'9',focus:'draw amine and amide constitutional isomers from a molecular formula'},
      {section:'10',focus:'substituted-cyclohexane stability'},
      {section:'11',focus:'draw Newman projections on an energy curve + explain conformational energy'}
    ],
    observations:[
      'all work is written on the exam and time management is explicitly part of the exam',
      'multiple prompts are explicitly sourced from homework or the problem set',
      'the study test requires bond-line drawing, formal-charge labeling, hybridization, IR matching, Newman ranking, ring-strain explanation, relationship classification, boiling-point ranking, chair drawing, constitutional-isomer drawing, and Newman/energy-curve work',
      'visual production and structure reasoning carry much more weight than isolated vocabulary recall'
    ]
  });

  const CALIBRATION=Object.freeze({
    currentScope:'Fall 2026 CHM 221 syllabus + current professor materials remain authoritative for what is testable now.',
    strongestCurrentStudy:'The uploaded Dr. Meadows study test is teacher-issued Fall 2026 Test 1 preparation material and is the primary current practice blueprint.',
    currentPracticeDesign:'The teacher study test task proportions are normalized from its 100-point paper format to the current 130-point adaptive practice scale without replacing the teacher test itself.',
    parallelForms:'Fresh Form A and Form B use original molecules and wording while preserving the teacher study test task families and proportions.',
    nextSource:'If Dr. Meadows releases a newer Fall 2026 Practice Test 1 or revised study guide, it supersedes this blueprint.',
    principles:[
      'keep the teacher-issued study test as a distinct first-line study resource',
      'favor written production and structure reasoning over recognition-only questions',
      'preserve the current 2026 chapter scope',
      'represent the teacher study test 11-question structure with multipart subparts scored separately',
      'include homework/problem-set style transfer rather than trivia',
      'use original molecules and wording for parallel forms instead of copying the teacher study test into the public site',
      'never label a recycled form as fresh'
    ]
  });

  // NOTE: The full skill/item bank follows in the branch version. This file was not safely replaceable by a partial edit.
  // This sentinel should never be committed.
  throw new Error('INCOMPLETE_SAFE_EDIT');
});
