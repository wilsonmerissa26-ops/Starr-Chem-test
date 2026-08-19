'use strict';
var fs=require('fs');
var R=require('./day1/math-gym-ui.js');
var p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}

ok('practice exposes help',R.helpPolicy('practice').available===true&&!R.helpPolicy('practice').masteryEnds);
ok('challenge exposes help',R.helpPolicy('challenge').available===true&&!R.helpPolicy('challenge').masteryEnds);
ok('speed hides help',R.helpPolicy('speed').available===false);
ok('mastery help converts item to practice',R.helpPolicy('mastery').available===true&&R.helpPolicy('mastery').masteryEnds===true);
ok('clean mastery can count',R.masteryCreditAllowed('mastery',0,false)===true);
ok('helped mastery cannot count',R.masteryCreditAllowed('mastery',1,false)===false);
ok('wrong-then-correct mastery cannot count as cold mastery',R.masteryCreditAllowed('mastery',0,true)===false);

var fw={area:'fractions_percentages',type:'fraction_of_whole',prompt:'3/4 of 80',answer:60,check:function(v){return Number(v)===60}};
var fws=R.stepsFor(fw);
ok('fraction-of-whole walkthrough has two learner steps',fws.length===2);
ok('fraction-of-whole first step is denominator first',/80 ÷ 4/.test(fws[0].prompt)&&fws[0].check('20'));
ok('fraction-of-whole second step leaves learner to multiply',/20 × 3/.test(fws[1].prompt)&&fws[1].check('60'));

var alg={area:'algebra',type:'two_sided_linear',prompt:'7x + 2 = 3x + 26',answer:6,params:{a:7,b:2,c:3,d:26},check:function(v){return Number(v)===6}};
var as=R.stepsFor(alg);
ok('algebra walkthrough decomposes into three steps',as.length===3);
ok('algebra x-term step checks coefficient difference',as[0].check('4'));
ok('algebra constant step checks moved constant',as[1].check('24'));
ok('algebra final step checks x',as[2].check('6'));

var pct={area:'fractions_percentages',type:'percent',prompt:'348 is what percent of 600?',answer:58,check:function(v){return Number(String(v).replace('%',''))===58}};
var ps=R.stepsFor(pct);
ok('what-percent walkthrough starts with 1 percent chunk',ps.length===2&&ps[0].check('6'));
ok('what-percent walkthrough reaches 58 percent',ps[1].check('58'));

var conv={area:'unit_conversions',type:'single_conversion',prompt:'0.062 L to mL',answer:62,conversion:{from:'L',to:'mL',factor:1000},check:function(v){return Number(v)===62}};
var cs=R.stepsFor(conv);
ok('conversion walkthrough asks for factor first',cs.length===2&&cs[0].check('1000'));
ok('conversion walkthrough then calculates amount',cs[1].check('62'));

var ui=fs.readFileSync('day1/math-gym-ui.js','utf8');
ok('UI offers three help tiers',ui.indexOf('Give me a hint')>=0&&ui.indexOf('Give me the first step')>=0&&ui.indexOf('Walk me through it')>=0);
ok('walkthrough checks learner step instead of revealing everything',ui.indexOf('Check this step')>=0&&ui.indexOf('Try this same step again')>=0);
ok('wrong answer offers choice instead of auto-teaching',ui.indexOf('gymHelpAfterWrong')>=0&&ui.indexOf('Stay on this same problem and try again.')>=0);
ok('mastery pass uses independent evidence',ui.indexOf("mode==='mastery'&&independentCorrect>=3")>=0);
ok('supported mastery item says it does not count',ui.indexOf('does not count toward Fresh Mastery')>=0);
ok('speed mode help policy is unavailable',ui.indexOf("if(mode==='speed')return{available:false")>=0);

console.log('\nMath Gym tiered help: '+p+' passed, '+f+' failed');if(f)process.exit(1);
