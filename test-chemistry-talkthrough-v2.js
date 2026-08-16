var fs=require('fs');var s=fs.readFileSync('chemistry-teacher-preview/chemistry-talkthrough.js','utf8');var p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}
ok('talk-through includes typed understanding path',s.indexOf('Explain what I wrote')>=0);
ok('talk-through includes unsure path',s.indexOf('I don’t know what I don’t understand')>=0);
ok('lone-pair tiny check has answer',s.indexOf('If 6 electrons are left, how many lone pairs is that?')>=0&&s.indexOf("a:['3']")>=0);
ok('bond tiny check is interactive',s.indexOf('How many electrons are represented by 3 single bonds?')>=0&&s.indexOf("a:['6']")>=0);
ok('center tiny check is interactive',s.indexOf('which atom must connect to both of the other atoms?')>=0&&s.indexOf("['oxygen','o']")>=0);
ok('valence-count tiny check is interactive',s.indexOf('How many total valence electrons does H₂O start with?')>=0);
ok('tiny check has real answer input',s.indexOf('talkMicroInput')>=0&&s.indexOf('talkMicroCheck')>=0);
ok('wrong tiny answer stays on tiny step',s.indexOf('Stay on this tiny step')>=0&&s.indexOf('Try this tiny check again')>=0);
ok('correct tiny answer returns learner to original chemistry question',s.indexOf('Now retry the original chemistry question')>=0);
ok('voice normalization covers chemistry symbols',s.indexOf("replace(/H₂O/g,'H two O')")>=0&&s.indexOf("replace(/e⁻/g,'electrons')")>=0);
console.log('\nChemistry talk-through v2: '+p+' passed, '+f+' failed');if(f)process.exit(1);