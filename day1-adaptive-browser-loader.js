(function(root){
'use strict';

/* ============================================================
   DAY 1 ADAPTIVE BROWSER LOADER

   Composition only. No teaching, scoring, routing, or learner-state logic.
   Loads the same canonical CommonJS/UMD source files used by Node tests.
   A temporary module/require shim exists only while each script executes,
   then is removed. No eval and no duplicated browser implementation.
   ============================================================ */

var MANIFEST=[
  {path:'student-model-idk-router.js',name:'StudentModelIdkRouter'},
  {path:'math-strategy-adapters.js',name:'MathStrategyAdapters'},
  {path:'math-strategy-cost.js',name:'MathStrategyCost'},
  {path:'math-strategy-library.js',name:'MathStrategyLibrary'},
  {path:'math-strategy-engine.js',name:'MathStrategyEngine'},
  {path:'math-prerequisite-content.js',name:'MathPrerequisiteContent'},
  {path:'day1-adaptive-math-model.js',name:'Day1AdaptiveMathModel'},
  {path:'day1-problem-source-adapters.js',name:'Day1ProblemSourceAdapters'},
  {path:'day1-adaptive-runtime.js',name:'Day1AdaptiveRuntime'}
];

var exportsByPath={};
var readyPromise=null;

function aliases(path){
  var base='./'+path;
  var arr=[path,base];
  if(path.indexOf('/')>=0){
    var name=path.slice(path.lastIndexOf('/')+1);
    arr.push(name,'./'+name);
  }
  return arr;
}
function remember(path,value){aliases(path).forEach(function(k){exportsByPath[k]=value;});}
function localRequire(path){
  if(Object.prototype.hasOwnProperty.call(exportsByPath,path))return exportsByPath[path];
  throw new Error('Adaptive browser loader dependency not ready: '+path);
}
function baseUrl(){
  var s=document.currentScript;
  if(s&&s.src)return s.src.replace(/[^/]+$/,'');
  return new URL('./',document.baseURI).href;
}
function cleanShim(previous){
  if(previous.module===undefined)delete root.module;else root.module=previous.module;
  if(previous.exports===undefined)delete root.exports;else root.exports=previous.exports;
  if(previous.require===undefined)delete root.require;else root.require=previous.require;
}
function loadOne(entry,base){
  return new Promise(function(resolve,reject){
    var previous={module:root.module,exports:root.exports,require:root.require};
    var m={exports:{}};
    root.module=m;root.exports=m.exports;root.require=localRequire;
    var script=document.createElement('script');
    script.async=false;
    script.src=base+entry.path;
    script.onload=function(){
      try{
        var value=m.exports;
        if((!value||Object.keys(value).length===0)&&root[entry.name])value=root[entry.name];
        if(!value)throw new Error(entry.path+' loaded without an export');
        root[entry.name]=value;
        remember(entry.path,value);
        cleanShim(previous);
        resolve(value);
      }catch(err){cleanShim(previous);reject(err);}
    };
    script.onerror=function(){cleanShim(previous);reject(new Error('Failed to load '+entry.path));};
    (document.head||document.documentElement).appendChild(script);
  });
}
function start(){
  if(readyPromise)return readyPromise;
  var base=baseUrl();
  readyPromise=MANIFEST.reduce(function(p,entry){return p.then(function(){return loadOne(entry,base);});},Promise.resolve())
    .then(function(){
      root.Day1AdaptiveReady=true;
      if(typeof root.dispatchEvent==='function'&&typeof root.CustomEvent==='function')root.dispatchEvent(new root.CustomEvent('day1-adaptive-ready'));
      return root.Day1AdaptiveRuntime;
    })
    .catch(function(err){
      root.Day1AdaptiveReady=false;
      root.Day1AdaptiveLoadError=err;
      if(root.console&&console.error)console.error('[Day1AdaptiveLoader]',err);
      if(typeof root.dispatchEvent==='function'&&typeof root.CustomEvent==='function')root.dispatchEvent(new root.CustomEvent('day1-adaptive-error',{detail:{message:String(err&&err.message||err)}}));
      throw err;
    });
  return readyPromise;
}

root.Day1AdaptiveBrowserLoader={MANIFEST:MANIFEST.slice(),start:start,_remember:remember,_require:localRequire};
if(typeof module==='object'&&module.exports)module.exports=root.Day1AdaptiveBrowserLoader;

if(typeof document!=='undefined')start();
})(typeof globalThis!=='undefined'?globalThis:this);
