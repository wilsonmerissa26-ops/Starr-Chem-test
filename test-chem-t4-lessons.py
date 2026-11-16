"""Tests for the CHM 221 Test 4 practice lessons (student-app/lessons/chem-t4) and their place in the app.

Real headless Chromium against a local copy of the site. Every test uses a fresh browser profile with
SYNTHETIC records only; no real student data is read or changed.

Run:  python3 tools/chem_t4/build_items.py   (the content and chemistry checks; stops on any failure)
      python3 test-chem-t4-lessons.py
"""
import datetime, functools, http.server, json, os, re, socketserver, sys, threading
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.abspath(__file__))
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
server = socketserver.TCPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=ROOT))
threading.Thread(target=server.serve_forever, daemon=True).start()
BASE = "http://127.0.0.1:%d/student-app/" % server.server_address[1]
T4 = BASE + "lessons/chem-t4/"
DAY1 = datetime.datetime(2026, 11, 15, 9, 0, 0)
DAY2 = datetime.datetime(2026, 11, 16, 9, 0, 0)

results, failures = [], []
def check(name, ok, detail=""):
    results.append(("PASS" if ok else "FAIL", name, str(detail)))
    if not ok: failures.append(name)
def guarded(name, fn):
    try: fn()
    except Exception as e: check(name, False, "crashed: " + ((str(e).splitlines() or [repr(e)])[0])[:240])

def load_data(key):
    src = open(os.path.join(ROOT, "student-app/lessons/chem-t4/items-%s.js" % key)).read()
    return json.loads(src.split("window.T4DATA[%s] = " % json.dumps(key), 1)[1].rstrip().rstrip(";"))
DATA = {k: load_data(k) for k in ("alkenes", "alkynes", "arrows", "structures")}

with sync_playwright() as pw:
    browser = pw.chromium.launch()
    def open_page(ctx, page_url, when):
        page = ctx.new_page(); page.clock.install(time=when); errs = []
        page.on("pageerror", lambda e: errs.append(str(e)))
        page.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        page.goto(page_url)
        if "/lessons/" in page_url:
            page.wait_for_function("document.getElementById('status-chip') && !/Checking/.test(document.getElementById('status-chip').textContent)")
        else:
            page.wait_for_selector("#today-tasks", state="attached"); page.wait_for_timeout(500)
        return page, errs
    def fresh(page_url, when=DAY1):
        ctx = browser.new_context(viewport={"width": 820, "height": 1180})
        page, errs = open_page(ctx, page_url, when)
        return ctx, page, errs
    def evs(page, f=None): return page.evaluate("f => LearningRecord.events(f)", f)
    def reopen(ctx, url, when):
        # Same browser profile (its IndexedDB and localStorage), a new page on a different day.
        for p in ctx.pages: p.close()
        page, errs = open_page(ctx, url, when)
        return ctx, page, errs

    def correct_p2(item):
        return "p%d" % [i for i, p in enumerate(item["products"]) if p["tag"] == "correct"][0]
    def wrong_p2(item, tag=None):
        return "p%d" % [i for i, p in enumerate(item["products"]) if p["tag"] != "correct" and (tag is None or p["tag"] == tag)][0]
    def finish_compare_explain(page, mistakes=False):
        page.wait_for_selector("#cmp-done")
        if mistakes: page.click("#cmp [data-mistake]")
        page.click("#cmp-done" if mistakes else "#cmp-none")
        page.wait_for_selector("#ex1-show"); page.fill("#ex1-text", "Because of where the more stable intermediate forms.")
        page.click("#ex1-show"); page.click('#ex1 [data-rate="yes"]'); page.wait_for_timeout(250)
    def do_guided_product(page, item):
        if item["kind"] == "job":
            page.click('[data-p1="c%d"]' % [i for i, c in enumerate(item["choices"]) if c["tag"] == "correct"][0])
        else:
            page.click('[data-p1="%s"]' % (item["reagentKey"] if item["kind"] == "product" else "s%d" % [i for i, x in enumerate(item["seqs"]) if x["tag"] == "correct"][0]))
            page.click("#gate-done"); page.click('[data-p2="%s"]' % correct_p2(item))
        finish_compare_explain(page)
    def finish_guided_products(page, key):
        page.click("[data-step=help]"); page.wait_for_timeout(300)
        for i, g in enumerate(DATA[key]["guided"]):
            do_guided_product(page, g)
            if i < len(DATA[key]["guided"]) - 1:
                page.wait_for_selector("#gnext"); page.click("#gnext"); page.wait_for_timeout(250)
        page.wait_for_selector('[data-go="alone"]')

    # ---------------------------------------------------------------- pages load cleanly
    def t_load():
        for key in DATA:
            ctx, page, errs = fresh(T4 + key + ".html")
            for step in ("watch", "help"):
                page.click("[data-step=%s]" % step); page.wait_for_timeout(250)
            locked = page.get_attribute("[data-step=alone]", "disabled") is not None and page.get_attribute("[data-step=review]", "disabled") is not None
            check("%s: loads with no script errors" % key, not errs, errs[:2])
            check("%s: Draw alone and Review are locked before Draw with help" % key, locked)
            ctx.close()
    guarded("pages load", t_load)

    # ---------------------------------------------------------------- guided practice is recorded as assisted
    def t_guided():
        ctx, page, errs = fresh(T4 + "alkenes.html")
        finish_guided_products(page, "alkenes")
        ev = [e for e in evs(page, {"objectiveId": "chm221.ch8.alkene-reagents"}) if e["activity"] == "guided"]
        check("guided answers are saved", len(ev) >= 4, len(ev))
        check("no guided answer counts as independent", all(not e["independent"] for e in ev))
        check("guided completion unlocks Draw alone", page.get_attribute("[data-step=alone]", "disabled") is None)
        nxt = page.inner_text("#gnext") if page.query_selector("#gnext") else ""
        check("a beginner can keep drawing with help, one problem per reagent", "left" in nxt, nxt)
        page.click("#gnext"); page.wait_for_timeout(300)
        t0 = sorted(DATA["alkenes"]["targeted"], key=lambda t: list(DATA["alkenes"]["families"]).index(t["family"]))[0]
        check("the extra help problems start with the first reagent family", t0["smName"] in page.inner_text("#screen h2") and "Draw with help" in page.text_content("#screen .card .eyebrow"), page.inner_text("#screen h2"))
        sc = [e for e in evs(page) if e["itemId"].endswith("-selfcheck")]
        check("paper self-checks are saved as practice with the answer shown", sc and all(e["activity"] == "check" and not e["independent"] and e["assistance"]["answerShown"] for e in sc), len(sc))
        # a wrong guided choice gets the specific feedback and can be retried
        ctx.close()
        ctx, page, errs = fresh(T4 + "alkenes.html")
        page.click("[data-step=help]"); page.wait_for_timeout(300)
        g = DATA["alkenes"]["guided"][0]
        page.click('[data-p1="hydroboration"]'); page.wait_for_timeout(200)
        txt = page.inner_text("#fb1")
        check("guided: wrong job shows the reagent's card", "Not quite" in txt and "Hg(OAc)" in txt, txt[:120])
        page.click('[data-p1="%s"]' % g["reagentKey"]); page.wait_for_timeout(200)
        check("guided: the product choices stay hidden until she has drawn on paper", not page.is_visible("#p2wrap"))
        page.click("#gate-done")
        page.click('[data-p2="%s"]' % wrong_p2(g, "anti-markovnikov-instead")); page.wait_for_timeout(200)
        txt = page.inner_text("#fb2")
        check("guided: wrong product names the specific slip", "less substituted" in txt, txt[:160])
        ctx.close()
    guarded("guided", t_guided)

    # ---------------------------------------------------------------- independent: correct, then the two kinds of miss
    def start_independent(key, when=DAY1):
        ctx, page, errs = fresh(T4 + key + ".html", when)
        finish_guided_products(page, key)
        page.click('[data-go="alone"]'); page.wait_for_selector("#check")
        title = page.inner_text("#screen h2")
        item = [i for i in DATA[key]["independent"] if (i.get("question") or (i["smName"] + " + " + i["reagent"])) in title or i["smName"] in title][0]
        return ctx, page, errs, item
    def t_independent_correct():
        ctx, page, errs, item = start_independent("alkenes")
        page.click('[data-p1="%s"]' % item["reagentKey"])
        page.click("#gate-done"); page.click('[data-p2="%s"]' % correct_p2(item)); page.click("#check"); page.wait_for_timeout(400)
        e = [x for x in evs(page) if x["itemId"] == item["id"]][0]
        check("independent correct: counted as independent evidence", e["independent"] and e["correct"] and e["activity"] == "independent", e)
        check("independent correct: status is shown once", e["statusAfter"] == "shown-once", e["statusAfter"])
        check("independent correct: page says it counted", "Counted as independent evidence" in page.inner_text("#result"))
        ctx.close()
    guarded("independent correct", t_independent_correct)

    def t_execution_slip():
        ctx, page, errs, item = start_independent("alkenes")
        wrong = [p for p in item["products"] if p["tag"] != "correct"][0]
        page.click('[data-p1="%s"]' % item["reagentKey"]); page.click("#gate-done")
        page.click('[data-p2="%s"]' % wrong_p2(item, wrong["tag"])); page.click("#check"); page.wait_for_timeout(400)
        e = [x for x in evs(page) if x["itemId"] == item["id"]][0]
        res = page.inner_text("#result")
        check("right job, wrong product: recorded as an execution slip", e["errorType"] == "execution:" + wrong["tag"] and e["response"]["errorClass"] == "execution", e["errorType"])
        check("right job, wrong product: feedback says not to relearn the reagent", "execution slip, not a reagent gap" in res, res[:200])
        check("right job, wrong product: the specific slip is explained", DATA["alkenes"]["tags"][wrong["tag"]][:30] in res)
        check("right job, wrong product: compare stage shows each specific mistake", page.locator("#cmp [data-mistake]").count() >= 2)
        finish_compare_explain(page, mistakes=True)
        btn = page.get_attribute("#nextpractice", "data-item")
        tgt = [t for t in DATA["alkenes"]["targeted"] if t["id"] == btn][0]
        check("next practice uses the same reagent on a new molecule", tgt["reagentKey"] == item["reagentKey"] and tgt["sm" if "sm" in tgt else "smName"] != item.get("smName"), btn)
        page.click("#nextpractice"); page.wait_for_timeout(300)
        page.click('[data-p1="%s"]' % tgt["reagentKey"]); page.click("#gate-done"); page.click('[data-p2="%s"]' % correct_p2(tgt)); page.wait_for_timeout(400)
        te = [x for x in evs(page) if x["itemId"].startswith(tgt["id"])]
        check("next practice is saved as guided, never independent", te and all(x["activity"] == "guided" and not x["independent"] for x in te), len(te))
        ctx.close()
    guarded("execution slip", t_execution_slip)

    def t_reagent_gap():
        ctx, page, errs, item = start_independent("alkenes")
        wrongjob = [j["key"] for j in [x for x in DATA["alkenes"]["independent"] if x["id"] == item["id"]][0]["jobs"] if not j["correct"]][0]
        page.click('[data-p1="%s"]' % wrongjob); page.click("#gate-done")
        page.click('[data-p2="%s"]' % correct_p2(item)); page.click("#check"); page.wait_for_timeout(400)
        e = [x for x in evs(page) if x["itemId"] == item["id"]][0]
        res = page.inner_text("#result")
        check("wrong job: recorded as a reagent gap", e["errorType"] == "reagent:" + item["reagentKey"] and e["response"]["errorClass"] == "reagent", e["errorType"])
        check("wrong job, right product: flagged as a possible guess", "may have been a guess" in res)
        check("wrong job: feedback reteaches the reagent", "the gap is the reagent itself" in res)
        check("wrong job is not counted as correct", e["correct"] is False and e["statusAfter"] == "needs-review")
        finish_compare_explain(page)
        sc = [x for x in evs(page) if x["itemId"] == item["id"] + "-selfcheck"]
        check("self-check after Draw alone never changes the independent result", sc and not sc[0]["independent"] and [x for x in evs(page) if x["itemId"] == item["id"]][0]["correct"] is False)
        ctx.close()
    guarded("reagent gap", t_reagent_gap)

    def t_help_counts_as_practice():
        ctx, page, errs, item = start_independent("alkynes")
        page.click("#hint")
        if item["kind"] == "job":
            page.click('[data-p1]:not([data-p1=""])')
        else:
            page.click('[data-p1="%s"]' % (item["reagentKey"] if item["kind"] == "product" else "s0"))
        if item["kind"] != "job":
            page.click("#gate-done"); page.click('[data-p2="%s"]' % correct_p2(item))
        page.click("#check"); page.wait_for_timeout(400)
        e = [x for x in evs(page) if x["itemId"] == item["id"]][0]
        check("opening the card during an independent problem makes it practice", e["independent"] is False and e["assistance"]["reteachSeen"], e["assistance"])
        ctx.close()
    guarded("help counts as practice", t_help_counts_as_practice)

    # ---------------------------------------------------------------- delayed review and the two-day rule
    def t_review_two_days():
        ctx, page, errs, item = start_independent("alkenes")
        page.click('[data-p1="%s"]' % item["reagentKey"]); page.click("#gate-done")
        page.click('[data-p2="%s"]' % wrong_p2(item)); page.click("#check"); page.wait_for_timeout(400)
        # same day: no second independent problem
        page.click("[data-step=review]"); page.wait_for_timeout(300)
        check("same day: no new problem until the review date", "Next review" in page.inner_text("#screen"))
        ctx, page, errs = reopen(ctx, T4 + "alkenes.html", DAY2)
        page.wait_for_selector("#check")
        title = page.inner_text("#screen h2")
        eb = page.text_content("#screen .card .eyebrow")
        check("next day: a new review problem opens", eb.startswith("Review"), eb)
        it2 = [i for i in DATA["alkenes"]["independent"] if i["smName"] in title][0]
        check("review problem is new", it2["id"] != item["id"])
        check("review comes from the family she missed", it2["family"] == item["family"] or not [i for i in DATA["alkenes"]["independent"] if i["family"] == item["family"] and i["id"] != item["id"]], (it2["family"], item["family"]))
        page.click('[data-p1="%s"]' % it2["reagentKey"]); page.click("#gate-done"); page.click('[data-p2="%s"]' % correct_p2(it2)); page.click("#check"); page.wait_for_timeout(400)
        e = [x for x in evs(page) if x["itemId"] == it2["id"]][0]
        check("review answer is activity review and independent", e["activity"] == "review" and e["independent"], e["activity"])
        check("one correct day after a miss is shown once, not mastery", e["statusAfter"] == "shown-once", e["statusAfter"])
        ctx.close()
    guarded("review", t_review_two_days)

    def t_mastery_two_days():
        ctx, page, errs, item = start_independent("alkynes")
        def answer_right(it):
            if it["kind"] == "job":
                k = "c%d" % [i for i, c in enumerate(it["choices"]) if c["tag"] == "correct"][0]
                page.click('[data-p1="%s"]' % k)
            else:
                if it["kind"] == "synthesis":
                    page.click('[data-p1="s%d"]' % [i for i, s in enumerate(it["seqs"]) if s["tag"] == "correct"][0])
                else:
                    page.click('[data-p1="%s"]' % it["reagentKey"])
                page.click("#gate-done"); page.click('[data-p2="%s"]' % correct_p2(it))
            page.click("#check"); page.wait_for_timeout(400)
        answer_right(item)
        ctx, page, errs = reopen(ctx, T4 + "alkynes.html", DAY2)
        page.wait_for_selector("#check")
        title = page.inner_text("#screen h2")
        it2 = [i for i in DATA["alkynes"]["independent"] if (i.get("question") or i["smName"]) in title or i["smName"] in title][0]
        answer_right(it2)
        e = [x for x in evs(page) if x["itemId"] == it2["id"]][0]
        check("two different new problems right on two days: shown on 2 days", e["statusAfter"] == "shown-2-days", e["statusAfter"])
        ctx.close()
    guarded("two-day mastery", t_mastery_two_days)

    # ---------------------------------------------------------------- synthesis: each formula sits next to its own compound
    def t_synthesis_formulas():
        syn = [i for i in DATA["alkynes"]["independent"] if i["kind"] == "synthesis"][0]
        check("synthesis data: intermediate and target facts are separate",
              syn["facts"]["formula"] == "C10H16" and syn.get("targetFacts", {}).get("formula") == "C10H18", (syn.get("facts"), syn.get("targetFacts")))
        ctx, page, errs = fresh(T4 + "alkynes.html")
        before = [i["id"] for i in DATA["alkynes"]["independent"]]
        before = before[:before.index(syn["id"])]
        # synthetic guided-practice records for the problems ahead of it, so Draw alone opens the synthesis next
        page.evaluate("""ids => Promise.all(ids.map(id => LearningRecord.record({course:'CHM221', objectiveId:'chm221.ch9.alkyne-reagents', itemId:id, itemVersion:1,
                         activity:'guided', correct:true, unfamiliar:false, source:'test'})))""", before)
        ctx, page, errs = reopen(ctx, T4 + "alkynes.html", DAY1)
        finish_guided_products(page, "alkynes")
        page.click('[data-go="alone"]'); page.wait_for_selector("#check")
        check("synthesis opens in Draw alone", syn["question"] in page.inner_text("#screen h2") or syn["smName"] in page.inner_text("#screen"), page.inner_text("#screen h2"))
        page.click('[data-p1="s%d"]' % [i for i, s in enumerate(syn["seqs"]) if s["tag"] == "correct"][0])
        page.click("#gate-done"); page.click('[data-p2="%s"]' % correct_p2(syn)); page.click("#check"); page.wait_for_timeout(400)
        txt = page.inner_text("#after")
        check("checked solution: intermediate with C10H16", "After step 2: 1-cyclohexyl-2-butyne · 10 carbons · C10H16" in txt, txt[:300])
        check("checked solution: final alkene with C10H18", "After step 3: (E)-1-cyclohexyl-2-butene · 10 carbons · C10H18" in txt, txt[:300])
        check("synthesis: no script errors", not errs, errs[:2])
        ctx.close()
    guarded("synthesis formulas", t_synthesis_formulas)

    # ---------------------------------------------------------------- replaced problems: earlier answers stay where they were
    def t_old_ids_kept():
        OLD = {"chem-t4-aky-ind-x2": "chm221.ch9.alkyne-reagents", "chem-t4-aky-ind-double-elim": "chm221.ch9.alkyne-reagents",
               "chem-t4-alk-ind-ozonolysis": "chm221.ch8.alkene-reagents", "chem-t4-str-ind-error-charge": "chm221.t4.structures"}
        NEW = ["chem-t4-aky-ind-x2-dimethylhexyne", "chem-t4-aky-ind-double-elim-ethyl", "chem-t4-alk-ind-ozonolysis-cyclopentylidene", "chem-t4-str-ind-error-charge-pentanol"]
        ids = {i["id"] for k in DATA for role in ("guided", "independent", "targeted") for i in DATA[k][role]}
        check("replaced problems: old ids are gone from the lessons, so nothing new is recorded under them", not (set(OLD) & ids), set(OLD) & ids)
        check("replaced problems: new ids are present", set(NEW) <= ids, set(NEW) - ids)
        ctx, page, errs = fresh(T4 + "alkynes.html")
        # synthetic answers to the old versions, as if she had done them before this change
        page.evaluate("""old => Promise.all(Object.keys(old).map(id => LearningRecord.record({course:'CHM221', objectiveId:old[id], itemId:id, itemVersion:1,
                         activity:'independent', correct:true, unfamiliar:true, source:'test', assistance:{hints:0}})))""", OLD)
        def old_answers(pg): return sorted(json.dumps(e, sort_keys=True) for e in evs(pg) if e["itemId"] in OLD)
        before = old_answers(page)
        check("synthetic old answers saved", len(before) == 4, len(before))
        objs = sorted(set(OLD.values()))
        st_before = page.evaluate("objs => Promise.all(objs.map(o => LearningRecord.status(o)))", objs)
        for lesson in ("alkynes", "alkenes", "structures", "arrows"):
            ctx, page, errs = reopen(ctx, T4 + lesson + ".html", DAY1)
            check("old answers kept unchanged after opening %s" % lesson, old_answers(page) == before)
            check("%s: no script errors with old-id answers on record" % lesson, not errs, errs[:2])
        st_after = page.evaluate("objs => Promise.all(objs.map(o => LearningRecord.status(o)))", objs)
        check("objective status unchanged (no answer reassigned)", json.dumps(st_before, sort_keys=True) == json.dumps(st_after, sort_keys=True))
        check("new problems have no answers on record", not [e for e in evs(page) if e["itemId"] in NEW])
        ctx.close()
    guarded("replaced problem ids", t_old_ids_kept)

    # ---------------------------------------------------------------- mechanisms: tap the arrows
    def tgt(x):
        if x.endswith(".lp"): return x + "1"
        if "-" in x: return "-".join(sorted(x.split("-")))
        return x
    def tap_arrows(page, step):
        for a, b in step["arrows"]:
            page.click('[data-target="%s"]' % tgt(a), force=True)
            page.click('[data-target="%s"]' % tgt(b), force=True)
            page.wait_for_timeout(120)
    def pick_type(page, step):
        page.click('[data-type]:text-is("%s")' % step["type"])
    def do_mech_step(page, st, charges=True):
        pick_type(page, st); tap_arrows(page, st); page.click("#phasebtn"); page.wait_for_timeout(100)
        if charges:
            for a in st["charges"][0]: page.click('[data-target="%s"]' % a, force=True)
        page.click("#phasebtn"); page.wait_for_timeout(450)
    def finish_guided_mech(page):
        page.click("[data-step=help]"); page.wait_for_timeout(300)
        for gi, g in enumerate(DATA["arrows"]["guided"]):
            for k, st in enumerate(g["steps"]):
                if gi == 0 and k == 0:
                    page.click("#mf"); page.wait_for_timeout(200); continue   # step 1 is shown worked out (help fades)
                do_mech_step(page, st)
            finish_compare_explain(page)
            if gi < len(DATA["arrows"]["guided"]) - 1:
                page.wait_for_selector("#gnext"); page.click("#gnext"); page.wait_for_timeout(300)
        page.wait_for_selector('[data-go="alone"]')
    def t_mech():
        ctx, page, errs = fresh(T4 + "arrows.html")
        finish_guided_mech(page)
        ev = [e for e in evs(page, {"objectiveId": "chm221.t4.electron-movement"}) if e["activity"] == "guided"]
        check("mechanism guided steps are saved as guided", ev and all(not e["independent"] for e in ev), len(ev))
        check("mechanism guided completion unlocks Draw alone", page.get_attribute("[data-step=alone]", "disabled") is None)
        page.click('[data-go="alone"]'); page.wait_for_selector("#mgate-done")
        check("Draw alone mechanism: shows only the starting materials until she has drawn it on paper", page.locator("#phasebtn").count() == 0)
        page.click("#mgate-done")
        title = page.inner_text("#screen h2")
        item = [i for i in DATA["arrows"]["independent"] if i["title"] == title][0]
        # step 1: right move, arrow drawn backwards; the rest correct
        for k, st in enumerate(item["steps"]):
            if k == 0:
                pick_type(page, st)
                a, b = st["arrows"][0]
                page.click('[data-target="%s"]' % tgt(b), force=True); page.click('[data-target="%s"]' % tgt(a), force=True)
                for a2, b2 in st["arrows"][1:]:
                    page.click('[data-target="%s"]' % tgt(a2), force=True); page.click('[data-target="%s"]' % tgt(b2), force=True)
                page.click("#phasebtn"); page.wait_for_timeout(100)
                for c in st["charges"][0]: page.click('[data-target="%s"]' % c, force=True)
                page.click("#phasebtn"); page.wait_for_timeout(300)
            else:
                do_mech_step(page, st)
        page.wait_for_timeout(400)
        e = [x for x in evs(page) if x["itemId"] == item["id"]][0]
        txt = page.inner_text("#after")
        first_err = e["response"]["steps"][0]["arrowError"]
        check("mechanism: a reversed or misplaced arrow is an arrow slip, not a pattern gap", e["response"]["errorClass"] == "execution" and e["errorType"].startswith("arrows:"), (e["errorType"], first_err))
        check("mechanism: feedback says the moves are known", "you know the moves" in txt)
        check("mechanism: the compare stage lists specific drawing mistakes", page.locator("#cmp [data-mistake]").count() >= 5)
        finish_compare_explain(page, mistakes=True)
        check("mechanism: next practice is offered", page.query_selector("#nextpractice") is not None)
        ctx.close()
        # a fully correct independent mechanism counts
        ctx, page, errs = fresh(T4 + "arrows.html")
        finish_guided_mech(page)
        page.click('[data-go="alone"]'); page.wait_for_selector("#mgate-done"); page.click("#mgate-done")
        title = page.inner_text("#screen h2"); item = [i for i in DATA["arrows"]["independent"] if i["title"] == title][0]
        for st in item["steps"]:
            do_mech_step(page, st)
        page.wait_for_timeout(400)
        e = [x for x in evs(page) if x["itemId"] == item["id"]][0]
        check("mechanism: all moves, arrows and charges right counts as independent", e["correct"] and e["independent"], e["errorType"])
        ctx.close()
        # wrong charges with right arrows is an execution slip on charges
        ctx, page, errs = fresh(T4 + "arrows.html")
        finish_guided_mech(page)
        page.click('[data-go="alone"]'); page.wait_for_selector("#mgate-done"); page.click("#mgate-done")
        title = page.inner_text("#screen h2"); item = [i for i in DATA["arrows"]["independent"] if i["title"] == title][0]
        for k, st in enumerate(item["steps"]):
            do_mech_step(page, st, charges=(k != 0))
        page.wait_for_timeout(400)
        e = [x for x in evs(page) if x["itemId"] == item["id"]][0]
        check("mechanism: right arrows but a missed charge is recorded as a charge slip", e["errorType"] == "charges" and e["response"]["errorClass"] == "execution", e["errorType"])
        check("mechanism pages: no script errors", not errs, errs[:2])
        ctx.close()
    guarded("mechanisms", t_mech)


    # ---------------------------------------------------------------- structure skills: parts, drawing first, specific feedback
    def answer_parts(page, item, wrong_first=False, helped=True):
        for i, p in enumerate(item["parts"]):
            if p["type"] == "number":
                v = p["answer"] - 1 if (wrong_first and i == 0) else p["answer"]
                page.fill("#in%d" % i, str(v))
                if helped: page.click('[data-checkpart="%d"]' % i)
            elif p["type"] == "choice":
                page.click('#pt%d [data-val="%s"]' % (i, p["answer"]))
            else:
                for a in (p["answer"][:1] if p.get("any") else p["answer"]):
                    page.click('#pfig [data-target="%s"]' % a, force=True)
                if helped: page.click('[data-checkpart="%d"]' % i)
            page.wait_for_timeout(120)
    def finish_guided_structures(page):
        page.click("[data-step=help]"); page.wait_for_timeout(300)
        for gi, g in enumerate(DATA["structures"]["guided"]):
            if g["drawFirst"]: page.click("#gate-done")
            answer_parts(page, g)
            if g.get("draw") and not g["drawFirst"]:
                page.wait_for_selector("#gate2-done"); page.click("#gate2-done")
            finish_compare_explain(page)
            if gi < len(DATA["structures"]["guided"]) - 1:
                page.wait_for_selector("#gnext"); page.click("#gnext"); page.wait_for_timeout(250)
        page.wait_for_selector('[data-go="alone"]')
    def t_structures():
        ctx, page, errs = fresh(T4 + "structures.html")
        page.click("[data-step=help]"); page.wait_for_timeout(300)
        g0 = DATA["structures"]["guided"][0]
        page.fill("#in0", str(g0["parts"][0]["answer"] - 1)); page.click('[data-checkpart="0"]'); page.wait_for_timeout(200)
        check("structures: a wrong carbon count gets the specific reason", g0["parts"][0]["low"][:25] in page.inner_text("#pfb0"), page.inner_text("#pfb0")[:120])
        page.click('#pfig [data-target="d"]', force=True); page.click('[data-checkpart="2"]'); page.wait_for_timeout(200)
        check("structures: tapping a non-stereocenter explains why it isn't one", "two CH" in page.inner_text("#pfb2"), page.inner_text("#pfb2")[:120])
        ctx.close()
        ctx, page, errs = fresh(T4 + "structures.html")
        finish_guided_structures(page)
        check("structures: guided completion unlocks Draw alone", page.get_attribute("[data-step=alone]", "disabled") is None)
        ev = [e for e in evs(page, {"objectiveId": "chm221.t4.structures"}) if e["activity"] == "guided"]
        check("structures: guided parts are saved as guided", ev and all(not e["independent"] for e in ev), len(ev))
        page.click('[data-go="alone"]'); page.wait_for_selector("#check")
        title = page.inner_text("#screen h2")
        item = [i for i in DATA["structures"]["independent"] if i["title"] == title][0]
        if item["drawFirst"]:
            check("structures: a draw-first problem hides the questions until she has drawn", not page.is_visible("#partsbox"))
            page.click("#gate-done")
        num_first = item["parts"][0]["type"] == "number"
        answer_parts(page, item, wrong_first=num_first, helped=False)
        page.click("#check"); page.wait_for_timeout(400)
        e = [x for x in evs(page) if x["itemId"] == item["id"]][0]
        if num_first:
            check("structures: a wrong part is recorded with its skill", e["correct"] is False and e["errorType"] == "skill:" + item["parts"][0]["skill"], e["errorType"])
        else:
            check("structures: all parts right counts as independent", e["correct"] and e["independent"], e["errorType"])
        check("structures pages: no script errors", not errs, errs[:2])
        ctx.close()
    guarded("structures", t_structures)

    # ---------------------------------------------------------------- existing records and the app shell
    def t_existing_records():
        ctx, page, errs = fresh(BASE)
        page.evaluate("""() => LearningRecord.record({course:'CHM221', objectiveId:'chm221.ch8.hx-addition', itemId:'chem-ch8-ind-1-butene-hbr', itemVersion:1,
                         activity:'independent', correct:true, unfamiliar:true, source:'test'})""")
        page.evaluate("""() => new Promise(r => { localStorage.setItem('astarryia-learning-planner-mirror-v1', JSON.stringify({version:1, done:{'chem-1116-review':'2026-11-15T10:00:00.000Z'}, custom:[], updatedAt:'2026-11-15T10:00:00.000Z'})); r(); })""")
        before = evs(page)
        ctx, page, errs = reopen(ctx, T4 + "alkenes.html", DAY1)
        finish_guided_products(page, "alkenes")
        ctx, page, errs = reopen(ctx, BASE, DAY1)
        after = evs(page)
        ids_before = {e["id"] for e in before}
        check("existing learning events are kept unchanged", all(any(a["id"] == b["id"] and a == b for a in after) for b in before), len(before))
        check("new events are only added", ids_before <= {e["id"] for e in after} and len(after) > len(before))
        dc = page.evaluate("() => LearningRecord.dataCheck()")
        check("learning record has no invalid events", dc["invalid"] == 0, dc)
        ctx.close()
    guarded("existing records", t_existing_records)

    def t_app_shell():
        ctx, page, errs = fresh(BASE)
        app = open(os.path.join(ROOT, "student-app/app.js")).read()
        for key, oid in (("structures", "chm221.t4.structures"), ("alkenes", "chm221.ch8.alkene-reagents"), ("alkynes", "chm221.ch9.alkyne-reagents"), ("arrows", "chm221.t4.electron-movement")):
            check("%s: in the resource library" % key, '"chem-t4-%s"' % key in app)
            check("%s: in Next up" % key, oid in app)
        page.evaluate("() => document.querySelector('[data-go=chemistry]').click()"); page.wait_for_timeout(300)
        page.wait_for_function("!/Loading the Test 4/.test(document.getElementById('t4-classroom').textContent)")
        room = page.inner_text("#t4-classroom").lower()
        check("chemistry screen shows the Test 4 classroom", "test 4 classroom" in room and "alkene reagents" in room and "alkyne reagents" in room and "curved arrows" in room, room[:300])
        check("classroom lists the plan first, then the five lessons with a status each", page.locator("#t4-classroom .t4-row").count() == 6
              and "your test 4 plan" in page.locator("#t4-classroom .t4-row").first.inner_text().lower())
        page.locator('#t4-classroom [data-resource="chem-t4-plan"]').click(); page.wait_for_timeout(600)
        check("the plan row opens the plan page inside the app", (page.get_attribute("#resource-frame", "src") or "").endswith("lessons/chem-t4/plan.html"))
        fr = page.frame_locator("#resource-frame")
        check("plan page loads inside the app", "your test 4 plan" in fr.locator("h1").inner_text(timeout=5000).lower())
        seed = re.findall(r'\["(chem-11(?:1[4-9])-[^"]+)","(2026-11-1[4-9])"', app)
        ids = [s[0] for s in seed]
        check("calendar ids are unique", len(ids) == len(set(ids)), ids)
        for kept in ("chem-1116-review", "chem-1117-ch9", "chem-1118-mock", "chem-1119-test4", "ap-1117-exam", "ap-1118-lab"):
            check("calendar keeps %s" % kept, '"%s"' % kept in app)
        check("app shell: no script errors", not errs, errs[:2])
        ctx.close()
    guarded("app shell", t_app_shell)

    # ---------------------------------------------------------------- the Test 4 plan page
    def t_plan_page():
        import importlib.util
        spec = importlib.util.spec_from_file_location("content_plan", os.path.join(ROOT, "tools/chem_t4/content_plan.py"))
        CP = importlib.util.module_from_spec(spec); spec.loader.exec_module(CP)
        ctx = browser.new_context(viewport={"width": 820, "height": 1180}); page = ctx.new_page(); page.clock.install(time=DAY1); errs = []
        page.on("pageerror", lambda e: errs.append(str(e)))
        page.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        page.goto(T4 + "plan.html"); page.wait_for_selector("section.day")
        check("plan: five days", page.locator("section.day").count() == 5)
        check("plan: today (Nov 15) is marked", "today" in (page.get_attribute("#d-sun", "class") or ""))
        check("plan: every hint and answer starts closed", page.locator("details[open]").count() == 0)
        n_steps = sum(len(qas) for w in CP.WALKS.values() for _, qas in w["steps"])
        n_hints = sum(1 for w in CP.WALKS.values() for _, qas in w["steps"] for qa in qas if qa[2])
        n_prac = sum(len(w["with_help"]) + len(w["on_own"]) for w in CP.WALKS.values())
        n_ans = n_steps + n_prac + len(CP.CARDS) + len(CP.CARD_TODAY) + len(CP.CARD_PRACTICE) + len(CP.TOPICS)
        check("plan: one answer behind a button for every step, practice problem, card and checklist row", page.locator("details.ans").count() == n_ans, (page.locator("details.ans").count(), n_ans))
        check("plan: one hint button per written hint", page.locator("details.hint").count() == n_hints, (page.locator("details.hint").count(), n_hints))
        for d in CP.DAYS:
            for wid in d["walks"]:
                check("plan: %s walkthrough is on %s" % (wid, d["key"]), page.locator("#d-%s #w-%s" % (d["key"], wid)).count() == 1)
        page.evaluate("() => document.querySelectorAll('details').forEach(d => d.open = true)"); page.wait_for_timeout(500)
        imgs = page.evaluate("() => [...document.images].map(i => [i.getAttribute('src'), i.naturalWidth])")
        check("plan: all %d figures load" % len(imgs), len(imgs) == 7 and all(w > 0 for _, w in imgs), imgs)
        check("plan: the new drawings are present", page.locator("figure svg").count() >= 23, page.locator("figure svg").count())
        check("plan: Problem 7 shows the acid and the base tautomerization, drawn", page.locator("#w-p7 figure svg").count() == 8, page.locator("#w-p7 figure svg").count())
        n_spec = sum(len(v) for v in CP.SPECTRA.values())
        check("plan: all %d NMR spectra are drawn" % n_spec, page.locator(".spectra svg").count() == n_spec, page.locator(".spectra svg").count())
        check("plan: the spectra to choose from show with the question, before any answer is opened",
              page.evaluate("() => [...document.querySelectorAll('.spectra')].every(s => !s.closest('details'))"))
        check("plan: the synthesis scoring checklist has six items", page.locator("#w-part4 .checklist li").count() == 6)
        check("plan: the multiple-answer base question is with the reagent cards", "More than one may work" in page.inner_text("#w-cards"))
        check("plan: Monday's core includes product drawing in the lessons and the epoxide mechanism",
              "Draw alone" in page.inner_text("#d-mon ol.tasks") and "epoxide" in page.inner_text("#d-mon ol.tasks") and page.locator("#d-mon #w-epoxide").count() == 1)
        check("plan: Wednesday grades the test inside the 30-minute corrections block", "Grade it with its key first" in page.inner_text("#d-wed ol.tasks"))
        for d in CP.DAYS:
            shown = page.evaluate("k => [...document.querySelectorAll('#d-' + k + ' ol.tasks .mins')].map(e => parseInt(e.textContent.replace(/\\D/g, '')))", d["key"])
            check("plan: %s task minutes add up to the day's %d minutes" % (d["key"], d["minutes"]), sum(shown) == d["minutes"] and len(shown) == len(d["tasks"]), shown)
        check("plan: Wednesday is 98 minutes with the 53-minute test inside it", "98 minutes" in page.inner_text("#d-wed") and "53 minutes without stopping" in page.inner_text("#d-wed"))
        src = open(os.path.join(ROOT, "student-app/app.js"), encoding="utf-8").read()
        for d in CP.DAYS:
            m = re.search(r'\["%s","%s","chem","[^"]*","practice",(\d+),' % (d["cal"], d["date"]), src)
            check("plan: calendar entry %s says %d minutes, like the page" % (d["cal"], d["minutes"]), bool(m) and int(m.group(1)) == d["minutes"], m and m.group(1))
        for href in ("arrows.html", "alkenes.html", "alkynes.html"):
            check("plan: link to %s works" % href, page.locator('a[href="%s"]' % href).count() >= 1 and os.path.exists(os.path.join(ROOT, "student-app/lessons/chem-t4", href)))
        check("plan: records nothing (no learning record on the page)", page.evaluate("() => typeof window.LearningRecord") == "undefined")
        check("plan: no script errors", not errs, errs[:2])
        ctx.close()
    guarded("plan page", t_plan_page)
    browser.close()

server.shutdown()
w = max(len(r[1]) for r in results) if results else 10
for st, name, det in results:
    print("%s  %s%s" % (st, name, ("  [" + det[:160] + "]") if st == "FAIL" and det else ""))
print("\n%d checks, %d failed" % (len(results), len(failures)))
sys.exit(1 if failures else 0)
