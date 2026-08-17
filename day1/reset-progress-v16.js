(function(){'use strict';
var nav=document.getElementById('navTabs');if(!nav||document.getElementById('resetProgressBtn'))return;
var btn=document.createElement('button');btn.id='resetProgressBtn';btn.type='button';btn.textContent='Reset Test Progress';btn.title='Clear Day 1 test progress and start fresh';
btn.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();var ok=window.confirm('Reset Day 1 testing progress? This clears saved Day 1 work, learning-record notes, and current lesson position on this device so AStarryia can start fresh.');if(!ok)return;
  var exact=['dr-merissa-day1-state-v1','dr-merissa-day1-ui-v5','dr-merissa-learning-record-v11'];
  exact.forEach(function(k){try{localStorage.removeItem(k)}catch(err){}});
  try{
    var more=[];for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i)||'';if(/^dr-merissa-day1/i.test(k)||/^starr-chem-day1/i.test(k))more.push(k)}
    more.forEach(function(k){localStorage.removeItem(k)});
  }catch(err){}
  try{sessionStorage.clear()}catch(err){}
  location.hash='';location.reload();
});
nav.appendChild(btn);
})();