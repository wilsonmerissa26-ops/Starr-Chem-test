(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.Test1ProductionPractice=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  var TASKS=Object.freeze([
    Object.freeze({
      id:'c5-isomer-construction',
      phase:'Guided Practice',
      prompt:'Guided: C5H12 has how many constitutional isomers?',
      instruction:'Before answering, draw all three distinct C5H12 carbon skeletons. Do not count a rotated or redrawn copy as a new isomer.',
      checklist:['same molecular formula C5H12 for all drawings','three genuinely different carbon connectivities','no duplicate skeleton hidden by rotation'],
      minSegments:8
    }),
    Object.freeze({
      id:'bondline-redraw-before-name',
      phase:'Guided Practice',
      prompt:'Guided: CH3-CH2-CH(CH3)-CH2-CH3. Parent length and methyl locant?',
      instruction:'Redraw the condensed structure as a bond-line skeleton first. Then identify the longest continuous chain and the methyl locant from your own drawing.',
      checklist:['five-carbon parent chain is visible','one methyl branch is attached to carbon 3','line ends and vertices are being read as carbons'],
      minSegments:5
    }),
    Object.freeze({
      id:'newman-anti-gauche-production',
      phase:'Guided Practice',
      prompt:'Guided: rank anti and gauche from lower to higher energy.',
      instruction:'Draw both staggered butane Newman projections before ranking them: one anti with the methyl groups 180° apart and one gauche with them 60° apart.',
      checklist:['front and back carbons are shown from the C2-C3 viewing axis','both drawings are staggered','anti has 180° methyl separation; gauche has 60°'],
      minSegments:10
    }),
    Object.freeze({
      id:'newman-energy-production',
      phase:'Guided Practice',
      prompt:'Guided: rank butane anti, gauche, CH3-H eclipsed, CH3-CH3 fully eclipsed from low to high.',
      instruction:'Sketch a butane conformational-energy profile before ranking. Mark anti as the global minimum, gauche as local minima, ordinary eclipsed as maxima, and CH3-CH3 fully eclipsed as the highest maximum.',
      checklist:['anti is the lowest minimum','gauche minima are above anti','fully eclipsed CH3-CH3 is the highest point'],
      minSegments:6
    }),
    Object.freeze({
      id:'cis14-chair-production',
      phase:'Guided Practice',
      prompt:'Guided: cis-1,4-dimethylcyclohexane must have one methyl axial and one equatorial in a given chair. After a flip, how many are axial?',
      instruction:'Draw both chair conformers of cis-1,4-dimethylcyclohexane. Label each methyl axial/equatorial and up/down before answering.',
      checklist:['cis configuration stays on the same face through the flip','every axial position becomes equatorial and every equatorial becomes axial','up/down orientation is preserved for each substituent'],
      minSegments:10
    }),
    Object.freeze({
      id:'trans14-chair-production',
      phase:'Guided Practice',
      prompt:'Guided: trans-1,4-dimethylcyclohexane can have a diequatorial chair. Is diequatorial or diaxial lower in energy?',
      instruction:'Draw the diequatorial and diaxial chairs for trans-1,4-dimethylcyclohexane before choosing the lower-energy conformer.',
      checklist:['one chair is diequatorial','the ring flip gives the diaxial conformer','trans up/down relationship is unchanged by the flip'],
      minSegments:10
    })
  ]);

  function normalized(s){return String(s==null?'':s).trim().replace(/\s+/g,' ');}
  function taskFor(prompt,phase){var p=normalized(prompt),ph=normalized(phase);return TASKS.find(function(t){return p===t.prompt&&ph.indexOf(t.phase)!==-1;})||null;}
  function satisfied(task,segments){return !!task && Number(segments||0)>=task.minSegments;}

  function html(task){return '<div class="production-requirement" data-production="'+task.id+'"><div class="eyebrow">Production checkpoint · draw before answering</div><p><b>'+task.instruction+'</b></p><ul>'+task.checklist.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul><p class="small"><b>Important:</b> the browser is not pretending it can grade handwriting. The sketch is required practice; the structured chemistry answer below is what is graded. This supported drawing never becomes cold mastery evidence.</p><div class="production-status" role="status">Draw on the pad before submitting.</div></div>';}

  function ensureCanvas(container){var canvas=container.querySelector('.sketch-pad');if(canvas)return canvas;var wrap=document.createElement('div');wrap.className='sketch-wrap production-sketch';wrap.innerHTML='<div><b>Scratch drawing area</b> · Apple Pencil, finger, or mouse.</div><canvas class="sketch-pad" width="900" height="360" aria-label="Required chemistry production drawing area"></canvas><button type="button" class="ghost tiny" data-clear-sketch>Clear drawing</button>';
    var form=container.querySelector('[data-answer]');if(form)container.insertBefore(wrap,form);else container.appendChild(wrap);return wrap.querySelector('.sketch-pad');
  }

  function bindCount(canvas){if(!canvas||canvas.dataset.productionBound==='1')return;canvas.dataset.productionBound='1';canvas.dataset.productionSegments=canvas.dataset.productionSegments||'0';var drawing=false;
    canvas.addEventListener('pointerdown',function(){drawing=true;canvas.dataset.productionSegments=String(Number(canvas.dataset.productionSegments||0)+1);});
    canvas.addEventListener('pointermove',function(){if(drawing)canvas.dataset.productionSegments=String(Number(canvas.dataset.productionSegments||0)+1);});
    ['pointerup','pointercancel','pointerleave'].forEach(function(ev){canvas.addEventListener(ev,function(){drawing=false;});});
  }

  function apply(){if(typeof document==='undefined')return;var host=document.querySelector('[data-t1-host]');if(!host)return;var prompt=host.querySelector('.prompt'),label=document.getElementById('phaseLabel');if(!prompt||!label)return;var task=taskFor(prompt.textContent,label.textContent);var old=host.querySelector('.production-requirement');if(!task){if(old)old.remove();return;}if(!old||old.dataset.production!==task.id){if(old)old.remove();prompt.insertAdjacentHTML('beforebegin',html(task));}
    var canvas=ensureCanvas(host);bindCount(canvas);var clear=host.querySelector('[data-clear-sketch]');if(clear&&clear.dataset.productionBound!=='1'){clear.dataset.productionBound='1';clear.addEventListener('click',function(){canvas.dataset.productionSegments='0';var st=host.querySelector('.production-status');if(st)st.textContent='Drawing cleared. Draw the required structure before submitting.';});}
  }

  if(typeof document!=='undefined'){
    document.addEventListener('submit',function(e){var form=e.target;if(!form||!form.matches||!form.matches('form[data-answer]'))return;var host=form.closest('[data-t1-host]');if(!host)return;var box=host.querySelector('.production-requirement');if(!box)return;var task=TASKS.find(function(t){return t.id===box.dataset.production;});var canvas=host.querySelector('.sketch-pad'),segments=canvas?Number(canvas.dataset.productionSegments||0):0;if(!satisfied(task,segments)){e.preventDefault();e.stopImmediatePropagation();var st=box.querySelector('.production-status');if(st)st.textContent='Draw the required structure first. This checkpoint prevents recognition-only practice from replacing production practice.';}
    },true);
    var observer=new MutationObserver(function(){apply();});observer.observe(document.documentElement,{childList:true,subtree:true});
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else setTimeout(apply,0);
  }

  return Object.freeze({TASKS:TASKS,taskFor:taskFor,satisfied:satisfied});
});
