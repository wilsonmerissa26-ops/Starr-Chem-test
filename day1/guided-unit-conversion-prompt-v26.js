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
function setText(el,value){if(el&&el.textContent!==value)el.textContent=value;}
function repairedPrompt(question,stepPrompt){return tidy(question)===TARGET_QUESTION&&tidy(stepPrompt)===OLD_STEP?NEW_STEP:stepPrompt;}
function repairedIntro(question,intro){return tidy(question)===TARGET_QUESTION&&tidy(intro)===OLD_INTRO?NEW_INTRO:intro;}
function exactMgAnswer(v){
 var s=String(v==null?'':v).trim().toLowerCase().replace(/,/g,'').replace(/\s+/g,' ');
 var m=s.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))(?:\s*(mg|milligram|milligrams))?$/);
 return !!m&&Number(m[1])===1000;
}
function isTargetStep(question,stepPrompt){var q=tidy(question),p=tidy(stepPrompt);return q===TARGET_QUESTION&&(p===OLD_STEP||p===NEW_STEP);}
function rejectWrongTargetAnswer(doc,button){
 if(!doc||!button)return false;
 var view=doc.getElementById('view');if(!view)return false;
 var q=view.querySelector('.question');if(!q||tidy(q.textContent)!==TARGET_QUESTION)return false;
 var box=button.closest&&button.closest('.warning');if(!box)return false;
 var input=box.querySelector('[data-v13-answer]'),p=box.querySelector('p'),out=box.querySelector('[data-v13-feedback]');
 if(!input||!p||!isTargetStep(q.textContent,p.textContent))return false;
 if(exactMgAnswer(input.value))return false;
 if(out){out.className='feedback bad';out.innerHTML='<b>Not yet.</b> The answer must give the exact number of milligrams in 1 gram. A different unit is not equivalent. Try this same step again. I am not moving you forward.';}
 return true;
}
function fix(doc){
 if(!doc)return;
 var view=doc.getElementById('view');if(!view)return;
 var q=view.querySelector('.question');if(!q||tidy(q.textContent)!==TARGET_QUESTION)return;
 var panel=view.querySelector('[data-guided-v13]');if(!panel)return;
 var intro=panel.querySelector('h3 + p');if(intro)setText(intro,repairedIntro(q.textContent,intro.textContent));
 var work=panel.querySelector('[data-v13-work]');if(!work)return;
 var ps=work.querySelectorAll('.warning p');
 for(var i=0;i<ps.length;i++)setText(ps[i],repairedPrompt(q.textContent,ps[i].textContent));
}
function install(doc){
 if(!doc)return;var view=doc.getElementById('view');if(!view)return;
 new MutationObserver(function(){setTimeout(function(){fix(doc)},0)}).observe(view,{childList:true,subtree:true});
 doc.addEventListener('click',function(e){var t=e.target&&e.target.closest?e.target.closest('[data-v13-check]'):null;if(!t)return;if(rejectWrongTargetAnswer(doc,t)){e.preventDefault();e.stopImmediatePropagation();}},true);
 fix(doc);
}
return{TARGET_QUESTION:TARGET_QUESTION,OLD_STEP:OLD_STEP,NEW_STEP:NEW_STEP,repairedPrompt:repairedPrompt,repairedIntro:repairedIntro,exactMgAnswer:exactMgAnswer,isTargetStep:isTargetStep,rejectWrongTargetAnswer:rejectWrongTargetAnswer,fix:fix,install:install};
});
