'use strict';
var fs=require('fs');
function replaceOnce(src,from,to,label){var i=src.indexOf(from);if(i<0)throw new Error('missing patch target: '+label);if(src.indexOf(from,i+from.length)>=0)throw new Error('patch target not unique: '+label);return src.slice(0,i)+to+src.slice(i+from.length);}
var p='day1/math-problem-coach-v8.js';var s=fs.readFileSync(p,'utf8');
s=replaceOnce(s,"function install(){var box=",`function accepted(v,want){
 v=String(v||'').trim().toLowerCase();want=String(want||'').trim().toLowerCase();
 if(want==='divide'){
  if(/\\bmultiply|multiplication|times\\b|×/.test(v))return false;
  if(/\\bsubtract|subtraction|minus\\b/.test(v))return false;
  if(/\\badd|addition|plus\\b/.test(v))return false;
  return /\\bdivide\\b|\\bdivision\\b|÷|\\//.test(v);
 }
 return v===want||v.indexOf(want)>=0;
}
function install(){var box=`, 'semantic answer matcher');
s=replaceOnce(s,'var ok=v===want||v.indexOf(want)>=0;','var ok=accepted(v,want);','coach grader uses semantic matcher');
fs.writeFileSync(p,s,'utf8');

var tp='test-math-problem-coach-v8.js';var t=fs.readFileSync(tp,'utf8');var marker="ok('algebra coach requires same move on both sides',s.indexOf('BOTH sides')>=0);\n";
var extra=marker+`var aStart=s.indexOf('function accepted('),aEnd=s.indexOf('function install()',aStart);\nok('semantic answer matcher is present',aStart>=0&&aEnd>aStart);\nvar accepted=new Function(s.slice(aStart,aEnd)+';return accepted;')();\nok('algebra tiny check accepts equivalent divide language',['divide','Division','÷4','/4','divide by 4','divide both sides by 4'].every(function(v){return accepted(v,'divide')}));\nok('algebra tiny check rejects wrong inverse operations',['multiply','multiplication','subtract','add'].every(function(v){return !accepted(v,'divide')}));\n`;
t=replaceOnce(t,marker,extra,'coach semantic regression tests');fs.writeFileSync(tp,t,'utf8');
console.log('Applied live coach semantic answer matcher and regressions.');
