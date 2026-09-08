(function(root,factory){var core=typeof module==='object'&&module.exports?require('./chapter2-data.js'):root.Chapter2AdaptiveData;var api=factory(core);if(typeof module==='object'&&module.exports)module.exports=api;else{root.Chapter2CoreData=core;root.Chapter2AdaptiveData=api;}})(typeof globalThis!=='undefined'?globalThis:this,function(Core){'use strict';if(!Core)throw new Error('Chapter 2 core data missing');
var TAGS=Object.freeze({'RR-I1':['ranking','octet'],'RR-I2':['ranking'],'RR-I3':['charge-placement'],'RR-I4':['ranking'],'RH-I1':['partial-bond'],'RH-I2':['partial-bond','partial-charge'],'RH-I3':['hybrid'],'RH-I4':['hybrid']});
function itemWithTags(item){var tags=TAGS[item.id];if(!tags)return item;return Object.freeze(Object.assign({},item,{tags:Object.freeze(tags)}));}
function lessonCopy(l){var x=Object.assign({},l,{independent:Object.freeze(l.independent.map(itemWithTags))});return Object.freeze(x);}
var lessons={};Core.ORDER.forEach(function(id){lessons[id]=lessonCopy(Core.lesson(id));});lessons=Object.freeze(lessons);var order=Core.ORDER.slice();
function lesson(id){return lessons[id]||null;}function all(){return order.map(function(id){return lessons[id];});}function ids(){return order.slice();}
var meta=Object.freeze(Object.assign({},Core.META,{evidenceCoverage:'required cold tags explicitly mapped'}));
return Object.freeze({META:meta,LESSONS:lessons,ORDER:Object.freeze(order),PRODUCTION_CHECKPOINTS:Core.PRODUCTION_CHECKPOINTS,lesson:lesson,lessons:all,lessonIds:ids});
});