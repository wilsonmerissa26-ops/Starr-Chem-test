var fs=require('fs');
var teaching=fs.readFileSync(__dirname+'/day1/teaching-upgrades-v6.js','utf8');
var toolbox=fs.readFileSync(__dirname+'/day1/toolbox-ui-v7.js','utf8');
var gym=fs.readFileSync(__dirname+'/day1/math-gym-ui.js','utf8');
function must(label,cond){if(!cond){console.error('FAIL '+label);process.exitCode=1;}else{console.log('PASS '+label);}}

/* Regression: v6 used to add [data-percent-toolbox] from a MutationObserver while
   v7 removed it from another MutationObserver. That add/remove cycle continuously
   mutated the Math DOM on phones, causing visible shaking and missed taps. */
var runBody=(teaching.match(/function run\(\)\{([\s\S]*?)\}\nnew MutationObserver/)||[])[1]||'';
must('legacy percent toolbox is not called from mutation run loop',runBody.indexOf('percentCoach();')===-1);
must('compact toolbox remains the active math reference system',toolbox.indexOf('data.toolboxV7')!==-1||toolbox.indexOf("dataset.toolboxV7")!==-1);

/* Regression: Math Gym area/mode handlers used to call openGym and then render a
   second problem immediately, creating unnecessary DOM replacement under a tap. */
must('Math Gym area selection renders only once',gym.indexOf('openGym();newItem()')===-1);
must('Math Gym mode selection does not start a second round',gym.indexOf("openGym();if(mode==='speed')startSpeed();else newItem()")===-1);
must('Math Gym dynamic buttons are explicit non-submit buttons',gym.indexOf("b.type='button'")!==-1&&gym.indexOf('type="button" id="gymCheck"')!==-1);
