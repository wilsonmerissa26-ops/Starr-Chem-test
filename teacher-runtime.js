/* ============================================================
   DR. MERISSA TEACHER RUNTIME v1
   Reusable orchestration layer for narrated, visual, interactive
   teaching sequences. Curriculum owns content; runtime owns flow.
   ============================================================ */

var ACTIONS = {
  SAY: 'SAY', WRITE: 'WRITE', HIGHLIGHT: 'HIGHLIGHT', MOVE: 'MOVE',
  DRAW: 'DRAW', ANIMATE: 'ANIMATE', ASK: 'ASK', WAIT: 'WAIT',
  LET_STUDENT_MANIPULATE: 'LET_STUDENT_MANIPULATE',
  EVALUATE_ACTION: 'EVALUATE_ACTION', RETEACH_DIFFERENTLY: 'RETEACH_DIFFERENTLY',
  PAUSE: 'PAUSE', REPLAY: 'REPLAY', SLOW_DOWN: 'SLOW_DOWN'
};

function validateSequence(sequence){
  if(!sequence || !Array.isArray(sequence.steps) || sequence.steps.length===0) throw new Error('Teaching sequence requires steps');
  sequence.steps.forEach(function(step,i){
    if(!step.id) throw new Error('Step '+i+' missing id');
    if(!step.type || !ACTIONS[step.type]) throw new Error('Step '+step.id+' has unknown type '+step.type);
  });
  return true;
}

function createNullNarrationProvider(){
  return {
    speak:function(text,opts){return Promise.resolve({spoken:false,text:text,opts:opts||{}});},
    pause:function(){}, resume:function(){}, cancel:function(){}, setRate:function(){}
  };
}

function createBrowserSpeechProvider(win){
  win = win || (typeof window!=='undefined'?window:null);
  return {
    speak:function(text,opts){
      opts=opts||{};
      return new Promise(function(resolve){
        if(!win || !win.speechSynthesis || !win.SpeechSynthesisUtterance){resolve({spoken:false,text:text});return;}
        var u=new win.SpeechSynthesisUtterance(String(text||''));
        if(opts.rate)u.rate=opts.rate;
        if(opts.pitch)u.pitch=opts.pitch;
        if(opts.volume!=null)u.volume=opts.volume;
        u.onend=function(){resolve({spoken:true,text:text});};
        u.onerror=function(){resolve({spoken:false,text:text});};
        win.speechSynthesis.cancel();
        win.speechSynthesis.speak(u);
      });
    },
    pause:function(){if(win&&win.speechSynthesis)win.speechSynthesis.pause();},
    resume:function(){if(win&&win.speechSynthesis)win.speechSynthesis.resume();},
    cancel:function(){if(win&&win.speechSynthesis)win.speechSynthesis.cancel();},
    setRate:function(){}
  };
}

function createRuntime(opts){
  opts=opts||{};
  var narration=opts.narrationProvider||createNullNarrationProvider();
  var renderer=opts.renderer||{};
  var evaluator=opts.evaluator||function(){return {correct:false};};
  var state={sequence:null,index:0,status:'IDLE',paused:false,rate:1,history:[],lastQuestion:null,lastManipulation:null};

  function load(sequence){validateSequence(sequence);state.sequence=sequence;state.index=0;state.status='READY';state.paused=false;state.history=[];state.lastQuestion=null;state.lastManipulation=null;return view();}
  function current(){return state.sequence&&state.sequence.steps[state.index]||null;}
  function view(){return {status:state.status,index:state.index,paused:state.paused,rate:state.rate,currentStep:current(),history:state.history.slice()};}
  function emit(name,payload){if(typeof renderer[name]==='function')return renderer[name](payload,state);}

  async function runCurrent(){
    var step=current(); if(!step)return null; if(state.paused)return {blocked:'paused'};
    state.status='PLAYING'; state.history.push({event:'STEP_STARTED',stepId:step.id,type:step.type});
    switch(step.type){
      case 'SAY': emit('onSay',step); await narration.speak(step.text,{rate:state.rate}); break;
      case 'WRITE': emit('onWrite',step); break;
      case 'HIGHLIGHT': emit('onHighlight',step); break;
      case 'MOVE': emit('onMove',step); break;
      case 'DRAW': emit('onDraw',step); break;
      case 'ANIMATE': emit('onAnimate',step); break;
      case 'ASK': state.lastQuestion=step; state.status='WAITING_FOR_ANSWER'; emit('onAsk',step); return {waiting:'answer',step:step};
      case 'WAIT': state.status='WAITING'; emit('onWait',step); return {waiting:'continue',step:step};
      case 'LET_STUDENT_MANIPULATE': state.lastManipulation=step; state.status='WAITING_FOR_MANIPULATION'; emit('onManipulate',step); return {waiting:'manipulation',step:step};
      case 'EVALUATE_ACTION': emit('onEvaluate',step); break;
      case 'RETEACH_DIFFERENTLY': emit('onReteach',step); break;
      case 'PAUSE': pause(); return {paused:true};
      case 'REPLAY': return replay();
      case 'SLOW_DOWN': setRate(step.rate||0.8); break;
    }
    state.history.push({event:'STEP_COMPLETED',stepId:step.id,type:step.type});
    return {completedStep:step.id};
  }

  async function next(){
    if(!state.sequence)return null;
    if(state.paused)return {blocked:'paused'};
    if(state.status==='WAITING_FOR_ANSWER'||state.status==='WAITING_FOR_MANIPULATION')return {blocked:'learner_action_required'};
    if(state.index>=state.sequence.steps.length-1){state.status='COMPLETE';return {complete:true};}
    state.index++; return runCurrent();
  }
  async function start(){state.index=0;return runCurrent();}
  function pause(){state.paused=true;state.status='PAUSED';narration.pause();emit('onPause',{});return view();}
  function resume(){state.paused=false;state.status='PLAYING';narration.resume();emit('onResume',{});return view();}
  function setRate(rate){state.rate=Math.max(0.5,Math.min(1.5,Number(rate)||1));narration.setRate(state.rate);emit('onRate',{rate:state.rate});return state.rate;}
  async function replay(){var step=current();if(!step)return null;narration.cancel();state.history.push({event:'REPLAY',stepId:step.id});return runCurrent();}
  function back(){if(state.index===0)return {blocked:'first_step'};narration.cancel();state.index--;state.status='READY';return view();}
  function submitAnswer(answer){
    var step=state.lastQuestion;if(!step||state.status!=='WAITING_FOR_ANSWER')return {accepted:false,reason:'no_active_question'};
    var result=evaluator(step,answer,state)||{correct:false};state.history.push({event:'ANSWER',stepId:step.id,answer:answer,result:result});
    emit('onAnswerResult',{step:step,answer:answer,result:result});
    state.lastQuestion=null;state.status=result.correct?'READY':'NEEDS_RETEACH';return result;
  }
  function submitManipulation(action){
    var step=state.lastManipulation;if(!step||state.status!=='WAITING_FOR_MANIPULATION')return {accepted:false,reason:'no_active_manipulation'};
    var result=evaluator(step,action,state)||{correct:false};state.history.push({event:'MANIPULATION',stepId:step.id,action:action,result:result});
    emit('onManipulationResult',{step:step,action:action,result:result});
    if(result.correct){state.lastManipulation=null;state.status='READY';}else{state.status='NEEDS_RETEACH';}
    return result;
  }

  return {load:load,start:start,next:next,back:back,pause:pause,resume:resume,replay:replay,setRate:setRate,submitAnswer:submitAnswer,submitManipulation:submitManipulation,view:view,ACTIONS:ACTIONS};
}

module.exports={ACTIONS:ACTIONS,validateSequence:validateSequence,createRuntime:createRuntime,createNullNarrationProvider:createNullNarrationProvider,createBrowserSpeechProvider:createBrowserSpeechProvider};
