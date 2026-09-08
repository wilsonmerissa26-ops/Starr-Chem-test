(function(root,factory){var core=typeof module==='object'&&module.exports?require('./chapter3-data.js'):root.Chapter3AdaptiveData;var api=factory(core);if(typeof module==='object'&&module.exports)module.exports=api;else{root.Chapter3CoreData=core;root.Chapter3AdaptiveData=api;}})(typeof globalThis!=='undefined'?globalThis:this,function(Core){'use strict';if(!Core)throw new Error('Chapter 3 core data missing');
var TAGS=Object.freeze({
 'PT-I1':['conjugates'],'PT-I2':['mechanism'],'PT-I3':['conjugates'],'PT-I4':['conjugates'],
 'PA-I1':['pka','acid-strength'],'PA-I2':['acid-strength'],'PA-I3':['pka'],'PA-I4':['pka'],
 'PB-I1':['base-strength','conjugate-acid'],'PB-I2':['base-strength'],'PB-I3':['conjugate-acid'],'PB-I4':['base-strength'],
 'EQ-I1':['equilibrium','pka'],'EQ-I2':['equilibrium','pka'],'EQ-I3':['equilibrium'],'EQ-I4':['pka'],
 'AT-I1':['atom','periodic-trend'],'AT-I2':['atom','periodic-trend'],'AT-I3':['periodic-trend'],'AT-I4':['atom'],
 'SR-I1':['resonance'],'SR-I2':['acidity'],'SR-I3':['resonance','acidity'],'SR-I4':['resonance'],
 'SI-I1':['induction'],'SI-I2':['distance'],'SI-I3':['induction'],'SI-I4':['induction'],
 'SO-I1':['hybridization','s-character'],'SO-I2':['hybridization','s-character'],'SO-I3':['s-character'],'SO-I4':['hybridization'],
 'CS-I1':['multi-factor'],'CS-I2':['multi-factor'],'CS-I3':['ranking'],'CS-I4':['ranking'],
 'NT-I1':['no-table'],'NT-I2':['no-table'],'NT-I3':['cationic-acid'],'NT-I4':['no-table'],
 'RC-I1':['reagent'],'RC-I2':['equilibrium'],'RC-I3':['reagent','equilibrium'],'RC-I4':['reagent'],
 'LA-I1':['lewis','electron-pair'],'LA-I2':['lewis','electron-pair'],'LA-I3':['lewis'],'LA-I4':['lewis']
});
function itemWithTags(item){var tags=TAGS[item.id];if(!tags)return item;return Object.freeze(Object.assign({},item,{tags:Object.freeze(tags)}));}
function lessonCopy(l){return Object.freeze(Object.assign({},l,{independent:Object.freeze(l.independent.map(itemWithTags))}));}
var lessons={};Core.ORDER.forEach(function(id){lessons[id]=lessonCopy(Core.lesson(id));});lessons=Object.freeze(lessons);var order=Core.ORDER.slice();
function lesson(id){return lessons[id]||null;}function all(){return order.map(function(id){return lessons[id];});}function ids(){return order.slice();}
var meta=Object.freeze(Object.assign({},Core.META,{evidenceCoverage:'required cold tags explicitly mapped'}));
return Object.freeze({META:meta,LESSONS:lessons,ORDER:Object.freeze(order),PRODUCTION_CHECKPOINTS:Core.PRODUCTION_CHECKPOINTS,lesson:lesson,lessons:all,lessonIds:ids});
});