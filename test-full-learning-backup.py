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

def click_and_wait(page, text, expect_reload=True):
    page.on("dialog", lambda d: d.accept())  # confirm before replacing, then the "reloading" notice
    if expect_reload:
        with page.expect_navigation(timeout=20000):
            page.click("text=" + text)
        app_ready(page)
    else:
        page.click("text=" + text)
        page.wait_for_function("/stopped/.test(document.getElementById('full-backup-status').textContent)")

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

    browser.close()
server.shutdown()
for r in results: print("%s  %s%s" % (r[0], r[1], ("  [" + r[2][:160] + "]") if r[0] == "FAIL" and r[2] else ""))
print("\n%d checks, %d failed" % (len(results), len(failures)))
sys.exit(1 if failures else 0)
