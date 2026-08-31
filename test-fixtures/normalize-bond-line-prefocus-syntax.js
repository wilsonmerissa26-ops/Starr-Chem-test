/*
 * Historical-fixture helper for PR #76.
 *
 * Commit 6b6bc7c... is the real pre-focus-fix app, but it also contains an
 * unrelated quote typo in the P1 repair markup that prevents JavaScript from
 * parsing. The DOM regression needs that historical app to execute so it can
 * test the focus defect itself. This helper changes only that one malformed
 * string delimiter in the temporary fixture produced by `git show`.
 */
"use strict";

var fs = require("fs");
var file = process.argv[2];
if (!file) throw new Error("fixture path required");

var source = fs.readFileSync(file, "utf8");
var before = '+ "</h2><p class=\\"support-note\\">One bond slot is already occupied by C—C. Count what remains.</p></div>\' +';
var after = '+ \'</h2><p class="support-note">One bond slot is already occupied by C—C. Count what remains.</p></div>\' +';

if (source.indexOf(before) === -1) {
  throw new Error("expected historical P1 quote typo was not found; refusing to mutate fixture");
}
if (source.indexOf(before) !== source.lastIndexOf(before)) {
  throw new Error("historical P1 quote typo matched more than once; refusing ambiguous mutation");
}

source = source.replace(before, after);
fs.writeFileSync(file, source);
console.log("Normalized only the unrelated historical P1 quote typo in " + file);
