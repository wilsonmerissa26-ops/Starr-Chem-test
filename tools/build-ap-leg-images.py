"""Build the A&P lower leg images from OpenStax Anatomy and Physiology 2e figures.

Source: OpenStax, Anatomy and Physiology 2e (github.com/openstax/osbooks-anatomy-physiology, media/),
figures 1105 and 1123. Licensed CC BY-NC-SA 4.0. Changes: cropped, resized, and text labels
covered with blank boxes. The derived images are shared under the same license (CC BY-NC-SA 4.0).

Usage:  python tools/build-ap-leg-images.py <path-to-openstax-media-folder> [--debug]
Writes leg-*.jpg and pins-leg.json to student-app/lessons/ap-muscles/img/.
Labels are covered word by word (OCR word boxes). Each pin sits where an OpenStax label's leader line meets the muscle,
so every answer location comes from OpenStax's own labels.
"""
import json, os, sys
from PIL import Image, ImageDraw
import pytesseract

SRC = sys.argv[1] if len(sys.argv) > 1 else "media"
DEBUG = "--debug" in sys.argv
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "student-app", "lessons", "ap-muscles", "img")
MAX_W = 1100
PAD = 5

LEG = "1123_Muscles_of_the_Leg_that_Move_the_Foot_and_Toes.jpg"
BODY = "1105_Anterior_and_Posterior_Views_of_Muscles.jpg"

# Fig. 1123 has three drawings of the right lower leg: superficial front (left), superficial back (middle) and deep back
# (right). Each is one teaching crop. New-picture views use fig. 1105 (front and back drawings, shared with the other
# lessons: only the first answer on each drawing, in any lesson, is a new picture; see lesson.js pictureStatus).
VIEWS = {
    "leg-front": {"fig": LEG, "crop": (300, 200, 750, 830), "upscale": True, "pins": {
        "tibialis-anterior": (542, 337), "fibularis-longus": (458, 427), "extensor-digitorum-longus": (485, 465),
        "fibularis-brevis": (487, 630), "extensor-hallucis-longus": (563, 725)}},
    "leg-calf": {"fig": LEG, "crop": (1130, 180, 1630, 780), "upscale": True, "pins": {
        "gastrocnemius": (1350, 315), "soleus": (1400, 673)}},
    "leg-deep": {"fig": LEG, "crop": (1830, 240, 2279, 920), "upscale": True, "pins": {
        "tibialis-posterior": (2115, 583), "flexor-digitorum-longus": (2050, 675), "flexor-hallucis-longus": (2102, 806)}},
    "leg-body-front": {"fig": BODY, "crop": (400, 900, 720, 1120), "upscale": True, "pins": {
        "fibularis-longus": (493, 978), "tibialis-anterior": (528, 1016)}},
    "leg-body-back": {"fig": BODY, "crop": (420, 2300, 760, 2520), "upscale": True, "pins": {
        "fibularis-longus": (515, 2405), "tibialis-posterior": (542, 2432), "gastrocnemius": (640, 2348), "soleus": (655, 2445)}},
}
# Labeled teaching images: one per fig. 1123 drawing, with OpenStax's labels.
LABELED = {"leg-front-labeled": (LEG, (0, 100, 760, 1358), []),
           "leg-calf-labeled": (LEG, (840, 100, 1615, 1358), []),
           "leg-deep-labeled": (LEG, (1615, 100, 2279, 1358), [])}

def word_boxes(im):
    d = pytesseract.image_to_data(im, output_type=pytesseract.Output.DICT)
    out = []
    for i, w in enumerate(d["text"]):
        t = w.strip()
        if (len(t) >= 3 or t.lower() in ("of", "or")) and sum(c.isalpha() for c in t) >= 2 and float(d["conf"][i]) > 40 and d["height"][i] < 60:
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
        for (x0, y0, x1, y1) in word_boxes(im):
            d.rectangle((x0 - PAD, y0 - PAD, x1 + PAD, y1 + PAD), fill="white")
        masked[fig] = im
    pins = {}
    for view, v in VIEWS.items():
        cx0, cy0, cx1, cy1 = v["crop"]
        out = masked[v["fig"]].crop(v["crop"])
        if DEBUG:
            out = out.copy(); dd = ImageDraw.Draw(out)
            for m, (x, y) in v["pins"].items():
                dd.ellipse((x - cx0 - 6, y - cy0 - 6, x - cx0 + 6, y - cy0 + 6), outline="magenta", width=2)
                dd.text((x - cx0 + 8, y - cy0 - 6), m[:12], fill="magenta")
        fit(out, v.get("upscale")).save(os.path.join(OUT, view + ("-debug" if DEBUG else "") + "-unlabeled.jpg"), quality=84, optimize=True)
        pins[view] = {m: [round(100 * (x - cx0) / (cx1 - cx0), 2), round(100 * (y - cy0) / (cy1 - cy0), 2)] for m, (x, y) in v["pins"].items()}
    if DEBUG: print(json.dumps(pins)); return
    for name, (fig, box, blanks) in LABELED.items():
        im = Image.open(os.path.join(SRC, fig)).convert("RGB"); d = ImageDraw.Draw(im)
        # Cover only words the crop edge cuts. (OCR joins a row of labels across both drawings into one line box, so
        # covering line boxes, as the forearm build does, would blank stripes of this drawing.)
        for (x0, y0, x1, y1) in word_boxes(im):
            if (x0 < box[0] < x1 or x0 < box[2] < x1) and y1 > box[1] and y0 < box[3]:
                d.rectangle((x0 - PAD, y0 - PAD, x1 + PAD, y1 + PAD), fill="white")
        for b in blanks: d.rectangle(b, fill="white")
        fit(im.crop(box)).save(os.path.join(OUT, name + ".jpg"), quality=84, optimize=True)
    with open(os.path.join(OUT, "pins-leg.json"), "w") as f:
        json.dump(pins, f, indent=1)
    with open(os.path.join(OUT, "ATTRIBUTION-leg.txt"), "w") as f:
        f.write("Lower leg images derived from OpenStax, Anatomy and Physiology 2e (https://openstax.org/details/books/anatomy-and-physiology-2e),\n"
                "figures 1105 and 1123 in github.com/openstax/osbooks-anatomy-physiology. Licensed CC BY-NC-SA 4.0\n"
                "(https://creativecommons.org/licenses/by-nc-sa/4.0/). Changes: cropped, resized, and labels covered.\n"
                "These derived images are shared under CC BY-NC-SA 4.0. Non-commercial use only.\n")
    print(json.dumps(pins))

if __name__ == "__main__":
    main()
