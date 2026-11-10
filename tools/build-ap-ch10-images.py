#!/usr/bin/env python3
"""Builds the Chapter 10 (muscle physiology) teaching figures from OpenStax Anatomy and Physiology 2e media.

Usage: python3 tools/build-ap-ch10-images.py <path to osbooks-anatomy-physiology/media>
Figures are shown labeled (they teach a process; nothing is hidden for practice). License: CC BY-NC-SA 4.0.
"""
import os, sys
from PIL import Image

SRC = sys.argv[1] if len(sys.argv) > 1 else "media"
OUT = os.path.join(os.path.dirname(__file__), "..", "student-app", "lessons", "ap-ch10", "img")
MAX_W = 900
FIGS = {  # output name: (source file, crop box or None, OpenStax 2e figure)
    "nmj": ("1009_Motor_End_Plate_and_Innervation.jpg", (0, 1700, 1462, 2548), "Figure 10.6 Motor End-Plate and Innervation (bottom panel)"),
    "contraction": ("1010a_Contraction_new.jpg", None, "Figure 10.8 Contraction of a Muscle Fiber"),
    "relaxation": ("1010b_Relaxation_new.jpg", None, "Figure 10.9 Relaxation of a Muscle Fiber"),
    "crossbridge": ("1008_Skeletal_Muscle_Contraction.jpg", None, "Figure 10.11 Skeletal Muscle Contraction (cross-bridge cycle)"),
    "sliding": ("1006_Sliding_Filament_Model_of_Muscle_Contraction.jpg", None, "Figure 10.10 The Sliding Filament Model of Muscle Contraction"),
    "metabolism": ("1016_Muscle_Metabolism.jpg", None, "Figure 10.12 Muscle Metabolism"),
}

def main():
    os.makedirs(OUT, exist_ok=True)
    lines = ["Images: OpenStax, Anatomy and Physiology 2e (https://openstax.org/details/books/anatomy-and-physiology-2e),",
             "licensed CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/). Resized; nmj.jpg is cropped to one panel.", ""]
    for name, (f, box, cap) in FIGS.items():
        im = Image.open(os.path.join(SRC, f)).convert("RGB")
        if box: im = im.crop(box)
        if im.width > MAX_W: im = im.resize((MAX_W, round(im.height * MAX_W / im.width)), Image.LANCZOS)
        im.save(os.path.join(OUT, name + ".jpg"), quality=84, optimize=True)
        lines.append("%s.jpg: %s (source file %s)" % (name, cap, f))
        print(name, im.size)
    open(os.path.join(OUT, "ATTRIBUTION.txt"), "w").write("\n".join(lines) + "\n")

if __name__ == "__main__":
    main()
