(function(){'use strict';
var root=document.getElementById('view');if(!root)return;
var remembered=null,lastRun=0;
function feedback(msg){var f=root.querySelector('#feedback');if(!f)return;f.innerHTML='<div class="feedback bad"><b>'+msg+'</b></div>';try{f.scrollIntoView({behavior:'smooth',block:'nearest'})}catch(e){}}
function sync(){var b=root.querySelector('#check');if(!b)return null;if(typeof b.onclick==='function'){remembered=b.onclick;b.dataset.checkInputGuard='captured';}else if(remembered){b.onclick=remembered;b.dataset.checkInputGuard='restored';}return b;}
function normalizeAlgebraAnswer(){var eq=window.AlgebraAnswerEquivalence,input=root.querySelector('#answer');if(!eq||!input||typeof eq.normalize!=='function'||typeof eq.isAlgebraQuestion!=='function'||!eq.isAlgebraQuestion(root))return;input.value=eq.normalize(input.value);}
function run(e){var b=e.target&&e.target.closest?e.target.closest('#check'):null;if(!b||!root.contains(b)||b.disabled)return;var now=Date.now();if(now-lastRun<500){e.preventDefault();e.stopPropagation();return;}sync();normalizeAlgebraAnswer();var handler=typeof b.onclick==='function'?b.onclick:remembered;if(typeof handler!=='function'){e.preventDefault();e.stopPropagation();feedback('Check answer is not connected. Please reload this page.');return;}lastRun=now;e.preventDefault();e.stopPropagation();try{handler.call(b,e)}catch(err){feedback('Check answer hit an error. Please reload this page.');try{console.error('Math Check answer error',err)}catch(ignore){}}}
new MutationObserver(function(){setTimeout(sync,0)}).observe(root,{childList:true,subtree:true});
root.addEventListener('pointerup',run,true);
root.addEventListener('click',run,true);
sync();
})();
