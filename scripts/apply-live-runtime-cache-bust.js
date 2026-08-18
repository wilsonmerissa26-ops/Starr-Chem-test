'use strict';
var fs=require('fs'),crypto=require('crypto');
function replaceOnce(src,from,to,label){var i=src.indexOf(from);if(i<0)throw new Error('missing patch target: '+label);if(src.indexOf(from,i+from.length)>=0)throw new Error('patch target not unique: '+label);return src.slice(0,i)+to+src.slice(i+from.length);}
var runtimePath='day1/classroom-v5.js';
var htmlPath='day1/index.html';
var testPath='test-day1-classroom-v5.js';
var runtime=fs.readFileSync(runtimePath,'utf8');
var token=crypto.createHash('sha256').update(runtime).digest('hex').slice(0,12);
var html=fs.readFileSync(htmlPath,'utf8');
html=html.replace(/classroom-v5\.js(?:\?v=[A-Za-z0-9._-]+)?/g,'classroom-v5.js?v='+token);
fs.writeFileSync(htmlPath,html,'utf8');
var t=fs.readFileSync(testPath,'utf8');
if(t.indexOf("var crypto=require('crypto');")<0){
 t=replaceOnce(t,"var fs=require('fs');","var fs=require('fs');var crypto=require('crypto');",'crypto require');
}
var marker="ok('v5 is live runtime',html.indexOf('classroom-v5.js')>=0);\n";
var assertion="var runtimeCacheToken=crypto.createHash('sha256').update(js).digest('hex').slice(0,12);\nok('live classroom runtime cache token matches current JS',html.indexOf('classroom-v5.js?v='+runtimeCacheToken)>=0);\n";
if(t.indexOf("live classroom runtime cache token matches current JS")<0)t=replaceOnce(t,marker,marker+assertion,'cache token assertion');
fs.writeFileSync(testPath,t,'utf8');
console.log('CACHE_TOKEN',token);
console.log('Applied content-addressed classroom runtime cache token.');
