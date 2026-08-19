'use strict';
var fs=require('fs'),vm=require('vm'),G=require('./math-gym-engine-v2.js'),UI=require('./day1/math-gym-ui.js');
var passed=0,failed=0;function ok(name,value){if(value){console.log('PASS  '+name);passed++;}else{console.log('FAIL  '+name);failed++;}}
function rng(seed){var s=seed>>>0;return function(){s=(1664525*s+1013904223)>>>0;return s/4294967296;};}
function fractionPromptValue(item){var m=String(item.prompt||'').match(/^([+-]?\d+)\/([+-]?\d+)\s+of\s+([+-]?(?:\d+(?:\.\d*)?|\.\d+))$/i);return m?Number(m[1])/Number(m[2])*Number(m[3]):null;}
var areas=['fractions_percentages','algebra','exponents','scientific_notation','logs_estimation','unit_conversions'];
var audited=0;
areas.forEach(function(area){for(var i=0;i<500;i++){var item=G.generate(area,rng(i*97+area.length));audited++;ok(area+' generated item '+i+' is complete',!!item.prompt&&item.answer!==undefined&&typeof item.check==='function'&&item.check(item.answer,item.unit));if(item.type==='fraction_of_whole'){ok(area+' fraction-of-whole semantic '+i,Math.abs(fractionPromptValue(item)-item.answer)<1e-10&&item.semanticSource==='displayed_prompt');}}});
var percents={};for(var j=0;j<15;j++){var calls=0,p=G.generatePercent(function(){return calls++?0.25:(j+.1)/15;});percents[p.answer]=true;}
[1,5,10,17,20,25,27,33,38,50,58,63,72,75,84].forEach(function(p){ok('percent bank includes '+p+'%',percents[p]);});
ok('33 percent remains exact 33 percent, not one third',G.generatePercent(function(){return .45;}).answer!==100/3);
['g:mg','mg:g','mg:mcg','mcg:mg','mol:mmol','mmol:mol','gal:qt','qt:pt','pt:cups','cups:fl oz'].forEach(function(pair){var x=pair.split(':');ok('conversion relationship '+pair,G.CONVERSIONS.some(function(c){return c.from===x[0]&&c.to===x[1];}));});

ok('Math Gym score grammar shows first attempt immediately',UI.scoreText(0,1)==='0 correct / 1 attempt');
ok('Math Gym score grammar shows plural attempts',UI.scoreText(1,2)==='1 correct / 2 attempts');
var amountHint=UI.hintFor({area:'fractions_percentages',type:'fraction_of_whole',prompt:'1/2 of 400'});
ok('fraction-of-whole hint says the answer job is an amount',/amount, not a percent/i.test(amountHint));
ok('fraction-of-whole hint uses the displayed denominator route',/400 ÷ 2 = 200/.test(amountHint)&&/numerator 1/.test(amountHint));
var threeFourthHint=UI.hintFor({area:'fractions_percentages',type:'fraction_of_whole',prompt:'3/4 of 80'});
ok('3/4 of 80 hint uses divide-first mental route',/80 ÷ 4 = 20/.test(threeFourthHint)&&/numerator 3/.test(threeFourthHint));
var percentHint=UI.hintFor({area:'fractions_percentages',type:'percent',prompt:'348 is what percent of 600?',answer:58});
ok('what-percent hint uses nearby 60 percent anchor',/60% of 600 = 360/.test(percentHint));
ok('what-percent hint explains compensation without blurting final answer',/12 lower/.test(percentHint)&&/subtract that percent from 60%/.test(percentHint)&&!/58%/.test(percentHint));
var fractionHint=UI.hintFor({area:'fractions_percentages',type:'fraction',prompt:'1/3 + 1/4'});
ok('fraction arithmetic hint asks for common denominator',/common denominator/i.test(fractionHint));
var gymUiSource=fs.readFileSync('day1/math-gym-ui.js','utf8');
ok('Math Gym check refreshes score after attempt is recorded',/total\+\+;if\(ok\)correctCount\+\+;updateScore\(\)/.test(gymUiSource));

var html=fs.readFileSync('day1/index.html','utf8');ok('canonical molecule verifier is loaded',html.includes('../molecule-stage.js'));ok('Math Gym semantic correction loads after base engine and before UI',html.indexOf('../math-gym-engine.js')>=0&&html.indexOf('../math-gym-engine-v2.js')>html.indexOf('../math-gym-engine.js')&&html.indexOf('../math-gym-engine-v2.js')<html.indexOf('math-gym-ui.js'));ok('Math Gym UI is cache-versioned for phone release',/math-gym-ui\.js\?v=/.test(html));ok('voice quality layer is loaded last',html.indexOf('voice-quality-v12.js')>html.indexOf('learning-record-v11.js'));
var utterances=[];function U(t){this.text=t;this.rate=1;this.pitch=1;this.volume=1;}var context={window:{speechSynthesis:{speak:function(u){utterances.push(u);}}},SpeechSynthesisUtterance:U};context.window.window=context.window;context.window.SpeechSynthesisUtterance=U;vm.runInNewContext(fs.readFileSync('day1/voice-quality-v12.js','utf8'),context);var normalized=context.window.DrMerissaVoice.normalize('H₂O: 58% of 10 mL × 2 mg ≈ 1.16 g; 10^-3; e⁻');ok('voice expands formulas units symbols and negative powers',/H two O/.test(normalized)&&/58 percent/.test(normalized)&&/milliliters/.test(normalized)&&/milligrams/.test(normalized)&&/approximately/.test(normalized)&&/negative 3 power/.test(normalized)&&/electrons/.test(normalized));
context.window.speechSynthesis.speak(new U('NH₃'));ok('voice caps instructional pace',utterances[0].rate===.82&&utterances[0].text==='N H three');
console.log('\nRelease academic generator audit: '+audited+' generated math items; '+passed+' passed, '+failed+' failed');if(failed)process.exit(1);
