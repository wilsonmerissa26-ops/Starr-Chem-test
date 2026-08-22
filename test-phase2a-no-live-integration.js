/* ============================================================
   PHASE 2A NON-LIVE INTEGRATION CONTRACT

   Phase 2A is an isolated Node/core acceptance gate. The learner-facing Day 1
   page must not load any Phase 2A runtime/controller/model modules until the
   separate Phase 2B browser/live review explicitly authorizes that cutover.
   ============================================================ */
'use strict';
var assert=require('assert');
var fs=require('fs');

var html=fs.readFileSync('day1/index.html','utf8');
var forbidden=[
  'day1-adaptive-math-model',
  'day1-adaptive-runtime',
  'day1-problem-source-adapters',
  'math-answer-checker',
  'math-prerequisite-content',
  'math-student-model-policy',
  'teaching-plan-copy-policy',
  'route-efficiency-policy',
  'log-negative-estimate-planner'
];
forbidden.forEach(function(name){
  assert.ok(html.indexOf(name)<0,'Phase 2A module must not be live-loaded before Phase 2B: '+name);
});

// The current learner-facing stack remains the accepted pre-Phase2A runtime.
['math-problem-coach-v8.js','math-exact-problem-teacher-v9.js','math-lesson-stepper-v10.js','guided-problem-tutor-v13.js']
  .forEach(function(name){assert.ok(html.indexOf(name)>=0,'current live stack unexpectedly changed: '+name);});

console.log('PASS Phase 2A remains isolated from day1/index.html pending Phase 2B');
