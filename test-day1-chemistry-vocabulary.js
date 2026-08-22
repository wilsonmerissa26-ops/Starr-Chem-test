'use strict';
var fs=require('fs');
var V=require('./day1/chemistry-vocabulary-production-v33.js');
var p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}
function term(id){return V.TERMS.find(function(t){return t.id===id;});}
function pass(id,d,u){return V.gradeTerm(term(id),d,u).pass;}

ok('vocabulary contract contains six Day 1 terms',V.TERMS.length===6);
ok('term ids are unique',new Set(V.TERMS.map(function(t){return t.id;})).size===6);
var names=V.TERMS.map(function(t){return t.term.toLowerCase();}).join(' ');
ok('all six foundation words remain',names.indexOf('valence electron')>=0&&names.indexOf('bond')>=0&&names.indexOf('lone pair')>=0&&names.indexOf('lewis structure')>=0&&names.indexOf('octet')>=0&&names.indexOf('central atom')>=0);
ok('formal charge stays out of Day 1 vocabulary',names.indexOf('formal charge')<0);
ok('live data has no multiple-choice answer key',V.TERMS.every(function(t){return !t.choices&&!Object.prototype.hasOwnProperty.call(t,'answer');}));

ok('valence electron natural explanation passes',pass('valence_electron','A valence electron is found in the outer shell and can participate in bonding.','Valence electrons are involved because the outer electrons are the ones used in bonding.'));
ok('bond natural explanation passes',pass('bond','A bond is a shared pair of electrons that connects two atoms.','The line represents a shared pair of electrons between the two atoms.'));
ok('lone pair natural explanation passes',pass('lone_pair','A lone pair is two electrons that stay on one atom and are not shared in a bond.','They are a lone pair because the two dots stay on oxygen and are not shared between atoms.'));
ok('Lewis structure natural explanation passes',pass('lewis_structure','A Lewis structure is a diagram that shows which atoms are connected and where lone pairs or valence electrons are placed.','I would draw a Lewis structure because it shows the atom connections and the lone pairs.'));
ok('octet natural explanation passes',pass('octet','An octet means eight electrons are counted around an atom in its valence shell.','There are 8 electrons around carbon, so yes it satisfies the octet.'));
ok('central atom natural explanation passes',pass('central_atom','The central atom is in the middle and the surrounding atoms connect to it.','Carbon is central because the four hydrogens bond to carbon.'));

ok('valence clue pile does not pass',!pass('valence_electron','outer shell electron bonding','Valence electrons are involved because they bond.'));
ok('bond clue pile does not pass',!pass('bond','shared pair electrons two atoms','A shared pair of electrons between atoms.'));
ok('Lewis clue pile does not pass',!pass('lewis_structure','diagram atoms connected lone pairs electrons','A Lewis structure shows bonds and lone pairs.'));
ok('wrong nucleus definition is rejected even with keywords',!pass('valence_electron','A valence electron is in the nucleus but outer shell electrons bond.','Valence electrons are involved because they bond.'));
ok('wrong lone-pair sharing statement is rejected',!pass('lone_pair','A lone pair is two electrons on one atom but the lone pair is shared between two atoms.','It is a lone pair because it is not between atoms.'));
ok('eight bonds is not an octet',!pass('octet','An octet means eight bonds and eight electrons around an atom.','There are 8 electrons, yes it satisfies the octet.'));
ok('hydrogen is not accepted as CH4 central atom',!pass('central_atom','The central atom is in the middle and other atoms connect to it.','Hydrogen is central in CH4 because carbon connects to it.'));

var weak=V.gradeTerm(term('valence_electron'),'outer shell electron bonding','Valence electrons bond.');
var fb=V.feedbackFor(term('valence_electron'),weak);
ok('feedback distinguishes idea markers from incomplete explanation',fb.missing.some(function(x){return /connects the ideas|complete reason/.test(x);}));

var s=V.fresh(),t=term('valence_electron'),good=V.gradeTerm(t,'A valence electron is found in the outer shell and can participate in bonding.','Valence electrons are involved because outer electrons are used in bonding.');
V.applyAttempt(s,t,good,'support');
ok('supported success does not become independent',s.records.valence_electron.status==='supported');
V.addQueue(s,'valence_electron');
ok('supported term is queued for later no-clue retrieval',s.queue[0]==='valence_electron');
V.applyAttempt(s,t,good,'review');
ok('later no-clue review can become independent',s.records.valence_electron.status==='independent');

ok('three failed explanations is the teaching ceiling',V.MAX_FAILED_EXPLANATIONS===3);
var bad=V.gradeTerm(t,'It is an electron.','Electrons do things.');
var e=V.fresh();
V.applyAttempt(e,t,bad,'cold');
ok('one failed written attempt does not auto-teach',V.failedExplanationStreak(e,t)===1&&!V.shouldAutoTeach(e,t));
V.applyAttempt(e,t,bad,'support');
ok('two failed written attempts do not auto-teach',V.failedExplanationStreak(e,t)===2&&!V.shouldAutoTeach(e,t));
V.applyAttempt(e,t,bad,'support');
ok('third failed written attempt triggers direct teaching',V.failedExplanationStreak(e,t)===3&&V.shouldAutoTeach(e,t));
V.beginTeach(e,t,false);
ok('direct teaching is marked as support state rather than mastery',e.phase==='teach'&&e.teachingShown===true&&!V.shouldAutoTeach(e,t));
ok('every Day 1 word has a complete application answer for teaching',V.TERMS.every(function(x){return typeof V.TEACH_USE[x.id]==='string'&&V.TEACH_USE[x.id].length>30;}));
var bounded=V.fresh();bounded.records.valence_electron={status:'supported',attempts:[]};bounded.termId='valence_electron';bounded.teachingShown=true;bounded.returnReview=false;V.stopAfterTeaching(bounded,t);
ok('failed post-teaching encounter becomes Needs review and moves on',bounded.records.valence_electron.status==='needs_review'&&bounded.queue.indexOf('valence_electron')>=0&&bounded.index===1);
var reviewBounded=V.fresh();reviewBounded.records.valence_electron={status:'supported',attempts:[]};reviewBounded.queue=['valence_electron'];reviewBounded.phase='review';reviewBounded.termId='valence_electron';reviewBounded.teachingShown=true;reviewBounded.returnReview=true;V.stopAfterTeaching(reviewBounded,t);
ok('review failure after teaching does not loop forever',reviewBounded.records.valence_electron.status==='needs_review'&&reviewBounded.queue.length===0&&reviewBounded.phase==='needs');

var r=V.fresh();r.index=6;r.phase='review';r.queue=['valence_electron'];V.normalizePhase(r);
ok('review state is not overwritten when initial round is over',r.phase==='review');
var c=V.fresh();c.index=6;c.phase='cold';V.normalizePhase(c);
ok('only completed initial cold round advances to game',c.phase==='game');
var g=V.fresh();V.TERMS.forEach(function(x){g.records[x.id]={status:'independent',attempts:[]};});
ok('allIndependent requires all six no-clue statuses',V.allIndependent(g.records));g.records.bond.status='supported';ok('one supported word prevents vocabulary completion',!V.allIndependent(g.records));

var source=fs.readFileSync('day1/chemistry-vocabulary-production-v33.js','utf8');
ok('production UI contains written definition and application textareas',source.indexOf('chemProdDef')>=0&&source.indexOf('chemProdUse')>=0&&source.indexOf('<textarea')>=0);
ok('word bank appears only in repair renderer',source.indexOf('The word bank is support, not mastery evidence')>=0);
ok('immediate post-teach recall is labeled supported',source.indexOf("kind=review?'review':post?'support_recall':'cold'")>=0);
ok('direct teaching shows both meaning and application answer',source.indexOf('What it means')>=0&&source.indexOf('How to use it here')>=0&&source.indexOf('TEACH_USE')>=0);
ok('I do not know routes to teaching instead of repeated empty guesses',/chemProdIdk[\s\S]*beginTeach\(s,t/.test(source));
ok('post-teaching failure has bounded Needs-review route',source.indexOf('stopAfterTeaching')>=0&&source.indexOf("status='needs_review'")>=0);
ok('legacy multiple-choice state is named but never read as proof',source.indexOf("getItem(LEGACY_KEY)")<0);
ok('vocabulary layer never calls Day1Orchestrator',source.indexOf('Day1Orchestrator')<0);
ok('vocabulary layer never writes mastery evidence',source.indexOf('addEvidence')<0&&source.indexOf('recordEvidence')<0);

var html=fs.readFileSync('day1/index.html','utf8');
ok('Day 1 page loads vocabulary data after classroom core',html.indexOf('chemistry-vocabulary-data-v33.js')>html.indexOf('classroom-v5.js'));
ok('Day 1 page loads production engine after vocabulary data',html.indexOf('chemistry-vocabulary-production-v33.js')>html.indexOf('chemistry-vocabulary-data-v33.js'));
ok('retired multiple-choice v24 is no longer loaded live',html.indexOf('chemistry-vocabulary-v24.js')<0);

console.log('\nDay 1 chemistry vocabulary production: '+p+' passed, '+f+' failed');if(f)process.exit(1);
