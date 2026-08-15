const fs=require('fs');const html=fs.readFileSync('chemistry-teacher-preview/index.html','utf8');const js=fs.readFileSync('chemistry-teacher-preview/chemistry-preview.js','utf8');let p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}
ok('chemistry preview has explicit audio start',html.includes('Start Chemistry')&&js.includes('SpeechSynthesisUtterance'));
ok('watch animates atoms bonds and lone pair',js.includes("show:'arrange-h'")&&js.includes("show:'bonds'")&&js.includes("show:'lone'"));
ok('electron counter is instructional',js.includes('8 available → 6 in bonds → 2 remaining'));
ok('build with me begins from reset stage',js.includes("show:'reset-build'")&&js.includes('resetStage()'));
ok('learner performs central atom action',js.includes("manip:'center'")&&html.includes('data-action="center"'));
ok('learner performs hydrogens bonds and lone pair',js.includes("manip:'hydrogens'")&&js.includes("manip:'bonds'")&&js.includes("manip:'lone'"));
ok('wrong action is diagnosed instead of auto advancing',js.includes('That action does not match this step'));
ok('one correct click explicitly does not finish skill',html.includes('One correct click does not finish the skill')&&js.includes('One molecule will not count as mastery'));
ok('phases include learning practicing together and your turn',js.includes("phase:'Learning'")&&js.includes("phase:'Practicing Together'")&&js.includes("phase:'Your Turn'"));
console.log('\nChemistry teacher preview: '+p+' passed, '+f+' failed');if(f)process.exit(1);