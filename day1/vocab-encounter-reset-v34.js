(function(root,factory){'use strict';if(typeof module==='object'&&module.exports){module.exports=factory(require('./chemistry-vocabulary-production-v33.js'));}else{var A=factory(root.Day1ChemistryVocabularyProductionV33);root.Day1VocabularyEncounterResetV34=A;A.install(root.document);}})(typeof globalThis!=='undefined'?globalThis:this,function(V){'use strict';
if(!V||!Array.isArray(V.TERMS))throw new Error('Day 1 vocabulary API is required');
var KEY=V.KEY||'dr-merissa-day1-vocabulary-production-v3';
function read(win){try{return JSON.parse(win.localStorage.getItem(KEY)||'null');}catch(e){return null;}}
function save(win,s){try{win.localStorage.setItem(KEY,JSON.stringify(s));}catch(e){}}
function attempts(s,id){return s&&s.records&&s.records[id]&&Array.isArray(s.records[id].attempts)?s.records[id].attempts:[];}
function termIdFromTitle(title){var q=String(title||'').trim().toLowerCase();var t=V.TERMS.find(function(x){return String(x.term).trim().toLowerCase()===q;});return t&&t.id;}
function markTeachingBoundary(s,id){if(!s||!id)return false;s.records=s.records||{};s.records[id]=s.records[id]||{status:'not_started',attempts:[]};var a=s.records[id].attempts=s.records[id].attempts||[];if(a.length&&a[a.length-1].kind==='teaching_boundary')return false;a.push({kind:'teaching_boundary',pass:true,system:true,countsForMastery:false});return true;}
function stripIdkAttempt(s,id,beforeLength){var a=attempts(s,id),n=Math.max(0,Number(beforeLength)||0);if(a.length<=n)return false;var removed=false;while(a.length>n){var x=a[a.length-1];if(x&&x.kind==='teaching_boundary')break;a.pop();removed=true;}return removed;}
function phase(root){var e=root.querySelector('.card .phase');return e?String(e.textContent||'').trim().toLowerCase():'';}
function title(root){var e=root.querySelector('.card h2');return e?String(e.textContent||'').trim():'';}
function findButtonTarget(node,id){while(node&&node.nodeType===1){if(node.id===id)return node;node=node.parentNode;}return null;}
function install(doc){if(!doc||!doc.defaultView)return;var win=doc.defaultView,view=doc.getElementById('view');if(!view)return;
view.addEventListener('click',function(ev){if(!findButtonTarget(ev.target,'chemProdIdk'))return;var root=view.querySelector('[data-day1-vocab-production-v3]'),id=root&&termIdFromTitle(title(root)),s=read(win);if(!id||!s)return;var before=attempts(s,id).length;win.setTimeout(function(){var after=read(win);if(!after)return;if(stripIdkAttempt(after,id,before))save(win,after);},0);},true);
function enhance(){var root=view.querySelector('[data-day1-vocab-production-v3]');if(!root||phase(root)!=='teach the word')return;var id=termIdFromTitle(title(root)),s=read(win);if(!id||!s)return;if(markTeachingBoundary(s,id))save(win,s);}
new win.MutationObserver(function(){win.setTimeout(enhance,0);}).observe(view,{childList:true,subtree:true});win.setTimeout(enhance,0);}
return{KEY:KEY,attempts:attempts,termIdFromTitle:termIdFromTitle,markTeachingBoundary:markTeachingBoundary,stripIdkAttempt:stripIdkAttempt,install:install};
});
