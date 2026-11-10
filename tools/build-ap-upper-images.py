"""Build the A&P upper limb (shoulder and arm) images from OpenStax Anatomy and Physiology 2e figures.

Source: OpenStax, Anatomy and Physiology 2e (github.com/openstax/osbooks-anatomy-physiology, media/),
figures 1105, 1118, 1119 and 1120. Licensed CC BY-NC-SA 4.0. Changes: cropped, resized, and text labels
covered with blank boxes. The derived images are shared under the same license (CC BY-NC-SA 4.0).

Usage:  python tools/build-ap-upper-images.py <path-to-openstax-media-folder> [--debug]
Writes upper-*.jpg and pins-upper.json to student-app/lessons/ap-muscles/img/.
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

GIR = "1118_Muscles_that_Position_the_Pectoral_Girdle.jpg"
HUM = "1119_Muscles_that_Move_the_Humerus.jpg"
ARM = "1120_Muscles_that_Move_the_Forearm.jpg"
BODY = "1105_Anterior_and_Posterior_Views_of_Muscles.jpg"

EXTRA_BOXES = {
    ARM: [(268, 755, 450, 803),    # "Brachialis" (upper arm, anterior lateral view); OCR missed it
          (630, 1015, 880, 1062)],  # "Biceps brachii" (forearm, palmar view); OCR missed it
    GIR: [(880, 118, 1075, 168)],  # "of scapula" (under "Coracoid process")
}

# Teaching and guided views use figures 1118 to 1120. The new-picture views (front, back) use figure 1105,
# which is never shown labeled anywhere in the app.
VIEWS = {
    "upper-girdle": {"fig": GIR, "crop": (0, 0, 2192, 935), "pins": {
        "serratus-anterior": (890, 451), "deltoid": (1115, 606), "trapezius": (1158, 849)}},
    "upper-humerus": {"fig": HUM, "crop": (0, 0, 2229, 965), "pins": {
        "pectoralis-major": (186, 156), "deltoid": (1082, 284), "latissimus-dorsi": (1232, 514)}},
    "upper-shoulder-deep": {"fig": HUM, "crop": (0, 1100, 2229, 2065), "pins": {
        "teres-minor": (1575, 1218), "supraspinatus": (1931, 1203), "infraspinatus": (1932, 1472),
        "subscapularis": (951, 1588), "teres-major": (1929, 1641), "triceps-brachii": (1748, 1823)}},
    "upper-arm": {"fig": ARM, "crop": (0, 0, 2381, 860), "pins": {
        "biceps-brachii": (808, 212), "triceps-brachii": (1766, 258), "brachialis": (456, 779)}},
    "upper-forearm-palmar": {"fig": ARM, "crop": (0, 920, 1360, 1840), "pins": {"brachioradialis": (1091, 1059)}},
    "upper-body-front": {"fig": BODY, "crop": (230, 100, 1000, 520), "upscale": True, "pins": {
        "deltoid": (345, 141), "pectoralis-major": (247, 229), "trapezius": (920, 195), "serratus-anterior": (921, 296),
        "biceps-brachii": (922, 350), "brachialis": (922, 400), "brachioradialis": (922, 452)}},
    "upper-body-back": {"fig": BODY, "crop": (170, 1600, 1000, 1910), "upscale": True, "pins": {
        "supraspinatus": (276, 1657), "teres-minor": (183, 1711), "infraspinatus": (199, 1770), "teres-major": (183, 1826),
        "triceps-brachii": (223, 1880), "trapezius": (920, 1695), "deltoid": (922, 1746), "latissimus-dorsi": (922, 1800),
        "brachioradialis": (922, 1855)}},
}
LABELED = {"upper-girdle-labeled": (GIR, (0, 0, 2192, 935)), "upper-humerus-labeled": (HUM, (0, 0, 2229, 965)),
           "upper-shoulder-deep-labeled": (HUM, (0, 1100, 2229, 2065)), "upper-arm-labeled": (ARM, (0, 0, 2381, 860)),
           "upper-forearm-palmar-labeled": (ARM, (0, 920, 1360, 1840))}

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
        out = masked[v["fig"]].crop(v["crop"])
        if DEBUG:
            out = out.copy(); dd = ImageDraw.Draw(out)
            for m, (x, y) in v["pins"].items():
                dd.ellipse((x - cx0 - 12, y - cy0 - 12, x - cx0 + 12, y - cy0 + 12), outline="magenta", width=4)
                dd.text((x - cx0 + 14, y - cy0 - 6), m[:10], fill="magenta")
        fit(out, v.get("upscale")).save(os.path.join(OUT, view + "-unlabeled.jpg"), quality=84, optimize=True)
        pins[view] = {m: [round(100 * (x - cx0) / (cx1 - cx0), 2), round(100 * (y - cy0) / (cy1 - cy0), 2)] for m, (x, y) in v["pins"].items()}
    for name, (fig, box) in LABELED.items():
        fit(Image.open(os.path.join(SRC, fig)).convert("RGB").crop(box)).save(os.path.join(OUT, name + ".jpg"), quality=84, optimize=True)
    with open(os.path.join(OUT, "pins-upper.json"), "w") as f:
        json.dump(pins, f, indent=1)
    with open(os.path.join(OUT, "ATTRIBUTION-upper.txt"), "w") as f:
        f.write("Upper limb images derived from OpenStax, Anatomy and Physiology 2e (https://openstax.org/details/books/anatomy-and-physiology-2e),\n"
                "figures 1105, 1118, 1119 and 1120 in github.com/openstax/osbooks-anatomy-physiology. Licensed CC BY-NC-SA 4.0\n"
                "(https://creativecommons.org/licenses/by-nc-sa/4.0/). Changes: cropped, resized, and labels covered.\n"
                "These derived images are shared under CC BY-NC-SA 4.0. Non-commercial use only.\n")
    print(json.dumps(pins))

if __name__ == "__main__":
    main()
