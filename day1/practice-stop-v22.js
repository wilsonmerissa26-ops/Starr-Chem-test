(function(){'use strict';
var view=document.getElementById('view');if(!view)return;
var KEY='dr-merissa-day1-ui-v5';
var limits={fractions_percent:6,algebra:4,exponents:5,scientific_notation:5,logs:4,unit_conversions:7};
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}}}
function current(){var u=read(),id=u.mathArea,s=u.mathSessions&&u.mathSessions[id];return{id:id,ui:u,session:s,limit:limits[id]||0}}
function atEnd(){var c=current();return !!(c.session&&c.limit&&Number(c.session.problemCursor)>=c.limit)}
function decorate(){var b=view.querySelector('#continueProblem');if(b&&atEnd()){if(b.textContent!=='Finish skill ✓')b.textContent='Finish skill ✓';if(b.dataset.finishSkill!=='1')b.dataset.finishSkill='1';}}
view.addEventListener('click',function(e){
 var b=e.target&&e.target.closest?e.target.closest('#continueProblem[data-finish-skill="1"]'):null;if(!b)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 var c=current();if(c.session){c.session.status='Practice set complete';c.session.phase='entry';c.ui.mathArea=null;localStorage.setItem(KEY,JSON.stringify(c.ui));}
 window.location.reload();
},true);
new MutationObserver(function(){setTimeout(decorate,0);}).observe(view,{childList:true,subtree:true});
decorate();
})();
