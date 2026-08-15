var T=require('./teacher-runtime.js');
var seq=require('./curriculum/astarryia/logs-teacher-sequence.js');
var p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}

ok('log teacher sequence validates',T.validateSequence(seq)===true);
ok('sequence teaches product rule before using it for log6',seq.steps.findIndex(s=>s.id==='name_product_rule') < seq.steps.findIndex(s=>s.id==='write_6_log'));
ok('sequence contains narration',seq.steps.some(s=>s.type==='SAY'));
ok('sequence contains meaningful animation',seq.steps.some(s=>s.animation==='reverse_power_to_log')&&seq.steps.some(s=>s.animation==='split_log_product'));
ok('sequence asks learner discovery/transfer questions',seq.steps.filter(s=>s.type==='ASK').length>=3);
ok('sequence exposes no-calculator landmarks',seq.steps.some(s=>String(s.content||'').includes('log(2)≈0.30')));

var spoken=[],events=[];
var narration={speak:function(text,opts){spoken.push({text:text,rate:opts.rate});return Promise.resolve({spoken:true});},pause:function(){events.push('voice_pause');},resume:function(){events.push('voice_resume');},cancel:function(){events.push('voice_cancel');},setRate:function(r){events.push('rate_'+r);}};
var renderer={onWrite:s=>events.push('write:'+s.id),onAnimate:s=>events.push('animate:'+s.animation),onAsk:s=>events.push('ask:'+s.id),onAnswerResult:x=>events.push('answer:'+x.result.correct)};
function evaluator(step,answer){
 var a=step.answerSpec||{};
 if(a.type==='numeric')return {correct:Number(answer)===a.value};
 if(a.type==='choice')return {correct:String(answer).trim()===a.value};
 if(a.type==='numericTolerance')return {correct:Math.abs(Number(answer)-a.value)<=a.tolerance};
 return {correct:false};
}

(async function(){
 var r=T.createRuntime({narrationProvider:narration,renderer:renderer,evaluator:evaluator});
 r.load(seq);ok('runtime loads reusable curriculum sequence',r.view().status==='READY');
 await r.start();ok('first step actually narrates',spoken.length===1&&spoken[0].text.indexOf('watch')>=0);
 await r.next();ok('next step writes instead of narrating another paragraph',events.includes('write:write_10_1'));
 r.pause();ok('pause controls narration',r.view().paused===true&&events.includes('voice_pause'));
 r.resume();ok('resume controls narration',r.view().paused===false&&events.includes('voice_resume'));
 r.setRate(.75);ok('slow down changes runtime speech rate',r.view().rate===.75&&events.includes('rate_0.75'));

 // Jump a fresh minimal sequence through an ASK gate.
 var qseq={steps:[{id:'say',type:'SAY',text:'Listen.'},{id:'q',type:'ASK',prompt:'10 to what power gives 1000?',answerSpec:{type:'numeric',value:3}},{id:'after',type:'WRITE',content:'log(1000)=3'}]};
 var q=T.createRuntime({narrationProvider:narration,renderer:renderer,evaluator:evaluator});q.load(qseq);await q.start();await q.next();
 ok('ASK blocks progression until learner acts',q.view().status==='WAITING_FOR_ANSWER');
 var blocked=await q.next();ok('runtime cannot click past question',blocked.blocked==='learner_action_required');
 var wrong=q.submitAnswer(2);ok('wrong learner response is evaluated, not auto-advanced',wrong.correct===false&&q.view().status==='NEEDS_RETEACH');
 // reload for correct path
 q.load(qseq);await q.start();await q.next();var good=q.submitAnswer(3);ok('correct response opens forward flow',good.correct===true&&q.view().status==='READY');
 await q.next();ok('correct answer allows next visual action',events.includes('write:after'));
 await q.replay();ok('replay is a real runtime control',q.view().history.some(x=>x.event==='REPLAY'));
 console.log('\nTeacher runtime: '+p+' passed, '+f+' failed');if(f)process.exit(1);
})();
