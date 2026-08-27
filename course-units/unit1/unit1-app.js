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

  function newState(){return{version:1,skills:{},errors:[],history:[],mode:null,queue:[],index:0,current:null,supportUsed:false,wrongStreak:0,mix:{correct:0,attempted:0}};}
  function load(store){try{const x=JSON.parse(store.getItem(KEY)||'null');return x&&x.version===1?Object.assign(newState(),x):newState();}catch(_){return newState();}}
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
    state.errors.push({at:new Date().toISOString(),skill:skill.id,item:item.id,code:code||'INCORRECT',supported:!!supported});
    if(state.errors.length>60)state.errors=state.errors.slice(-60);
  }

  function record(state,skill,item,result){
    const ss=skillState(state,skill.id);
    const clean=result.correct&&!state.supportUsed;
    if(result.correct){
      state.wrongStreak=0;
      if(clean){ss.independentCorrect+=1;ss.status='READY';}
      else{ss.supportedCorrect+=1;ss.status='REVIEW';}
    }else{
      state.wrongStreak+=1;ss.status='REVIEW';markError(state,skill,item,result.code,state.supportUsed);
    }
    ss.lastItem=item.id;
    state.history.push({skill:skill.id,item:item.id,correct:!!result.correct,clean,supported:!!state.supportUsed});
    if(state.history.length>100)state.history=state.history.slice(-100);
    return{clean,status:ss.status};
  }

  function foundationRecommendations(state){
    return Data.SKILLS.filter(s=>skillState(state,s.id).status==='REVIEW'&&s.foundationDay).map(s=>({skill:s.id,label:s.label,day:s.foundationDay,href:`../../day${s.foundationDay}/`}));
  }
  function readiness(state){
    const ready=Data.SKILLS.filter(s=>skillState(state,s.id).independentCorrect>0).length;
    return{ready,total:Data.SKILLS.length,percent:Math.round(ready/Data.SKILLS.length*100)};
  }

  function diagnosticQueue(){return Data.SKILLS.map(s=>({skill:s.id,item:s.items[0].id}));}
  function testQueue(){return Data.TEST1_MIX.map(x=>({skill:x.skill,item:x.item}));}

  function mount(root){
    const doc=root.document,store=root.localStorage;
    let state=load(store);
    const practice=doc.querySelector('[data-practice]');
    const skillGrid=doc.querySelector('[data-skill-grid]');
    const recBox=doc.querySelector('[data-foundation-results]');
    const readinessBox=doc.querySelector('[data-readiness]');
    const errorBox=doc.querySelector('[data-error-log]');
    if(!practice||!skillGrid)return;

    function persist(){save(store,state);renderSummary();}
    function renderSummary(){
      const r=readiness(state);
      readinessBox.innerHTML=`<b>${r.ready} of ${r.total} skill areas independently demonstrated</b><span>${r.percent}% current Unit 1 readiness evidence</span>`;
      skillGrid.innerHTML=Data.SKILLS.map(s=>{const ss=skillState(state,s.id);return `<article class="skill"><div><span class="tag">${esc(s.source)}</span><span class="status ${ss.status.toLowerCase()}">${esc(ss.status)}</span></div><h3>${esc(s.label)}</h3><p>${esc(s.teaching)}</p><button data-skill="${s.id}">Practice this skill</button></article>`;}).join('');
      const recs=foundationRecommendations(state);
      recBox.innerHTML=recs.length?recs.map(r=>`<div class="repair"><b>${esc(r.label)}</b><span>Foundation refresh suggested: Day ${r.day}</span><a href="${r.href}">Open Day ${r.day}</a></div>`).join(''):'<p>No foundation-day refresh is currently flagged. Course-specific skills can still be reviewed below.</p>';
      errorBox.innerHTML=state.errors.length?state.errors.slice(-8).reverse().map(e=>`<div class="error-row"><b>${esc(Data.skill(e.skill).label)}</b><span>${esc(e.item)} · ${esc(e.code)}</span></div>`).join(''):'<p>No mistakes logged yet. Mistakes will be kept as routing evidence instead of disappearing.</p>';
      doc.querySelectorAll('[data-skill]').forEach(b=>b.onclick=()=>startSingle(b.dataset.skill));
    }

    function currentPair(){
      const q=state.queue[state.index];
      if(!q)return null;
      const skill=Data.skill(q.skill),item=Data.item(q.skill,q.item);
      return skill&&item?{skill,item}:null;
    }

    function startQueue(mode,queue){state.mode=mode;state.queue=queue;state.index=0;state.current=null;state.supportUsed=false;state.wrongStreak=0;if(mode==='test')state.mix={correct:0,attempted:0};persist();renderPractice();practice.scrollIntoView({behavior:'smooth',block:'start'});}
    function startSingle(id){const s=Data.skill(id);startQueue('skill',[{skill:id,item:s.items[0].id}]);}

    function advance(){state.index+=1;state.supportUsed=false;state.wrongStreak=0;state.current=null;persist();renderPractice();}
    function requireFresh(skill,item){
      const alt=Data.alternate(skill.id,item.id);
      state.queue.splice(state.index+1,0,{skill:skill.id,item:alt.id});
    }

    function renderPractice(){
      const pair=currentPair();
      if(!pair){
        const r=readiness(state);
        const label=state.mode==='test'?`Mixed Test 1 practice complete: ${state.mix.correct}/${state.mix.attempted} clean first-pass correct.`:'Practice block complete.';
        practice.innerHTML=`<div class="complete"><h2>${esc(label)}</h2><p>${r.ready} of ${r.total} skill areas currently have independent evidence. Review any flagged area, then return to a fresh mixed set later.</p><button data-close>Return to Unit 1 overview</button></div>`;
        practice.querySelector('[data-close]').onclick=()=>{practice.innerHTML='';practice.scrollIntoView({behavior:'smooth'});};
        return;
      }
      const {skill,item}=pair,ss=skillState(state,skill.id);
      const count=`${state.index+1} of ${state.queue.length}`;
      practice.innerHTML=`<article class="practice-card"><div class="practice-head"><div><span class="tag">${esc(skill.source)}</span><h2>${esc(skill.label)}</h2></div><span class="counter">${count}</span></div><p class="question">${esc(item.prompt)}</p><label>Your answer<input data-answer autocomplete="off" spellcheck="false"></label><div class="actions"><button data-check>Check answer</button><button class="secondary" data-hint>Give me a hint</button><button class="ghost" data-idk>I don’t know yet</button></div><div data-feedback></div><p class="evidence">Independent evidence: ${ss.independentCorrect} · Supported/repaired: ${ss.supportedCorrect}</p></article>`;
      const input=practice.querySelector('[data-answer]'),feedback=practice.querySelector('[data-feedback]');
      function teach(reason){state.supportUsed=true;ss.status='REVIEW';persist();feedback.innerHTML=`<div class="teach"><b>${esc(reason)}</b><p>${esc(skill.teaching)}</p><p><b>Fresh-item rule:</b> this explanation helps you learn, but this same question cannot count as independent proof. You will get a different question from this skill next.</p><button data-fresh>Try a fresh question</button></div>`;feedback.querySelector('[data-fresh]').onclick=()=>{requireFresh(skill,item);advance();};}
      practice.querySelector('[data-hint]').onclick=()=>{state.supportUsed=true;ss.status='REVIEW';persist();feedback.innerHTML=`<div class="hint"><b>Hint</b><p>${esc(skill.hint)}</p><p>This attempt is now supported. A fresh item will be required for independent evidence.</p></div>`;input.focus();};
      practice.querySelector('[data-idk]').onclick=()=>{record(state,skill,item,{correct:false,idk:true,code:'IDK'});teach('Let’s repair the idea first.');};
      practice.querySelector('[data-check]').onclick=()=>{
        const result=checkAnswer(item,input.value);
        if(result.idk){record(state,skill,item,result);teach('Let’s repair the idea first.');return;}
        const recorded=record(state,skill,item,result);
        if(state.mode==='test'){state.mix.attempted+=1;if(recorded.clean)state.mix.correct+=1;}
        persist();
        if(result.correct&&recorded.clean){feedback.innerHTML=`<div class="good"><b>Correct without support.</b><p>That counts as independent evidence for this skill.</p><button data-next>Continue</button></div>`;feedback.querySelector('[data-next]').onclick=advance;}
        else if(result.correct){feedback.innerHTML=`<div class="good supported"><b>Correct with support.</b><p>You learned it, but it does not count as independent evidence. A fresh item comes next.</p><button data-next>Fresh question</button></div>`;requireFresh(skill,item);feedback.querySelector('[data-next]').onclick=advance;}
        else if(state.wrongStreak>=2){teach('Two misses on this skill means we switch from testing to teaching.');}
        else{feedback.innerHTML=`<div class="bad"><b>Not yet.</b><p>${esc(skill.hint)}</p><p>Retry this problem once. If it misses again, the system will teach and then move you to a fresh item.</p></div>`;input.select();}
      };
      input.addEventListener('keydown',e=>{if(e.key==='Enter')practice.querySelector('[data-check]').click();});
      input.focus();
    }

    doc.querySelector('[data-start-check]').onclick=()=>startQueue('check',diagnosticQueue());
    doc.querySelector('[data-start-test]').onclick=()=>startQueue('test',testQueue());
    renderSummary();
  }

  return{KEY,newState,load,save,skillState,checkAnswer,record,foundationRecommendations,readiness,diagnosticQueue,testQueue,mount};
});
