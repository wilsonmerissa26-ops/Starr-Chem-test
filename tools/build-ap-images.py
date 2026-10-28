"""Build the A&P pilot images from OpenStax Anatomy and Physiology 2e figures.

Source: OpenStax, Anatomy and Physiology 2e (github.com/openstax/osbooks-anatomy-physiology, media/),
licensed CC BY-NC-SA 4.0. Changes: cropped, resized, and text labels covered with blank boxes.
The derived images are shared under the same license (CC BY-NC-SA 4.0).

Usage:  python tools/build-ap-images.py <path-to-openstax-media-folder>
Writes images and pins.json to student-app/lessons/ap-muscles/img/.
Each pin sits where an OpenStax label's leader line starts, so every answer location comes from
OpenStax's own labels, not from a hand-placed guess.
"""
import json, os, sys
from PIL import Image, ImageDraw

SRC = sys.argv[1] if len(sys.argv) > 1 else "media"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "student-app", "lessons", "ap-muscles", "img")
MAX_W = 1100
PAD = 6

FIG_FACE = "1106_Front_and_Side_Views_of_the_Muscles_of_Facial_Expressions.jpg"
FIG_JAW = "1108_Muscle_that_Move_the_Lower_Jaw.jpg"
FIG_NECK = "1111_Posterior_and_Side_Views_of_the_Neck.jpg"

# Text boxes of every label (x0, y0, x1, y1) in the original figures, located by OCR and checked visually.
FACE_LABELS = {"epicranial-aponeurosis": (975, 18, 1362, 66), "frontal-belly": (998, 373, 1272, 463),
               "corrugator-supercilii": (974, 510, 1318, 566), "orbicularis-oculi": (1000, 617, 1276, 657),
               "occipital-belly": (998, 777, 1275, 867), "orbicularis-oris": (1005, 991, 1266, 1031), "buccinator": (1048, 1235, 1234, 1275)}
JAW_LABELS = {"temporalis": (14, 66, 184, 110), "masseter": (16, 826, 162, 864)}
NECK_LABELS = {"splenius-capitis": (625, 52, 890, 100), "sternocleidomastoid": (566, 186, 910, 232), "levator-scapulae": (567, 258, 854, 302),
               "trapezius": (564, 333, 730, 375), "acromion": (557, 412, 742, 538), "scalenes": (615, 600, 773, 636)}

# Leader-line start points (where each label's line begins), per view. Only lesson muscles get pins.
VIEWS = {
    "face-anterior": {"fig": FIG_FACE, "crop": (0, 0, 1100, 1460), "labels": FACE_LABELS,
                      "pins": {"frontal-belly": (1012, 397), "orbicularis-oculi": (1012, 637), "orbicularis-oris": (1016, 1011), "buccinator": (1060, 1255)}},
    "face-lateral": {"fig": FIG_FACE, "crop": (1150, 0, 2407, 1460), "labels": FACE_LABELS,
                     "pins": {"frontal-belly": (1262, 397), "orbicularis-oculi": (1266, 637), "orbicularis-oris": (1256, 1011), "buccinator": (1224, 1255)}},
    "jaw": {"fig": FIG_JAW, "crop": (0, 0, 1000, 1067), "labels": JAW_LABELS,
            "pins": {"temporalis": (178, 88), "masseter": (156, 845)}},
    "neck": {"fig": FIG_NECK, "crop": (0, 0, 760, 850), "labels": NECK_LABELS,
             "pins": {"sternocleidomastoid": (580, 209)}},
}
LABELED = {"face-labeled": (FIG_FACE, (0, 0, 2407, 1460)), "jaw-labeled": (FIG_JAW, (0, 0, 1000, 1067)), "neck-labeled": (FIG_NECK, (0, 0, 1010, 850))}

def fit(im):
    if im.width > MAX_W:
        im = im.resize((MAX_W, round(im.height * MAX_W / im.width)), Image.LANCZOS)
    return im

def main():
    os.makedirs(OUT, exist_ok=True)
    pins = {}
    for name, (fig, box) in LABELED.items():
        fit(Image.open(os.path.join(SRC, fig)).convert("RGB").crop(box)).save(os.path.join(OUT, name + ".jpg"), quality=84, optimize=True)
    for view, v in VIEWS.items():
        im = Image.open(os.path.join(SRC, v["fig"])).convert("RGB")
        d = ImageDraw.Draw(im)
        for (x0, y0, x1, y1) in v["labels"].values():
            d.rectangle((x0 - PAD, y0 - PAD, x1 + PAD, y1 + PAD), fill="white")
        cx0, cy0, cx1, cy1 = v["crop"]
        out = fit(im.crop(v["crop"]))
        out.save(os.path.join(OUT, view + "-unlabeled.jpg"), quality=84, optimize=True)
        pins[view] = {m: [round(100 * (x - cx0) / (cx1 - cx0), 2), round(100 * (y - cy0) / (cy1 - cy0), 2)] for m, (x, y) in v["pins"].items()}
    with open(os.path.join(OUT, "pins.json"), "w") as f:
        json.dump(pins, f, indent=1)
    with open(os.path.join(OUT, "ATTRIBUTION.txt"), "w") as f:
        f.write("Images derived from OpenStax, Anatomy and Physiology 2e (https://openstax.org/details/books/anatomy-and-physiology-2e),\n"
                "figures 1106, 1108 and 1111 in github.com/openstax/osbooks-anatomy-physiology. Licensed CC BY-NC-SA 4.0\n"
                "(https://creativecommons.org/licenses/by-nc-sa/4.0/). Changes: cropped, resized, and labels covered.\n"
                "These derived images are shared under CC BY-NC-SA 4.0. Non-commercial use only.\n")
    print(json.dumps(pins, indent=1))

if __name__ == "__main__":
    main()
