"use strict";
const assert = require("assert");
const fs = require("fs");
const Print = require("./readiness-day-print");
const curricula = require("./readiness-day-curricula");

let assertions = 0;
const ok = (value, message) => { assert(value, message); assertions += 1; };
const eq = (actual, expected, message) => { assert.equal(actual, expected, message); assertions += 1; };

ok(Print.printCss.includes("@media print"), "print stylesheet has print media rules");
ok(Print.printCss.includes("@page{size:Letter"), "print stylesheet targets Letter pages");
ok(Print.printCss.includes("break-before:page"), "major packet sections can begin on fresh pages");
ok(Print.printCss.includes("body.print-student>main"), "interactive lesson is hidden when printing student packet");
ok(Print.printCss.includes("body.print-key>main"), "interactive lesson is hidden when printing answer key");

for (let day = 4; day <= 9; day += 1) {
  const config = curricula[day];
  const student = Print.packetHtml(config, { mode: "student" });
  const key = Print.packetHtml(config, { mode: "key" });
  const guided = config.items.filter(item => !(item.tags || []).includes("fallback") && item.stage === "guided");
  const cold = config.items.filter(item => item.stage === "independent" || item.stage === "transfer" || (item.tags || []).includes("fallback"));

  ok(student.includes('data-print-mode="student"'), `Day ${day} builds student packet`);
  ok(key.includes('data-print-mode="key"'), `Day ${day} builds answer key`);
  ok(student.includes(config.title), `Day ${day} student packet includes title`);
  ok(student.includes("What to know before practice"), `Day ${day} includes lesson foundation`);
  ok(student.includes("Vocabulary relationships"), `Day ${day} includes vocabulary section`);
  ok(student.includes("Independent practice"), `Day ${day} includes independent section`);
  ok(student.includes("Cold transfer"), `Day ${day} includes transfer section`);
  ok(student.includes("Extra fresh practice"), `Day ${day} includes fallback section`);
  ok(student.includes("My review notes"), `Day ${day} includes printable reflection space`);

  for (const fact of config.facts) ok(student.includes(fact), `${day}: prints governing fact`);
  for (const entry of config.vocabularyEntries) {
    ok(student.includes(entry.term), `${day}: prints vocabulary term ${entry.term}`);
    ok(student.includes(entry.teaching), `${day}: prints vocabulary teaching for ${entry.term}`);
  }
  for (const item of config.items) {
    ok(student.includes(`data-print-item="${item.id}"`), `${item.id} appears in student packet`);
    ok(student.includes(item.prompt), `${item.id} prompt appears in student packet`);
    ok(key.includes(`data-print-answer-for="${item.id}"`), `${item.id} appears in answer key`);
    ok(key.includes(item.answerKey), `${item.id} answer appears in answer key`);
  }
  for (const item of guided) ok(student.includes(item.answerKey), `${item.id} is a worked teaching example in student packet`);
  for (const item of cold) ok(!student.includes(item.answerKey), `${item.id} cold/fallback answer is not exposed in student packet`);

  const itemMarkers = (student.match(/data-print-item=/g) || []).length;
  eq(itemMarkers, config.items.length, `Day ${day} packet contains every authored practice item exactly once`);

  const html = fs.readFileSync(`day${day}/index.html`, "utf8");
  const printPos = html.indexOf("../readiness-day-print.js");
  const appPos = html.indexOf("../readiness-day-app.js");
  ok(printPos >= 0, `Day ${day} loads print layer`);
  ok(appPos > printPos, `Day ${day} loads print layer before app runtime`);
}

console.log(`Days 4-9 multi-page print packets: ${assertions} assertions passed`);
