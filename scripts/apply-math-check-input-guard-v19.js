'use strict';
var fs=require('fs');
function replaceOnce(src,from,to,label){var i=src.indexOf(from);if(i<0)throw new Error('missing target '+label);if(src.indexOf(from,i+from.length)>=0)throw new Error('non-unique target '+label);return src.slice(0,i)+to+src.slice(i+from.length);}
var hp='day1/index.html';var h=fs.readFileSync(hp,'utf8');
h=replaceOnce(h,'<script src="math-check-touch-guard-v18.js"></script>','<script src="math-check-input-guard-v19.js"></script>','guard script');
fs.writeFileSync(hp,h,'utf8');
var tp='test-day1-mobile-interaction-stability.js';var t=fs.readFileSync(tp,'utf8');
t=t.replace("var guard=fs.readFileSync(__dirname+'/day1/math-check-touch-guard-v18.js','utf8');","var guard=fs.readFileSync(__dirname+'/day1/math-check-input-guard-v19.js','utf8');");
var start=t.indexOf('/* Phone acceptance regression:');if(start<0)throw new Error('missing phone regression block');
var end=t.length;
var block="/* Phone acceptance regression: the visible Check-answer button must work through Android Pointer Events and ordinary click. The last-loaded v19 guard reuses the canonical checker, deduplicates pointerup/click, restores a lost handler, and never fails silently. */\nmust('phone Check input guard is loaded last',html.indexOf('math-check-input-guard-v19.js')>html.indexOf('reset-progress-v16.js'));\nmust('phone Check guard listens to pointerup and click',guard.indexOf(\"addEventListener('pointerup'\")!==-1&&guard.indexOf(\"addEventListener('click'\")!==-1);\nmust('phone Check guard targets only #check',guard.indexOf(\"closest('#check')\")!==-1);\nmust('phone Check guard preserves existing checker rather than duplicating scoring',guard.indexOf('remembered=b.onclick')!==-1&&guard.indexOf('handler.call(b,e)')!==-1);\nmust('phone Check guard suppresses duplicate pointer/click delivery',guard.indexOf('now-lastRun<500')!==-1&&guard.indexOf('e.preventDefault()')!==-1);\nmust('phone Check guard cannot fail silently',guard.indexOf('Check answer is not connected')!==-1&&guard.indexOf('Check answer hit an error')!==-1);\n";
t=t.slice(0,start)+block;
fs.writeFileSync(tp,t,'utf8');
console.log('Applied v19 pointer/click Math Check guard wiring and regressions.');
