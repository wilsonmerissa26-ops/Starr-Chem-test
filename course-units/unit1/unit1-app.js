(function(root,factory){
  const api=factory(
    typeof module==='object'&&module.exports?require('../../readiness-day-engine.js'):root.ReadinessDayEngine,
    typeof module==='object'&&module.exports?require('./unit1-data.js'):root.CHM221Unit1Data
  );
  if(typeof module==='object'&&module.exports)module.exports=api;
  else{root.CHM221Unit1App=api;if(root.document)api.mount(root);}
})(typeof globalThis!=='undefined'?globalThis:this,function(Engine,Data){
  'use strict';
  const KEY='astarryia.chm221.unit1.v1';
  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=v=>(Engine&&Engine.normalize?Engine.normalize(v):String(v||'').toLowerCase().replace(/[^a-z0-9+]/g,''));

  function emptyMix(){return{correct:0,secureCorrect:0,attempted:0,pointsEarned:0,pointsPossible:0,autoPointsPossible:0,paperPointsPending:0,paperTasks:0,guessed:0,bySkill:{}};}
  function newState(){return{version:1,skills:{},errors:[],history:[],mode:null,queue:[],index:0,current:null,supportUsed:false,guessed:false,wrongStreak:0,mix:emptyMix(),testAttemptNumber:0,seenTestItems:{},testHistory:[],currentTest:null,testResponses:[]};}
  function load(store){
    try{
      const x=JSON.parse(store.getItem(KEY)||'null');
      if(!x||x.version!==1)return newState();
      const state=Object.assign(newState(),x);
      state.mix=Object.assign(emptyMix(),x.mix||{});state.mix.bySkill=state.mix.bySkill||{};
      state.seenTestItems=state.seenTestItems||{};state.testHistory=state.testHistory||[];state.testResponses=state.testResponses||[];
      return state;
    }catch(_){return newState();}
  }
  function save(store,state){if(store&&store.setItem)store.setItem(KEY,JSON.stringify(state));}
  function skillState(state,id){return state.skills[id]||(state.skills[id]={independentCorrect:0,supportedCorrect:0,status:'CHECK',lastItem:null});}

  function paperPrompt(item){
    return String(item&&item.prompt||'').replace(/\s*Then type(?: one valid pair of names)?:.*$/i,'').trim();
  }
  function termAffirmed(answer,terms){
    const text=norm(answer);
    return (terms||[]).some(term=>{
      const needle=norm(term);let from=0;
      while(needle&&(from=text.indexOf(needle,from))!==-1){
        const before=text.slice(Math.max(0,from-36),from);
        if(!/(?:\bno|\bnot|\bwithout|\bcannot|\bcant|\bdoesnt|\bdoes not)\s+(?:\w+\s+){0,2}$/.test(before))return true;
        from+=needle.length;
      }
      return false;
    });
  }
  function checkAnswer(item,answer){
    if(!String(answer||'').trim())return{correct:false,code:'EMPTY'};
    const n=norm(answer);
    if(/^(idk|i don t know|i do not know|teach me)$/.test(n))return{correct:false,idk:true,code:'IDK'};
    if(item.accepted){
      const ok=item.accepted.some(a=>norm(a)===n);
      return{correct:ok,code:ok?null:'INCORRECT'};
    }
    const rubric=Object.assign({},item.rubric||{require:[]});
    if(rubric.reject){
      // A correct explicit denial ("no hydrogen bonding") must not be treated as
      // an affirmative misconception merely because it contains the same words.
      rubric.reject=rubric.reject.filter(rule=>termAffirmed(answer,rule.terms));
    }
    return Engine.evaluate(answer,rubric);
  }

  function markError(state,skill,item,code,supported){
    state.errors.push({at:new Date().toISOString(),skill:skill.id,item:item.id,code:code||'INCORRECT',supported:!!supported,guessed:!!state.guessed});
    if(state.errors.length>80)state.errors=state.errors.slice(-80);
  }

  function record(state,skill,item,result){
    const ss=skillState(state,skill.id);
    const clean=result.correct&&!state.supportUsed&&!state.guessed;
    if(result.correct){
      state.wrongStreak=0;
      if(clean){ss.independentCorrect+=1;ss.status='READY';}
      else{ss.supportedCorrect+=1;ss.status='REVIEW';}
    }else{
      state.wrongStreak+=1;ss.status='REVIEW';markError(state,skill,item,result.code,state.supportUsed);
    }
    ss.lastItem=item.id;
    state.history.push({skill:skill.id,item:item.id,correct:!!result.correct,clean,supported:!!state.supportUsed,guessed:!!state.guessed,mode:state.mode});
    if(state.history.length>140)state.history=state.history.slice(-140);
    return{clean,status:ss.status};
  }

  function markSupported(state,ss){state.supportUsed=true;if(ss)ss.status='REVIEW';return state;}

  function foundationRecommendations(state){
    return Data.SKILLS.filter(s=>skillState(state,s.id).status==='REVIEW'&&s.foundationDay).map(s=>({skill:s.id,label:s.label,day:s.foundationDay,href:`../../day${s.foundationDay}/`}));
  }
  function readiness(state){
    const ready=Data.SKILLS.filter(s=>skillState(state,s.id).independentCorrect>0).length;
    return{ready,total:Data.SKILLS.length,percent:Math.round(ready/Data.SKILLS.length*100)};
  }

  function diagnosticQueue(){return Data.SKILLS.map(s=>({skill:s.id,item:s.items[0].id}));}
  function formLabel(attempt){const n=Math.max(1,Number(attempt)||1);return n<=26?String.fromCharCode(64+n):`#${n}`;}
  function itemKey(skillId,itemId){return `${skillId}:${itemId}`;}

  function buildTestPlan(state){
    state=state||newState();
    const attempt=(state.testAttemptNumber||0)+1;
    const seen=state.seenTestItems||{};
    const used={};let exhausted=false;
    const queue=[];
    Data.TEST1_BLUEPRINT.forEach((slot,index)=>{
      if(exhausted)return;
      const s=Data.skill(slot.skill);const usedIds=used[slot.skill]||(used[slot.skill]=[]);
      const taskPool=(Data.itemsFor?Data.itemsFor(slot):s.items.filter(x=>!slot.taskType||x.taskType===slot.taskType));
      const choices=taskPool.filter(x=>!usedIds.includes(x.id)&&!(seen[slot.skill]||[]).includes(x.id));
      if(!choices.length){exhausted=true;return;}
      const pick=choices[(attempt+index-1)%choices.length];
      usedIds.push(pick.id);
      queue.push({section:slot.section,skill:slot.skill,item:pick.id,taskType:slot.taskType,points:slot.points,paper:!!(slot.paper||pick.paper)});
    });
    if(exhausted)return{attempt,form:formLabel(attempt),queue:[],exhausted:true};
    return{attempt,form:formLabel(attempt),queue,exhausted:false};
  }

  function commitTestStart(state,plan){
    if(!plan||plan.exhausted)return null;
    state.testAttemptNumber=plan.attempt;
    state.currentTest={attempt:plan.attempt,form:plan.form,startedAt:new Date().toISOString(),completed:false,evidenceApplied:false,items:plan.queue.map(x=>Object.assign({},x))};
    state.testResponses=[];state.mix=emptyMix();
    state.seenTestItems=state.seenTestItems||{};
    plan.queue.forEach(x=>{const list=state.seenTestItems[x.skill]||(state.seenTestItems[x.skill]=[]);if(!list.includes(x.item))list.push(x.item);});
    return state.currentTest;
  }

  function scoreTestResponse(state,skill,q,item,result){
    const points=Number(q.points)||0;
    state.mix.pointsPossible+=points;
    const bucket=state.mix.bySkill[skill.id]||(state.mix.bySkill[skill.id]={correct:0,secure:0,attempted:0,pointsEarned:0,pointsPossible:0,paperPending:0,guessed:0});
    bucket.pointsPossible+=points;
    if(q.paper||item.paper){
      state.mix.paperPointsPending+=points;state.mix.paperTasks+=1;bucket.paperPending+=points;
      state.testResponses.push({section:q.section||null,skill:skill.id,item:item.id,taskType:q.taskType||item.taskType||null,paper:true,pendingReview:true,points});
      return;
    }
    state.mix.autoPointsPossible+=points;state.mix.attempted+=1;bucket.attempted+=1;
    if(state.guessed){state.mix.guessed+=1;bucket.guessed+=1;}
    if(result.correct){state.mix.correct+=1;state.mix.pointsEarned+=points;bucket.correct+=1;bucket.pointsEarned+=points;}
    if(result.correct&&!state.guessed&&!state.supportUsed){state.mix.secureCorrect+=1;bucket.secure+=1;}
    state.testResponses.push({section:q.section||null,skill:skill.id,item:item.id,taskType:q.taskType||item.taskType||null,paper:false,correct:!!result.correct,guessed:!!state.guessed,points,code:result.code||null});
  }

  function applyTestEvidence(state){
    if(!state.currentTest||state.currentTest.evidenceApplied)return;
    const prior={guessed:state.guessed,supportUsed:state.supportUsed,wrongStreak:state.wrongStreak,mode:state.mode};
    state.supportUsed=false;state.wrongStreak=0;state.mode='test-review';
    (state.testResponses||[]).forEach(r=>{
      if(r.paper)return; // Unverified drawings never create automatic mastery evidence.
      const skill=Data.skill(r.skill),item=Data.item(r.skill,r.item);
      if(!skill||!item)return;
      state.guessed=!!r.guessed;
      record(state,skill,item,{correct:!!r.correct,code:r.code||'INCORRECT'});
    });
    state.guessed=prior.guessed;state.supportUsed=prior.supportUsed;state.wrongStreak=prior.wrongStreak;state.mode=prior.mode;
    state.currentTest.evidenceApplied=true;
  }

  function finalizeTest(state){
    if(!state.currentTest||state.currentTest.completed)return state.currentTest;
    applyTestEvidence(state);
    state.currentTest.completed=true;state.currentTest.completedAt=new Date().toISOString();
    state.currentTest.score={correct:state.mix.correct,secureCorrect:state.mix.secureCorrect,attempted:state.mix.attempted,pointsEarned:state.mix.pointsEarned,pointsPossible:state.mix.pointsPossible,autoPointsPossible:state.mix.autoPointsPossible,paperPointsPending:state.mix.paperPointsPending,paperTasks:state.mix.paperTasks,guessed:state.mix.guessed,bySkill:JSON.parse(JSON.stringify(state.mix.bySkill||{}))};
    state.testHistory.push(JSON.parse(JSON.stringify(state.currentTest)));
    if(state.testHistory.length>12)state.testHistory=state.testHistory.slice(-12);
    return state.currentTest;
  }

  function mount(root){
    const doc=root.document,store=root.localStorage;
    let state=load(store);
    const practice=doc.querySelector('[data-practice]');
    const skillGrid=doc.querySelector('[data-skill-grid]');
    const recBox=doc.querySelector('[data-foundation-results]');
    const readinessBox=doc.querySelector('[data-readiness]');
    const errorBox=doc.querySelector('[data-error-log]');
    const testHistoryBox=doc.querySelector('[data-test-history]');
    if(!practice||!skillGrid)return;

    function persist(){save(store,state);renderSummary();}
    function renderSummary(){
      const r=readiness(state);
      readinessBox.innerHTML=`<b>${r.ready} of ${r.total} skill areas independently demonstrated</b><span>${r.percent}% current Unit 1 readiness evidence</span>`;
      skillGrid.innerHTML=Data.SKILLS.map(s=>{const ss=skillState(state,s.id);return `<article class="skill"><div><span class="tag">${esc(s.source)}</span><span class="status ${ss.status.toLowerCase()}">${esc(ss.status)}</span></div><h3>${esc(s.label)}</h3><p>${esc(s.teaching)}</p><button data-skill="${s.id}">Practice this skill</button></article>`;}).join('');
      const recs=foundationRecommendations(state);
      recBox.innerHTML=recs.length?recs.map(r=>`<div class="repair"><b>${esc(r.label)}</b><span>Foundation refresh suggested: Day ${r.day}</span><a href="${r.href}">Open Day ${r.day}</a></div>`).join(''):'<p>No foundation-day refresh is currently flagged. Course-specific skills can still be reviewed below.</p>';
      errorBox.innerHTML=state.errors.length?state.errors.slice(-10).reverse().map(e=>`<div class="error-row"><b>${esc(Data.skill(e.skill).label)}</b><span>${esc(e.item)} · ${esc(e.code)}${e.guessed?' · guessed':''}</span></div>`).join(''):'<p>No mistakes logged yet. Mistakes will be kept as routing evidence instead of disappearing.</p>';
      if(testHistoryBox){
        testHistoryBox.innerHTML=state.testHistory.length?state.testHistory.slice().reverse().map(t=>{const s=t.score||{};return `<div class="test-run"><b>Form ${esc(t.form)}</b><span>${s.pointsEarned||0}/${s.autoPointsPossible||0} auto-scored points · ${s.paperPointsPending||0} paper points pending · ${s.secureCorrect||0}/${s.attempted||0} secure</span></div>`;}).join(''):'<p>No completed Test 1 forms yet. Your first run will be Form A.</p>';
      }
      doc.querySelectorAll('[data-skill]').forEach(b=>b.onclick=()=>startSingle(b.dataset.skill));
    }

    function currentPair(){
      const q=state.queue[state.index];
      if(!q)return null;
      const skill=Data.skill(q.skill),item=Data.item(q.skill,q.item);
      return skill&&item?{q,skill,item}:null;
    }

    function startQueue(mode,queue){state.mode=mode;state.queue=queue;state.index=0;state.current=null;state.supportUsed=false;state.guessed=false;state.wrongStreak=0;persist();renderPractice();practice.scrollIntoView({behavior:'smooth',block:'start'});}
    function startSingle(id){const s=Data.skill(id);startQueue('skill',[{skill:id,item:s.items[0].id}]);}
    function startTest(){
      const plan=buildTestPlan(state);
      if(plan.exhausted){
        practice.innerHTML='<div class="complete"><h2>Fresh-form bank exhausted.</h2><p>You have completed every currently unique full Test 1 form. The system will not recycle an old form and call it new. Review weak skills now; add more original forms before another full retest.</p></div>';
        practice.scrollIntoView({behavior:'smooth',block:'start'});return;
      }
      commitTestStart(state,plan);state.mode='test';state.queue=plan.queue;state.index=0;state.supportUsed=false;state.guessed=false;state.wrongStreak=0;persist();renderPractice();practice.scrollIntoView({behavior:'smooth',block:'start'});
    }

    function advance(){state.index+=1;state.supportUsed=false;state.guessed=false;state.wrongStreak=0;state.current=null;persist();renderPractice();}
    function requireFresh(skill,item){
      const used=state.queue.filter(x=>x.skill===skill.id).map(x=>x.item);
      const alt=Data.alternate(skill.id,item.id,used,item.taskType);
      if(alt)state.queue.splice(state.index+1,0,{skill:skill.id,item:alt.id,taskType:alt.taskType});
    }

    function testCompleteScreen(){
      const completed=finalizeTest(state),s=completed.score||state.mix;
      const autoPercent=s.autoPointsPossible?Math.round(s.pointsEarned/s.autoPointsPossible*100):0;
      const weak=Object.keys(s.bySkill||{}).filter(id=>{const b=s.bySkill[id];return b.attempted&&b.secure<b.attempted;});
      const weakHtml=weak.length?`<p><b>Auto-scored repair targets:</b> ${weak.map(id=>esc(Data.skill(id).label)).join(', ')}.</p>`:'<p><b>No auto-scored weak skill was flagged.</b> Paper work still needs review before treating the whole test as secure.</p>';
      const nextPlan=buildTestPlan(state);
      const nextAction=nextPlan.exhausted?'<p><b>No recycled Form C:</b> the current unique bank is exhausted after this form. Review the paper work and weak skills instead of repeating memorized questions.</p>':'<div class="actions" style="justify-content:center"><button data-next-test>Start the next fresh form</button><button class="secondary" data-close>Review weak skills first</button></div>';
      persist();
      return `<div class="complete"><div class="tag">Test 1 Form ${esc(completed.form)}</div><h2>${s.pointsEarned}/${s.autoPointsPossible} auto-scored points (${autoPercent}%)</h2><p><b>${s.paperPointsPending} of the 130 practice points</b> require review of the actual paper drawings/work and are intentionally not auto-awarded. ${s.paperTasks} paper task${s.paperTasks===1?'':'s'} are pending.</p><p><b>${s.secureCorrect}/${s.attempted}</b> auto-scored subparts were correct without a guess. ${s.guessed} answer${s.guessed===1?' was':'s were'} marked as guessed.</p>${weakHtml}<p>No answers, hints, error-log changes, or readiness updates were exposed during the form. Unverified paper work never creates automatic mastery evidence.</p>${nextAction}</div>`;
    }

    function renderTestQuestion(pair){
      const {q,skill,item}=pair,count=`${state.index+1} of ${state.queue.length}`;
      const form=state.currentTest?state.currentTest.form:'?';const isPaper=!!(q.paper||item.paper);
      const prompt=isPaper?paperPrompt(item):item.prompt;
      const response=isPaper
        ? '<label class="guess"><input type="checkbox" data-paper-done> I completed this full response on paper</label><div class="actions"><button data-lock>Lock paper task and continue</button></div>'
        : '<label>Your answer<input data-answer autocomplete="off" spellcheck="false"></label><label class="guess"><input type="checkbox" data-guessed> I guessed or was not sure about this answer</label><div class="actions"><button data-lock>Lock answer and continue</button></div>';
      const paper=isPaper?'<div class="test-silence"><b>Paper required:</b> complete the drawing/work on paper. This task is held for paper review and is not automatically scored or used as mastery evidence.</div>':'';
      practice.innerHTML=`<article class="practice-card test-question"><div class="practice-head"><div><span class="tag">Test 1 Form ${esc(form)} · Q${esc(q.section||state.index+1)} · ${esc(item.task||'production')}</span><h2>${esc(skill.label)}</h2></div><span class="counter">${count} · ${q.points} pts</span></div><p class="question">${esc(prompt)}</p>${paper}${response}<div data-test-message></div><div class="test-silence"><b>Test mode:</b> no correctness, hints, teaching, error-log changes, or readiness updates are shown until the entire form is finished.</div></article>`;
      const input=practice.querySelector('[data-answer]'),guess=practice.querySelector('[data-guessed]'),paperDone=practice.querySelector('[data-paper-done]'),message=practice.querySelector('[data-test-message]');
      practice.querySelector('[data-lock]').onclick=()=>{
        if(isPaper&&!paperDone.checked){message.innerHTML='<div class="bad"><b>Finish the paper work first.</b><p>Check the box only after your complete response is on paper.</p></div>';return;}
        state.guessed=guess?!!guess.checked:false;
        const result=isPaper?{correct:false,code:'PAPER_REVIEW_PENDING'}:checkAnswer(item,input.value);
        // Keep test evidence buffered. Applying record() here would leak correctness
        // through the visible error log/readiness cards before the form is finished.
        scoreTestResponse(state,skill,q,item,result);
        persist();advance();
      };
      if(input){input.addEventListener('keydown',e=>{if(e.key==='Enter')practice.querySelector('[data-lock]').click();});input.focus();}
    }

    function renderPractice(){
      const pair=currentPair();
      if(!pair){
        if(state.mode==='test'){
          practice.innerHTML=testCompleteScreen();
          const next=practice.querySelector('[data-next-test]');if(next)next.onclick=startTest;
          const close=practice.querySelector('[data-close]');if(close)close.onclick=()=>{practice.innerHTML='';practice.scrollIntoView({behavior:'smooth'});};
          return;
        }
        const r=readiness(state);
        practice.innerHTML=`<div class="complete"><h2>Practice block complete.</h2><p>${r.ready} of ${r.total} skill areas currently have independent evidence. Review any flagged area, then return to a fresh mixed set later.</p><button data-close>Return to Unit 1 overview</button></div>`;
        practice.querySelector('[data-close]').onclick=()=>{practice.innerHTML='';practice.scrollIntoView({behavior:'smooth'});};
        return;
      }
      if(state.mode==='test'){renderTestQuestion(pair);return;}

      const {skill,item}=pair,ss=skillState(state,skill.id);
      const count=`${state.index+1} of ${state.queue.length}`;
      if(item.paper){
        practice.innerHTML=`<article class="practice-card"><div class="practice-head"><div><span class="tag">${esc(skill.source)} · ${esc(item.task||'paper production')}</span><h2>${esc(skill.label)}</h2></div><span class="counter">${count}</span></div><p class="question">${esc(paperPrompt(item))}</p><div class="hint"><b>Paper production is not auto-graded.</b><p>Complete the structure on paper. This activity does not create independent evidence until the paper work is actually reviewed.</p></div><div class="actions"><button data-paper-complete>I completed it on paper</button><button class="secondary" data-hint>Give me a hint</button></div><div data-feedback></div></article>`;
        const feedback=practice.querySelector('[data-feedback]');
        practice.querySelector('[data-paper-complete]').onclick=()=>{ss.status='REVIEW';state.history.push({skill:skill.id,item:item.id,paperPending:true,mode:state.mode});persist();feedback.innerHTML='<div class="good supported"><b>Saved for paper review.</b><p>No automatic mastery was awarded from an unverified drawing.</p><button data-next>Continue</button></div>';feedback.querySelector('[data-next]').onclick=advance;};
        practice.querySelector('[data-hint]').onclick=()=>{markSupported(state,ss);persist();feedback.innerHTML=`<div class="hint"><b>Hint</b><p>${esc(skill.hint)}</p><p>This is supported learning and the paper still requires review.</p></div>`;};
        return;
      }

      const {skill:itemSkill,item:normalItem}= {skill,item};
      const normalSS=ss;
      practice.innerHTML=`<article class="practice-card"><div class="practice-head"><div><span class="tag">${esc(itemSkill.source)} · ${esc(normalItem.task||'practice')}</span><h2>${esc(itemSkill.label)}</h2></div><span class="counter">${count}</span></div><p class="question">${esc(normalItem.prompt)}</p><label>Your answer<input data-answer autocomplete="off" spellcheck="false"></label><div class="actions"><button data-check>Check answer</button><button class="secondary" data-hint>Give me a hint</button><button class="ghost" data-idk>I don’t know yet</button></div><div data-feedback></div><p class="evidence">Independent evidence: ${normalSS.independentCorrect} · Supported/repaired: ${normalSS.supportedCorrect}</p></article>`;
      const input=practice.querySelector('[data-answer]'),feedback=practice.querySelector('[data-feedback]');
      function teach(reason){markSupported(state,normalSS);persist();feedback.innerHTML=`<div class="teach"><b>${esc(reason)}</b><p>${esc(itemSkill.teaching)}</p><p><b>Fresh-item rule:</b> this explanation helps you learn, but this same question cannot count as independent proof. You will get a different question from this skill next.</p><button data-fresh>Try a fresh question</button></div>`;feedback.querySelector('[data-fresh]').onclick=()=>{requireFresh(itemSkill,normalItem);advance();};}
      practice.querySelector('[data-hint]').onclick=()=>{markSupported(state,normalSS);persist();feedback.innerHTML=`<div class="hint"><b>Hint</b><p>${esc(itemSkill.hint)}</p><p>This attempt is now supported. A fresh item will be required for independent evidence.</p></div>`;input.focus();};
      practice.querySelector('[data-idk]').onclick=()=>{const result={correct:false,idk:true,code:'IDK'};record(state,itemSkill,normalItem,result);teach('Let’s repair the idea first.');};
      practice.querySelector('[data-check]').onclick=()=>{
        const result=checkAnswer(normalItem,input.value);
        if(result.idk){record(state,itemSkill,normalItem,result);teach('Let’s repair the idea first.');return;}
        const recorded=record(state,itemSkill,normalItem,result);
        persist();
        if(result.correct&&recorded.clean){feedback.innerHTML=`<div class="good"><b>Correct without support.</b><p>That counts as independent evidence for this skill.</p><button data-next>Continue</button></div>`;feedback.querySelector('[data-next]').onclick=advance;}
        else if(result.correct){feedback.innerHTML=`<div class="good supported"><b>Correct with support.</b><p>You learned it, but it does not count as independent evidence. A fresh item comes next.</p><button data-next>Fresh question</button></div>`;requireFresh(itemSkill,normalItem);feedback.querySelector('[data-next]').onclick=advance;}
        else if(state.wrongStreak>=2){teach('Two misses on this skill means we switch from testing to teaching.');}
        else{
          // Codex P1 repair from PR #71: revealing this automatic hint contaminates the retry.
          markSupported(state,normalSS);persist();
          feedback.innerHTML=`<div class="bad"><b>Not yet.</b><p>${esc(itemSkill.hint)}</p><p>This retry is now supported. If you solve it, the system will still require a different fresh question before independent evidence is awarded.</p></div>`;input.select();
        }
      };
      input.addEventListener('keydown',e=>{if(e.key==='Enter')practice.querySelector('[data-check]').click();});
      input.focus();
    }

    doc.querySelector('[data-start-check]').onclick=()=>startQueue('check',diagnosticQueue());
    doc.querySelector('[data-start-test]').onclick=startTest;
    renderSummary();
  }

  return{KEY,newState,load,save,skillState,checkAnswer,paperPrompt,termAffirmed,record,markSupported,foundationRecommendations,readiness,diagnosticQueue,formLabel,buildTestPlan,commitTestStart,scoreTestResponse,applyTestEvidence,finalizeTest,mount};
});
