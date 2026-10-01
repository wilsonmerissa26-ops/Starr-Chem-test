/* ============================================================
   PHASE 2A CANONICAL ENTRY BOUNDARY

   The wrappers are part of correctness, not optional convenience. Production
   modules must not bypass model validation/copy policy or runtime mutation/
   evidence guards by importing the internal *-core modules directly.
   Tests may intentionally import internals for adversarial checks.
   ============================================================ */
'use strict';
var assert=require('assert');
var fs=require('fs');
var path=require('path');

var allowedModelCore=new Set(['day1-adaptive-math-model-policy.js']);
var allowedRuntimeCore=new Set(['day1-adaptive-runtime.js']);
var offenders=[];

function walk(dir){
  fs.readdirSync(dir,{withFileTypes:true}).forEach(function(entry){
    if(entry.name==='.git'||entry.name==='node_modules')return;
    var full=path.join(dir,entry.name);
    if(entry.isDirectory())return walk(full);
    if(!entry.isFile()||!entry.name.endsWith('.js')||entry.name.startsWith('test-'))return;
    var rel=path.relative('.',full).replace(/\\/g,'/');
    var src=fs.readFileSync(full,'utf8');
    if(src.indexOf('day1-adaptive-math-model-core.js')>=0 && !allowedModelCore.has(rel)){
      offenders.push(rel+' imports model core directly');
    }
    if(src.indexOf('day1-adaptive-runtime-core.js')>=0 && !allowedRuntimeCore.has(rel)){
      offenders.push(rel+' imports runtime core directly');
    }
  });
}
walk('.');
assert.deepStrictEqual(offenders,[],'production code must consume canonical Phase 2A entries: '+offenders.join('; '));
console.log('PASS Phase 2A production modules cannot bypass canonical model/runtime entry policies');
