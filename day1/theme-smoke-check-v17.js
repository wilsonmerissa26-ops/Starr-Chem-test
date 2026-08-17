var fs = require('fs');
var html = fs.readFileSync(__dirname + '/index.html','utf8');
var css = fs.readFileSync(__dirname + '/classroom-purple-theme-v17.css','utf8');
function must(label, cond){ if(!cond){ console.error('FAIL ' + label); process.exitCode = 1; } else { console.log('PASS ' + label); } }
must('theme stylesheet linked', html.indexOf('classroom-purple-theme-v17.css') !== -1);
must('round DM classroom mark present', html.indexOf('class="brandAvatar">DM<') !== -1);
must('all six primary tabs preserved', ['home','math','chemistry','notebook','review','summary'].every(function(v){ return html.indexOf('data-view="'+v+'"') !== -1; }));
must('existing classroom runtime preserved', html.indexOf('classroom-v5.js') !== -1);
must('guided tutor preserved', html.indexOf('guided-problem-tutor-v13.js') !== -1);
must('reset control preserved', html.indexOf('reset-progress-v16.js') !== -1);
must('dark purple theme defined', css.indexOf('--p-deep:#2f124f') !== -1 && css.indexOf('linear-gradient(150deg') !== -1);
