var fs=require('fs');var html=fs.readFileSync('day1/index.html','utf8');var js=fs.readFileSync('day1/day1-app.js','utf8');var p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}
ok('loads orchestrator',html.includes('../day1-orchestrator.js'));
ok('loads Math Gym engine',html.includes('../math-gym-engine.js'));
ok('loads Molecule Stage logic',html.includes('../molecule-stage.js'));
ok('learner can choose math or chemistry',html.includes('data-view="math"')&&html.includes('data-view="chemistry"')&&js.includes('Start or resume math')&&js.includes('Start or resume chemistry'));
ok('subject switching preserves independent state',js.includes("O.setSubject(state,'math')")&&js.includes("O.setSubject(state,'chemistry')"));
ok('all six frozen math areas are present',js.includes("logs:{")&&js.includes("algebra:{")&&js.includes("exponents:{")&&js.includes("scientific_notation:{")&&js.includes("fractions_percent:{")&&js.includes("unit_conversions:{"));
ok('adaptive math probe routes 3 2 and 0-1 branches',js.includes('score===3')&&js.includes('score===2')&&js.includes('makePractice(4)'));
ok('50 minute checkpoint exists',js.includes('mathMinutes()>=50'));
ok('60 minute hard cap exists',js.includes('mathMinutes()>=60')&&js.includes('enforceMathCap'));
ok('math has Back Replay and IDK teaching controls',js.includes('mathBack')&&js.includes('mathReplay')&&js.includes('I don’t understand this'));
ok('IDK changes explanation instead of repeating question',js.includes('idkTeach')&&js.includes('Let me teach this another way'));
ok('chemistry teach animation is embedded before builds',js.includes('chemistry-teacher-preview'));
ok('chemistry independent path uses frozen molecules',js.includes("chem.target='H2O'")&&js.includes("chem.target='CH3OH'")&&js.includes("chem.target='CH3NH2'"));
ok('chemistry uses real molecule verifier',js.includes('MS.verifyStructure')&&js.includes('MS.detectMisconception'));
ok('support blocks cold chemistry mastery',js.includes('attemptSupported')&&js.includes('if(!chem.attemptSupported)'));
ok('notebook and review queue are visible learner destinations',html.includes('data-view="notebook"')&&html.includes('data-view="review"'));
ok('session summary exists',html.includes('data-view="summary"')&&js.includes('Chemistry mastery'));
console.log('\nDay 1 classroom UI: '+p+' passed, '+f+' failed');if(f)process.exit(1);