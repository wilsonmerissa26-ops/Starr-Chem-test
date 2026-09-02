(function(root,factory){
 var base=typeof module==='object'&&module.exports?require('./chapter5-visual-data.js'):root.Chapter5VisualData;
 var api=factory(base);
 if(typeof module==='object'&&module.exports)module.exports=api;
 else{root.Chapter5CoreVisualData=base;root.Chapter5VisualData=api;root.Chapter5ScopeVisualData=api;}
})(typeof globalThis!=='undefined'?globalThis:this,function(Base){
'use strict';if(!Base)throw new Error('Chapter 5 core visual data missing');
function v(id,kind,title,data){return Object.freeze(Object.assign({id:id,kind:kind,title:title,skill:data.skill,labels:Object.freeze(data.labels||[]),groups:Object.freeze(data.groups||[])},data));}
var X={};
function add(x){X[x.id]=x;}
['a','b','independent-a','independent-b','retrieval-a'].forEach(function(s,i){add(v('polarimetry-'+(s.indexOf('independent')===0||s.indexOf('retrieval')===0?s:'equation-'+s),'polarimetry-equation','Specific rotation setup',{skill:'enantiomer-mixtures-quantitative',formula:'[α] = αobs / (l × c)',example:i===0?{observed:'+4.0°',length:'1.0 dm',concentration:'0.20 g/mL'}:null,labels:['αobs','l','c','[α]']}));});
// Explicit tokens used by the curriculum.
['polarimetry-equation-a','polarimetry-equation-b','polarimetry-independent-a','polarimetry-independent-b','polarimetry-retrieval-a'].forEach(function(id){if(!X[id])add(v(id,'polarimetry-equation','Specific rotation setup',{skill:'enantiomer-mixtures-quantitative',formula:'[α] = αobs / (l × c)',labels:['αobs','l','c','[α]']}));});
['ee-balance-a','ee-balance-b','ee-balance-c','ee-balance-independent-a','ee-transfer-a','ee-retrieval-a'].forEach(function(id){add(v(id,'ee-balance','Enantiomeric excess as an imbalance',{skill:'enantiomer-mixtures-quantitative',major:'major enantiomer',minor:'minor enantiomer',rule:'ee = |% major − % minor|',labels:['major','minor','ee']}));});
['ee-composition-a','ee-composition-independent-a'].forEach(function(id){add(v(id,'ee-composition','Recover composition from ee',{skill:'enantiomer-mixtures-quantitative',rules:['% major = (100 + ee) / 2','% minor = (100 − ee) / 2'],labels:['100%','ee','major','minor']}));});
['allene-axis-a','allene-axis-b','allene-guided-a','allene-independent-a','allene-independent-b','allene-transfer-a'].forEach(function(id){add(v(id,'allene-axis','Axial chirality in an allene',{skill:'other-chirality',axis:'C=C=C',front:['group A','group B'],back:['group C','group D'],rule:'Each terminal carbon needs two different substituents for this axis to support chirality.',labels:['front end','axis','back end']}));});
add(v('chirality-whole-object-a','whole-mirror-test','Chirality is a whole-molecule mirror test',{skill:'other-chirality',rule:'No tetrahedral stereocenter is required by the definition. The mirror image must be non-superimposable.',labels:['molecule','mirror image']}));
['dynamic-mirror-a','dynamic-guided-a','dynamic-independent-a','dynamic-retrieval-a'].forEach(function(id){add(v(id,'dynamic-conformer','Configuration or interconverting conformation?',{skill:'other-chirality',left:'mirror-image snapshot A',right:'mirror-image snapshot B',connector:'ordinary low-barrier rotation',rule:'Easy interconversion means the snapshots are conformations, not automatically stable isolable enantiomers.',labels:['snapshot A','rotation','snapshot B']}));});
var all={};Base.ids().forEach(function(id){all[id]=Base.get(id);});Object.keys(X).forEach(function(id){all[id]=X[id];});all=Object.freeze(all);
function get(id){return all[id]||null;}function ids(){return Object.keys(all);}
return Object.freeze({VISUALS:all,get:get,ids:ids});
});
