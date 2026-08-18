/* ============================================================
   PHASE 2A PREREQUISITE GRAPH STATIC INVARIANTS

   Runtime loop guards are necessary but not sufficient. The graph data itself
   must reference only real nodes and remain acyclic so remediation depth has a
   well-founded foundation rather than relying on session-time loop blocking.
   ============================================================ */
'use strict';
var assert=require('assert');
var model=require('./day1-adaptive-math-model.js');
var graph=model.PREREQUISITES;
var ids=Object.keys(graph);
var idSet=new Set(ids);

ids.forEach(function(id){
  var node=graph[id];
  assert.strictEqual(node.id,id,id+' graph key/id mismatch');
  assert.ok(Array.isArray(node.dependsOn),id+' dependsOn must be an array');
  var seen=new Set();
  node.dependsOn.forEach(function(dep){
    assert.ok(idSet.has(dep),id+' depends on missing node '+dep);
    assert.notStrictEqual(dep,id,id+' must not depend on itself');
    assert.ok(!seen.has(dep),id+' duplicates dependency '+dep);
    seen.add(dep);
  });
});

var visiting=new Set(),visited=new Set(),stack=[];
function dfs(id){
  if(visited.has(id))return;
  if(visiting.has(id))throw new Error('prerequisite cycle detected: '+stack.concat([id]).join(' -> '));
  visiting.add(id);stack.push(id);
  graph[id].dependsOn.forEach(dfs);
  stack.pop();visiting.delete(id);visited.add(id);
}
ids.forEach(dfs);
assert.strictEqual(visited.size,ids.length,'every prerequisite node must participate in the acyclic graph check');

// Human-reviewed diagnosis-quality edges. These assertions are intentionally
// semantic rather than merely structural: a learner should not be sent to a
// mathematically adjacent but instructionally different skill.
assert.deepStrictEqual(
  graph.reciprocal_meaning.dependsOn,[],
  'reciprocal remediation must not descend into the fraction-of-a-whole procedure'
);
assert.deepStrictEqual(
  graph.proportion_structure.dependsOn,[],
  'proportion-structure remediation must not descend into the fraction-of-a-whole procedure'
);
assert.deepStrictEqual(
  graph.magnitude_prediction.dependsOn,['unit_relationship'],
  'conversion magnitude prediction must descend to unit relationships, not generic arithmetic estimation'
);

console.log('PHASE2_PREREQUISITE_GRAPH_NODES',ids.length);
console.log('PASS Phase 2A prerequisite graph references existing nodes, is acyclic, and preserves reviewed diagnosis-quality edges');
