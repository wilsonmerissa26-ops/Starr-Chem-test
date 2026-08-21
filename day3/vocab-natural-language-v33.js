(function(root,factory){'use strict';if(typeof module==='object'&&module.exports){module.exports=factory(require('./vocab-production-v32.js'));}else{factory(root.Day3VocabularyProductionV32);}})(typeof globalThis!=='undefined'?globalThis:this,function(api){'use strict';
function addPlainNo(termId){
  if(!api||!Array.isArray(api.TERMS))return;
  var term=api.TERMS.find(function(t){return t.id===termId;});
  if(!term||!Array.isArray(term.useParts))return;
  var noPart=term.useParts.find(function(p){return p.id==='no';});
  if(!noPart||!Array.isArray(noPart.patterns))return;
  if(noPart.patterns.indexOf('^no\\b')<0)noPart.patterns.unshift('^no\\b');
}
['contributor','hybrid','delocalized'].forEach(addPlainNo);
return api;
});
