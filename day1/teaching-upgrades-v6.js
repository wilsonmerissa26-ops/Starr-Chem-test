(function(){'use strict';
var busy=false;
function text(el){return (el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function percentCoach(){
  if(!location.pathname.includes('/day1'))return;
  var bodyText=text(document.body);
  var isPercent=/percent|%/.test(bodyText);
  if(!isPercent)return;
  var cards=[].slice.call(document.querySelectorAll('.card'));
  var target=cards.find(function(c){return /Mental percent anchors|What percent\?|Fractions & percentages/.test(text(c));});
  if(!target||target.querySelector('[data-percent-decision]'))return;
  var box=document.createElement('div');box.setAttribute('data-percent-decision','1');box.className='warning';box.style.marginTop='14px';
  box.innerHTML='<b>Percent Decision Map</b><div style="margin-top:8px;line-height:1.55">Before calculating, choose the easiest route for <em>these</em> numbers.</div><div class="chips" style="margin-top:8px"><span class="pill">Anchor: 10%, 25%, 50%, 75%, 100%</span><span class="pill">Build up</span><span class="pill">Subtract down</span><span class="pill">Use 1%</span><span class="pill">Use a fraction</span><span class="pill">Swap: x% of y = y% of x</span><span class="pill">Estimate first</span></div><details style="margin-top:10px"><summary style="font-weight:800;cursor:pointer">Hard percentages: 27%, 33%, 58% and more</summary><div style="margin-top:10px;line-height:1.6"><b>27%:</b> look for 25% + 2% or 30% − 3%. Pick whichever makes the number easier.<br><b>33%:</b> 33% is only <em>about</em> one third. For an exact answer use 30% + 3%. Exactly one third is 33⅓%.<br><b>58%:</b> try 60% − 2%.<br><b>Speed trick:</b> 18% of 50 = 50% of 18 = 9. 24% of 25 = 25% of 24 = 6.<br><b>Final check:</b> estimate the answer first so a decimal-place mistake looks obviously wrong.</div></details>';
  target.appendChild(box);
}
function tinyChecks(){
  var blocks=[].slice.call(document.querySelectorAll('*')).filter(function(e){return e.children.length===0&&/Tiny check:/i.test(text(e));});
  blocks.forEach(function(label){
    var host=label.parentElement;if(!host||host.querySelector('[data-tiny-check]'))return;
    var q=text(label);var expected=null,explain='';
    var m=q.match(/if\s+(\d+)\s+electrons?\s+are\s+left.*how many lone pairs/i);
    if(m){expected=Number(m[1])/2;explain='A lone pair is 2 electrons, so divide the leftover electrons by 2.';}
    if(expected===null)return;
    var wrap=document.createElement('div');wrap.setAttribute('data-tiny-check','1');wrap.style.marginTop='10px';
    wrap.innerHTML='<label style="display:block;font-weight:800;margin-bottom:6px">Your tiny-check answer</label><input class="input" inputmode="decimal" aria-label="Tiny check answer"><button class="btn" style="margin-top:8px">Check tiny answer</button><div aria-live="polite" style="margin-top:8px"></div>';
    var input=wrap.querySelector('input'),btn=wrap.querySelector('button'),out=wrap.querySelector('[aria-live]');
    btn.onclick=function(){var v=Number(input.value.trim());if(!Number.isFinite(v)){out.className='feedback bad';out.textContent='Enter an answer first.';return;}if(Math.abs(v-expected)<1e-9){out.className='feedback good';out.innerHTML='<b>Yes.</b> '+m[1]+' electrons ÷ 2 electrons per lone pair = '+expected+' lone pairs. Now return to the original question and use that same idea.';}else{out.className='feedback bad';out.innerHTML='<b>Not yet. Stay on this idea.</b> '+explain+' Start with '+m[1]+' electrons. Group them into pairs of 2. How many groups do you get? Try the tiny check again.';}};
    label.insertAdjacentElement('afterend',wrap);
  });
}
function run(){if(busy)return;busy=true;try{percentCoach();tinyChecks();}finally{busy=false;}}
new MutationObserver(function(){setTimeout(run,0);}).observe(document.documentElement,{childList:true,subtree:true});
run();
})();