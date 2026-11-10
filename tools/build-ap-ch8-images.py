#!/usr/bin/env python3
"""Builds the Chapter 8 (articulations) teaching figures from OpenStax Anatomy and Physiology 2e media (Chapter 9, Joints).

Usage: python3 tools/build-ap-ch8-images.py <path to osbooks-anatomy-physiology/media>
Figures are shown labeled (teaching only). License: CC BY-NC-SA 4.0.
"""
import os, sys
from PIL import Image

SRC = sys.argv[1] if len(sys.argv) > 1 else "media"
OUT = os.path.join(os.path.dirname(__file__), "..", "student-app", "lessons", "ap-ch8", "img")
FIGS = {  # output name: (source file, max width, OpenStax 2e figure)
    "fibrous": ("904_Fibrous_Joints.jpg", 1200, "Fibrous Joints (section 9.2)"),
    "cartilaginous": ("906_Cartilaginous_Joints.jpg", 1200, "Cartilaginous Joints (section 9.3)"),
    "synovial": ("907_Synovial_Joints.jpg", 900, "Figure 9.8 Synovial Joints"),
    "types": ("909_Types_of_Synovial_Joints.jpg", 1100, "Figure 9.10 Types of Synovial Joints"),
    "moves1": ("911_Body_Movements(Page 1).jpg", 1100, "Movements of the Body, part 1 (section 9.5)"),
    "moves2": ("911_Body_Movements(Page 2).jpg", 1100, "Movements of the Body, part 2 (section 9.5)"),
    "elbow": ("915_Elbow_Joint.jpg", 1100, "Figure 9.17 Elbow Joint"),
    "knee": ("917_Knee_Joint.jpg", 1100, "Figure 9.19 Knee Joint"),
}

def main():
    os.makedirs(OUT, exist_ok=True)
    lines = ["Images: OpenStax, Anatomy and Physiology 2e (https://openstax.org/details/books/anatomy-and-physiology-2e),",
             "licensed CC BY-NC-SA 4.0 (https://creativecommons.org/licenses/by-nc-sa/4.0/). Resized only.", ""]
    for name, (f, w, cap) in FIGS.items():
        im = Image.open(os.path.join(SRC, f)).convert("RGB")
        if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        im.save(os.path.join(OUT, name + ".jpg"), quality=82, optimize=True)
        lines.append("%s.jpg: %s (source file %s)" % (name, cap, f))
        print(name, im.size)
    open(os.path.join(OUT, "ATTRIBUTION.txt"), "w").write("\n".join(lines) + "\n")

if __name__ == "__main__":
    main()
