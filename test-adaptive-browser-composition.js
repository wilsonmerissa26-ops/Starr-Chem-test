/* ============================================================
   CANONICAL ADAPTIVE MODEL BROWSER COMPOSITION CONTRACT

   Executes the SAME source modules in a browser-like VM using the exact
   temporary CommonJS shim policy of day1-adaptive-browser-loader.js.
   There is no second browser implementation and no teaching logic in loader.
   ============================================================ */
'use strict';
var assert=require('assert');
var fs=require('fs');
var vm=require('vm');
var loader=require('./day1-adaptive-browser-loader.js');

var ctx={console:console,Date:Date,Math:Math,JSON:JSON,setTimeout:setTimeout,clearTimeout:clearTimeout};
vm.createContext(ctx);
var exportsByPath={};
function remember(path,value){
  exportsByPath[path]=value;exportsByPath['./'+path]=value;
  if(path.indexOf('/')>=0){var name=path.slice(path.lastIndexOf('/')+1);exportsByPath[name]=value;exportsByPath['./'+name]=value;}
}
function localRequire(path){
  if(Object.prototype.hasOwnProperty.call(exportsByPath,path))return exportsByPath[path];
  throw new Error('browser composition dependency not ready: '+path);
}

assert.ok(Array.isArray(loader.MANIFEST)&&loader.MANIFEST.length===10,'loader manifest should contain only the ten canonical modules');
loader.MANIFEST.forEach(function(entry){
  var src=fs.readFileSync(entry.path,'utf8');
  var moduleShim={exports:{}};
  ctx.module=moduleShim;ctx.exports=moduleShim.exports;ctx.require=localRequire;
  vm.runInContext(src,ctx,{filename:entry.path});
  var value=moduleShim.exports;
  if((!value||Object.keys(value).length===0)&&ctx[entry.name])value=ctx[entry.name];
  assert.ok(value,entry.path+' loaded without an export');
  ctx[entry.name]=value;
  remember(entry.path,value);
  delete ctx.module;delete ctx.exports;delete ctx.require;
});

[
  'StudentModelIdkRouter','MathStrategyAdapters','MathStrategyCost','MathStrategyLibrary',
  'MathStrategyEngine','MathPrerequisiteContent','Day1AdaptiveMathModel',
  'Day1ProblemSourceAdapters','MathAnswerChecker','Day1AdaptiveRuntime'
].forEach(function(name){assert.ok(ctx[name],name+' missing from browser global');});

var normalized=ctx.Day1ProblemSourceAdapters.fromClassroomPrompt('fractions_percent','15% of 80 =',{sourceId:'browser-15-80'});
var state=ctx.Day1AdaptiveRuntime.createLearnerState({studentId:'browser-test'});
var started=ctx.Day1AdaptiveRuntime.startProblem(state,normalized);
assert.strictEqual(started.plan.chosenStrategyId,'percent_10_plus_5');
assert.strictEqual(ctx.MathAnswerChecker.check(normalized,'12%',started.plan),true);
assert.strictEqual(ctx.MathAnswerChecker.check(normalized,'15%',started.plan),false);
var first=ctx.Day1AdaptiveRuntime.requestSupport(state,'first_step');
assert.strictEqual(first.steps.length,1);
assert.strictEqual(first.strategyId,started.plan.chosenStrategyId);

var repair=ctx.Day1AdaptiveRuntime.openPrerequisiteRepair(state,'halving',ctx.StudentModelIdkRouter.IDK_REASONS.DONT_UNDERSTAND);
assert.strictEqual(repair.action,'teach_prerequisite');
assert.ok(repair.lesson);
var fixed=ctx.Day1AdaptiveRuntime.submitPrerequisiteCheck(state,repair.checkItem.id,repair.checkItem.answer);
assert.strictEqual(fixed.action,'return_to_parent_problem');
assert.strictEqual(fixed.problem.sourceId,'browser-15-80');

assert.strictEqual(ctx.module,undefined);
assert.strictEqual(ctx.require,undefined);

console.log('PASS canonical adaptive model composes in browser context from the same source files');
