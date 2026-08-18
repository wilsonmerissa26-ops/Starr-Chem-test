/* ============================================================
   DAY 1 CANONICAL LIVE MATH COMPOSITION CONTRACT
   ============================================================ */
'use strict';
var assert=require('assert');
var fs=require('fs');
var html=fs.readFileSync('day1/index.html','utf8');

function pos(s){return html.indexOf(s);}
assert.ok(pos('../day1-adaptive-browser-loader.js')>=0,'live page must load canonical adaptive browser loader');
assert.ok(pos('adaptive-classroom-controller.js')>=0,'live page must load canonical adaptive classroom controller');
assert.ok(pos('../day1-adaptive-browser-loader.js')<pos('adaptive-classroom-controller.js'),'canonical model must start loading before controller binds');
assert.ok(pos('classroom-v5.js')<pos('adaptive-classroom-controller.js'),'base classroom must render before canonical controller enhances it');

// These files can remain in the repository for regression/history, but they
// may no longer own learner-facing math strategy decisions on /day1/.
[
  'math-problem-coach-v8.js',
  'math-exact-problem-teacher-v9.js',
  'math-lesson-stepper-v10.js',
  'guided-problem-tutor-v13.js'
].forEach(function(file){assert.strictEqual(pos(file),-1,file+' must not be loaded by live Day 1');});

// One canonical controller only.
assert.strictEqual((html.match(/adaptive-classroom-controller\.js/g)||[]).length,1);
assert.strictEqual((html.match(/day1-adaptive-browser-loader\.js/g)||[]).length,1);

console.log('PASS live Day 1 composition uses one canonical adaptive math controller');
