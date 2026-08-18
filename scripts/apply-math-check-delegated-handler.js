'use strict';
var fs=require('fs'),crypto=require('crypto');
function replaceOnce(src,from,to,label){var i=src.indexOf(from);if(i<0)throw new Error('missing patch target: '+label);if(src.indexOf(from,i+from.length)>=0)throw new Error('patch target not unique: '+label);return src.slice(0,i)+to+src.slice(i+from.length);}
var p='day1/classroom-v5.js';
var s=fs.readFileSync(p,'utf8');
var oldCheck=" if($('check'))$('check').onclick=function(){var s=sess(ui.mathArea),a=areas[ui.mathArea],q=problem(a,s,false),v=$('answer').value.trim();if(!v)return;s.attempts++;if(q.a(v)){s.correct++;s.status='In progress';s.idk=false;save();$('answer').disabled=true;$('check').disabled=true;if($('idk'))$('idk').disabled=true;if($('teachFull'))$('teachFull').disabled=true;$('feedback').innerHTML='<div class=\\\"feedback good\\\"><b>Correct.</b> Before moving on, say the shortcut or rule you used in your head.<div style=\\\"margin-top:10px\\\"><button class=\\\"btn\\\" id=\\\"continueProblem\\\">Continue →</button></div></div>';$('continueProblem').onclick=function(){problem(a,s,true);save();render()};$('feedback').scrollIntoView({behavior:'smooth',block:'nearest'})}else{s.idk=true;save();$('feedback').innerHTML='<div class=\\\"feedback bad\\\"><b>Not yet. Same problem. Try again.</b><p>'+esc(q.help)+'</p></div>';$('feedback').scrollIntoView({behavior:'smooth',block:'nearest'});speak(q.help)}};";
var newCheck="";
s=replaceOnce(s,oldCheck,newCheck,'remove disposable check onclick');
var bindMarker="function bind(){\n";
var handler="function handleMathCheck(){var answer=$('answer'),feedback=$('feedback');if(!answer||!feedback)return;var s=sess(ui.mathArea),a=areas[ui.mathArea],q=problem(a,s,false),v=answer.value.trim();if(!v){feedback.innerHTML='<div class=\\\"feedback bad\\\"><b>Enter an answer first.</b></div>';feedback.scrollIntoView({behavior:'smooth',block:'nearest'});return;}s.attempts++;if(q.a(v)){s.correct++;s.status='In progress';s.idk=false;save();answer.disabled=true;if($('check'))$('check').disabled=true;if($('idk'))$('idk').disabled=true;if($('teachFull'))$('teachFull').disabled=true;feedback.innerHTML='<div class=\\\"feedback good\\\"><b>Correct.</b> Before moving on, say the shortcut or rule you used in your head.<div style=\\\"margin-top:10px\\\"><button class=\\\"btn\\\" id=\\\"continueProblem\\\">Continue →</button></div></div>';var next=$('continueProblem');if(next)next.onclick=function(){problem(a,s,true);save();render()};feedback.scrollIntoView({behavior:'smooth',block:'nearest'});}else{s.idk=true;save();feedback.innerHTML='<div class=\\\"feedback bad\\\"><b>Not yet. Same problem. Try again.</b><p>'+esc(q.help)+'</p></div>';feedback.scrollIntoView({behavior:'smooth',block:'nearest'});speak(q.help);}}\nroot.addEventListener('click',function(e){var t=e.target&&e.target.closest?e.target.closest('#check'):null;if(!t||!root.contains(t))return;e.preventDefault();e.stopPropagation();handleMathCheck();},true);\n";
s=replaceOnce(s,bindMarker,handler+bindMarker,'delegated check handler');
fs.writeFileSync(p,s,'utf8');

var tp='test-day1-classroom-v5.js';
var t=fs.readFileSync(tp,'utf8');
var marker="ok('wrong answer feedback is brought into mobile view',js.indexOf(\"$('feedback').scrollIntoView({behavior:'smooth',block:'nearest'})\")>=0);\n";
var extra=marker+"ok('math Check answer uses stable delegated capture handler',js.indexOf(\"root.addEventListener('click'\")>=0&&js.indexOf(\"closest('#check')\")>=0&&js.indexOf('handleMathCheck()')>=0);\n"+"ok('math Check answer no longer depends on disposable button onclick',js.indexOf(\"if($('check'))$('check').onclick=function()\")<0);\n"+"ok('empty math answer gives visible feedback',js.indexOf('Enter an answer first.')>=0);\n";
t=replaceOnce(t,marker,extra,'delegated check regressions');
fs.writeFileSync(tp,t,'utf8');

var runtime=fs.readFileSync(p,'utf8');
var token=crypto.createHash('sha256').update(runtime).digest('hex').slice(0,12);
var hp='day1/index.html';var html=fs.readFileSync(hp,'utf8');
html=html.replace(/classroom-v5\\.js(?:\\?v=[A-Za-z0-9._-]+)?/g,'classroom-v5.js?v='+token);
fs.writeFileSync(hp,html,'utf8');
console.log('CACHE_TOKEN',token);console.log('Applied delegated math Check handler and refreshed runtime token.');
