(function(root,factory){'use strict';
var api=factory();
if(typeof module==='object'&&module.exports)module.exports=api;
else{root.MathEvidenceV23=api;api.install(root.document,root.localStorage);}
})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
var UI_KEY='dr-merissa-day1-ui-v5',EVIDENCE_KEY='dr-merissa-math-evidence-v23';
function parse(raw,fallback){try{return JSON.parse(raw||'')||fallback}catch(e){return fallback}}
function snapshot(store,question){
 var ui=parse(store&&store.getItem?store.getItem(UI_KEY):'',{}),area=ui.mathArea,s=area&&ui.mathSessions&&ui.mathSessions[area];
 return area&&s?{area:area,question:String(question||''),supported:!!s.idk}:null;
}
function load(store){return parse(store&&store.getItem?store.getItem(EVIDENCE_KEY):'',{areas:{}})}
function record(store,snap){
 if(!snap||!snap.area)return null;var e=load(store);e.areas=e.areas||{};var a=e.areas[snap.area]||(e.areas[snap.area]={independentCorrect:0,supportedCorrect:0});
 if(snap.supported)a.supportedCorrect++;else a.independentCorrect++;
 if(store&&store.setItem)store.setItem(EVIDENCE_KEY,JSON.stringify(e));return e;
}
function install(doc,store){
 if(!doc||!doc.getElementById||!store)return;var view=doc.getElementById('view');if(!view||view.dataset.mathEvidenceV23)return;view.dataset.mathEvidenceV23='1';var pending=null;
 function text(el){return(el&&el.textContent||'').replace(/\s+/g,' ').trim()}
 function begin(e){var b=e.target&&e.target.closest?e.target.closest('#check'):null;if(!b||b.disabled||!view.contains(b))return;pending=snapshot(store,text(view.querySelector('.question')));setTimeout(finish,0)}
 function finish(){if(!pending)return;var good=view.querySelector('#feedback .good');if(!good)return;record(store,pending);pending=null;augmentSummary()}
 function augmentSummary(){
  var h=[].slice.call(view.querySelectorAll('h2')).find(function(x){return text(x)==='Day 1 Summary'});if(!h)return;var host=h.parentElement;if(!host)return;var old=host.querySelector('[data-math-evidence-v23]');var e=load(store),keys=Object.keys(e.areas||{});
  if(!keys.length){if(old)old.remove();return;}
  var names={fractions_percent:'Fractions & percentages',algebra:'Algebra',exponents:'Exponents',scientific_notation:'Scientific notation',logs:'Logs & estimation',unit_conversions:'Unit conversions'};
  var html='<b>Math evidence</b><p class="muted">Independent correct answers are kept separate from answers completed after teaching, a hint, or a wrong-attempt explanation.</p>'+keys.map(function(k){var a=e.areas[k];return '<div><b>'+String(names[k]||k)+'</b>: '+a.independentCorrect+' independent • '+a.supportedCorrect+' supported/repaired</div>'}).join('');
  if(old){if(old.innerHTML!==html)old.innerHTML=html;return;}
  var box=doc.createElement('div');box.setAttribute('data-math-evidence-v23','1');box.className='warning';box.style.marginTop='14px';box.innerHTML=html;host.appendChild(box);
 }
 view.addEventListener('pointerup',begin,true);view.addEventListener('click',begin,true);
 new MutationObserver(function(){setTimeout(augmentSummary,0)}).observe(view,{childList:true,subtree:true});augmentSummary();
}
return{UI_KEY:UI_KEY,EVIDENCE_KEY:EVIDENCE_KEY,snapshot:snapshot,load:load,record:record,install:install};
});
