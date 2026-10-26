/* Full learning backup and safe recovery for AStarryia's learning pages.
 *
 * Export is read-only: it never writes, deletes or creates storage.
 * Restore is additive by default: it only fills in items that are missing on this device.
 * Replacing an item that already exists requires a separate explicit choice, and the
 * current value is saved to a safety copy first. If the safety copy cannot be saved,
 * nothing is replaced.
 *
 * Only AStarryia's own storage is read or written. Other apps on the same site
 * (for example, other learners' apps) are never exported or restored; the backup
 * records only how many other keys were left out.
 */
(function (global) {
  "use strict";

  var FORMAT = "astarryia-full-learning-backup";
  var FORMAT_VERSION = 1;
  var MAX_RESTORE_BYTES = 150 * 1024 * 1024;
  var SAFETY_PREFIX = "astarryia-restore-safety-";

  // Every key pattern written by pages in the Starr-Chem-test repository (inventoried 2026-10-26).
  var KEY_PATTERNS = [
    /^astarryia[-.]/,      // planner mirror, unit3 coach, unit1, readiness days, mastery evidence
    /^dr-merissa-/,        // nine-day foundation lessons and learning records
    /^chm221\./,           // chapter 1 and test 1 lesson records
    /^starr-chem-/,        // older day 1 records
    /^ochem-diagnostic-/,  // readiness diagnostic
    /^molstage-/,          // molecule stage work
    /^coach-(state|notes)$/ // original nine-day coach and whiteboard
  ];

  // IndexedDB databases written by pages in this repository, with the schema those pages create.
  var DATABASES = [
    { name: "astarryia-learning-planner-v1", version: 1, stores: [{ name: "snapshots", keyPath: null }] },
    { name: "astarryia-physiology-music-v1", version: 1, stores: [{ name: "tracks", keyPath: "id" }] }
  ];

  function isStudentKey(key) {
    return typeof key === "string" && KEY_PATTERNS.some(function (re) { return re.test(key); });
  }

  function findDatabase(name) {
    for (var i = 0; i < DATABASES.length; i++) if (DATABASES[i].name === name) return DATABASES[i];
    return null;
  }

  // ---------- encoding ----------
  function blobToBase64(blob) {
    return blob.arrayBuffer().then(function (buf) {
      var bytes = new Uint8Array(buf), out = "", chunk = 0x8000;
      for (var i = 0; i < bytes.length; i += chunk) out += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
      return btoa(out);
    });
  }
  function base64ToBlob(b64, type) {
    var bin = atob(b64), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: type || "" });
  }
  // Convert IndexedDB values to JSON-safe form. Blobs/Files become tagged base64.
  function encodeValue(v) {
    if (typeof Blob !== "undefined" && v instanceof Blob) {
      return blobToBase64(v).then(function (b64) { return { __astarryiaBlob: { type: v.type || "", base64: b64 } }; });
    }
    if (Array.isArray(v)) return Promise.all(v.map(encodeValue));
    if (v && typeof v === "object") {
      var keys = Object.keys(v);
      return Promise.all(keys.map(function (k) { return encodeValue(v[k]); })).then(function (vals) {
        var o = {}; keys.forEach(function (k, i) { o[k] = vals[i]; }); return o;
      });
    }
    return Promise.resolve(v);
  }
  function decodeValue(v) {
    if (Array.isArray(v)) return v.map(decodeValue);
    if (v && typeof v === "object") {
      if (v.__astarryiaBlob && typeof v.__astarryiaBlob.base64 === "string") return base64ToBlob(v.__astarryiaBlob.base64, v.__astarryiaBlob.type);
      var o = {}; Object.keys(v).forEach(function (k) { o[k] = decodeValue(v[k]); }); return o;
    }
    return v;
  }

  function sha256(text) {
    if (!(global.crypto && global.crypto.subtle && global.TextEncoder)) return Promise.resolve(null);
    return global.crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
    });
  }

  // ---------- read-only IndexedDB access ----------
  // Opens an existing database WITHOUT creating it. If it does not exist, the upgrade is aborted
  // so no empty database is left behind (an empty v1 database would break the app that owns it).
  function openExisting(name) {
    return new Promise(function (resolve) {
      if (!("indexedDB" in global)) { resolve(null); return; }
      var created = false, req;
      try { req = global.indexedDB.open(name); } catch (_) { resolve(null); return; }
      req.onupgradeneeded = function (e) { created = true; try { e.target.transaction.abort(); } catch (_) {} };
      req.onsuccess = function () { if (created) { try { req.result.close(); } catch (_) {} resolve(null); } else resolve(req.result); };
      req.onerror = function (e) { if (e && e.preventDefault) e.preventDefault(); resolve(null); };
      req.onblocked = function () { resolve(null); };
    });
  }

  function readStore(db, storeName) {
    return new Promise(function (resolve, reject) {
      if (!db.objectStoreNames.contains(storeName)) { resolve(null); return; }
      var out = [], tx;
      try { tx = db.transaction(storeName, "readonly"); } catch (e) { reject(e); return; }
      var cur = tx.objectStore(storeName).openCursor();
      cur.onsuccess = function () {
        var c = cur.result;
        if (c) { out.push({ key: c.primaryKey, value: c.value }); c.continue(); }
      };
      tx.oncomplete = function () { resolve(out); };
      tx.onerror = function () { reject(tx.error || Error("Read failed")); };
      tx.onabort = function () { reject(tx.error || Error("Read aborted")); };
    });
  }

  // ---------- export ----------
  function collect() {
    var result = { local: [], databases: [], excludedOtherKeys: 0, warnings: [] };
    var ls = null;
    try { ls = global.localStorage; void ls.length; } catch (e) { ls = null; result.warnings.push("Browser storage could not be read: " + e.message); }
    if (ls) {
      var keys = [];
      for (var i = 0; i < ls.length; i++) keys.push(ls.key(i));
      keys.sort().forEach(function (k) {
        if (isStudentKey(k)) result.local.push({ key: k, value: ls.getItem(k) });
        else result.excludedOtherKeys++;
      });
    }
    return DATABASES.reduce(function (p, spec) {
      return p.then(function () {
        return openExisting(spec.name).then(function (db) {
          if (!db) { result.databases.push({ name: spec.name, present: false, stores: [] }); return; }
          var entry = { name: spec.name, present: true, version: db.version, stores: [] };
          return spec.stores.reduce(function (q, st) {
            return q.then(function () {
              return readStore(db, st.name).then(function (records) {
                if (records === null) return;
                return Promise.all(records.map(function (r) {
                  return encodeValue(r.value).then(function (ev) { return { key: r.key, value: ev }; });
                })).then(function (enc) { entry.stores.push({ name: st.name, records: enc }); });
              });
            });
          }, Promise.resolve()).then(function () { db.close(); result.databases.push(entry); },
            function (e) { db.close(); result.warnings.push(spec.name + ": " + e.message); result.databases.push(entry); });
        });
      });
    }, Promise.resolve()).then(function () { return result; });
  }

  function checksumFor(kind, id, payloadText) { return sha256(kind + "\n" + id + "\n" + payloadText); }

  function buildBackup() {
    return collect().then(function (c) {
      var jobs = [];
      c.local.forEach(function (item) {
        jobs.push(checksumFor("local", item.key, item.value).then(function (h) { item.sha256 = h; }));
      });
      c.databases.forEach(function (db) {
        db.stores.forEach(function (st) {
          st.records.forEach(function (r) {
            var id = db.name + "/" + st.name + "/" + JSON.stringify(r.key);
            jobs.push(checksumFor("idb", id, JSON.stringify(r.value)).then(function (h) { r.sha256 = h; }));
          });
        });
      });
      return Promise.all(jobs).then(function () {
        var standalone = false;
        try { standalone = !!(global.matchMedia && global.matchMedia("(display-mode: standalone)").matches) || global.navigator.standalone === true; } catch (_) {}
        return {
          format: FORMAT, formatVersion: FORMAT_VERSION,
          exportedAt: new Date().toISOString(),
          context: { origin: global.location.origin, homeScreenApp: standalone },
          summary: {
            localItems: c.local.length,
            databaseRecords: c.databases.reduce(function (n, d) { return n + d.stores.reduce(function (m, s) { return m + s.records.length; }, 0); }, 0),
            otherAppKeysNotIncluded: c.excludedOtherKeys,
            checksums: c.local.length === 0 || c.local[0].sha256 !== null
          },
          warnings: c.warnings,
          localStorage: c.local,
          indexedDB: c.databases
        };
      });
    });
  }

  // ---------- restore planning ----------
  function validate(backup) {
    if (!backup || backup.format !== FORMAT) throw Error("This is not a full AStarryia learning backup.");
    if (backup.formatVersion !== FORMAT_VERSION) throw Error("Unsupported backup version " + backup.formatVersion + ".");
    if (!Array.isArray(backup.localStorage) || !Array.isArray(backup.indexedDB)) throw Error("The backup file is incomplete.");
    return backup;
  }

  function verifyChecksums(backup) {
    var bad = [], jobs = [];
    backup.localStorage.forEach(function (item) {
      if (!item.sha256) return;
      jobs.push(checksumFor("local", item.key, item.value).then(function (h) { if (h && h !== item.sha256) bad.push(item.key); }));
    });
    backup.indexedDB.forEach(function (db) {
      (db.stores || []).forEach(function (st) {
        (st.records || []).forEach(function (r) {
          if (!r.sha256) return;
          var id = db.name + "/" + st.name + "/" + JSON.stringify(r.key);
          jobs.push(checksumFor("idb", id, JSON.stringify(r.value)).then(function (h) { if (h && h !== r.sha256) bad.push(id); }));
        });
      });
    });
    return Promise.all(jobs).then(function () { return bad; });
  }

  // Returns a plan describing what a restore would do. Makes no changes.
  function planRestore(backup) {
    validate(backup);
    var plan = { missing: [], same: [], different: [], refused: [], corrupted: [] };
    return verifyChecksums(backup).then(function (bad) {
      var corrupted = {}; bad.forEach(function (id) { corrupted[id] = true; });
      var ls = global.localStorage;
      backup.localStorage.forEach(function (item) {
        if (!isStudentKey(item.key) || typeof item.value !== "string") { plan.refused.push({ kind: "local", id: String(item.key) }); return; }
        if (corrupted[item.key]) { plan.corrupted.push({ kind: "local", id: item.key }); return; }
        var current = ls.getItem(item.key);
        var entry = { kind: "local", id: item.key, key: item.key, value: item.value };
        if (current === null) plan.missing.push(entry);
        else if (current === item.value) plan.same.push(entry);
        else plan.different.push(entry);
      });
      return backup.indexedDB.reduce(function (p, db) {
        return p.then(function () {
          var spec = findDatabase(db.name);
          if (!spec) { plan.refused.push({ kind: "idb", id: String(db.name) }); return; }
          return openExisting(db.name).then(function (live) {
            return (db.stores || []).reduce(function (q, st) {
              return q.then(function () {
                var stSpec = spec.stores.filter(function (s) { return s.name === st.name; })[0];
                if (!stSpec) { plan.refused.push({ kind: "idb", id: db.name + "/" + st.name }); return; }
                var currentRecords = live && live.objectStoreNames.contains(st.name) ? readStore(live, st.name) : Promise.resolve([]);
                return currentRecords.then(function (cur) {
                  var byKey = {};
                  return Promise.all((cur || []).map(function (r) {
                    return encodeValue(r.value).then(function (ev) { byKey[JSON.stringify(r.key)] = JSON.stringify(ev); });
                  })).then(function () {
                    (st.records || []).forEach(function (r) {
                      var id = db.name + "/" + st.name + "/" + JSON.stringify(r.key);
                      if (corrupted[id]) { plan.corrupted.push({ kind: "idb", id: id }); return; }
                      var entry = { kind: "idb", id: id, db: db.name, store: st.name, key: r.key, value: r.value };
                      var k = JSON.stringify(r.key);
                      if (!(k in byKey)) plan.missing.push(entry);
                      else if (byKey[k] === JSON.stringify(r.value)) plan.same.push(entry);
                      else plan.different.push(entry);
                    });
                  });
                });
              });
            }, Promise.resolve()).then(function () { if (live) live.close(); });
          });
        });
      }, Promise.resolve()).then(function () { return plan; });
    });
  }

  // ---------- restore writing ----------
  function openForWrite(spec) {
    return new Promise(function (resolve, reject) {
      var req = global.indexedDB.open(spec.name, spec.version);
      req.onupgradeneeded = function () {
        spec.stores.forEach(function (s) {
          if (!req.result.objectStoreNames.contains(s.name)) req.result.createObjectStore(s.name, s.keyPath ? { keyPath: s.keyPath } : undefined);
        });
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error || Error("Could not open " + spec.name)); };
      req.onblocked = function () { reject(Error(spec.name + " is open elsewhere. Close other tabs and try again.")); };
    });
  }

  function putRecords(entries) {
    var groups = {};
    entries.forEach(function (e) { var g = e.db + "\u0000" + e.store; (groups[g] = groups[g] || []).push(e); });
    return Object.keys(groups).reduce(function (p, g) {
      return p.then(function () {
        var list = groups[g], spec = findDatabase(list[0].db);
        var stSpec = spec.stores.filter(function (s) { return s.name === list[0].store; })[0];
        return openForWrite(spec).then(function (db) {
          return new Promise(function (resolve, reject) {
            var tx = db.transaction(stSpec.name, "readwrite"), os = tx.objectStore(stSpec.name);
            list.forEach(function (e) { var v = decodeValue(e.value); if (stSpec.keyPath) os.put(v); else os.put(v, e.key); });
            tx.oncomplete = function () { db.close(); resolve(); };
            tx.onerror = function () { db.close(); reject(tx.error || Error("Write failed")); };
            tx.onabort = function () { db.close(); reject(tx.error || Error("Write aborted")); };
          });
        });
      });
    }, Promise.resolve());
  }

  // Before replacing anything, keep the device's current values. Returns the safety key used.
  function saveSafetyCopy(entries) {
    var currentLocal = [], idbIds = [];
    entries.forEach(function (e) {
      if (e.kind === "local") currentLocal.push({ key: e.key, value: global.localStorage.getItem(e.key) });
      else idbIds.push(e);
    });
    var idbJobs = idbIds.map(function (e) {
      return openExisting(e.db).then(function (db) {
        if (!db) return null;
        return readStore(db, e.store).then(function (recs) {
          db.close();
          var match = (recs || []).filter(function (r) { return JSON.stringify(r.key) === JSON.stringify(e.key); })[0];
          if (!match) return null;
          return encodeValue(match.value).then(function (ev) { return { db: e.db, store: e.store, key: e.key, value: ev }; });
        });
      });
    });
    return Promise.all(idbJobs).then(function (idbCurrent) {
      var key = SAFETY_PREFIX + new Date().toISOString();
      var payload = JSON.stringify({ format: FORMAT + "-safety-copy", createdAt: new Date().toISOString(),
        localStorage: currentLocal, indexedDB: idbCurrent.filter(Boolean) });
      global.localStorage.setItem(key, payload); // throws if storage is full: caller aborts before replacing
      if (global.localStorage.getItem(key) !== payload) throw Error("Safety copy could not be confirmed.");
      return key;
    });
  }

  // mode: "add-missing" (default) or "replace-different" (also adds missing).
  function applyRestore(plan, mode) {
    var toWrite = plan.missing.slice(), safetyKey = null;
    var step = Promise.resolve();
    if (mode === "replace-different" && plan.different.length) {
      step = saveSafetyCopy(plan.different).then(function (k) { safetyKey = k; toWrite = toWrite.concat(plan.different); });
    }
    return step.then(function () {
      toWrite.filter(function (e) { return e.kind === "local"; }).forEach(function (e) { global.localStorage.setItem(e.key, e.value); });
      return putRecords(toWrite.filter(function (e) { return e.kind === "idb"; }));
    }).then(function () {
      return { written: toWrite.length, keptUnchanged: mode === "replace-different" ? 0 : plan.different.length, safetyKey: safetyKey };
    });
  }

  // ---------- user interface ----------
  function text(el, s) { if (el) el.textContent = s; }

  function wireUI(doc) {
    var exportBtn = doc.getElementById("full-backup"), input = doc.getElementById("full-restore"),
        status = doc.getElementById("full-backup-status"), preview = doc.getElementById("full-restore-preview");
    if (!exportBtn || !input) return;
    var pendingPlan = null;

    exportBtn.addEventListener("click", function () {
      exportBtn.disabled = true; text(status, "Preparing the full backup…");
      buildBackup().then(function (backup) {
        var day = new Date().toISOString().slice(0, 10);
        var blob = new Blob([JSON.stringify(backup, null, 1)], { type: "application/json" });
        var url = URL.createObjectURL(blob), a = doc.createElement("a");
        a.href = url; a.download = "astarryia-full-learning-backup-" + day + ".json";
        doc.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        text(status, "Backup ready: " + backup.summary.localItems + " saved items and " + backup.summary.databaseRecords +
          " database records. Nothing on this device was changed." + (backup.warnings.length ? " Warning: " + backup.warnings.join("; ") : ""));
      }).catch(function (e) { text(status, "Backup failed: " + e.message + ". Nothing was changed."); })
        .then(function () { exportBtn.disabled = false; });
    });

    input.addEventListener("change", function () {
      var file = input.files && input.files[0]; pendingPlan = null; preview.innerHTML = "";
      if (!file) return;
      if (file.size > MAX_RESTORE_BYTES) { text(status, "That file is too large to be a learning backup."); input.value = ""; return; }
      text(status, "Checking the backup. Nothing will change until you choose an option.");
      file.text().then(function (raw) { return planRestore(JSON.parse(raw)); }).then(function (plan) {
        pendingPlan = plan;
        var p = doc.createElement("div"); p.className = "notice";
        text(p, "This backup has " + plan.missing.length + " item(s) missing on this device, " + plan.same.length +
          " already identical, and " + plan.different.length + " that differ from what is saved here." +
          (plan.corrupted.length ? " " + plan.corrupted.length + " damaged item(s) will be skipped." : "") +
          (plan.refused.length ? " " + plan.refused.length + " item(s) do not belong to this app and will be ignored." : ""));
        preview.appendChild(p);
        var add = doc.createElement("button"); add.type = "button"; add.className = "btn secondary";
        text(add, "Add missing items only (safe)"); add.disabled = !plan.missing.length;
        preview.appendChild(add);
        add.addEventListener("click", function () { run("add-missing"); });
        if (plan.different.length) {
          var rep = doc.createElement("button"); rep.type = "button"; rep.className = "btn subtle"; rep.style.marginLeft = "8px";
          text(rep, "Replace " + plan.different.length + " differing item(s)…");
          preview.appendChild(rep);
          rep.addEventListener("click", function () {
            if (global.confirm("Replace " + plan.different.length + " item(s) on this device with the backup's version? The current versions will be kept in a safety copy first. If the safety copy cannot be saved, nothing will be replaced.")) run("replace-different");
          });
        }
        text(status, "Review the summary, then choose an option.");
      }).catch(function (e) { text(status, "Could not read this backup: " + e.message + ". Nothing was changed."); input.value = ""; });
    });

    function run(mode) {
      if (!pendingPlan) return;
      var plan = pendingPlan; pendingPlan = null;
      Array.prototype.forEach.call(preview.querySelectorAll("button"), function (b) { b.disabled = true; });
      applyRestore(plan, mode).then(function (r) {
        text(status, "Restored " + r.written + " item(s)." + (r.keptUnchanged ? " " + r.keptUnchanged + " differing item(s) were left unchanged." : "") +
          (r.safetyKey ? " Previous versions were kept in a safety copy." : "") + " The app will now reload.");
        input.value = "";
        // Reload so no open page keeps an older copy in memory and saves over the restored data.
        if (r.written) { global.alert("Restore complete. The app will reload so the restored progress is used."); global.location.reload(); }
      }).catch(function (e) { text(status, "Restore stopped: " + e.message + ". Items already identical or unchanged were not touched."); });
    }
  }

  var api = { FORMAT: FORMAT, FORMAT_VERSION: FORMAT_VERSION, isStudentKey: isStudentKey, buildBackup: buildBackup,
    planRestore: planRestore, applyRestore: applyRestore, SAFETY_PREFIX: SAFETY_PREFIX };
  global.AStarryiaLearningBackup = api;
  if (global.document) {
    if (global.document.readyState === "loading") global.document.addEventListener("DOMContentLoaded", function () { wireUI(global.document); });
    else wireUI(global.document);
  }
})(typeof window !== "undefined" ? window : this);
