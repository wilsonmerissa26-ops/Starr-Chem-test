"""Build the A&P hip and thigh images from OpenStax Anatomy and Physiology 2e figures.

Source: OpenStax, Anatomy and Physiology 2e (github.com/openstax/osbooks-anatomy-physiology, media/),
figures 1105 and 1122. Licensed CC BY-NC-SA 4.0. Changes: cropped, resized, and text labels
covered with blank boxes. The derived images are shared under the same license (CC BY-NC-SA 4.0).

Usage:  python tools/build-ap-thigh-images.py <path-to-openstax-media-folder> [--debug]
Writes thigh-*.jpg and pins-thigh.json to student-app/lessons/ap-muscles/img/.
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

HIP = "1122_Gluteal_Muscles_that_Move_the_Femur.jpg"
BODY = "1105_Anterior_and_Posterior_Views_of_Muscles.jpg"

# Fig. 1122 has three drawings: superficial front (top left), deep front (bottom left) and back (bottom right).
# The front drawing is tall and narrow with 11 labeled muscles, so it is split into a hip crop and a lower-thigh crop to
# keep pins at least 46 px apart at 640 px; the back drawing is split into a gluteal crop and a hamstring crop for the same
# reason. The deep front drawing is never shown labeled: it is a new picture for the adductors (drawing openstax-1122-deep).
VIEWS = {
    "thigh-hip": {"fig": HIP, "crop": (210, 150, 530, 620), "upscale": True, "pins": {
        "iliacus": (305, 287), "psoas-major": (343, 292), "tensor-fasciae-latae": (258, 440), "pectineus": (355, 423),
        "adductor-longus": (382, 430), "gracilis": (405, 478), "adductor-magnus": (395, 524), "sartorius": (372, 540)}},
    "thigh-knee": {"fig": HIP, "crop": (210, 470, 530, 790), "upscale": True, "pins": {
        "rectus-femoris": (318, 588), "vastus-lateralis": (297, 705), "vastus-medialis": (385, 692)}},
    "thigh-glutes": {"fig": HIP, "crop": (1130, 1180, 1450, 1500), "upscale": True, "pins": {
        "gluteus-medius": (1342, 1243), "gluteus-maximus": (1232, 1447), "gluteus-minimus": (1369, 1301), "piriformis": (1309, 1364)}},
    "thigh-hamstrings": {"fig": HIP, "crop": (1150, 1570, 1450, 1870), "upscale": True, "pins": {
        "biceps-femoris": (1305, 1666), "semitendinosus": (1257, 1721), "semimembranosus": (1233, 1718)}},
    "thigh-deep": {"fig": HIP, "crop": (262, 1330, 580, 1800), "upscale": True, "pins": {
        "pectineus": (435, 1398), "adductor-longus": (420, 1638), "adductor-magnus": (448, 1702)}},
    "thigh-body-front": {"fig": BODY, "crop": (420, 580, 900, 880), "upscale": True, "pins": {
        "sartorius": (538, 678), "gracilis": (583, 693), "rectus-femoris": (535, 758), "vastus-lateralis": (507, 828),
        "vastus-medialis": (622, 840), "tensor-fasciae-latae": (708, 625)}},
    "thigh-body-back": {"fig": BODY, "crop": (420, 1990, 900, 2280), "upscale": True, "pins": {
        "gluteus-medius": (520, 2025), "gluteus-maximus": (550, 2070), "semimembranosus": (562, 2215), "biceps-femoris": (657, 2192),
        "gluteus-minimus": (683, 2053)}},
}
# Labeled teaching images: the front drawing and the back drawing with OpenStax's labels. The deep front drawing is left out.
LABELED = {"thigh-front-labeled": (HIP, (0, 0, 1000, 960), []),
           "thigh-back-labeled": (HIP, (812, 1130, 1713, 2175), [])}

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
    with open(os.path.join(OUT, "pins-thigh.json"), "w") as f:
        json.dump(pins, f, indent=1)
    with open(os.path.join(OUT, "ATTRIBUTION-thigh.txt"), "w") as f:
        f.write("Hip and thigh images derived from OpenStax, Anatomy and Physiology 2e (https://openstax.org/details/books/anatomy-and-physiology-2e),\n"
                "figures 1105 and 1122 in github.com/openstax/osbooks-anatomy-physiology. Licensed CC BY-NC-SA 4.0\n"
                "(https://creativecommons.org/licenses/by-nc-sa/4.0/). Changes: cropped, resized, and labels covered.\n"
                "These derived images are shared under CC BY-NC-SA 4.0. Non-commercial use only.\n")
    print(json.dumps(pins))

if __name__ == "__main__":
    main()
