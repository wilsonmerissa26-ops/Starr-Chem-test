(function(){
'use strict';
var active=false;
var root=null;
var KEY='astarryia-chemistry-interactive-v1';
var state=load();
var drag=null;
function load(){try{return Object.assign({mode:'watch',watchStep:0,buildStep:0,atoms:[],bonds:[],lonePair:false},JSON.parse(localStorage.getItem(KEY)||'{}'));}catch(e){return {mode:'watch',watchStep:0,buildStep:0,atoms:[],bonds:[],lonePair:false};}}
function save(){localStorage.setItem(KEY,JSON.stringify(state));}
function esc(x){return String(x==null?'':x).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m];});}
function teacher(t){return '<div class="teacher"><div class="avatar">DM</div><div class="bubble">'+t+'</div></div>';}
function path(stage){var a=['Teach','Watch','Do It With Me','Guided Practice','Try It Alone','Fresh Check'];return '<div class="path">'+a.map(function(x){return '<span class="'+(x===stage?'on':'')+'">'+x+'</span>';}).join('')+'</div>';}
function counter(used){return '<div class="counter"><span><b>'+used+'</b> placed</span><span><b>'+(8-used)+'</b> remaining</span></div>';}
function open(){active=true;root=document.getElementById('screen');document.getElementById('where').textContent='Chemistry Foundation';if(!state.mode)state.mode='watch';render();}
function close(){active=false;drag=null;}
function backHome(){close();if(window.ClassroomV2&&window.ClassroomV2.goHome)window.ClassroomV2.goHome();}
function reset(){state={mode:'watch',watchStep:0,buildStep:0,atoms:[],bonds:[],lonePair:false};save();render();}
var watch=[
 {say:'Start with an empty stage. Nothing is already built for you. Nitrogen contributes five valence electrons.',used:0,scene:0},
 {say:'Nitrogen appears first. I am placing it in the center because it will connect to all three hydrogens.',used:0,scene:1},
 {say:'Now the three hydrogens enter. Each hydrogen brings one valence electron, so the molecule has eight total.',used:0,scene:2},
 {say:'First bond forms. A bond is a shared pair, so two electrons are now placed and six remain.',used:2,scene:3},
 {say:'Second N-H bond forms. Four electrons are placed; four remain.',used:4,scene:4},
 {say:'Third N-H bond forms. Six electrons are in bonds; two remain.',used:6,scene:5},
 {say:'Those final two electrons become one lone pair on nitrogen. Now all eight electrons are accounted for.',used:8,scene:6}
];
function watchHTML(){var w=watch[state.watchStep];return '<div class="eyebrow">NH₃ · WATCH</div><h1>Watch the molecule actually build.</h1>'+path('Watch')+teacher(w.say)+'<div class="demo"><div id="chem-watch-stage" class="chem-stage" aria-label="animated molecule demonstration"></div>'+counter(w.used)+'<div class="stepcount">Step '+(state.watchStep+1)+' of '+watch.length+'</div></div><div class="choices"><button class="secondary" onclick="ChemInteractive.watchBack()" '+(state.watchStep===0?'disabled':'')+'>Back</button><button class="secondary" onclick="ChemInteractive.replayWatch()">Replay this step</button></div><button onclick="ChemInteractive.watchNext()">'+(state.watchStep<watch.length-1?'Animate next step':'Now I build it')+'</button><button class="linkish" onclick="ChemInteractive.backHome()">Classroom menu</button>';
}
function watchScene(step,replay){var s=document.getElementById('chem-watch-stage');if(!s)return;s.innerHTML='<div class="chem-center"></div>';
 var items=[];
 if(step>=1)items.push(atomHTML('N','wn',50,50,'watch-atom'));
 if(step>=2){items.push(atomHTML('H','wh1',50,15,'watch-atom'));items.push(atomHTML('H','wh2',18,68,'watch-atom'));items.push(atomHTML('H','wh3',82,68,'watch-atom'));}
 s.insertAdjacentHTML('beforeend',items.join(''));
 if(step>=3)s.insertAdjacentHTML('beforeend',bondHTML(50,50,50,20,'wb1'));
 if(step>=4)s.insertAdjacentHTML('beforeend',bondHTML(48,53,23,66,'wb2'));
 if(step>=5)s.insertAdjacentHTML('beforeend',bondHTML(52,53,77,66,'wb3'));
 if(step>=6)s.insertAdjacentHTML('beforeend','<div class="chem-pair" style="left:50%;top:32%">••</div>');
 requestAnimationFrame(function(){Array.prototype.forEach.call(s.querySelectorAll('.watch-atom,.chem-bond,.chem-pair'),function(el){el.classList.add('shown');});});
}
function watchNext(){if(state.watchStep<watch.length-1){state.watchStep++;save();render();}else{state.mode='together';state.buildStep=0;state.atoms=[];state.bonds=[];state.lonePair=false;save();render();}}
function watchBack(){if(state.watchStep>0){state.watchStep--;save();render();}}
function replayWatch(){var s=document.getElementById('chem-watch-stage');if(s){s.innerHTML='';setTimeout(function(){watchScene(watch[state.watchStep].scene,true);},120);}}
function atomHTML(el,id,x,y,extra){return '<div class="chem-atom '+(extra||'')+'" data-id="'+id+'" data-el="'+el+'" style="left:'+x+'%;top:'+y+'%">'+el+'</div>';}
function bondHTML(x1,y1,x2,y2,id){var dx=x2-x1,dy=y2-y1;var len=Math.sqrt(dx*dx+dy*dy);var angle=Math.atan2(dy,dx)*180/Math.PI;return '<div class="chem-bond" id="'+id+'" style="left:'+x1+'%;top:'+y1+'%;width:'+len+'%;transform:rotate('+angle+'deg)"></div>';}
function buildPrompt(){var prompts=[
 'Drag the N token into the center target.',
 'Drag one H into the stage above nitrogen.',
 'Drag a second H into the lower-left area.',
 'Drag the third H into the lower-right area.',
 'Drag the top H close enough to N to form the first bond.',
 'Drag the lower-left H close enough to N to form the second bond.',
 'Drag the lower-right H close enough to N to form the third bond.',
 'Choose the lone-pair tool, then tap nitrogen to place the final two electrons.'
 ];return prompts[Math.min(state.buildStep,prompts.length-1)];}
function buildHTML(){return '<div class="eyebrow">NH₃ · BUILD TOGETHER</div><h1>You do the moves now.</h1>'+path('Do It With Me')+teacher('<b>'+buildPrompt()+'</b><br>I will watch what you actually place. There is no “I did it” button.')+'<div class="chem-palette"><div class="chem-token" data-palette="N">N</div><div class="chem-token" data-palette="H">H</div><div class="chem-token" data-palette="H">H</div><div class="chem-token" data-palette="H">H</div><button id="pair-tool" class="secondary" onclick="ChemInteractive.armPair()">Lone pair ••</button></div><div id="chem-build-stage" class="chem-stage build"><div class="chem-center">CENTER</div></div><div id="chem-feedback" class="info">Move the atom yourself. I will check the stage after you release it.</div><button class="secondary" onclick="ChemInteractive.showBuildHelp()">I don't understand this step</button><button class="linkish" onclick="ChemInteractive.backHome()">Classroom menu</button>';
}
function drawBuild(){var s=document.getElementById('chem-build-stage');if(!s)return;var center=s.querySelector('.chem-center');s.innerHTML='';if(center)s.appendChild(center);state.bonds.forEach(function(b){var a=getAtom(b[0]),c=getAtom(b[1]);if(a&&c)s.insertAdjacentHTML('beforeend',bondHTML(a.x,a.y,c.x,c.y,'build-bond'));});state.atoms.forEach(function(a){s.insertAdjacentHTML('beforeend',atomHTML(a.el,a.id,a.x,a.y,'draggable'));});if(state.lonePair){var n=getAtom('n1');if(n)s.insertAdjacentHTML('beforeend','<div class="chem-pair shown" style="left:'+n.x+'%;top:'+(n.y-14)+'%">••</div>');}bindStageAtoms();}
function getAtom(id){return state.atoms.find(function(a){return a.id===id;});}
function countEl(el){return state.atoms.filter(function(a){return a.el===el;}).length;}
function nextId(el){return el.toLowerCase()+(countEl(el)+1);}
function stageRect(){return document.getElementById('chem-build-stage').getBoundingClientRect();}
function pctFromEvent(e){var r=stageRect();return {x:Math.max(5,Math.min(95,(e.clientX-r.left)/r.width*100)),y:Math.max(8,Math.min(92,(e.clientY-r.top)/r.height*100))};}
function distance(a,b){var dx=a.x-b.x,dy=a.y-b.y;return Math.sqrt(dx*dx+dy*dy);}
function message(t,good){var f=document.getElementById('chem-feedback');if(f){f.className=good?'good':'info';f.innerHTML=t;}}
function paletteDown(e){var p=e.target.closest('.chem-token');if(!p||!active||state.mode!=='together')return;drag={fromPalette:true,el:p.getAttribute('data-palette'),id:null};e.preventDefault();}
function atomDown(e){var a=e.target.closest('.chem-atom.draggable');if(!a)return;drag={fromPalette:false,el:a.getAttribute('data-el'),id:a.getAttribute('data-id')};e.preventDefault();}
function pointerUp(e){if(!drag||!active||state.mode!=='together')return;var s=document.getElementById('chem-build-stage'),r=s&&s.getBoundingClientRect();if(!r||e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom){drag=null;return;}var pos=pctFromEvent(e);if(drag.fromPalette){tryPlaceNew(drag.el,pos);}else{moveAtom(drag.id,pos);}drag=null;save();drawBuild();}
function tryPlaceNew(el,pos){var step=state.buildStep;if(step===0){if(el!=='N'){message('Look at the formula NH₃. The first atom I asked for is N. Try the nitrogen token.',false);return;}if(distance(pos,{x:50,y:50})>18){message('You chose nitrogen correctly. Now place it inside the center target so it can connect to three hydrogens.',false);return;}state.atoms.push({id:'n1',el:'N',x:50,y:50});state.buildStep=1;message('Yes. Nitrogen is centered. Now you will place the hydrogens.',true);return;}
 if(step>=1&&step<=3){if(el!=='H'){message('This step asks for hydrogen. Use an H token.',false);return;}var targets=[null,{x:50,y:15},{x:18,y:68},{x:82,y:68}],t=targets[step];state.atoms.push({id:nextId('H'),el:'H',x:t.x,y:t.y});state.buildStep++;message('Good placement. Notice the stage is still yours to build.',true);return;}
 message('All required atoms are already on the stage. Move the existing H atoms to make bonds rather than adding more atoms.',false);
}
function moveAtom(id,pos){var a=getAtom(id);if(!a)return;a.x=pos.x;a.y=pos.y;var n=getAtom('n1');if(a.el==='H'&&n&&state.buildStep>=4&&state.buildStep<=6&&distance(a,n)<30){var exists=state.bonds.some(function(b){return b.indexOf(id)>=0;});if(!exists){state.bonds.push(['n1',id]);state.buildStep++;message('Bond formed. That shared line represents two electrons.',true);}}
}
function armPair(){if(state.buildStep!==7){message('The lone pair comes after all three N-H bonds are built. Finish the current step first.',false);return;}window.ChemInteractive.pairArmed=true;message('Lone-pair tool is ready. Tap nitrogen.',false);}
function atomClick(e){if(!window.ChemInteractive.pairArmed||state.buildStep!==7)return;var a=e.target.closest('.chem-atom.draggable');if(!a)return;if(a.getAttribute('data-el')!=='N'){message('Those last two electrons belong on nitrogen here. Tap N.',false);return;}state.lonePair=true;state.buildStep=8;window.ChemInteractive.pairArmed=false;save();drawBuild();message('<b>You built NH₃ yourself.</b> Three bonds use six electrons and the lone pair uses the final two. Now we can move to a new molecule with less help.',true);setTimeout(function(){state.mode='complete';save();render();},1400);}
function bindStageAtoms(){var s=document.getElementById('chem-build-stage');if(!s)return;s.querySelectorAll('.chem-atom.draggable').forEach(function(a){a.addEventListener('pointerdown',atomDown);a.addEventListener('click',atomClick);});}
function showBuildHelp(){var step=state.buildStep;var helps=[
 'Nitrogen is the only N in NH₃. It becomes the central atom because all three H atoms need to connect to it.',
 'Hydrogen can make only one bond. Put the first H above N so there is room for the others.',
 'Place another H on a different side. The exact angle is not the chemistry target; the connection is.',
 'Place the last H on the open side.',
 'A bond means the two atoms share two electrons. Drag that H close to N and the stage will create the bond when they are close enough.',
 'Same idea again: drag the unbonded H close to N.',
 'One H is still unbonded. Bring it close to N.',
 'After three bonds, six of eight electrons are used. The final two stay together as a lone pair on N.'
 ];message('<b>Let’s break only this step down.</b><br>'+helps[Math.min(step,helps.length-1)],false);}
function completeHTML(){return '<div class="eyebrow">NH₃ · BUILD TOGETHER COMPLETE</div><h1>You actually built it.</h1>'+teacher('This time the stage started empty and I verified your actions instead of asking you to tell me you did them. Next, Guided Practice will use a different molecule and less help.')+'<button onclick="ChemInteractive.reset()">Replay NH₃ teaching</button><button class="secondary" onclick="ChemInteractive.backHome()">Classroom menu</button>';}
function render(){if(!active)return;root=document.getElementById('screen');if(state.mode==='watch')root.innerHTML=watchHTML();else if(state.mode==='together')root.innerHTML=buildHTML();else root.innerHTML=completeHTML();if(state.mode==='watch')watchScene(watch[state.watchStep].scene);if(state.mode==='together'){drawBuild();document.querySelectorAll('.chem-token').forEach(function(p){p.addEventListener('pointerdown',paletteDown);});}}
document.addEventListener('pointerup',pointerUp,true);
document.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var oc=b.getAttribute('onclick')||'';if(oc.indexOf("openLane('chem')")>=0||/chemistry/i.test(b.textContent)&&oc.indexOf('openLane')>=0){e.preventDefault();e.stopImmediatePropagation();open();return;}if(active&&/Classroom/.test(b.textContent)&&oc.indexOf('goHome')>=0){e.preventDefault();e.stopImmediatePropagation();backHome();}},true);
window.ChemInteractive={open:open,backHome:backHome,reset:reset,watchNext:watchNext,watchBack:watchBack,replayWatch:replayWatch,armPair:armPair,showBuildHelp:showBuildHelp,pairArmed:false};
})();