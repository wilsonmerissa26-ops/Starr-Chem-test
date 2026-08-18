(function(root,factory){
  var api;
  if(typeof module==='object'&&module.exports){
    api=factory(require('../day1-adaptive-runtime.js'),require('../day1-problem-source-adapters.js'),require('../math-answer-checker.js'),require('../student-model-idk-router.js'),require('../math-prerequisite-content.js'));
    module.exports=api;
  }else{
    api=factory(root.Day1AdaptiveRuntime,root.Day1ProblemSourceAdapters,root.MathAnswerChecker,root.StudentModelIdkRouter,root.MathPrerequisiteContent);
    root.Day1AdaptiveClassroomController=api;
    if(typeof document!=='undefined'){
      if(root.Day1AdaptiveReady)api.start();
      else root.addEventListener('day1-adaptive-ready',function(){api.start();},{once:true});
    }
  }
})(typeof globalThis!=='undefined'?globalThis:this,function(Runtime,Adapters,AnswerChecker,StudentModel,PrereqContent){
'use strict';

var STATE_KEY='dr-merissa-day1-adaptive-state-v1';
var AREA_IDS=['fractions_percent','algebra','exponents','scientific_notation','logs','unit_conversions'];
var SUPPORTS=[
  {id:'adaptiveHint',mode:'hint',label:'Hint'},
  {id:'adaptiveUnderstand',mode:'understand',label:'Help me understand'},
  {id:'adaptiveFirst',mode:'first_step',label:'First step'},
  {id:'adaptiveWalk',mode:'walkthrough',label:'Walk me through it'},
  {id:'adaptiveMental',mode:'mental',label:'Mental route'}
];
var state=null,observer=null,bound=false,walk=null,repairView=null;

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]);});}
function norm(v){return String(v==null?'':v).trim().toLowerCase().replace(/\s+/g,'').replace(/×/g,'*').replace(/−/g,'-');}
function near(a,b){return Math.abs(Number(a)-Number(b))<=1e-9*Math.max(1,Math.abs(Number(a)),Math.abs(Number(b)));}
function loadStateFromStore(store){
  try{var raw=store&&store.getItem(STATE_KEY);return Runtime.restoreLearnerState(raw?JSON.parse(raw):Runtime.createLearnerState({studentId:'astarryia'}));}
  catch(e){return Runtime.createLearnerState({studentId:'astarryia'});}
}
function saveStateToStore(store,s){try{if(store)store.setItem(STATE_KEY,JSON.stringify(s));return true;}catch(e){return false;}}
function save(){if(typeof localStorage!=='undefined')saveStateToStore(localStorage,state);return state;}
function getState(){return state;}
function persist(){return save();}

function inferProblem(questionText){
  var lastError=null;
  for(var i=0;i<AREA_IDS.length;i++){
    try{return Adapters.fromClassroomPrompt(AREA_IDS[i],questionText,{sourceId:'classroom:'+AREA_IDS[i]+':'+String(questionText).trim()});}
    catch(e){lastError=e;}
  }
  throw lastError||new Error('Unable to normalize classroom question');
}
function matchExpected(input,expected){
  if(expected==null)return true;
  if(typeof expected==='boolean')return /^(yes|true|done|ok)$/i.test(String(input).trim())===expected;
  if(typeof expected==='number'){
    var f=String(input).trim().match(/^([+-]?[0-9.]+)\/([+-]?[0-9.]+)$/);
    var n=f&&Number(f[2])!==0?Number(f[1])/Number(f[2]):Number(String(input).replace(/%/g,'').trim());
    return Number.isFinite(n)&&near(n,expected);
  }
  if(expected&&typeof expected==='object'){
    if(Object.prototype.hasOwnProperty.call(expected,'coefficient')&&Object.prototype.hasOwnProperty.call(expected,'exponent')){
      var m=norm(input).match(/^([+-]?[0-9]*\.?[0-9]+)\*?10\^?([+-]?\d+)$/);
      return !!m&&near(Number(m[1]),expected.coefficient)&&Number(m[2])===Number(expected.exponent);
    }
    return norm(input)===norm(JSON.stringify(expected));
  }
  var got=norm(input),want=norm(expected);
  if(got===want)return true;
  if(want.indexOf('/')>=0){
    var a=got.match(/^([+-]?[0-9.]+)\/([+-]?[0-9.]+)$/),b=want.match(/^([+-]?[0-9.]+)\/([+-]?[0-9.]+)$/);
    if(a&&b&&Number(a[2])&&Number(b[2]))return near(Number(a[1])/Number(a[2]),Number(b[1])/Number(b[2]));
  }
  return false;
}
function supportButtonSpecs(){return SUPPORTS.map(function(x){return Object.assign({},x);});}

function panel(){return typeof document!=='undefined'?document.getElementById('adaptiveTutorPanel'):null;}
function feedback(){return typeof document!=='undefined'?document.getElementById('feedback'):null;}
function currentQuestionText(){var q=document.querySelector('.question');return q?q.textContent.trim():'';}
function ensureCurrent(){
  var text=currentQuestionText();if(!text)return null;
  var p=inferProblem(text);
  if(!state.current||!state.current.problem||state.current.problem.sourceId!==p.sourceId){Runtime.startProblem(state,p);walk=null;repairView=null;save();}
  return state.current;
}

function supportBarHtml(){
  return '<div id="adaptiveSupportBar" class="actions adaptiveSupport" style="margin-top:10px;flex-wrap:wrap">'+SUPPORTS.map(function(x){return '<button class="btn secondary" type="button" id="'+x.id+'" data-adaptive-mode="'+x.mode+'">'+esc(x.label)+'</button>';}).join('')+'</div><div id="adaptiveTutorPanel" aria-live="polite"></div>';
}
function enhancePractice(){
  if(typeof globalThis!=='undefined'&&!globalThis.Day1AdaptiveReady)return false;
  if(!document.getElementById('check')||!document.querySelector('.question'))return false;
  var check=document.getElementById('check');
  if(!check.__adaptiveBaseCheck)check.__adaptiveBaseCheck=check.onclick;
  var old=document.getElementById('idk');if(old)old.style.display='none';
  if(!document.getElementById('adaptiveSupportBar')){
    var fb=document.getElementById('feedback');
    if(fb)fb.insertAdjacentHTML('beforebegin',supportBarHtml());
  }
  try{ensureCurrent();}catch(e){var p=panel();if(p)p.innerHTML='<div class="feedback bad">Adaptive tutor could not read this problem.</div>';return false;}
  return true;
}

function renderSupport(mode,result){
  var p=panel();if(!p)return;
  if(mode==='hint')p.innerHTML='<div class="idkbox"><b>Hint</b><p>'+esc(result.hint||'Look at the relationship in the problem before calculating.')+'</p></div>';
  else if(mode==='understand')p.innerHTML='<div class="idkbox"><b>Understand the strategy</b><p>'+esc(result.concept)+'</p>'+(result.hint?'<p><b>How to think about it:</b> '+esc(result.hint)+'</p>':'')+'<p>Stop here and try the problem when you are ready.</p></div>';
  else if(mode==='first_step'){
    var st=result.steps[0];p.innerHTML='<div class="idkbox"><b>First step only</b><p>'+esc(st?st.prompt:'Start by identifying what the problem is asking.')+'</p>'+(st&&st.hint?'<p class="muted">'+esc(st.hint)+'</p>':'')+'<p><b>Now you take it from here.</b></p></div>';
  }else if(mode==='mental')p.innerHTML='<div class="idkbox"><b>Mental route</b><p>'+esc(result.hint||'No special mental shortcut is needed for this one.')+'</p></div>';
}
function beginWalkthrough(result){walk={steps:result.steps||[],index:0,wrong:0};renderWalkStep();}
function renderWalkStep(message){
  var p=panel();if(!p)return;
  if(!walk||walk.index>=walk.steps.length){p.innerHTML='<div class="feedback good"><b>Walkthrough complete.</b><p>Now solve the original problem in the answer box yourself.</p></div>';walk=null;return;}
  var st=walk.steps[walk.index],needsInput=st.expected!=null;
  p.innerHTML='<div class="idkbox"><b>Walkthrough • step '+(walk.index+1)+' of '+walk.steps.length+'</b><p>'+esc(st.prompt)+'</p>'+
    (message?'<div class="feedback '+(message.good?'good':'bad')+'">'+esc(message.text)+'</div>':'')+
    (needsInput?'<input id="adaptiveStepInput" class="input" inputmode="text" autocomplete="off"><div class="actions" style="margin-top:8px"><button class="btn" id="adaptiveCheckStep" type="button">Check this step</button>'+(st.prerequisiteSkillIds&&st.prerequisiteSkillIds.length?'<button class="btn ghost" id="adaptiveCantStep" type="button" data-skill="'+esc(st.prerequisiteSkillIds[0])+'">I can’t do this step</button>':'')+'</div>':'<button class="btn" id="adaptiveStepContinue" type="button">I did that step →</button>')+
    (st.hint?'<p class="muted">Hint if needed: '+esc(st.hint)+'</p>':'')+'</div>';
}
function checkWalkStep(){
  if(!walk)return;var st=walk.steps[walk.index],input=document.getElementById('adaptiveStepInput');if(!input)return;
  if(matchExpected(input.value,st.expected)){walk.index++;walk.wrong=0;renderWalkStep({good:true,text:'Yes. Keep going.'});}
  else{walk.wrong++;renderWalkStep({good:false,text:'Not yet. Stay on this step.'});}
}

function renderRepair(result,message){
  repairView=result;var p=panel();if(!p)return;
  var lesson=result&&result.lesson,check=result&&(result.checkItem||result.nextCheckItem);
  if(!lesson){p.innerHTML='<div class="feedback bad">I could not load that prerequisite lesson.</div>';return;}
  p.innerHTML='<div class="idkbox adaptivePrereq"><b>Fix the smaller skill: '+esc(lesson.title)+'</b><p>'+esc(lesson.concept)+'</p><p><b>Why it works:</b> '+esc(lesson.why)+'</p><div class="stage"><b>Example</b><p>'+esc(lesson.workedExample.prompt)+'</p><p>'+esc(lesson.workedExample.explanation)+'</p></div>'+
    (result.representationContent?'<p><b>Another representation:</b> '+esc(result.representationContent)+'</p>':'')+
    (message?'<div class="feedback '+(message.good?'good':'bad')+'">'+esc(message.text)+'</div>':'')+
    (check?'<div class="stage"><b>Quick check</b><p>'+esc(check.prompt)+'</p><input id="adaptivePrereqInput" class="input" inputmode="text" autocomplete="off"><div class="actions" style="margin-top:8px"><button class="btn" id="adaptiveCheckPrereq" type="button" data-check="'+esc(check.id)+'">Check smaller skill</button></div></div>':'')+'</div>';
}
function activePrereqLesson(){
  var id=state&&state.current&&state.current.activePrerequisiteSkillId;
  return id&&PrereqContent?PrereqContent.getLesson(id):null;
}
function openRepair(skillId){
  try{var r=Runtime.openPrerequisiteRepair(state,skillId,StudentModel.IDK_REASONS.DONT_UNDERSTAND);save();renderRepair(r);}
  catch(e){var p=panel();if(p)p.innerHTML='<div class="feedback bad"><b>Could not open prerequisite repair.</b><p>'+esc(e.message)+'</p></div>';}
}
function submitRepair(){
  var btn=document.getElementById('adaptiveCheckPrereq'),input=document.getElementById('adaptivePrereqInput');if(!btn||!input)return;
  var r=Runtime.submitPrerequisiteCheck(state,btn.dataset.check,input.value);save();
  if(r.correct&&r.action==='return_to_parent_problem'){
    repairView=null;var p=panel();if(p)p.innerHTML='<div class="feedback good"><b>That smaller skill is back.</b><p>Now return to the original problem. I kept it right here.</p></div>';return;
  }
  if(r.action==='return_to_parent_prerequisite'||r.action==='teach_deeper_prerequisite'||r.action==='switch_representation'||r.action==='retry_prerequisite'){
    var nextLesson=r.lesson||activePrereqLesson()||(repairView&&repairView.lesson);
    renderRepair({lesson:nextLesson,checkItem:r.nextCheckItem,representationContent:r.representationContent},r.correct?{good:true,text:'Good. Move back up one level.'}:{good:false,text:'Not yet. We are staying with the smaller skill.'});
    return;
  }
  var p2=panel();if(p2)p2.innerHTML='<div class="feedback bad"><b>Keep working on the smaller skill.</b></div>';
}

function doSupport(mode){var cur=ensureCurrent();if(!cur)return;var r=Runtime.requestSupport(state,mode);save();if(mode==='walkthrough')beginWalkthrough(r);else renderSupport(mode,r);}
function handleMainCheck(){
  var cur=ensureCurrent(),answer=document.getElementById('answer'),fb=feedback();if(!cur||!answer||!answer.value.trim())return;
  var correct=AnswerChecker.check(cur.problem,answer.value,cur.plan),result=Runtime.recordCurrentAnswer(state,correct,answer.value,{independent:!cur.supportUsed,correctExplanation:false});save();
  if(correct){
    answer.disabled=true;var check=document.getElementById('check');if(check)check.disabled=true;
    if(fb)fb.innerHTML='<div class="feedback good"><b>Correct.</b><p>Your answer stays visible so you can see what worked.</p><button class="btn" id="adaptiveContinueProblem" type="button">Continue to another problem →</button></div>';
  }else{
    var repair=result.suggestedPrerequisiteSkillId;
    if(fb)fb.innerHTML='<div class="feedback bad"><b>Not yet. Same problem.</b><p>I am not moving you forward.</p>'+(repair?'<button class="btn secondary" id="adaptiveFixSkill" type="button" data-skill="'+esc(repair)+'">Fix the smaller skill I need here</button>':'')+'</div>';
  }
}
function continueProblem(){
  var check=document.getElementById('check'),answer=document.getElementById('answer');
  if(check&&check.__adaptiveBaseCheck){check.disabled=false;if(answer)answer.disabled=false;check.__adaptiveBaseCheck.call(check);}
}

function clickHandler(e){
  var t=e.target;if(!t||!t.id)return;
  if(t.id==='check'){
    if(!document.getElementById('adaptiveSupportBar'))return;
    e.preventDefault();e.stopImmediatePropagation();handleMainCheck();return;
  }
  if(t.dataset&&t.dataset.adaptiveMode){e.preventDefault();e.stopImmediatePropagation();doSupport(t.dataset.adaptiveMode);return;}
  if(t.id==='adaptiveCheckStep'){e.preventDefault();checkWalkStep();return;}
  if(t.id==='adaptiveStepContinue'){e.preventDefault();if(walk){walk.index++;renderWalkStep();}return;}
  if(t.id==='adaptiveCantStep'||t.id==='adaptiveFixSkill'){e.preventDefault();openRepair(t.dataset.skill);return;}
  if(t.id==='adaptiveCheckPrereq'){e.preventDefault();submitRepair();return;}
  if(t.id==='adaptiveContinueProblem'){e.preventDefault();continueProblem();return;}
}
function start(){
  if(bound||typeof document==='undefined'||!Runtime||!Adapters||!AnswerChecker||!StudentModel||!PrereqContent)return false;
  bound=true;state=loadStateFromStore(typeof localStorage!=='undefined'?localStorage:null);
  document.addEventListener('click',clickHandler,true);
  var view=document.getElementById('view');
  if(view&&typeof MutationObserver!=='undefined'){
    observer=new MutationObserver(function(){enhancePractice();});
    observer.observe(view,{childList:true,subtree:true});
  }
  enhancePractice();return true;
}
function stop(){if(observer)observer.disconnect();observer=null;bound=false;}

return{
  STATE_KEY:STATE_KEY,AREA_IDS:AREA_IDS,SUPPORTS:SUPPORTS,
  start:start,stop:stop,getState:getState,persist:persist,inferProblem:inferProblem,matchExpected:matchExpected,
  supportButtonSpecs:supportButtonSpecs,loadStateFromStore:loadStateFromStore,
  saveStateToStore:saveStateToStore,_enhancePractice:enhancePractice
};
});
