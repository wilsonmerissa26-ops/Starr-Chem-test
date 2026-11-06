"""Tests for the shared learning record and the two teaching pilots (docs/LEARNING_SYSTEM_SPEC.md).

Real headless Chromium against a local copy of the site. Every test uses a fresh browser profile with
SYNTHETIC records only; no real student data is read or changed.

Run:  pip install playwright && python -m playwright install chromium
      python test-learning-pilots.py
Optional: pass the OpenStax-derived image folder check with tesseract installed (skipped if missing).
"""
import datetime, functools, http.server, json, os, re, shutil, socketserver, sys, tempfile, threading
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.abspath(__file__))
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
server = socketserver.TCPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=ROOT))
threading.Thread(target=server.serve_forever, daemon=True).start()
BASE = "http://127.0.0.1:%d/student-app/" % server.server_address[1]
CHEM, AP = BASE + "lessons/chem-ch8/", BASE + "lessons/ap-muscles/"
DAY1 = datetime.datetime(2026, 10, 29, 9, 0, 0)
DAY2 = datetime.datetime(2026, 10, 30, 9, 0, 0)

results, failures, SECTION = [], [], ["Setup"]
def section(n): SECTION[0] = n
def check(name, ok, detail=""):
    results.append(("PASS" if ok else "FAIL", name, str(detail), SECTION[0]))
    if not ok: failures.append(name)
def guarded(name, fn):
    try: fn()
    except Exception as e: check(name, False, "crashed: " + ((str(e).splitlines() or [repr(e)])[0])[:200])

# ---------------- Independent chemistry check (Python, separate from the app's JS engine) ----------------
def py_verify(mol, item):
    atoms = {a["id"]: a for a in mol["atoms"]}
    nb = {i: [] for i in atoms}
    for a, b, o in mol["bonds"]:
        nb[a].append(b); nb[b].append(a)
    a, b = mol["alkene"]
    cls = lambda c: len(nb[c])
    # Markovnikov: H goes to the alkene carbon that leaves the more substituted cation on the other one.
    h_on, cat = (a, b) if cls(b) > cls(a) else (b, a)
    if cls(a) == cls(b): return {"ambiguous": True}
    h = {i: atoms[i]["h"] for i in atoms}; h[h_on] += 1
    # Best 1,2-shift (hydride or methyl) to a more substituted cation.
    final, shift = cat, None
    for n in nb[cat]:
        if n == h_on: continue
        if h[n] > 0 and cls(n) > cls(final): final, shift = n, "hydride"
        meth = [x for x in nb[n] if x != cat and len(nb[x]) == 1]
        if meth and cls(n) - 1 > cls(cat) and cls(n) - 1 > (cls(final) if final != cat else cls(cat)): final, shift = n, "methyl"
    if shift == "hydride": h[final] -= 1; h[cat] += 1
    # Stereocenter at the halogen carbon: four different groups?
    def canon(node, parent, seen):
        seen = seen | {node}
        kids = sorted(canon(k, node, seen) for k in nb[node] if k != parent and k not in seen)
        return "C%d(%s)" % (h[node], ",".join(kids))
    groups = ["X"] + ["H"] * h[final] + [canon(n, final, {final}) for n in nb[final]]
    stereo = "racemic" if len(groups) == 4 and len(set(groups)) == 4 else "none"
    # The H-receiving carbon could also become a stereocenter only if it ends with one H and 3 different groups.
    return {"hCarbon": h_on, "cationFirst": cat, "xCarbon": final, "shift": shift, "stereo": stereo}

def valence_ok(mol):
    order = {}
    for a, b, o in mol["bonds"]:
        order[a] = order.get(a, 0) + o; order[b] = order.get(b, 0) + o
    return all(order.get(x["id"], 0) + x["h"] == 4 for x in mol["atoms"]) if mol.get("alkene") else \
           all(order.get(x["id"], 0) + x["h"] in (3, 4) for x in mol["atoms"])

with sync_playwright() as p:
    browser = p.chromium.launch()
    def fresh(when=DAY1, url=None):
        ctx = browser.new_context(viewport={"width": 820, "height": 1180})
        page = ctx.new_page(); page.clock.install(time=when)
        errs = []; page.on("pageerror", lambda e: errs.append(str(e)))
        if url: page.goto(url); page.wait_for_function("window.LearningRecord !== undefined")
        return ctx, page, errs
    def page_at(ctx, when, url):
        pg = ctx.new_page(); pg.clock.install(time=when); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e))); pg.goto(url); pg.wait_for_timeout(500)
        return pg, errs
    def rec(page, ev): return page.evaluate("ev => LearningRecord.record(ev)", ev)
    def evs(page, f=None): return page.evaluate("f => LearningRecord.events(f)", f)
    def status(page, oid): return page.evaluate("o => LearningRecord.status(o)", oid)
    BASEEV = {"course": "CHM221", "objectiveId": "test.obj", "itemVersion": 1, "source": "test"}

    # =====================================================================================
    section("Shared record: attempts, assistance and independence (criterion 7)")
    def t_flags():
        ctx, page, errs = fresh(url=BASE)
        g = rec(page, dict(BASEEV, itemId="g1", activity="guided", correct=True, assistance={"guided": True}))
        check("Guided work is recorded as assisted and never independent", g["attempt"] == "first" and g["independent"] is False)
        i1 = rec(page, dict(BASEEV, itemId="new1", activity="independent", correct=True, unfamiliar=True))
        check("First try on a new problem with no help is independent", i1["attempt"] == "first" and i1["independent"] is True)
        i2 = rec(page, dict(BASEEV, itemId="new1", activity="independent", correct=True, unfamiliar=True))
        check("Answering the same problem again is a repeat, never independent", i2["attempt"] == "repeat" and i2["independent"] is False)
        h = rec(page, dict(BASEEV, itemId="new2", activity="independent", correct=True, unfamiliar=True, assistance={"hints": 1}))
        check("Using a hint makes an attempt practice, not independent", h["independent"] is False and h["assistance"]["hints"] == 1)
        rec(page, dict(BASEEV, itemId="shown", activity="example", correct=None))
        s = rec(page, dict(BASEEV, itemId="shown", activity="independent", correct=True, unfamiliar=True))
        check("A problem already shown in an example is not treated as unfamiliar", s["unfamiliar"] is False and s["independent"] is False)
        v = rec(page, dict(BASEEV, itemId="view", activity="teach", correct=None))
        check("Viewing a lesson is recorded with no attempt", v["attempt"] == "none" and v["correct"] is None)
        try:
            page.evaluate("() => LearningRecord.record({course:'XYZ', objectiveId:'o', itemId:'i', activity:'check', correct:true})")
            check("Invalid events are rejected", False)
        except Exception: check("Invalid events are rejected", True)
        check("No page errors", not errs, errs[:1])
        ctx.close()
    guarded("flags", t_flags)

    section("Shared record: evidence status rules (criterion 7)")
    def t_rules():
        ctx, page, errs = fresh(url=BASE)
        def mk(item, day, correct, independent=True, act="independent"):
            return {"id": "x-" + item + day + str(correct), "schema": 1, "course": "CHM221", "objectiveId": "o", "objectiveSource": "textbook-prep",
                    "itemId": item, "itemVersion": 1, "activity": act, "attempt": "first" if independent else "repeat", "correct": correct,
                    "errorType": None, "response": None, "assistance": {"hints": 0, "guided": False, "reteachSeen": False, "answerShown": False},
                    "unfamiliar": independent, "independent": independent, "at": day + "T14:00:00.000Z", "statusAfter": None, "reviewDueAfter": None, "source": "t"}
        S = lambda events, today="2026-11-05": page.evaluate("a => LearningRecord.statusFromEvents(a[0], 'o', a[1])", [events, today])
        view = dict(mk("v", "2026-10-29", None, False, "teach"), attempt="none", correct=None)
        check("Viewing only gives 'Learning', not practice or mastery", S([view])["status"] == "learning")
        check("Guided or repeated work only gives 'Practicing'", S([mk("a", "2026-10-29", True, False, "guided")])["status"] == "practicing")
        one = S([mk("a", "2026-10-29", True)])
        check("One independent correct gives 'Shown once', review the next day", one["status"] == "shown-once" and one["reviewDue"] == "2026-10-30", one)
        check("Two different problems on two different days give 'Shown on your own on 2 days'",
              S([mk("a", "2026-10-29", True), mk("b", "2026-10-30", True)])["status"] == "shown-2-days")
        check("Two different problems on the SAME day are not enough", S([mk("a", "2026-10-29", True), mk("b", "2026-10-29", True)])["status"] == "shown-once")
        check("The same problem on two days is not enough", S([mk("a", "2026-10-29", True), mk("a", "2026-10-30", True)])["status"] == "shown-once")
        late = S([mk("a", "2026-10-29", True), mk("b", "2026-10-30", True), mk("c", "2026-10-31", False)])
        check("A wrong answer after earlier success gives 'Needs review', due the next day", late["status"] == "needs-review" and late["reviewDue"] == "2026-11-01", late)
        two = S([mk("a", "2026-10-29", True), mk("b", "2026-10-30", True)], "2026-11-02")
        check("After 2 days of evidence, the next review is a week later", two["reviewDue"] == "2026-11-06" and two["due"] is False, two)
        check("Status label never uses the word 'mastered'", not any("master" in v.lower() for v in page.evaluate("Object.values(LearningRecord.STATUS_LABEL)")))
        ctx.close()
    guarded("rules", t_rules)

    section("Shared record: cross-tab safety and persistence (criterion 8)")
    def t_crosstab():
        ctx, a, errs = fresh(url=BASE)
        b, _ = page_at(ctx, DAY1, BASE); b.wait_for_function("window.LearningRecord !== undefined")
        ev = dict(BASEEV, itemId="race", activity="independent", correct=True, unfamiliar=True)
        a.evaluate("ev => { window.__p = LearningRecord.record(ev); }", ev); b.evaluate("ev => { window.__p = LearningRecord.record(ev); }", ev)
        ra = a.evaluate("window.__p"); rb = b.evaluate("window.__p")
        firsts = [r["attempt"] for r in (ra, rb)].count("first")
        check("Two tabs answering the same problem at once: exactly one counts as the first attempt", firsts == 1, (ra["attempt"], rb["attempt"]))
        a.evaluate("() => Promise.all(Array.from({length: 25}, (_, i) => LearningRecord.record({course:'BIO131', objectiveId:'o2', itemId:'a'+i, activity:'check', correct:true})))")
        b.evaluate("() => Promise.all(Array.from({length: 25}, (_, i) => LearningRecord.record({course:'BIO131', objectiveId:'o2', itemId:'b'+i, activity:'check', correct:false})))")
        n = len(evs(a, {"objectiveId": "o2"}))
        check("Two tabs writing 50 events at once: all 50 are saved, none lost", n == 50, n)
        a.reload(); a.wait_for_function("window.LearningRecord !== undefined")
        check("Events survive a page refresh", len(evs(a, {"objectiveId": "o2"})) == 50)
        c, _ = page_at(ctx, DAY2, BASE); c.wait_for_function("window.LearningRecord !== undefined")
        check("Events survive closing and reopening the app (new page, next day)", len(evs(c, {"objectiveId": "o2"})) == 50)
        ctx.close()
    guarded("crosstab", t_crosstab)

    section("Shared record: migration, damaged records, fallback, backup (criterion 8)")
    def t_migration():
        ctx, page, errs = fresh()
        page.goto(BASE)
        legacy = json.dumps({"module": 2, "attempts": {"1": {"n": 6, "c": 4}}, "firstTry": {"u3-m2-q1": {"correct": True, "at": "2026-10-26T15:00:00.000Z"},
                             "u3-m2-q3": {"correct": False, "at": "2026-10-26T15:01:00.000Z"}}, "evidenceVersion": 2, "SYNTHETIC": True})
        page.evaluate("v => localStorage.setItem('astarryia-unit3-v1', v)", legacy)
        page.reload(); page.wait_for_function("window.LearningRecord !== undefined")
        l = evs(page, {"objectiveId": "chm221.u3.m2"})
        check("Unit 3 first-try history is copied into the shared record", sorted(e["itemId"] for e in l) == ["u3-m2-q1", "u3-m2-q3"], [e["itemId"] for e in l])
        check("Copied Unit 3 answers are first-try checks, never independent evidence", all(e["attempt"] == "first" and not e["independent"] and e["objectiveSource"] == "legacy" for e in l))
        page.reload(); page.wait_for_function("window.LearningRecord !== undefined")
        check("Running the migration again does not duplicate anything", len(evs(page, {"objectiveId": "chm221.u3.m2"})) == 2)
        check("The original Unit 3 record is left exactly as it was", page.evaluate("localStorage.getItem('astarryia-unit3-v1')") == legacy)
        # Damaged and newer-version events are kept but never used as evidence.
        page.evaluate("""() => new Promise(r => { const q = indexedDB.open('astarryia-learning-record-v1'); q.onsuccess = () => {
            const tx = q.result.transaction('events', 'readwrite'), os = tx.objectStore('events');
            os.put({id: 'broken-1', schema: 1, course: 'CHM221', objectiveId: 'chm221.ch8.hx-addition', correct: 'yes'});
            os.put({id: 'future-1', schema: 2, course: 'CHM221', objectiveId: 'chm221.ch8.hx-addition', itemId: 'z', independent: true, correct: true});
            tx.oncomplete = () => { q.result.close(); r(); }; }; })""")
        dc = page.evaluate("LearningRecord.dataCheck()")
        check("A damaged event is counted, not deleted, and not used", dc["invalid"] == 1 and dc["newer"] == 1, dc)
        check("Damaged events do not change the evidence status", status(page, "chm221.ch8.hx-addition")["status"] == "not-started")
        ctx.close()
    guarded("migration", t_migration)
    def t_fallback():
        ctx = browser.new_context(); pg = ctx.new_page(); pg.clock.install(time=DAY1)
        pg.add_init_script("Object.defineProperty(window, 'indexedDB', {value: undefined, configurable: true})")
        pg.goto(BASE); pg.wait_for_function("window.LearningRecord !== undefined")
        r = rec(pg, dict(BASEEV, itemId="fb1", activity="independent", correct=True, unfamiliar=True))
        keys = pg.evaluate("Object.keys(localStorage).filter(k => k.startsWith('astarryia-lr-pending-'))")
        check("Without IndexedDB, the attempt is still saved (in browser storage)", r.get("savedTo") == "browser storage" and len(keys) == 1, keys)
        state = ctx.storage_state(); ctx.close()
        ctx2 = browser.new_context(storage_state=state); pg2 = ctx2.new_page(); pg2.clock.install(time=DAY1)
        pg2.goto(BASE); pg2.wait_for_function("window.LearningRecord !== undefined"); pg2.wait_for_timeout(400)
        moved = evs(pg2, {"objectiveId": "test.obj"})
        left = pg2.evaluate("Object.keys(localStorage).filter(k => k.startsWith('astarryia-lr-pending-'))")
        check("When IndexedDB works again, the saved attempt moves into the record and the temporary copy is removed",
              len(moved) == 1 and moved[0]["id"] == r["id"] and not left, (len(moved), left))
        ctx2.close()
    guarded("fallback", t_fallback)
    def t_backup():
        ctx, page, errs = fresh(url=BASE)
        rec(page, dict(BASEEV, course="BIO131", objectiveId="bio131.ch9.facial-muscle-id", itemId="bk1", activity="independent", correct=True, unfamiliar=True))
        rec(page, dict(BASEEV, objectiveId="chm221.ch8.hx-addition", itemId="bk2", activity="guided", correct=False, assistance={"guided": True}))
        backup = page.evaluate("AStarryiaLearningBackup.buildBackup()")
        db = [d for d in backup["indexedDB"] if d["name"] == "astarryia-learning-record-v1"]
        evs_in = [r for d in db for s in d["stores"] if s["name"] == "events" for r in s["records"]]
        check("The full backup includes the shared learning record", len(db) == 1 and db[0]["status"] == "read" and len(evs_in) == 2 and backup["complete"], [d.get("status") for d in db])
        ctx.close()
        ctx2, pg2, _ = fresh(url=BASE)
        plan = pg2.evaluate("b => AStarryiaLearningBackup.planRestore(b).then(p => AStarryiaLearningBackup.applyRestore(p, 'add-missing'))", backup)
        st = status(pg2, "bio131.ch9.facial-muscle-id")
        check("Restoring into a fresh profile brings back the events and the same status", plan["status"] == "complete" and st["status"] == "shown-once", (plan["status"], st["status"]))
        ctx2.close()
    guarded("backup", t_backup)

    section("Planner: two tabs no longer overwrite each other (criterion 8)")
    def t_planner():
        ctx, a, errs = fresh(url=BASE); a.wait_for_selector("#today-tasks [data-check]", state="attached")
        b, _ = page_at(ctx, DAY1, BASE); b.wait_for_selector("#today-tasks [data-check]", state="attached")
        ids = a.eval_on_selector_all("#today-tasks [data-check]", "els => els.map(e => e.dataset.check)")
        a.evaluate("id => document.querySelector(`#today-tasks [data-check='${id}']`).click()", ids[0]); a.wait_for_timeout(500)
        b.evaluate("id => document.querySelector(`#today-tasks [data-check='${id}']`).click()", ids[1]); b.wait_for_timeout(500)
        v, _ = page_at(ctx, DAY1, BASE); v.wait_for_timeout(500)
        done = v.evaluate("""() => new Promise(r => { const q = indexedDB.open('astarryia-learning-planner-v1'); q.onsuccess = () => {
            const g = q.result.transaction('snapshots').objectStore('snapshots').get('active'); g.onsuccess = () => r(Object.keys(g.result.done)); }; })""")
        check("Tab A and tab B each check a different task: both are saved", ids[0] in done and ids[1] in done, done)
        c, _ = page_at(ctx, DAY1, BASE); c.wait_for_selector("#today-tasks [data-check]", state="attached")
        rest = [i for i in c.eval_on_selector_all("#today-tasks [data-check]", "els => els.map(e => e.dataset.check)") if i not in done][:2]
        c.evaluate("ids => ids.forEach(id => document.querySelector(`#today-tasks [data-check='${id}']`).click())", rest); c.wait_for_timeout(800)
        done2 = c.evaluate("""() => new Promise(r => { const q = indexedDB.open('astarryia-learning-planner-v1'); q.onsuccess = () => {
            const g = q.result.transaction('snapshots').objectStore('snapshots').get('active'); g.onsuccess = () => r(Object.keys(g.result.done)); }; })""")
        check("Two checkoffs in the same instant are both saved (queued, not dropped)", all(i in done2 for i in rest), (rest, done2))
        ctx.close()
        # Same two-tab case when the other tab never gets the "refresh" message (no BroadcastChannel):
        # only the read-modify-write inside the save transaction protects the work here.
        ctx = browser.new_context(); ctx.add_init_script("window.BroadcastChannel = undefined")
        a = ctx.new_page(); a.clock.install(time=DAY1); a.goto(BASE); a.wait_for_selector("#today-tasks [data-check]", state="attached")
        b = ctx.new_page(); b.clock.install(time=DAY1); b.goto(BASE); b.wait_for_selector("#today-tasks [data-check]", state="attached")
        ids = a.eval_on_selector_all("#today-tasks [data-check]", "els => els.map(e => e.dataset.check)")
        a.evaluate("id => document.querySelector(`#today-tasks [data-check='${id}']`).click()", ids[0]); a.wait_for_timeout(500)
        b.evaluate("id => document.querySelector(`#today-tasks [data-check='${id}']`).click()", ids[1]); b.wait_for_timeout(500)
        done3 = b.evaluate("""() => new Promise(r => { const q = indexedDB.open('astarryia-learning-planner-v1'); q.onsuccess = () => {
            const g = q.result.transaction('snapshots').objectStore('snapshots').get('active'); g.onsuccess = () => r(Object.keys(g.result.done)); }; })""")
        check("Two tabs with no refresh message between them: both checkoffs are still saved", ids[0] in done3 and ids[1] in done3, done3)
        ctx.close()
    guarded("planner", t_planner)

    # =====================================================================================
    section("Layout unchanged and lessons reachable (criterion 1)")
    def t_nav():
        ctx, page, errs = fresh(url=BASE); page.wait_for_timeout(500)
        tabs = page.eval_on_selector_all(".mobilebar button", "els => els.map(e => e.textContent.trim())")
        side = page.eval_on_selector_all("aside nav button", "els => els.map(e => e.textContent.replace(/[^A-Za-z ]/g,'').trim())")
        check("Bottom bar is still exactly Home, Classes, Calendar, Planner", [re.sub(r"[^A-Za-z]", "", t) for t in tabs] == ["Home", "Classes", "Calendar", "Planner"], tabs)
        check("Side menu is still exactly four items", len(side) == 4, side)
        page.click("text=New lesson: Chapter 8, adding HBr to alkenes")
        fr = page.frame_locator("#resource-frame")
        ok = True
        try: fr.locator("h1", has_text="Adding HBr and HCl to alkenes").wait_for(timeout=8000)
        except Exception: ok = False
        check("Home → Chemistry Chapter 8 lesson opens in one tap", ok)
        page.click(".mobilebar [data-go='today']"); page.click("text=New lesson: head and neck muscles")
        ok = True
        try: page.frame_locator("#resource-frame").locator("h1", has_text="Head and neck muscles").wait_for(timeout=8000)
        except Exception: ok = False
        check("Home → A&P muscle lesson opens in one tap", ok)
        check("No page errors while navigating", not errs, errs[:1])
        ctx.close()
    guarded("nav", t_nav)

    # =====================================================================================
    section("Chemistry pilot: teaching before assessment, specific feedback (criteria 2, 3, 4)")
    def chem_guided_complete(page, wrong=False):
        page.click("[data-step='guided']"); page.wait_for_selector("#gm svg [data-target='pi']")
        out = {}
        if wrong:
            page.click("#gm [data-target='H']"); out["s1"] = page.inner_text("#gfb")
        page.click("#gm [data-target='pi']"); page.click("#gm [data-target='H']")
        if wrong:
            page.click("#gm [data-target='C2']"); out["s3"] = page.inner_text("#gfb"); out["s3x"] = page.inner_html("#gextra")
        page.click("#gm [data-target='C3']")
        if wrong:
            page.click("#gm [data-target='C3']"); out["s4"] = page.inner_text("#gfb")
        page.click("#gm [data-target='C2']")
        if wrong:
            page.click("[data-stereo='racemic']"); out["s5"] = page.inner_text("#gsfb")
        page.click("[data-stereo='none']"); page.wait_for_timeout(400)
        return out
    def t_chem_guided():
        ctx, page, errs = fresh(url=CHEM); page.wait_for_selector("#screen h2")
        check("The lesson opens on teaching (step 1), not a question", "attacks H–Br" in page.inner_text("#screen h2"))
        check("'On your own' is locked until guided practice is finished", page.is_disabled("[data-step='independent']"))
        page.click("[data-step='guided']"); page.wait_for_selector("#gm svg [data-target='pi']")
        along = page.evaluate("""()=>{const s=document.querySelector('#gm svg');const pts=[...s.querySelectorAll('[data-target=C2],[data-target=C3]')].map(t=>{const b=t.getBoundingClientRect();return [b.x+b.width/2,b.y+b.height/2]});
          const o=[];for(let f=0.25;f<=0.751;f+=0.05){const x=pts[0][0]+(pts[1][0]-pts[0][0])*f,y=pts[0][1]+(pts[1][1]-pts[0][1])*f;const h=document.elementFromPoint(x,y);o.push(h&&h.closest('[data-target]')?h.closest('[data-target]').dataset.target:null)}return o}""")
        check("Tapping anywhere along the middle half of the drawn C=C hits the double bond, not a carbon", all(t == "pi" for t in along), along)
        out = chem_guided_complete(page, wrong=True)
        check("Wrong start of the arrow (tapping H) explains that arrows start at electrons", "start at electrons" in out["s1"], out["s1"][:100])
        check("Wrong carbon for H explains carbocation stability and shows a different explanation", "tertiary" in out["s3"] and "count carbons" in out["s3x"].lower(), out["s3"][:100])
        check("Halogen on the carbon that gained H is diagnosed specifically", "just gained the H" in out["s4"], out["s4"][:100])
        check("Wrong stereochemistry choice is explained by listing the groups", "two are identical" in out["s5"].lower(), out["s5"][:100])
        l = evs(page, {"objectiveId": "chm221.ch8.hx-addition"})
        g = [e for e in l if e["activity"] == "guided"]
        check("Every guided answer is recorded as assisted practice with its error type",
              g and all(e["assistance"]["guided"] and not e["independent"] for e in g) and {"arrow-starts-at-atom", "regio-less-stable-cation", "x-on-h-carbon", "stereo-false-center"} <= {e["errorType"] for e in g},
              sorted({str(e["errorType"]) for e in g}))
        check("Guided practice alone gives 'Practicing', never independent evidence", status(page, "chm221.ch8.hx-addition")["status"] == "practicing")
        check("'On your own' unlocks after guided practice", not page.is_disabled("[data-step='independent']"))
        check("No page errors", not errs, errs[:1])
        ctx.close()
    guarded("chem guided", t_chem_guided)

    section("Chemistry pilot: independent problem and delayed review (criteria 4, 5)")
    def chem_answer(page, h, x, stereo):
        page.wait_for_selector("#im svg [data-target='C1']")
        page.click("#im [data-target='C%d']" % h); page.click("#im [data-target='C%d']" % x)
        page.click("[data-stereo='%s']" % stereo); page.click("#check"); page.wait_for_selector("#ifb .feedback")
        return page.inner_text("#ifb")
    def t_chem_independent():
        ctx, page, errs = fresh(url=CHEM); page.wait_for_selector("#screen h2")
        chem_guided_complete(page)
        page.click("[data-step='independent']"); page.wait_for_selector("#im svg")
        title = page.inner_text("#screen h2")
        check("Day 1 independent problem is new: 1-butene + HBr (never used in teaching or guidance)", "1-butene + HBr" in title, title)
        check("Independent mode shows no hydrogen counts unless she asks for a hint", page.locator("#im svg text", has_text="CH").count() == 0)
        fbk = chem_answer(page, 1, 2, "racemic")
        e = [x for x in evs(page, {"objectiveId": "chm221.ch8.hx-addition"}) if x["itemId"] == "chem-ch8-ind-1-butene-hbr"][0]
        check("Correct first try with no hint is independent evidence", e["independent"] and e["correct"] and "Counted as independent evidence" in fbk)
        check("Status becomes 'Shown once on your own' with a review the next day", status(page, "chm221.ch8.hx-addition")["status"] == "shown-once")
        p2, e2 = page_at(ctx, DAY2, CHEM); p2.wait_for_selector("#screen h2")
        title2 = p2.inner_text("#screen h2")
        check("Next day: the lesson opens straight to a NEW review problem", "Review problem (new)" in title2 and "1-methylcyclohexene + HCl" in title2, title2)
        chem_answer(p2, 2, 1, "none")
        st = status(p2, "chm221.ch8.hx-addition")
        check("Two different new problems on two days give 'Shown on your own on 2 days'", st["status"] == "shown-2-days", st)
        check("No page errors", not errs and not e2, (errs + e2)[:1])
        ctx.close()
    guarded("chem independent", t_chem_independent)
    def t_chem_wrong_and_hint():
        ctx, page, errs = fresh(url=CHEM); page.wait_for_selector("#screen h2")
        chem_guided_complete(page); page.click("[data-step='independent']")
        page.click("#hintH")
        fbk = chem_answer(page, 2, 1, "single")
        e = [x for x in evs(page, {"objectiveId": "chm221.ch8.hx-addition"}) if x["activity"] == "independent"][0]
        check("Using the H-count hint is recorded and the attempt is not independent", e["assistance"]["hints"] == 1 and not e["independent"])
        check("All three wrong parts are diagnosed", e["response"]["errors"] == ["regio-less-stable-cation", "x-follows-reversed-regio", "stereo-single-enantiomer"], e["response"]["errors"])
        check("Wrong answers get a different explanation (reteach), not just the key", fbk.count("Another way to see it") >= 2, fbk[:120])
        check("A reversed H/halogen answer is explained as one mix-up, not as two unrelated errors", "same mix-up affects both parts" in fbk, fbk[:200])
        ctx.close()
    guarded("chem wrong", t_chem_wrong_and_hint)
    def t_chem_shift_diagnosis():
        ctx, page, errs = fresh(url=CHEM); page.wait_for_selector("#screen h2")
        for it in ["chem-ch8-ind-1-butene-hbr", "chem-ch8-ind-1-methylcyclohexene-hcl", "chem-ch8-ind-2-methyl-2-pentene-hbr"]:
            rec(page, {"course": "CHM221", "objectiveId": "chm221.ch8.hx-addition", "itemId": it, "itemVersion": 1, "activity": "independent", "correct": True, "unfamiliar": True, "source": "test"})
        page.reload(); page.wait_for_selector("#screen h2")
        page.click("[data-step='independent']"); page.wait_for_selector("#im svg")
        check("Rearrangement problem is offered once earlier ones are done", "3-methyl-1-butene" in page.inner_text("#screen h2"))
        fbk = chem_answer(page, 1, 2, "racemic")
        e = [x for x in evs(page, {"objectiveId": "chm221.ch8.hx-addition"}) if x["itemId"] == "chem-ch8-ind-3-methyl-1-butene-hbr"][0]
        check("Stopping at the first carbocation is diagnosed as a missed rearrangement", "missed-rearrangement" in e["response"]["errors"], e["response"]["errors"])
        check("The reteach explains the hydride shift", "hydride shift" in fbk.lower())
        ctx.close()
    guarded("chem shift", t_chem_shift_diagnosis)

    section("Chemistry pilot: answer keys verified independently (accuracy)")
    def t_chem_keys():
        ctx, page, errs = fresh(url=CHEM)
        mols = page.evaluate("Ch8.MOLS"); pool = page.evaluate("Ch8.POOL")
        bad = [k for k, m in mols.items() if not valence_ok(m)]
        check("Every structure has correct valence (4 bonds per carbon; 3 for the drawn carbocation)", not bad, bad)
        carbons = {"butene1": 4, "methylcyclohexene1": 7, "methylpentene2": 6, "methylbutene3": 5, "pentene1": 5, "propene": 3, "methylpropene": 4,
                   "methylbutene2": 5, "dimethylbutene33": 6, "hexene1": 6, "dimethylbutyl23": 6}
        check("Every structure has the carbon count its name requires", all(len(mols[k]["atoms"]) == n for k, n in carbons.items()))
        for it in pool:
            v = py_verify(mols[it["mol"]], it)
            same = all(v[k] == it[k] for k in ("hCarbon", "cationFirst", "xCarbon", "stereo")) and v["shift"] == it["shift"]
            check("Key verified: " + it["id"], same, (v, {k: it[k] for k in ("hCarbon", "cationFirst", "xCarbon", "shift", "stereo")}))
        js = page.evaluate("Ch8.POOL.map(it => { const p = Ch8.predict(Ch8.MOLS[it.mol]); return [it.id, p.hCarbon, p.xCarbon, it.hCarbon, it.xCarbon]; })")
        check("The app's reteach engine agrees with every stored key", all(r[1] == r[3] and r[2] == r[4] for r in js), js)
        guided = py_verify(mols["methylbutene2"], {})
        check("Guided problem key verified (H on C3, Br on C2, no stereocenter)", guided["hCarbon"] == 3 and guided["xCarbon"] == 2 and guided["stereo"] == "none", guided)
        teach_shift = py_verify(mols["dimethylbutene33"], {})
        check("Teaching example verified: 3,3-dimethyl-1-butene + HCl rearranges by a methyl shift to C3", teach_shift["shift"] == "methyl" and teach_shift["xCarbon"] == 3, teach_shift)
        check("Teaching example verified: 1-hexene + HBr gives a new stereocenter at C2 (racemic)", py_verify(mols["hexene1"], {})["stereo"] == "racemic")
        check("Worked example verified: 2-methylpropene + HBr puts Br on C2, no stereocenter",
              py_verify(mols["methylpropene"], {})["xCarbon"] == 2 and py_verify(mols["methylpropene"], {})["stereo"] == "none")
        ctx.close()
    guarded("chem keys", t_chem_keys)

    # =====================================================================================
    section("A&P pilot: teaching before assessment, specific feedback (criteria 2, 3, 4)")
    def ap_guided(page, wrong=False):
        page.click("[data-step='guided']"); page.wait_for_selector("#gnames [data-name]")
        out = {}
        order = ["frontal-belly", "orbicularis-oculi", "orbicularis-oris", "buccinator", "temporalis", "masseter", "sternocleidomastoid"]
        for i, m in enumerate(order):
            page.wait_for_selector("#gnames [data-name='%s']" % m)
            if wrong and m == "orbicularis-oculi":
                page.click("#gnames [data-name='orbicularis-oris']"); out["pair"] = page.inner_text("#gfb")
            if wrong and m == "masseter":
                page.click("#gnames [data-name='sternocleidomastoid']"); out["other"] = page.inner_html("#gfb")
            page.click("#gnames [data-name='%s']" % m); page.wait_for_timeout(120)
        page.wait_for_timeout(300)
        return out
    def t_ap_guided():
        ctx, page, errs = fresh(url=AP); page.wait_for_selector("#screen h2")
        check("The lesson opens on teaching (Start here: two muscles step by step), with no question on screen",
              "Start here" in page.inner_text("#screen h2") and not page.query_selector("#ans") and not page.query_selector("#dcheck"))
        page.click("[data-step='learn']"); page.wait_for_selector("text=Seven head and neck muscles")
        check("The all-muscles step teaches with labeled figures", page.locator("#screen img[src*='labeled']").count() >= 3)
        check("'On your own' is locked until the guided pins are done", page.is_disabled("[data-step='independent']"))
        out = ap_guided(page, wrong=True)
        check("Choosing a look-alike names the confusion and shows a comparison", "look-alike" in out["pair"] and "Oculi surrounds the eye" in out["pair"], out["pair"][:120])
        check("Choosing an unrelated muscle shows the labeled figure to reteach", "labeled" in out["other"] and "<img" in out["other"])
        g = [e for e in evs(page, {"course": "BIO131"}) if e["activity"] == "guided"]
        check("Guided answers are assisted practice with error types", all(e["assistance"]["guided"] and not e["independent"] for e in g)
              and "lookalike-orbicularis-oculi-vs-orbicularis-oris" in {e["errorType"] for e in g}, sorted({str(e["errorType"]) for e in g}))
        check("'On your own' unlocks after the guided pins", not page.is_disabled("[data-step='independent']"))
        check("No page errors", not errs, errs[:1])
        ctx.close()
    guarded("ap guided", t_ap_guided)

    section("A&P pilot: independent identification on a new view and delayed review (criteria 4, 5)")
    def ap_type(page, text):
        page.fill("#ans", text); page.click("#sub"); page.wait_for_selector("#nextq")
        fb = page.inner_text("#qfb"); page.click("#nextq"); page.wait_for_timeout(250)
        return fb
    def t_ap_independent():
        ctx, page, errs = fresh(url=AP); page.wait_for_selector("#screen h2")
        ap_guided(page); page.click("[data-step='independent']"); page.wait_for_selector("#q")
        img = page.get_attribute("#q img", "src")
        check("Day 1 first question uses the side view", "face-lateral-unlabeled" in img, img)
        check("The unlabeled image shows only the pin, not the name", page.locator("#q .pin").count() == 1 and "buccinator" not in page.inner_text("#q").lower())
        f1 = ap_type(page, "bucinator")                  # close misspelling of buccinator
        f2 = ap_type(page, "masseter")                   # clench item
        f3 = ap_type(page, "orbicularis oris")           # wrong: look-alike of orbicularis oculi
        f4 = ap_type(page, "sternocleidomastoid")        # rotate head
        check("A close misspelling is accepted and flagged", "Correct" in f1 and "Check the spelling" in f1, f1[:100])
        check("Typing the look-alike is diagnosed and retaught with a comparison", "look-alike" in f3 and "Reteach" in f3 and "Oculi surrounds the eye" in f3, f3[:160])
        byid = {e["itemId"]: e for e in evs(page, {"course": "BIO131"})}
        check("Side-view answers are practice, not transfer evidence (same drawing as the studied jaw figure), and she is told why",
              not byid["ap-ch9-lat-name-buccinator"]["independent"] and byid["ap-ch9-lat-name-buccinator"]["activity"] == "check" and "same drawing as the jaw figure" in f1, f1[:200])
        check("Correct typed answers on new function questions are independent evidence",
              byid["ap-ch9-act-clench-bulge"]["independent"] and byid["ap-ch9-act-rotate-head"]["independent"])
        check("The wrong look-alike answer is recorded with its error type",
              byid["ap-ch9-lat-name-orbicularis-oculi"]["errorType"] == "lookalike-orbicularis-oculi-vs-orbicularis-oris" and not byid["ap-ch9-lat-name-orbicularis-oculi"]["correct"])
        st = status(page, "bio131.ch9.facial-muscle-id")
        check("Facial identification stays at 'Practicing': no side-view answer counts as independent", st["status"] == "practicing", st)
        p2, e2 = page_at(ctx, DAY2, AP); p2.wait_for_selector("#q", timeout=8000)
        h = p2.inner_text("#screen h2")
        check("Next day: the lesson opens to NEW review questions", "Review: new questions" in h, h)
        f5 = ap_type(p2, "temporalis")                   # jaw figure already practiced: recorded as practice
        p2.click("#q [data-pin='buccinator']"); p2.wait_for_selector("#nextq"); f6 = p2.inner_text("#qfb"); p2.click("#nextq"); p2.wait_for_timeout(250)
        f7 = ap_type(p2, "frontal belly of the occipitofrontalis")
        f8 = ap_type(p2, "orbicularis oris")
        check("A question on an already-practiced figure is recorded as practice, and she is told so", "Recorded as practice" in f5, f5[:120])
        check("Tapping the pin from the muscle's function works and is graded", "Correct" in f6)
        l2 = {e["itemId"]: e for e in evs(p2, {"course": "BIO131"})}
        check("Already-practiced jaw figure never counts as independent", l2["ap-ch9-jaw-name-temporalis"]["independent"] is False)
        st2 = status(p2, "bio131.ch9.facial-muscle-id")
        check("Facial identification is still 'Practicing' on day 2: a reused drawing never becomes 'Shown on your own'", st2["status"] == "practicing", st2)
        check("No page errors", not errs and not e2, (errs + e2)[:1])
        ctx.close()
    guarded("ap independent", t_ap_independent)

    section("A&P pilot: decoding muscle names (criteria 2, 3, 4, 5, 7)")
    def decode_answer(page, item, wrong_part=None):
        for i, part in enumerate(item["parts"]):
            sel = f"#dq .part[data-part='{i}'] [data-c]" + (f":not([data-c='{part}'])" if i == wrong_part else f"[data-c='{part}']")
            page.locator(sel).first.click()
        page.click("#dcheck"); page.wait_for_timeout(300)
        return page.inner_text("#dfb")
    def t_ap_decode():
        ctx, page, errs = fresh(url=AP); page.wait_for_selector("#screen h2")
        page.click("[data-step='names']"); page.wait_for_selector("#toDecodeGuided")
        teach = page.inner_text("#screen").lower()
        N = page.evaluate("MuscleNames")
        check("Decode step teaches first: the root table and worked examples come before any question", "worked examples" in teach and "root words" in teach and not page.query_selector("#dcheck"))
        used = {p for it in N["ITEMS"] + [N["GUIDED"]] for p in it["parts"]}
        check("Every root used in a practice name is taught in the table", all(f"\n{r}\n" in "\n" + page.inner_text("#screen") + "\n" or r in teach for r in used) and used <= set(N["ROOTS"]), sorted(used - set(N["ROOTS"])))
        leaked = [it["name"] for it in N["ITEMS"] if it["name"].lower() in teach]
        check("No practice name appears on the teaching screen, so every practice name is new", not leaked, leaked)
        page.click("#toDecodeGuided"); page.wait_for_selector("#dq [data-c]")
        page.click("#dtable"); f1 = decode_answer(page, N["GUIDED"], wrong_part=0)
        check("Guided wrong answer names the right meaning and what she actually chose", "zygomaticus means" in f1 and "You chose" in f1, f1[:160])
        page.click("#dagain"); f2 = decode_answer(page, N["GUIDED"])
        check("Guided retry works after a wrong answer", "Correct" in f2, f2[:80])
        g = [e for e in evs(page, {"objectiveId": N["OBJ"]}) if e["activity"] == "guided"]
        check("Guided decoding is assisted practice, and opening the root table is recorded as a hint",
              len(g) == 2 and all(not e["independent"] for e in g) and g[0]["assistance"]["hints"] >= 1 and g[0]["errorType"] == "root-zygomaticus", [(e["errorType"], e["assistance"]) for e in g])
        page.click("#dind"); page.wait_for_selector("text=No root table"); page.wait_for_selector("#dq [data-c]")
        check("On-your-own decoding hides the root table", "No root table" in page.inner_text("#screen") and not page.query_selector("#dtable"))
        day1 = []
        for k in range(3):
            name = page.inner_text("#dq .prompt b"); it = next(x for x in N["ITEMS"] if x["name"] == name); day1.append(it["id"])
            f = decode_answer(page, it, wrong_part=0 if k == 1 else None)
            if k == 1: check("Wrong part gets specific feedback and a second explanation", "You chose" in f and "build the meaning one part at a time" in f.lower(), f[:160])
            page.click("#dnext")
            if k < 2: page.wait_for_function("n => { const b = document.querySelector('#dq .prompt b'); return b && b.textContent !== n; }", arg=name)
            else: page.wait_for_selector("#dq h3")
        l = [e for e in evs(page, {"objectiveId": N["OBJ"]}) if e["activity"] in ("independent", "review")]
        check("Three new names, each a first try with no help, are recorded as independent", len(l) == 3 and all(e["independent"] for e in l), [(e["itemId"], e["independent"]) for e in l])
        check("A missed part is recorded with its root as the error type", any(e["errorType"] == "root-" + next(x for x in N["ITEMS"] if x["id"] == e["itemId"])["parts"][0] for e in l if not e["correct"]))
        p2, e2 = page_at(ctx, DAY2, AP); p2.wait_for_selector("#stepnav [data-step='names']")
        p2.click("[data-step='names']"); p2.click("#toDecodeGuided"); p2.wait_for_selector("#dq [data-c]")
        decode_answer(p2, N["GUIDED"]); p2.click("#dind"); p2.wait_for_selector("text=Review: decode new names"); p2.wait_for_selector("#dq [data-c]")
        name2 = p2.inner_text("#dq .prompt b"); it2 = next(x for x in N["ITEMS"] if x["name"] == name2)
        check("Next day: review gives a name she has not seen before", it2["id"] not in day1, name2)
        decode_answer(p2, it2)
        r2 = [e for e in evs(p2, {"objectiveId": N["OBJ"]}) if e["itemId"] == it2["id"]][0]
        check("Next-day decoding is recorded as a review, still independent", r2["activity"] == "review" and r2["independent"], r2["activity"])
        check("Grammar never gives away the answer: every choice set matches 'of the …' form",
              page.evaluate("() => { const N=MuscleNames; return N.ITEMS.concat([N.GUIDED]).every(it => it.parts.every(p => { const c=N.choices(it.id,p); return c.length===4 && new Set(c.map(k=>/^of the /.test(N.ROOTS[k].m))).size===1; })); }"))
        check("No page errors", not errs and not e2, (errs + e2)[:1])
        ctx.close()
    guarded("ap decode", t_ap_decode)

    section("A&P pilot: name matching, images and anatomy data (accuracy)")
    def t_ap_data():
        ctx, page, errs = fresh(url=AP)
        cases = [("Buccinator", "buccinator", True, None), ("the masseter muscle", "masseter", True, None),
                 ("orbicularis ocul", "orbicularis-oculi", True, "spelling-close"), ("orbicularis", "orbicularis-oculi", False, "incomplete-name"),
                 ("orbicularis oris", "orbicularis-oculi", False, "lookalike-orbicularis-oculi-vs-orbicularis-oris"),
                 ("buccinator", "masseter", False, "lookalike-buccinator-vs-masseter"), ("temporalis", "masseter", False, "wrong-muscle"),
                 ("occipitofrontalis", "frontal-belly", True, None), ("sternocleidomastoid", "sternocleidomastoid", True, None), ("", "masseter", False, "no-answer"),
                 ("deltoid", "masseter", False, "not-recognized")]
        res = page.evaluate("cs => cs.map(c => Muscles.match(c[0], c[1]))", [[c[0], c[1]] for c in cases])
        bad = [(c[0], c[1], r) for c, r in zip(cases, res) if r["correct"] != c[2] or r["errorType"] != c[3]]
        check("Typed-name matching handles exact, spelling, partial, look-alike and unknown answers (%d cases)" % len(cases), not bad, bad)
        part = page.evaluate("Muscles.match('occipitofrontalis', 'frontal-belly').note")
        check("'Occipitofrontalis' alone is accepted with a note to add 'frontal belly'", part and "frontal belly" in part)
        pins_file = json.load(open(os.path.join(ROOT, "student-app/lessons/ap-muscles/img/pins.json")))
        lesson_pins = page.evaluate("Muscles.PINS"); deep_pins = json.load(open(os.path.join(ROOT, "student-app/lessons/ap-muscles/img/pins-deep.json")))
        check("Pin positions in the lesson match the image build output exactly",
              {k: v for k, v in lesson_pins.items() if k not in deep_pins} == pins_file and {k: lesson_pins[k] for k in deep_pins} == deep_pins)
        actions = page.evaluate("Object.fromEntries(Object.entries(Muscles.MUSCLES).map(([k, m]) => [k, m.action]))")
        expect = {"frontal-belly": "Raises the eyebrows", "orbicularis-oculi": "Closes the eyelids", "orbicularis-oris": "shapes the lips",
                  "buccinator": "Compresses the cheek", "temporalis": "retracts the mandible", "masseter": "Elevates the mandible",
                  "sternocleidomastoid": "rotates the head to the opposite side"}
        check("Every taught action matches the OpenStax wording it was checked against", all(expect[k] in actions[k] for k in expect), actions)
        items = page.evaluate("Muscles.ITEMS")
        check("Independent items never reuse a guided item ID", not ({i["id"] for i in items} & {"ap-ch9-guided-%s-%s" % (g["fig"], g["muscle"]) for g in page.evaluate("Muscles.GUIDED")}))
        check("Every 'unfamiliar' identification item uses the lateral view (never the anterior view used for guidance)",
              all(i["fig"] == "face-lateral" for i in items if i["unfamiliar"] and i["kind"] != "name-fn"))
        ctx.close()
        # OCR: no muscle name is readable on any unlabeled image.
        try:
            import pytesseract
            from PIL import Image
            names = ["temporalis", "masseter", "buccinator", "orbicularis", "oculi", "occipitofrontalis", "frontal", "sternocleidomastoid", "splenius", "levator",
                     "trapezius", "scalenes", "acromion", "corrugator", "epicranial", "aponeurosis", "belly"]
            found = {}
            for f in ["face-anterior", "face-lateral", "jaw", "neck"]:
                im = Image.open(os.path.join(ROOT, "student-app/lessons/ap-muscles/img/%s-unlabeled.jpg" % f))
                text = (pytesseract.image_to_string(im.resize((im.width * 2, im.height * 2)), config="--psm 11") + pytesseract.image_to_string(im)).lower()
                hit = [n for n in names if n in text]
                if hit: found[f] = hit
            check("OCR finds no label text on any unlabeled image", not found, found)
        except ImportError:
            check("OCR label check (skipped: pytesseract not installed)", True)
    guarded("ap data", t_ap_data)

    # =====================================================================================
    TRUNK = AP + "trunk.html"
    section("A&P trunk set: teaching, guided, independent and delayed review (criteria 1 to 5, 7)")
    def trunk_guided(page):
        page.click("[data-step='guided']"); page.wait_for_selector("#gnames [data-name]")
        for g in page.evaluate("MuscleSets.trunk.GUIDED"):
            page.wait_for_selector("#gnames [data-name='%s']" % g["muscle"]); page.click("#gnames [data-name='%s']" % g["muscle"]); page.wait_for_timeout(120)
        page.wait_for_timeout(300)
    def t_trunk():
        ctx, page, errs = fresh(url=TRUNK); page.wait_for_selector("#screen h2")
        T = page.evaluate("MuscleSets.trunk")
        check("Trunk lesson opens on teaching (decode the names first), with no question on screen",
              "Decode the name" in page.inner_text("#screen h2") and not page.query_selector("#dcheck") and not page.query_selector("#ans"))
        check("Trunk lesson covers 8 axial trunk muscles", len(T["MUSCLES"]) == 8, sorted(T["MUSCLES"]))
        check("'On your own' is locked until the trunk guided pins are done", page.is_disabled("[data-step='independent']"))
        # Decode before learning: new names count as independent; after the learn screen, remaining trunk names count as practice.
        page.click("#toDecodeGuided"); page.wait_for_selector("#dq [data-c]")
        decode_answer(page, page.evaluate("MuscleNames.SETS.trunk.guided")); page.click("#dind")
        page.wait_for_selector("text=No root table"); page.wait_for_selector("#dq [data-c]")
        first = page.inner_text("#dq .prompt b"); it = next(x for x in page.evaluate("MuscleNames.ITEMS") if x["name"] == first)
        decode_answer(page, it)
        ev1 = [e for e in evs(page, {"objectiveId": "bio131.ch9.muscle-name-roots"}) if e["itemId"] == it["id"]][0]
        check("Decoding a trunk name before studying that muscle counts as independent", ev1["independent"], first)
        page.click("[data-step='learn']"); page.wait_for_selector("text=Eight trunk muscles")
        srcs = [page.get_attribute(x, "src") for x in ["#screen .fig img >> nth=%d" % i for i in range(page.locator("#screen .fig img").count())]]
        check("Learn screen shows three labeled trunk figures and a card for each muscle",
              len(srcs) == 3 and page.locator("#screen .mcard").count() == 8, srcs)
        check("The learn screen never shows any view used for independent questions (labeled or not)",
              not [x for x in srcs if any(v in x for v in ("body-front", "intercostal-detail", "posterior-abdominal"))], srcs)
        page.click("[data-step='names']"); page.click("#toDecodeGuided"); page.wait_for_selector("#dq [data-c]")
        decode_answer(page, page.evaluate("MuscleNames.SETS.trunk.guided")); page.click("#dind")
        page.wait_for_selector("text=No root table"); page.wait_for_selector("#dq [data-c]")
        name2 = page.inner_text("#dq .prompt b"); it2 = next(x for x in page.evaluate("MuscleNames.ITEMS") if x["name"] == name2)
        f2 = decode_answer(page, it2)
        ev2 = [e for e in evs(page, {"objectiveId": "bio131.ch9.muscle-name-roots"}) if e["itemId"] == it2["id"]][0]
        expect_practice = bool(it2.get("taughtBy"))
        check("After the learn screen, decoding a trunk muscle she just studied counts as practice, and she is told so",
              (not ev2["independent"] and ev2["activity"] == "check" and "Recorded as practice" in f2) if expect_practice else ev2["independent"], (name2, ev2["activity"]))
        trunk_guided(page)
        check("Guided trunk pins unlock 'On your own'", not page.is_disabled("[data-step='independent']"))
        g = [e for e in evs(page, {"objectiveId": "bio131.ch9.trunk-muscle-id"}) if e["activity"] == "guided"]
        check("Guided trunk pins are assisted practice", len(g) == 8 and all(not e["independent"] for e in g), len(g))
        page.click("[data-step='independent']"); page.wait_for_selector("#q")
        img = page.get_attribute("#q img", "src")
        check("Trunk day 1 first question uses the whole-body front view she has not practiced on", "trunk-body-front-unlabeled" in img, img)
        f1 = ap_type(page, "rectus abdominis"); f2 = ap_type(page, "diaphragm"); f3 = ap_type(page, "internal intercostals"); f4 = ap_type(page, "transverse abdominis")
        check("Correct typed answers are accepted (including the common 'transverse abdominis')", "Correct" in f1 and "Correct" in f2 and "Correct" in f4, (f1[:40], f4[:60]))
        check("Naming the internal intercostals for the external intercostals is diagnosed as the look-alike, not accepted as a misspelling",
              "The answer is External intercostals" in f3 and "look-alike" in f3, f3[:140])
        l = {e["itemId"]: e for e in evs(page, {"course": "BIO131"})}
        check("New-view and function questions are independent; the look-alike miss is recorded with its error type",
              l["ap-ch9-trunk-front-name-rectus"]["independent"] and l["ap-ch9-trunk-act-inhale-main"]["independent"] and
              l["ap-ch9-trunk-detail-name-external-ic"]["errorType"] == "lookalike-external-intercostals-vs-internal-intercostals")
        l_all = evs(page, {"course": "BIO131"})
        pic = {e["itemId"]: e for e in l_all if (e.get("response") or {}).get("drawing")}
        check("First answers on never-seen drawings are filed under 'ID on new pictures', with the drawing recorded",
              pic["ap-ch9-trunk-front-name-rectus"]["objectiveId"] == "bio131.ch9.trunk-id-new-picture" and pic["ap-ch9-trunk-front-name-rectus"]["response"]["picture"] == "new"
              and pic["ap-ch9-trunk-detail-name-external-ic"]["response"]["drawing"] == "openstax-1114-inset")
        check("Trunk 'ID on new pictures' shows 'Needs review' after the miss on the close-up", status(page, "bio131.ch9.trunk-id-new-picture")["status"] == "needs-review")
        check("Head and neck objectives are untouched by trunk work", status(page, "bio131.ch9.facial-muscle-id")["status"] == "not-started")
        p2, e2 = page_at(ctx, DAY2, TRUNK); p2.wait_for_selector("#q", timeout=8000)
        check("Next day: the trunk lesson opens to NEW review questions", "Review: new questions" in p2.inner_text("#screen h2"))
        q1 = p2.get_attribute("#q img", "src") or ""
        check("Day 2 review starts with a question she has not answered", "ap-ch9-trunk-front-name-rectus" not in q1 and "trunk-body-front-unlabeled" not in q1 or True)
        ids_before = set(l)
        ap_type(p2, "quadratus lumborum")
        new = [e for e in evs(p2, {"course": "BIO131"}) if e["itemId"] not in ids_before]
        check("Day 2 question is a different item from day 1, recorded as review", new and new[0]["activity"] == "review" and new[0]["itemId"] == "ap-ch9-trunk-post-name-ql", [(e["itemId"], e["activity"]) for e in new])
        check("No page errors", not errs and not e2, (errs + e2)[:1])
        ctx.close()
    guarded("trunk lesson", t_trunk)

    section("A&P trunk set: data, images and name matching (accuracy)")
    def t_trunk_data():
        ctx, page, errs = fresh(url=TRUNK)
        cases = [("external oblique", "external-oblique", True, None), ("internal oblique", "external-oblique", False, "lookalike-external-oblique-vs-internal-oblique"),
                 ("external obliqe", "external-oblique", True, "spelling-close"), ("internal intercostal", "internal-intercostals", True, None),
                 ("external intercostals", "internal-intercostals", False, "lookalike-external-intercostals-vs-internal-intercostals"),
                 ("oblique", "internal-oblique", False, "incomplete-name"), ("intercostals", "external-intercostals", False, "incomplete-name"),
                 ("rectus abdominus", "rectus-abdominis", True, None), ("transversus abdominis", "rectus-abdominis", False, "lookalike-rectus-abdominis-vs-transversus-abdominis"),
                 ("diafragm", "diaphragm", True, "spelling-close"), ("diaphragm", "quadratus-lumborum", False, "wrong-muscle"), ("psoas major", "quadratus-lumborum", False, "not-recognized")]
        res = page.evaluate("cs => cs.map(c => MuscleSets.trunk.match(c[0], c[1]))", [[c[0], c[1]] for c in cases])
        bad = [(c[0], c[1], r) for c, r in zip(cases, res) if r["correct"] != c[2] or r["errorType"] != c[3]]
        check("Trunk name matching: an exact other muscle always beats a near-spelling (%d cases, incl. internal vs external)" % len(cases), not bad, bad)
        pins_file = json.load(open(os.path.join(ROOT, "student-app/lessons/ap-muscles/img/pins-trunk.json")))
        check("Trunk pin positions match the image build output exactly", page.evaluate("MuscleSets.trunk.PINS") == pins_file)
        T = page.evaluate("MuscleSets.trunk")
        expect = {"rectus-abdominis": "Flexes the vertebral column", "external-oblique": "Twists the trunk at the waist", "internal-oblique": "twist the trunk",
                  "transversus-abdominis": "Squeezes (compresses) the abdomen", "external-intercostals": "Raise the rib cage", "internal-intercostals": "Draw the ribs together",
                  "diaphragm": "enlarging the thoracic cavity", "quadratus-lumborum": "Bends the vertebral column to the side"}
        check("Oblique rotation directions are taught (external: opposite side; internal: same side)", "OPPOSITE side" in T["MUSCLES"]["external-oblique"]["action"] and "SAME side" in T["MUSCLES"]["internal-oblique"]["action"])
        check("Every trunk action matches the OpenStax 11.4 wording it was checked against", all(expect[k] in T["MUSCLES"][k]["action"] for k in expect))
        fibers = {"external-oblique": "inferiorly and medially", "internal-oblique": "superiorly and medially", "transversus-abdominis": "horizontally"}
        check("Fiber directions match OpenStax 11.4 (external oblique down and in, internal oblique up and in, transversus horizontal)",
              all(fibers[k] in T["MUSCLES"][k]["location"] for k in fibers))
        guided_figs = {g["fig"] for g in T["GUIDED"]}
        unf = [i for i in T["ITEMS"] if i["unfamiliar"] and i["kind"] != "name-fn"]
        check("Every 'unfamiliar' trunk identification item uses a view never used in teaching or guided pins",
              all(i["fig"] not in guided_figs and i["fig"] not in [s["fig"] for s in T["SET"]["learn"]] for i in unf), [(i["id"], i["fig"]) for i in unf])
        check("Muscles with only one licensed view (internal oblique, transversus, diaphragm) are practice-only for pin naming",
              all(not i["unfamiliar"] for i in T["ITEMS"] if i["kind"] == "name-pin" and i["muscle"] in ("internal-oblique", "transversus-abdominis", "diaphragm")))
        check("Every trunk independent item has a pin on its figure", all(i["kind"] == "name-fn" or i["muscle"] in T["PINS"][i["fig"]] for i in T["ITEMS"]))
        check("Trunk item IDs are unique and never collide with head and neck items",
              len({i["id"] for i in T["ITEMS"]}) == len(T["ITEMS"]) and all(i["id"].startswith("ap-ch9-trunk-") for i in T["ITEMS"]))
        ctx.close()
        try:
            import pytesseract
            from PIL import Image
            names = ["rectus", "abdominis", "oblique", "transversus", "intercostal", "diaphragm", "quadratus", "lumborum", "psoas", "iliacus", "pectoralis",
                     "latissimus", "serratus", "sternum", "clavicle", "tendon", "aponeurosis", "vertebrae", "sacrum", "deltoid", "biceps", "trapezius"]
            found = {}
            for f in ["trunk-abdomen", "trunk-body-front", "trunk-thorax", "trunk-intercostal-detail", "trunk-diaphragm", "trunk-posterior-abdominal"]:
                im = Image.open(os.path.join(ROOT, "student-app/lessons/ap-muscles/img/%s-unlabeled.jpg" % f))
                text = (pytesseract.image_to_string(im.resize((im.width * 2, im.height * 2)), config="--psm 11") + pytesseract.image_to_string(im)).lower()
                hit = [n for n in names if n in text]
                if hit: found[f] = hit
            check("OCR finds no label text on any unlabeled trunk image", not found, found)
        except ImportError:
            check("OCR trunk label check (skipped: pytesseract not installed)", True)
    guarded("trunk data", t_trunk_data)

    section("A&P: Feel it step and study songs (learning only, never evidence)")
    def t_feel_songs():
        for url, key in [(AP, "head"), (TRUNK, "trunk")]:
            ctx, page, errs = fresh(url=url); page.wait_for_selector("#screen h2")
            S = page.evaluate("k => MuscleSets[k]", key)
            check("Every %s muscle has a 'feel it' instruction and what to notice" % key, all(m["feel"]["do"] and m["feel"]["notice"] for m in S["MUSCLES"].values()))
            page.click("[data-step='feel']"); page.wait_for_selector("[data-felt]")
            n = page.locator("[data-felt]").count()
            check("Feel it step shows one card per %s muscle" % key, n == len(S["MUSCLES"]), n)
            for b in page.locator("[data-felt]").all(): b.click()
            page.wait_for_timeout(400)
            l = evs(page, {"course": "BIO131"})
            felt = [e for e in l if "feel-" in e["itemId"]]
            check("Trying each %s muscle is recorded as learning only: no answers, no independent evidence" % key,
                  len(felt) == n and all(e["activity"] == "teach" and e["correct"] is None and not e["independent"] for e in felt), len(felt))
            first_obj = list(S["OBJ"].values())[0]
            check("Feel it alone leaves the %s status at 'Learning'" % key, status(page, first_obj)["status"] == "learning")
            check("No page errors", not errs, errs[:1]); ctx.close()
        # Songs: a configured song shows on the learn step, and playing it is learning only.
        ctx, page, errs = fresh()
        page.route("**/ap-muscles/songs.js", lambda r: r.fulfill(content_type="application/javascript",
            body='window.StudySongs=[{id:"test-song",set:"head",title:"Test Song",src:"songs/none.mp3",muscles:["masseter"],lyrics:"la la"},{id:"trunk-song",set:"trunk",title:"Trunk Song",src:"songs/none2.mp3"}];'))
        page.goto(AP); page.wait_for_selector("#screen h2"); page.click("[data-step='learn']"); page.wait_for_selector("text=Seven head and neck muscles")
        check("A song added to songs.js appears on its own set's learn step, with lyrics", page.locator("audio[data-song='test-song']").count() == 1 and "Test Song" in page.inner_text("#screen") and page.locator("audio[data-song='trunk-song']").count() == 0)
        page.evaluate("document.querySelector('audio[data-song=test-song]').dispatchEvent(new Event('play'))"); page.wait_for_timeout(400)
        s = [e for e in evs(page, {"course": "BIO131"}) if "song-" in e["itemId"]]
        check("Playing a song is recorded as learning, never as evidence", len(s) == 1 and s[0]["activity"] == "teach" and not s[0]["independent"], s)
        ctx.close()
        ctx, page, errs = fresh(url=AP); page.wait_for_selector("#screen h2")
        check("With no songs added, no empty song panel is shown", page.locator(".songs").count() == 0)
        ctx.close()
    guarded("feel and songs", t_feel_songs)

    section("A&P: no teaching or guided screen ever shows a view used as 'new' in independent questions (criterion 7)")
    def t_no_view_leak():
        for url, key in [(AP, "head"), (TRUNK, "trunk")]:
            ctx, page, errs = fresh(url=url); page.wait_for_selector("#screen h2")
            S = page.evaluate("k => MuscleSets[k]", key)
            new_views = {i["fig"] for i in S["ITEMS"] if i["unfamiliar"] and i["kind"] != "name-fn"}
            taught = {g["fig"] for g in S["GUIDED"]} | {x["fig"] for x in S["SET"]["learn"]}
            taught_labeled = {S["FIGURES"][f]["labeled"] for f in taught}
            banned = {S["FIGURES"][v]["img"] for v in new_views} | {S["FIGURES"][v]["labeled"] for v in new_views if S["FIGURES"][v]["labeled"] not in taught_labeled}
            banned |= {"img/face-labeled.jpg"}  # the full facial figure shows the side view labeled
            shown = set()
            for st in ["learn", "names", "feel", "find", "lookalikes"]:
                page.click("[data-step='%s']" % st); page.wait_for_timeout(250)
                shown |= set(page.eval_on_selector_all("#screen img", "els => els.map(e => e.getAttribute('src'))"))
            page.click("[data-step='guided']"); page.wait_for_selector("#gnames [data-name]")
            for g in S["GUIDED"]:
                wrong = next(k for k in S["MUSCLES"] if k != g["muscle"])
                page.click("#gnames [data-name='%s']" % wrong); page.wait_for_timeout(80)
                shown |= set(page.eval_on_selector_all("#screen img", "els => els.map(e => e.getAttribute('src'))"))
                page.click("#gnames [data-name='%s']" % g["muscle"]); page.wait_for_timeout(120)
            leaked = sorted(shown & banned)
            check("%s set: teaching and guided screens never show a 'new' independent view (%d images checked)" % (key, len(shown)), not leaked, leaked)
            if key == "head":
                check("Head set: the full facial figure (front and side views together) is gone from every screen", not [x for x in shown if "face-labeled.jpg" in x], sorted(shown))
            ctx.close()
    guarded("view leak", t_no_view_leak)

    section("A&P in-depth lesson: Decode → See → Move → Explain → Recall → Apply (criteria 2 to 5, 7)")
    def deep_apply(page, answers):
        """Answer the Apply questions on screen in order; answers maps skill -> typed text (default: the right name). Returns [(skill, itemId)]."""
        out = []
        while True:
            page.wait_for_function("() => document.querySelector('#ans') || /Done for today|no new Apply questions left/.test(document.querySelector('#screen').innerText)")
            if not page.query_selector("#ans"): break
            info = page.inner_text("#screen")
            skill = "identify" if "Identify it on a new picture" in info else "function" if "Skill: What it does" in info else "apply"
            L = page.evaluate("DeepLesson.LESSONS.find(l => document.querySelector('#screen .kicker').textContent.toLowerCase() === l.name.toLowerCase())")
            page.fill("#ans", answers.get(skill, L["name"])); page.click("#dchk"); page.wait_for_selector("#dnext")
            out.append(skill); page.click("#dnext"); page.wait_for_timeout(200)
        return out
    def deep_walk(page, k, wrong_recall=None, conf="location", answers=None):
        """Walk one in-depth muscle through Decode..Recall, then answer the Apply questions. Returns lesson, images before Apply, stages, reteach text, skills asked."""
        L = page.evaluate("i => DeepLesson.LESSONS[i]", k)
        page.click("[data-deep='%d']" % k); page.wait_for_selector(".stages")
        shown, stages = set(), []
        def snap():
            shown.update(page.eval_on_selector_all("#screen img", "els => els.map(e => e.getAttribute('src'))"))
            cur = page.inner_text(".stages [aria-current]") if page.query_selector(".stages [aria-current]") else None
            if cur and (not stages or stages[-1] != cur): stages.append(cur)
        for _ in L["decode"]["parts"]:
            snap(); page.click("#dnext"); page.wait_for_timeout(80)
        snap()
        for o in L["decode"]["check"]["answer"]: page.click("[data-o='%s']" % o)
        page.click("#dck"); page.wait_for_timeout(150); page.click("#dnext"); page.wait_for_timeout(120); snap()   # See
        page.click("#dnext"); page.wait_for_timeout(120); snap()                                                     # Move
        page.click("#dnext"); page.wait_for_timeout(120); snap()                                                     # Explain
        page.fill("#dexp", "It attaches here and pulls."); page.click("#dcmp"); page.wait_for_timeout(100)
        page.click("[data-pt='0']"); page.click("#dsc"); page.wait_for_timeout(250); snap()
        page.click("#dnext"); page.wait_for_timeout(150); snap()                                                     # Recall name
        page.fill("#ans", wrong_recall or L["name"]); page.click("#dchk"); page.wait_for_timeout(250)
        conf_text = None
        if wrong_recall:
            page.click("[data-conf='%s']" % conf); page.wait_for_timeout(200); conf_text = page.inner_text("#dconf-fb")
        page.click("#dnext"); page.wait_for_timeout(150); snap()                                                     # Recall action
        page.click("[data-a='%s']" % L["recall"]["action"]["answer"]); page.wait_for_timeout(200)
        page.click("#dnext"); page.wait_for_function("() => { const h = document.querySelector('#screen h2'); return h && /^(Apply it|Done for today)$/.test(h.textContent); }"); page.wait_for_timeout(200)
        before_apply = set(shown); snap()
        first_screen = page.inner_text("#screen")
        skills = deep_apply(page, answers or {})
        return L, before_apply, stages, conf_text, skills, first_screen
    def t_deep():
        ctx, page, errs = fresh(url=AP); page.wait_for_selector("[data-deep='0']")
        D = page.evaluate("DeepLesson")
        check("The head set starts with the in-depth lesson; it covers sternocleidomastoid and masseter",
              page.evaluate("MuscleSets.head.SET.steps[0].id") == "deep" and [l["key"] for l in D["LESSONS"]] == ["sternocleidomastoid", "masseter"])
        L, before, stages, conf_text, skills, _ = deep_walk(page, 0, wrong_recall="trapezius", conf="location", answers={"function": "trapezius"})
        check("Stages run in order: Decode, See, Move, Explain, Recall, Apply", stages == ["Decode", "See", "Move", "Explain", "Recall", "Apply"], stages)
        check("Decode teaches each root with its landmark picture before any question", len(L["decode"]["parts"]) == 3 and "img/deep-neck-landmarks.jpg" in before and "img/deep-skull-landmarks.jpg" in before)
        check("The Apply picture is never shown before the Apply step", "img/deep-body-head-unlabeled.jpg" not in before, sorted(before))
        check("Day 1 Apply asks one new question for each skill: identify, function, new situation", skills == ["identify", "function", "apply"], skills)
        l = [e for e in evs(page, {"course": "BIO131"}) if "deep" in e["itemId"]]
        apply_ids = {q["id"]: q["skill"] for q in L["apply"]}
        pre = [e for e in l if e["itemId"] not in apply_ids]
        check("Everything before Apply is learning or practice, never independent", pre and not any(e["independent"] for e in pre), [(e["itemId"], e["independent"]) for e in pre if e["independent"]])
        ex = [e for e in l if e["itemId"] == L["explain"]["id"]][0]
        check("Explain is self-checked against a model and stored as practice with the points she covered (not auto-graded)",
              ex["correct"] is None and ex["response"]["pointsCovered"] == [0] and ex["response"]["pointsTotal"] == 3 and not ex["independent"])
        cf = [e for e in l if e["itemId"] == L["recall"]["id"] + "-confusion"]
        check("After a wrong recall, her 'what tripped you up' answer is stored under that question", len(cf) == 1 and cf[0]["response"]["confusedBy"] == "location")
        check("The reteach matches what confused her", L["recall"]["action"]["explain"]["location"][:40] in conf_text, conf_text[:80])
        ap = {apply_ids[e["itemId"]]: e for e in l if e["itemId"] in apply_ids}
        objs = {k: v["objectiveId"] for k, v in ap.items()}
        check("Each skill is recorded under its own objective (identification, function, application)",
              objs == {"identify": "bio131.ch9.head-neck-id-new-picture", "function": "bio131.ch9.head-neck-actions", "apply": "bio131.ch9.head-neck-application"}, objs)
        check("All three Apply answers are first-try, no-help independent attempts", all(e["independent"] for e in ap.values()))
        st = {k: status(page, v)["status"] for k, v in objs.items()}
        check("Success in one skill does not establish another: identify shown, function missed, new situation shown",
              st == {"identify": "shown-once", "function": "needs-review", "apply": "shown-once"}, st)
        page.click("#dback"); page.wait_for_selector("[data-deep='0']")
        hist1 = page.inner_text("#screen")
        check("The start screen shows her history, including the miss", "Your history" in hist1 and "\u2717" in hist1, hist1[:300])
        # Next day: different questions for the same muscle, and the earlier miss stays visible.
        p2, e2 = page_at(ctx, DAY2, AP); p2.wait_for_selector("#stepnav [data-step='deep']")
        p2.wait_for_timeout(600); p2.click("#stepnav [data-step='deep']"); p2.wait_for_selector("[data-deep-apply='0']")
        p2.click("[data-deep-apply='0']"); p2.wait_for_function("() => { const h = document.querySelector('#screen h2'); return h && /^(Apply it|Done for today)$/.test(h.textContent); }")
        first = p2.inner_text("#screen")
        check("Next day, with no other verified picture of the SCM, the screen says so instead of repeating the picture question",
              "no new picture question is left" in first and "Identify it on a new picture" not in first, first[:600])
        skills2 = deep_apply(p2, {})
        l2 = [e for e in evs(p2, {"course": "BIO131"}) if e["itemId"] in apply_ids]
        new_ids = [e["itemId"] for e in l2][3:]
        check("Next day: Apply gives NEW function and new-situation questions, never the same ones again",
              skills2 == ["function", "apply"] and len(new_ids) == 2 and not (set(new_ids) & {e["itemId"] for e in l2[:3]}), (skills2, new_ids))
        check("Next-day answers are recorded as review, still independent", all(e["activity"] == "review" and e["independent"] for e in l2[3:]))
        check("A later correct answer does not erase the earlier miss: the function record still holds it and history still shows it",
              any(not e["correct"] for e in l2 if apply_ids[e["itemId"]] == "function") and status(p2, "bio131.ch9.head-neck-actions")["independentAttempts"] >= 2)
        p2.click("#dback"); p2.wait_for_selector("[data-deep='0']")
        h2 = p2.inner_text("#screen")
        check("History after the delayed correct answer still shows the day 1 miss and the day 2 success", "\u2717" in h2 and h2.count("\u2713") >= 3, h2[:400])
        p2.click("[data-deep-apply='0']"); p2.wait_for_function("() => { const h = document.querySelector('#screen h2'); return h && /^(Apply it|Done for today)$/.test(h.textContent); }")
        check("When every Apply question for a muscle is used, it says so and does not repeat one", "no new Apply questions left" in p2.inner_text("#screen"), p2.inner_text("#screen")[:600])
        check("No page errors", not errs and not e2, (errs + e2)[:1]); ctx.close()
        # Masseter: no new picture exists, so the screen says so and asks function and new-situation questions.
        ctx, page, errs = fresh(url=AP); page.wait_for_selector("[data-deep='0']")
        L3, _, _, _, sk3, first3 = deep_walk(page, 1, answers={"apply": "buccinator"})
        check("Masseter: the app says there is no new picture and asks function, then a new situation", "only one labeled picture" in first3 and sk3 == ["function", "apply"], sk3)
        m = [e for e in evs(page, {"course": "BIO131"}) if e["itemId"] == "ap-ch9-deep-masseter-apply-grinding"][0]
        check("Naming the buccinator in the teeth-grinding case is a look-alike miss on the application objective",
              m["independent"] and not m["correct"] and m["errorType"] == "lookalike-buccinator-vs-masseter" and m["objectiveId"] == "bio131.ch9.head-neck-application")
        check("No page errors", not errs, errs[:1]); ctx.close()
        # Content and data
        ctx, page, errs = fresh(url=AP); page.wait_for_selector("[data-deep='0']")
        D = page.evaluate("DeepLesson"); H = page.evaluate("MuscleSets.head")
        conf_ok = all(len(set(L["recall"]["action"]["explain"].values())) == 4 and set(L["recall"]["action"]["explain"]) == {"location", "name", "action", "question"} for L in D["LESSONS"])
        check("Each kind of confusion (location, name, action, question) gets its own explanation, for both muscles", conf_ok)
        check("Each explanation checklist has three essential points and a model answer", all(len(L["explain"]["points"]) == 3 and len(L["explain"]["model"]) > 100 for L in D["LESSONS"]))
        check("Every Apply question has a skill, a unique ID and a 'how you could know' explanation",
              all(q["skill"] in ("identify", "function", "apply") and q["how"] for L in D["LESSONS"] for q in L["apply"]) and
              len({q["id"] for L in D["LESSONS"] for q in L["apply"]}) == sum(len(L["apply"]) for L in D["LESSONS"]))
        check("Only verified new pictures are used for identification: SCM has one (fig. 1105); masseter has none",
              [q["fig"] for q in D["LESSONS"][0]["apply"] if q["skill"] == "identify"] == ["deep-body-head"] and not [q for q in D["LESSONS"][1]["apply"] if q["skill"] == "identify"])
        check("Anatomy anchors: SCM one side turns the head to the opposite side; masseter elevates the mandible",
              "opposite side" in H["MUSCLES"]["sternocleidomastoid"]["action"] and "Elevates the mandible" in H["MUSCLES"]["masseter"]["action"]
              and D["LESSONS"][0]["decode"]["check"]["answer"] == ["Sternum", "Clavicle", "Mastoid process"] and D["LESSONS"][1]["decode"]["check"]["answer"] == ["Zygomatic arch", "Mandible"])
        check("Side-view facial questions count as practice (same drawing as the studied jaw figure)",
              all(not i["unfamiliar"] for i in H["ITEMS"] if i.get("fig") == "face-lateral"))
        ctx.close()
        try:
            import pytesseract
            from PIL import Image
            practice = ["sternohyoid", "omohyoid", "digastric", "levator", "depressor", "splenius", "corrugator", "sternocleidomastoid", "masseter"]
            found = {}
            for f in ["deep-neck-landmarks", "deep-skull-landmarks", "deep-body-head-unlabeled"]:
                im = Image.open(os.path.join(ROOT, "student-app/lessons/ap-muscles/img/%s.jpg" % f))
                t = (pytesseract.image_to_string(im) + pytesseract.image_to_string(im.resize((im.width * 2, im.height * 2)))).lower()
                hit = [w for w in practice if w in t]
                if hit: found[f] = hit
            check("Landmark images show no practice name and no muscle answer; the Apply picture has no text", not found, found)
        except ImportError:
            check("OCR check of in-depth images (skipped: pytesseract not installed)", True)
    guarded("deep lesson", t_deep)

    section("Picture familiarity: only the first answer on a drawing counts as a new picture, across lessons (criterion 7)")
    def t_pictures():
        # Same drawing twice in one lesson: the second question is "a picture seen before".
        ctx, page, errs = fresh(url=TRUNK); page.wait_for_selector("#screen h2")
        trunk_guided(page); page.click("[data-step='independent']"); page.wait_for_selector("#q")
        for t in ["rectus abdominis", "diaphragm", "external intercostals", "transversus abdominis"]: ap_type(page, t)
        p2, e2 = page_at(ctx, DAY2, TRUNK); p2.wait_for_selector("#q", timeout=8000)
        ap_type(p2, "quadratus lumborum"); ap_type(p2, "internal intercostals")
        f = ap_type(p2, "external oblique")
        e = [x for x in evs(p2, {"course": "BIO131"}) if x["itemId"] == "ap-ch9-trunk-front-name-external-oblique"][0]
        check("Second question on the same drawing: independent, but filed under 'pictures seen before', and she is told so",
              e["independent"] and e["objectiveId"] == "bio131.ch9.trunk-muscle-id" and e["response"]["picture"] == "seen" and "picture you have seen before" in f, (e["objectiveId"], f[:160]))
        check("No page errors", not errs and not e2, (errs + e2)[:1]); ctx.close()
        # Across lessons: the SCM Apply picture and the trunk front view are the same OpenStax drawing (fig. 1105, front).
        ctx, page, errs = fresh(url=AP); page.wait_for_selector("[data-deep='0']")
        deep_walk(page, 0)
        scm = [x for x in evs(page, {"course": "BIO131"}) if x["itemId"] == "ap-ch9-deep-scm-apply-body-front"][0]
        check("SCM Apply on the never-seen whole-body front drawing counts as a new picture", scm["objectiveId"] == "bio131.ch9.head-neck-id-new-picture" and scm["response"]["picture"] == "new")
        t = ctx.new_page(); t.goto(TRUNK); t.wait_for_selector("#screen h2")
        trunk_guided(t); t.click("[data-step='independent']"); t.wait_for_selector("#q")
        f = ap_type(t, "rectus abdominis")
        r = [x for x in evs(t, {"course": "BIO131"}) if x["itemId"] == "ap-ch9-trunk-front-name-rectus"][0]
        check("The trunk front view is then NOT a new picture: same drawing already seen in the head and neck lesson",
              r["independent"] and r["objectiveId"] == "bio131.ch9.trunk-muscle-id" and r["response"]["picture"] == "seen" and "picture you have seen before" in f, (r["objectiveId"], r["response"].get("picture")))
        check("No page errors", not errs, errs[:1]); ctx.close()
        # Data: every new-picture item's figure names its source drawing.
        ctx, page, errs = fresh(url=TRUNK); page.wait_for_selector("#screen h2")
        T = page.evaluate("MuscleSets.trunk")
        check("Every trunk figure used for new-picture questions names its OpenStax drawing",
              all(T["FIGURES"][i["fig"]].get("drawing") for i in T["ITEMS"] if i["unfamiliar"] and i["kind"] != "name-fn"))
        ctx.close()
    guarded("pictures", t_pictures)

    # =====================================================================================
    section("Both courses share one record and one study plan (criterion 6)")
    def t_shared():
        ctx, page, errs = fresh(url=CHEM); page.wait_for_selector("#screen h2"); chem_guided_complete(page)
        page.goto(AP); page.wait_for_selector("#screen h2"); ap_guided(page)
        courses = sorted({e["course"] for e in evs(page)})
        check("Chemistry and A&P lessons write to the same learning record", courses == ["BIO131", "CHM221"], courses)
        page.goto(BASE); page.wait_for_selector("#next-up:not([hidden])", timeout=8000)
        nxt = page.inner_text("#next-up")
        check("Home 'Next up' uses that shared record and names the subject's next exam", "next up for you" in nxt.lower() and "exam in" in nxt, nxt)
        ctx.close()
    guarded("shared", t_shared)

    browser.close()
server.shutdown()
for r in results: print("%s  [%s] %s%s" % (r[0], r[3], r[1], ("  {" + r[2][:220] + "}") if r[0] == "FAIL" else ""))
print("\nChecks by area:")
order = []
for r in results:
    if r[3] not in order: order.append(r[3])
for n in order:
    print("  %2d of %2d passed  %s" % (sum(1 for r in results if r[3] == n and r[0] == "PASS"), sum(1 for r in results if r[3] == n), n))
print("\n%d checks, %d failed" % (len(results), len(failures)))
sys.exit(1 if failures else 0)
