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
function setText(el,value){if(el&&el.textContent!==value)el.textContent=value;}
function polishFoundationHome(){
  var root=document.getElementById('view');
  if(!root)return;
  var active=tabs.querySelector('button.on[data-view]');
  if(!active||active.getAttribute('data-view')!=='home')return;
  var hero=root.querySelector('.hero');
  if(!hero)return;
  var phase=hero.querySelector('.phase'),heading=hero.querySelector('h1'),copy=hero.querySelector('p');
  setText(phase,'FOUNDATION LIBRARY • DAY 1');
  setText(heading,'Day 1 Foundation Review');
  setText(copy,'Refresh the math and Lewis-structure skills that support your Organic Chemistry work. Your saved progress stays here when you return.');
  if(!hero.querySelector('[data-course-hub-link]')){
    var link=document.createElement('a');
    link.href='../course-hub/';
    link.className='btn ghost';
    link.setAttribute('data-course-hub-link','1');
    link.textContent='← Back to CHM 221 Hub';
    link.style.display='inline-flex';
    link.style.alignItems='center';
    link.style.justifyContent='center';
    link.style.textDecoration='none';
    link.style.marginTop='10px';
    hero.appendChild(link);
  }
  var subtitle=document.querySelector('.brandIdentity .muted');
  setText(subtitle,'AStarryia • Foundation Library • Day 1');
}
tabs.addEventListener('click',function(e){
  var b=e.target.closest('button[data-view]');
  if(!b)return;
  var next=b.getAttribute('data-view');
  if(next!==lastView){lastView=next;settleReset();}
  setTimeout(polishFoundationHome,0);
},true);
/* Also protect programmatic/history view changes by watching the active tab. */
new MutationObserver(function(){
  var active=tabs.querySelector('button.on[data-view]');
  if(!active)return;
  var next=active.getAttribute('data-view');
  if(next!==lastView){lastView=next;settleReset();}
  polishFoundationHome();
}).observe(tabs,{subtree:true,attributes:true,attributeFilter:['class']});
/* classroom-v5 replaces #view's direct children on navigation. Watching only
   direct child replacement avoids an observer feeding on its own polishing. */
var root=document.getElementById('view');
if(root)new MutationObserver(function(){polishFoundationHome();}).observe(root,{childList:true});
var initial=tabs.querySelector('button.on[data-view]');
if(initial)lastView=initial.getAttribute('data-view');
polishFoundationHome();
})();
