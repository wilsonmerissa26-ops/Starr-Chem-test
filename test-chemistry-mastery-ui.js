var fs=require('fs');var html=fs.readFileSync('chemistry-teacher-preview/index.html','utf8');var js=fs.readFileSync('chemistry-teacher-preview/chemistry-mastery-ui.js','utf8');var p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}
ok('preview loads adaptive mastery engine',html.includes('../adaptive-mastery-engine.js'));
ok('preview loads chemistry progression controller',html.includes('../chemistry-mastery-progression.js'));
ok('preview loads visible mastery UI',html.includes('chemistry-mastery-ui.js')&&html.includes('practiceArea'));
ok('NH3 ending exposes continuation rather than completion',html.includes('continuePractice'));
ok('guided practice uses H2O',js.includes("'H2O'")&&js.includes('Practicing Together'));
ok('independent build uses CH4',js.includes("'CH4'")&&js.includes('independent'));
ok('error analysis uses H2S',js.includes("'H2S'")&&js.includes('error_analysis'));
ok('fresh transfer uses PH3',js.includes("'PH3'")&&js.includes('Fresh check'));
ok('IDK routes to teaching help',js.includes('practiceIdk')&&js.includes('showHelp'));
ok('completion requires mastery controller result',js.includes('r.mastery&&r.mastery.mastered'));
ok('retrieval evidence is persisted',js.includes('retrieval')&&js.includes('astarryia-chemistry-mastery-v1'));
console.log('\nChemistry mastery UI: '+p+' passed, '+f+' failed');if(f)process.exit(1);