/* ============================================================
   NOTEBOOK + REVIEW QUEUE
   Build-order pieces after the core teaching cycle, per
   DR_MERISSA_TEACHING_ENGINE_SPEC.md Sections 12 and 13.

   Pure logic. No DOM. The notebook records facts at TEACH/WATCH
   time, not after mastery. The review queue has only the two Day 1
   triggers defined by the spec: same-session return and next-session
   developing-first return. No spaced-repetition algorithm lives here.
   ============================================================ */

var NOTEBOOK_SOURCE_STATES = { TEACHING:true, WATCH:true };

function createNotebook() {
  return { entries: [], byId: {} };
}

function writeNotebookFact(notebook, skill, fact) {
  if (!notebook || !skill) throw new Error('notebook and skill are required');
  fact = fact || {};
  if (!fact.id) throw new Error('fact.id is required');
  if (!NOTEBOOK_SOURCE_STATES[fact.sourceState]) {
    throw new Error('Notebook facts may only be written during TEACHING or WATCH');
  }

  var existing = notebook.byId[fact.id];
  if (!existing) {
    existing = {
      id: fact.id,
      skillId: skill.id,
      text: fact.text || '',
      sourceState: fact.sourceState,
      sourceItemId: fact.sourceItemId || null,
      createdAt: fact.timestamp || Date.now()
    };
    notebook.byId[fact.id] = existing;
    notebook.entries.push(existing);
  }

  if (skill.notebookEntries.indexOf(fact.id) === -1) {
    skill.notebookEntries.push(fact.id);
  }
  return existing;
}

function notebookAvailable(skill) {
  return !!skill && skill.scaffoldLevel > 0;
}

function visibleNotebookEntries(notebook, skill) {
  if (!notebookAvailable(skill)) return [];
  return notebook.entries.slice();
}

function createReviewQueue() {
  return { sameSession: [], nextSession: [], idkCountsByItemType: {} };
}

function queueKey(skillId, itemType) {
  return String(skillId) + '::' + String(itemType || 'unknown');
}

function pushUnique(list, entry) {
  var key = queueKey(entry.skillId, entry.itemType) + '::' + entry.reason;
  var exists = list.some(function(x){
    return queueKey(x.skillId, x.itemType) + '::' + x.reason === key;
  });
  if (!exists) list.push(entry);
  return entry;
}

// Section 11/13: Skip never counts as mastery and re-enters via Review Queue.
function recordSkip(queue, skill, info) {
  info = info || {};
  skill.state = 'DEVELOPING';
  var entry = {
    skillId: skill.id,
    itemType: info.itemType || 'unknown',
    sourceItemId: info.itemId || null,
    reason: 'skip',
    lastIdkReason: info.lastIdkReason || null,
    attemptsBeforeSkip: info.attemptsBeforeSkip == null ? skill.attempts.length : info.attemptsBeforeSkip,
    scaffoldLevelAtSkip: info.scaffoldLevelAtSkip == null ? skill.scaffoldLevel : info.scaffoldLevelAtSkip,
    queuedAt: info.timestamp || Date.now()
  };
  pushUnique(queue.sameSession, entry);
  return entry;
}

// Section 13: two IDKs on the same item TYPE schedule a fresh same-session return.
function recordIdkForReview(queue, skill, info) {
  info = info || {};
  var itemType = info.itemType || 'unknown';
  var key = queueKey(skill.id, itemType);
  queue.idkCountsByItemType[key] = (queue.idkCountsByItemType[key] || 0) + 1;
  if (queue.idkCountsByItemType[key] < 2) return { queued:false, count:queue.idkCountsByItemType[key] };

  skill.state = 'DEVELOPING';
  var entry = {
    skillId: skill.id,
    itemType: itemType,
    sourceItemId: info.itemId || null,
    reason: 'idk_twice',
    lastIdkReason: info.reason || null,
    queuedAt: info.timestamp || Date.now()
  };
  pushUnique(queue.sameSession, entry);
  return { queued:true, count:queue.idkCountsByItemType[key], entry:entry };
}

// Section 13: anything ending the session short of INDEPENDENT_SUCCESS or MASTERED
// is DEVELOPING and comes first next session before new content.
function closeSessionSkill(queue, skill, info) {
  info = info || {};
  var cleared = skill.state === 'INDEPENDENT_SUCCESS' || skill.state === 'MASTERED';
  if (cleared) return { queued:false };
  skill.state = 'DEVELOPING';
  var entry = {
    skillId: skill.id,
    itemType: info.itemType || 'skill_review',
    sourceItemId: info.itemId || null,
    reason: 'developing_next_session',
    queuedAt: info.timestamp || Date.now()
  };
  pushUnique(queue.nextSession, entry);
  return { queued:true, entry:entry };
}

function selectFreshReviewItem(entry, itemBank, recentlySeenItemIds) {
  recentlySeenItemIds = recentlySeenItemIds || [];
  var excluded = {};
  if (entry && entry.sourceItemId) excluded[entry.sourceItemId] = true;
  recentlySeenItemIds.forEach(function(id){ excluded[id] = true; });
  var item = (itemBank || []).find(function(it){
    if (excluded[it.id]) return false;
    if (entry && entry.itemType && entry.itemType !== 'unknown' && entry.itemType !== 'skill_review') {
      return it.itemType === entry.itemType;
    }
    return true;
  });
  return item || null;
}

function popSameSession(queue, itemBanksBySkill, recentlySeenBySkill) {
  if (!queue.sameSession.length) return null;
  var entry = queue.sameSession.shift();
  var bank = (itemBanksBySkill && itemBanksBySkill[entry.skillId]) || [];
  var recent = (recentlySeenBySkill && recentlySeenBySkill[entry.skillId]) || [];
  return { entry:entry, item:selectFreshReviewItem(entry, bank, recent) };
}

function nextSessionFirst(queue, itemBanksBySkill, recentlySeenBySkill) {
  if (!queue.nextSession.length) return null;
  var entry = queue.nextSession[0];
  var bank = (itemBanksBySkill && itemBanksBySkill[entry.skillId]) || [];
  var recent = (recentlySeenBySkill && recentlySeenBySkill[entry.skillId]) || [];
  return { entry:entry, item:selectFreshReviewItem(entry, bank, recent) };
}

module.exports = {
  createNotebook:createNotebook,
  writeNotebookFact:writeNotebookFact,
  notebookAvailable:notebookAvailable,
  visibleNotebookEntries:visibleNotebookEntries,
  createReviewQueue:createReviewQueue,
  recordSkip:recordSkip,
  recordIdkForReview:recordIdkForReview,
  closeSessionSkill:closeSessionSkill,
  selectFreshReviewItem:selectFreshReviewItem,
  popSameSession:popSameSession,
  nextSessionFirst:nextSessionFirst
};
