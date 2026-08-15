const fs=require('fs');
const html=fs.readFileSync('teacher-preview/index.html','utf8');
const js=fs.readFileSync('teacher-preview/teacher-preview.js','utf8');
let p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}
ok('preview has explicit start gesture for mobile audio',html.includes('Start Lesson')&&html.includes('Sound starts only after you tap Start'));
ok('browser narration is used',js.includes('SpeechSynthesisUtterance')&&js.includes('speechSynthesis.speak'));
ok('voice controls include pause replay and slow',html.includes('Replay')&&html.includes('Pause voice')&&html.includes('Slow down'));
ok('lesson begins with powers before log terminology',js.indexOf("eq:'10¹ = 10'")<js.indexOf("eq:'log₁₀(1000) = 3'"));
ok('product rule is demonstrated before named',js.indexOf('log(10 × 100) → log(10) + log(100)')<js.indexOf('called the product rule'));
ok('product rule is taught before log6 uses it',js.indexOf('called the product rule')<js.indexOf("eq:'log(6) = log(2) + log(3)'"));
ok('log6 is decomposed visually',js.includes("eq:'6 = 2 × 3'")&&js.includes("eq:'0.30 + 0.48'")&&js.includes("eq:'log(6) ≈ 0.78'"));
ok('tiny landmark toolbox is visible',html.includes('log(2)≈0.30')&&html.includes('log(3)≈0.48')&&html.includes('log(5)≈0.70'));
ok('meaningful animation classes exist',html.includes('@keyframes pulse')&&html.includes('@keyframes slideIn')&&js.includes("anim:'split'"));
ok('questions block Next until answered',js.includes("$('next').disabled=!!s.ask")&&js.includes("$('next').disabled=false"));
ok('transfer problem is different',js.includes('estimate log(15)'));
ok('wrong answer stays on same idea',js.includes('We are staying on this idea'));
console.log('\nTeacher preview: '+p+' passed, '+f+' failed');if(f)process.exit(1);