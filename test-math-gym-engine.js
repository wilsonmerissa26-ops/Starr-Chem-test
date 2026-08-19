var G=require('./math-gym-engine-v2.js');
var p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}
function rng(seed){var s=seed>>>0;return function(){s=(1664525*s+1013904223)>>>0;return s/4294967296;};}
function seq(values){var i=0;return function(){return values[i++%values.length];};}
function fractionPromptValue(item){var m=String(item.prompt).match(/^([+-]?\d+)\/([+-]?\d+)\s+of\s+([+-]?(?:\d+(?:\.\d*)?|\.\d+))$/i);return m?Number(m[1])/Number(m[2])*Number(m[3]):null;}

ok('practice allows hints and is untimed',G.MODES.practice.hints===true&&G.MODES.practice.timed===false&&!G.MODES.practice.changesStatus);
ok('speed round has no hints and is timed',G.MODES.speed.hints===false&&G.MODES.speed.timed===true);
ok('challenge allows hints and is untimed',G.MODES.challenge.hints===true&&G.MODES.challenge.timed===false);
ok('mastery is fresh unaided and may change status',G.MODES.mastery.fresh&&G.MODES.mastery.unaided&&G.MODES.mastery.changesStatus);

var r=rng(7),frac=G.generateFraction(r);ok('fraction answer validates exactly',frac.check(frac.answer));
var pct=G.generatePercent(r);ok('percent generator produces clean self-validating answer',pct.check(pct.answer+'%'));
var ofw=G.generateFractionOfWhole(r);ok('fraction-of-whole generator produces clean integer answer',Number.isInteger(ofw.answer)&&ofw.check(ofw.answer));
ok('fraction-of-whole displayed prompt agrees with hidden answer',Math.abs(fractionPromptValue(ofw)-ofw.answer)<1e-10);

// Real-device regressions from 2026-08-19. These sequences reproduce the old
// reduced-fraction construction bug exactly: the visible prompt was right but
// the hidden key used the unreduced denominator.
var threeFourth=G.generateFractionOfWhole(seq([.65,.75,.71]));
ok('regression: generator displays 3/4 of 80',threeFourth.prompt==='3/4 of 80');
ok('regression: 3/4 of 80 accepts 60',threeFourth.answer===60&&threeFourth.check('60'));
ok('regression: 3/4 of 80 rejects stale hidden key 30',!threeFourth.check('30'));
var oneHalf=G.generateFractionOfWhole(seq([.9,.45,.99]));
ok('regression: generator displays 1/2 of 400',oneHalf.prompt==='1/2 of 400');
ok('regression: 1/2 of 400 accepts 200',oneHalf.answer===200&&oneHalf.check('200'));
ok('regression: 1/2 of 400 rejects stale hidden key 40',!oneHalf.check('40'));

for(var i=0;i<500;i++){
  var semantic=G.generateFractionOfWhole(rng(7000+i));
  ok('fraction-of-whole semantic alignment '+i,Math.abs(fractionPromptValue(semantic)-semantic.answer)<1e-10&&semantic.check(String(semantic.answer)));
}

for(i=0;i<20;i++){
  var item=G.generateLinearEquation(rng(100+i)),q=item.params;
  ok('linear equation '+i+' is constructed around chosen integer x',q.a*item.answer+q.b===q.c*item.answer+q.d&&Number.isInteger(item.answer)&&item.check(item.answer));
}
var prop=G.generateProportion(rng(3));ok('proportion is answer-first and exact',Math.abs(prop.answer-Number(prop.answer))<1e-10&&prop.check(prop.answer));
var form=G.generateFormulaRearrangement(rng(4));ok('curated formula rearrangement accepts its verified key',form.check(form.answer));

var neg=G.generateNegativeExponent(rng(5));ok('negative exponent returns exact reciprocal',neg.check(neg.answer));
var er=G.generateExponentRule(rng(6));ok('same-base exponent rule validates generated key',er.check(er.answer));

for(i=0;i<20;i++){
  var sci=G.generateScientificNotation(rng(300+i));
  ok('scientific notation '+i+' returns normalized coefficient',Math.abs(sci.answer.coefficient)>=1&&Math.abs(sci.answer.coefficient)<10&&sci.check(sci.answer));
}

var log=G.generateExactLog(rng(8));ok('exact log/inverse item validates exact answer',log.check(log.answer));
var est=G.generateLogEstimate(rng(9));ok('log estimate uses ±0.15 tolerance',est.check(est.answer+.149)&&!est.check(est.answer+.151));

for(i=0;i<20;i++){
  var u=G.generateUnitConversion(rng(500+i));
  ok('unit conversion '+i+' is built from verified factor',Math.abs(u.answer-(parseFloat(u.prompt)*u.conversion.factor))<1e-8&&u.check(u.answer,u.unit));
}
var rate=G.generateStackedRate(rng(10));ok('stacked mol/s rate converts by 1000 and 60',Math.abs(parseFloat(rate.prompt)*1000*60-rate.answer)<1e-8);
ok('stacked rate requires final unit label',rate.check(rate.answer,'mmol/min')&&!rate.check(rate.answer,'mol/s')&&!rate.check(rate.answer));

var mitem=G.generateLinearEquation(rng(11));var rec=G.createAttemptRecord(mitem,'practice',{startedAt:1000});G.recordSubmission(rec,false,{hintTier:1,timestamp:1100});G.recordSubmission(rec,true,{hintTier:2,calculatorUsed:true,timestamp:1500});
ok('tracking stores attempts before correct',rec.attemptsBeforeCorrect===2&&rec.correct===true);
ok('tracking stores highest hint tier, time, calculator use',rec.hintTier===2&&rec.timeMs===500&&rec.calculatorUsed===true);
ok('practice attempt does not change cleared/developing status',rec.countsTowardStatus===false);
var master=G.createAttemptRecord(mitem,'mastery',{startedAt:2000});ok('fresh unseen mastery item is eligible',G.masteryEligible('mastery',mitem,[]));ok('previously seen item is not mastery eligible',!G.masteryEligible('mastery',mitem,[{itemId:mitem.id}]));ok('practice item can never be mastery evidence',!G.masteryEligible('practice',mitem,[]));

var areas=['fractions_percentages','algebra','exponents','scientific_notation','logs_estimation','unit_conversions'];areas.forEach(function(a){var it=G.generate(a,rng(a.length));ok('generic generator covers '+a,!!it&&it.area===a&&typeof it.check==='function');});

console.log('\nMath Gym engine: '+p+' passed, '+f+' failed');if(f)process.exit(1);
