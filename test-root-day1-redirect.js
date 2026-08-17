const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('index.html', 'utf8');

assert.match(
  html,
  /<meta\s+http-equiv=["']refresh["']\s+content=["']0;\s*url=day1\/["']\s*\/?>/i,
  'Root meta refresh must send learners to day1/'
);

assert.match(
  html,
  /location\.replace\(["']day1\/["']\s*\+\s*location\.search\s*\+\s*location\.hash\)/,
  'JavaScript redirect must send learners to day1/ and preserve query/hash'
);

assert.match(
  html,
  /<a\s+href=["']day1\/["'][^>]*>/i,
  'Fallback link must point to day1/'
);

assert.ok(
  !html.includes('astarryia-day1-foundation-reset.html'),
  'Root entry page must not point learners back to the retired Foundation Reset page'
);

console.log('Root Day 1 redirect regression passed.');
