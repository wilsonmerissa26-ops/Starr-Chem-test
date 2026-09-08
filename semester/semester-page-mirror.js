(function(root){
'use strict';
var script=root.document&&root.document.currentScript;if(!script)return;
var Store=root.AStarryiaSemesterStore,Bridge=root.AStarryiaSemesterAdaptiveBridge;if(!Store||!Bridge)return;
var moduleId=script.dataset.moduleId||'',prefix=script.dataset.storagePrefix||'',suffix=script.dataset.storageSuffix||'',title=script.dataset.title||'',hrefBase=script.dataset.hrefBase||root.location.pathname;
if(!moduleId||!prefix)return;
var lastRaw=null,lastSkill=null;
function currentLessonId(){try{return new URLSearchParams(root.location.search).get('skill');}catch(_){return null;}}
function key(id){return prefix+id+suffix;}
function mirror(){var id=currentLessonId();if(!id)return;var raw=null;try{raw=root.localStorage.getItem(key(id));}catch(_){return;}if(!raw||raw===lastRaw&&id===lastSkill)return;var session=null;try{session=JSON.parse(raw);}catch(_){return;}try{Bridge.capture(root.localStorage,{moduleId:moduleId,title:title,hrefBase:hrefBase},session);lastRaw=raw;lastSkill=id;root.document.documentElement.setAttribute('data-semester-save','ok');}catch(e){root.document.documentElement.setAttribute('data-semester-save','failed');root.document.documentElement.setAttribute('data-semester-save-error',String(e&&e.message||e).slice(0,160));}}
function soon(){root.setTimeout(mirror,0);}
root.document.addEventListener('click',soon,true);root.document.addEventListener('submit',soon,true);root.document.addEventListener('change',soon,true);root.addEventListener('pagehide',mirror);root.document.addEventListener('visibilitychange',function(){if(root.document.visibilityState==='hidden')mirror();});
root.setTimeout(function(){try{Bridge.visit(root.localStorage,{moduleId:moduleId,title:title,hrefBase:hrefBase},null);}catch(_){ }mirror();},0);
})(typeof globalThis!=='undefined'?globalThis:this);
