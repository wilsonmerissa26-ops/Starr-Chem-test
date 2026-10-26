"""Real-browser tests for student-app/learning-backup.js.

Runs a local copy of the site in headless Chromium. Every test uses a brand-new browser
profile with SYNTHETIC records only, so no real student data is ever read or changed.

Run:  pip install playwright && python -m playwright install chromium
      python test-full-learning-backup.py
"""
import datetime, functools, http.server, json, os, socketserver, sys, tempfile, threading
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.abspath(__file__))
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
handler = functools.partial(Quiet, directory=ROOT)
server = socketserver.TCPServer(("127.0.0.1", 0), handler)
threading.Thread(target=server.serve_forever, daemon=True).start()
APP = "http://127.0.0.1:%d/student-app/" % server.server_address[1]

# Synthetic records, one per storage family, plus one key belonging to a different app on the same site.
SYNTH_LOCAL = {
    "astarryia-unit3-v1": json.dumps({"module": 0, "attempts": {"0": {"n": 4, "c": 4}}, "wrong": {},
                                      "latestByModule": {"0": {"module": 0, "correct": 4, "total": 4}}}),
    "coach-state": json.dumps({"day": 2, "xp": 100, "done": [1], "streak": 1, "teachStep": 0, "mastery": {"Formal Charge": "yellow"}}),
    "coach-notes": "SYNTHETIC whiteboard: SN2 = backside attack → inversion ✔ <b>not html</b> \"quotes\"",
    "dr-merissa-day1-state-v1": json.dumps({"synthetic": True, "step": 7}),
    "dr-merissa-learning-record-v11": json.dumps({"synthetic": True}),
    "chm221.chapter1.U1-03.v1": json.dumps({"synthetic": True}),
    "astarryia.day4.v1": json.dumps({"synthetic": True}),
    "ochem-diagnostic-v13": json.dumps({"synthetic": True}),
    "molstage-ch4-build": json.dumps({"state": "synthetic"}),
    "astarryia-learning-planner-mirror-v1": json.dumps({"version": 1, "done": {"chem-1026-review": "2026-10-26T12:00:00Z"}, "custom": [], "updatedAt": "2026-10-26T12:00:00Z"}),
}
OTHER_APP_KEY, OTHER_APP_VALUE = "MLUL_BACKUP_V1", "OTHER-LEARNER-PRIVATE-SYNTHETIC"
TODAY = datetime.date.today().isoformat()  # browser and test share the machine's time zone
PLANNER = {"version": 1, "done": {"chem-1026-review": "2026-10-26T12:00:00Z", "own-1": "2026-10-26T12:00:00Z"},
           "custom": [{"id": "own-1", "title": "SYNTHETIC custom task", "date": TODAY, "subject": "chem", "kind": "practice", "fixed": False}],
           "updatedAt": "2026-10-26T12:00:00Z"}
SONG_BYTES = list(range(256)) * 40  # 10 KB synthetic audio-like blob covering every byte value

results, failures = [], []
def check(name, ok, detail=""):
    results.append(("PASS" if ok else "FAIL", name, detail))
    if not ok: failures.append(name)

def seed(page, local=True, planner=True, song=True, other=True):
    page.evaluate("""async ([local, planner, song, other, otherKey, otherVal]) => {
      for (const [k, v] of Object.entries(local || {})) localStorage.setItem(k, v);
      if (other) localStorage.setItem(otherKey, otherVal);
      const put = (name, store, keyPath, key, value) => new Promise((res, rej) => {
        const r = indexedDB.open(name, 1);
        r.onupgradeneeded = () => r.result.createObjectStore(store, keyPath ? {keyPath} : undefined);
        r.onsuccess = () => { const tx = r.result.transaction(store, 'readwrite');
          keyPath ? tx.objectStore(store).put(value) : tx.objectStore(store).put(value, key);
          tx.oncomplete = () => { r.result.close(); res(); }; tx.onerror = () => rej(tx.error); };
        r.onerror = () => rej(r.error); });
      if (planner) await put('astarryia-learning-planner-v1', 'snapshots', null, 'active', planner);
      if (song) await put('astarryia-physiology-music-v1', 'tracks', 'id', null,
          {id: 'song-1', name: 'SYNTHETIC study song', blob: new Blob([new Uint8Array(song)], {type: 'audio/mpeg'})});
    }""", [SYNTH_LOCAL if local else {}, PLANNER if planner else None, SONG_BYTES if song else None, other, OTHER_APP_KEY, OTHER_APP_VALUE])

def snapshot(page):
    """Complete picture of this profile's storage, including database list and blob bytes."""
    return page.evaluate("""async () => {
      const local = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); local[k] = localStorage.getItem(k); }
      const dbs = (await indexedDB.databases()).map(d => d.name).sort();
      const out = {local, dbs, records: {}};
      for (const name of dbs) {
        const db = await new Promise(r => { const q = indexedDB.open(name); q.onsuccess = () => r(q.result); });
        for (const store of db.objectStoreNames) {
          const recs = await new Promise(r => { const a = []; const c = db.transaction(store).objectStore(store).openCursor();
            c.onsuccess = () => { if (c.result) { a.push([c.result.primaryKey, c.result.value]); c.result.continue(); } else r(a); }; });
          out.records[name + '/' + store] = await Promise.all(recs.map(async ([k, v]) => {
            if (v && v.blob instanceof Blob) v = {...v, blob: Array.from(new Uint8Array(await v.blob.arrayBuffer())), blobType: v.blob.type};
            return [k, v]; }));
        }
        db.close();
      }
      return out; }""")

def open_settings(page):
    page.goto(APP); page.wait_for_selector("[data-go='settings']", state="attached")
    app_ready(page)
    page.evaluate("document.querySelector(\"[data-go='settings']\").click()"); page.wait_for_selector("#full-backup")

def export(page):
    open_settings(page)
    with page.expect_download() as d:
        page.click("#full-backup")
    page.wait_for_function("document.getElementById('full-backup-status').textContent.startsWith('Backup ready')")
    return json.load(open(d.value.path())), page.inner_text("#full-backup-status")

def preview_restore(page, data):
    path = os.path.join(tempfile.mkdtemp(), "backup.json"); json.dump(data, open(path, "w"))
    open_settings(page)
    page.set_input_files("#full-restore", path)
    page.wait_for_function("document.getElementById('full-backup-status').textContent.length > 0 && !document.getElementById('full-backup-status').textContent.startsWith('Checking')")
    return page.inner_text("#full-backup-status"), page.inner_text("#full-restore-preview")

def app_ready(page):
    """Wait until the planner has finished opening its saved data (no fixed sleeps)."""
    page.wait_for_function("document.getElementById('save-status').textContent !== 'Checking saved work\u2026'")

def click_and_wait(page, text, expect_reload=True, wait_text="stopped"):
    page.on("dialog", lambda d: d.accept())  # confirm before replacing, then the "reloading" notice
    if expect_reload:
        with page.expect_navigation(timeout=20000):
            page.click("text=" + text)
        app_ready(page)
    else:
        page.click("text=" + text)
        page.wait_for_function("t => document.getElementById('full-backup-status').textContent.includes(t)", arg=wait_text)

with sync_playwright() as p:
    browser = p.chromium.launch()
    def fresh():
        ctx = browser.new_context(accept_downloads=True); pg = ctx.new_page(); pg.goto(APP); app_ready(pg); return ctx, pg

    # 1. Export is read-only, complete, byte-for-byte, and excludes other apps.
    ctx, page = fresh(); seed(page); page.goto(APP); app_ready(page)
    before = snapshot(page)
    backup, status = export(page)
    after = snapshot(page)
    check("Export changes nothing on the device", before == after)
    exported = {i["key"]: i["value"] for i in backup["localStorage"]}
    check("Every synthetic learning key is exported", all(k in exported for k in SYNTH_LOCAL), str(sorted(set(SYNTH_LOCAL) - set(exported))))
    check("Exported values are byte-for-byte identical", all(exported.get(k) == v for k, v in SYNTH_LOCAL.items()))
    raw = json.dumps(backup)
    check("Another app's key and value are not exported", OTHER_APP_KEY not in raw and OTHER_APP_VALUE not in raw)
    check("Excluded keys are counted, not named", backup["summary"]["otherAppKeysNotIncluded"] >= 1)
    check("Every item carries a SHA-256 checksum", all(len(i.get("sha256") or "") == 64 for i in backup["localStorage"]))
    dbs = {d["name"]: d for d in backup["indexedDB"]}
    planner_rec = dbs["astarryia-learning-planner-v1"]["stores"][0]["records"][0]
    check("Planner database snapshot is exported", planner_rec["key"] == "active" and planner_rec["value"] == PLANNER)
    song = dbs["astarryia-physiology-music-v1"]["stores"][0]["records"][0]["value"]
    check("Study-song audio is exported", song["blob"]["__astarryiaBlob"]["type"] == "audio/mpeg")
    check("Status reports that nothing changed", "Nothing on this device was changed" in status, status)
    ctx.close()

    # 2. Export on a device with no databases does not create empty ones.
    ctx, page = fresh(); page.evaluate("localStorage.setItem('coach-notes','x')")
    dbs_before = snapshot(page)["dbs"]
    open_settings(page)
    dbs_after_load = snapshot(page)["dbs"]
    export(page)
    dbs_after = snapshot(page)["dbs"]
    check("Export does not create the study-song database", "astarryia-physiology-music-v1" not in dbs_after, str(dbs_after))
    check("Export does not add any database", dbs_after == dbs_after_load, "%s -> %s" % (dbs_after_load, dbs_after))
    ctx.close()

    # 3. Full round trip into a fresh profile using "Add missing items only".
    ctx, page = fresh(); status, prev = preview_restore(page, backup)
    check("Preview reports missing items before any change", "missing on this device" in prev, prev)
    click_and_wait(page, "Add missing items only (safe)")
    restored = snapshot(page)
    check("All learning keys restored exactly", all(restored["local"].get(k) == v for k, v in SYNTH_LOCAL.items()))
    check("Other app key not created by restore", OTHER_APP_KEY not in restored["local"])
    check("Planner database restored exactly", restored["records"].get("astarryia-learning-planner-v1/snapshots") == [["active", PLANNER]])
    song_rec = restored["records"].get("astarryia-physiology-music-v1/tracks", [[None, {}]])[0][1]
    check("Study-song audio restored byte-for-byte", song_rec.get("blob") == SONG_BYTES and song_rec.get("blobType") == "audio/mpeg")
    page.goto(APP + "#today"); page.reload(); app_ready(page)
    check("Planner shows the restored custom task as done", page.evaluate("!!(document.querySelector(\"#today-tasks [data-check='own-1']\")||{}).checked"))
    page.goto(APP + "#chemistry"); page.reload(); app_ready(page)
    check("Learning App reads the restored quiz history", "1 / 8" in page.inner_text("#chem-progress-title"))
    ctx.close()

    # 4. Additive restore never overwrites newer work on the device.
    ctx, page = fresh(); newer = json.dumps({"module": 3, "attempts": {"3": {"n": 8, "c": 7}}, "wrong": {}})
    page.evaluate("v => localStorage.setItem('astarryia-unit3-v1', v)", newer)
    status, prev = preview_restore(page, backup)
    check("Preview flags the differing item", "1 that differ" in prev, prev)
    click_and_wait(page, "Add missing items only (safe)")
    check("Differing item left unchanged by safe restore", page.evaluate("localStorage.getItem('astarryia-unit3-v1')") == newer)
    check("Other missing items were still added", page.evaluate("localStorage.getItem('coach-state')") == SYNTH_LOCAL["coach-state"])
    ctx.close()

    # 5. Replace keeps a safety copy of what it replaces.
    ctx, page = fresh(); page.evaluate("v => localStorage.setItem('astarryia-unit3-v1', v)", newer)
    preview_restore(page, backup); click_and_wait(page, "Replace 1 differing item")
    snap = snapshot(page)["local"]
    safety = [k for k in snap if k.startswith("astarryia-restore-safety-")]
    check("Replace writes the backup's version", snap.get("astarryia-unit3-v1") == SYNTH_LOCAL["astarryia-unit3-v1"])
    check("Replaced version is kept in a safety copy", len(safety) == 1 and json.loads(snap[safety[0]])["localStorage"][0]["value"] == newer)
    ctx.close()

    # 6. If the safety copy cannot be saved, nothing is replaced.
    ctx, page = fresh(); page.evaluate("v => localStorage.setItem('astarryia-unit3-v1', v)", newer)
    preview_restore(page, backup)
    page.evaluate("""() => { const orig = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k, v) { if (String(k).startsWith('astarryia-restore-safety-')) throw new DOMException('Quota exceeded', 'QuotaExceededError'); return orig.call(this, k, v); }; }""")
    click_and_wait(page, "Replace 1 differing item", expect_reload=False)
    check("Full storage aborts replace with no changes", page.evaluate("localStorage.getItem('astarryia-unit3-v1')") == newer
          and page.evaluate("localStorage.getItem('coach-state')") is None, page.inner_text("#full-backup-status"))
    ctx.close()

    # 7. A damaged item is skipped; the rest still restores.
    tampered = json.loads(json.dumps(backup))
    for i in tampered["localStorage"]:
        if i["key"] == "coach-notes": i["value"] = "tampered"
    ctx, page = fresh(); status, prev = preview_restore(page, tampered)
    check("Damaged item is detected", "1 damaged item" in prev, prev)
    click_and_wait(page, "Add missing items only (safe)")
    check("Damaged item is not written", page.evaluate("localStorage.getItem('coach-notes')") is None)
    check("Undamaged items still restore", page.evaluate("localStorage.getItem('coach-state')") == SYNTH_LOCAL["coach-state"])
    ctx.close()

    # 8. A backup cannot write keys or databases that do not belong to AStarryia.
    hostile = json.loads(json.dumps(backup))
    hostile["localStorage"].append({"key": "learner:michael", "value": "x"})
    hostile["localStorage"].append({"key": "<img src=x onerror=alert(1)>", "value": "x"})
    hostile["indexedDB"].append({"name": "MichaelLevelUpLab", "stores": [{"name": "s", "records": [{"key": 1, "value": 1}]}]})
    ctx, page = fresh(); status, prev = preview_restore(page, hostile)
    check("Foreign items are refused in the preview", "3 item(s) do not belong" in prev, prev)
    click_and_wait(page, "Add missing items only (safe)")
    snap = snapshot(page)
    check("No foreign key or database was written", "learner:michael" not in snap["local"] and "MichaelLevelUpLab" not in snap["dbs"]
          and not any(k.startswith("<img") for k in snap["local"]))
    check("No markup was injected into the page", page.locator("#full-restore-preview img").count() == 0)
    ctx.close()

    # 9. Non-backup files are rejected without changes.
    for label, data in [("planner-only backup", {"app": "AStarryia Learning Planner", "version": 1, "state": PLANNER}),
                        ("unrelated JSON", {"hello": "world"})]:
        ctx, page = fresh(); before = snapshot(page)
        status, prev = preview_restore(page, data)
        check("Rejects " + label + " with no change", status.startswith("Could not read") and snapshot(page) == before, status)
        ctx.close()

    check("Normal backup is marked complete", backup.get("complete") is True and backup.get("incompleteReasons") == [])

    # ---------- Safeguard 1: newer work saved in another tab between preview and restore ----------
    def other_tab(ctx):
        t = ctx.new_page(); t.goto(APP); app_ready(t); return t
    NEWER_STATE = json.dumps({"day": 5, "xp": 900, "done": [1, 2, 3], "mastery": {}, "SYNTHETIC": "newer, saved in tab B"})
    NEWER_PLANNER = {"version": 1, "done": {"SYNTHETIC-newer": "2026-10-26T18:00:00Z"}, "custom": [], "updatedAt": "2026-10-26T18:00:00Z"}

    # 10. Browser-storage item: missing at preview, saved by tab B, then "Add missing items only".
    ctx, page = fresh(); preview_restore(page, backup)
    tab_b = other_tab(ctx); tab_b.evaluate("v => localStorage.setItem('coach-state', v)", NEWER_STATE)
    click_and_wait(page, "Add missing items only (safe)")
    check("Two tabs: newer browser-storage save is not overwritten", page.evaluate("localStorage.getItem('coach-state')") == NEWER_STATE)
    check("Two tabs: other missing items are still added", page.evaluate("localStorage.getItem('coach-notes')") == SYNTH_LOCAL["coach-notes"])
    ctx.close()

    # 11. Database record: planner snapshot missing at preview, saved by tab B, then "Add missing items only".
    ctx, page = fresh(); preview_restore(page, backup)
    tab_b = other_tab(ctx)
    tab_b.evaluate("""p => new Promise((res, rej) => { const r = indexedDB.open('astarryia-learning-planner-v1');
      r.onsuccess = () => { const tx = r.result.transaction('snapshots', 'readwrite'); tx.objectStore('snapshots').put(p, 'active');
      tx.oncomplete = () => { r.result.close(); res(); }; tx.onerror = () => rej(tx.error); }; })""", NEWER_PLANNER)
    click_and_wait(page, "Add missing items only (safe)")
    rec = snapshot(page)["records"].get("astarryia-learning-planner-v1/snapshots")
    check("Two tabs: newer planner save in the database is not overwritten", rec == [["active", NEWER_PLANNER]], str(rec)[:120])
    ctx.close()

    # 12. Nothing left to add: every missing item was saved by tab B, so nothing is written and the skip is reported.
    one = json.loads(json.dumps(backup)); one["localStorage"] = [i for i in one["localStorage"] if i["key"] == "coach-notes"]
    one["indexedDB"] = []; one["summary"]["localItems"] = 1; one["summary"]["databaseRecords"] = 0
    ctx, page = fresh(); preview_restore(page, one)
    tab_b = other_tab(ctx); tab_b.evaluate("localStorage.setItem('coach-notes', 'SYNTHETIC newer notes from tab B')")
    click_and_wait(page, "Add missing items only (safe)", expect_reload=False, wait_text="changed on this device after the check")
    check("Two tabs: skipped item is reported to the user", "1 item(s) changed on this device after the check" in page.inner_text("#full-backup-status"))
    check("Two tabs: skipped item keeps the newer value", page.evaluate("localStorage.getItem('coach-notes')") == "SYNTHETIC newer notes from tab B")
    ctx.close()

    # 13. Replace: item differed at preview, tab B changed it again before replace.
    ctx, page = fresh(); page.evaluate("v => localStorage.setItem('astarryia-unit3-v1', v)", newer)
    preview_restore(page, backup)
    tab_b = other_tab(ctx); tab_b.evaluate("localStorage.setItem('astarryia-unit3-v1', '{\"SYNTHETIC\":\"newest from tab B\"}')")
    click_and_wait(page, "Replace 1 differing item")
    check("Two tabs: replace skips an item changed again after preview",
          page.evaluate("localStorage.getItem('astarryia-unit3-v1')") == '{"SYNTHETIC":"newest from tab B"}')
    ctx.close()

    # ---------- Safeguard 2: mandatory fingerprints ----------
    def variant(mutate):
        d = json.loads(json.dumps(backup))
        for i in d["localStorage"]:
            if i["key"] == "coach-notes": mutate(i)
        return d
    for label, mutate, phrase in [
        ("missing fingerprint", lambda i: i.pop("sha256"), "without a valid fingerprint"),
        ("malformed fingerprint", lambda i: i.__setitem__("sha256", "not-a-fingerprint"), "without a valid fingerprint"),
        ("altered fingerprint", lambda i: i.__setitem__("sha256", "0" * 64), "damaged item"),
    ]:
        ctx, page = fresh(); status, prev = preview_restore(page, variant(mutate))
        check("Fingerprint: " + label + " is reported", ("1 " + phrase) in prev or ("1 item(s) " + phrase) in prev, prev)
        click_and_wait(page, "Add missing items only (safe)")
        check("Fingerprint: " + label + " item is not restored", page.evaluate("localStorage.getItem('coach-notes')") is None)
        check("Fingerprint: verified items still restore (" + label + ")", page.evaluate("localStorage.getItem('coach-state')") == SYNTH_LOCAL["coach-state"])
        ctx.close()
    # A database record with no fingerprint is also refused.
    d = json.loads(json.dumps(backup))
    for db in d["indexedDB"]:
        for st in db["stores"]:
            for r in st["records"]: r.pop("sha256", None)
    ctx, page = fresh(); preview_restore(page, d); click_and_wait(page, "Add missing items only (safe)")
    check("Fingerprint: database records without fingerprints are not restored",
          not snapshot(page)["records"].get("astarryia-learning-planner-v1/snapshots"))
    ctx.close()

    # No SHA-256 in this browser: export makes no file, restore changes nothing.
    NO_SHA = "Object.defineProperty(window.crypto.subtle, 'digest', {value: () => Promise.reject(new Error('no SHA-256'))});"
    ctx = browser.new_context(accept_downloads=True); ctx.add_init_script(NO_SHA); page = ctx.new_page()
    downloads = []; page.on("download", lambda d: downloads.append(d))
    open_settings(page); page.click("#full-backup")
    page.wait_for_function("document.getElementById('full-backup-status').textContent.startsWith('Backup failed')")
    check("No SHA-256: export refuses and makes no file", not downloads and "no backup was made" in page.inner_text("#full-backup-status"))
    before = snapshot(page); status, prev = preview_restore(page, backup)
    check("No SHA-256: restore refuses with no change", "cannot verify" in status and snapshot(page) == before and prev.strip() == "", status)
    ctx.close()

    # ---------- Safeguard 3: never call a partial backup complete ----------
    def export_any(page):
        open_settings(page)
        with page.expect_download() as dl:
            page.click("#full-backup")
        page.wait_for_function("/^(Backup ready|WARNING)/.test(document.getElementById('full-backup-status').textContent)")
        return json.load(open(dl.value.path())), dl.value.suggested_filename, page.inner_text("#full-backup-status")

    BREAK_OPEN = """(() => { const real = IDBFactory.prototype.open;
      IDBFactory.prototype.open = function (name, v) {
        if (name === 'astarryia-physiology-music-v1') { const req = {}; setTimeout(() => { req.error = new DOMException('simulated failure', 'UnknownError');
          if (req.onerror) req.onerror({ preventDefault() {} }); }, 0); return req; }
        return real.apply(this, arguments); }; })();"""
    BREAK_READ = """(() => { const real = IDBDatabase.prototype.transaction;
      IDBDatabase.prototype.transaction = function (stores, mode) {
        if (String(stores) === 'tracks' && mode !== 'readwrite') throw new DOMException('simulated read failure', 'UnknownError');
        return real.apply(this, arguments); }; })();"""
    BREAK_LOCAL = """(() => { Storage.prototype.key = function () { throw new DOMException('simulated storage failure', 'SecurityError'); }; })();"""
    for label, script, needle in [("database cannot be opened", BREAK_OPEN, "astarryia-physiology-music-v1 exists but could not be opened"),
                                  ("database records cannot be read", BREAK_READ, "astarryia-physiology-music-v1/tracks could not be read"),
                                  ("browser storage cannot be read", BREAK_LOCAL, "Browser storage")]:
        ctx = browser.new_context(accept_downloads=True); page = ctx.new_page(); page.goto(APP); seed(page)
        ctx.add_init_script(script)
        data, name, status = export_any(page)
        check("Incomplete (" + label + "): file says incomplete", data["complete"] is False and any(needle in r for r in data["incompleteReasons"]), str(data.get("incompleteReasons"))[:160])
        check("Incomplete (" + label + "): file name says INCOMPLETE", "INCOMPLETE" in name, name)
        check("Incomplete (" + label + "): message warns, never 'Backup ready'", status.startswith("WARNING") and "INCOMPLETE" in status, status[:120])
        ctx.close()
        if label == "database cannot be opened":
            ctx, page = fresh(); status, prev = preview_restore(page, data)
            check("Restoring an incomplete backup shows the warning", "This backup was INCOMPLETE" in prev, prev[:160])
            ctx.close()
    # A database that genuinely does not exist is not a failure.
    ctx = browser.new_context(accept_downloads=True); page = ctx.new_page(); page.goto(APP); app_ready(page)
    data, name, status = export_any(page)
    phys = [d for d in data["indexedDB"] if d["name"] == "astarryia-physiology-music-v1"][0]
    check("Absent database is recorded as absent, backup complete", phys["status"] == "absent" and data["complete"] is True and status.startswith("Backup ready"))
    ctx.close()
    # A file whose counts do not match its contents is flagged.
    cut = json.loads(json.dumps(backup)); cut["localStorage"] = cut["localStorage"][:3]
    ctx, page = fresh(); status, prev = preview_restore(page, cut)
    check("Cut-short file is flagged", "may have been cut short" in prev, prev[:160])
    ctx.close()

    # ---------- Key coverage: every AStarryia key in the repository, and none of Michael's ----------
    import re, glob
    found = set()
    for path in glob.glob(os.path.join(ROOT, "**", "*.js"), recursive=True) + glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True):
        rel = os.path.relpath(path, ROOT)
        if rel.startswith(("test-", "test-fixtures", ".github", "node_modules")) or "/test-" in rel or rel == "student-app/learning-backup.js":
            continue
        src = open(path, encoding="utf-8", errors="ignore").read()
        found.update(re.findall(r"""(?:localStorage|sessionStorage|storage)\.setItem\(\s*['"]([^'"$]+)['"]""", src))
        found.update(re.findall(r"""\b(?:[A-Z0-9_]*KEY|STORAGE)\s*=\s*['"]([^'"]{4,80})['"]""", src))
    found.discard("__t")  # momentary write-test probe, removed immediately
    found.update(["chm221.chapter1.U1-03.v1", "chm221.test1.alkane-isomers.v2", "astarryia.day4.v1", "molstage-ch4-build"])  # dynamic keys
    ctx, page = fresh()
    verdicts = page.evaluate("keys => keys.map(k => [k, AStarryiaLearningBackup.isStudentKey(k)])", sorted(found))
    missed = [k for k, ok in verdicts if not ok]
    check("Every AStarryia storage key in the repository is covered (%d keys)" % len(verdicts), not missed, str(missed))
    michael = ["MLUL_BACKUP_V1", "MLUL_BROWSER_AUDIT_BACKUP_V1", "LEVEL_UP_BACKUP_abc_V2", "learner:123", "michael", "__healthcheck",
               "__local_durable_backup_handle", "MLUL_WTMMTM_SCHOOL_QUEST_V1"]
    leaked = page.evaluate("keys => keys.filter(k => AStarryiaLearningBackup.isStudentKey(k))", michael)
    check("None of Michael's known storage keys are included", not leaked, str(leaked))
    dbs_in_repo = set()
    for path in glob.glob(os.path.join(ROOT, "**", "*.js"), recursive=True):
        rel = os.path.relpath(path, ROOT)
        if rel.startswith("test-"): continue
        dbs_in_repo.update(re.findall(r"""DB_NAME\s*=\s*['"]([^'"]+)['"]""", open(path, encoding="utf-8", errors="ignore").read()))
    covered = page.evaluate("AStarryiaLearningBackup.DATABASE_NAMES")
    check("Every AStarryia database in the repository is covered", dbs_in_repo <= set(covered), "%s vs %s" % (dbs_in_repo, covered))
    check("Michael's database is not covered", not any("Michael" in n for n in covered))
    ctx.close()

    browser.close()
server.shutdown()
for r in results: print("%s  %s%s" % (r[0], r[1], ("  [" + r[2][:160] + "]") if r[0] == "FAIL" and r[2] else ""))
print("\n%d checks, %d failed" % (len(results), len(failures)))
sys.exit(1 if failures else 0)
