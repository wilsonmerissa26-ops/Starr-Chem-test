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

  function emptyMix(){return{correct:0,secureCorrect:0,attempted:0,pointsEarned:0,pointsPossible:0,guessed:0,bySkill:{}};}
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

  function checkAnswer(item,answer){
    if(!String(answer||'').trim())return{correct:false,code:'EMPTY'};
    const n=norm(answer);
    if(/^(idk|i don t know|i do not know|teach me)$/.test(n))return{correct:false,idk:true,code:'IDK'};
    if(item.accepted){
      const ok=item.accepted.some(a=>norm(a)===n);
      return{correct:ok,code:ok?null:'INCORRECT'};
    }
    return Engine.evaluate(answer,item.rubric||{require:[]});
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
    const last=(state.currentTest&&state.currentTest.items&&state.currentTest.items.length?state.currentTest:(state.testHistory||[]).slice(-1)[0])||null;
    const lastKeys=new Set((last&&last.items||[]).map(x=>itemKey(x.skill,x.item)));
    const seen=state.seenTestItems||{};
    const used={};
    const queue=Data.TEST1_BLUEPRINT.map((slot,index)=>{
      const s=Data.skill(slot.skill);const usedIds=used[slot.skill]||(used[slot.skill]=[]);
      let pool=s.items.filter(x=>!usedIds.includes(x.id));
      const unseen=pool.filter(x=>!(seen[slot.skill]||[]).includes(x.id));
      const notLast=pool.filter(x=>!lastKeys.has(itemKey(slot.skill,x.id)));
      let choices=unseen.length?unseen:(notLast.length?notLast:pool);
      if(!choices.length)choices=s.items;
      const pick=choices[(attempt+index-1)%choices.length];
      usedIds.push(pick.id);
      return{skill:slot.skill,item:pick.id,points:slot.points};
    });
    return{attempt,form:formLabel(attempt),queue};
  }

  function commitTestStart(state,plan){
    state.testAttemptNumber=plan.attempt;
    state.currentTest={attempt:plan.attempt,form:plan.form,startedAt:new Date().toISOString(),completed:false,items:plan.queue.map(x=>Object.assign({},x))};
    state.testResponses=[];state.mix=emptyMix();
    state.seenTestItems=state.seenTestItems||{};
    plan.queue.forEach(x=>{const list=state.seenTestItems[x.skill]||(state.seenTestItems[x.skill]=[]);if(!list.includes(x.item))list.push(x.item);});
    return state.currentTest;
  }

  function scoreTestResponse(state,skill,q,item,result){
    const points=Number(q.points)||0;
    state.mix.attempted+=1;state.mix.pointsPossible+=points;
    const bucket=state.mix.bySkill[skill.id]||(state.mix.bySkill[skill.id]={correct:0,secure:0,attempted:0,pointsEarned:0,pointsPossible:0,guessed:0});
    bucket.attempted+=1;bucket.pointsPossible+=points;
    if(state.guessed){state.mix.guessed+=1;bucket.guessed+=1;}
    if(result.correct){state.mix.correct+=1;state.mix.pointsEarned+=points;bucket.correct+=1;bucket.pointsEarned+=points;}
    if(result.correct&&!state.guessed&&!state.supportUsed){state.mix.secureCorrect+=1;bucket.secure+=1;}
    state.testResponses.push({skill:skill.id,item:item.id,correct:!!result.correct,guessed:!!state.guessed,points,code:result.code||null});
  }

  function finalizeTest(state){
    if(!state.currentTest||state.currentTest.completed)return state.currentTest;
    state.currentTest.completed=true;state.currentTest.completedAt=new Date().toISOString();
    state.currentTest.score={correct:state.mix.correct,secureCorrect:state.mix.secureCorrect,attempted:state.mix.attempted,pointsEarned:state.mix.pointsEarned,pointsPossible:state.mix.pointsPossible,guessed:state.mix.guessed,bySkill:JSON.parse(JSON.stringify(state.mix.bySkill||{}))};
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
        testHistoryBox.innerHTML=state.testHistory.length?state.testHistory.slice().reverse().map(t=>{const s=t.score||{};return `<div class="test-run"><b>Form ${esc(t.form)}</b><span>${s.pointsEarned||0}/${s.pointsPossible||Data.META.testPoints} practice points · ${s.secureCorrect||0}/${s.attempted||Data.TEST1_BLUEPRINT.length} secure · ${s.guessed||0} guessed</span></div>`;}).join(''):'<p>No completed Test 1 forms yet. Your first run will be Form A.</p>';
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
    function startTest(){const plan=buildTestPlan(state);commitTestStart(state,plan);state.mode='test';state.queue=plan.queue;state.index=0;state.supportUsed=false;state.guessed=false;state.wrongStreak=0;persist();renderPractice();practice.scrollIntoView({behavior:'smooth',block:'start'});}

    function advance(){state.index+=1;state.supportUsed=false;state.guessed=false;state.wrongStreak=0;state.current=null;persist();renderPractice();}
    function requireFresh(skill,item){
      const used=state.queue.filter(x=>x.skill===skill.id).map(x=>x.item);
      const alt=Data.alternate(skill.id,item.id,used);
      if(alt)state.queue.splice(state.index+1,0,{skill:skill.id,item:alt.id});
    }

    function testCompleteScreen(){
      const completed=finalizeTest(state),s=completed.score||state.mix;
      const percent=s.pointsPossible?Math.round(s.pointsEarned/s.pointsPossible*100):0;
      const weak=Object.keys(s.bySkill||{}).filter(id=>{const b=s.bySkill[id];return b.secure<b.attempted;});
      const weakHtml=weak.length?`<p><b>Repair before the next form:</b> ${weak.map(id=>esc(Data.skill(id).label)).join(', ')}.</p>`:'<p><b>No weak skill was flagged on this form.</b> Still use a fresh form later to prove the result transfers.</p>';
      persist();
      return `<div class="complete"><div class="tag">Test 1 Form ${esc(completed.form)}</div><h2>${s.pointsEarned}/${s.pointsPossible} practice points (${percent}%)</h2><p><b>${s.secureCorrect}/${s.attempted}</b> answers were correct without a guess. ${s.guessed} answer${s.guessed===1?' was':'s were'} marked as guessed.</p>${weakHtml}<p>No answers or hints were shown during the form. Review the error log and targeted skill practice below, then use a different full form.</p><div class="actions" style="justify-content:center"><button data-next-test>Start the next fresh form</button><button class="secondary" data-close>Review weak skills first</button></div></div>`;
    }

    function renderTestQuestion(pair){
      const {q,skill,item}=pair,count=`${state.index+1} of ${state.queue.length}`;
      const form=state.currentTest?state.currentTest.form:'?';
      practice.innerHTML=`<article class="practice-card test-question"><div class="practice-head"><div><span class="tag">Test 1 Form ${esc(form)} · ${esc(item.task||'production')}</span><h2>${esc(skill.label)}</h2></div><span class="counter">${count} · ${q.points} pts</span></div><p class="question">${esc(item.prompt)}</p><label>Your answer<input data-answer autocomplete="off" spellcheck="false"></label><label class="guess"><input type="checkbox" data-guessed> I guessed or was not sure about this answer</label><div class="actions"><button data-lock>Lock answer and continue</button></div><div class="test-silence"><b>Test mode:</b> no correctness, hints, or teaching are shown until the entire form is finished.</div></article>`;
      const input=practice.querySelector('[data-answer]'),guess=practice.querySelector('[data-guessed]');
      practice.querySelector('[data-lock]').onclick=()=>{
        state.guessed=!!guess.checked;
        const result=checkAnswer(item,input.value);
        scoreTestResponse(state,skill,q,item,result);
        record(state,skill,item,result);
        persist();advance();
      };
      input.addEventListener('keydown',e=>{if(e.key==='Enter')practice.querySelector('[data-lock]').click();});
      input.focus();
    }

    function renderPractice(){
      const pair=currentPair();
      if(!pair){
        if(state.mode==='test'){
          practice.innerHTML=testCompleteScreen();
          practice.querySelector('[data-next-test]').onclick=startTest;
          practice.querySelector('[data-close]').onclick=()=>{practice.innerHTML='';practice.scrollIntoView({behavior:'smooth'});};
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
      practice.innerHTML=`<article class="practice-card"><div class="practice-head"><div><span class="tag">${esc(skill.source)} · ${esc(item.task||'practice')}</span><h2>${esc(skill.label)}</h2></div><span class="counter">${count}</span></div><p class="question">${esc(item.prompt)}</p><label>Your answer<input data-answer autocomplete="off" spellcheck="false"></label><div class="actions"><button data-check>Check answer</button><button class="secondary" data-hint>Give me a hint</button><button class="ghost" data-idk>I don’t know yet</button></div><div data-feedback></div><p class="evidence">Independent evidence: ${ss.independentCorrect} · Supported/repaired: ${ss.supportedCorrect}</p></article>`;
      const input=practice.querySelector('[data-answer]'),feedback=practice.querySelector('[data-feedback]');
      function teach(reason){markSupported(state,ss);persist();feedback.innerHTML=`<div class="teach"><b>${esc(reason)}</b><p>${esc(skill.teaching)}</p><p><b>Fresh-item rule:</b> this explanation helps you learn, but this same question cannot count as independent proof. You will get a different question from this skill next.</p><button data-fresh>Try a fresh question</button></div>`;feedback.querySelector('[data-fresh]').onclick=()=>{requireFresh(skill,item);advance();};}
      practice.querySelector('[data-hint]').onclick=()=>{markSupported(state,ss);persist();feedback.innerHTML=`<div class="hint"><b>Hint</b><p>${esc(skill.hint)}</p><p>This attempt is now supported. A fresh item will be required for independent evidence.</p></div>`;input.focus();};
      practice.querySelector('[data-idk]').onclick=()=>{const result={correct:false,idk:true,code:'IDK'};record(state,skill,item,result);teach('Let’s repair the idea first.');};
      practice.querySelector('[data-check]').onclick=()=>{
        const result=checkAnswer(item,input.value);
        if(result.idk){record(state,skill,item,result);teach('Let’s repair the idea first.');return;}
        const recorded=record(state,skill,item,result);
        persist();
        if(result.correct&&recorded.clean){feedback.innerHTML=`<div class="good"><b>Correct without support.</b><p>That counts as independent evidence for this skill.</p><button data-next>Continue</button></div>`;feedback.querySelector('[data-next]').onclick=advance;}
        else if(result.correct){feedback.innerHTML=`<div class="good supported"><b>Correct with support.</b><p>You learned it, but it does not count as independent evidence. A fresh item comes next.</p><button data-next>Fresh question</button></div>`;requireFresh(skill,item);feedback.querySelector('[data-next]').onclick=advance;}
        else if(state.wrongStreak>=2){teach('Two misses on this skill means we switch from testing to teaching.');}
        else{
          // Codex P1 repair: revealing this automatic hint contaminates the retry.
          // The learner may retry the same prompt to learn, but it cannot become independent evidence.
          markSupported(state,ss);persist();
          feedback.innerHTML=`<div class="bad"><b>Not yet.</b><p>${esc(skill.hint)}</p><p>This retry is now supported. If you solve it, the system will still require a different fresh question before independent evidence is awarded.</p></div>`;input.select();
        }
      };
      input.addEventListener('keydown',e=>{if(e.key==='Enter')practice.querySelector('[data-check]').click();});
      input.focus();
    }

    doc.querySelector('[data-start-check]').onclick=()=>startQueue('check',diagnosticQueue());
    doc.querySelector('[data-start-test]').onclick=startTest;
    renderSummary();
  }

  return{KEY,newState,load,save,skillState,checkAnswer,record,markSupported,foundationRecommendations,readiness,diagnosticQueue,formLabel,buildTestPlan,commitTestStart,scoreTestResponse,finalizeTest,mount};
});
