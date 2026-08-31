"use strict";
const assert=require("assert");
const fs=require("fs");
const {JSDOM}=require("jsdom");

(async function(){
  let passed=0;
  function ok(v,m){assert(v,m);passed++;}
  const html=fs.readFileSync("course-units/unit1/bond-line/index.html","utf8");
  const guided=fs.readFileSync("course-units/unit1/bond-line/bond-line-guided.js","utf8");
  ok(guided.includes("../../../learner-tools.js"),"Bond-Line browser bootstrap loads shared learner tools");
  ok(guided.includes("data-unit-href"),"learner tools receives the Unit 1 return path");
  ok(guided.includes("../../../course-hub/"),"learner tools receives the course hub Home path");
  ok(guided.includes("../../../periodic-table.html"),"learner tools receives the Periodic Table path");

  const dom=new JSDOM(html,{runScripts:"outside-only",url:"https://example.test/course-units/unit1/bond-line/"});
  const w=dom.window,d=w.document;
  const toolCode=fs.readFileSync("learner-tools.js","utf8");
  w.eval(toolCode);

  ok(!!d.querySelector("[data-unit-nav]"),"visible Unit 1 navigation is injected");
  ok(!!d.querySelector("[data-home-nav]"),"visible Home navigation is injected");
  ok(!!d.querySelector("[data-periodic-tool]"),"visible Periodic Table tool is injected");
  ok(!!d.querySelector("[data-help-tool]"),"visible global Help tool is injected");
  ok(d.querySelector("[data-unit-nav]").getAttribute("href")==="../","Unit 1 navigation returns to the unit page");
  ok(d.querySelector("[data-home-nav]").getAttribute("href")==="../../../course-hub/","Home navigation returns to the CHM 221 hub");

  d.querySelector("[data-periodic-tool]").click();
  let overlay=d.querySelector(".learner-overlay");
  ok(!overlay.hidden,"Periodic Table opens without leaving the lesson");
  ok(d.querySelector(".learner-periodic-frame").getAttribute("src").includes("periodic-table.html"),"Periodic Table opens in an in-lesson overlay");
  d.querySelector("[data-tool-close]").click();
  ok(overlay.hidden,"Periodic Table overlay closes back to the lesson");

  d.getElementById("phaseLabel").textContent="Watch · I Do · Step 6";
  d.querySelector("[data-help-tool]").click();
  const helpText=d.querySelector("[data-tool-body]").textContent;
  ok(helpText.includes("Two visible single bonds give bond order 2"),"Watch Step 6 Help starts from the two visible bonds on the selected carbon");
  ok(helpText.includes("two implied C–H bonds"),"Watch Step 6 Help connects bond order 2 to two implied hydrogens");
  d.querySelector("[data-tool-close]").click();

  let coldHelpClicks=0;
  const cold=document.createElement("button");
  cold.setAttribute("data-independent-help","");
  cold.addEventListener("click",()=>coldHelpClicks++);
  d.body.appendChild(cold);
  d.getElementById("phaseLabel").textContent="Independent · Cold Evidence";
  d.querySelector("[data-help-tool]").click();
  ok(coldHelpClicks===0,"global Help does not silently bypass cold-evidence contamination");
  ok(d.querySelector("[data-tool-body]").textContent.includes("make the current item supported"),"cold Help warns that support changes evidence");
  d.querySelector("[data-use-cold-help]").click();
  await new Promise(r=>w.setTimeout(r,5));
  ok(coldHelpClicks===1,"confirmed global Help delegates to the existing contamination-aware cold Help path");

  const periodic=fs.readFileSync("periodic-table.html","utf8");
  ok(periodic.includes("Oganesson"),"Periodic Table contains the full element set through element 118");
  ok(periodic.includes("Organic-chemistry shortcut"),"Periodic Table includes CHM 221-oriented quick reference notes");

  console.log(`Bond-Line learner tools: ${passed} assertions passed`);
})().catch(err=>{console.error(err);process.exit(1);});
