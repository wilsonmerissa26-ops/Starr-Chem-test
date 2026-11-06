"""Build the A&P trunk-set images from OpenStax Anatomy and Physiology 2e figures.

Source: OpenStax, Anatomy and Physiology 2e (github.com/openstax/osbooks-anatomy-physiology, media/),
licensed CC BY-NC-SA 4.0. Changes: cropped, resized, and text labels covered with blank boxes.
The derived images are shared under the same license (CC BY-NC-SA 4.0).

Usage:  python tools/build-ap-trunk-images.py <path-to-openstax-media-folder> [--debug]
Writes trunk-*.jpg and pins-trunk.json to student-app/lessons/ap-muscles/img/.
Labels are covered word by word, using OCR word boxes plus a few hand-checked boxes OCR missed.
Each pin sits where an OpenStax label's leader line starts, so every answer location comes from
OpenStax's own labels.
"""
import json, os, sys
from PIL import Image, ImageDraw
import pytesseract

SRC = sys.argv[1] if len(sys.argv) > 1 else "media"
DEBUG = "--debug" in sys.argv
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "student-app", "lessons", "ap-muscles", "img")
MAX_W = 1100
PAD = 5

ABD = "1112_Muscles_of_the_Abdomen.jpg"
DIA = "1113_The_Diaphragm.jpg"
THX = "1114_Thorax.jpg"
BODY = "1105_Anterior_and_Posterior_Views_of_Muscles.jpg"

# Label text OCR missed or split, located by eye on the original figures (x0, y0, x1, y1).
EXTRA_BOXES = {
    DIA: [(12, 548, 205, 598)],                       # "Diaphragm"
    THX: [(2005, 1020, 2160, 1060),                   # "External" (above "intercostal", inset)
          (185, 362, 300, 420)],                      # "major" in "Pectoralis major (dissected)"
}

# view: figure, crop box, and pins at leader-line starts (original-figure pixels)
VIEWS = {
    "trunk-abdomen": {"fig": ABD, "crop": (0, 0, 1046, 568), "pins": {
        "rectus-abdominis": (160, 355), "external-oblique": (146, 230),
        "transversus-abdominis": (885, 166), "internal-oblique": (976, 550)}},
    "trunk-posterior-abdominal": {"fig": ABD, "crop": (0, 600, 1046, 1315), "pins": {"quadratus-lumborum": (186, 765)}},
    "trunk-diaphragm": {"fig": DIA, "crop": (0, 0, 1863, 1295), "pins": {"diaphragm": (212, 573), "quadratus-lumborum": (1522, 916)}},
    "trunk-thorax": {"fig": THX, "crop": (0, 0, 1380, 1273), "pins": {"external-intercostals": (173, 878), "internal-intercostals": (170, 539)}},
    "trunk-intercostal-detail": {"fig": THX, "crop": (1380, 150, 2275, 1273), "pins": {"internal-intercostals": (1717, 1118), "external-intercostals": (2088, 1015)}},
    "trunk-body-front": {"fig": BODY, "crop": (0, 160, 1265, 620), "pins": {"rectus-abdominis": (272, 314), "external-oblique": (162, 402)}},
}
LABELED = {"trunk-abdomen-labeled": (ABD, (0, 0, 1046, 568)), "trunk-thorax-labeled": (THX, (0, 0, 1380, 1273)),
           # Shown only in feedback after she answers: the learn step must never show the close-up she is tested on.
           "trunk-intercostal-detail-labeled": (THX, (1380, 150, 2275, 1273)),
           "trunk-diaphragm-labeled": (DIA, (0, 0, 1863, 1295)), "trunk-posterior-abdominal-labeled": (ABD, (0, 600, 1046, 1315))}

def word_boxes(im):
    d = pytesseract.image_to_data(im, output_type=pytesseract.Output.DICT)
    out = []
    for i, w in enumerate(d["text"]):
        t = w.strip()
        # Short tokens are usually OCR noise read off the drawing (e.g. "SS" on the sternum); keep real short words.
        if (len(t) >= 3 or t.lower() in ("of",)) and sum(c.isalpha() for c in t) >= 2 and float(d["conf"][i]) > 40 and d["height"][i] < 60:
            out.append((d["left"][i], d["top"][i], d["left"][i] + d["width"][i], d["top"][i] + d["height"][i]))
    return out

def fit(im):
    if im.width > MAX_W:
        im = im.resize((MAX_W, round(im.height * MAX_W / im.width)), Image.LANCZOS)
    return im

def main():
    os.makedirs(OUT, exist_ok=True)
    masked = {}
    for fig in {v["fig"] for v in VIEWS.values()}:
        im = Image.open(os.path.join(SRC, fig)).convert("RGB")
        boxes = word_boxes(im) + EXTRA_BOXES.get(fig, [])
        d = ImageDraw.Draw(im)
        for (x0, y0, x1, y1) in boxes:
            d.rectangle((x0 - PAD, y0 - PAD, x1 + PAD, y1 + PAD), fill="white")
        masked[fig] = im
    pins = {}
    for view, v in VIEWS.items():
        cx0, cy0, cx1, cy1 = v["crop"]
        out = masked[v["fig"]].crop(v["crop"])
        if DEBUG:
            out = out.copy(); dd = ImageDraw.Draw(out)
            for m, (x, y) in v["pins"].items():
                dd.ellipse((x - cx0 - 14, y - cy0 - 14, x - cx0 + 14, y - cy0 + 14), outline="magenta", width=4)
        fit(out).save(os.path.join(OUT, view + "-unlabeled.jpg"), quality=84, optimize=True)
        pins[view] = {m: [round(100 * (x - cx0) / (cx1 - cx0), 2), round(100 * (y - cy0) / (cy1 - cy0), 2)] for m, (x, y) in v["pins"].items()}
    for name, (fig, box) in LABELED.items():
        fit(Image.open(os.path.join(SRC, fig)).convert("RGB").crop(box)).save(os.path.join(OUT, name + ".jpg"), quality=84, optimize=True)
    with open(os.path.join(OUT, "pins-trunk.json"), "w") as f:
        json.dump(pins, f, indent=1)
    with open(os.path.join(OUT, "ATTRIBUTION-trunk.txt"), "w") as f:
        f.write("Trunk images derived from OpenStax, Anatomy and Physiology 2e (https://openstax.org/details/books/anatomy-and-physiology-2e),\n"
                "figures 1105, 1112, 1113 and 1114 in github.com/openstax/osbooks-anatomy-physiology. Licensed CC BY-NC-SA 4.0\n"
                "(https://creativecommons.org/licenses/by-nc-sa/4.0/). Changes: cropped, resized, and labels covered.\n"
                "These derived images are shared under CC BY-NC-SA 4.0. Non-commercial use only.\n")
    print(json.dumps(pins))

if __name__ == "__main__":
    main()
