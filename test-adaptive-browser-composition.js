/* ============================================================
   CANONICAL ADAPTIVE MODEL BROWSER COMPOSITION CONTRACT

   Executes the SAME source modules in a browser-like VM with no CommonJS
   require/module globals. This prevents a second browser implementation from
   drifting away from the tested Node logic.
   ============================================================ */
'use strict';
var assert=require('assert');
var fs=require('fs');
var vm=require('vm');

var files=[
  'student-model-idk-router.js',
  'math-strategy-adapters.js',
  'math-strategy-cost.js',
  'math-strategy-library.js',
  'math-strategy-engine.js',
  'math-prerequisite-content.js',
  'day1-adaptive-math-model.js',
  'day1-problem-source-adapters.js',
  'day1-adaptive-runtime.js'
];
var ctx={console:console,Date:Date,Math:Math,JSON:JSON,setTimeout:setTimeout,clearTimeout:clearTimeout};
vm.createContext(ctx);
files.forEach(function(file){
  var src=fs.readFileSync(file,'utf8');
  vm.runInContext(src,ctx,{filename:file});
});

[
  'StudentModelIdkRouter','MathStrategyAdapters','MathStrategyCost','MathStrategyLibrary',
  'MathStrategyEngine','MathPrerequisiteContent','Day1AdaptiveMathModel',
  'Day1ProblemSourceAdapters','Day1AdaptiveRuntime'
].forEach(function(name){assert.ok(ctx[name],name+' missing from browser global');});

var normalized=ctx.Day1ProblemSourceAdapters.fromClassroomPrompt('fractions_percent','15% of 80 =',{sourceId:'browser-15-80'});
var state=ctx.Day1AdaptiveRuntime.createLearnerState({studentId:'browser-test'});
var started=ctx.Day1AdaptiveRuntime.startProblem(state,normalized);
assert.strictEqual(started.plan.chosenStrategyId,'percent_10_plus_5');
var first=ctx.Day1AdaptiveRuntime.requestSupport(state,'first_step');
assert.strictEqual(first.steps.length,1);
assert.strictEqual(first.strategyId,started.plan.chosenStrategyId);

var repair=ctx.Day1AdaptiveRuntime.openPrerequisiteRepair(state,'halving',ctx.StudentModelIdkRouter.IDK_REASONS.DONT_UNDERSTAND);
assert.strictEqual(repair.action,'teach_prerequisite');
assert.ok(repair.lesson);
var fixed=ctx.Day1AdaptiveRuntime.submitPrerequisiteCheck(state,repair.checkItem.id,repair.checkItem.answer);
assert.strictEqual(fixed.action,'return_to_parent_problem');
assert.strictEqual(fixed.problem.sourceId,'browser-15-80');

console.log('PASS canonical adaptive model composes in browser context from the same source files');
