'use strict';

/* ============================================================
   CANONICAL DAY 1 ADAPTIVE MATH MODEL ENTRY

   Planning/prerequisite logic lives in the pure core module. This entry owns
   learner-support presentation policy so support roles cannot drift into one
   another. In particular, Help me understand must not silently become the
   optional mental-math route.
   ============================================================ */

var core = require('./day1-adaptive-math-model-core.js');

function clone(v){ return JSON.parse(JSON.stringify(v)); }

function supportFor(mode,plan){
  if(!plan||!plan.chosenPlan)throw new Error('support requires a chosen plan');
  var p=plan.chosenPlan;
  var base={
    mode:mode,
    strategyId:plan.chosenStrategyId,
    answerRevealed:false,
    concept:'',
    hint:'',
    steps:[]
  };

  if(mode==='hint'){
    base.hint=p.hint||(p.firstStep&&p.firstStep.hint)||'';
    return base;
  }
  if(mode==='understand'){
    // Concept/strategy framing only. Do not reuse p.mentalRoute here: mental
    // math is an optional route, not a substitute for conceptual explanation.
    base.concept=p.concept||'';
    return base;
  }
  if(mode==='first_step'){
    base.concept=p.concept||'';
    base.steps=p.firstStep?[clone(p.firstStep)]:[];
    return base;
  }
  if(mode==='walkthrough'){
    base.concept=p.concept||'';
    base.steps=clone(p.steps||[]);
    return base;
  }
  if(mode==='mental'){
    base.hint=p.mentalRoute||'';
    return base;
  }
  throw new Error('unknown support mode '+mode);
}

module.exports = Object.assign({}, core, { supportFor:supportFor });
