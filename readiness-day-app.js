(function () {
  "use strict";
  const match = location.pathname.match(/day(\d+)/); if (!match) return;
  const config = globalThis[`Day${match[1]}Config`]; if (!config || !globalThis.ReadinessDayEngine) return;
  const session = ReadinessDayEngine.Session.restore(config, localStorage.getItem(config.storageKey));
  let index = 0; const answer = document.querySelector("textarea"); const output = document.createElement("div");
  output.setAttribute("role", "status"); answer.after(output);
  const item = () => config.items[Math.min(index, config.items.length - 1)];
  function save() { localStorage.setItem(config.storageKey, session.serialize()); }
  function show(value) { output.textContent = typeof value === "string" ? value : value.teaching || value.feedback || (value.correct ? `Recorded as ${value.status}.` : "Try again."); save(); }
  document.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
    const label = button.textContent.trim().toLowerCase();
    if (label === "check") { const result = session.submit(answer.value, item()); show(result); if (result.correct) { index++; if (index < config.items.length) session.fresh(item()); else show(`Day status: ${session.finish()}. Practice has stopped.`); } }
    else if (label === "i do not know yet") show(session.submit("I do not know yet", item()));
    else show(session.requestHelp(label === "first step" ? "firstStep" : label));
  }));
})();
