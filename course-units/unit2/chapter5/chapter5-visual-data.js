(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.Chapter5VisualData=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';

function freeze(x){return Object.freeze(x);}
function visual(x){x.labels=freeze(x.labels||[]);x.groups=freeze(x.groups||[]);return freeze(x);}

var VISUALS=Object.freeze({
  'isomer-connectivity-compare-a':visual({
    id:'isomer-connectivity-compare-a',kind:'connectivity-compare',skill:'isomer-classification',
    title:'Trace connectivity before naming the relationship',
    left:{name:'1-bromopropane',connectivity:['C1-C2','C2-C3','C1-Br']},
    right:{name:'2-bromopropane',connectivity:['C1-C2','C2-C3','C2-Br']},
    expected:{connectivitySame:false,relationship:'constitutional isomers'},
    labels:['C1','C2','C3','Br'],groups:[]
  }),
  'stereocenter-wedge-a':visual({
    id:'stereocenter-wedge-a',kind:'wedge-dash-center',skill:'chirality-stereocenters',
    title:'Four different paths around carbon 2',center:'C2',
    groups:[
      {label:'OH',bond:'wedge',pathKey:'OH'},
      {label:'H',bond:'dash',pathKey:'H'},
      {label:'CH3',bond:'line',pathKey:'CH3'},
      {label:'CH2CH3',bond:'line',pathKey:'CH2CH3'}
    ],
    expected:{stereocenter:true,fourDifferent:true},labels:['C2','OH','H','CH3','CH2CH3']
  }),
  'cip-ranking-a':visual({
    id:'cip-ranking-a',kind:'priority-sort',skill:'cip-rs',
    title:'Rank the groups touching the stereocenter first',
    groups:[
      {label:'Br',directAtom:'Br',priority:1},
      {label:'OH',directAtom:'O',priority:2},
      {label:'CH3',directAtom:'C',priority:3},
      {label:'H',directAtom:'H',priority:4}
    ],
    expected:{order:['Br','OH','CH3','H']},labels:['1','2','3','4']
  }),
  'rs-counterclockwise-4-away':visual({
    id:'rs-counterclockwise-4-away',kind:'rs-orientation',skill:'cip-rs',
    title:'Read 1 to 2 to 3 with priority 4 away',groups:[
      {label:'1',priority:1,bond:'line'},
      {label:'2',priority:2,bond:'line'},
      {label:'3',priority:3,bond:'wedge'},
      {label:'4',priority:4,bond:'dash'}
    ],expected:{priority4Direction:'away',path:'counterclockwise',configuration:'S'},labels:['1','2','3','4']
  }),
  'rs-visual-a-clockwise-4-away':visual({
    id:'rs-visual-a-clockwise-4-away',kind:'rs-orientation',skill:'cip-rs',
    title:'Clockwise with priority 4 away',groups:[
      {label:'1',priority:1,bond:'line'},{label:'2',priority:2,bond:'wedge'},{label:'3',priority:3,bond:'line'},{label:'4',priority:4,bond:'dash'}
    ],expected:{priority4Direction:'away',path:'clockwise',configuration:'R'},labels:['1','2','3','4']
  }),
  'rs-visual-b-counterclockwise-4-toward':visual({
    id:'rs-visual-b-counterclockwise-4-toward',kind:'rs-orientation',skill:'cip-rs',
    title:'Counterclockwise appearance with priority 4 toward',groups:[
      {label:'1',priority:1,bond:'line'},{label:'2',priority:2,bond:'line'},{label:'3',priority:3,bond:'dash'},{label:'4',priority:4,bond:'wedge'}
    ],expected:{priority4Direction:'toward',path:'counterclockwise',configuration:'R',invert:true},labels:['1','2','3','4']
  }),
  'rs-transfer-clockwise-4-toward':visual({
    id:'rs-transfer-clockwise-4-toward',kind:'rs-orientation',skill:'cip-rs',
    title:'Fresh viewpoint transfer',groups:[
      {label:'1',priority:1,bond:'wedge'},{label:'2',priority:2,bond:'line'},{label:'3',priority:3,bond:'line'},{label:'4',priority:4,bond:'wedge'}
    ],expected:{priority4Direction:'toward',path:'clockwise',configuration:'S',invert:true},labels:['1','2','3','4']
  }),
  'rs-retrieval-counterclockwise-4-away':visual({
    id:'rs-retrieval-counterclockwise-4-away',kind:'rs-orientation',skill:'cip-rs',
    title:'Later retrieval orientation',groups:[
      {label:'1',priority:1,bond:'line'},{label:'2',priority:2,bond:'dash'},{label:'3',priority:3,bond:'line'},{label:'4',priority:4,bond:'dash'}
    ],expected:{priority4Direction:'away',path:'counterclockwise',configuration:'S'},labels:['1','2','3','4']
  }),
  'relationship-pair-a':visual({
    id:'relationship-pair-a',kind:'configuration-pair',skill:'stereoisomer-relationships',
    title:'Compare every stereocenter',left:{config:['R','R','S']},right:{config:['R','S','S']},
    expected:{changedCenters:[2],relationship:'diastereomers'},labels:['C1','C2','C3'],groups:[]
  }),
  'meso-symmetry-plane-a':visual({
    id:'meso-symmetry-plane-a',kind:'fischer-symmetry',skill:'meso-symmetry',
    title:'Meso 2,3-dibromobutane symmetry check',
    top:'CH3',bottom:'CH3',centers:[
      {id:'C2',left:'Br',right:'H'},
      {id:'C3',left:'Br',right:'H'}
    ],symmetry:{type:'internal mirror relationship',axis:'between C2 and C3'},
    expected:{stereocenters:2,achiral:true,meso:true},labels:['CH3','Br','H','C2','C3'],groups:[]
  }),
  'meso-independent-a':visual({
    id:'meso-independent-a',kind:'symmetry-classification',skill:'meso-symmetry',
    title:'Fresh symmetric two-center structure',
    framework:'A-B-B-A symmetric carbon chain',stereocenters:2,symmetry:{present:true,type:'internal'},
    expected:{achiral:true,meso:true},labels:['center 1','center 2','symmetry'],groups:[]
  }),
  'meso-transfer-b':visual({
    id:'meso-transfer-b',kind:'symmetry-classification',skill:'meso-symmetry',
    title:'Transfer to a different symmetric framework',
    framework:'symmetric substituted ring with two stereocenters',stereocenters:2,symmetry:{present:true,type:'internal'},
    expected:{achiral:true,meso:true},labels:['stereocenter A','stereocenter B','symmetry'],groups:[]
  }),
  'fischer-orientation-a':visual({
    id:'fischer-orientation-a',kind:'fischer-cross',skill:'fischer-projections',
    title:'Read the Fischer cross in 3D',top:'CO2H',bottom:'CH3',left:'OH',right:'H',
    directions:{top:'away',bottom:'away',left:'toward',right:'toward'},
    expected:{horizontal:'toward',vertical:'away'},labels:['CO2H','CH3','OH','H'],groups:[]
  }),
  'ez-guided-opposite':visual({
    id:'ez-guided-opposite',kind:'alkene-ez',skill:'ez-alkenes',
    title:'Choose one high-priority group on each alkene carbon',
    leftCarbon:{top:{label:'Cl',priority:'high'},bottom:{label:'H',priority:'low'}},
    rightCarbon:{top:{label:'H',priority:'low'},bottom:{label:'CH3',priority:'high'}},
    expected:{eligible:true,highPrioritySides:'opposite',configuration:'E'},labels:['Cl','H','H','CH3'],groups:[]
  }),
  'ez-transfer-opposite-b':visual({
    id:'ez-transfer-opposite-b',kind:'alkene-ez',skill:'ez-alkenes',
    title:'Fresh E/Z transfer structure',
    leftCarbon:{top:{label:'Br',priority:'high'},bottom:{label:'CH3',priority:'low'}},
    rightCarbon:{top:{label:'CH2CH3',priority:'low'},bottom:{label:'Cl',priority:'high'}},
    expected:{eligible:true,highPrioritySides:'opposite',configuration:'E'},labels:['Br','CH3','CH2CH3','Cl'],groups:[]
  })
});

function get(id){return VISUALS[id]||null;}
function ids(){return Object.keys(VISUALS);}
return{VISUALS:VISUALS,get:get,ids:ids};
});
