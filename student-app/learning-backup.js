/* Full learning backup and safe recovery for AStarryia's learning pages.
 *
 * Export is read-only: it never writes, deletes or creates storage.
 *   - Every item carries a mandatory SHA-256 fingerprint. If this browser cannot compute
 *     SHA-256, no backup is made.
 *   - A storage area that exists but cannot be read makes the backup INCOMPLETE. That is
 *     recorded in the file, in its name, and in the message shown. A database that
 *     genuinely does not exist is recorded as absent, which is not a failure.
 *
 * Restore previews first and changes nothing until a choice is made.
 *   - Only items with a valid, matching fingerprint can be restored. Missing, malformed or
 *     mismatched fingerprints are reported and never restored. If this browser cannot verify
 *     fingerprints, nothing can be restored.
 *   - "Add missing items only" re-checks the device at the moment of writing and never
 *     overwrites anything that appeared after the preview (for example, saved from another tab).
 *     For IndexedDB the check and the write happen inside one transaction.
 *   - Replacing differing items requires a separate confirmation, saves a safety copy first,
 *     and skips any item that changed again after the preview.
 *
 * Only AStarryia's own storage is read or written. Other apps on the same site (for example,
 * other learners' apps) are never exported or restored; the backup records only how many
 * other keys were left out.
 */
(function (global) {
  "use strict";

  var FORMAT = "astarryia-full-learning-backup";
  var FORMAT_VERSION = 2;
  var MAX_RESTORE_BYTES = 150 * 1024 * 1024;
  var SAFETY_PREFIX = "astarryia-restore-safety-";
  var HEX64 = /^[0-9a-f]{64}$/;
  var REPORT_KEY = "astarryia-last-restore-report"; // session storage only; never backed up

  // Every key pattern written by pages in the Starr-Chem-test repository (inventoried 2026-10-26).
  var KEY_PATTERNS = [
    /^astarryia[-.]/,      // planner mirror, unit3 coach, unit1, readiness days, mastery evidence
    /^dr-merissa-/,        // nine-day foundation lessons and learning records
    /^chm221\./,           // chapter 1 and test 1 lesson records
    /^starr-chem-/,        // older day 1 records
    /^ochem-diagnostic-/,  // readiness diagnostic
    /^molstage-/,          // molecule stage work
    /^coach-(state|notes)$/, // original nine-day coach and whiteboard
    /^coach-state-damaged-/ // raw copies of damaged original-coach records, kept by the coach
  ];

  // IndexedDB databases written by pages in this repository, with the schema those pages create.
  var DATABASES = [
    { name: "astarryia-learning-planner-v1", version: 1, stores: [{ name: "snapshots", keyPath: null }] },
    { name: "astarryia-physiology-music-v1", version: 1, stores: [{ name: "tracks", keyPath: "id" }] }
  ];

  function isStudentKey(key) {
    return typeof key === "string" && KEY_PATTERNS.some(function (re) { return re.test(key); });
  }
  // Restore safety copies stay on the device but are never put into a backup or restored from one,
  // so repeated backups and restores cannot grow without limit.
  function isSafetyCopy(key) { return typeof key === "string" && key.indexOf(SAFETY_PREFIX) === 0; }
  function findDatabase(name) {
    for (var i = 0; i < DATABASES.length; i++) if (DATABASES[i].name === name) return DATABASES[i];
    return null;
  }
  function findStore(spec, name) {
    for (var i = 0; spec && i < spec.stores.length; i++) if (spec.stores[i].name === name) return spec.stores[i];
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
  function isBlob(v) { return typeof Blob !== "undefined" && v instanceof Blob; }
  // JSON-safe form of an IndexedDB value. Blobs become tagged base64.
  function encodeValue(v) {
    if (isBlob(v)) return blobToBase64(v).then(function (b64) { return { __astarryiaBlob: { type: v.type || "", base64: b64 } }; });
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
  // Synchronous fingerprint usable inside an IndexedDB transaction (where awaiting is not possible).
  // Blob contents are represented by type and size.
  function quickMarker(v) {
    return JSON.stringify(v, function (_, x) { return isBlob(x) ? { __blob: [x.type, x.size] } : x; });
  }

  // ---------- mandatory SHA-256 ----------
  var shaSupport = null;
  function checksumSupported() {
    if (shaSupport) return shaSupport;
    shaSupport = new Promise(function (resolve) {
      try {
        if (!(global.crypto && global.crypto.subtle && global.TextEncoder)) { resolve(false); return; }
        global.crypto.subtle.digest("SHA-256", new TextEncoder().encode("check")).then(function (b) { resolve(!!b && b.byteLength === 32); }, function () { resolve(false); });
      } catch (_) { resolve(false); }
    });
    return shaSupport;
  }
  function sha256(text) {
    return global.crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
    });
  }
  function checksumFor(kind, id, payloadText) { return sha256(kind + "\n" + id + "\n" + payloadText); }
  function idbId(dbName, storeName, key) { return dbName + "/" + storeName + "/" + JSON.stringify(key); }

  // ---------- IndexedDB access ----------
  // Result status: "absent" (database genuinely does not exist), "open", or "unreadable" (exists or may
  // exist, but could not be opened). Never creates a database: if opening would create one, the
  // upgrade is aborted so no empty database is left behind.
  function listDatabaseNames() {
    try {
      if (global.indexedDB && typeof global.indexedDB.databases === "function") {
        return global.indexedDB.databases().then(function (list) { return list.map(function (d) { return d.name; }); }, function () { return null; });
      }
    } catch (_) {}
    return Promise.resolve(null);
  }
  function openExisting(name) {
    if (!global.indexedDB) return Promise.resolve({ status: "unreadable", reason: "This browser's database storage is unavailable." });
    return listDatabaseNames().then(function (names) {
      if (names && names.indexOf(name) === -1) return { status: "absent" };
      return new Promise(function (resolve) {
        var created = false, req;
        try { req = global.indexedDB.open(name); } catch (e) { resolve({ status: "unreadable", reason: e.message }); return; }
        req.onupgradeneeded = function (e) { created = true; try { e.target.transaction.abort(); } catch (_) {} };
        req.onsuccess = function () {
          if (created) { try { req.result.close(); } catch (_) {} resolve({ status: "absent" }); }
          else resolve({ status: "open", db: req.result });
        };
        req.onerror = function (e) {
          if (e && e.preventDefault) e.preventDefault();
          if (created) resolve({ status: "absent" });
          else resolve({ status: "unreadable", reason: (req.error && req.error.message) || "could not be opened" });
        };
        req.onblocked = function () { resolve({ status: "unreadable", reason: "blocked by another open page" }); };
      });
    });
  }

  function readStore(db, storeName) {
    return new Promise(function (resolve, reject) {
      var out = [], tx;
      try { tx = db.transaction(storeName, "readonly"); } catch (e) { reject(e); return; }
      var cur = tx.objectStore(storeName).openCursor();
      cur.onsuccess = function () { var c = cur.result; if (c) { out.push({ key: c.primaryKey, value: c.value }); c.continue(); } };
      tx.oncomplete = function () { resolve(out); };
      tx.onerror = function () { reject(tx.error || Error("Read failed")); };
      tx.onabort = function () { reject(tx.error || Error("Read aborted")); };
    });
  }

  // ---------- export ----------
  function collect() {
    var result = { local: [], databases: [], excludedOtherKeys: 0, safetyCopiesNotIncluded: 0, incomplete: [] };
    var ls = null, keys = [];
    try {
      ls = global.localStorage;
      for (var i = 0; i < ls.length; i++) keys.push(ls.key(i));
    } catch (e) { ls = null; result.incomplete.push("Browser storage (lesson progress, quiz history and notes) could not be read: " + e.message); }
    if (ls) {
      keys.sort().forEach(function (k) {
        if (!isStudentKey(k)) { result.excludedOtherKeys++; return; }
        if (isSafetyCopy(k)) { result.safetyCopiesNotIncluded++; return; }
        try {
          var v = ls.getItem(k);
          if (v === null) result.incomplete.push("Saved item " + k + " disappeared while the backup was being made.");
          else result.local.push({ key: k, value: v });
        } catch (e) { result.incomplete.push("Saved item " + k + " could not be read: " + e.message); }
      });
    }
    return DATABASES.reduce(function (p, spec) {
      return p.then(function () {
        return openExisting(spec.name).then(function (o) {
          if (o.status === "absent") { result.databases.push({ name: spec.name, status: "absent", stores: [] }); return; }
          if (o.status === "unreadable") {
            result.databases.push({ name: spec.name, status: "unreadable", stores: [] });
            result.incomplete.push("Database " + spec.name + " exists but could not be opened (" + o.reason + ").");
            return;
          }
          var db = o.db, entry = { name: spec.name, status: "read", version: db.version, stores: [] };
          return spec.stores.reduce(function (q, st) {
            return q.then(function () {
              if (!db.objectStoreNames.contains(st.name)) {
                result.incomplete.push("Database " + spec.name + " is missing its expected '" + st.name + "' area.");
                return;
              }
              return readStore(db, st.name).then(function (records) {
                return Promise.all(records.map(function (r) {
                  return encodeValue(r.value).then(function (ev) { return { key: r.key, value: ev }; });
                })).then(function (enc) { entry.stores.push({ name: st.name, records: enc }); });
              }).catch(function (e) {
                entry.status = "partly unreadable";
                result.incomplete.push("Records in " + spec.name + "/" + st.name + " could not be read (" + e.message + ").");
              });
            });
          }, Promise.resolve()).then(function () { try { db.close(); } catch (_) {} result.databases.push(entry); });
        });
      });
    }, Promise.resolve()).then(function () { return result; });
  }

  function buildBackup() {
    return checksumSupported().then(function (ok) {
      if (!ok) throw Error("This browser cannot create the fingerprints that protect a backup, so no backup was made");
      return collect();
    }).then(function (c) {
      var jobs = [];
      c.local.forEach(function (item) {
        jobs.push(checksumFor("local", item.key, item.value).then(function (h) { item.sha256 = h; }));
      });
      c.databases.forEach(function (db) {
        db.stores.forEach(function (st) {
          st.records.forEach(function (r) {
            jobs.push(checksumFor("idb", idbId(db.name, st.name, r.key), JSON.stringify(r.value)).then(function (h) { r.sha256 = h; }));
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
          complete: c.incomplete.length === 0,
          incompleteReasons: c.incomplete,
          summary: {
            localItems: c.local.length,
            databaseRecords: c.databases.reduce(function (n, d) { return n + d.stores.reduce(function (m, s) { return m + s.records.length; }, 0); }, 0),
            otherAppKeysNotIncluded: c.excludedOtherKeys,
            restoreSafetyCopiesNotIncluded: c.safetyCopiesNotIncluded
          },
          localStorage: c.local,
          indexedDB: c.databases
        };
      });
    });
  }

  // ---------- restore planning ----------
  function validate(backup) {
    if (!backup || backup.format !== FORMAT) throw Error("This is not a full AStarryia learning backup");
    if (backup.formatVersion !== FORMAT_VERSION) throw Error("Unsupported backup version " + backup.formatVersion);
    if (!Array.isArray(backup.localStorage) || !Array.isArray(backup.indexedDB)) throw Error("The backup file is missing required sections");
    return backup;
  }

  // Classifies every item: "ok", "unverifiable" (fingerprint missing, malformed or not computable)
  // or "damaged" (fingerprint does not match). The fingerprint covers (kind, id, payload), as at export.
  function verifyItems(backup) {
    var verdict = {}, jobs = [];
    function check(prefixed, kind, rawId, payload, sha) {
      if (typeof sha !== "string" || !HEX64.test(sha)) { verdict[prefixed] = "unverifiable"; return; }
      jobs.push(checksumFor(kind, rawId, payload).then(function (h) { verdict[prefixed] = h === sha ? "ok" : "damaged"; },
        function () { verdict[prefixed] = "unverifiable"; }));
    }
    backup.localStorage.forEach(function (item) {
      if (typeof item.value !== "string") { verdict["local:" + item.key] = "unverifiable"; return; }
      check("local:" + item.key, "local", item.key, item.value, item.sha256);
    });
    backup.indexedDB.forEach(function (db) {
      (db.stores || []).forEach(function (st) {
        (st.records || []).forEach(function (r) {
          var id = idbId(db.name, st.name, r.key);
          check("idb:" + id, "idb", id, JSON.stringify(r.value), r.sha256);
        });
      });
    });
    return Promise.all(jobs).then(function () { return verdict; });
  }

  function fileWarnings(backup) {
    var w = [];
    if (backup.complete !== true) {
      w.push("This backup was INCOMPLETE when it was made" + (Array.isArray(backup.incompleteReasons) && backup.incompleteReasons.length ? ": " + backup.incompleteReasons.join(" ") : "."));
    }
    var s = backup.summary || {};
    var records = backup.indexedDB.reduce(function (n, d) { return n + (d.stores || []).reduce(function (m, st) { return m + (st.records || []).length; }, 0); }, 0);
    if (s.localItems !== backup.localStorage.length || s.databaseRecords !== records) w.push("The file's item count does not match its contents, so the file may have been cut short or edited.");
    return w;
  }

  // Returns a plan describing what a restore would do. Makes no changes.
  function planRestore(backup) {
    validate(backup);
    return checksumSupported().then(function (ok) {
      if (!ok) throw Error("This browser cannot verify backup fingerprints, so nothing can be restored here");
      return verifyItems(backup);
    }).then(function (verdict) {
      var plan = { missing: [], same: [], different: [], refused: [], damaged: [], unverifiable: [], warnings: fileWarnings(backup) };
      function screen(prefixed, entry) {
        var v = verdict[prefixed];
        if (v === "damaged") { plan.damaged.push(entry); return false; }
        if (v !== "ok") { plan.unverifiable.push(entry); return false; }
        return true;
      }
      var ls = global.localStorage;
      backup.localStorage.forEach(function (item) {
        if (!isStudentKey(item.key) || isSafetyCopy(item.key)) { plan.refused.push({ kind: "local", id: String(item.key) }); return; }
        var entry = { kind: "local", id: item.key, key: item.key, value: item.value };
        if (!screen("local:" + item.key, entry)) return;
        var current = ls.getItem(item.key);
        if (current === null) plan.missing.push(entry);
        else if (current === item.value) plan.same.push(entry);
        else { entry.currentAtPreview = current; plan.different.push(entry); }
      });
      return backup.indexedDB.reduce(function (p, db) {
        return p.then(function () {
          var spec = findDatabase(db.name);
          if (!spec) { plan.refused.push({ kind: "idb", id: String(db.name) }); return; }
          var stores = db.stores || [];
          if (!stores.length) return;
          return openExisting(db.name).then(function (o) {
            if (o.status === "unreadable") throw Error("Database " + db.name + " on this device could not be opened, so it could not be compared safely");
            var live = o.status === "open" ? o.db : null;
            return stores.reduce(function (q, st) {
              return q.then(function () {
                if (!findStore(spec, st.name)) { plan.refused.push({ kind: "idb", id: db.name + "/" + st.name }); return; }
                var cur = live && live.objectStoreNames.contains(st.name) ? readStore(live, st.name) : Promise.resolve([]);
                return cur.then(function (records) {
                  var byKey = {};
                  return Promise.all(records.map(function (r) {
                    return encodeValue(r.value).then(function (ev) { byKey[JSON.stringify(r.key)] = { full: JSON.stringify(ev), marker: quickMarker(r.value), encoded: ev }; });
                  })).then(function () {
                    (st.records || []).forEach(function (r) {
                      var id = idbId(db.name, st.name, r.key);
                      var entry = { kind: "idb", id: id, db: db.name, store: st.name, key: r.key, value: r.value };
                      if (!screen("idb:" + id, entry)) return;
                      var now = byKey[JSON.stringify(r.key)];
                      if (!now) plan.missing.push(entry);
                      else if (now.full === JSON.stringify(r.value)) plan.same.push(entry);
                      else { entry.markerAtPreview = now.marker; entry.encodedAtPreview = now.encoded; plan.different.push(entry); }
                    });
                  });
                });
              });
            }, Promise.resolve()).then(function () { if (live) live.close(); }, function (e) { if (live) live.close(); throw e; });
          });
        });
      }, Promise.resolve()).then(function () { return plan; });
    });
  }

  // ---------- restore writing ----------
  // May create a missing database with the same structure its own page creates. If a later write fails,
  // that database is deliberately left in place (possibly empty): this code never deletes a database.
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
      req.onblocked = function () { reject(Error(spec.name + " is open elsewhere. Close other tabs and try again")); };
    });
  }

  // Writes IndexedDB entries. Each existence check and write happens inside one readwrite
  // transaction, so a save from another tab cannot slip in between the check and the write.
  // A transaction is all-or-nothing: if it fails, none of its records were written, and each one
  // is reported as still needing attention. Never throws; outcomes go into the report.
  function putRecords(entries, report) {
    var groups = {};
    entries.forEach(function (e) { var g = e.db + "\u0000" + e.store; (groups[g] = groups[g] || []).push(e); });
    return Object.keys(groups).reduce(function (p, g) {
      return p.then(function () {
        var list = groups[g], spec = findDatabase(list[0].db), stSpec = findStore(spec, list[0].store);
        var allowedIds = [], skippedIds = [];
        return openForWrite(spec).then(function (db) {
          return new Promise(function (resolve, reject) {
            var tx;
            try { tx = db.transaction(stSpec.name, "readwrite"); } catch (e) { db.close(); reject(e); return; }
            var os = tx.objectStore(stSpec.name);
            list.forEach(function (e) {
              var req = os.get(e.key);
              req.onsuccess = function () {
                var cur = req.result, allowed;
                if (e.replacing) allowed = cur !== undefined && quickMarker(cur) === e.markerAtPreview;
                else allowed = cur === undefined;
                if (!allowed) { skippedIds.push(e.id); return; }
                var v = decodeValue(e.value);
                if (stSpec.keyPath) os.put(v); else os.put(v, e.key); // a throw here aborts the whole transaction
                allowedIds.push(e.id);
              };
            });
            tx.oncomplete = function () { db.close(); resolve(); };
            tx.onerror = function () { db.close(); reject(tx.error || Error("write failed")); };
            tx.onabort = function () { db.close(); reject(tx.error || Error("write was cancelled")); };
          });
        }).then(function () {
          allowedIds.forEach(function (id) { report.restored.push(id); });
          skippedIds.forEach(function (id) { report.skippedChanged.push(id); });
        }, function (err) {
          var reason = (err && err.message) || "database write failed";
          list.forEach(function (e) { report.failed.push({ id: e.id, reason: reason }); });
        });
      });
    }, Promise.resolve());
  }

  // Keeps the values seen at preview for every item about to be replaced. Returns the safety key.
  function saveSafetyCopy(entries) {
    var key = SAFETY_PREFIX + new Date().toISOString();
    var payload = JSON.stringify({ format: FORMAT + "-safety-copy", createdAt: new Date().toISOString(),
      localStorage: entries.filter(function (e) { return e.kind === "local"; }).map(function (e) { return { key: e.key, value: e.currentAtPreview }; }),
      indexedDB: entries.filter(function (e) { return e.kind === "idb"; }).map(function (e) { return { db: e.db, store: e.store, key: e.key, value: e.encodedAtPreview }; }) });
    global.localStorage.setItem(key, payload); // throws if storage is full: caller stops before replacing
    if (global.localStorage.getItem(key) !== payload) throw Error("Safety copy could not be confirmed");
    return key;
  }

  // mode: "add-missing" (default) or "replace-different" (also adds missing).
  // Returns a report: status is "complete" (nothing failed), "partial" (some restored, some failed)
  // or "failed" (nothing restored and something failed). Running the same backup again is safe:
  // restored items then match and are left alone, and only items still missing are added.
  function applyRestore(plan, mode) {
    var ls = global.localStorage;
    var report = { status: null, restored: [], failed: [], skippedChanged: [], safetyKey: null,
      keptUnchanged: mode === "replace-different" ? 0 : plan.different.length };
    var replacing = mode === "replace-different" ? plan.different.map(function (e) { var c = Object.assign({}, e); c.replacing = true; return c; }) : [];
    return Promise.resolve().then(function () {
      if (replacing.length) {
        try { report.safetyKey = saveSafetyCopy(replacing); }
        catch (e) { throw Error("The safety copy could not be saved (" + e.message + "), so nothing was restored or replaced"); }
      }
      plan.missing.concat(replacing).forEach(function (e) {
        if (e.kind !== "local") return;
        try {
          // Re-check at the moment of writing; check and write are synchronous with nothing in between.
          var now = ls.getItem(e.key);
          var allowed = e.replacing ? now === e.currentAtPreview : now === null;
          if (!allowed) { report.skippedChanged.push(e.id); return; }
          ls.setItem(e.key, e.value);
          if (ls.getItem(e.key) !== e.value) throw Error("value could not be confirmed after saving");
          report.restored.push(e.id);
        } catch (err) { report.failed.push({ id: e.id, reason: (err && err.message) || "could not be saved" }); }
      });
      return putRecords(plan.missing.concat(replacing).filter(function (e) { return e.kind === "idb"; }), report);
    }).then(function () {
      report.status = report.failed.length === 0 ? "complete" : report.restored.length ? "partial" : "failed";
      return report;
    });
  }

  function listIds(items, max) {
    return items.slice(0, max).join("; ") + (items.length > max ? "; and " + (items.length - max) + " more" : "");
  }
  function describeReport(r) {
    var lines = [];
    if (r.status === "complete") lines.push("RESTORE COMPLETE: " + r.restored.length + " item(s) restored.");
    else if (r.status === "partial") lines.push("PARTIAL RESTORE: " + r.restored.length + " item(s) restored, but " + r.failed.length + " item(s) were NOT restored and still need attention.");
    else lines.push("RESTORE FAILED: nothing was restored. " + r.failed.length + " item(s) could not be saved.");
    if (r.failed.length) {
      lines.push("Still needs attention: " + listIds(r.failed.map(function (f) { return f.id + " (" + f.reason + ")"; }), 12) + ".");
      lines.push("To finish, free up space if needed, then choose the same backup file again and use \"Add missing items only\". Items already restored will be left alone.");
    }
    if (r.restored.length && r.status !== "complete") lines.push("Restored successfully: " + listIds(r.restored, 12) + ".");
    if (r.skippedChanged.length) lines.push(r.skippedChanged.length + " item(s) changed on this device after the check and were left as they are.");
    if (r.keptUnchanged) lines.push(r.keptUnchanged + " differing item(s) were left unchanged.");
    if (r.safetyKey) lines.push("Previous versions were kept in a safety copy.");
    return lines.join(" ");
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
        a.href = url; a.download = "astarryia-full-learning-backup-" + (backup.complete ? "" : "INCOMPLETE-") + day + ".json";
        doc.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        var counts = backup.summary.localItems + " saved items and " + backup.summary.databaseRecords + " database records";
        if (backup.complete) text(status, "Backup ready: " + counts + ". Nothing on this device was changed.");
        else text(status, "WARNING: this backup is INCOMPLETE and must not be relied on as a full backup. " +
          backup.incompleteReasons.join(" ") + " It contains " + counts + ". Nothing on this device was changed.");
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
        plan.warnings.forEach(function (w) { var d = doc.createElement("div"); d.className = "notice"; text(d, "Warning: " + w); preview.appendChild(d); });
        var p = doc.createElement("div"); p.className = "notice";
        text(p, "This backup has " + plan.missing.length + " item(s) missing on this device, " + plan.same.length +
          " already identical, and " + plan.different.length + " that differ from what is saved here." +
          (plan.damaged.length ? " " + plan.damaged.length + " damaged item(s) will not be restored." : "") +
          (plan.unverifiable.length ? " " + plan.unverifiable.length + " item(s) without a valid fingerprint will not be restored." : "") +
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
        var message = describeReport(r);
        text(status, message);
        input.value = "";
        if (r.restored.length) {
          // Reload so no open page keeps an older copy in memory and saves over the restored data.
          // The report is kept for this tab only (session storage, never backed up) and shown again after reloading.
          try { global.sessionStorage.setItem(REPORT_KEY, message); } catch (_) {}
          global.alert(message + " The app will now reload.");
          global.location.reload();
        }
      }).catch(function (e) { text(status, "RESTORE NOT STARTED: " + e.message + ". Nothing on this device was changed."); });
    }
    var saved = null;
    try { saved = global.sessionStorage.getItem(REPORT_KEY); global.sessionStorage.removeItem(REPORT_KEY); } catch (_) {}
    if (saved) text(status, "Last restore: " + saved);
  }

  var api = { FORMAT: FORMAT, FORMAT_VERSION: FORMAT_VERSION, isStudentKey: isStudentKey, buildBackup: buildBackup,
    planRestore: planRestore, applyRestore: applyRestore, describeReport: describeReport, SAFETY_PREFIX: SAFETY_PREFIX,
    DATABASE_NAMES: DATABASES.map(function (d) { return d.name; }) };
  global.AStarryiaLearningBackup = api;
  if (global.document) {
    if (global.document.readyState === "loading") global.document.addEventListener("DOMContentLoaded", function () { wireUI(global.document); });
    else wireUI(global.document);
  }
})(typeof window !== "undefined" ? window : this);
