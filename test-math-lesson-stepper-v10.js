var fs=require('fs');var s=fs.readFileSync('day1/math-lesson-stepper-v10.js','utf8');var h=fs.readFileSync('day1/index.html','utf8');var p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}
ok('stepper loaded by live Day 1 page',h.indexOf('math-lesson-stepper-v10.js')>=0);
ok('worked example is revealed progressively',s.indexOf("lines.slice(0,idx+1).join('\\n')")>=0);
ok('teaching step count is visible',s.indexOf('Teaching step ')>=0);
ok('previous teaching step control exists',s.indexOf('Previous teaching step')>=0);
ok('next teaching step control exists',s.indexOf('Next teaching step')>=0);
ok('current step can be read aloud',s.indexOf('Read this step')>=0);
ok('conversion explanation follows units',s.indexOf('Follow the units before the numbers')>=0);
ok('algebra explanation protects equation balance',s.indexOf('keeps the equation balanced')>=0);
ok('scientific notation separates coefficient and power',s.indexOf('coefficient and the power of ten as two separate jobs')>=0);
ok('logs translate into powers of ten',s.indexOf('power-of-ten question')>=0);
ok('speech normalizes pharmacy units',s.indexOf("replace(/mL/g,' milliliters '")>=0&&s.indexOf("replace(/mcg/g,' micrograms '")>=0);
console.log('\nMath lesson stepper v10: '+p+' passed, '+f+' failed');if(f)process.exit(1);