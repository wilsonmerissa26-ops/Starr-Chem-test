(function(root,factory){'use strict';
var api=factory();
if(typeof module==='object'&&module.exports)module.exports=api;
else{root.AlgebraAnswerEquivalence=api;api.install(root.document);}
})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
function normalize(v){
 var raw=String(v==null?'':v).trim().replace(/−/g,'-');
 var number='([+-]?(?:(?:\\d+(?:\\.\\d*)?)|(?:\\.\\d+)))';
 var left=raw.match(new RegExp('^x\\s*(?:=|equals|is)\\s*'+number+'$','i'));
 if(left)return left[1];
 var right=raw.match(new RegExp('^'+number+'\\s*(?:=|equals)\\s*x$','i'));
 if(right)return right[1];
 return raw;
}
function isAlgebraQuestion(root){
 var q=root&&root.querySelector?root.querySelector('.question'):null;
 return !!(q&&(/solve\s+for\s+x/i.test(q.textContent||'')||/\bx\b/.test(q.textContent||'')));
}
function install(doc){
 if(!doc||!doc.getElementById)return;
 var view=doc.getElementById('view');if(!view||view.dataset.algebraAnswerEquivalenceV20)return;
 view.dataset.algebraAnswerEquivalenceV20='1';
 function beforeCheck(e){
  var target=e.target&&e.target.closest?e.target.closest('#check'):null;
  if(!target||!view.contains(target)||!isAlgebraQuestion(view))return;
  var input=view.querySelector('#answer');if(!input)return;
  input.value=normalize(input.value);
 }
 view.addEventListener('pointerup',beforeCheck,true);
 view.addEventListener('click',beforeCheck,true);
}
return{normalize:normalize,install:install,isAlgebraQuestion:isAlgebraQuestion};
});