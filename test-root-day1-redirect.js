const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('index.html', 'utf8');

assert.match(
  html,
  /<meta\s+http-equiv=["']refresh["']\s+content=["']0;\s*url=student-app\/["']\s*\/?>/i,
  'Root meta refresh must send learners to student-app/'
);

assert.match(
  html,
  /location\.replace\(["']student-app\/["']\s*\+\s*location\.search\s*\+\s*location\.hash\)/,
  'JavaScript redirect must send learners to student-app/ and preserve query/hash'
);

assert.match(
  html,
  /<a\s+href=["']student-app\/["'][^>]*>/i,
  'Fallback link must point to student-app/'
);

assert.ok(
  !/url=day1\//i.test(html),
  'Root entry page must not bypass the Learning App and force Day 1'
);

console.log('Root unified Learning App redirect regression passed.');
