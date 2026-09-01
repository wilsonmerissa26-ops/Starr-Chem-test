(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.Chapter1TeachingPolicy=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';
function f(id,label,accepted,errorCode){return Object.freeze({id:id,label:label,accepted:Object.freeze(accepted),errorCode:errorCode});}
function item(id,prompt,fields,tags){return Object.freeze({id:id,prompt:prompt,fields:Object.freeze(fields),tags:Object.freeze(tags||[])});}
var EXTRA=Object.freeze({
  'formal-charge':Object.freeze([
    item('F-I5','Oxygen has one double bond, one single bond, and one lone pair. Enter V, N, B, and FC.',[f('v','V',['6'],'VALENCE_COUNT'),f('n','N',['2'],'NONBONDING_ELECTRONS'),f('b','B',['3'],'BOND_ORDER'),f('fc','FC',['+1','1+','1','positive 1','positive one'],'FORMAL_CHARGE')],['charged','multiple']),
    item('F-I6','Carbon has one triple bond and one single bond, with no lone pairs. Enter V, N, B, and FC.',[f('v','V',['4'],'VALENCE_COUNT'),f('n','N',['0'],'NONBONDING_ELECTRONS'),f('b','B',['4'],'BOND_ORDER'),f('fc','FC',['0'],'FORMAL_CHARGE')],['multiple'])
  ])
});
var TAGS=Object.freeze({
  'F-I1':Object.freeze(['charged']),
  'F-I2':Object.freeze(['multiple']),
  'F-I3':Object.freeze(['charged']),
  'F-I4':Object.freeze([]),
  'F-I5':Object.freeze(['charged','multiple']),
  'F-I6':Object.freeze(['multiple'])
});
function bank(lesson){return (lesson.independent||[]).concat(EXTRA[lesson.id]||[]);}
function tags(id){return TAGS[id]||[];}
function status(lesson,cleanIds){cleanIds=Array.from(new Set(cleanIds||[]));if(lesson.id==='formal-charge'){var charged=cleanIds.some(function(id){return tags(id).indexOf('charged')!==-1;});var multiple=cleanIds.some(function(id){return tags(id).indexOf('multiple')!==-1;});return{ready:cleanIds.length>=3&&charged&&multiple,minClean:3,charged:charged,multiple:multiple,cleanCount:cleanIds.length};}return{ready:cleanIds.length>=2,minClean:2,charged:true,multiple:true,cleanCount:cleanIds.length};}
return Object.freeze({bank:bank,status:status,tags:tags});
});