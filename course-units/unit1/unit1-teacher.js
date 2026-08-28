(function(root,factory){
  const api=factory(typeof module==='object'&&module.exports?require('./unit1-lesson-data.js'):root.CHM221Unit1LessonData);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.CHM221Unit1Teacher=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(LessonData){
  'use strict';

  const PHASES=Object.freeze({TEACH:'TEACH',WATCH:'WATCH',BUILD_TOGETHER:'BUILD_TOGETHER',GUIDED:'GUIDED',COMPLETE:'COMPLETE'});

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function norm(v){return String(v==null?'':v).toLowerCase().replace(/[\s_–—-]+/g,' ').replace(/[^a-z0-9+ ]/g,'').trim();}
  function lesson(id){return LessonData&&LessonData.lesson?LessonData.lesson(id):null;}

  function createSession(skillId){
    const l=lesson(skillId);
    if(!l)throw new Error('Unknown Unit 1 lesson: '+skillId);
    return {skillId:skillId,phase:l.externalHref?PHASES.COMPLETE:PHASES.TEACH,watchIndex:0,guidedIndex:0,guidedSuccesses:0,attempts:[],representationIndex:0,completed:false};
  }

  function checkItem(item,response){
    const n=norm(response);
    if(!n)return false;
    return (item.accepted||[]).some(function(a){return norm(a)===n;});
  }

  function currentWatch(session){
    const l=lesson(session.skillId);
    return l&&l.watch?l.watch[session.watchIndex]||null:null;
  }

  function currentGuided(session){
    const l=lesson(session.skillId);
    return l&&l.guided?l.guided[session.guidedIndex]||null:null;
  }

  function nextWatch(session){
    const l=lesson(session.skillId);
    if(!l||!l.watch||!l.watch.length)return {done:true,phase:PHASES.BUILD_TOGETHER};
    if(session.watchIndex<l.watch.length-1){
      session.watchIndex+=1;
      session.phase=l.watch[session.watchIndex].phase||PHASES.WATCH;
      return {done:false,phase:session.phase,step:currentWatch(session)};
    }
    session.phase=PHASES.BUILD_TOGETHER;
    session.guidedIndex=0;
    return {done:true,phase:session.phase,item:currentGuided(session)};
  }

  function backWatch(session){
    if(session.watchIndex>0)session.watchIndex-=1;
    const step=currentWatch(session);
    session.phase=step&&step.phase?step.phase:PHASES.TEACH;
    return step;
  }

  function recordGuided(session,response){
    const item=currentGuided(session);
    if(!item)throw new Error('No guided item available');
    const correct=checkItem(item,response);
    session.attempts.push({itemId:item.id,response:String(response||''),correct:correct,phase:item.phase});
    if(!correct){
      session.guidedSuccesses=0;
      return {correct:false,complete:false,representation:nextRepresentation(session)};
    }
    session.guidedSuccesses+=1;
    if(session.guidedIndex<(lesson(session.skillId).guided.length-1)){
      session.guidedIndex+=1;
      session.phase=currentGuided(session).phase||PHASES.GUIDED;
      return {correct:true,complete:false,nextItem:currentGuided(session)};
    }
    session.completed=true;
    session.phase=PHASES.COMPLETE;
    return {correct:true,complete:true};
  }

  function nextRepresentation(session){
    const l=lesson(session.skillId),list=(l&&l.representationSwitches)||[];
    if(!list.length)return null;
    const out=list[session.representationIndex%list.length];
    session.representationIndex+=1;
    return out;
  }

  function visualBondline(state){
    if(state==='expanded')return '<div class="chem-visual bondline expanded"><span>CH₃</span><i>—</i><span>CH₂</span><i>—</i><span>CH₃</span></div>';
    if(state==='collapse-carbons')return '<svg class="chem-svg draw" viewBox="0 0 360 160" role="img" aria-label="Three-carbon bond-line skeleton"><polyline points="55,105 180,45 305,105" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><g class="ghost-labels"><text x="45" y="135">C</text><text x="174" y="35">C</text><text x="302" y="135">C</text></g></svg>';
    if(state==='collapse-hydrogens')return '<svg class="chem-svg draw" viewBox="0 0 360 160" role="img" aria-label="Bond-line skeleton with implied hydrogens"><polyline points="55,105 180,45 305,105" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><text class="fade-note" x="180" y="145" text-anchor="middle">C and H labels are implied</text></svg>';
    if(state==='hydrogen-count')return '<div class="chem-visual count"><span class="node">C</span><span class="bond">—</span><span class="focus-node">C</span><span class="bond">—</span><span class="node">C</span><b class="pop">+ 2 H on the center carbon</b></div>';
    return '<svg class="chem-svg draw" viewBox="0 0 360 175" role="img" aria-label="Bond-line skeleton counted as three carbons"><polyline points="55,105 180,45 305,105" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><g class="count-labels"><circle cx="55" cy="105" r="22"/><circle cx="180" cy="45" r="22"/><circle cx="305" cy="105" r="22"/><text x="55" y="112" text-anchor="middle">1</text><text x="180" y="52" text-anchor="middle">2</text><text x="305" y="112" text-anchor="middle">3</text></g></svg>';
  }

  function visualFunctional(state){
    if(state==='alcohol-highlight')return '<div class="chem-visual formula">CH₃—CH₂—<mark class="pulse">OH</mark><small>alcohol pattern</small></div>';
    if(state==='ketone-highlight')return '<div class="chem-visual formula">CH₃—<mark class="pulse">C(=O)</mark>—CH₃<small>ketone pattern</small></div>';
    if(state==='compare')return '<div class="compare-grid"><div>CH₃CH₂<mark>OH</mark><b>alcohol</b></div><div>CH₃<mark>CO</mark>CH₃<b>ketone</b></div></div>';
    return '<div class="chem-visual formula">CH₃CH₂OH <span class="arrow">→</span> look at connections, not just letters</div>';
  }

  function visualNaming(state){
    if(state==='trace-parent')return '<div class="chain-row trace"><span>CH₃</span><i>—</i><span>CH</span><i>—</i><span>CH₂</span><i>—</i><span>CH₂</span><i>—</i><span>CH₃</span><b class="branch">│<br>CH₃</b></div>';
    if(state==='number-chain')return '<div class="chain-row numbered"><span><b>1</b>CH₃</span><i>—</i><span><b>2</b>CH</span><i>—</i><span><b>3</b>CH₂</span><i>—</i><span><b>4</b>CH₂</span><i>—</i><span><b>5</b>CH₃</span><strong class="direction">lowest branch number wins</strong></div>';
    if(state==='label-substituent')return '<div class="chem-visual naming-build"><span>5-carbon parent = <b>pentane</b></span><span>branch on C2 = <b>2-methyl</b></span></div>';
    return '<div class="chem-visual final-name"><span>2</span><i>-</i><span>methyl</span><strong>pentane</strong></div>';
  }

  function visualIsomers(state){
    if(state==='formula'||state==='formula-five')return '<div class="chem-visual formula-rule"><b>CₙH₂ₙ₊₂</b><span class="arrow">→</span><strong>'+(state==='formula-five'?'C₅H₁₂':'C₄H₁₀')+'</strong></div>';
    if(state==='redraw-same')return '<div class="compare-grid"><div>CH₃—CH₂—CH₂—CH₃<b>drawing A</b></div><div class="shift">CH₃CH₂CH₂CH₃<b>same connectivity</b></div></div>';
    return '<div class="isomer-stage"><div><b>C₄H₁₀</b><span>CH₃—CH₂—CH₂—CH₃</span></div><div><b>C₄H₁₀</b><span class="branched">CH₃—CH(CH₃)—CH₃</span></div><strong>same formula, different connectivity</strong></div>';
  }

  function visualNewman(state){
    const angle=state==='eclipsed'?0:state==='gauche'?60:state==='anti'?180:30;
    return '<div class="newman-wrap"><svg class="chem-svg newman" viewBox="0 0 300 220" role="img" aria-label="Newman projection"><g class="back" style="transform:rotate('+angle+'deg);transform-origin:150px 105px"><circle cx="150" cy="105" r="52" fill="none" stroke="currentColor" stroke-width="5"/><line x1="150" y1="53" x2="150" y2="12"/><line x1="105" y1="131" x2="70" y2="151"/><line x1="195" y1="131" x2="230" y2="151"/></g><g class="front"><circle cx="150" cy="105" r="8"/><line x1="150" y1="105" x2="150" y2="45"/><line x1="150" y1="105" x2="98" y2="135"/><line x1="150" y1="105" x2="202" y2="135"/></g></svg><b>'+esc(state==='view-axis'?'view down C—C':state)+'</b></div>';
  }

  function visualCyclo(state){
    if(state==='close-ring')return '<div class="chem-visual ring-close"><span>open chain</span><b class="arrow">→</b><svg viewBox="0 0 120 90"><polygon points="30,15 90,15 112,45 90,75 30,75 8,45" fill="none" stroke="currentColor" stroke-width="5"/></svg><strong>CₙH₂ₙ</strong></div>';
    const equatorial=state==='equatorial';
    return '<div class="chair-wrap '+(equatorial?'flip':'')+'"><svg class="chem-svg chair" viewBox="0 0 360 190" role="img" aria-label="Cyclohexane chair"><polyline points="45,120 105,70 175,95 245,45 315,70 255,120 175,95 105,70" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><line class="substituent" x1="245" y1="45" x2="245" y2="'+(equatorial?'12':'110')+'" stroke="currentColor" stroke-width="7" stroke-linecap="round"/></svg><b>'+(state==='chair'?'chair geometry':equatorial?'equatorial: generally more stable for bulky group':'axial: more crowding')+'</b></div>';
  }

  function renderVisual(visual){
    visual=visual||{};
    if(visual.kind==='bondline')return visualBondline(visual.state);
    if(visual.kind==='functional')return visualFunctional(visual.state);
    if(visual.kind==='naming')return visualNaming(visual.state);
    if(visual.kind==='isomers')return visualIsomers(visual.state);
    if(visual.kind==='newman')return visualNewman(visual.state);
    if(visual.kind==='cyclo')return visualCyclo(visual.state);
    return '<div class="chem-visual">Visual lesson</div>';
  }

  function speak(text){
    if(typeof window==='undefined'||!('speechSynthesis' in window))return;
    window.speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.rate=.92;
    window.speechSynthesis.speak(u);
  }

  function render(container,skillId,options){
    options=options||{};
    const l=lesson(skillId);
    if(!l||!container)return null;
    const session=createSession(skillId);

    if(l.externalHref){
      container.innerHTML='<article class="lesson-card"><div class="lesson-phase">FULL LESSON ALREADY BUILT</div><h2>'+esc(l.title)+'</h2><p>'+esc(l.note||'')+'</p><p class="lesson-objective">'+esc(l.objective)+'</p><a class="button" href="'+esc(l.externalHref)+'">'+esc(l.externalLabel||'Open lesson')+'</a></article>';
      return session;
    }

    function shell(){
      container.innerHTML='<article class="lesson-card"><div class="lesson-head"><div><span class="tag">'+esc(l.title)+'</span><h2 data-lesson-phase></h2></div><button class="ghost lesson-close" type="button" data-lesson-close>Close</button></div><p class="lesson-objective">'+esc(l.objective)+'</p><div class="lesson-stage" data-lesson-stage></div><div class="lesson-teacher" data-lesson-teacher></div><div class="lesson-actions" data-lesson-actions></div><div class="lesson-feedback" data-lesson-feedback aria-live="polite"></div></article>';
      container.querySelector('[data-lesson-close]').onclick=function(){if(options.onClose)options.onClose(session);else container.innerHTML='';};
    }

    function drawWatch(replay){
      const step=currentWatch(session);
      if(!step)return drawGuided();
      session.phase=step.phase||PHASES.WATCH;
      container.querySelector('[data-lesson-phase]').textContent=(session.phase==='TEACH'?'Learn it':'Watch it happen')+' · '+(session.watchIndex+1)+' of '+l.watch.length;
      const stage=container.querySelector('[data-lesson-stage]');
      stage.innerHTML=renderVisual(step.visual);
      if(replay){stage.classList.remove('replay');void stage.offsetWidth;stage.classList.add('replay');}
      container.querySelector('[data-lesson-teacher]').innerHTML='<b>Dr. Merissa</b><p>'+esc(step.narration)+'</p>'+(step.facts&&step.facts.length?'<div class="lesson-facts">'+step.facts.map(function(f){return '<span>'+esc(f)+'</span>';}).join('')+'</div>':'');
      container.querySelector('[data-lesson-feedback]').innerHTML='';
      const actions=container.querySelector('[data-lesson-actions]');
      actions.innerHTML='<button class="secondary" data-back '+(session.watchIndex===0?'disabled':'')+'>Back</button><button class="secondary" data-replay>Replay animation</button><button class="secondary" data-hear>Hear explanation</button><button data-next>'+(session.watchIndex===l.watch.length-1?'Practice together':'Next')+'</button>';
      actions.querySelector('[data-back]').onclick=function(){backWatch(session);drawWatch(false);};
      actions.querySelector('[data-replay]').onclick=function(){drawWatch(true);};
      actions.querySelector('[data-hear]').onclick=function(){speak(step.narration);};
      actions.querySelector('[data-next]').onclick=function(){const out=nextWatch(session);if(out.done)drawGuided();else drawWatch(false);};
    }

    function drawGuided(){
      const item=currentGuided(session);
      if(!item){finish();return;}
      session.phase=item.phase||PHASES.GUIDED;
      container.querySelector('[data-lesson-phase]').textContent=session.phase==='BUILD_TOGETHER'?'Build it together':'Try it with support';
      container.querySelector('[data-lesson-stage]').innerHTML=renderVisual(item.visual);
      container.querySelector('[data-lesson-teacher]').innerHTML='<b>Dr. Merissa</b><p>'+(session.phase==='BUILD_TOGETHER'?'You watched it. Now do one part with me.':'I am still here, but you are doing more of the thinking now.')+'</p>';
      container.querySelector('[data-lesson-feedback]').innerHTML='';
      const actions=container.querySelector('[data-lesson-actions]');
      actions.innerHTML='<label class="lesson-question">'+esc(item.prompt)+'<input data-guided-answer autocomplete="off" spellcheck="false"></label><button data-guided-check>Check this step</button>';
      const input=actions.querySelector('[data-guided-answer]');
      function submit(){
        const out=recordGuided(session,input.value);
        const fb=container.querySelector('[data-lesson-feedback]');
        if(out.correct){
          fb.innerHTML='<div class="good"><b>Yes.</b> That part is working.</div>';
          if(out.complete)setTimeout(finish,350);else setTimeout(drawGuided,350);
        }else{
          fb.innerHTML='<div class="bad"><b>Not yet.</b> I am changing the representation instead of repeating the same sentence.<p>Next view: '+esc(out.representation||'worked example')+'</p></div>';
          const stage=container.querySelector('[data-lesson-stage]');stage.classList.remove('switch-view');void stage.offsetWidth;stage.classList.add('switch-view');input.select();
        }
      }
      actions.querySelector('[data-guided-check]').onclick=submit;
      input.addEventListener('keydown',function(e){if(e.key==='Enter')submit();});
      input.focus();
    }

    function finish(){
      session.completed=true;session.phase=PHASES.COMPLETE;
      container.querySelector('[data-lesson-phase]').textContent='Teaching cycle complete';
      container.querySelector('[data-lesson-stage]').innerHTML='<div class="lesson-complete-visual"><b>Learned with support</b><span>Now the support comes off.</span></div>';
      container.querySelector('[data-lesson-teacher]').innerHTML='<b>Dr. Merissa</b><p>You have worked with the idea. The next question must be fresh and unsupported before it can count as independent evidence.</p>';
      container.querySelector('[data-lesson-feedback]').innerHTML='';
      const actions=container.querySelector('[data-lesson-actions]');
      actions.innerHTML='<button data-fresh>Try a fresh independent question</button>';
      actions.querySelector('[data-fresh]').onclick=function(){if(options.onComplete)options.onComplete(session);};
    }

    shell();drawWatch(false);return session;
  }

  return {PHASES:PHASES,norm:norm,lesson:lesson,createSession:createSession,currentWatch:currentWatch,currentGuided:currentGuided,nextWatch:nextWatch,backWatch:backWatch,recordGuided:recordGuided,nextRepresentation:nextRepresentation,checkItem:checkItem,renderVisual:renderVisual,render:render};
});