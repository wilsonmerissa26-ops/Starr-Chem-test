/* U1-01 Slice 10 learner-facing pentane Build Together UI. */
(function () {
  "use strict";

  var Adapter = globalThis.BondLineBuildTogether;
  if (!Adapter) throw new Error("BondLineBuildTogether is required");

  var panel = document.getElementById("lessonPanel");
  var phaseLabel = document.getElementById("phaseLabel");
  var status = document.getElementById("statusText");
  var controls = document.getElementById("watchControls");
  var live = document.getElementById("liveRegion");
  var state = null;
  var points = [];
  var formulaSupportActive = false;

  var style = document.createElement("style");
  style.textContent = ".build-formula{font-size:clamp(1.25rem,4vw,2rem);font-weight:900;letter-spacing:.04em;text-align:center;padding:18px;border:1px solid var(--line);border-radius:18px;background:#fcfaff;margin:16px 0}.build-formula-tokens{display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin:12px 0}.build-formula-token{border:1px solid var(--line);background:#fff;border-radius:12px;padding:8px 10px;font-weight:900;cursor:pointer}.build-formula-token.selected{background:var(--good-bg);border-color:var(--good)}.build-canvas-wrap{border:1px solid var(--line);border-radius:20px;background:#fdfbff;overflow:hidden;margin:16px 0}.build-canvas{display:block;width:100%;min-height:300px;touch-action:manipulation}.build-segment{stroke:#312838;stroke-width:7;stroke-linecap:round}.build-carbon-hit{fill:#fff;fill-opacity:.01;stroke:transparent;stroke-width:3}.build-carbon-hit.selected{fill:var(--good-bg);fill-opacity:.9;stroke:var(--good)}.build-temp-number{font-size:18px;font-weight:900;fill:var(--purple);pointer-events:none;animation:buildTempNumber 1s ease forwards}@keyframes buildTempNumber{0%,70%{opacity:1}100%{opacity:0}}@media(prefers-reduced-motion:reduce){.build-temp-number{animation:none;opacity:0}}";
  document.head.appendChild(style);

  function announce(text) { if (live) live.textContent = text || ""; }
  function teacher(text) { return '<div class="teacher"><div class="teacher-avatar" aria-hidden="true">DM</div><div><div class="teacher-name">Dr. Merissa</div><p>' + text + '</p></div></div>'; }
  function setBuildShell(step, copy) {
    controls.hidden = true;
    phaseLabel.textContent = "Build Together · We Do · " + step;
    status.textContent = copy;
  }
  function button(label, value) { return '<button type="button" class="choice-btn" data-build-choice="' + value + '">' + label + '</button>'; }

  function renderCount() {
    setBuildShell("1 of 6", "You make the decision. I guide only if you need it.");
    panel.innerHTML = '<h1>Build pentane from scratch</h1>' + teacher("Now we are going to build the shortcut ourselves. I will guide the decisions, but you will make them.") + '<div class="build-formula">CH3CH2CH2CH2CH3</div><div class="prompt-card"><div class="eyebrow">Build step 1</div><h2>How many carbon atoms are in this formula?</h2></div><div class="choice-grid">' + [3,4,5,6].map(function(n){return button(String(n),String(n));}).join("") + '</div>' + (formulaSupportActive ? '<div class="prompt-card"><div class="eyebrow">Count them instead of guessing</div><p>Tap each C once.</p><div class="build-formula-tokens">' + [1,2,3,4,5].map(function(n){return '<button type="button" class="build-formula-token' + (state.formulaSupportTaps.indexOf("C"+n)!==-1?' selected':'') + '" data-formula-carbon="C'+n+'">C<span class="muted">'+(n===1||n===5?'H3':'H2')+'</span></button>';}).join("") + '</div></div>' : '');
    panel.querySelectorAll("[data-build-choice]").forEach(function(b){b.addEventListener("click",function(){var result=Adapter.submitCarbonCount(state,b.getAttribute("data-build-choice"));announce(result.feedback);if(!result.correct){formulaSupportActive=true;renderCount();return;}formulaSupportActive=false;renderConnectivity();});});
    panel.querySelectorAll("[data-formula-carbon]").forEach(function(b){b.addEventListener("click",function(){var result=Adapter.tapFormulaCarbon(state,b.getAttribute("data-formula-carbon"));if(result.accepted)b.classList.add("selected");status.textContent=result.complete?"You found all five carbon positions. Choose 5 above.":(result.count||state.formulaSupportTaps.length)+" of 5 carbons counted.";});});
  }

  function renderConnectivity() {
    setBuildShell("2 of 6", "Read the condensed formula for connectivity before drawing.");
    panel.innerHTML = '<h1>What shape of carbon skeleton is encoded?</h1><div class="build-formula">CH3CH2CH2CH2CH3</div><div class="prompt-card"><div class="eyebrow">Build step 2</div><h2>Are these five carbons connected as one continuous chain or is a branch shown in this condensed formula?</h2></div><div class="choice-grid">' + button("One continuous chain","continuous_chain") + button("A branched chain","branched_chain") + '</div>';
    panel.querySelectorAll("[data-build-choice]").forEach(function(b){b.addEventListener("click",function(){var result=Adapter.submitConnectivity(state,b.getAttribute("data-build-choice"));announce(result.feedback);if(result.correct){points=[];renderDraw();}else status.textContent=result.feedback;});});
  }

  function svgMarkup(selfCheck) {
    var svg = '<svg class="build-canvas" data-build-canvas viewBox="0 0 600 300" role="group" aria-label="Blank pentane bond-line workspace">';
    for (var i=1;i<points.length;i++) {
      var a=points[i-1],b=points[i];
      svg += '<line class="build-segment" data-build-segment data-segment-id="BOND_'+i+'" x1="'+a.x+'" y1="'+a.y+'" x2="'+b.x+'" y2="'+b.y+'"' + (selfCheck?' style="cursor:pointer;pointer-events:stroke"':'') + '></line>';
    }
    points.forEach(function(p,index){
      svg += '<g data-build-carbon="C'+(index+1)+'"' + (selfCheck?' role="button" tabindex="0" style="cursor:pointer"':'') + '><circle class="build-carbon-hit" cx="'+p.x+'" cy="'+p.y+'" r="18"></circle><text class="build-temp-number" x="'+(p.x+10)+'" y="'+(p.y-12)+'">'+(index+1)+'</text></g>';
    });
    return svg + '</svg>';
  }

  function eventPoint(svg,event) {
    var rect=svg.getBoundingClientRect();
    var x,y;
    if(rect.width>0&&rect.height>0&&event.clientX>=rect.left&&event.clientY>=rect.top){x=(event.clientX-rect.left)/rect.width*600;y=(event.clientY-rect.top)/rect.height*300;}
    else{x=Number(event.offsetX);y=Number(event.offsetY);}
    if(!Number.isFinite(x))x=100;if(!Number.isFinite(y))y=150;
    return {x:Math.max(35,Math.min(565,x)),y:Math.max(35,Math.min(265,y))};
  }

  function renderDraw() {
    setBuildShell("3-4 of 6", points.length<2?"Start with two carbon positions and the bond between them.":"Keep extending the same continuous chain.");
    var stepNumber=Math.min(4,Math.max(1,points.length));
    var prompt=points.length===0?"Tap the first carbon position on the blank workspace.":points.length===1?"Tap a second point to create the first bond segment.":"Tap one new point to add bond segment "+points.length+" of 4.";
    panel.innerHTML = '<h1>You draw the carbon skeleton</h1><div class="build-formula">CH3CH2CH2CH2CH3</div>' + teacher(points.length<2?"One bond connects carbon 1 to carbon 2. Remember: the line is the bond. The two positions at its ends are the carbons.":"Keep the connectivity continuous. Every new segment adds one new carbon position at the end of the chain.") + '<div class="prompt-card"><div class="eyebrow">Build step '+stepNumber+'</div><h2>'+prompt+'</h2></div><div class="build-canvas-wrap">'+svgMarkup(false)+'</div><p class="support-note">Nothing was carried over from Watch. This workspace started empty.</p>';
    var svg=panel.querySelector("[data-build-canvas]");
    svg.addEventListener("click",function(event){
      if(event.target.closest&&event.target.closest("[data-build-carbon],[data-build-segment]"))return;
      var p=eventPoint(svg,event);
      if(points.length){var prev=points[points.length-1],dx=p.x-prev.x,dy=p.y-prev.y;if(Math.sqrt(dx*dx+dy*dy)<45){status.textContent="Give the next carbon position a little more space before placing it.";return;}}
      if(points.length===0){points.push(p);status.textContent="First carbon position placed. Tap a second point to make the first bond.";renderDraw();return;}
      var nextId="C"+(points.length+1),previousId="C"+points.length;
      var result=Adapter.submitSegment(state,[previousId,nextId]);
      if(!result.correct){status.textContent=result.feedback||"That segment does not preserve the required connectivity.";announce(status.textContent);return;}
      points.push(p);announce(result.confirmation||"Segment added.");
      if(state.phase==="self_check")renderSelfCheck();else renderDraw();
    });
  }

  function renderSelfCheck() {
    setBuildShell("5 of 6", "Check the carbon positions you actually created.");
    panel.innerHTML = '<h1>Count the carbons in your own drawing</h1><div class="prompt-card"><div class="eyebrow">Build step 5</div><h2>Tap the five carbon positions you created.</h2><p>Bond centers do not count as carbon positions.</p></div><div class="build-canvas-wrap">'+svgMarkup(true)+'</div>';
    panel.querySelectorAll("[data-build-segment]").forEach(function(line){line.addEventListener("click",function(event){event.stopPropagation();var result=Adapter.tapSelfCheckCarbon(state,line.getAttribute("data-segment-id"));status.textContent=result.feedback||"That is a bond, not a carbon position.";announce(status.textContent);});});
    panel.querySelectorAll("[data-build-carbon]").forEach(function(node){function choose(event){event.stopPropagation();var result=Adapter.tapSelfCheckCarbon(state,node.getAttribute("data-build-carbon"));if(result.accepted){node.querySelector("circle").classList.add("selected");status.textContent=result.feedback;}if(result.complete)renderHydrogen();}node.addEventListener("click",choose);node.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();choose(e);}});});
  }

  function renderHydrogen() {
    setBuildShell("6 of 6", "Recover one hidden hydrogen count from the structure you built.");
    panel.innerHTML = '<h1>Recover what the shortcut hides</h1><div class="build-canvas-wrap">'+svgMarkup(false)+'</div><div class="prompt-card"><div class="eyebrow">Build step 6</div><h2>This middle carbon has two visible single bonds. How many hydrogens are implied?</h2></div><div class="choice-grid">' + [0,1,2,3,4].map(function(n){return button(String(n),String(n));}).join("") + '</div>';
    panel.querySelectorAll("[data-build-choice]").forEach(function(b){b.addEventListener("click",function(){var result=Adapter.submitMiddleHydrogen(state,b.getAttribute("data-build-choice"));announce(result.feedback);if(result.correct)renderComplete();else status.textContent=result.feedback;});});
  }

  function renderComplete() {
    controls.hidden = false;
    Array.prototype.forEach.call(controls.querySelectorAll("button"),function(b){b.hidden=false;b.disabled=true;});
    var nextBtn=document.getElementById("nextBtn");
    var guidedReady=!!(globalThis.BondLineGuidedUI&&typeof globalThis.BondLineGuidedUI.start==="function");
    nextBtn.textContent=guidedReady?"Start Guided Practice":"Guided practice next";
    nextBtn.disabled=!guidedReady;
    phaseLabel.textContent="Build Together · complete";
    status.textContent="Supported Build Together success. This is not independent or mastery evidence.";
    panel.innerHTML = '<h1>You built the shortcut yourself.</h1>' + teacher("You just built a bond-line structure from a condensed formula. The important move was not drawing a zig-zag. It was preserving the carbon connectivity while removing labels the notation allows us to omit.") + '<div class="success-box">BUILD_TOGETHER_SUCCESS recorded as supported practice only. Next comes Guided Practice with 2-methylbutane.</div>';
    if(guidedReady){
      nextBtn.addEventListener("click",function launchGuided(event){event.preventDefault();event.stopImmediatePropagation();nextBtn.removeEventListener("click",launchGuided,true);globalThis.BondLineGuidedUI.start();},true);
    }
    announce("Build Together complete. Guided Practice is next.");
  }

  function start() {
    state=Adapter.createSession();points=[];formulaSupportActive=false;renderCount();
  }

  globalThis.BondLineBuildTogetherUI=Object.freeze({start:start});
})();