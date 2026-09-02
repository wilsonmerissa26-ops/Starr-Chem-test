(function(root){
  'use strict';

  function requireCurriculum(){
    if(!root.Chapter5AdaptiveData)throw new Error('Chapter 5 curriculum data missing');
    if(!root.Chapter5AdaptiveSupport)throw new Error('Chapter 5 support routing missing');
    if(!root.StudentModelIdkRouter)throw new Error('Shared Student Model missing');
  }

  function prepare(){
    requireCurriculum();
    // test1-engine.js is already the validated adaptive runtime. Its browser
    // factory receives curriculum and support through these globals. On the
    // isolated Chapter 5 page we inject Chapter 5 data before loading that
    // exact engine file instead of copying or forking its mastery logic.
    root.Test1AdaptiveData=root.Chapter5AdaptiveData;
    root.Test1AdaptiveSupport=root.Chapter5AdaptiveSupport;
    return true;
  }

  function adopt(){
    if(!root.Test1AdaptiveEngine)throw new Error('Locked adaptive engine has not loaded');
    root.Chapter5AdaptiveEngine=root.Test1AdaptiveEngine;
    return root.Chapter5AdaptiveEngine;
  }

  root.Chapter5EngineBridge=Object.freeze({prepare:prepare,adopt:adopt});
})(typeof globalThis!=='undefined'?globalThis:this);
