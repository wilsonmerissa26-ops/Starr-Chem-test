(function(root,factory){'use strict';if(typeof module==='object'&&module.exports){module.exports=factory(require('./vocab-production-v34-language-fix.js'));}else{var A=factory(root.Day3VocabularyProductionV34);root.Day3VocabularyEscalationV35=A;A.install(root.document);}})(typeof globalThis!=='undefined'?globalThis:this,function(V){'use strict';
if(!V||!Array.isArray(V.TERMS))throw new Error('Day 3 vocabulary API is required');
var KEY='dr-merissa-day3-vocab-production-v3',MAX_FAILED_EXPLANATIONS=3;
var TEACH_USE={
contributor:'No. If a hydrogen moves to a different carbon, the atom connectivity changed. Resonance contributors keep the same atoms connected in the same way; only electron placement changes.',
hybrid:'No. The molecule does not switch back and forth between separate contributor drawings. The real molecule is the resonance hybrid represented by the contributors together.',
delocalized:'No. Delocalized electrons are not trapped inside one single bond. Their electron density is spread across more than one atom or bond position.',
pi:'The pi part of the double bond, meaning the pi electron pair, can shift during resonance. The sigma skeleton stays fixed.',
arrow:'The tail must begin at an actual electron source such as a lone pair or a pi bond. A plus sign or empty space is not an electron source.'
};
function read(win){try{return JSON.parse(win.localStorage.getItem(KEY)||'null');}catch(e){return null;}}
function save(win,s){try{win.localStorage.setItem(KEY,JSON.stringify(s));}catch(e){}}
function termIdFromTitle(title){var q=String(title||'').trim().toLowerCase();var t=V.TERMS.find(function(x){return String(x.term).trim().toLowerCase()===q;});return t&&t.id;}
function attempts(s,id){return s&&s.records&&s.records[id]&&Array.isArray(s.records[id].attempts)?s.records[id].attempts:[];}
function boundary(s,id){var m=s&&s.escalationAttemptBoundary;var n=m&&Number(m[id]);return Number.isFinite(n)&&n>=0?n:0;}
function setBoundary(s,id,n){s.escalationAttemptBoundary=s.escalationAttemptBoundary||{};s.escalationAttemptBoundary[id]=Math.max(0,Number(n)||0);}
function failedExplanationStreak(s,id){var a=attempts(s,id),start=Math.min(boundary(s,id),a.length),n=0;for(var i=a.length-1;i>=start;i--){if(a[i].pass)break;if(['cold','review','support'].indexOf(a[i].kind)>=0)n++;}return n;}
function shouldAutoTeach(s,id){return !(s&&s.escalationTaughtTerm===id)&&failedExplanationStreak(s,id)>=MAX_FAILED_EXPLANATIONS;}
function clearEscalation(s){delete s.escalationTaughtTerm;delete s.escalationOriginReview;delete s.escalationPostTeachRepair;}
function markTeaching(s,id){if(s.escalationTaughtTerm!==id){setBoundary(s,id,attempts(s,id).length);s.escalationTaughtTerm=id;s.escalationOriginReview=!!s.returnReview;s.escalationPostTeachRepair=false;}}
function stripIdkAttempt(s,id,beforeLength){var a=attempts(s,id),n=Math.max(0,Number(beforeLength)||0);if(a.length<=n)return false;a.splice(n);if(boundary(s,id)>a.length)setBoundary(s,id,a.length);return true;}
function shouldEndOnIdk(s,id){return !!(s&&s.phase==='postteach'&&s.escalationTaughtTerm===id);}
function endTaughtEncounter(win,s,id){var r=s.records&&s.records[id];if(r)r.status='needs_review';var fromReview=!!s.escalationOriginReview;if(fromReview){if(Array.isArray(s.queue)&&s.queue[0]===id)s.queue.shift();s.phase=s.queue&&s.queue.length?'review':'needs';}else{if(!Array.isArray(s.queue))s.queue=[];if(s.queue.indexOf(id)<0)s.queue.push(id);s.index=Number(s.index||0)+1;s.phase='cold';}s.termId=null;s.returnReview=false;s.last=null;s.supportFails=0;s.draftDef='';s.draftUse='';clearEscalation(s);save(win,s);win.location.reload();}
function phase(root){var e=root.querySelector('.card .phase');return e?String(e.textContent||'').trim().toLowerCase():'';}
function title(root){var e=root.querySelector('.card h2');return e?String(e.textContent||'').trim():'';}
function answerMarkup(id){return '<div class="subtleBox vocabEscalationAnswer" data-vocab-escalation-answer><b>How to use it here</b><p>'+escapeHtml(TEACH_USE[id]||'Use the definition above to answer the application question.')+'</p><p class="muted"><b>This is teaching, not mastery.</b> The answer and visual will disappear before no-clue retrieval.</p></div>';}
function escapeHtml(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]);});}
function findButtonTarget(node,id){while(node&&node.nodeType===1){if(node.id===id)return node;node=node.parentNode;}return null;}
function install(doc){if(!doc||!doc.defaultView)return;var win=doc.defaultView,view=doc.getElementById('view');if(!view)return;
view.addEventListener('click',function(ev){if(!findButtonTarget(ev.target,'vidk'))return;var root=view.querySelector('[data-vocab-production-v3]'),id=root&&termIdFromTitle(title(root)),s=read(win);if(!id||!s)return;var before=attempts(s,id).length;if(shouldEndOnIdk(s,id)){ev.preventDefault();ev.stopImmediatePropagation();endTaughtEncounter(win,s,id);return;}win.setTimeout(function(){var after=read(win);if(!after)return;if(stripIdkAttempt(after,id,before))save(win,after);},0);},true);
function enhance(){var root=view.querySelector('[data-vocab-production-v3]');if(!root)return;var ph=phase(root),id=termIdFromTitle(title(root));if(!id)return;var s=read(win);if(!s)return;
if(ph==='teach the word'){markTeaching(s,id);save(win,s);var card=root.querySelector('.card');if(card&&!card.querySelector('[data-vocab-escalation-answer]')){var hide=card.querySelector('#vhide'),box=doc.createElement('div');box.innerHTML=answerMarkup(id);var node=box.firstChild;if(hide&&hide.parentNode)hide.parentNode.insertBefore(node,hide);else card.appendChild(node);}return;}
if(ph==='targeted repair'){
var a=attempts(s,id),last=a.length?a[a.length-1]:null;
if(s.escalationTaughtTerm===id){if(last&&last.kind==='support_recall'&&!last.pass&&!s.escalationPostTeachRepair){s.escalationPostTeachRepair=true;save(win,s);return;}if(s.escalationPostTeachRepair&&last&&last.kind==='support'&&!last.pass){endTaughtEncounter(win,s,id);return;}}
if(shouldAutoTeach(s,id)){markTeaching(s,id);save(win,s);var b=doc.getElementById('vteach');if(b)b.click();}return;}
if(s.escalationTaughtTerm&&s.escalationTaughtTerm!==id){clearEscalation(s);save(win,s);}}
new win.MutationObserver(function(){win.setTimeout(enhance,0);}).observe(view,{childList:true,subtree:true});win.setTimeout(enhance,0);}
return{MAX_FAILED_EXPLANATIONS:MAX_FAILED_EXPLANATIONS,TEACH_USE:TEACH_USE,termIdFromTitle:termIdFromTitle,attempts:attempts,boundary:boundary,setBoundary:setBoundary,failedExplanationStreak:failedExplanationStreak,shouldAutoTeach:shouldAutoTeach,markTeaching:markTeaching,stripIdkAttempt:stripIdkAttempt,shouldEndOnIdk:shouldEndOnIdk,clearEscalation:clearEscalation,endTaughtEncounter:endTaughtEncounter,install:install};
});