"use strict";
const assert = require("assert");
const fs = require("fs");

const shell = fs.readFileSync("day1/mobile-navigation-fix-v14.js", "utf8");
const index = fs.readFileSync("day1/index.html", "utf8");

assert(shell.includes("FOUNDATION LIBRARY • DAY 1"), "Day 1 is labeled as part of the foundation library");
assert(shell.includes("Day 1 Foundation Review"), "Day 1 home uses review wording instead of a generic work chooser");
assert(shell.includes("Refresh the math and Lewis-structure skills that support your Organic Chemistry work."), "Day 1 explains why the learner would return");
assert(shell.includes("← Back to CHM 221 Hub"), "Day 1 provides a route back to the course hub");
assert(shell.includes("../course-hub/"), "Day 1 back link targets the CHM 221 hub");
assert(shell.includes("Your saved progress stays here when you return."), "Day 1 reassures the learner that review is non-destructive");
assert(index.indexOf("classroom-v5.js") < index.indexOf("mobile-navigation-fix-v14.js"), "foundation-library shell runs after the classroom renderer");

console.log("Day 1 foundation-library shell: 7 assertions passed");
