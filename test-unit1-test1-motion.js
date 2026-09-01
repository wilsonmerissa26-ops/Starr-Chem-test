"use strict";
const assert=require('assert');
const {JSDOM}=require('jsdom');
const M=require('./course-units/unit1/test1/test1-motion.js');
let passed=0;
function ok(name,cond){assert.ok(cond,name);console.log('PASS  '+name);passed++;}
function text(root,sel){const el=root.querySelector(sel);return el?el.textContent:'';}
function click(root,sel){const el=root.querySelector(sel);assert.ok(el,'missing '+sel);el.dispatchEvent(new root.ownerDocument.defaultView.MouseEvent('click',{bubbles:true}));}
function mount(id){const dom=new JSDOM('<!doctype html><html><body><div id="x">'+M.render(id)+'</div></body></html>');const root=dom.window.document.querySelector('#x');M.bind(root,id);return root;}
ok('motion is limited to Watch and Build Together',M.phaseEligible('Watch · I Do')&&M.phaseEligible('Build Together · We Do')&&!M.phaseEligible('Guided Practice')&&!M.phaseEligible('Cold Independent')&&!M.phaseEligible('Later Retrieval · Cold'));
ok('unsupported lessons do not get decorative motion',M.render('relationships')==='');
let h=mount('hybridization');click(h,'[data-hybrid-btn="3"]');ok('hybridization motion maps three domains to sp2',/3 domains.*sp².*trigonal planar/i.test(text(h,'[data-hybrid-readout]')));click(h,'[data-hybrid-btn="2"]');ok('hybridization motion maps two domains to linear sp',/2 domains.*sp.*linear.*180/i.test(text(h,'[data-hybrid-readout]')));
let ir=mount('functional-ir');click(ir,'[data-ir-btn="ketone"]');ok('IR motion distinguishes ketone carbonyl without broad OH',/ketone.*strong c=o.*no broad o–h/i.test(text(ir,'[data-ir-readout]')));click(ir,'[data-ir-btn="acid"]');ok('IR motion combines broad OH and carbonyl for acid',/carboxylic acid.*very broad o–h.*strong c=o/i.test(text(ir,'[data-ir-readout]')));
let nm=mount('nomenclature');for(let i=0;i<5;i++)click(nm,'[data-chain-next]');ok('bond-line motion builds parent path before branch',/parent chain is visible.*after that identify branches/i.test(text(nm,'[data-chain-readout]')));click(nm,'[data-chain-next]');ok('bond-line motion reveals branch only after parent path',/parent chain first, branch second/i.test(text(nm,'[data-chain-readout]')));
let nw=mount('newman-energy');click(nw,'[data-newman-next]');ok('Newman rotation reaches 60-degree gauche state',/60°.*gauche.*local minimum/i.test(text(nw,'[data-newman-readout]')));click(nw,'[data-newman-next]');click(nw,'[data-newman-next]');ok('Newman rotation reaches 180-degree anti global minimum',/180°.*anti.*global minimum/i.test(text(nw,'[data-newman-readout]')));
let ch=mount('cyclohexane-chairs');click(ch,'[data-chair-flip]');ok('chair flip changes axial to equatorial while preserving UP',/equatorial up.*up did not/i.test(text(ch,'[data-chair-readout]')));
let im=mount('imf-boiling');click(im,'[data-force-next]');ok('IMF motion adds dipole-dipole only after dispersion',/polar.*dipole/i.test(text(im,'[data-force-readout]')));click(im,'[data-force-next]');ok('IMF motion teaches donor requirement before hydrogen bonding',/donor.*hydrogen bonding/i.test(text(im,'[data-force-readout]')));
let rs=mount('ring-strain');ok('ring-strain starts from the approximately 109.5-degree sp3 preference',/109\.5/i.test(text(rs,'[data-strain-readout]')));click(rs,'[data-strain-toggle]');ok('ring-strain motion connects approximately 60-degree cyclopropane to angle strain',/60°.*angle strain/i.test(text(rs,'[data-strain-readout]')));
const dom=new JSDOM('<!doctype html><html><head></head><body><aside><article class="skill-card selected"><button data-open="newman-energy"></button></article></aside><section data-t1-host><section class="lesson-shell"><span id="phaseLabel">Cold Independent</span><div class="teacher"></div></section></section></body></html>',{url:'https://example.test/?skill=newman-energy'});
M.boot(dom.window.document);ok('boot does not inject teaching motion into Cold Independent',!dom.window.document.querySelector('[data-motion-card]'));
dom.window.document.querySelector('#phaseLabel').textContent='Watch · I Do';M.boot(dom.window.document);ok('boot injects motion into Watch',!!dom.window.document.querySelector('[data-motion-card]'));
console.log('\n'+passed+' Test 1 teaching-motion assertions passed.');
