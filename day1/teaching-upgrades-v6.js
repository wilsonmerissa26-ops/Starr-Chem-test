(function(){'use strict';
var busy=false;
function text(el){return (el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function percentCoach(){
  if(!location.pathname.includes('/day1'))return;
  var bodyText=text(document.body);
  if(!/percent|%/.test(bodyText))return;
  var cards=[].slice.call(document.querySelectorAll('.card'));
  var target=cards.find(function(c){return /Mental percent anchors|What percent\?|Fractions & percentages/.test(text(c));});
  if(!target||target.querySelector('[data-percent-toolbox]'))return;
  var box=document.createElement('div');box.setAttribute('data-percent-toolbox','1');box.style.marginTop='12px';
  box.innerHTML='<button type="button" class="btn ghost" data-toolbox-toggle aria-expanded="false">🧰 Percent Toolbox</button><div data-toolbox-panel hidden class="warning" style="margin-top:10px"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><b>Percent reference</b><button type="button" class="btn ghost" data-toolbox-close style="min-height:38px;padding:7px 10px">Close</button></div><div style="margin-top:10px;line-height:1.6"><b>Rule</b><br>Percent of a number = percent ÷ 100 × whole.<br><br><b>What it means</b><br>Change the percent into a part of 1, then multiply by the whole.<br><br><b>One example</b><br>27% of 80 = 0.27 × 80 = 21.6.<br><br><b>Mental shortcut</b><br>When it is easier, build from friendly anchors. For 27% of 80: 20% + 5% + 2%.</div><div class="muted" style="margin-top:10px">Dr. Merissa teaches how to choose between different mental routes during the lesson. This box is only a quick reminder.</div></div>';
  var first=target.firstElementChild; if(first) target.insertBefore(box,first); else target.appendChild(box);
  var toggle=box.querySelector('[data-toolbox-toggle]'),panel=box.querySelector('[data-toolbox-panel]'),close=box.querySelector('[data-toolbox-close]');
  function setOpen(open){panel.hidden=!open;toggle.setAttribute('aria-expanded',open?'true':'false');toggle.textContent=open?'🧰 Hide Toolbox':'🧰 Percent Toolbox';}
  toggle.onclick=function(){setOpen(panel.hidden);};close.onclick=function(){setOpen(false);};
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
function run(){if(busy)return;busy=true;try{
  /* The compact v7 Toolbox supersedes the old percent toolbox. Do not run
     percentCoach here: v7 removes that legacy box, and having both mutation
     observers add/remove it creates an endless DOM render loop on mobile. */
  tinyChecks();
}finally{busy=false;}}
new MutationObserver(function(){setTimeout(run,0);}).observe(document.documentElement,{childList:true,subtree:true});
run();
})();