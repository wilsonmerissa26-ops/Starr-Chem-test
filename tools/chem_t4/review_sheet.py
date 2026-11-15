"""Write an HTML answer-key sheet of every Test 4 lesson problem for outside verification (print it to PDF).
Usage: python3 tools/chem_t4/review_sheet.py OUT.html"""
import html, json, os, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
def load(k):
    src = open(os.path.join(ROOT, "student-app/lessons/chem-t4/items-%s.js" % k)).read()
    return json.loads(src.split('window.T4DATA["%s"] = ' % k, 1)[1].rstrip().rstrip(";"))
E = html.escape
out = ['<!doctype html><meta charset="utf-8"><title>Test 4 lessons: answer key for verification</title><style>',
       'body{font:12px/1.4 -apple-system,Helvetica,Arial,sans-serif;margin:18px;color:#222}h1{font-size:20px}h2{font-size:16px;margin-top:22px;border-bottom:2px solid #6c3fa0}',
       '.it{border:1px solid #bbb;border-radius:6px;padding:8px;margin:8px 0;page-break-inside:avoid}.row{display:flex;flex-wrap:wrap;gap:6px;align-items:flex-start}',
       '.o{border:1px solid #ddd;padding:3px;max-width:240px}.o.ok{border:2px solid #17714c}.o svg{max-width:230px;height:auto}.mech svg{max-width:330px;height:auto}',
       '.tag{font-size:10px;color:#555}.ok .tag{color:#17714c;font-weight:700}.small{font-size:11px;color:#444}</style>',
       '<h1>CHM 221 Test 4 practice lessons: every problem and its answer, for independent verification</h1>',
       '<p>Correct choices have a green border. Each wrong choice is labeled with the slip it represents; the app shows that label\'s explanation when she picks it. Molecules were screened against the Readiness Check (and its key) and Dr. Meadows\' Fall 2025 Test 4.</p>']
for key, title in (("structures", "Reading and drawing structures"), ("arrows", "Curved arrows"), ("alkenes", "Chapter 8: alkene reagents"), ("alkynes", "Chapter 9: alkyne reagents")):
    D = load(key)
    out.append("<h2>%s</h2>" % E(title))
    items = ([D["example"]] if D["example"].get("steps") else []) + D["guided"] + D["independent"] + D["targeted"]
    for it in items:
        role = it.get("role", "example")
        if it.get("kind") == "mechanism":
            out.append('<div class="it"><b>%s</b> (%s): %s<br><span class="small">%s</span>' % (E(it["id"]), role, E(it["title"]), E(it["reaction"])))
            for k, st in enumerate(it["steps"]):
                ch = " or ".join(("/".join(s) if s else "none") for s in st["charges"])
                out.append('<div class="row"><div class="o mech">Step %d: <b>%s</b><br>%s</div><div class="small" style="max-width:420px">%s<br><b>New charges after this step:</b> %s%s</div></div>'
                           % (k + 1, E(st["type"]), st["svgArrows"], E(st["caption"]), E(ch), (" (" + E(st["chargeNote"]) + ")") if st.get("chargeNote") else ""))
            out.append('<div class="row"><div class="o">Product<br>%s</div></div>' % it["productSvg"])
            if it.get("why"): out.append('<p class="small"><b>Explain:</b> %s <b>Key idea:</b> %s</p>' % (E(it["why"]["prompt"]), E(it["why"]["key"])))
            out.append("</div>"); continue
        if it.get("kind") == "parts":
            out.append('<div class="it"><b>%s</b> (%s): %s' % (E(it["id"]), role, E(it["title"])))
            if it.get("svg"): out.append('<div class="row"><div class="o">%s</div></div>' % it["svg"])
            out.append("<ol>")
            for p in it["parts"]:
                ans = p["answer"]
                out.append("<li>%s <b>Answer: %s</b>%s</li>" % (E(p["q"]), E(", ".join(ans) if isinstance(ans, list) else str(ans)), " (atom names as tagged in the drawing)" if p["type"] == "tap" else ""))
            out.append("</ol>")
            if it.get("draw"):
                out.append('<p class="small"><b>Drawing task:</b> %s</p><div class="row">' % E(it["draw"]["what"]))
                out += ['<div class="o ok">%s<div class="tag">checked solution: %s</div></div>' % (s, E(it["draw"].get("solutionCaption", ""))) for s in it["draw"]["solution"]]
                out += ['<div class="o">%s<div class="tag">mistake: %s</div></div>' % (m["svg"], E(m["title"])) for m in it["draw"]["mistakes"]]
                out.append("</div>")
            out.append('<p class="small"><b>Explain:</b> %s <b>Key idea:</b> %s</p></div>' % (E(it["why"]["prompt"]), E(it["why"]["key"])))
            continue
        q = it.get("question") or ("%s + %s" % (it.get("smName"), it.get("reagent")))
        out.append('<div class="it"><b>%s</b> (%s): %s<div class="row"><div class="o">%s</div>%s</div>' % (E(it["id"]), role, E(q), it["smSvg"], ('<div class="o">target<br>%s</div>' % it["targetSvg"]) if it.get("targetSvg") else ""))
        if it.get("jobs"):
            out.append("<p class=small><b>Job choices:</b> " + "; ".join(("<b>[correct] %s</b>" if j["correct"] else "%s") % E(j["text"]) for j in it["jobs"]) + "</p>")
        for lab in ("seqs", "choices"):
            if it.get(lab):
                out.append("<p class=small><b>Choices:</b> " + "; ".join(("<b>[correct] %s</b>" if c["tag"] == "correct" else "%s (" + E(c["tag"]) + ")") % E(c["text"]) for c in it[lab]) + "</p>")
        if it.get("products"):
            out.append('<div class="row">' + "".join('<div class="o%s">%s<div class="tag">%s</div></div>' % (" ok" if p["tag"] == "correct" else "", p["svg"], E(p["tag"])) for p in it["products"]) + "</div>")
        out.append('<p class="small"><b>Answer:</b> %s. %s</p></div>' % (E(it.get("productName", "")), E(it.get("explain", ""))))
open(sys.argv[1], "w").write("".join(out))
print("wrote", sys.argv[1])
