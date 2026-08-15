/* Pure Day 1 Molecule Stage logic shared by the standalone stage and learner page. */
(function(root){
  "use strict";
  var VALENCE={H:1,C:4,N:5,O:6};
  var TARGETS={
    H2O:{formula:"H₂O",totalElectrons:8,atoms:[{el:"O",neighbors:["H","H"],lonePairs:2},{el:"H",neighbors:["O"],lonePairs:0},{el:"H",neighbors:["O"],lonePairs:0}]},
    CH3OH:{formula:"CH₃OH",totalElectrons:14,atoms:[{el:"C",neighbors:["H","H","H","O"],lonePairs:0},{el:"O",neighbors:["C","H"],lonePairs:2},{el:"H",neighbors:["C"],lonePairs:0},{el:"H",neighbors:["C"],lonePairs:0},{el:"H",neighbors:["C"],lonePairs:0},{el:"H",neighbors:["O"],lonePairs:0}]},
    CH3NH2:{formula:"CH₃NH₂",totalElectrons:14,atoms:[{el:"C",neighbors:["H","H","H","N"],lonePairs:0},{el:"N",neighbors:["C","H","H"],lonePairs:1},{el:"H",neighbors:["C"],lonePairs:0},{el:"H",neighbors:["C"],lonePairs:0},{el:"H",neighbors:["C"],lonePairs:0},{el:"H",neighbors:["N"],lonePairs:0},{el:"H",neighbors:["N"],lonePairs:0}]}
  };
  function emptyState(){return {atoms:[],bonds:[],lonePairs:[]};}
  function cloneState(s){return JSON.parse(JSON.stringify(s));}
  function atom(state,id){return state.atoms.find(function(a){return a.id===id;});}
  function validState(state){
    if(!state||!Array.isArray(state.atoms)||!Array.isArray(state.bonds)||!Array.isArray(state.lonePairs))return false;
    var ids={};
    if(state.atoms.some(function(a){if(!a||ids[a.id]||!VALENCE[a.el])return true;ids[a.id]=true;return false;}))return false;
    var bondIds={};
    if(state.bonds.some(function(b){if(!b||bondIds[b.id]||b.a===b.b||!ids[b.a]||!ids[b.b])return true;bondIds[b.id]=true;return false;}))return false;
    var pairs={};
    if(state.bonds.some(function(b){var k=[b.a,b.b].sort().join("|");if(pairs[k])return true;pairs[k]=true;return false;}))return false;
    var lpIds={};
    if(state.lonePairs.some(function(lp){if(!lp||lpIds[lp.id]||!ids[lp.atomId])return true;lpIds[lp.id]=true;return false;}))return false;
    return true;
  }
  function neighborsOf(state,id){var out=[];state.bonds.forEach(function(b){if(b.a===id)out.push(b.b);if(b.b===id)out.push(b.a);});return out;}
  function lonePairCountOf(state,id){return state.lonePairs.filter(function(lp){return lp.atomId===id;}).length;}
  function electronsAvailable(state){return state.atoms.reduce(function(n,a){return n+VALENCE[a.el];},0);}
  function electronsPlaced(state){return state.bonds.length*2+state.lonePairs.length*2;}
  function signatures(state){return state.atoms.map(function(a){return {el:a.el,neighbors:neighborsOf(state,a.id).map(function(id){return atom(state,id).el;}).sort(),lonePairs:lonePairCountOf(state,a.id)};});}
  function key(s){return s.el+":"+s.neighbors.join(",")+":"+s.lonePairs;}
  function verifyStructure(state,target){
    if(!validState(state))return {correct:false,reason:"invalid_state"};
    if(state.atoms.length!==target.atoms.length)return {correct:false,reason:"atom_count"};
    var got=signatures(state).map(key).sort(),want=target.atoms.map(function(a){return key({el:a.el,neighbors:a.neighbors.slice().sort(),lonePairs:a.lonePairs});}).sort();
    return {correct:got.every(function(v,i){return v===want[i];}),reason:got.every(function(v,i){return v===want[i];})?null:"structure_mismatch"};
  }
  function detectMisconception(state,target){
    if(!validState(state))return {code:"INVALID_STATE",message:"This drawing contains a duplicate or fabricated atom reference. Undo that action and use only atoms actually on this stage."};
    var sig=signatures(state);
    if(sig.some(function(s){return s.el==="H"&&(s.neighbors.length>1||s.lonePairs>0);}))return {code:"H_OVERLOADED",message:"Hydrogen can have one bond and no lone pairs. Keep the correct work and remove only the extra bond or pair."};
    var targetPairs=target.atoms.reduce(function(n,a){return n+a.lonePairs;},0);
    var targetBonds=target.atoms.reduce(function(n,a){return n+a.neighbors.length;},0)/2;
    if(targetPairs&&state.lonePairs.length===0&&state.bonds.length>=targetBonds)return {code:"NO_LONE_PAIRS",message:"The bonds are present, but the remaining electrons still need to be placed as lone pairs."};
    if(sig.some(function(s){return s.el==="C"&&s.lonePairs>0;}))return {code:"LP_WRONG_ATOM",message:"Carbon already has its octet from four bonds. Preserve those bonds and move the lone pair to the atom still short."};
    if(state.atoms.length===target.atoms.length&&electronsAvailable(state)!==target.totalElectrons)return {code:"WRONG_ATOM_SET",message:"The atom set does not match the formula. Recount each element before changing bonds."};
    return null;
  }
  var api={VALENCE:VALENCE,TARGETS:TARGETS,emptyState:emptyState,cloneState:cloneState,validState:validState,neighborsOf:neighborsOf,lonePairCountOf:lonePairCountOf,electronsAvailable:electronsAvailable,electronsPlaced:electronsPlaced,verifyStructure:verifyStructure,detectMisconception:detectMisconception};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  root.MoleculeStageLogic=api;
})(typeof globalThis!=="undefined"?globalThis:this);
