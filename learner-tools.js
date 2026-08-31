(function(){
  "use strict";
  var script=document.currentScript;
  var cfg={
    unitHref:(script&&script.dataset.unitHref)||"../",
    homeHref:(script&&script.dataset.homeHref)||"../../../course-hub/",
    periodicHref:(script&&script.dataset.periodicHref)||"../../../periodic-table.html"
  };
  var topbar=document.querySelector('.topbar');
  if(!topbar)return;

  var style=document.createElement('style');
  style.textContent='.learner-toolbar{display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-top:11px;padding-top:10px;border-top:1px solid #e8dfef}.learner-toolbar-group{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.learner-tool,.learner-nav{appearance:none;min-height:42px;border:1px solid var(--line,#ddcfea);border-radius:12px;padding:9px 12px;background:#fff;color:var(--purple-dark,#4a236f);font:inherit;font-weight:850;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;touch-action:manipulation}.learner-tool.primary{background:var(--soft,#eee5f7)}.learner-overlay{position:fixed;inset:0;z-index:200;background:rgba(25,21,33,.55);display:grid;place-items:center;padding:18px}.learner-overlay[hidden]{display:none}.learner-modal{width:min(96vw,1100px);max-height:92vh;overflow:auto;background:#fff;border:1px solid var(--line,#ddcfea);border-radius:22px;box-shadow:0 24px 70px rgba(20,12,30,.32);padding:18px}.learner-modal-head{display:flex;justify-content:space-between;align-items:center;gap:12px;position:sticky;top:-18px;background:#fff;padding:5px 0 12px;z-index:2}.learner-modal-head h2{margin:0}.learner-close{appearance:none;border:1px solid var(--line,#ddcfea);background:#fff;color:var(--purple-dark,#4a236f);border-radius:999px;min-width:44px;min-height:44px;font:inherit;font-weight:900;cursor:pointer}.learner-periodic-frame{display:block;width:100%;height:min(76vh,820px);border:0;border-radius:14px;background:#f6f3fa}.learner-help-card{border:1px solid var(--line,#ddcfea);border-radius:16px;padding:14px 16px;margin:12px 0;background:#faf7fd}.learner-help-card strong{display:block;color:var(--purple-dark,#4a236f);margin-bottom:5px}.learner-help-actions{display:flex;gap:9px;flex-wrap:wrap;margin-top:14px}.learner-help-action{appearance:none;border:0;border-radius:13px;min-height:46px;padding:11px 14px;background:var(--purple,#6f3aa8);color:#fff;font:inherit;font-weight:850;cursor:pointer}.learner-help-action.secondary{background:#fff;color:var(--purple-dark,#4a236f);border:1px solid var(--line,#ddcfea)}.learner-warning{background:#fff6d9;color:#624c00;border-radius:14px;padding:13px 15px;line-height:1.5;font-weight:750}@media(max-width:620px){.learner-toolbar{align-items:stretch}.learner-toolbar-group{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));width:100%}.learner-tool,.learner-nav{width:100%}.learner-overlay{padding:8px}.learner-modal{padding:14px;border-radius:18px}.learner-periodic-frame{height:80vh}}';
  document.head.appendChild(style);

  var toolbar=document.createElement('div');
  toolbar.className='learner-toolbar';
  toolbar.setAttribute('aria-label','Lesson navigation and tools');
  toolbar.innerHTML='<div class="learner-toolbar-group"><a class="learner-nav" data-unit-nav href="'+cfg.unitHref+'">← Unit 1</a><a class="learner-nav" data-home-nav href="'+cfg.homeHref+'">Home</a></div><div class="learner-toolbar-group"><button class="learner-tool primary" type="button" data-periodic-tool>Periodic Table</button><button class="learner-tool primary" type="button" data-help-tool>Help</button></div>';
  topbar.appendChild(toolbar);

  var overlay=document.createElement('div');
  overlay.className='learner-overlay';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','learnerToolTitle');
  overlay.innerHTML='<div class="learner-modal"><div class="learner-modal-head"><h2 id="learnerToolTitle">Learner tool</h2><button type="button" class="learner-close" data-tool-close aria-label="Close">×</button></div><div data-tool-body></div></div>';
  document.body.appendChild(overlay);
  var title=overlay.querySelector('#learnerToolTitle'),body=overlay.querySelector('[data-tool-body]');
  function close(){overlay.hidden=true;body.innerHTML='';}
  overlay.querySelector('[data-tool-close]').addEventListener('click',close);
  overlay.addEventListener('click',function(e){if(e.target===overlay)close();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!overlay.hidden)close();});
  function openModal(t,html){title.textContent=t;body.innerHTML=html;overlay.hidden=false;var c=overlay.querySelector('[data-tool-close]');if(c)c.focus();}

  toolbar.querySelector('[data-periodic-tool]').addEventListener('click',function(){
    openModal('Periodic Table','<iframe class="learner-periodic-frame" title="Periodic Table" src="'+cfg.periodicHref+'"></iframe>');
  });

  var WATCH={
    1:{look:'Nothing is hidden yet. Notice the four written carbon atoms and every written hydrogen.',rule:'Start with the fully expanded molecule so the shortcut has something concrete to shrink.'},
    2:{look:'Focus on the C–C pattern. That connected carbon pattern is the carbon skeleton.',rule:'Hiding a hydrogen label does not remove the hydrogen from the molecule.'},
    3:{look:'Pick one carbon and count the bond order already drawn to it.',rule:'Visible bond order + implied C–H bonds = 4 for the neutral carbons used here.'},
    4:{look:'Watch what happens when the C labels disappear. The atom stays at the same position.',rule:'An unlabeled line end or unlabeled corner represents carbon. The line itself represents a bond.'},
    5:{look:'Count carbon positions, not line segments. Check every unlabeled end and every corner.',rule:'Ends and vertices are carbons unless a different atom is explicitly labeled there.'},
    6:{look:'For the selected carbon, add the visible bond orders first. Then ask how many bonds are missing from four.',rule:'Two visible single bonds give bond order 2, so that carbon has two implied C–H bonds.'},
    7:{look:'Notice which atoms are still written after the carbon shorthand is used.',rule:'Unlabeled ends and corners default to carbon. Heteroatoms such as O, N, Cl, or Br must be written.'},
    8:{look:'Count bond order, not just neighboring atoms. A double bond counts as 2.',rule:'One double bond + one single bond gives bond order 3, leaving one implied C–H bond.'}
  };
  function phase(){var p=document.getElementById('phaseLabel');return p?(p.textContent||'').trim():'';}
  function watchHelp(label){var m=label.match(/Step\s*(\d+)/i);if(!m)return null;return WATCH[Number(m[1])]||null;}
  function clickAfterClose(selector){var target=document.querySelector(selector);if(!target)return false;close();setTimeout(function(){target.click();},0);return true;}
  function helpMarkup(){
    var label=phase();
    var independent=document.querySelector('[data-independent-help]');
    var retrieval=document.querySelector('[data-retrieval-help]');
    if(independent||retrieval){
      return '<div class="learner-warning"><b>This is cold evidence.</b> Help is still available, but using it must make the current item supported so it cannot count as cold mastery evidence.</div><div class="learner-help-actions"><button type="button" class="learner-help-action" data-use-cold-help>Use help anyway</button><button type="button" class="learner-help-action secondary" data-cancel-help>Keep trying without help</button></div>';
    }
    var w=watchHelp(label);
    if(w){
      return '<div class="learner-help-card"><strong>What should I look at?</strong>'+w.look+'</div><div class="learner-help-card"><strong>The rule for this step</strong>'+w.rule+'</div><div class="learner-help-card"><strong>Still unsure?</strong>This is a teaching step, so support is free. Replay the step or go back and watch the previous idea again. Nothing here counts as cold mastery evidence.</div><div class="learner-help-actions"><button type="button" class="learner-help-action" data-replay-step>Replay this step</button><button type="button" class="learner-help-action secondary" data-back-step>Back one step</button></div>';
    }
    if(/Orient/i.test(label))return '<div class="learner-help-card"><strong>You do not have to know this yet.</strong>This opening question is only checking what you think before teaching begins. Choose the answer that is honestly closest to what you know right now.</div>';
    if(/Prerequisite|Gate|Repair/i.test(label))return '<div class="learner-help-card"><strong>This is a foundation check.</strong>If you are unsure, choose the unsure option. The lesson is supposed to repair the prerequisite before moving forward.</div>';
    if(/Concept/i.test(label))return '<div class="learner-help-card"><strong>This is supported practice.</strong>Use the rule you just watched. A mistake here is for teaching, not mastery. You can go back to Watch if the rule still feels fuzzy.</div>';
    if(/Build Together/i.test(label))return '<div class="learner-help-card"><strong>We are building this together.</strong>Take one decision at a time. Support is allowed here and does not count as independent evidence.</div>';
    if(/Guided/i.test(label))return '<div class="learner-help-card"><strong>Try first, then use support if needed.</strong>Guided practice is where help fades. Asking for help here is okay; the cold evidence phase comes later.</div>';
    if(/Explain Why/i.test(label))return '<div class="learner-warning"><b>Your explanation is part of the evidence.</b>Do not use outside help if you want this explanation to remain independent. If you truly need help, return to supported practice and use a fresh cold item afterward.</div>';
    if(/Transfer/i.test(label))return '<div class="learner-help-card"><strong>Transfer asks whether the rule still works in a new-looking situation.</strong>Use the same underlying bond-line rules rather than memorizing the earlier picture.</div>';
    if(/Retrieval/i.test(label))return '<div class="learner-warning"><b>Retrieval is evidence-sensitive.</b>If a cold retrieval item is active, use its built-in “I need help” button so the Student Model records the support correctly.</div>';
    return '<div class="learner-help-card"><strong>Help is available.</strong>Read the current prompt, identify what the step is asking you to notice, and use Back or Replay during teaching. When a cold item is active, always use its built-in help path so support is recorded correctly.</div>';
  }
  function bindHelpActions(){
    var cold=body.querySelector('[data-use-cold-help]');if(cold)cold.addEventListener('click',function(){if(!clickAfterClose('[data-independent-help]'))clickAfterClose('[data-retrieval-help]');});
    var cancel=body.querySelector('[data-cancel-help]');if(cancel)cancel.addEventListener('click',close);
    var replay=body.querySelector('[data-replay-step]');if(replay)replay.addEventListener('click',function(){clickAfterClose('#replayBtn');});
    var back=body.querySelector('[data-back-step]');if(back)back.addEventListener('click',function(){clickAfterClose('#backBtn');});
  }
  toolbar.querySelector('[data-help-tool]').addEventListener('click',function(){openModal('Help',helpMarkup());bindHelpActions();});

  globalThis.LearnerTools=Object.freeze({openHelp:function(){toolbar.querySelector('[data-help-tool]').click();},openPeriodicTable:function(){toolbar.querySelector('[data-periodic-tool]').click();},close:close});
})();
