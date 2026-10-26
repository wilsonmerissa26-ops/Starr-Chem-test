"""Phase 1 regression tests: chemistry corrections, honest practice evidence, quiz reliability.

Runs a local copy of the site in headless Chromium. Every test uses a fresh browser profile with
SYNTHETIC records only. No real student data is read or changed.

Run:  pip install playwright && python -m playwright install chromium
      python test-phase1-chemistry.py [path-to-site-root]
The optional path lets the same tests run against an older copy to show which checks fail there.
"""
import functools, http.server, json, os, re, socketserver, sys, threading
from playwright.sync_api import sync_playwright

ROOT = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
server = socketserver.TCPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=ROOT))
threading.Thread(target=server.serve_forever, daemon=True).start()
BASE = "http://127.0.0.1:%d" % server.server_address[1]
COACH, APP = BASE + "/unit3-coach/", BASE + "/student-app/"
KEYS_M1 = [2, 1, 0, 1]  # keyed answers of module 1's original four questions (verified in the audit)

results, failures, SECTION = [], [], ["Setup"]
def section(n): SECTION[0] = n
def check(name, ok, detail=""):
    results.append(("PASS" if ok else "FAIL", name, str(detail), SECTION[0]))
    if not ok: failures.append(name)
def guarded(name, fn):
    try: fn()
    except Exception as e: check(name, False, "crashed: " + str(e).splitlines()[0][:150])

# ---------- Independent encoding of Dr. Meadows' CHM 221 decision tree (major products, from the F24 handout) ----------
def meadows_tree(carbon, reagent, solvent, heat):
    strong_base = reagent in ("smallbase", "bulkybase")
    if carbon == "methyl": return "SN2"
    if carbon == "primary": return "E2" if reagent == "bulkybase" else "SN2"
    if carbon == "secondary":
        if strong_base:
            if reagent == "bulkybase": return "E2 (less substituted alkene)"
            return "E2 (more substituted alkene)" if solvent == "protic" else "SN2"
        if reagent == "goodnuc": return "SN2"
        return "SN1/E1" if solvent == "protic" else "Not covered by the course chart"
    if strong_base: return "E2"
    return "E1" if heat else "SN1/E1"

def lowest_point_rule(E):  # E = [start, TS1, I1, TS2, ...]; returns 1-based rate-determining step
    best, step, low = None, None, E[0]
    for k in range(1, len(E), 2):
        gap = E[k] - low
        if best is None or gap > best: best, step = gap, (k + 1) // 2
        if k + 1 < len(E): low = min(low, E[k + 1])
    return step
def highest_peak_rule(E):
    peaks = E[1::2]; return peaks.index(max(peaks)) + 1

with sync_playwright() as p:
    browser = p.chromium.launch()
    def fresh(url=COACH):
        ctx = browser.new_context(); page = ctx.new_page(); errs = []
        page.on("pageerror", lambda e: errs.append(str(e))); page.goto(url); return ctx, page, errs
    def open_quiz(page, module):
        page.click("button[data-screen='unit3']"); page.evaluate("m => u3SetModule(m)", module); page.evaluate("u3ShowMode('quiz')")
    def answer_round(page, picks):
        for k in picks:
            page.locator("#u3Choices button").nth(k).click(); page.locator("#u3Feedback button").click()
    def coach_text(page): return page.evaluate("JSON.stringify(U3)")

    # =============== 1. Chemistry corrections ===============
    section("Chemistry corrections")
    ctx, page, errs = fresh(); u3 = coach_text(page)
    check("RDS: the incorrect 'largest rise from its preceding valley' rule is gone", "largest energy rise from its preceding valley" not in u3)
    check("RDS: highest-peak explanation is labeled a course shortcut, not a universal law", "not a universal law" in u3 and "highest peak" in u3)
    check("Proton transfer: SN1 lesson teaches the O–H deprotonation after a neutral nucleophile attacks", "Neutral nucleophiles finish with a proton transfer" in u3)
    check("Proton transfer: SN2 lesson teaches deprotonation after a neutral nucleophile attacks", "Neutral nucleophiles need a final proton transfer" in u3)
    check("Counting: lesson teaches steps, transition states and intermediates from the mechanism", "Count steps from the mechanism" in u3)
    check("E1 lesson says the hydrogen removed is on a carbon next to the carbocation", "removes a hydrogen from a carbon next to the carbocation carbon" in u3)
    check("Secondary + alkoxide is labeled as the course chart, with the standard-textbook difference", "simplified CHM 221 decision tree" in u3 and "standard textbook" in u3)
    page.evaluate("u3ShowMode('shortcuts')"); sheet = page.inner_text("#u3Work")
    sn2_row = [l for l in sheet.splitlines() if l.startswith("SN2")]
    check("Cheat sheet: SN2 row includes secondary substrates", bool(sn2_row) and "2°" in sn2_row[0], sn2_row[:1])
    check("Cheat sheet: course-chart footnote explains the textbook difference", "Course chart vs. general chemistry" in sheet)
    ctx.close()

    # Every question: valid key, unique id, and the new items keyed as independently verified.
    section("Question bank integrity")
    ctx, page, errs = fresh()
    bank = page.evaluate("U3.map((m,i)=>m.questions.map((q,j)=>({m:i,j:j,id:q.id||null,c:q.c,n:q.a.length,q:q.q})))")
    flat = [q for m in bank for q in m]
    check("Every question's key points to an existing option", all(0 <= q["c"] < q["n"] for q in flat))
    ids = [q["id"] for q in flat]
    check("Every question has a unique stable ID", None not in ids and len(set(ids)) == len(ids))
    check("Original question positions are unchanged (first four in each module)", all(len(m) >= 4 for m in bank)
          and [q["c"] for q in bank[0][:4]] == KEYS_M1)
    NEW = {  # id: (keyed index, phrase in stem). Each verified in the Phase 1 report.
        "u3-m2-q5": (0, "rises to a first peak at 85"), "u3-m2-q6": (2, "reacts with water by SN1"),
        "u3-m4-q5": (1, "Ammonia"), "u3-m6-q5": (2, "final step that gives the neutral ether"),
        "u3-m6-q6": (1, "which hydrogen is removed"), "u3-m6-q7": (1, "How many intermediates form in the E1")}
    by_id = {q["id"]: q for q in flat}
    check("All six new verified practice items are present with their verified keys",
          all(i in by_id and by_id[i]["c"] == k and phrase in by_id[i]["q"] for i, (k, phrase) in NEW.items()),
          [i for i, (k, ph) in NEW.items() if not (i in by_id and by_id[i]["c"] == k and ph in by_id[i]["q"])])
    check("Unit 3 question count is 38 (32 existing + 6 new)", len(flat) == 38, len(flat))
    legacy = page.evaluate("DAYS.map(d => [d.answer, d.choices.length])")
    check("Original nine-day coach still has its 9 questions with valid keys (47 in total)", len(legacy) == 9 and all(0 <= a < n for a, n in legacy), legacy)
    ctx.close()

    # Diagram tests behind the RDS wording (pure calculation; these document the evidence and pass on any version).
    section("RDS diagram evidence")
    course_diagrams = {  # approximate relative heights read from the course materials' diagrams
        "Problem Set 1A (one step)": [0, 80, -20], "Problem Set 1B (two steps)": [0, 90, 45, 70, -30],
        "Problem Set 1C (three steps)": [0, 35, 20, 95, 55, 75, 10], "2023 exam A": [0, 85, -25],
        "2023 exam C (three steps)": [0, 45, 30, 60, 40, 55, -35], "2023 exam D (endothermic)": [0, 60, 20],
        "New practice item": [0, 85, 40, 70, -20]}
    agree = {k: highest_peak_rule(E) == lowest_point_rule(E) for k, E in course_diagrams.items()}
    check("Highest-peak shortcut matches the rigorous rule on every course-style diagram", all(agree.values()), agree)
    check("New practice item: both rules give step 1", highest_peak_rule(course_diagrams["New practice item"]) == 1 == lowest_point_rule(course_diagrams["New practice item"]))
    deep_well = [0, 80, -40, 60, -80]
    check("Deep-well diagram: shortcut and rigorous rule differ (why the lesson keeps its exception note)",
          highest_peak_rule(deep_well) == 1 and lowest_point_rule(deep_well) == 2)

    # =============== 2. Decision lab follows Dr. Meadows' tree in every combination ===============
    section("Decision lab")
    ctx, page, errs = fresh(); page.evaluate("u3ShowMode('lab')")
    mismatches, garbled, notes = [], [], {}
    for carbon in ("methyl", "primary", "secondary", "tertiary"):
        for reagent in ("goodnuc", "smallbase", "bulkybase", "weakneutral"):
            for solvent in ("aprotic", "protic"):
                for heat in (False, True):
                    page.select_option("#labCarbon", carbon); page.select_option("#labReagent", reagent)
                    page.select_option("#labSolvent", solvent); page.select_option("#labLG", "good")
                    page.set_checked("#labHeat", heat); page.set_checked("#labBeta", True)
                    page.click("text=Predict and explain")
                    got = page.inner_text("#labAnswer h3").strip(); body = page.inner_text("#labAnswer")
                    if got != meadows_tree(carbon, reagent, solvent, heat): mismatches.append((carbon, reagent, solvent, heat, got))
                    notes[(carbon, reagent, solvent, heat)] = body
    check("All 64 combinations match Dr. Meadows' decision tree", not mismatches, mismatches[:4])
    check("2° + strong non-bulky base + aprotic shows the chart's SN2 and the textbook E2 note",
          "standard textbook" in notes.get(("secondary", "smallbase", "aprotic", False), ""))
    for carbon, reagent in [("tertiary", "smallbase"), ("secondary", "smallbase"), ("primary", "bulkybase")]:
        page.select_option("#labCarbon", carbon); page.select_option("#labReagent", reagent); page.select_option("#labSolvent", "protic")
        page.set_checked("#labBeta", False); page.click("text=Predict and explain")
        t = page.inner_text("#labAnswer")
        if "blocked blocked" in t or "E2 blocked" in t: garbled.append(t[:80])
        if not re.search(r"no β-hydrogen|cannot occur|impossible", t, re.I): garbled.append("no explanation: " + t[:60])
    check("No-β-hydrogen cases give a clear, ungarbled explanation", not garbled, garbled)
    page.set_checked("#labBeta", True); page.select_option("#labLG", "bad"); page.click("text=Predict and explain")
    check("Poor leaving group: told to convert OH to a better leaving group first", "better leaving group" in page.inner_text("#labAnswer"))
    ctx.close()

    # =============== 3. Honest practice evidence ===============
    section("Honest practice evidence")
    def legacy_wrong_knew():
        ctx, page, errs = fresh(); page.evaluate("setDay(1)"); page.click("button[data-screen='practice']")
        page.locator("#practiceBox .choice").nth(0).click(); page.click("text=I knew it")
        saved = page.evaluate("JSON.parse(localStorage.getItem('coach-state')).mastery")
        side = [l for l in page.inner_text("#skills").splitlines() if "Lewis" in l or "GREEN" in l or "RED" in l or "YELLOW" in l]
        check("Original coach: wrong answer + 'I knew it' never turns a skill green", saved.get("Lewis Structures") != "green", saved)
        check("Original coach: wrong answer is marked red", saved.get("Lewis Structures") == "red", saved)
        ctx.close()
    guarded("Original coach: wrong answer + 'I knew it'", legacy_wrong_knew)
    def legacy_right_knew():
        ctx, page, errs = fresh(); page.evaluate("setDay(1)"); page.click("button[data-screen='practice']")
        page.locator("#practiceBox .choice").nth(1).click(); page.click("text=I knew it")
        saved = page.evaluate("JSON.parse(localStorage.getItem('coach-state')).mastery")
        check("Original coach: one correct answer + 'I knew it' reaches yellow at most", saved.get("Lewis Structures") == "yellow", saved)
        ctx.close()
    guarded("Original coach: correct answer + 'I knew it'", legacy_right_knew)
    def legacy_green_saved():
        ctx, page, errs = fresh()
        page.evaluate("""localStorage.setItem('coach-state', JSON.stringify({day:0,xp:100,done:[1],streak:1,teachStep:0,mastery:{'Lewis Structures':'green'}}))""")
        page.reload()
        shown = page.evaluate("[...document.querySelectorAll('#skills .skill')].filter(d => d.textContent.includes('Lewis Structures')).map(d => d.lastElementChild.textContent)[0]")
        check("Original coach: a GREEN saved by the old confidence rule is shown as YELLOW", shown == "YELLOW", shown)
        check("Original coach: the saved record itself is not altered", json.loads(page.evaluate("localStorage.getItem('coach-state')"))["mastery"]["Lewis Structures"] == "green")
        ctx.close()
    guarded("Original coach: saved GREEN", legacy_green_saved)

    def unit3_memorized():
        ctx, page, errs = fresh(); open_quiz(page, 0)
        answer_round(page, [(k + 1) % 4 for k in KEYS_M1]); page.evaluate("u3Retry()"); answer_round(page, KEYS_M1)
        ev = page.evaluate("u3Evidence(0)") if page.evaluate("typeof u3Evidence") == "function" else None
        page.evaluate("u3Render()")  # make sure the summary reflects the saved record, not a stale screen
        title = page.inner_text("#u3SummaryTitle")
        check("Unit 3: fail first try, then retake with the keys: NOT strong evidence", ev is not None and ev["status"] != "strong", (ev, title))
        check("Unit 3: summary shows 0 modules with strong evidence after a memorized retake", title.startswith("0 /"), title)
        ctx.close()
    guarded("Unit 3: memorized retake", unit3_memorized)
    def unit3_first_try():
        ctx, page, errs = fresh(); open_quiz(page, 0); answer_round(page, KEYS_M1)
        ev = page.evaluate("u3Evidence(0)")
        check("Unit 3: four correct first-try answers give strong first-try evidence", ev["status"] == "strong" and ev["firstTry"] == 4, ev)
        before = page.evaluate("JSON.stringify(u3s.firstTry)")
        page.evaluate("u3Retry()"); answer_round(page, [(k + 1) % 4 for k in KEYS_M1])
        check("Unit 3: a later retake never rewrites first-try evidence", page.evaluate("JSON.stringify(u3s.firstTry)") == before)
        check("Unit 3: wording says evidence, not mastery", "not yet mastery" in page.inner_text("#u3Progress"))
        ctx.close()
    guarded("Unit 3: first-try evidence", unit3_first_try)
    def unit3_legacy_record():
        ctx, page, errs = fresh()
        old = {"module": 0, "mode": "teach", "attempts": {"0": {"n": 8, "c": 4}, "1": {"n": 4, "c": 4}}, "wrong": {"0-1": 2},
               "latestByModule": {"0": {"module": 0, "correct": 4, "total": 4}, "1": {"module": 1, "correct": 4, "total": 4}}, "SYNTHETIC": True}
        page.evaluate("v => localStorage.setItem('astarryia-unit3-v1', v)", json.dumps(old)); page.reload()
        page.click("button[data-screen='unit3']")
        ev0 = page.evaluate("u3Evidence(0)") if page.evaluate("typeof u3Evidence") == "function" else None
        title = page.inner_text("#u3SummaryTitle")
        check("Old-format record: earlier 4/4 rounds are practice only, never strong evidence", ev0 is not None and ev0["status"] != "strong" and title.startswith("0 /"), (ev0, title))
        open_quiz(page, 0); answer_round(page, KEYS_M1)
        saved = json.loads(page.evaluate("localStorage.getItem('astarryia-unit3-v1')"))
        check("Old-format record: history is preserved and extended, not reset", saved["attempts"]["0"] == {"n": 12, "c": 8} and saved["wrong"] == {"0-1": 2}
              and saved.get("SYNTHETIC") is True and saved["latestByModule"]["1"] == old["latestByModule"]["1"], saved.get("attempts"))
        check("Old-format record: re-answering previously seen questions adds no first-try evidence", page.evaluate("u3Evidence(0).firstTry") == 0)
        ctx.close()
    guarded("Unit 3: old-format record", unit3_legacy_record)
    def dashboard():
        ctx, page, errs = fresh(APP + "#chemistry"); page.wait_for_timeout(500)
        fr = page.frame_locator("#coach-frame"); fr.locator("#u3-tab-quiz").click()
        for k in [(k + 1) % 4 for k in KEYS_M1]:
            fr.locator("#u3Choices button").nth(k).click(); fr.locator("#u3Feedback button").click()
        fr.locator("text=Practice this lesson again").click()
        for k in KEYS_M1:
            fr.locator("#u3Choices button").nth(k).click(); fr.locator("#u3Feedback button").click()
        page.wait_for_timeout(300)
        t = page.inner_text("#chem-progress-title")
        check("Learning App: memorized retake in the embedded coach shows 0 strong modules", t.startswith("0 / 8 modules with strong first-try evidence"), t)
        ctx.close()
    guarded("Learning App: embedded retake", dashboard)

    # =============== 4. Quiz reliability ===============
    section("Quiz reliability")
    def refresh(embedded):
        ctx, page, errs = fresh(APP + "#chemistry" if embedded else COACH)
        if embedded:
            page.wait_for_timeout(500); fr = page.frame_locator("#coach-frame"); fr.locator("#u3-tab-quiz").click()
            fr.locator("#u3Choices button").nth(KEYS_M1[0]).click(); page.reload(); page.wait_for_timeout(800)
            fr = page.frame_locator("#coach-frame"); fb = fr.locator("#u3Feedback").inner_text(timeout=5000)
            ok_next = fr.locator("#u3Feedback button").count() == 1
            if ok_next: fr.locator("#u3Feedback button").click()
            q = fr.locator(".unit3-quiztop .unit3-tag").inner_text()
        else:
            open_quiz(page, 0); page.locator("#u3Choices button").nth(KEYS_M1[0]).click(); page.reload(); page.click("button[data-screen='unit3']")
            fb = page.inner_text("#u3Feedback"); ok_next = page.locator("#u3Feedback button").count() == 1
            if ok_next: page.locator("#u3Feedback button").click()
            q = page.inner_text(".unit3-quiztop .unit3-tag")
        label = "embedded in the Learning App" if embedded else "full-page coach"
        check("Refresh after answering (%s): feedback and Next button come back" % label, "Correct" in fb and ok_next, fb[:60])
        check("Refresh after answering (%s): Next moves to question 2" % label, "question 2" in q.lower(), q)
        ctx.close()
    guarded("Refresh: full-page coach", lambda: refresh(False))
    guarded("Refresh: embedded", lambda: refresh(True))
    for label, raw, kept in [("module index out of range", json.dumps({"module": 99, "attempts": {"0": {"n": 2, "c": 1}}}), True),
                             ("record without attempts", json.dumps({"module": 0, "mode": "quiz"}), False),
                             ("unreadable text", "{not json", True)]:
        def damaged(label=label, raw=raw, kept=kept):
            ctx, page, errs = fresh(); page.evaluate("v => localStorage.setItem('astarryia-unit3-v1', v)", raw); page.reload()
            page.click("button[data-screen='unit3']"); title = page.inner_text("#u3LessonTitle")
            backups = page.evaluate("Object.keys(localStorage).filter(k => k.startsWith('astarryia-unit3-v1-damaged-')).map(k => localStorage.getItem(k))")
            check("Damaged Unit 3 record (%s): coach still works" % label, not errs and title.strip() != "", errs[:1])
            if kept: check("Damaged Unit 3 record (%s): original text kept in a separate copy" % label, raw in backups, backups)
            ctx.close()
        guarded("Damaged Unit 3 record (%s)" % label, damaged)
    def damaged_legacy():
        ctx, page, errs = fresh(); page.evaluate("localStorage.setItem('coach-state', '{broken')"); page.reload()
        title = page.inner_text("#lessonTitle")
        backups = page.evaluate("Object.keys(localStorage).filter(k => k.startsWith('coach-state-damaged-')).map(k => localStorage.getItem(k))")
        check("Damaged original-coach record: page still works", not errs and title.strip() != "", errs[:1])
        check("Damaged original-coach record: original text kept in a separate copy", "{broken" in backups, backups)
        ctx.close()
    guarded("Damaged original-coach record", damaged_legacy)
    def no_errors_normal():
        ctx, page, errs = fresh(); page.click("button[data-screen='unit3']")
        for m in range(8):
            page.evaluate("m => u3SetModule(m)", m)
            for mode in ("teach", "quiz", "lab", "shortcuts"): page.evaluate("m => u3ShowMode(m)", mode)
        check("Every module and mode opens without errors", not errs, errs[:2])
        ctx.close()
    guarded("Every module and mode opens", no_errors_normal)

    browser.close()
server.shutdown()
for r in results: print("%s  [%s] %s%s" % (r[0], r[3], r[1], ("  {" + r[2][:170] + "}") if r[0] == "FAIL" else ""))
print("\nChecks by area:")
order = []
for r in results:
    if r[3] not in order: order.append(r[3])
for n in order:
    print("  %2d passed of %2d  %s" % (sum(1 for r in results if r[3] == n and r[0] == "PASS"), sum(1 for r in results if r[3] == n), n))
print("\n%d checks, %d failed" % (len(results), len(failures)))
sys.exit(1 if failures else 0)
