(function(){'use strict';
var root=document.getElementById('view');if(!root)return;
var remembered=null;
function sync(){
  var b=root.querySelector('#check');if(!b)return;
  if(typeof b.onclick==='function'){remembered=b.onclick;b.dataset.checkTouchGuard='captured';return;}
  if(remembered){b.onclick=remembered;b.dataset.checkTouchGuard='restored';}
}
new MutationObserver(function(){setTimeout(sync,0);}).observe(root,{childList:true,subtree:true});
root.addEventListener('touchend',function(e){
  var b=e.target&&e.target.closest?e.target.closest('#check'):null;
  if(!b||!root.contains(b)||b.disabled)return;
  sync();
  var handler=typeof b.onclick==='function'?b.onclick:remembered;
  if(typeof handler!=='function')return;
  e.preventDefault();
  e.stopPropagation();
  handler.call(b,e);
},{capture:true,passive:false});
sync();
})();
