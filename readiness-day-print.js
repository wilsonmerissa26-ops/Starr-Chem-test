(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else {
    root.ReadinessDayPrint = api;
    if (root.document) api.autoInstall(root);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  const isFallback = item => (item.tags || []).includes("fallback");
  const lines = count => `<div class="print-lines">${Array.from({ length: count || 5 }, () => "<div></div>").join("")}</div>`;
  const stageLabel = item => item.stage === "guided" ? "Guided worked example" : item.stage === "transfer" ? "Cold transfer" : isFallback(item) ? "Fresh fallback practice" : "Cold independent practice";

  function workedExample(item) {
    return `<article class="print-question print-worked" data-print-item="${esc(item.id)}"><div class="print-item-head"><strong>${esc(item.id)}</strong><span>${esc(stageLabel(item))}</span></div><p class="print-prompt">${esc(item.prompt)}</p><div class="print-worked-answer"><strong>Worked reasoning</strong><p>${esc(item.answerKey)}</p></div></article>`;
  }

  function practiceItem(item) {
    return `<article class="print-question" data-print-item="${esc(item.id)}"><div class="print-item-head"><strong>${esc(item.id)}</strong><span>${esc(stageLabel(item))}</span></div><p class="print-prompt">${esc(item.prompt)}</p>${lines(item.stage === "transfer" ? 7 : 5)}</article>`;
  }

  function keyItem(item) {
    return `<article class="print-key-item" data-print-answer-for="${esc(item.id)}"><div class="print-item-head"><strong>${esc(item.id)}</strong><span>${esc(stageLabel(item))}</span></div><p class="print-prompt">${esc(item.prompt)}</p><div class="print-answer"><strong>Answer / review key</strong><p>${esc(item.answerKey)}</p></div></article>`;
  }

  function vocabularySection(config) {
    return `<section class="print-section"><h2>Vocabulary relationships</h2><p class="print-note">Learn the relationship, not just the label. These definitions are study support and do not count as mastery proof.</p><div class="print-vocab">${(config.vocabularyEntries || []).map(entry => `<div class="print-vocab-item"><strong>${esc(entry.term)}</strong><p>${esc(entry.teaching)}</p></div>`).join("")}</div></section>`;
  }

  function foundationSection(config) {
    return `<section class="print-section print-foundation"><h2>What to know before practice</h2><ul>${(config.facts || []).map(fact => `<li>${esc(fact)}</li>`).join("")}</ul><div class="print-rule-box"><strong>How to use this packet</strong><p>Study the relationships and worked example first. Then complete the independent and transfer sections without looking at answers or using clues. If you need support, use the fresh fallback practice afterward.</p></div></section>`;
  }

  function studentPacket(config) {
    const normal = (config.items || []).filter(item => !isFallback(item));
    const guided = normal.filter(item => item.stage === "guided");
    const independent = normal.filter(item => item.stage === "independent");
    const transfer = normal.filter(item => item.stage === "transfer");
    const fallback = (config.items || []).filter(isFallback);
    return `<section class="print-packet print-packet--student" data-print-mode="student"><header class="print-cover"><div class="print-kicker">AStarryia Chemistry Readiness</div><h1>Day ${esc(config.day)}: ${esc(config.title)}</h1><div class="print-name-row"><span>Name: ________________________________</span><span>Date: __________________</span></div><p>This is the printable study + practice companion for the online adaptive lesson. The online mastery engine remains the source of recorded mastery.</p></header>${foundationSection(config)}${vocabularySection(config)}<section class="print-section print-page-start"><h2>Worked example</h2><p class="print-note">Study the reasoning. Cover the answer before explaining it back in your own words.</p>${guided.map(workedExample).join("") || "<p>No guided example is assigned for this day.</p>"}</section><section class="print-section print-page-start"><h2>Independent practice</h2><p class="print-note">Complete these from scratch. Write both the concrete chemistry result and the relationship that justifies it.</p>${independent.map(practiceItem).join("") || "<p>No independent items are assigned for this day.</p>"}</section><section class="print-section print-page-start"><h2>Cold transfer</h2><p class="print-note">Do not use the worked example or vocabulary definitions while completing this section.</p>${transfer.map(practiceItem).join("") || "<p>No transfer item is assigned for this day.</p>"}</section><section class="print-section print-page-start"><h2>Extra fresh practice</h2><p class="print-note">Use these only after a miss or after support. They are fresh equivalents rather than repeats of the original problem.</p>${fallback.map(practiceItem).join("") || "<p>No fallback items are assigned for this day.</p>"}</section><section class="print-section print-page-start"><h2>My review notes</h2><p>What relationship did I miss or hesitate on?</p>${lines(4)}<p>What will I do differently on the next fresh problem?</p>${lines(4)}</section></section>`;
  }

  function answerKey(config) {
    return `<section class="print-packet print-packet--key" data-print-mode="key"><header class="print-cover"><div class="print-kicker">AStarryia Chemistry Readiness</div><h1>Day ${esc(config.day)}: ${esc(config.title)}</h1><h2>Answer / Review Key</h2><p>Use this after practice for checking and targeted review. It is not a substitute for cold retrieval in the online lesson.</p></header><section class="print-section print-page-start">${(config.items || []).map(keyItem).join("")}</section></section>`;
  }

  function packetHtml(config, options) {
    return options && options.mode === "key" ? answerKey(config) : studentPacket(config);
  }

  const PRINT_CSS = `
.print-packet{display:none}
.print-tools{margin:1rem 0;padding:1rem;border:1px solid #ccd3dc;background:#f8f9fb;border-radius:.35rem}
.print-tools strong{display:block;margin-bottom:.35rem}
.print-tools p{margin:.45rem 0 0;font-size:.9rem;color:#4b5563}
@media print{
  @page{size:Letter;margin:.55in}
  body.print-student>main,body.print-key>main{display:none!important}
  body.print-student>.print-packet--student,body.print-key>.print-packet--key{display:block!important}
  .print-packet{font:11pt/1.35 Georgia,"Times New Roman",serif;color:#111;background:#fff}
  .print-cover{border-bottom:2px solid #111;padding-bottom:.18in;margin-bottom:.18in}
  .print-kicker{font:700 8.5pt/1.2 Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase}
  .print-cover h1{font:700 20pt/1.15 Arial,sans-serif;margin:.08in 0}
  .print-cover h2{font:700 14pt/1.2 Arial,sans-serif;margin:.08in 0}
  .print-name-row{display:flex;justify-content:space-between;gap:.3in;margin:.16in 0;font:10pt Arial,sans-serif}
  .print-section{margin-top:.18in}
  .print-section h2{font:700 14pt/1.2 Arial,sans-serif;margin:0 0 .1in;border-bottom:1px solid #777;padding-bottom:.05in}
  .print-section li{margin-bottom:.06in}
  .print-note{font-style:italic;margin:.05in 0 .14in}
  .print-rule-box{border:1px solid #777;padding:.12in;margin-top:.15in;break-inside:avoid}
  .print-vocab{display:grid;grid-template-columns:1fr 1fr;gap:.1in .18in}
  .print-vocab-item{border:1px solid #bbb;padding:.08in;break-inside:avoid}
  .print-vocab-item p{margin:.04in 0 0}
  .print-page-start{break-before:page}
  .print-question,.print-key-item{break-inside:avoid;border:1px solid #bbb;padding:.12in;margin:0 0 .15in}
  .print-item-head{display:flex;justify-content:space-between;gap:.15in;font:9pt Arial,sans-serif;text-transform:uppercase;letter-spacing:.03em}
  .print-prompt{font-weight:600;margin:.08in 0 .1in}
  .print-worked-answer,.print-answer{border-left:3px solid #444;padding-left:.1in;margin-top:.1in}
  .print-worked-answer p,.print-answer p{margin:.05in 0 0}
  .print-lines{margin-top:.06in}
  .print-lines div{height:.28in;border-bottom:1px solid #bbb}
}
`;

  function install(config, doc, win) {
    if (!config || !doc || doc.querySelector("[data-print-tools]")) return false;
    const style = doc.createElement("style");
    style.setAttribute("data-print-styles", "");
    style.textContent = PRINT_CSS;
    doc.head.appendChild(style);

    const toolbar = doc.createElement("div");
    toolbar.className = "print-tools";
    toolbar.setAttribute("data-print-tools", "");
    toolbar.innerHTML = `<strong>Print this day</strong><button type="button" data-print-student>Print study + practice packet</button><button type="button" data-print-key>Print answer / review key</button><p>The packet uses as many pages as the lesson needs. Website buttons, timers, and adaptive controls are left out of the printed pages.</p>`;
    const nav = doc.querySelector("nav");
    if (nav) nav.insertAdjacentElement("afterend", toolbar);
    else (doc.querySelector("main") || doc.body).prepend(toolbar);

    const holder = doc.createElement("div");
    holder.innerHTML = studentPacket(config) + answerKey(config);
    while (holder.firstElementChild) doc.body.appendChild(holder.firstElementChild);

    const print = mode => {
      doc.body.classList.remove("print-student", "print-key");
      doc.body.classList.add(mode === "key" ? "print-key" : "print-student");
      win.print();
    };
    toolbar.querySelector("[data-print-student]").addEventListener("click", () => print("student"));
    toolbar.querySelector("[data-print-key]").addEventListener("click", () => print("key"));
    if (win.addEventListener) win.addEventListener("afterprint", () => doc.body.classList.remove("print-student", "print-key"));
    return true;
  }

  function autoInstall(root) {
    const match = root.location && root.location.pathname && root.location.pathname.match(/day(\d+)/);
    if (!match) return false;
    const config = root[`Day${match[1]}Config`];
    return config ? install(config, root.document, root) : false;
  }

  return { packetHtml, printCss: PRINT_CSS, install, autoInstall };
});
