(function(root,factory){'use strict';if(typeof module==='object'&&module.exports){module.exports=factory(require('./vocab-production-v34.js'));}else{root.Day3VocabularyProductionV34=factory(root.Day3VocabularyProductionV34);}})(typeof globalThis!=='undefined'?globalThis:this,function(api){'use strict';
if(!api||!Array.isArray(api.TERMS))return api;
function term(id){return api.TERMS.find(function(t){return t.id===id;});}
function part(t,id,use){var a=t&&Array.isArray(use?t.useParts:t.parts)?(use?t.useParts:t.parts):[];return a.find(function(p){return p.id===id;});}
function add(p,re){if(p&&Array.isArray(p.patterns)&&!p.patterns.some(function(x){return String(x)===String(re);}))p.patterns.unshift(re);}
function replaceWrong(t,label,re,use){var a=t&&Array.isArray(use?t.wrongUse:t.wrongDef)?(use?t.wrongUse:t.wrongDef):[];var x=a.find(function(w){return w[0]===label;});if(x)x[1]=re;}

var contributor=term('contributor');
replaceWrong(contributor,'electrons do not move',/\b(?:electrons?|electron pair)\s+(?:do|does)\s+not\s+(?:move|shift|change|rearrange)\b/i,false);

var arrow=term('arrow');
add(part(arrow,'electrons',false),/\b(?:curved\s+arrow|arrow)\b.{0,25}\b(?:follows?|represents?|describes?)\b.{0,25}\b(?:electron pair|electrons?)\b/i);
add(part(arrow,'source',false),/\b(?:tail|source)\b\s+(?:is|marks?|shows?)\s+(?:the\s+)?(?:electron\s+)?source\b/i);
add(part(arrow,'dest',false),/\b(?:head|arrowhead)\b.{0,25}\b(?:shows?|marks?|points?\s+to)\b.{0,30}\b(?:atom|bond|destination|where)\b/i);
add(part(arrow,'dest',false),/\b(?:electron pair|electrons?)\b.{0,35}\b(?:moving|moves?|goes?|shifting)\b.{0,50}\bto\b.{0,20}\b(?:atom|bond|head|arrowhead|destination)\b/i);

return api;
});
