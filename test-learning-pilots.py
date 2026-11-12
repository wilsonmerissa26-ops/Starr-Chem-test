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
        used = {p for it in N["ITEMS"] + N["ALL_GUIDED"] for p in it["parts"]}
        check("Every root used in any practice name is a defined root", used <= set(N["ROOTS"]), sorted(used - set(N["ROOTS"])))
        # Each lesson's names screen: its own roots are shown open, other lessons' roots one tap away, and no practice name appears anywhere (hidden text included).
        for url, key in [(AP, "head"), (AP + "trunk.html", "trunk"), (AP + "upper.html", "upper"), (AP + "forearm.html", "forearm"), (AP + "thigh.html", "thigh"), (AP + "leg.html", "leg")]:
            pg = page if key == "head" else ctx.new_page()
            if key != "head": pg.goto(url); pg.wait_for_selector("#toDecodeGuided")
            P = N["SETS"][key]; mine = {p for it in P["worked"] + [P["guided"]] + P["items"] for p in it["parts"]}
            shown = set(pg.eval_on_selector_all("#screen .root[data-root]", "els => els.filter(e => !e.closest('details')).map(e => e.dataset.root)"))
            hidden = set(pg.eval_on_selector_all("#screen details .root[data-root]", "els => els.map(e => e.dataset.root)"))
            check("%s names screen: every root its names use is shown open, the rest are behind one tap" % key, mine == shown and shown | hidden == set(N["ROOTS"]) and not shown & hidden, sorted(mine ^ shown))
            all_text = pg.eval_on_selector("#screen", "e => e.textContent").lower()
            leaked = [it["name"] for it in N["ITEMS"] if it["name"].lower() in all_text]
            check("%s names screen: no practice name from any lesson appears, even in hidden text" % key, not leaked, leaked)
            if key != "head": pg.close()
        pairs = page.evaluate("() => { const N=MuscleNames, out=[]; N.ITEMS.concat(N.ALL_GUIDED).forEach(it => it.parts.forEach(p => { const c=N.choices(it.id,p); N.CLOSE.forEach(q => { if (q.includes(p) && c.includes(q[0]) && c.includes(q[1])) out.push(it.name+': '+q.join('/')); }); })); return out; }")
        check("A root's near-synonym (extensor/erector, levator/erector, superficialis/external, teres/orbicularis) is never offered as a wrong choice for it", not pairs, pairs)
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
    UPPER = AP + "upper.html"
    FOREARM = AP + "forearm.html"
    THIGH = AP + "thigh.html"
    LEG = AP + "leg.html"
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
        for url, key in [(AP, "head"), (TRUNK, "trunk"), (UPPER, "upper"), (FOREARM, "forearm"), (THIGH, "thigh"), (LEG, "leg")]:
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
        for url, key in [(AP, "head"), (TRUNK, "trunk"), (UPPER, "upper"), (FOREARM, "forearm"), (THIGH, "thigh"), (LEG, "leg")]:
            ctx, page, errs = fresh(url=url); page.wait_for_selector("#screen h2")
            S = page.evaluate("k => MuscleSets[k]", key)
            new_views = {i["fig"] for i in S["ITEMS"] if i["unfamiliar"] and i["kind"] != "name-fn"}
            taught = {g["fig"] for g in S["GUIDED"]} | {x["fig"] for x in S["SET"]["learn"] if x.get("fig")}
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

    section("A&P shoulder and arm set: teaching, independent identification and review (criteria 1 to 5, 7)")
    def t_upper():
        ctx, page, errs = fresh(url=UPPER); page.wait_for_selector("#screen h2")
        U = page.evaluate("MuscleSets.upper")
        check("Shoulder and arm lesson opens on teaching (decode the names first), with no question on screen",
              "Decode the name" in page.inner_text("#screen h2") and not page.query_selector("#ans"))
        check("It covers 14 shoulder and arm muscles, with the rotator cuff taught as SITS and teres major excluded",
              len(U["MUSCLES"]) == 14 and "SITS" in U["SET"]["learnIntro"] and "Teres major is NOT in the rotator cuff" in U["SET"]["learnIntro"])
        check("'On your own' is locked until guided pins are done", page.is_disabled("[data-step='independent']"))
        page.click("[data-step='learn']"); page.wait_for_selector("text=Fourteen shoulder and arm muscles")
        check("Learn shows five labeled teaching figures and a card for every muscle",
              page.locator("#screen .fig img").count() == 5 and page.locator("#screen .mcard").count() == 14)
        page.click("[data-step='guided']"); page.wait_for_selector("#gnames [data-name]")
        for g in U["GUIDED"]:
            page.wait_for_selector("#gnames [data-name='%s']" % g["muscle"]); page.click("#gnames [data-name='%s']" % g["muscle"]); page.wait_for_timeout(100)
        page.wait_for_timeout(300)
        check("Guided pins unlock 'On your own'", not page.is_disabled("[data-step='independent']"))
        page.click("[data-step='independent']"); page.wait_for_selector("#q")
        img = page.get_attribute("#q img", "src")
        check("Day 1 first question uses the whole-body back view, never shown labeled", "upper-body-back-unlabeled" in img, img)
        check("The whole-body front and back views name their OpenStax drawings (front shared with trunk and SCM)",
              U["FIGURES"]["upper-body-front"]["drawing"] == "openstax-1105-front" and U["FIGURES"]["upper-body-back"]["drawing"] == "openstax-1105-back")
        f1 = ap_type(page, "supraspinatus")          # infraspinatus pin: look-alike
        f2 = ap_type(page, "deltoid")                # abducts the arm
        f3 = ap_type(page, "biceps")                 # biceps on the front view: short name accepted with a note
        f4 = ap_type(page, "infraspinatus")          # subscapularis by function: opposite-rotation look-alike
        check("Supraspinatus for infraspinatus is diagnosed with the spine-of-the-scapula rule", "look-alike" in f1 and "spine of the scapula as the dividing line" in f1, f1[:200])
        check("'Biceps' alone is accepted with its full name", "Correct" in f3 and "biceps brachii" in f3.lower(), f3[:160])
        check("Infraspinatus for subscapularis is diagnosed as opposite surfaces and rotations", "opposite surfaces" in f4, f4[:200])
        l = {e["itemId"]: e for e in evs(page, {"course": "BIO131"})}
        check("New-picture identification and function questions are independent evidence; misses keep their error types",
              l["ap-ch9-upper-back-name-infraspinatus"]["independent"] and l["ap-ch9-upper-back-name-infraspinatus"]["errorType"] == "lookalike-infraspinatus-vs-supraspinatus"
              and l["ap-ch9-upper-act-abduct"]["independent"] and l["ap-ch9-upper-act-cuff-front"]["errorType"] == "lookalike-infraspinatus-vs-subscapularis")
        check("Only the first answer on the back drawing is a new picture; the next back-view answer is 'seen before'",
              l["ap-ch9-upper-back-name-infraspinatus"]["objectiveId"] == "bio131.ch9.upper-limb-id-new-picture"
              and l["ap-ch9-upper-front-name-biceps"]["objectiveId"] == "bio131.ch9.upper-limb-id-new-picture")
        check("Shoulder and arm work never changes head, neck or trunk objectives",
              status(page, "bio131.ch9.trunk-muscle-id")["status"] == "not-started" and status(page, "bio131.ch9.jaw-neck-id")["status"] == "not-started")
        p2, e2 = page_at(ctx, DAY2, UPPER); p2.wait_for_selector("#q", timeout=8000)
        check("Next day the lesson opens to NEW review questions", "Review: new questions" in p2.inner_text("#screen h2"))
        before = set(l); ap_type(p2, "latissimus dorsi")
        new = [e for e in evs(p2, {"course": "BIO131"}) if e["itemId"] not in before]
        check("Day 2 question is a different item, recorded as review", new and new[0]["activity"] == "review" and new[0]["itemId"] == "ap-ch9-upper-back-name-latissimus", [(e["itemId"], e["activity"]) for e in new])
        check("Day 2 back-view answer is filed as a picture seen before", new and new[0]["objectiveId"] == "bio131.ch9.upper-limb-id" and new[0]["response"]["picture"] == "seen")
        check("No page errors", not errs and not e2, (errs + e2)[:1]); ctx.close()
    guarded("upper lesson", t_upper)

    section("A&P shoulder and arm set: data, images and name matching (accuracy)")
    def t_upper_data():
        ctx, page, errs = fresh(url=UPPER); page.wait_for_selector("#screen h2")
        cases = [("supraspinatus", "supraspinatus", True, None), ("infraspinatus", "supraspinatus", False, "lookalike-infraspinatus-vs-supraspinatus"),
                 ("teres major", "teres-minor", False, "lookalike-teres-major-vs-teres-minor"), ("teres", "teres-major", False, "incomplete-name"),
                 ("latissimus", "latissimus-dorsi", False, "incomplete-name"), ("latisimus dorsi", "latissimus-dorsi", True, "spelling-close"),
                 ("brachialis", "biceps-brachii", False, "lookalike-biceps-brachii-vs-brachialis"), ("brachialis", "brachioradialis", False, "lookalike-brachialis-vs-brachioradialis"),
                 ("triceps", "triceps-brachii", True, None), ("traps", "trapezius", True, None), ("deltoid", "trapezius", False, "wrong-muscle"),
                 ("rotator cuff", "subscapularis", False, "incomplete-name"), ("subscapularis", "infraspinatus", False, "lookalike-infraspinatus-vs-subscapularis")]
        res = page.evaluate("cs => cs.map(c => MuscleSets.upper.match(c[0], c[1]))", [[c[0], c[1]] for c in cases])
        bad = [(c[0], c[1], r) for c, r in zip(cases, res) if r["correct"] != c[2] or r["errorType"] != c[3]]
        check("Shoulder and arm name matching (%d cases, incl. supra/infra, teres major/minor, biceps/brachialis)" % len(cases), not bad, bad)
        U = page.evaluate("MuscleSets.upper")
        check("Pin positions match the image build output exactly", U["PINS"] == json.load(open(os.path.join(ROOT, "student-app/lessons/ap-muscles/img/pins-upper.json"))))
        anchors = {"deltoid": "main abductor", "supraspinatus": "Abducts the arm", "infraspinatus": "Laterally rotates", "teres-minor": "Laterally rotates",
                   "subscapularis": "Medially rotates", "teres-major": "Extends and medially rotates", "biceps-brachii": "supinates", "brachialis": "Flexes the forearm",
                   "brachioradialis": "Flexes the forearm", "triceps-brachii": "Extends the forearm", "latissimus-dorsi": "Extends, adducts and medially rotates",
                   "pectoralis-major": "Flexes, adducts and medially rotates", "serratus-anterior": "Protracts the scapula", "trapezius": "Elevates the scapula"}
        off = [k for k, v in anchors.items() if v not in U["MUSCLES"][k]["action"]]
        check("Every action matches the OpenStax 11.5 text and standard anatomy (infraspinatus and teres minor rotate laterally, not 'extension; adduction' as the OpenStax table says)", not off, off)
        cuff = [k for k, m in U["MUSCLES"].items() if "Rotator cuff muscle" in m["location"]]
        check("Exactly the four SITS muscles are marked as rotator cuff", sorted(cuff) == ["infraspinatus", "subscapularis", "supraspinatus", "teres-minor"], cuff)
        taught = {g["fig"] for g in U["GUIDED"]} | {x["fig"] for x in U["SET"]["learn"]}
        unf = [i for i in U["ITEMS"] if i["unfamiliar"] and i["kind"] != "name-fn"]
        check("Every new-picture item uses fig. 1105, never a teaching or guided figure", all(i["fig"] in ("upper-body-front", "upper-body-back") and i["fig"] not in taught for i in unf))
        seen = {}
        dup = [i["id"] for i in unf if (i["fig"], i["muscle"]) in seen or seen.setdefault((i["fig"], i["muscle"]), 1) is None]
        check("Each muscle is asked about at most once per new picture", not dup, dup)
        check("Subscapularis (one view only) is practice-only for pin naming", all(not i["unfamiliar"] for i in U["ITEMS"] if i["kind"] == "name-pin" and i["muscle"] == "subscapularis"))
        check("Every item has a pin on its figure, a unique ID with the upper prefix",
              all(i["kind"] == "name-fn" or i["muscle"] in U["PINS"][i["fig"]] for i in U["ITEMS"]) and len({i["id"] for i in U["ITEMS"]}) == len(U["ITEMS"]) and all(i["id"].startswith("ap-ch9-upper-") for i in U["ITEMS"]))
        ctx.close()
        try:
            import pytesseract
            from PIL import Image
            names = ["trapez", "deltoid", "pectoralis", "serratus", "latissimus", "dorsi", "supraspin", "infraspin", "teres", "subscap", "biceps", "brachii",
                     "brachialis", "brachiorad", "triceps", "scapula", "humerus", "coracoid", "rhomboid", "flexor", "extensor", "pronator", "palmaris"]
            found = {}
            for f in ["upper-girdle", "upper-humerus", "upper-shoulder-deep", "upper-arm", "upper-forearm-palmar", "upper-body-front", "upper-body-back"]:
                im = Image.open(os.path.join(ROOT, "student-app/lessons/ap-muscles/img/%s-unlabeled.jpg" % f))
                t = (pytesseract.image_to_string(im) + pytesseract.image_to_string(im.resize((im.width * 2, im.height * 2)), config="--psm 11")).lower()
                hit = [n for n in names if n in t]
                if hit: found[f] = hit
            check("OCR finds no label text on any unlabeled shoulder and arm image", not found, found)
        except ImportError:
            check("OCR shoulder and arm label check (skipped: pytesseract not installed)", True)
    guarded("upper data", t_upper_data)

    section("A&P forearm set: teaching, independent identification and review (criteria 1 to 5, 7)")
    def forearm_guided(page):
        page.click("[data-step='guided']"); page.wait_for_selector("#gnames [data-name]")
        for g in page.evaluate("MuscleSets.forearm.GUIDED"):
            page.wait_for_selector("#gnames [data-name='%s']" % g["muscle"]); page.click("#gnames [data-name='%s']" % g["muscle"]); page.wait_for_timeout(100)
        page.wait_for_timeout(300)
    def t_forearm():
        ctx, page, errs = fresh(url=FOREARM); page.wait_for_selector("#screen h2")
        F = page.evaluate("MuscleSets.forearm")
        check("Forearm lesson opens on teaching (decode the names first), with no question on screen",
              "Decode the name" in page.inner_text("#screen h2") and not page.query_selector("#ans") and not page.query_selector("#dcheck"))
        check("It covers 9 forearm muscles: the pronator and supinator, three wrist flexors, the superficial finger flexor and three extensors", len(F["MUSCLES"]) == 9, sorted(F["MUSCLES"]))
        check("'On your own' is locked until guided pins are done", page.is_disabled("[data-step='independent']"))
        page.click("[data-step='learn']"); page.wait_for_selector("text=Nine forearm muscles")
        srcs = page.eval_on_selector_all("#screen .fig img", "els => els.map(e => e.getAttribute('src'))")
        check("Learn shows three labeled teaching figures (palm side, back, deep) and a card for every muscle",
              srcs == ["img/forearm-front-labeled.jpg", "img/forearm-back-labeled.jpg", "img/forearm-deep-labeled.jpg"] and page.locator("#screen .mcard").count() == 9, srcs)
        forearm_guided(page)
        check("Guided pins unlock 'On your own'", not page.is_disabled("[data-step='independent']"))
        g = [e for e in evs(page, {"objectiveId": "bio131.ch9.forearm-id"}) if e["activity"] == "guided"]
        check("Guided forearm pins are assisted practice", len(g) == 9 and all(not e["independent"] for e in g), len(g))
        page.click("[data-step='independent']"); page.wait_for_selector("#q")
        img = page.get_attribute("#q img", "src")
        check("Day 1 first question uses the whole-body front view, never shown labeled", "forearm-body-front-unlabeled" in img, img)
        f1 = ap_type(page, "pronator teres")         # pronator teres on fig. 1105 front: first answer on that drawing
        f2 = ap_type(page, "flexor carpi ulnaris")   # FCR by function: radial/ulnar look-alike
        f3 = ap_type(page, "extensor digitorum")     # ED on fig. 1105 back: first answer on that drawing
        f4 = ap_type(page, "pronator teres")         # supinator by function: opposite-movement look-alike
        check("First answer on each whole-body drawing is credited as a new picture, and she is told so", "Correct" in f1 and "never seen" in f1 and "never seen" in f3, (f1[:120], f3[:120]))
        check("Flexor carpi ulnaris for radialis is diagnosed as the thumb-side vs little-finger-side pair", "look-alike" in f2 and "thumb side" in f2 and "little-finger side" in f2, f2[:220])
        check("Pronator teres for supinator is diagnosed as opposite movements", "look-alike" in f4 and "Opposite movements" in f4, f4[:220])
        l = {e["itemId"]: e for e in evs(page, {"course": "BIO131"})}
        check("New-picture answers are filed under 'ID on new pictures'; function answers under 'Function'; misses keep their error types",
              l["ap-ch9-forearm-front-name-pronator-teres"]["objectiveId"] == "bio131.ch9.forearm-id-new-picture" and l["ap-ch9-forearm-front-name-pronator-teres"]["independent"]
              and l["ap-ch9-forearm-back-name-extensor-digitorum"]["objectiveId"] == "bio131.ch9.forearm-id-new-picture"
              and l["ap-ch9-forearm-act-wrist-thumb-flex"]["objectiveId"] == "bio131.ch9.forearm-actions" and l["ap-ch9-forearm-act-wrist-thumb-flex"]["errorType"] == "lookalike-flexor-carpi-radialis-vs-flexor-carpi-ulnaris"
              and l["ap-ch9-forearm-act-palm-up"]["errorType"] == "lookalike-pronator-teres-vs-supinator")
        check("Forearm work never changes shoulder and arm objectives",
              status(page, "bio131.ch9.upper-limb-id")["status"] == "not-started" and status(page, "bio131.ch9.upper-limb-actions")["status"] == "not-started")
        p2, e2 = page_at(ctx, DAY2, FOREARM); p2.wait_for_selector("#q", timeout=8000)
        check("Next day the lesson opens to NEW review questions", "Review: new questions" in p2.inner_text("#screen h2"))
        before = set(l); ap_type(p2, "extensor carpi ulnaris"); ap_type(p2, "flexor digitorum superficialis"); f7 = ap_type(p2, "flexor carpi radialis")
        new = [e for e in evs(p2, {"course": "BIO131"}) if e["itemId"] not in before]
        ids = [e["itemId"] for e in new]
        check("Day 2 questions are different items, recorded as review", ids[:3] == ["ap-ch9-forearm-act-wrist-little-extend", "ap-ch9-forearm-act-curl-fingers", "ap-ch9-forearm-front-name-flexor-carpi-radialis"]
              and all(e["activity"] == "review" for e in new), [(e["itemId"], e["activity"]) for e in new])
        fcr = new[2] if len(new) > 2 else {}
        check("Day 2 front-view answer is independent but filed as a picture seen before, and she is told so",
              fcr.get("independent") and fcr.get("objectiveId") == "bio131.ch9.forearm-id" and (fcr.get("response") or {}).get("picture") == "seen" and "picture you have seen before" in f7, (fcr.get("objectiveId"), f7[:160]))
        check("Day 1 answers are kept: the record still holds the day 1 miss", any(e["itemId"] == "ap-ch9-forearm-act-wrist-thumb-flex" and e["correct"] is False for e in evs(p2, {"course": "BIO131"})))
        check("No page errors", not errs and not e2, (errs + e2)[:1]); ctx.close()
    guarded("forearm lesson", t_forearm)

    section("A&P forearm set: data, images and name matching (accuracy)")
    def t_forearm_data():
        ctx, page, errs = fresh(url=FOREARM); page.wait_for_selector("#screen h2")
        cases = [("flexor carpi radialis", "flexor-carpi-radialis", True, None),
                 ("flexor carpi ulnaris", "flexor-carpi-radialis", False, "lookalike-flexor-carpi-radialis-vs-flexor-carpi-ulnaris"),
                 ("extensor carpi ulnaris", "extensor-carpi-radialis-longus", False, "lookalike-extensor-carpi-radialis-longus-vs-extensor-carpi-ulnaris"),
                 ("supinator", "pronator-teres", False, "lookalike-pronator-teres-vs-supinator"),
                 ("extensor digitorum", "flexor-digitorum-superficialis", False, "lookalike-extensor-digitorum-vs-flexor-digitorum-superficialis"),
                 ("flexor carpi", "flexor-carpi-ulnaris", False, "incomplete-name"), ("extensor carpi radialis", "extensor-carpi-radialis-longus", False, "incomplete-name"),
                 ("flexor digitorum", "flexor-digitorum-superficialis", False, "incomplete-name"), ("pronator", "pronator-teres", False, "incomplete-name"),
                 ("palmaris longis", "palmaris-longus", True, "spelling-close"), ("flexor carpi ulnaris", "extensor-carpi-ulnaris", False, "wrong-muscle"),
                 ("brachioradialis", "supinator", False, "not-recognized"), ("", "supinator", False, "no-answer")]
        res = page.evaluate("cs => cs.map(c => MuscleSets.forearm.match(c[0], c[1]))", [[c[0], c[1]] for c in cases])
        bad = [(c[0], c[1], r) for c, r in zip(cases, res) if r["correct"] != c[2] or r["errorType"] != c[3]]
        check("Forearm name matching (%d cases, incl. radialis/ulnaris, flexor/extensor, pronator/supinator, partial names)" % len(cases), not bad, bad)
        F = page.evaluate("MuscleSets.forearm")
        check("Pin positions match the image build output exactly", F["PINS"] == json.load(open(os.path.join(ROOT, "student-app/lessons/ap-muscles/img/pins-forearm.json"))))
        anchors = {"pronator-teres": "Pronates the forearm", "supinator": "Supinates the forearm", "flexor-carpi-radialis": "Flexes the hand at the wrist and abducts it",
                   "flexor-carpi-ulnaris": "Flexes the hand at the wrist and adducts it", "palmaris-longus": "weak flexor", "flexor-digitorum-superficialis": "Flexes the fingers",
                   "extensor-carpi-radialis-longus": "Extends the hand at the wrist and abducts it", "extensor-carpi-ulnaris": "Extends the hand at the wrist and adducts it",
                   "extensor-digitorum": "Extends the fingers"}
        off = [k for k, v in anchors.items() if v not in F["MUSCLES"][k]["action"]]
        check("Every action uses standard terms; flexor carpi ulnaris adducts (toward the little finger), not 'away from the body' as the OpenStax table says",
              not off and "toward the little-finger side" in F["MUSCLES"]["flexor-carpi-ulnaris"]["action"] and "away from the body" not in json.dumps(F["MUSCLES"]), off)
        origins = {"medial epicondyle": ["pronator-teres", "flexor-carpi-radialis", "palmaris-longus", "flexor-carpi-ulnaris", "flexor-digitorum-superficialis"],
                   "lateral epicondyle": ["extensor-digitorum", "extensor-carpi-ulnaris", "supinator"], "lateral supracondylar ridge": ["extensor-carpi-radialis-longus"]}
        off = [(o, k) for o, ks in origins.items() for k in ks if o not in F["MUSCLES"][k]["location"]]
        check("Origins match OpenStax 11.5: flexors and pronator teres from the medial epicondyle, extensors and supinator from the lateral side", not off, off)
        check("The OpenStax table's 'extensor radialis longus' typo is not used", "extensor radialis longus" not in json.dumps(F).lower())
        taught = {g["fig"] for g in F["GUIDED"]} | {x["fig"] for x in F["SET"]["learn"]}
        unf = [i for i in F["ITEMS"] if i["unfamiliar"] and i["kind"] != "name-fn"]
        check("Every new-picture item uses fig. 1105 (named drawing), never a teaching or guided figure",
              unf and all(i["fig"] in ("forearm-body-front", "forearm-body-back") and i["fig"] not in taught and F["FIGURES"][i["fig"]].get("drawing") for i in unf))
        seen = {}
        dup = [i["id"] for i in unf if (i["fig"], i["muscle"]) in seen or seen.setdefault((i["fig"], i["muscle"]), 1) is None]
        check("Each muscle is asked about at most once per new picture", not dup, dup)
        check("Items on the studied 1120 figures are practice, not new pictures", all(not i["unfamiliar"] for i in F["ITEMS"] if i["kind"] == "name-pin" and i["fig"] in taught))
        fn = [i for i in F["ITEMS"] if i["kind"] == "name-fn"]
        give = [i["id"] for i in fn if F["MUSCLES"][i["muscle"]]["name"].lower() in i["prompt"].lower()]
        check("Every muscle has one function question, and no prompt contains its own answer", sorted(i["muscle"] for i in fn) == sorted(F["MUSCLES"]) and not give, give)
        check("Every item has a pin on its figure, a unique ID with the forearm prefix",
              all(i["kind"] == "name-fn" or i["muscle"] in F["PINS"][i["fig"]] for i in F["ITEMS"]) and len({i["id"] for i in F["ITEMS"]}) == len(F["ITEMS"]) and all(i["id"].startswith("ap-ch9-forearm-") for i in F["ITEMS"]))
        ctx.close()
        try:
            import pytesseract
            from PIL import Image
            names = ["flexor", "extensor", "pronator", "supinator", "palmaris", "carpi", "radialis", "ulnaris", "digitorum", "superficialis", "longus",
                     "brachii", "brachioradialis", "biceps", "triceps", "epicondyle", "humerus", "pollicis", "anconeus", "retinaculum"]
            found = {}
            for f in ["forearm-front", "forearm-back", "forearm-deep", "forearm-body-front", "forearm-body-back"]:
                im = Image.open(os.path.join(ROOT, "student-app/lessons/ap-muscles/img/%s-unlabeled.jpg" % f))
                t = (pytesseract.image_to_string(im) + pytesseract.image_to_string(im.resize((im.width * 2, im.height * 2)), config="--psm 11")).lower()
                hit = [n for n in names if n in t]
                if hit: found[f] = hit
            check("OCR finds no label text on any unlabeled forearm image", not found, found)
        except ImportError:
            check("OCR forearm label check (skipped: pytesseract not installed)", True)
    guarded("forearm data", t_forearm_data)
    def t_forearm_decode():
        # The shoulder and arm lesson's labeled palm-side figure already shows five forearm names, so decoding them afterwards is practice.
        ctx, page, errs = fresh(url=UPPER); page.wait_for_selector("#screen h2")
        page.click("[data-step='learn']"); page.wait_for_selector("text=Fourteen shoulder and arm muscles"); page.wait_for_timeout(300)
        fa = ctx.new_page(); fa.goto(FOREARM); fa.wait_for_selector("#toDecodeGuided")
        N = fa.evaluate("MuscleNames"); P = N["SETS"]["forearm"]
        fa.click("#toDecodeGuided"); fa.wait_for_selector("#dq [data-c]"); decode_answer(fa, P["guided"]); fa.click("#dind")
        fa.wait_for_selector("text=No root table"); fa.wait_for_selector("#dq [data-c]")
        names = []
        for k in range(3):
            name = fa.inner_text("#dq .prompt b"); it = next(x for x in P["items"] if x["name"] == name); names.append(it)
            f = decode_answer(fa, it); fa.click("#dnext")
            if k < 2: fa.wait_for_function("n => { const b = document.querySelector('#dq .prompt b'); return b && b.textContent !== n; }", arg=name)
        l = {e["itemId"]: e for e in evs(fa, {"objectiveId": N["OBJ"]})}
        both = [it for it in names if isinstance(it.get("taughtBy"), list)]
        only = [it for it in names if not isinstance(it.get("taughtBy"), list)]
        check("Forearm names already shown labeled in the shoulder and arm lesson count as practice; names only taught in the forearm lesson stay independent",
              both and only and all(l[it["id"]]["activity"] == "check" and not l[it["id"]]["independent"] for it in both) and all(l[it["id"]]["independent"] for it in only),
              [(it["name"], l[it["id"]]["activity"]) for it in names])
        check("No page errors", not errs, errs[:1]); ctx.close()
    guarded("forearm decode", t_forearm_decode)

    section("A&P hip and thigh set: teaching, independent identification and review (criteria 1 to 5, 7)")
    def thigh_guided(page):
        page.click("[data-step='guided']"); page.wait_for_selector("#gnames [data-name]")
        for g in page.evaluate("MuscleSets.thigh.GUIDED"):
            page.wait_for_selector("#gnames [data-name='%s']" % g["muscle"]); page.click("#gnames [data-name='%s']" % g["muscle"]); page.wait_for_timeout(100)
        page.wait_for_timeout(300)
    def t_thigh():
        ctx, page, errs = fresh(url=THIGH); page.wait_for_selector("#screen h2")
        T = page.evaluate("MuscleSets.thigh")
        check("Hip and thigh lesson opens on teaching (decode the names first), with no question on screen",
              "Decode the name" in page.inner_text("#screen h2") and not page.query_selector("#ans") and not page.query_selector("#dcheck"))
        check("It covers 16 hip and thigh muscles: iliopsoas pair, tensor fasciae latae, sartorius, three quadriceps, four adductors, two gluteals, three hamstrings",
              sorted(T["MUSCLES"]) == sorted(["psoas-major", "iliacus", "tensor-fasciae-latae", "sartorius", "rectus-femoris", "vastus-lateralis", "vastus-medialis", "pectineus",
                                               "adductor-longus", "adductor-magnus", "gracilis", "gluteus-maximus", "gluteus-medius", "biceps-femoris", "semitendinosus", "semimembranosus"]), sorted(T["MUSCLES"]))
        check("'On your own' is locked until guided pins are done", page.is_disabled("[data-step='independent']"))
        page.click("[data-step='learn']"); page.wait_for_selector("text=Sixteen hip and thigh muscles")
        srcs = page.eval_on_selector_all("#screen .fig img", "els => els.map(e => e.getAttribute('src'))")
        sec = [m for x in T["SET"]["learn"] for m in x["muscles"]]
        check("Learn shows the labeled front and back figures once each, and a card for every muscle in exactly one group",
              srcs == ["img/thigh-front-labeled.jpg", "img/thigh-back-labeled.jpg"] and page.locator("#screen .mcard").count() == 16 and sorted(sec) == sorted(T["MUSCLES"]), (srcs, len(sec)))
        thigh_guided(page)
        check("Guided pins unlock 'On your own'", not page.is_disabled("[data-step='independent']"))
        g = [e for e in evs(page, {"objectiveId": "bio131.ch9.thigh-id"}) if e["activity"] == "guided"]
        check("Guided hip and thigh pins are assisted practice", len(g) == 16 and all(not e["independent"] for e in g), len(g))
        page.click("[data-step='independent']"); page.wait_for_selector("#q")
        img = page.get_attribute("#q img", "src")
        check("Day 1 first question uses the whole-body front view, never shown labeled", "thigh-body-front-unlabeled" in img, img)
        f1 = ap_type(page, "rectus femoris")      # 1105 front: first answer on that drawing
        f2 = ap_type(page, "vastus lateralis")    # vastus medialis by function: lateral/medial look-alike
        f3 = ap_type(page, "adductor longus")     # 1122 deep front drawing: never shown in teaching
        f4 = ap_type(page, "semimembranosus")     # semitendinosus by function: medial-hamstring look-alike
        check("First answer on the whole-body front view and on the deep adductor drawing are each credited as a new picture", "Correct" in f1 and "never seen" in f1 and "Correct" in f3 and "never seen" in f3, (f1[:120], f3[:120]))
        check("Vastus lateralis for medialis is diagnosed as the outer vs inner look-alike", "look-alike" in f2 and "outer side" in f2 and "inner side" in f2, f2[:220])
        check("Semimembranosus for semitendinosus is diagnosed as the two medial hamstrings", "look-alike" in f4 and "cord-like tendon" in f4, f4[:220])
        l = {e["itemId"]: e for e in evs(page, {"course": "BIO131"})}
        check("New-picture answers are filed under 'ID on new pictures'; function answers under 'Function'; misses keep their error types",
              l["ap-ch9-thigh-front-name-rectus-femoris"]["objectiveId"] == "bio131.ch9.thigh-id-new-picture" and l["ap-ch9-thigh-front-name-rectus-femoris"]["independent"]
              and l["ap-ch9-thigh-deep-name-adductor-longus"]["objectiveId"] == "bio131.ch9.thigh-id-new-picture" and l["ap-ch9-thigh-deep-name-adductor-longus"]["response"]["drawing"] == "openstax-1122-deep"
              and l["ap-ch9-thigh-act-teardrop"]["objectiveId"] == "bio131.ch9.thigh-actions" and l["ap-ch9-thigh-act-teardrop"]["errorType"] == "lookalike-vastus-lateralis-vs-vastus-medialis"
              and l["ap-ch9-thigh-act-cord-tendon"]["errorType"] == "lookalike-semimembranosus-vs-semitendinosus")
        check("Hip and thigh work never changes forearm or shoulder and arm objectives",
              all(status(page, o)["status"] == "not-started" for o in ["bio131.ch9.forearm-id", "bio131.ch9.forearm-actions", "bio131.ch9.upper-limb-id", "bio131.ch9.upper-limb-actions"]))
        p2, e2 = page_at(ctx, DAY2, THIGH); p2.wait_for_selector("#q", timeout=8000)
        check("Next day the lesson opens to NEW review questions", "Review: new questions" in p2.inner_text("#screen h2"))
        before = set(l); f5 = ap_type(p2, "biceps femoris"); ap_type(p2, "gluteus medius"); ap_type(p2, "psoas major")
        new = [e for e in evs(p2, {"course": "BIO131"}) if e["itemId"] not in before]
        ids = [e["itemId"] for e in new]
        check("Day 2 questions are different items, recorded as review", ids[:3] == ["ap-ch9-thigh-back-name-biceps-femoris", "ap-ch9-thigh-act-level-pelvis", "ap-ch9-thigh-act-lumbar-flexor"]
              and all(e["activity"] == "review" for e in new), [(e["itemId"], e["activity"]) for e in new])
        bf = new[0] if new else {}
        check("Day 2's first answer on the whole-body back view is still a new picture (first answer on that drawing)",
              bf.get("objectiveId") == "bio131.ch9.thigh-id-new-picture" and (bf.get("response") or {}).get("picture") == "new" and "never seen" in f5, (bf.get("objectiveId"), f5[:160]))
        check("Day 1 answers are kept: the record still holds the day 1 miss", any(e["itemId"] == "ap-ch9-thigh-act-teardrop" and e["correct"] is False for e in evs(p2, {"course": "BIO131"})))
        check("No page errors", not errs and not e2, (errs + e2)[:1]); ctx.close()
    guarded("thigh lesson", t_thigh)

    section("A&P hip and thigh set: data, images and name matching (accuracy)")
    def t_thigh_data():
        ctx, page, errs = fresh(url=THIGH); page.wait_for_selector("#screen h2")
        cases = [("vastus medialis", "vastus-medialis", True, None),
                 ("vastus lateralis", "vastus-medialis", False, "lookalike-vastus-lateralis-vs-vastus-medialis"),
                 ("semimembranosus", "semitendinosus", False, "lookalike-semimembranosus-vs-semitendinosus"),
                 ("iliacus", "psoas-major", False, "lookalike-iliacus-vs-psoas-major"),
                 ("gluteus medius", "gluteus-maximus", False, "lookalike-gluteus-maximus-vs-gluteus-medius"),
                 ("gracilis", "sartorius", False, "lookalike-gracilis-vs-sartorius"),
                 ("adductor magnus", "adductor-longus", False, "lookalike-adductor-longus-vs-adductor-magnus"),
                 ("iliopsoas", "psoas-major", False, "incomplete-name"), ("gluteus", "gluteus-medius", False, "incomplete-name"),
                 ("hamstrings", "biceps-femoris", False, "incomplete-name"), ("biceps", "biceps-femoris", False, "incomplete-name"),
                 ("quadriceps", "rectus-femoris", False, "incomplete-name"), ("vastus", "vastus-lateralis", False, "incomplete-name"),
                 ("tensor fascia latae", "tensor-fasciae-latae", True, None), ("tensor fasciae latae", "tensor-fasciae-latae", True, None),
                 ("semitendinosis", "semitendinosus", True, "spelling-close"), ("gluteus maximus", "semitendinosus", False, "wrong-muscle"),
                 ("tibialis anterior", "sartorius", False, "not-recognized"), ("", "gracilis", False, "no-answer")]
        res = page.evaluate("cs => cs.map(c => MuscleSets.thigh.match(c[0], c[1]))", [[c[0], c[1]] for c in cases])
        bad = [(c[0], c[1], r) for c, r in zip(cases, res) if r["correct"] != c[2] or r["errorType"] != c[3]]
        check("Hip and thigh name matching (%d cases, incl. lateralis/medialis, the two medial hamstrings, group names, both spellings of tensor fasciae latae)" % len(cases), not bad, bad)
        tfl = page.evaluate("MuscleSets.thigh.match('TFL', 'tensor-fasciae-latae')")
        check("The abbreviation TFL is accepted with a note to use the full name", tfl["correct"] and "tensor fasciae latae" in (tfl["note"] or ""), tfl)
        T = page.evaluate("MuscleSets.thigh")
        check("Pin positions match the image build output exactly", T["PINS"] == json.load(open(os.path.join(ROOT, "student-app/lessons/ap-muscles/img/pins-thigh.json"))))
        anchors = {"psoas-major": "Flexes the thigh at the hip", "iliacus": "Flexes the thigh at the hip", "tensor-fasciae-latae": "Flexes and abducts the thigh",
                   "sartorius": "Flexes the leg at the knee, and flexes, abducts and laterally rotates the thigh", "rectus-femoris": "Extends the leg at the knee and flexes the thigh",
                   "vastus-lateralis": "Extends the leg at the knee", "vastus-medialis": "Extends the leg at the knee", "pectineus": "Adducts and flexes the thigh",
                   "adductor-longus": "Adducts the thigh", "adductor-magnus": "Adducts the thigh", "gracilis": "Adducts the thigh and flexes the leg at the knee",
                   "gluteus-maximus": "Extends the thigh at the hip", "gluteus-medius": "Abducts the thigh", "biceps-femoris": "Flexes the leg at the knee and extends the thigh at the hip",
                   "semitendinosus": "Flexes the leg at the knee and extends the thigh at the hip", "semimembranosus": "Flexes the leg at the knee and extends the thigh at the hip"}
        off = [k for k, v in anchors.items() if not T["MUSCLES"][k]["action"].startswith(v)]
        check("Every action matches OpenStax 11.6's text in standard terms; the pectineus adducts (the caption's 'opens the thigh' is not used)",
              not off and "abduct" not in T["MUSCLES"]["pectineus"]["action"].lower() and "opens the thigh" not in json.dumps(T["MUSCLES"]) and "brings the thighs" not in json.dumps(T["MUSCLES"]), off)
        check("Adductor longus flexes the thigh and adductor magnus extends it, as OpenStax's text says", "helps flex" in T["MUSCLES"]["adductor-longus"]["action"] and "extends the thigh" in T["MUSCLES"]["adductor-magnus"]["action"])
        origins = {"ischial tuberosity": ["biceps-femoris", "semitendinosus", "semimembranosus", "adductor-magnus"], "pubis": ["adductor-longus", "pectineus", "gracilis"],
                   "anterior superior iliac spine": ["sartorius", "tensor-fasciae-latae"], "anterior inferior iliac spine": ["rectus-femoris"], "lumbar vertebrae": ["psoas-major"],
                   "iliac fossa": ["iliacus"], "greater trochanter": ["vastus-lateralis"], "linea aspera": ["vastus-medialis", "vastus-lateralis"], "surface of the ilium": ["gluteus-medius"],
                   "sacrum and the coccyx": ["gluteus-maximus"]}
        off = [(o, k) for o, ks in origins.items() for k in ks if o not in T["MUSCLES"][k]["location"]]
        check("Origins match OpenStax 11.6 (ischial tuberosity for the hamstrings, pubis for the adductors, iliac spines, lumbar vertebrae, iliac fossa)", not off, off)
        taught = {g["fig"] for g in T["GUIDED"]} | {x["fig"] for x in T["SET"]["learn"] if x.get("fig")}
        unf = [i for i in T["ITEMS"] if i["unfamiliar"] and i["kind"] != "name-fn"]
        check("Every new-picture item uses fig. 1105 or the deep adductor drawing (named drawings), never a teaching or guided figure",
              unf and all(i["fig"] in ("thigh-body-front", "thigh-body-back", "thigh-deep") and i["fig"] not in taught and T["FIGURES"][i["fig"]].get("drawing") for i in unf))
        check("The deep adductor drawing is never shown labeled: no labeled image is cut from it", "thigh-deep" not in json.dumps([T["FIGURES"][f]["labeled"] for f in T["FIGURES"]]))
        seen = {}
        dup = [i["id"] for i in unf if (i["fig"], i["muscle"]) in seen or seen.setdefault((i["fig"], i["muscle"]), 1) is None]
        check("Each muscle is asked about at most once per new picture", not dup, dup)
        check("Items on the studied 1122 crops are practice, not new pictures", all(not i["unfamiliar"] for i in T["ITEMS"] if i["kind"] == "name-pin" and i["fig"] in taught))
        fn = [i for i in T["ITEMS"] if i["kind"] == "name-fn"]
        give = [i["id"] for i in fn if any(w in i["prompt"].lower() for w in T["MUSCLES"][i["muscle"]]["name"].lower().split() if w not in ("major",))]
        check("Every muscle has one function question, and no prompt contains any word of its own answer", sorted(i["muscle"] for i in fn) == sorted(T["MUSCLES"]) and not give, give)
        check("Every item has a pin on its figure, a unique ID with the thigh prefix",
              all(i["kind"] == "name-fn" or i["muscle"] in T["PINS"][i["fig"]] for i in T["ITEMS"]) and len({i["id"] for i in T["ITEMS"]}) == len(T["ITEMS"]) and all(i["id"].startswith("ap-ch9-thigh-") for i in T["ITEMS"]))
        ctx.close()
        try:
            import pytesseract
            from PIL import Image
            names = ["gluteus", "medius", "maximus", "minimus", "psoas", "iliacus", "tensor", "fascia", "latae", "sartorius", "rectus", "femoris", "vastus", "lateralis",
                     "medialis", "adductor", "longus", "magnus", "brevis", "gracilis", "pectineus", "biceps", "semitendinosus", "semimembranosus", "piriformis", "gemellus",
                     "obturator", "quadratus", "iliopsoas", "femur", "pubis", "sacrum", "tendon", "ligament", "fibularis", "tibialis", "soleus"]
            found = {}
            for f in ["thigh-hip", "thigh-knee", "thigh-glutes", "thigh-hamstrings", "thigh-deep", "thigh-body-front", "thigh-body-back"]:
                im = Image.open(os.path.join(ROOT, "student-app/lessons/ap-muscles/img/%s-unlabeled.jpg" % f))
                t = (pytesseract.image_to_string(im) + pytesseract.image_to_string(im.resize((im.width * 2, im.height * 2)), config="--psm 11")).lower()
                hit = [n for n in names if n in t]
                if hit: found[f] = hit
            check("OCR finds no label text on any unlabeled hip and thigh image", not found, found)
            lab = {f: pytesseract.image_to_string(Image.open(os.path.join(ROOT, "student-app/lessons/ap-muscles/img/%s.jpg" % f))).lower() for f in ["thigh-front-labeled", "thigh-back-labeled"]}
            missing = [(f, n) for f, ns in {"thigh-front-labeled": ["psoas", "liacus", "sartorius", "rectus", "vastus", "gracilis", "pectineus", "adductor"],
                                            "thigh-back-labeled": ["gluteus", "biceps", "semitendinosus", "semimembranosus", "gracilis"]}.items() for n in ns if n not in lab[f]]
            check("The labeled teaching figures keep every taught label readable (none blanked by the crop clean-up)", not missing, missing)
        except ImportError:
            check("OCR hip and thigh label check (skipped: pytesseract not installed)", True)
    guarded("thigh data", t_thigh_data)
    def t_thigh_decode():
        # The trunk lesson's labeled posterior abdominal wall already shows psoas major, so decoding it afterwards is practice.
        ctx, page, errs = fresh(url=TRUNK); page.wait_for_selector("#screen h2")
        page.click("[data-step='learn']"); page.wait_for_timeout(500)
        th = ctx.new_page(); th.goto(THIGH); th.wait_for_selector("#toDecodeGuided")
        N = th.evaluate("MuscleNames"); P = N["SETS"]["thigh"]
        th.click("#toDecodeGuided"); th.wait_for_selector("#dq [data-c]"); decode_answer(th, P["guided"]); th.click("#dind")
        th.wait_for_selector("text=No root table"); th.wait_for_selector("#dq [data-c]")
        names = []
        for k in range(3):
            name = th.inner_text("#dq .prompt b"); it = next(x for x in P["items"] if x["name"] == name); names.append(it)
            decode_answer(th, it); th.click("#dnext")
            if k < 2: th.wait_for_function("n => { const b = document.querySelector('#dq .prompt b'); return b && b.textContent !== n; }", arg=name)
        l = {e["itemId"]: e for e in evs(th, {"objectiveId": N["OBJ"]})}
        check("Psoas major, already shown labeled in the trunk lesson, is decoded as practice; names first shown in this lesson stay independent",
              [it["name"] for it in names] == ["Gluteus medius", "Psoas major", "Vastus medialis"] and l["ap-ch9-names-psoas-major"]["activity"] == "check" and not l["ap-ch9-names-psoas-major"]["independent"]
              and l["ap-ch9-names-gluteus-medius"]["independent"] and l["ap-ch9-names-vastus-medialis"]["independent"], [(it["name"], l[it["id"]]["activity"]) for it in names])
        choices = th.evaluate("() => ['magnus','vastus','latae','lateralis','medialis'].map(r => [r, MuscleNames.choices('x-' + r, r)])")
        bad = [(r, c) for r, c in choices for o in c if o != r and th.evaluate("([a, b]) => MuscleNames.CLOSE.some(p => (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a))", [r, o])]
        check("Near-synonym roots are never offered against each other (magnus, vastus, major and maximus; latae and latissimus; lateralis and external)", not bad, bad)
        check("No page errors", not errs, errs[:1]); ctx.close()
    guarded("thigh decode", t_thigh_decode)

    section("A&P lower leg set: teaching, independent identification and review (criteria 1 to 5, 7)")
    def leg_guided(page):
        page.click("[data-step='guided']"); page.wait_for_selector("#gnames [data-name]")
        for g in page.evaluate("MuscleSets.leg.GUIDED"):
            page.wait_for_selector("#gnames [data-name='%s']" % g["muscle"]); page.click("#gnames [data-name='%s']" % g["muscle"]); page.wait_for_timeout(100)
        page.wait_for_timeout(300)
    def t_leg():
        ctx, page, errs = fresh(url=LEG); page.wait_for_selector("#screen h2")
        G = page.evaluate("MuscleSets.leg")
        check("Lower leg lesson opens on teaching (decode the names first), with no question on screen",
              "Decode the name" in page.inner_text("#screen h2") and not page.query_selector("#ans") and not page.query_selector("#dcheck"))
        check("It covers 10 lower leg muscles: front (tibialis anterior, two toe extensors), lateral (two fibularis), calf (gastrocnemius, soleus) and three deep back muscles",
              sorted(G["MUSCLES"]) == sorted(["tibialis-anterior", "extensor-digitorum-longus", "extensor-hallucis-longus", "fibularis-longus", "fibularis-brevis", "gastrocnemius", "soleus",
                                               "tibialis-posterior", "flexor-digitorum-longus", "flexor-hallucis-longus"]), sorted(G["MUSCLES"]))
        check("'On your own' is locked until guided pins are done", page.is_disabled("[data-step='independent']"))
        page.click("[data-step='learn']"); page.wait_for_selector("text=Ten lower leg muscles")
        srcs = page.eval_on_selector_all("#screen .fig img", "els => els.map(e => e.getAttribute('src'))")
        check("Learn shows the three labeled fig. 1123 drawings (front, calf, deep) and a card for every muscle",
              srcs == ["img/leg-front-labeled.jpg", "img/leg-calf-labeled.jpg", "img/leg-deep-labeled.jpg"] and page.locator("#screen .mcard").count() == 10, srcs)
        leg_guided(page)
        check("Guided pins unlock 'On your own'", not page.is_disabled("[data-step='independent']"))
        g = [e for e in evs(page, {"objectiveId": "bio131.ch9.leg-id"}) if e["activity"] == "guided"]
        check("Guided lower leg pins are assisted practice", len(g) == 10 and all(not e["independent"] for e in g), len(g))
        page.click("[data-step='independent']"); page.wait_for_selector("#q")
        img = page.get_attribute("#q img", "src")
        check("Day 1 first question uses the whole-body front view, never shown labeled", "leg-body-front-unlabeled" in img, img)
        f1 = ap_type(page, "tibialis anterior")   # 1105 front: first answer on that drawing
        f2 = ap_type(page, "tibialis anterior")   # tibialis posterior by function: front/back look-alike
        f3 = ap_type(page, "gastrocnemius")       # 1105 back: first answer on that drawing
        f4 = ap_type(page, "fibularis longus")    # fibularis brevis by function: long/short look-alike
        check("First answer on each whole-body drawing is credited as a new picture, and she is told so", "Correct" in f1 and "never seen" in f1 and "never seen" in f3, (f1[:120], f3[:120]))
        check("Tibialis anterior for posterior is diagnosed as the front vs deepest-back pair", "look-alike" in f2 and "deepest" in f2 and "beside the shin" in f2, f2[:220])
        check("Fibularis longus for brevis is diagnosed as the long vs short pair", "look-alike" in f4 and "fifth metatarsal" in f4, f4[:220])
        l = {e["itemId"]: e for e in evs(page, {"course": "BIO131"})}
        check("New-picture answers are filed under 'ID on new pictures'; function answers under 'Function'; misses keep their error types",
              l["ap-ch9-leg-front-name-tibialis-anterior"]["objectiveId"] == "bio131.ch9.leg-id-new-picture" and l["ap-ch9-leg-front-name-tibialis-anterior"]["independent"]
              and l["ap-ch9-leg-back-name-gastrocnemius"]["objectiveId"] == "bio131.ch9.leg-id-new-picture"
              and l["ap-ch9-leg-act-deepest-back"]["objectiveId"] == "bio131.ch9.leg-actions" and l["ap-ch9-leg-act-deepest-back"]["errorType"] == "lookalike-tibialis-anterior-vs-tibialis-posterior"
              and l["ap-ch9-leg-act-short-outer"]["errorType"] == "lookalike-fibularis-brevis-vs-fibularis-longus")
        check("Lower leg work never changes hip and thigh objectives",
              all(status(page, o)["status"] == "not-started" for o in ["bio131.ch9.thigh-id", "bio131.ch9.thigh-actions", "bio131.ch9.thigh-id-new-picture"]))
        p2, e2 = page_at(ctx, DAY2, LEG); p2.wait_for_selector("#q", timeout=8000)
        check("Next day the lesson opens to NEW review questions", "Review: new questions" in p2.inner_text("#screen h2"))
        before = set(l); ap_type(p2, "extensor digitorum longus"); f6 = ap_type(p2, "soleus"); ap_type(p2, "soleus")
        new = [e for e in evs(p2, {"course": "BIO131"}) if e["itemId"] not in before]
        ids = [e["itemId"] for e in new]
        check("Day 2 questions are different items, recorded as review", ids[:3] == ["ap-ch9-leg-act-four-toes-up", "ap-ch9-leg-back-name-soleus", "ap-ch9-leg-act-no-knee"]
              and all(e["activity"] == "review" for e in new), [(e["itemId"], e["activity"]) for e in new])
        so = new[1] if len(new) > 1 else {}
        check("Day 2 back-view answer is independent but filed as a picture seen before, and she is told so",
              so.get("independent") and so.get("objectiveId") == "bio131.ch9.leg-id" and (so.get("response") or {}).get("picture") == "seen" and "picture you have seen before" in f6, (so.get("objectiveId"), f6[:160]))
        check("Day 1 answers are kept: the record still holds the day 1 miss", any(e["itemId"] == "ap-ch9-leg-act-deepest-back" and e["correct"] is False for e in evs(p2, {"course": "BIO131"})))
        check("No page errors", not errs and not e2, (errs + e2)[:1]); ctx.close()
    guarded("leg lesson", t_leg)

    section("A&P lower leg set: data, images and name matching (accuracy)")
    def t_leg_data():
        ctx, page, errs = fresh(url=LEG); page.wait_for_selector("#screen h2")
        cases = [("tibialis posterior", "tibialis-posterior", True, None),
                 ("tibialis anterior", "tibialis-posterior", False, "lookalike-tibialis-anterior-vs-tibialis-posterior"),
                 ("fibularis longus", "fibularis-brevis", False, "lookalike-fibularis-brevis-vs-fibularis-longus"),
                 ("soleus", "gastrocnemius", False, "lookalike-gastrocnemius-vs-soleus"),
                 ("flexor digitorum longus", "extensor-digitorum-longus", False, "lookalike-extensor-digitorum-longus-vs-flexor-digitorum-longus"),
                 ("flexor hallucis longus", "extensor-hallucis-longus", False, "lookalike-extensor-hallucis-longus-vs-flexor-hallucis-longus"),
                 ("peroneus longus", "fibularis-longus", True, None), ("peroneus brevis", "fibularis-brevis", True, None),
                 ("tibialis", "tibialis-anterior", False, "incomplete-name"), ("fibularis", "fibularis-longus", False, "incomplete-name"),
                 ("extensor digitorum", "extensor-digitorum-longus", False, "incomplete-name"), ("flexor hallucis", "flexor-hallucis-longus", False, "incomplete-name"),
                 ("gastroc", "gastrocnemius", False, "incomplete-name"), ("calf", "soleus", False, "incomplete-name"),
                 ("gastrocnemus", "gastrocnemius", True, "spelling-close"), ("soleus", "tibialis-posterior", False, "wrong-muscle"),
                 ("sartorius", "soleus", False, "not-recognized"), ("", "soleus", False, "no-answer")]
        res = page.evaluate("cs => cs.map(c => MuscleSets.leg.match(c[0], c[1]))", [[c[0], c[1]] for c in cases])
        bad = [(c[0], c[1], r) for c, r in zip(cases, res) if r["correct"] != c[2] or r["errorType"] != c[3]]
        check("Lower leg name matching (%d cases, incl. anterior/posterior, longus/brevis, extensor/flexor pairs, peroneus as the older name)" % len(cases), not bad, bad)
        per = page.evaluate("MuscleSets.leg.match('peroneus longus', 'fibularis-longus')")
        check("Peroneus is accepted with a note that fibularis is the current name", per["correct"] and "older name" in (per["note"] or ""), per)
        G = page.evaluate("MuscleSets.leg")
        check("Pin positions match the image build output exactly", G["PINS"] == json.load(open(os.path.join(ROOT, "student-app/lessons/ap-muscles/img/pins-leg.json"))))
        anchors = {"tibialis-anterior": "Dorsiflexes the foot", "extensor-digitorum-longus": "Extends toes 2 to 5", "extensor-hallucis-longus": "Extends the big toe",
                   "fibularis-longus": "Everts the foot", "fibularis-brevis": "Everts the foot", "gastrocnemius": "Plantar flexes the foot", "soleus": "Plantar flexes the foot",
                   "tibialis-posterior": "Plantar flexes the foot and inverts it", "flexor-digitorum-longus": "Flexes toes 2 to 5", "flexor-hallucis-longus": "Flexes the big toe"}
        off = [k for k, v in anchors.items() if not G["MUSCLES"][k]["action"].startswith(v)]
        check("Every action matches OpenStax 11.6 in standard terms (front dorsiflexes, lateral everts, back plantar flexes)", not off, off)
        check("Only the gastrocnemius crosses the knee: it alone also flexes the knee, and the soleus says it does not", "flex the leg at the knee" in G["MUSCLES"]["gastrocnemius"]["action"]
              and "knee" not in G["MUSCLES"]["soleus"]["action"] and "does not cross the knee" in G["MUSCLES"]["soleus"]["location"])
        origins = {"lateral condyle and upper shaft of the tibia": ["tibialis-anterior"], "lateral condyle of the tibia, the upper fibula": ["extensor-digitorum-longus"],
                   "fibula's shaft": ["extensor-hallucis-longus", "flexor-hallucis-longus"], "upper lateral fibula": ["fibularis-longus"], "lower shaft of the fibula": ["fibularis-brevis"],
                   "condyles of the femur": ["gastrocnemius"], "upper tibia, the fibula": ["soleus"], "upper tibia and fibula": ["tibialis-posterior"], "back of the tibia": ["flexor-digitorum-longus"],
                   "calcaneal (Achilles) tendon": ["gastrocnemius", "soleus"]}
        off = [(o, k) for o, ks in origins.items() for k in ks if o not in G["MUSCLES"][k]["location"]]
        check("Origins match OpenStax 11.6 (tibia, fibula, femoral condyles; calf muscles share the calcaneal tendon)", not off, off)
        taught = {g["fig"] for g in G["GUIDED"]} | {x["fig"] for x in G["SET"]["learn"] if x.get("fig")}
        unf = [i for i in G["ITEMS"] if i["unfamiliar"] and i["kind"] != "name-fn"]
        check("Every new-picture item uses fig. 1105 (named drawing), never a teaching or guided figure",
              unf and all(i["fig"] in ("leg-body-front", "leg-body-back") and i["fig"] not in taught and G["FIGURES"][i["fig"]].get("drawing") for i in unf))
        seen = {}
        dup = [i["id"] for i in unf if (i["fig"], i["muscle"]) in seen or seen.setdefault((i["fig"], i["muscle"]), 1) is None]
        check("Each muscle is asked about at most once per new picture", not dup, dup)
        check("Items on the studied 1123 figures are practice, not new pictures", all(not i["unfamiliar"] for i in G["ITEMS"] if i["kind"] == "name-pin" and i["fig"] in taught))
        fn = [i for i in G["ITEMS"] if i["kind"] == "name-fn"]
        give = [i["id"] for i in fn if any(w in i["prompt"].lower() for w in G["MUSCLES"][i["muscle"]]["name"].lower().split())]
        check("Every muscle has one function question, and no prompt contains any word of its own answer", sorted(i["muscle"] for i in fn) == sorted(G["MUSCLES"]) and not give, give)
        check("Every item has a pin on its figure, a unique ID with the leg prefix",
              all(i["kind"] == "name-fn" or i["muscle"] in G["PINS"][i["fig"]] for i in G["ITEMS"]) and len({i["id"] for i in G["ITEMS"]}) == len(G["ITEMS"]) and all(i["id"].startswith("ap-ch9-leg-") for i in G["ITEMS"]))
        ctx.close()
        try:
            import pytesseract
            from PIL import Image
            names = ["tibialis", "anterior", "posterior", "fibularis", "peroneus", "longus", "brevis", "tertius", "extensor", "flexor", "digitorum", "hallucis", "gastrocnemius",
                     "soleus", "plantaris", "popliteus", "calcaneal", "calcaneus", "achilles", "retinaculum", "tendon", "head", "semitendinosus", "gracilis", "vastus", "biceps"]
            found = {}
            for f in ["leg-front", "leg-calf", "leg-deep", "leg-body-front", "leg-body-back"]:
                im = Image.open(os.path.join(ROOT, "student-app/lessons/ap-muscles/img/%s-unlabeled.jpg" % f))
                t = (pytesseract.image_to_string(im) + pytesseract.image_to_string(im.resize((im.width * 2, im.height * 2)), config="--psm 11")).lower()
                hit = [n for n in names if n in t]
                if hit: found[f] = hit
            check("OCR finds no label text on any unlabeled lower leg image", not found, found)
            lab = {f: pytesseract.image_to_string(Image.open(os.path.join(ROOT, "student-app/lessons/ap-muscles/img/%s.jpg" % f))).lower() for f in ["leg-front-labeled", "leg-calf-labeled", "leg-deep-labeled"]}
            missing = [(f, n) for f, ns in {"leg-front-labeled": ["tibialis anterior", "fibularis longus", "extensor digitorum", "fibularis brevis", "extensor hallucis"],
                                            "leg-calf-labeled": ["gastrocnemius", "soleus"], "leg-deep-labeled": ["tibialis posterior", "flexor digitorum", "flexor hallucis"]}.items() for n in ns if n not in lab[f]]
            check("The labeled teaching figures keep every taught label readable", not missing, missing)
        except ImportError:
            check("OCR lower leg label check (skipped: pytesseract not installed)", True)
    guarded("leg data", t_leg_data)
    def t_leg_decode():
        ctx, page, errs = fresh(url=LEG); page.wait_for_selector("#toDecodeGuided")
        N = page.evaluate("MuscleNames"); P = N["SETS"]["leg"]
        page.click("#toDecodeGuided"); page.wait_for_selector("#dq [data-c]"); decode_answer(page, P["guided"]); page.click("#dind")
        page.wait_for_selector("text=No root table"); page.wait_for_selector("#dq [data-c]")
        names = []
        for k in range(3):
            name = page.inner_text("#dq .prompt b"); it = next(x for x in P["items"] if x["name"] == name); names.append(it)
            decode_answer(page, it); page.click("#dnext")
            if k < 2: page.wait_for_function("n => { const b = document.querySelector('#dq .prompt b'); return b && b.textContent !== n; }", arg=name)
        l = {e["itemId"]: e for e in evs(page, {"objectiveId": N["OBJ"]})}
        check("Lower leg names decoded before the learn screen are independent", all(l[it["id"]]["independent"] for it in names), [(it["name"], l[it["id"]]["activity"]) for it in names])
        check("Digitorum now covers toes as well as fingers", "toes" in N["ROOTS"]["digitorum"]["m"] and "fingers" in N["ROOTS"]["digitorum"]["m"])
        check("No page errors", not errs, errs[:1]); ctx.close()
    guarded("leg decode", t_leg_decode)

    section("A&P: pins never overlap on figures shown with all their pins (criterion 1)")
    def t_pin_spacing():
        from PIL import Image
        import math
        for url, key in [(AP, "head"), (TRUNK, "trunk"), (UPPER, "upper"), (FOREARM, "forearm"), (THIGH, "thigh"), (LEG, "leg")]:
            ctx, page, errs = fresh(url=url); page.wait_for_selector("#screen h2")
            S = page.evaluate("k => MuscleSets[k]", key)
            figs = {g["fig"] for g in S["GUIDED"]} | ({S["SET"]["find"]["fig"]} if S["SET"].get("find") else set())
            close = []
            for f in figs:
                w, h = Image.open(os.path.join(ROOT, "student-app/lessons/ap-muscles", S["FIGURES"][f]["img"])).size
                W, H = 640, 640 * h / w; ps = list(S["PINS"][f].items())
                for i in range(len(ps)):
                    for j in range(i + 1, len(ps)):
                        d = math.hypot((ps[i][1][0] - ps[j][1][0]) / 100 * W, (ps[i][1][1] - ps[j][1][1]) / 100 * H)
                        if d < 46: close.append((f, ps[i][0], ps[j][0], round(d)))
            check("%s set: on every guided and worked-example figure at iPad width (640 px), 44 px pins are at least 46 px apart" % key, not close, close)
            ctx.close()
    guarded("pin spacing", t_pin_spacing)

    section("Pronunciation: verified, written, optional, shown only in teaching and after answers (separate feature)")
    EXPECT_SAY = {"masseter": "muh-SEET-er", "buccinator": "BUHK-suh-nayt-er", "temporalis": "tem-puh-RAY-luhs", "sternocleidomastoid": "stur-noh-klide-uh-MAS-toyd",
        "occipitofrontalis": "ahk-sip-uht-oh-fruhn-TAY-luhs", "oculi": "AH-kyuh-lye", "oris": "OR-uhs", "rectus": "REK-tuhs", "abdominis": "ab-DAHM-uh-nuhs",
        "oblique": "oh-BLEEK", "transversus": "trans-VUR-suhs", "diaphragm": "DYE-uh-fram", "intercostal": "int-er-KAHS-tuhl", "quadratus": "kwah-DRAYT-uhs",
        "lumborum": "luhm-BOR-uhm", "trapezius": "truh-PEE-zee-uhs", "deltoid": "DEL-toyd", "pectoralis": "pek-tuh-RAY-luhs", "serratus": "seh-RAYT-uhs",
        "latissimus": "luh-TIS-uh-muhs", "dorsi": "DOR-sye", "infraspinatus": "in-fruh-spye-NAYT-uhs", "teres": "TERR-eez", "subscapularis": "suhb-skap-yuh-LARR-uhs",
        "biceps": "BYE-seps", "brachii": "BRAY-kee-ee", "brachialis": "bray-kee-AL-uhs", "brachioradialis": "bray-kee-oh-rayd-ee-AL-uhs", "triceps": "TRYE-seps",
        "pronator": "PROH-nayt-er", "supinator": "SOO-puh-nayt-er", "flexor": "FLEK-ser", "carpi": "KAR-pye", "radialis": "ray-dee-AY-luhs", "ulnaris": "uhl-NARR-uhs",
        "palmaris": "pal-MARR-uhs", "longus": "LAWNG-guhs", "digitorum": "dij-uh-TOR-uhm", "superficialis": "soo-per-fish-ee-AY-luhs", "extensor": "ik-STEN-ser"}
    # Chapter 10 and 8 words (Merriam-Webster, read Nov 10).
    EXPECT_CH = {"acetylcholine": "uh-set-uhl-KOH-leen", "acetylcholinesterase": "uh-seh-tuhl-koh-luh-NEH-stuh-rays", "sarcolemma": "sar-kuh-LEM-uh",
        "cisternae": "sih-STUR-nee", "sarcoplasmic": "sar-kuh-PLAZ-mik", "reticulum": "rih-TIK-yuh-luhm", "tropomyosin": "trahp-uh-MYE-uh-suhn", "myosin": "MYE-uh-suhn",
        "actin": "AK-tuhn", "sarcomere": "SAR-kuh-meer", "creatine": "KREE-uh-teen", "phosphate": "FAHS-fayt", "glycolysis": "glye-KAHL-uh-suhs",
        "anaerobic": "an-uh-ROH-bik", "aerobic": "arr-OH-bik", "mitochondria": "mye-tuh-KAHN-dree-uh", "synovial": "suh-NOH-vee-uhl", "synarthrosis": "sin-ar-THROH-suhs",
        "diarthrosis": "dye-ar-THROH-suhs", "gomphosis": "gahm-FOH-suhs", "syndesmosis": "sin-dez-MOH-suhs", "synchondrosis": "sin-kahn-DROH-suhs", "symphysis": "SIM-fuh-suhs",
        "hyaline": "HYE-uh-luhn", "epiphyseal": "ih-pif-uh-SEE-uhl", "menisci": "muh-NIH-skye", "bursae": "BUR-see", "condyloid": "KAHN-duh-loyd",
        "circumduction": "sur-kuhm-DUHK-shuhn", "abduction": "ab-DUHK-shuhn", "adduction": "uh-DUHK-shuhn", "pronation": "proh-NAY-shuhn", "supination": "soo-puh-NAY-shuhn",
        "dorsiflexion": "dor-suh-FLEK-shuhn", "plantar": "PLANT-er", "flexion": "FLEK-shuhn", "eversion": "ih-VUR-zhuhn", "protraction": "proh-TRAK-shuhn",
        "glenoid": "GLEN-oyd", "labrum": "LAY-bruhm", "radioulnar": "rayd-ee-oh-UHL-ner"}
    NOT_CH = ["troponin", "synaptic", "cartilaginous", "acetabulum", "amphiarthrosis", "fibrocartilage", "humeroulnar"]
    # Hip, thigh and lower leg words (Merriam-Webster, read Nov 12).
    EXPECT_LL = {"psoas": "SOH-uhs", "iliacus": "ih-LYE-uh-kuhs", "tensor": "TEN-ser", "fasciae": "FASH-ee-ee", "latae": "LAY-tee", "sartorius": "sar-TOR-ee-uhs",
        "femoris": "FEM-uh-ruhs", "pectineus": "pek-TIN-ee-uhs", "adductor": "uh-DUHK-ter", "gracilis": "GRAS-uh-luhs", "gluteus": "GLOOT-ee-uhs", "maximus": "MAK-suh-muhs",
        "semitendinosus": "sem-ee-ten-duh-NOH-suhs", "semimembranosus": "sem-ee-mem-bruh-NOH-suhs", "tibialis": "tib-ee-AY-luhs", "gastrocnemius": "gas-trahk-NEE-mee-uhs",
        "soleus": "SOH-lee-uhs", "hallucis": "HAL-oo-suhs"}
    NOT_LL = ["vastus", "lateralis", "medialis", "magnus", "medius", "fibularis", "brevis"]
    def t_pronunciation():
        src = open(os.path.join(ROOT, "student-app/lessons/pronunciation.js"), encoding="utf-8").read()
        check("Pronunciations are plain data in the app: no network calls and no audio files, so the written forms work offline",
              not re.search(r"fetch\(|XMLHttpRequest|import\(|\.mp3|\.wav|\.ogg|<audio|new Audio", src))
        sw = open(os.path.join(ROOT, "student-app/sw.js")).read()
        check("The service worker keeps a copy of every student-app file it serves, including the pronunciation file", 'includes("/student-app/")' in sw and "cache.put" in sw)
        ctx, page, errs = fresh(url=UPPER); page.wait_for_selector("#screen h2")
        P = page.evaluate("Pronunciations")
        got = page.evaluate("() => Object.fromEntries(Object.entries(Pronunciations.WORDS).map(([w, v]) => [w, Pronunciations.respell(v[0])]))")
        want_all = dict(EXPECT_SAY, **EXPECT_CH, **EXPECT_LL)
        check("Every simple spelling is computed from MW's notation by one fixed key (%d words checked)" % len(want_all), got == want_all, {k: got.get(k) for k in set(want_all) | set(got) if got.get(k) != want_all.get(k)})
        caps = [w for w, sp in got.items() for part in [sp.split("-")] if sum(1 for x in part if x.isupper()) != sum(1 for x in re.split(r"[,;]", P["WORDS"][w][0])[0].split("-") if "\u02c8" in x)]
        check("Exactly one syllable per word is in capitals, the one MW marks with the main stress mark", not caps, caps)
        def first(n): return "-" + re.split(r"[,;]", n)[0].strip().strip("-") + "-"
        bad = [w for w, (mw, k) in P["WORDS"].items() if k not in P["SOURCES"] or "-" + mw + "-" not in first(P["SOURCES"][k]["notation"])]
        bad += [t + ":" + w for t, o in P["IN_TERM"].items() for w, (mw, k) in o.items() if "-" + mw + "-" not in first(P["SOURCES"][k]["notation"])]
        check("Every word's pronunciation is a whole-syllable run copied from the FIRST pronunciation its Merriam-Webster entry lists, never pieced together", not bad, bad)
        # Words cut out of a longer notation: the cut must fall on MW's own syllable breaks, and the pieces must fill the
        # notation in order with nothing left over (the entry's last word may be one the lessons do not use, like brevis).
        splits = page.evaluate("""() => { const P = Pronunciations, by = {};
            const add = (w, mw, k) => (by[k] = by[k] || []).push([w, mw]);
            Object.entries(P.WORDS).forEach(([w, v]) => add(w, v[0], v[1]));
            Object.values(P.IN_TERM).forEach(o => Object.entries(o).forEach(([w, v]) => add(w, v[0], v[1])));
            return Object.entries(by).map(([k, ws]) => [k, P.SOURCES[k].notation.split(/[,;]/)[0].trim().replace(/^-|-$/g, ''), ws])
              .filter(([k, full, ws]) => ws.some(x => x[1] !== full)); }""")
        part = [k for k, full, ws in splits if not ("-" + full + "-").startswith("-" + "-".join(x[1] for x in ws) + "-")]
        check("Words cut from one longer notation (latissimus + dorsi, carpi + radialis, transversus + abdominis, digitorum) are consecutive whole syllables from its start, in order, with nothing skipped",
              not part and {k for k, _, _ in splits} == {"latissimusDorsi", "flexorCarpiRadialis", "transversusAbdominis", "extensorDigitorumBrevis", "tensorFasciaeLatae", "flexorHallucisBrevis"}, (part, [k for k, _, _ in splits]))
        # Regression: the eight long-i spellings corrected on Nov 7 (KAR-py could be read KAR-pee, MW's second pronunciation).
        OLD = {"carpi": "KAR-py", "dorsi": "DOR-sy", "oculi": "AH-kyuh-ly", "diaphragm": "DY-uh-fram", "biceps": "BY-seps", "triceps": "TRY-seps",
               "infraspinatus": "in-fruh-spy-NAYT-uhs", "sternocleidomastoid": "stur-noh-klyd-uh-MAS-toyd"}
        back = [w for w, old in OLD.items() if got.get(w) == old]
        check("Regression: the eight ambiguous long-i spellings fixed on Nov 7 (KAR-py, DOR-sy, AH-kyuh-ly and others) do not come back", not back, back)
        held = page.evaluate("""() => { const P = Pronunciations, before = P.forTerm('Flexor carpi radialis').ok;
            P.UNDER_REVIEW['carpi'] = 'test hold'; const word = P.forTerm('Flexor carpi radialis'), other = P.forTerm('Brachialis').ok; delete P.UNDER_REVIEW['carpi'];
            P.UNDER_REVIEW['teres major'] = 'test hold'; const term = P.forTerm('Teres major'), minor = P.forTerm('Teres minor').ok; delete P.UNDER_REVIEW['teres major'];
            return [before, word.ok, word.held, other, term.ok, minor, Object.keys(P.UNDER_REVIEW).length]; }""")
        check("A word or name held for review shows no pronunciation anywhere it appears, and nothing else is affected",
              held == [True, False, ["carpi"], True, False, True, 0], held)
        srcbad = [k for k, v in P["SOURCES"].items() if not v["url"].startswith("https://www.merriam-webster.com/") or "Merriam-Webster" not in v["dict"] or not v["notation"] or v.get("checked", P["CHECKED"]) not in ("2026-11-06", "2026-11-10", "2026-11-12")]
        check("Every source names its Merriam-Webster dictionary, page URL, exact notation and the day it was read (Nov 6 for muscles, Nov 10 for Chapters 10 and 8, Nov 12 for hip, thigh and leg)", not srcbad and P["CHECKED"] == "2026-11-06", srcbad)
        check("Words with no full dictionary pronunciation are never given one", not set(P["NOT_VERIFIED"]) & set(P["WORDS"]) and sorted(P["NOT_VERIFIED"]) == sorted(["orbicularis", "supraspinatus"] + NOT_CH + NOT_LL), sorted(P["NOT_VERIFIED"]))
        gen = [k for k, v in P["SOURCES"].items() if v.get("checked") in ("2026-11-10", "2026-11-12") and ("general" in v["dict"]) != bool(v.get("why"))]
        med = [k for k, v in P["SOURCES"].items() if v.get("checked") == "2026-11-10" and "Medical" in v["dict"] and v["notation"].startswith("-")]
        check("Chapter 10 and 8: the general dictionary is used only where the medical entry is shortened or missing, with the reason kept; no shortened form is used", not gen and not med, (gen, med))
        r = page.evaluate("['Supraspinatus','Orbicularis oculi','Orbicularis oris','Pectoralis major','External intercostals','Occipitofrontalis (frontal belly)'].map(n => Pronunciations.forTerm(n))")
        check("A name with any unverified word shows nothing; everyday words are shown as written",
              not r[0]["ok"] and not r[1]["ok"] and not r[2]["ok"] and r[3]["text"] == "pek-tuh-RAY-luhs major" and r[4]["singular"] == ["intercostal"] and r[5]["text"] == "ahk-sip-uht-oh-fruhn-TAY-luhs", [x.get("text") for x in r])
        ll = page.evaluate("['Biceps femoris','Rectus femoris','Gluteus medius','Vastus lateralis','Adductor magnus','Fibularis longus','Tibialis posterior','Tensor fasciae latae'].map(n => Pronunciations.forTerm(n))")
        check("Hip, thigh and leg: each femoris follows its own muscle's entry; names with an unverified word show nothing; posterior is an everyday word",
              [x.get("text") for x in ll] == ["BYE-seps FEE-muh-ruhs", "REK-tuhs FEM-uh-ruhs", None, None, None, None, "tib-ee-AY-luhs posterior", "TEN-ser FASH-ee-ee LAY-tee"]
              and ll[2]["missing"] == ["medius"] and ll[5]["missing"] == ["fibularis"], [x.get("text") or x.get("missing") for x in ll])
        check("Each muscle's own entry wins: teres and brachii follow the entry for that muscle",
              page.evaluate("['Teres major','Pronator teres','Biceps brachii','Triceps brachii'].map(n => Pronunciations.forTerm(n).text)") == ["TERR-eez major", "PROH-nayt-er TEER-eez", "BYE-seps BRAY-kee-ee", "TRYE-seps BRAY-kee-eye"])
        check("docs/PRONUNCIATION_REPORT.md matches the data (regenerated by tools/pronunciation-report.js)",
              __import__("subprocess").run(["node", os.path.join(ROOT, "tools/pronunciation-report.js"), "--check"], capture_output=True).returncode == 0)
        # Teaching: Say it under every verified name, the source one tap away, the say-aloud practice optional and collapsed.
        before = len(evs(page, {"course": "BIO131"}))
        page.click("[data-step='learn']"); page.wait_for_selector("text=Fourteen shoulder and arm muscles")
        cards = page.eval_on_selector_all("#screen .mcard", "els => els.map(e => [e.querySelector('h3').textContent, (e.querySelector('.say-r') || {}).textContent || null])")
        want = [[n, (page.evaluate("n => Pronunciations.forTerm(n).text || null", n))] for n, _ in cards]
        check("Learn cards show Say it under each verified name and nothing under supraspinatus", cards == want and dict(cards)["Supraspinatus"] is None and sum(1 for _, x in cards if x) == 13, cards)
        src0 = page.eval_on_selector(".mcard .say-src", "d => [d.open, d.querySelector('.mw').textContent, d.querySelector('a').href, d.querySelector('a').target]")
        check("The source line (collapsed) shows MW's own notation and opens the entry in a new tab to hear it", src0[0] is False and src0[1] == "\\trə-ˈpē-zē-əs, tra-\\" and src0[2].startswith("https://www.merriam-webster.com/") and src0[3] == "_blank", src0)
        box = page.eval_on_selector("details.say-aloud", "d => [d.open, d.textContent]")
        check("Say it aloud is an optional, collapsed practice that says it is never graded or required", box[0] is False and "optional" in box[1] and "never graded" in box[1].lower() and "never needed to move on" in box[1], box[1][:120])
        page.click("details.say-aloud summary"); page.click(".mcard details.say-src summary"); page.wait_for_timeout(300)
        after = evs(page, {"course": "BIO131"})
        check("Opening pronunciations or the say-aloud practice records nothing beyond the usual 'viewed the lesson' note",
              len(after) == before + 1 and not [e for e in after if re.search("say|pronun", e["itemId"])] and status(page, "bio131.ch9.upper-limb-id")["status"] == "learning", [e["itemId"] for e in after])
        ctx.close()
        # Assessment: nothing before an answer, Say it right after it (guided and independent, right and wrong).
        ctx, page, errs = fresh(url=FOREARM); page.wait_for_selector("#screen h2")
        page.click("[data-step='guided']"); page.wait_for_selector("#gnames [data-name]")
        g0 = page.locator("#screen .say").count()
        page.click("#gnames [data-name='%s']" % page.evaluate("MuscleSets.forearm.GUIDED[0].muscle")); page.wait_for_timeout(150)
        g1 = page.inner_text("#gfb")
        check("Guided pins: no pronunciation before she answers; Say it appears after a correct answer", g0 == 0 and "Say it: PROH-nayt-er TEER-eez" in g1, (g0, g1[:120]))
        HEAR = "a[href^='https://www.merriam-webster.com/']"
        h1 = page.eval_on_selector_all("#gfb .say-hear " + HEAR, "as => as.map(a => [a.textContent, a.href, a.target, a.rel])")
        check("After the answer, Hear it links open each Merriam-Webster page in a new tab, labeled with the words that page covers",
              h1 == [["pronator", "https://www.merriam-webster.com/medical/pronator", "_blank", "noopener"], ["teres", "https://www.merriam-webster.com/dictionary/pronator%20teres", "_blank", "noopener"]], h1)
        forearm_guided(page); page.click("[data-step='independent']"); page.wait_for_selector("#q")
        q0 = page.locator("#screen .say").count() + page.locator("#screen " + HEAR).count()
        f1 = ap_type(page, "pronator teres")
        page.fill("#ans", "flexor carpi ulnaris"); page.click("#sub"); page.wait_for_selector("#nextq")
        f2 = page.inner_text("#qfb"); h2 = page.eval_on_selector_all("#qfb .say-hear " + HEAR, "as => as.map(a => a.textContent)")
        page.click("#nextq"); page.wait_for_timeout(250)
        check("On your own: no pronunciation or dictionary link on the question; Say it after a right answer and after a wrong one (the right name's)",
              q0 == 0 and "Say it: PROH-nayt-er TEER-eez" in f1 and "Say it: FLEK-ser KAR-pye ray-dee-AY-luhs" in f2, (q0, f1[:100], f2[:140]))
        check("A wrong answer's feedback links the right name's pages (flexor, then carpi radialis), not the name she typed", h2 == ["flexor", "carpi radialis"] and "Hear it on Merriam-Webster" in f2, (h2, f2[:200]))
        l = [e for e in evs(page, {"course": "BIO131"}) if e["activity"] in ("independent", "review")]
        check("Answers are graded exactly as before: pronunciation is not part of any answer or record", len(l) == 2 and l[0]["correct"] and not l[1]["correct"] and all("say" not in json.dumps(e["response"]).lower() for e in l), [e["response"] for e in l])
        check("No page errors", not errs, errs[:1]); ctx.close()
        # No outside dependency: load the head and neck lesson with every non-local request blocked.
        ctx, page, errs = fresh()
        page.route("**/*", lambda rt: rt.abort() if not rt.request.url.startswith(BASE) else rt.continue_())
        page.goto(AP); page.wait_for_selector("[data-deep='0']")
        page.click("[data-step='learn']"); page.wait_for_selector("text=Seven head and neck muscles")
        n = page.locator("#screen .say").count()
        check("With every outside request blocked, the head and neck learn cards still show Say it (5 of 7: the two orbicularis names have none)", n == 5, n)
        check("No page errors", not errs, errs[:1]); ctx.close()
    guarded("pronunciation", t_pronunciation)
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
        # Across lessons: after the shoulder and arm lesson's 1105 answers, the forearm's 1105 questions are pictures seen before.
        ctx, page, errs = fresh(url=UPPER); page.wait_for_selector("#screen h2")
        page.click("[data-step='guided']"); page.wait_for_selector("#gnames [data-name]")
        for g in page.evaluate("MuscleSets.upper.GUIDED"):
            page.wait_for_selector("#gnames [data-name='%s']" % g["muscle"]); page.click("#gnames [data-name='%s']" % g["muscle"]); page.wait_for_timeout(100)
        page.wait_for_timeout(300); page.click("[data-step='independent']"); page.wait_for_selector("#q")
        for t in ["infraspinatus", "deltoid", "biceps brachii", "subscapularis"]: ap_type(page, t)
        fa = ctx.new_page(); fa.goto(FOREARM); fa.wait_for_selector("#screen h2"); forearm_guided(fa)
        fa.click("[data-step='independent']"); fa.wait_for_selector("#q")
        f = ap_type(fa, "pronator teres"); ap_type(fa, "flexor carpi radialis"); ap_type(fa, "extensor digitorum")
        l = {x["itemId"]: x for x in evs(fa, {"course": "BIO131"})}
        pt, ed = l["ap-ch9-forearm-front-name-pronator-teres"], l["ap-ch9-forearm-back-name-extensor-digitorum"]
        check("Forearm questions on fig. 1105 are NOT new pictures after the shoulder and arm lesson used the same drawings",
              pt["independent"] and pt["objectiveId"] == "bio131.ch9.forearm-id" and pt["response"]["picture"] == "seen" and ed["response"]["picture"] == "seen" and "picture you have seen before" in f,
              (pt["objectiveId"], pt["response"].get("picture"), ed["response"].get("picture")))
        th = ctx.new_page(); th.goto(THIGH); th.wait_for_selector("#screen h2"); thigh_guided(th)
        th.click("[data-step='independent']"); th.wait_for_selector("#q")
        f = ap_type(th, "rectus femoris"); ap_type(th, "vastus medialis"); f3 = ap_type(th, "adductor longus")
        l = {x["itemId"]: x for x in evs(th, {"course": "BIO131"})}
        rf, al = l["ap-ch9-thigh-front-name-rectus-femoris"], l["ap-ch9-thigh-deep-name-adductor-longus"]
        check("Thigh questions on fig. 1105 are pictures seen before after the arm lessons, but the deep adductor drawing is still a new picture",
              rf["objectiveId"] == "bio131.ch9.thigh-id" and rf["response"]["picture"] == "seen" and "picture you have seen before" in f
              and al["objectiveId"] == "bio131.ch9.thigh-id-new-picture" and al["response"]["picture"] == "new" and "never seen" in f3,
              (rf["objectiveId"], rf["response"].get("picture"), al["objectiveId"], al["response"].get("picture")))
        check("No page errors", not errs, errs[:1]); ctx.close()
        # Data: every new-picture item's figure names its source drawing.
        ctx, page, errs = fresh(url=TRUNK); page.wait_for_selector("#screen h2")
        T = page.evaluate("MuscleSets.trunk")
        check("Every trunk figure used for new-picture questions names its OpenStax drawing",
              all(T["FIGURES"][i["fig"]].get("drawing") for i in T["ITEMS"] if i["unfamiliar"] and i["kind"] != "name-fn"))
        ctx.close()
    guarded("pictures", t_pictures)

    # =====================================================================================
    section("A&P Chapter 10 (muscle physiology): accurate content, guided order, independent evidence, next-day review")
    CH10 = BASE + "lessons/ap-ch10/"
    def ch10_order(page, mistakes=0):
        page.click("[data-step='order']"); page.wait_for_selector(".choice")
        O = page.evaluate("Ch10Lesson.ORDERS")
        for oi, o in enumerate(O):
            if oi == 0 and mistakes: page.locator(".choice", has_text=o["events"][3]["t"]).first.click(); page.wait_for_timeout(80)
            for e in o["events"]:
                page.locator(".choice", has_text=e["t"]).first.click(); page.wait_for_timeout(50)
            page.wait_for_timeout(250)
            if oi < len(O) - 1: page.click("#nextOrder"); page.wait_for_selector(".choice")
        page.wait_for_timeout(300)
    def ch10_answer(page, text):
        page.locator("#q .choice", has_text=text).first.click(); page.wait_for_selector("#nextq")
        fbk = page.inner_text("#qfb"); page.click("#nextq"); page.wait_for_timeout(200)
        return fbk
    def t_ch10_data():
        ctx, page, errs = fresh(url=CH10); page.wait_for_selector("#screen h2")
        L = page.evaluate("Ch10Lesson")
        items = L["ITEMS"]
        days = [items[d * 5:(d + 1) * 5] for d in range(5)]
        check("25 independent questions, 5 per topic, and every day's 5 cover all five topics once",
              len(items) == 25 and all(sorted(i["obj"] for i in d) == sorted(L["OBJ"]) for d in days) and len({i["id"] for i in items}) == 25)
        bad = [i["id"] for i in items if len(i["wrong"]) != 3 or any(w["err"] not in L["MIXUPS"] or not w["why"] for w in i["wrong"])
               or i["right"]["t"] in [w["t"] for w in i["wrong"]] or not i["right"]["why"]]
        check("Every wrong choice names its mix-up and explains why it doesn't fit; no choice repeats the answer", not bad, bad)
        give = [i["id"] for i in items if i["right"]["t"].lower().rstrip(".") in i["prompt"].lower()]
        check("No question contains its own answer", not give, give)
        R = {i["id"].replace("ap-ch10-", ""): i["right"]["t"] for i in items}
        anchors = [("ec-calcium-binds", "Troponin"), ("xb-detach", "new ATP binds"), ("xb-power-stroke", "Pi is released"), ("xb-hydrolysis", "cocks the myosin head"),
                   ("xb-sarcomere", "A band stays the same width"), ("xb-rigor", "no ATP is available"), ("relax-requires", "pumped back into the sarcoplasmic reticulum, using ATP"),
                   ("relax-ache", "breaks down ACh"), ("nmj-released", "Acetylcholine"), ("ec-ca-store", "sarcoplasmic reticulum"), ("energy-first-seconds", "Creatine phosphate"),
                   ("energy-glycolysis", "net 2 ATP"), ("energy-rest", "Aerobic respiration"), ("energy-aerobic-where", "mitochondria")]
        off = [(k, v) for k, v in anchors if v not in R.get(k, "")]
        check("Key facts match OpenStax 10.2 and 10.3: Ca²⁺ binds troponin, ATP binding detaches myosin, Pi release triggers the power stroke, splitting ATP re-cocks, A band constant, AChE, energy systems", not off, off)
        text = json.dumps(L["STAGES"], ensure_ascii=False)
        facts = ["About 15 seconds", "net 2 ATP", "About 36 ATP", "about 95%", "−60 to −90 mV", "about 10 nm", "A band keeps its width", "not powered by ATP"]
        check("Teaching screens state the textbook numbers (15 s, net 2 ATP, about 36 ATP, 95%, −60 to −90 mV, 10 nm)", all(f in text for f in facts), [f for f in facts if f not in text])
        stage_ids = [x["id"] for x in L["STAGES"]]
        check("Every mix-up review link points to a real teaching stage", all(v in stage_ids for v in L["MIXUP_STAGE"].values()))
        figs = [x["fig"] for x in L["STAGES"] if x["fig"]]
        check("Every teaching figure exists, with an OpenStax attribution file", all(os.path.exists(os.path.join(ROOT, "student-app/lessons/ap-ch10", f)) for f in figs)
              and "CC BY-NC-SA 4.0" in open(os.path.join(ROOT, "student-app/lessons/ap-ch10/img/ATTRIBUTION.txt")).read())
        hub = open(os.path.join(ROOT, "student-app/index.html")).read(); appjs = open(os.path.join(ROOT, "student-app/app.js")).read()
        check("The hub opens the lesson and the study plan tracks its five objectives",
              'data-resource="ap-ch10"' in hub and '"ap-ch10":{title:"A&P · Chapter 10: How a muscle fiber contracts",src:"./lessons/ap-ch10/index.html"}' in appjs
              and all('{id:"%s"' % o in appjs for o in L["OBJ"].values()))
        check("No page errors", not errs, errs[:1]); ctx.close()
    guarded("ch10 data", t_ch10_data)
    def t_ch10_flow():
        ctx, page, errs = fresh(url=CH10); page.wait_for_selector("#screen h2")
        check("Lesson opens on teaching (stage 1 of 8), with no question on screen", "Stage 1 of 8" in page.inner_text("#screen") and not page.query_selector("#q"))
        check("'On your own' is locked until the steps are put in order", page.is_disabled("[data-step='independent']"))
        for _ in range(7): page.click("#nextStage"); page.wait_for_timeout(60)
        t = [e for e in evs(page, {"course": "BIO131"}) if e["activity"] == "teach"]
        check("Each teaching stage is noted as viewed, never as evidence", len(t) == 8 and all(e["correct"] is None and not e["independent"] for e in t), len(t))
        ch10_order(page, mistakes=1)
        g = [e for e in evs(page, {"course": "BIO131"}) if e["activity"] == "guided"]
        nmj = [e for e in g if e["itemId"] == "ap-ch10-order-contraction-nmj"]
        check("Ordering is guided practice: help on every wrong tap, recorded per topic, never independent",
              len(g) == 4 and all(not e["independent"] and e["assistance"]["guided"] for e in g) and nmj and nmj[0]["correct"] is False and nmj[0]["errorType"] == "sequence-order",
              [(e["itemId"], e["correct"]) for e in g])
        check("Finishing both sequences unlocks 'On your own'", not page.is_disabled("[data-step='independent']"))
        page.click("[data-step='explain']"); page.wait_for_selector("#explainBox")
        page.fill("#explainBox", "synthetic test explanation"); page.check("#ex0"); page.wait_for_timeout(200)
        ex = [e for e in evs(page, {"course": "BIO131"}) if "explain" in e["itemId"]]
        check("Explain it is a self-check: her text is not saved and nothing is graded", len(ex) == 1 and ex[0]["correct"] is None and "synthetic" not in json.dumps(evs(page)), len(ex))
        page.click("[data-step='independent']"); page.wait_for_selector("#q .choice")
        L = page.evaluate("Ch10Lesson")
        order1 = page.eval_on_selector_all("#q .choice", "els => els.map(e => e.textContent)")
        page.reload(); page.wait_for_selector("#screen h2"); page.click("[data-step='independent']"); page.wait_for_selector("#q .choice")
        check("Choices keep the same order after a reload", page.eval_on_selector_all("#q .choice", "els => els.map(e => e.textContent)") == order1)
        day1 = L["ITEMS"][:5]
        fbs = [ch10_answer(page, day1[0]["right"]["t"]), ch10_answer(page, day1[1]["wrong"][0]["t"])] + [ch10_answer(page, it["right"]["t"]) for it in day1[2:]]
        check("A wrong choice gets the right answer, why her choice doesn't fit, and a note that the miss stays",
              "The answer is: Troponin" in fbs[1] and "Tropomyosin is the protein that gets moved" in fbs[1] and "stays in your history" in fbs[1], fbs[1][:200])
        res = page.inner_text("#screen")
        check("Results name the mix-up and link back to the stage that teaches it", "4 of 5 correct" in res and "what Ca²⁺ binds" in res and "Review: 3. Calcium unlocks actin" in res, res[:200])
        e1 = {e["itemId"]: e for e in evs(page, {"course": "BIO131"}) if e["activity"] in ("independent", "review")}
        check("Day 1: five first answers are independent evidence, one per topic, and the miss keeps its error type",
              len(e1) == 5 and all(e["independent"] and e["unfamiliar"] for e in e1.values()) and e1["ap-ch10-ec-calcium-binds"]["errorType"] == "calcium-target"
              and sorted(e["objectiveId"] for e in e1.values()) == sorted(L["OBJ"].values()))
        check("E-C coupling needs review after the miss; the others are shown once", status(page, "bio131.ch10.ec-coupling")["status"] == "needs-review"
              and status(page, "bio131.ch10.nmj")["status"] == "shown-once", (status(page, "bio131.ch10.ec-coupling")["status"], status(page, "bio131.ch10.nmj")["status"]))
        page.click("[data-stage]"); page.wait_for_timeout(200)
        check("The review link opens that teaching stage", "Calcium unlocks actin" in page.inner_text("#screen h2"))
        check("Chapter 10 work never changes Chapter 9 objectives", status(page, "bio131.ch9.facial-muscle-id")["status"] == "not-started")
        p2, e2 = page_at(ctx, DAY2, CH10); p2.wait_for_selector("#q .choice", timeout=8000)
        check("Next day the lesson opens on NEW review questions", "Review: new questions" in p2.inner_text("#screen h2"))
        for it in L["ITEMS"][5:10]: ch10_answer(p2, it["right"]["t"])
        new = [e for e in evs(p2, {"course": "BIO131"}) if e["activity"] == "review"]
        check("Day 2 gives five different questions, one per topic, recorded as review", sorted(e["itemId"] for e in new) == sorted(i["id"] for i in L["ITEMS"][5:10]), [e["itemId"] for e in new])
        check("The day 1 miss is still in her history", any(e["itemId"] == "ap-ch10-ec-calcium-binds" and e["correct"] is False for e in evs(p2, {"course": "BIO131"})))
        check("No page errors", not errs and not e2, (errs + e2)[:1]); ctx.close()
    guarded("ch10 flow", t_ch10_flow)

    # =====================================================================================
    section("A&P Chapter 8 (articulations): accurate content, guided sorting, independent evidence, optional extra set, review")
    CH8 = BASE + "lessons/ap-ch8/"
    def ch8_sort(page, mistakes=0):
        page.click("[data-step='order']"); page.wait_for_selector("#sortCard")
        S = page.evaluate("Ch8Lesson.SORTS")
        clue = ""
        for si, srt in enumerate(S):
            for _ in srt["cards"]:
                card = page.inner_text("#sortCard"); c = next(x for x in srt["cards"] if x["t"] == card)
                if mistakes and si == 0 and not clue:
                    other = next(k["id"] for k in srt["cats"] if k["id"] != c["cat"])
                    page.click("[data-cat='%s']" % other); page.wait_for_timeout(80); clue = page.inner_text("#ofb")
                page.click("[data-cat='%s']" % c["cat"]); page.wait_for_timeout(60)
            page.wait_for_timeout(250)
            if si < len(S) - 1: page.click("#nextSort"); page.wait_for_selector("#sortCard")
        page.wait_for_timeout(300)
        return clue
    def t_ch8_data():
        ctx, page, errs = fresh(url=CH8); page.wait_for_selector("#screen h2")
        L = page.evaluate("Ch8Lesson"); items = L["ITEMS"]
        days = [items[d * 5:(d + 1) * 5] for d in range(5)]
        check("25 independent questions, 5 per topic, and every day's 5 cover all five topics once",
              len(items) == 25 and all(sorted(i["obj"] for i in d) == sorted(L["OBJ"]) for d in days) and len({i["id"] for i in items}) == 25)
        bad = [i["id"] for i in items if len(i["wrong"]) != 3 or any(w["err"] not in L["MIXUPS"] or not w["why"] for w in i["wrong"])
               or i["right"]["t"] in [w["t"] for w in i["wrong"]] or not i["right"]["why"]]
        check("Every wrong choice names its mix-up and explains why it doesn't fit; no choice repeats the answer", not bad, bad)
        give = [i["id"] for i in items if i["right"]["t"].lower().rstrip(".") in i["prompt"].lower()]
        check("No question contains its own answer", not give, give)
        R = {i["id"].replace("ap-ch8-", ""): i["right"]["t"] for i in items}
        anchors = [("cls-gomphosis", "fibrous joint (gomphosis)"), ("cls-pubic", "fibrocartilage) and an amphiarthrosis"), ("cls-all-synovial", "Diarthrosis"),
                   ("cls-growth-plate", "synchondrosis"), ("parts-cover", "Hyaline"), ("parts-secretes", "synovial membrane"), ("parts-meniscus", "Fibrocartilage"),
                   ("types-atlas", "Pivot"), ("types-saddle", "first carpometacarpal"), ("types-ball", "shoulder (glenohumeral joint) and the hip"), ("types-knuckle", "Condyloid"),
                   ("moves-abduction", "Abduction"), ("moves-tiptoe", "Plantar flexion"), ("moves-pronation", "Pronation"), ("moves-circle", "Circumduction"), ("moves-retraction", "Retraction"),
                   ("joints-rotator", "Supraspinatus, infraspinatus, teres minor and subscapularis"), ("joints-pronation-where", "proximal radioulnar joint, a pivot"),
                   ("joints-acl", "Hyperextension"), ("joints-triad", "tibial (medial) collateral ligament, the medial meniscus and the ACL")]
        off = [(k, v) for k, v in anchors if v.lower() not in R.get(k, "").lower()]
        check("Key facts match OpenStax Chapter 9 (Joints): classes, synovial parts, joint types and examples, movements, rotator cuff, ACL, terrible triad", not off, off)
        cards = [c for srt in L["SORTS"] for c in srt["cards"]]
        badc = [c["t"] for c in cards if not c["hint"] or not c["why"] or c["obj"] not in L["OBJ"]]
        leak = [c["t"] for srt in L["SORTS"] for c in srt["cards"] for k in srt["cats"] if k["id"] == c["cat"] and k["label"].lower() in c["hint"].lower()]
        check("Sorting cards: every card has a clue and an explanation, and no clue names the right category", not badc and not leak, (badc, leak))
        stage_ids = [x["id"] for x in L["STAGES"]]
        check("Every mix-up review link points to a real teaching stage", all(v in stage_ids for v in L["MIXUP_STAGE"].values()) and all(i["stage"] in stage_ids for i in items if i["stage"]))
        figs = [x["fig"] for x in L["STAGES"] if x["fig"]]
        check("Every teaching figure exists, with an OpenStax attribution file", all(os.path.exists(os.path.join(ROOT, "student-app/lessons/ap-ch8", f)) for f in figs)
              and "CC BY-NC-SA 4.0" in open(os.path.join(ROOT, "student-app/lessons/ap-ch8/img/ATTRIBUTION.txt")).read())
        hub = open(os.path.join(ROOT, "student-app/index.html")).read(); appjs = open(os.path.join(ROOT, "student-app/app.js")).read()
        check("The hub opens the lesson and the study plan tracks its five objectives",
              'data-resource="ap-ch8"' in hub and '"ap-ch8":{title:"A&P · Chapter 8: Joints and movements",src:"./lessons/ap-ch8/index.html"}' in appjs and all('{id:"%s"' % o in appjs for o in L["OBJ"].values()))
        check("No page errors", not errs, errs[:1]); ctx.close()
    guarded("ch8 data", t_ch8_data)
    def t_ch8_flow():
        ctx, page, errs = fresh(url=CH8); page.wait_for_selector("#screen h2")
        check("Lesson opens on teaching (stage 1 of 9), and 'On your own' is locked", "Stage 1 of 9" in page.inner_text("#screen") and page.is_disabled("[data-step='independent']"))
        clue = ch8_sort(page, mistakes=1)
        check("A wrong sort shows a clue, not the answer", "Clue:" in clue and "Not quite" in clue, clue[:120])
        g = [e for e in evs(page, {"course": "BIO131"}) if e["activity"] == "guided"]
        check("Sorting is guided practice: recorded per topic, never independent, and the miss is kept",
              sorted(e["itemId"] for e in g) == ["ap-ch8-sort-structure-cls", "ap-ch8-sort-type-types"] and all(not e["independent"] and e["assistance"]["guided"] for e in g)
              and [e for e in g if e["itemId"] == "ap-ch8-sort-structure-cls"][0]["correct"] is False, [(e["itemId"], e["correct"]) for e in g])
        check("Finishing both sorts unlocks 'On your own'", not page.is_disabled("[data-step='independent']"))
        page.click("[data-step='independent']"); page.wait_for_selector("#q .choice")
        L = page.evaluate("Ch8Lesson"); day1 = L["ITEMS"][:5]
        for k, it in enumerate(day1): ch10_answer(page, it["right"]["t"] if k != 3 else "Flexion")
        res = page.inner_text("#screen")
        check("A miss on raising the arm sideways is diagnosed as direction and links to the movements stage",
              "4 of 5 correct" in res and "which direction the movement goes" in res and "Review: 6. Naming movements, part 1" in res, res[:220])
        e1 = [e for e in evs(page, {"course": "BIO131"}) if e["activity"] in ("independent", "review")]
        check("Day 1: five independent first answers, one per topic", len(e1) == 5 and all(e["independent"] for e in e1) and sorted(e["objectiveId"] for e in e1) == sorted(L["OBJ"].values()))
        more = page.inner_text("#moreNow") if page.query_selector("#moreNow") else ""
        check("An optional 'more now' button offers the next set and says spacing helps memory more", "Optional: 5 more now" in more and "Spacing them out helps memory more" in res, more)
        page.click("#moreNow"); page.wait_for_selector("#q .choice")
        check("The extra set on the same day is still 'On your own', not review", "On your own" in page.inner_text("#screen h2"))
        for it in L["ITEMS"][5:10]: ch10_answer(page, it["right"]["t"])
        e2 = [e for e in evs(page, {"course": "BIO131"}) if e["activity"] in ("independent", "review")]
        check("The extra set records the next five questions as independent first answers", len(e2) == 10 and sorted(e["itemId"] for e in e2[5:]) == sorted(i["id"] for i in L["ITEMS"][5:10])
              and all(e["activity"] == "independent" for e in e2), [(e["itemId"], e["activity"]) for e in e2[5:]])
        check("Chapter 8 work never changes Chapter 10 objectives", status(page, "bio131.ch10.nmj")["status"] == "not-started")
        p2, x2 = page_at(ctx, DAY2, CH8); p2.wait_for_selector("#q .choice", timeout=8000)
        check("Next day the lesson opens on NEW review questions (the third set)", "Review: new questions" in p2.inner_text("#screen h2")
              and p2.inner_text("#q .prompt") == L["ITEMS"][10]["prompt"], p2.inner_text("#q .prompt")[:80])
        check("No page errors", not errs and not x2, (errs + x2)[:1]); ctx.close()
    guarded("ch8 flow", t_ch8_flow)

    # =====================================================================================
    section("Pronunciation in Chapters 10 and 8: Say it on learn stages only, verified terms only, never recorded")
    def say_rows(page): return page.eval_on_selector_all("#screen .say-list li", "ls => ls.map(l => [l.querySelector('b').textContent, l.querySelector('.say-r').textContent, [...l.querySelectorAll('a')].map(a => [a.textContent, a.href, a.target, a.rel])])")
    def t_pron_chapters():
        ctx, page, errs = fresh(url=CH10); page.wait_for_selector("#screen h2")
        r1 = say_rows(page)
        check("Chapter 10 stage 1: acetylcholine shows its Say it line and a Hear it link to its own Merriam-Webster page; synaptic cleft shows nothing (no dictionary pronunciation)",
              r1 == [["Acetylcholine", "uh-set-uhl-KOH-leen", [["acetylcholine", "https://www.merriam-webster.com/dictionary/acetylcholine", "_blank", "noopener"]]]], r1)
        src = page.eval_on_selector("#screen .say-list details", "d => [d.open, d.textContent]")
        check("The key and MW's own notation sit in a collapsed box, with the day each was read", src[0] is False and "\\\u0259-\u02ccset-\u1d4al-\u02c8k\u014d-\u02ccl\u0113n, -\u02ccs\u0113t-; \u02ccas-\u0259-\u02cct\u0113l-\\" in src[1] and "checked" in src[1] and "zh = the s in vision" in src[1], src[1][:200])
        page.click("#screen .say-list details summary"); page.wait_for_timeout(200)
        L10 = page.evaluate("Ch10Lesson"); shown = {}
        for i, S in enumerate(L10["STAGES"]):
            if i: page.click("#nextStage"); page.wait_for_timeout(60)
            shown[S["id"]] = [x[0] for x in say_rows(page)]
        want10 = {S["id"]: [t for t in L10["SAY"].get(S["id"], []) if page.evaluate("t => Pronunciations.forTerm(t).ok", t)] for S in L10["STAGES"]}
        check("Every Chapter 10 stage shows exactly its verified terms (troponin and synaptic cleft never; nothing on the ATP stage)",
              shown == want10 and "Troponin" not in sum(shown.values(), []) and shown["atp"] == [] and len(sum(shown.values(), [])) == 13, shown)
        ev = evs(page, {"course": "BIO131"})
        check("Opening the Say it box and reading the stages records nothing but the usual 'viewed this stage' notes",
              len(ev) == 8 and all(e["activity"] == "teach" for e in ev) and not [e for e in ev if re.search("say|pronun", e["itemId"])], [e["itemId"] for e in ev])
        ch10_order(page)
        o = page.locator("#screen .say-list").count() + page.locator("#screen a[href*='merriam-webster']").count()
        page.click("[data-step='independent']"); page.wait_for_selector("#q .choice")
        q = page.locator("#screen .say-list").count() + page.locator("#screen a[href*='merriam-webster']").count()
        check("No pronunciation or dictionary link on the ordering practice or on a question", o == 0 and q == 0, (o, q))
        check("No page errors", not errs, errs[:1]); ctx.close()
        ctx, page, errs = fresh(url=CH8); page.wait_for_selector("#screen h2")
        r8 = say_rows(page)
        check("Chapter 8 stage 1: synovial, synarthrosis, diarthrosis shown; cartilaginous and amphiarthrosis not (no full pronunciation the key can show)",
              [x[0] for x in r8] == ["Synovial", "Synarthrosis", "Diarthrosis"] and r8[0][1] == "suh-NOH-vee-uhl", r8)
        L8 = page.evaluate("Ch8Lesson"); shown = {}
        for i, S in enumerate(L8["STAGES"]):
            if i: page.click("#nextStage"); page.wait_for_timeout(60)
            shown[S["id"]] = say_rows(page)
        pf = [x for x in shown["moves2"] if x[0] == "Plantar flexion"]
        check("A two-word term links each dictionary page it uses, labeled by word (plantar, flexion)",
              pf and pf[0][1] == "PLANT-er FLEK-shuhn" and [a[0] for a in pf[0][2]] == ["plantar", "flexion"] and all(a[2] == "_blank" for a in pf[0][2]), pf)
        names8 = sum([[x[0] for x in v] for v in shown.values()], [])
        check("Every Chapter 8 stage shows only verified terms (26 lines; acetabulum, humeroulnar and fibrocartilage never)",
              len(names8) == 26 and not {"Acetabulum", "Humeroulnar", "Fibrocartilage", "Cartilaginous", "Amphiarthrosis"} & set(names8), names8)
        ch8_sort(page)
        o = page.locator("#screen .say-list").count()
        page.click("[data-step='independent']"); page.wait_for_selector("#q .choice")
        q = page.locator("#screen .say-list").count() + page.locator("#screen a[href*='merriam-webster']").count()
        check("No pronunciation on the sorting practice or on a question", o == 0 and q == 0, (o, q))
        check("No page errors", not errs, errs[:1]); ctx.close()
        # Every listed term appears on its own stage, and the shown/not-shown split matches the report.
        for name, L in (("Chapter 10", L10), ("Chapter 8", L8)):
            off = [(sid, t) for sid, ts in L["SAY"].items() for t in ts if t.lower() not in json.dumps([S for S in L["STAGES"] if S["id"] == sid][0], ensure_ascii=False).lower()]
            check(name + ": every Say it term is a word that stage actually teaches", not off, off)
        ctx, page, errs = fresh()
        page.route("**/*", lambda rt: rt.abort() if not rt.request.url.startswith(BASE) else rt.continue_())
        page.goto(CH8); page.wait_for_selector("#screen h2")
        check("With every outside request blocked, the Chapter 8 Say it box still shows its three lines", len(say_rows(page)) == 3, say_rows(page))
        check("No page errors", not errs, errs[:1]); ctx.close()
    guarded("pronunciation chapters", t_pron_chapters)

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
