'use strict';
var fs=require('fs'),vm=require('vm'),G=require('./math-gym-engine.js');
var passed=0,failed=0;function ok(name,value){if(value){console.log('PASS  '+name);passed++;}else{console.log('FAIL  '+name);failed++;}}
function rng(seed){var s=seed>>>0;return function(){s=(1664525*s+1013904223)>>>0;return s/4294967296;};}
var areas=['fractions_percentages','algebra','exponents','scientific_notation','logs_estimation','unit_conversions'];
var audited=0;
areas.forEach(function(area){for(var i=0;i<500;i++){var item=G.generate(area,rng(i*97+area.length));audited++;ok(area+' generated item '+i+' is complete',!!item.prompt&&item.answer!==undefined&&typeof item.check==='function'&&item.check(item.answer,item.unit));}});
var percents={};for(var j=0;j<15;j++){var calls=0,p=G.generatePercent(function(){return calls++?0.25:(j+.1)/15;});percents[p.answer]=true;}
[1,5,10,17,20,25,27,33,38,50,58,63,72,75,84].forEach(function(p){ok('percent bank includes '+p+'%',percents[p]);});
ok('33 percent remains exact 33 percent, not one third',G.generatePercent(function(){return .45;}).answer!==100/3);
['g:mg','mg:g','mg:mcg','mcg:mg','mol:mmol','mmol:mol','gal:qt','qt:pt','pt:cups','cups:fl oz'].forEach(function(pair){var x=pair.split(':');ok('conversion relationship '+pair,G.CONVERSIONS.some(function(c){return c.from===x[0]&&c.to===x[1];}));});
var html=fs.readFileSync('day1/index.html','utf8');ok('canonical molecule verifier is loaded',html.includes('../molecule-stage.js'));ok('voice quality layer is loaded last',html.indexOf('voice-quality-v12.js')>html.indexOf('learning-record-v11.js'));
var utterances=[];function U(t){this.text=t;this.rate=1;this.pitch=1;this.volume=1;}var context={window:{speechSynthesis:{speak:function(u){utterances.push(u);}}},SpeechSynthesisUtterance:U};context.window.window=context.window;context.window.SpeechSynthesisUtterance=U;vm.runInNewContext(fs.readFileSync('day1/voice-quality-v12.js','utf8'),context);var normalized=context.window.DrMerissaVoice.normalize('H₂O: 58% of 10 mL × 2 mg ≈ 1.16 g; 10^-3; e⁻');ok('voice expands formulas units symbols and negative powers',/H two O/.test(normalized)&&/58 percent/.test(normalized)&&/milliliters/.test(normalized)&&/milligrams/.test(normalized)&&/approximately/.test(normalized)&&/negative 3 power/.test(normalized)&&/electrons/.test(normalized));
context.window.speechSynthesis.speak(new U('NH₃'));ok('voice caps instructional pace',utterances[0].rate===.82&&utterances[0].text==='N H three');
console.log('\nRelease academic generator audit: '+audited+' generated math items; '+passed+' passed, '+failed+' failed');if(failed)process.exit(1);
