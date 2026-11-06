"""Build images for the A&P in-depth muscle lesson (sternocleidomastoid and masseter).

Source: OpenStax, Anatomy and Physiology 2e (github.com/openstax/osbooks-anatomy-physiology, media/),
figures 705 (lateral skull), 1105 (anterior and posterior muscles) and 1110 (anterior neck).
Licensed CC BY-NC-SA 4.0. Changes: cropped, resized, landmark labels outlined, and (for the
unlabeled view) no text left in the crop. Derived images are shared under CC BY-NC-SA 4.0.

Usage:  python tools/build-ap-deep-images.py <path-to-openstax-media-folder>
"""
import json, os, sys
from PIL import Image, ImageDraw

SRC = sys.argv[1] if len(sys.argv) > 1 else "media"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "student-app", "lessons", "ap-muscles", "img")
MAX_W = 1100
HL = (199, 41, 120)  # outline color for the landmark labels being taught

def fit(im, upscale=False):
    if im.width > MAX_W or upscale:
        w = MAX_W if im.width > MAX_W else min(MAX_W, im.width * 2)
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    return im

def outline(im, boxes, pad=10, width=6):
    d = ImageDraw.Draw(im)
    for (x0, y0, x1, y1) in boxes:
        d.rounded_rectangle((x0 - pad, y0 - pad, x1 + pad, y1 + pad), radius=12, outline=HL, width=width)
    return im

def main():
    pins = {}
    # 1. Skull, right lateral view: outline Mastoid process, Zygomatic arch and Mandible (OCR-located label boxes).
    skull = Image.open(os.path.join(SRC, "705_Lateral_View_of_Skull-01.jpg")).convert("RGB")
    outline(skull, [(18, 1120, 317, 1160), (1276, 26, 1558, 66), (1068, 1424, 1232, 1455)])
    fit(skull.crop((0, 0, 2450, 1600))).save(os.path.join(OUT, "deep-skull-landmarks.jpg"), quality=84, optimize=True)
    # 2. Anterior neck, lower part: outline "Right and left clavicles" and "Sternum".
    neck = Image.open(os.path.join(SRC, "1110_Muscle_of_the_Anterior_Neck.jpg")).convert("RGB")
    outline(neck, [(1444, 1014, 1663, 1084), (1515, 1127, 1653, 1155)])
    # The crop starts below the "Sternohyoid" label: sternohyoid is a decode practice name and must stay unseen.
    fit(neck.crop((0, 885, 1683, 1406))).save(os.path.join(OUT, "deep-neck-landmarks.jpg"), quality=84, optimize=True)
    # 3. Whole-body anterior view, head and neck only, no text in the crop. The pin sits on OpenStax's
    #    "Sternocleidomastoid" leader line where it enters the crop (line runs from (310,55) to (570,188)).
    body = Image.open(os.path.join(SRC, "1105_Anterior_and_Posterior_Views_of_Muscles.jpg")).convert("RGB")
    box = (380, 0, 900, 235)
    x = 392; y = round(55 + (x - 310) * (188 - 55) / (570 - 310))
    fit(body.crop(box), upscale=True).save(os.path.join(OUT, "deep-body-head-unlabeled.jpg"), quality=86, optimize=True)
    pins["deep-body-head"] = {"sternocleidomastoid": [round(100 * (x - box[0]) / (box[2] - box[0]), 2), round(100 * (y - box[1]) / (box[3] - box[1]), 2)]}
    with open(os.path.join(OUT, "pins-deep.json"), "w") as f:
        json.dump(pins, f, indent=1)
    print(json.dumps(pins))

if __name__ == "__main__":
    main()
