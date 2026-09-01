"use strict";
var assert=require("assert");
var Support=require("./course-units/unit1/chapter1/chapter1-support.js");
var reasons=["dont_understand_concept","dont_know_how_to_start","forgot_prerequisite","started_but_stuck","show_me_example","explanation_not_making_sense"];
function audit(lesson){var rows=reasons.map(function(r){return Support.route(lesson,r);});assert(rows.every(Boolean),lesson+" must route all six IDK reasons");assert.strictEqual(new Set(rows.map(function(x){return x.text;})).size,6,lesson+" must not collapse six reasons into one teaching paragraph");assert(rows.every(function(x){return x.code&&x.text.length>60;}),lesson+" routes need a targeted repair code and substantive teaching");return rows;}
var lewis=audit("lewis"),formal=audit("formal-charge");
assert.strictEqual(lewis[1].code,"TOTAL_ELECTRONS");
assert.strictEqual(lewis[2].code,"VALENCE_COUNT");
assert.strictEqual(formal[1].code,"VALENCE_COUNT");
assert.strictEqual(formal[2].code,"NONBONDING_ELECTRONS");
console.log("PASS  Chapter 1 IDK routes are six-way and lesson-specific");