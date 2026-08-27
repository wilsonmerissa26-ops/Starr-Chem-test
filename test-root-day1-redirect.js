const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('index.html', 'utf8');

assert.match(
  html,
  /<meta\s+http-equiv=["']refresh["']\s+content=["']0;\s*url=course-hub\/["']\s*\/?>/i,
  'Root meta refresh must send learners to course-hub/'
);

assert.match(
  html,
  /location\.replace\(["']course-hub\/["']\s*\+\s*location\.search\s*\+\s*location\.hash\)/,
  'JavaScript redirect must send learners to course-hub/ and preserve query/hash'
);

assert.match(
  html,
  /<a\s+href=["']course-hub\/["'][^>]*>/i,
  'Fallback link must point to course-hub/'
);

assert.ok(
  !/url=day1\//i.test(html),
  'Root entry page must not bypass the course hub and force Day 1'
);

console.log('Root CHM 221 course hub redirect regression passed.');
