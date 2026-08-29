/* Regression for PR #76 Codex finding: wrong prerequisite-repair answers must not destroy keyboard/screen-reader focus. */
"use strict";

var fs = require("fs");
var path = "course-units/unit1/bond-line/bond-line-app.js";
var app = fs.readFileSync(path, "utf8");
var failed = 0;

function check(label, condition) {
  if (condition) console.log("PASS  " + label);
  else { console.log("FAIL  " + label); failed += 1; }
}

check("repair feedback has an in-place updater",
  app.indexOf("function updateRepairFeedbackInPlace") !== -1);

check("P1 wrong repair uses in-place feedback rather than rebuilding the lesson panel",
  /submitRepair\(session, "P1", value\)[\s\S]{0,500}if \(!result\.correct\)[\s\S]{0,300}updateRepairFeedbackInPlace\("P1", result\.feedback\)/.test(app));

check("P2 wrong repair uses in-place feedback rather than rebuilding the lesson panel",
  /submitRepair\(session, "P2", value\)[\s\S]{0,500}if \(!result\.correct\)[\s\S]{0,300}updateRepairFeedbackInPlace\("P2", result\.feedback\)/.test(app));

check("wrong repair path returns before render can replace the focused choice",
  /if \(!result\.correct\)[\s\S]{0,350}return;/.test(app));

if (failed) process.exit(1);
