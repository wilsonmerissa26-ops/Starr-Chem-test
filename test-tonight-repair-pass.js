'use strict';
const assert=require('assert');
const fs=require('fs');
const gym=require('./day1/math-gym-ui.js');
const tutor=require('./day1/guided-problem-tutor-v13.js');
let passed=0,failed=0;
function test(name,fn){try{fn();passed++;console.log('PASS ',name)}catch(e){failed++;console.log('FAIL ',name,'--',e.message)}}

test('1 practice waits for learner-controlled Continue',()=>{assert.strictEqual(gym.shouldAutoAdvance('practice'),false);assert.strictEqual(gym.shouldAutoAdvance('challenge'),false);assert.strictEqual(gym.shouldAutoAdvance('mastery'),false)});
test('2 Speed Round alone may auto-advance',()=>assert.strictEqual(gym.shouldAutoAdvance('speed'),true));
test('3 first-step support stops after one correct step',()=>{assert.strictEqual(tutor.supportAction('first',0,3),'stop');assert.strictEqual(tutor.supportAction('walk',0,3),'next')});
test('4 Help me understand is concept help, not the mental-math route',()=>{const q='15% of 80 =',p=tutor.planFor(q),u=tutor.understandText(p,q);assert(u&&p&&p.mental);assert.notStrictEqual(u,p.mental);assert(/percent means/i.test(u));assert(/optional calculation strategy/i.test(fs.readFileSync('day1/guided-problem-tutor-v13.js','utf8')))});
test('5 15% of 80 chooses 10% + 5%, not a forced 1% step',()=>{const p=tutor.planFor('15% of 80 =');const prompts=p.steps.map(s=>s.p).join(' ');assert(/10%/.test(prompts));assert(/5%/.test(prompts));assert(!/What is 1%/.test(prompts));assert(p.steps[0].a('8'));assert(p.steps[1].a('4'));assert(p.steps[p.steps.length-1].a('12'))});
test('6 live IDK and walkthrough entry points use distinct modes',()=>{const src=fs.readFileSync('day1/guided-problem-tutor-v13.js','utf8');assert(src.includes("open(card,plan,q,'walk')"));assert(src.includes("open(card,plan,q,'understand')"));assert(src.includes('Help me understand this problem'))});
console.log('\nTonight repair pass:',passed,'passed,',failed,'failed');if(failed)process.exit(1);
