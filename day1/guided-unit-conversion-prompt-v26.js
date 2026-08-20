(function(root,factory){'use strict';
var api=factory();
if(typeof module==='object'&&module.exports)module.exports=api;
else{root.GuidedUnitConversionPromptV26=api;api.install(root.document);}
})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
var TARGET_QUESTION='2.4 g to mg =';
var OLD_STEP='What is the relationship between 1 g and mg?';
var NEW_STEP='How many milligrams are in 1 gram?';
var OLD_INTRO='First identify which unit is smaller.';
var NEW_INTRO='Start with the exact gram-to-milligram conversion factor.';
function tidy(v){return String(v==null?'':v).replace(/\s+/g,' ').trim();}
function repairedPrompt(question,stepPrompt){return tidy(question)===TARGET_QUESTION&&tidy(stepPrompt)===OLD_STEP?NEW_STEP:stepPrompt;}
function repairedIntro(question,intro){return tidy(question)===TARGET_QUESTION&&tidy(intro)===OLD_INTRO?NEW_INTRO:intro;}
function fix(doc){
 if(!doc)return;
 var view=doc.getElementById('view');if(!view)return;
 var q=view.querySelector('.question');if(!q||tidy(q.textContent)!==TARGET_QUESTION)return;
 var panel=view.querySelector('[data-guided-v13]');if(!panel)return;
 var intro=panel.querySelector('h3 + p');if(intro)intro.textContent=repairedIntro(q.textContent,intro.textContent);
 var work=panel.querySelector('[data-v13-work]');if(!work)return;
 var ps=work.querySelectorAll('.warning p');
 for(var i=0;i<ps.length;i++)ps[i].textContent=repairedPrompt(q.textContent,ps[i].textContent);
}
function install(doc){if(!doc)return;var view=doc.getElementById('view');if(!view)return;new MutationObserver(function(){setTimeout(function(){fix(doc)},0)}).observe(view,{childList:true,subtree:true});fix(doc);}
return{TARGET_QUESTION:TARGET_QUESTION,OLD_STEP:OLD_STEP,NEW_STEP:NEW_STEP,repairedPrompt:repairedPrompt,repairedIntro:repairedIntro,fix:fix,install:install};
});
