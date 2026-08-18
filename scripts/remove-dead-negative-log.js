'use strict';

var fs=require('fs');
var cp=require('child_process');
var path='day1-adaptive-math-model-core.js';
var src=fs.readFileSync(path,'utf8');
var start="\n  }else if(p.family==='estimate_negative_log'){";
var end="\n  }else throw new Error('unsupported logs family '+p.family);";
var a=src.indexOf(start);
var b=a<0?-1:src.indexOf(end,a+start.length);

if(a<0){
  if(src.indexOf("p.family==='estimate_negative_log'")<0 && src.indexOf('Math.log10(front)')<0){
    console.log('Dead negative-log fallback already absent.');
    process.exit(0);
  }
  throw new Error('expected estimate_negative_log block start not found');
}
if(b<0)throw new Error('expected logPlan terminal else not found');

var out=src.slice(0,a)+src.slice(b);
if(out.indexOf("p.family==='estimate_negative_log'")>=0)throw new Error('estimate_negative_log branch survived cleanup');
if(out.indexOf('Math.log10(front)')>=0)throw new Error('Math.log10(front) survived cleanup');
fs.writeFileSync(path,out,'utf8');
cp.execFileSync(process.execPath,['--check',path],{stdio:'inherit'});
console.log('Removed dead calculator-based estimate_negative_log branch and syntax-check passed.');
