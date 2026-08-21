(function(root,factory){'use strict';if(typeof module==='object'&&module.exports){module.exports=factory(require('./vocab-production-v32.js'));}else{factory(root.Day3VocabularyProductionV32);}})(typeof globalThis!=='undefined'?globalThis:this,function(api){'use strict';
function part(termId,partId,useParts){
  if(!api||!Array.isArray(api.TERMS))return null;
  var term=api.TERMS.find(function(t){return t.id===termId;});
  var list=term&&Array.isArray(useParts?term.useParts:term.parts)?(useParts?term.useParts:term.parts):[];
  return list.find(function(p){return p.id===partId;})||null;
}
function addPattern(termId,partId,pattern,useParts){
  var p=part(termId,partId,useParts);
  if(p&&Array.isArray(p.patterns)&&p.patterns.indexOf(pattern)<0)p.patterns.unshift(pattern);
}
['contributor','hybrid','delocalized'].forEach(function(id){addPattern(id,'no','^no\\b',true);});
addPattern('delocalized','multiple','(multiple|several|more than one) (atom|atoms|bond|bonds|position|positions)',false);
return api;
});
