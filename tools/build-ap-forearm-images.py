"""Build the A&P forearm images from OpenStax Anatomy and Physiology 2e figures.

Source: OpenStax, Anatomy and Physiology 2e (github.com/openstax/osbooks-anatomy-physiology, media/),
figures 1105 and 1120. Licensed CC BY-NC-SA 4.0. Changes: cropped, resized, and text labels
covered with blank boxes. The derived images are shared under the same license (CC BY-NC-SA 4.0).

Usage:  python tools/build-ap-forearm-images.py <path-to-openstax-media-folder> [--debug]
Writes forearm-*.jpg and pins-forearm.json to student-app/lessons/ap-muscles/img/.
Labels are covered word by word (OCR word boxes plus hand-checked boxes OCR missed).
Each pin sits where an OpenStax label's leader line starts, so every answer location comes from OpenStax's own labels.
"""
import json, os, sys
from PIL import Image, ImageDraw
import pytesseract

SRC = sys.argv[1] if len(sys.argv) > 1 else "media"
DEBUG = "--debug" in sys.argv
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "student-app", "lessons", "ap-muscles", "img")
MAX_W = 1100
PAD = 5

ARM = "1120_Muscles_that_Move_the_Forearm.jpg"
BODY = "1105_Anterior_and_Posterior_Views_of_Muscles.jpg"

EXTRA_BOXES = {
    ARM: [(630, 1015, 880, 1062)],  # "Biceps brachii" (forearm, palmar view); OCR missed it
}

# Teaching and guided views use figure 1120, split into its palm-side (front) and back drawings so pins never overlap
# on an iPad-width screen (the two drawings side by side put pins 2 to 4 within 24 px of each other). New-picture views use figure 1105 (front and back drawings; the first
# answer on each drawing in any lesson is the only "new picture" answer, see lesson.js pictureStatus).
VIEWS = {
    "forearm-front": {"fig": ARM, "crop": (110, 930, 1250, 1840), "pins": {
        "pronator-teres": (756, 1283), "flexor-carpi-radialis": (355, 1367), "palmaris-longus": (408, 1480),
        "flexor-carpi-ulnaris": (460, 1553), "flexor-digitorum-superficialis": (616, 1675)}},
    "forearm-back": {"fig": ARM, "crop": (1180, 930, 2381, 1840), "blank": [(1000, 1600, 1300, 1840)], "pins": {
        "extensor-carpi-radialis-longus": (1768, 1125), "extensor-carpi-ulnaris": (2022, 1504), "extensor-digitorum": (2022, 1612)}},
    # Back (right) drawing only, so the pin's one leader line runs to the supinator; the left drawing's line is cropped off.
    "forearm-deep": {"fig": ARM, "crop": (1180, 1950, 2381, 2790), "pins": {"supinator": (1318, 2093)}},
    "forearm-body-front": {"fig": BODY, "crop": (480, 380, 1000, 720), "upscale": True, "pins": {
        "pronator-teres": (922, 505), "flexor-carpi-radialis": (922, 556)}},
    "forearm-body-back": {"fig": BODY, "crop": (480, 1850, 1000, 2110), "upscale": True, "pins": {
        "extensor-digitorum": (922, 2019), "extensor-carpi-ulnaris": (922, 2073)}},
}
# Labeled teaching crops are a little wider so each kept label is whole; any text line the crop edge cuts is covered,
# and "blank" covers the other drawing's fingertips. The deep figure stays whole (both drawings) when labeled.
LABELED = {"forearm-front-labeled": (ARM, (110, 930, 1350, 1840), []),
           "forearm-back-labeled": (ARM, (1080, 930, 2381, 1840), [(1000, 1600, 1300, 1840)]),
           "forearm-deep-labeled": (ARM, (0, 1950, 2381, 2790), [])}

def line_boxes(im):
    """OCR text lines (words grouped by Tesseract's block, paragraph and line), as (x0, y0, x1, y1)."""
    d = pytesseract.image_to_data(im, output_type=pytesseract.Output.DICT)
    lines = {}
    for i, w in enumerate(d["text"]):
        if not w.strip() or float(d["conf"][i]) < 40 or d["height"][i] >= 60: continue
        k = (d["block_num"][i], d["par_num"][i], d["line_num"][i])
        b = (d["left"][i], d["top"][i], d["left"][i] + d["width"][i], d["top"][i] + d["height"][i])
        o = lines.get(k, b); lines[k] = (min(o[0], b[0]), min(o[1], b[1]), max(o[2], b[2]), max(o[3], b[3]))
    return list(lines.values())

def word_boxes(im):
    d = pytesseract.image_to_data(im, output_type=pytesseract.Output.DICT)
    out = []
    for i, w in enumerate(d["text"]):
        t = w.strip()
        # Short tokens are usually OCR noise read off the drawing; keep real short words.
        if (len(t) >= 3 or t.lower() in ("of",)) and sum(c.isalpha() for c in t) >= 2 and float(d["conf"][i]) > 40 and d["height"][i] < 60:
            out.append((d["left"][i], d["top"][i], d["left"][i] + d["width"][i], d["top"][i] + d["height"][i]))
    return out

def fit(im, upscale=False):
    if im.width > MAX_W or (upscale and im.width < MAX_W):
        im = im.resize((MAX_W, round(im.height * MAX_W / im.width)), Image.LANCZOS)
    return im

def main():
    os.makedirs(OUT, exist_ok=True)
    masked = {}
    for fig in {v["fig"] for v in VIEWS.values()}:
        im = Image.open(os.path.join(SRC, fig)).convert("RGB")
        d = ImageDraw.Draw(im)
        for (x0, y0, x1, y1) in word_boxes(im) + EXTRA_BOXES.get(fig, []):
            d.rectangle((x0 - PAD, y0 - PAD, x1 + PAD, y1 + PAD), fill="white")
        masked[fig] = im
    pins = {}
    for view, v in VIEWS.items():
        cx0, cy0, cx1, cy1 = v["crop"]
        src = masked[v["fig"]]
        if v.get("blank"):
            src = src.copy(); db = ImageDraw.Draw(src)
            for b in v["blank"]: db.rectangle(b, fill="white")
        out = src.crop(v["crop"])
        if DEBUG:
            out = out.copy(); dd = ImageDraw.Draw(out)
            for m, (x, y) in v["pins"].items():
                dd.ellipse((x - cx0 - 12, y - cy0 - 12, x - cx0 + 12, y - cy0 + 12), outline="magenta", width=4)
                dd.text((x - cx0 + 14, y - cy0 - 6), m[:10], fill="magenta")
        fit(out, v.get("upscale")).save(os.path.join(OUT, view + "-unlabeled.jpg"), quality=84, optimize=True)
        pins[view] = {m: [round(100 * (x - cx0) / (cx1 - cx0), 2), round(100 * (y - cy0) / (cy1 - cy0), 2)] for m, (x, y) in v["pins"].items()}
    for name, (fig, box, blanks) in LABELED.items():
        im = Image.open(os.path.join(SRC, fig)).convert("RGB"); d = ImageDraw.Draw(im)
        for (x0, y0, x1, y1) in line_boxes(im):
            if (x0 < box[0] < x1 or x0 < box[2] < x1) and y1 > box[1] and y0 < box[3]:
                d.rectangle((x0 - PAD, y0 - PAD, x1 + PAD, y1 + PAD), fill="white")
        for b in blanks: d.rectangle(b, fill="white")
        fit(im.crop(box)).save(os.path.join(OUT, name + ".jpg"), quality=84, optimize=True)
    with open(os.path.join(OUT, "pins-forearm.json"), "w") as f:
        json.dump(pins, f, indent=1)
    with open(os.path.join(OUT, "ATTRIBUTION-forearm.txt"), "w") as f:
        f.write("Forearm images derived from OpenStax, Anatomy and Physiology 2e (https://openstax.org/details/books/anatomy-and-physiology-2e),\n"
                "figures 1105 and 1120 in github.com/openstax/osbooks-anatomy-physiology. Licensed CC BY-NC-SA 4.0\n"
                "(https://creativecommons.org/licenses/by-nc-sa/4.0/). Changes: cropped, resized, and labels covered.\n"
                "These derived images are shared under CC BY-NC-SA 4.0. Non-commercial use only.\n")
    print(json.dumps(pins))

if __name__ == "__main__":
    main()
