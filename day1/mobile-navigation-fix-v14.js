(function(){'use strict';
/* Mobile/tablet navigation hardening.
   A view change is a navigation event, not a continuation of the previous page's scroll position.
   Run after all classroom enhancement scripts so older renderers cannot restore stale scroll. */
var tabs=document.getElementById('navTabs');
if(!tabs)return;
var lastView=null;
function resetViewport(){
  try{window.scrollTo({top:0,left:0,behavior:'auto'});}catch(e){window.scrollTo(0,0);}
  document.documentElement.scrollTop=0;
  document.body.scrollTop=0;
  var root=document.getElementById('view');
  if(root)root.scrollTop=0;
}
function settleReset(){
  resetViewport();
  requestAnimationFrame(function(){resetViewport();requestAnimationFrame(resetViewport);});
  setTimeout(resetViewport,0);
  setTimeout(resetViewport,80);
  setTimeout(resetViewport,220);
}
tabs.addEventListener('click',function(e){
  var b=e.target.closest('button[data-view]');
  if(!b)return;
  var next=b.getAttribute('data-view');
  if(next!==lastView){lastView=next;settleReset();}
},true);
/* Also protect programmatic/history view changes by watching the active tab. */
new MutationObserver(function(){
  var active=tabs.querySelector('button.on[data-view]');
  if(!active)return;
  var next=active.getAttribute('data-view');
  if(next!==lastView){lastView=next;settleReset();}
}).observe(tabs,{subtree:true,attributes:true,attributeFilter:['class']});
var initial=tabs.querySelector('button.on[data-view]');
if(initial)lastView=initial.getAttribute('data-view');
})();
