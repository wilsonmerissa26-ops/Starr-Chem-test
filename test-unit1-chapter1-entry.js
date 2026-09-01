"use strict";
var assert=require("assert"),fs=require("fs");
var unit=fs.readFileSync("course-units/unit1/index.html","utf8");
var ch1=fs.readFileSync("course-units/unit1/chapter1/index.html","utf8");
assert(unit.includes('href="./chapter1/"'),"Unit 1 must expose a learner-visible Chapter 1 teaching route");
assert(unit.includes("Start Chapter 1 teaching"),"Chapter 1 entry must be labeled as teaching, not quick practice");
assert(ch1.includes("Valence Electrons")||ch1.includes("chapter1-data.js"),"Chapter 1 learner page must load authored teaching content");
assert(ch1.includes("learner-tools.js"),"Chapter 1 must keep Unit 1/Home/Periodic Table/Help shell");
console.log("PASS  Chapter 1 learner entry path is visible and distinct from practice");