# Math Strategy Carry-Sensitivity Review

## Status

**IMPLEMENTATION CORRECTION COMPLETE; PEDAGOGICAL REVIEW STILL OPEN.**

The first generalization review showed that four different formal decimal multiplications received the same cost even though their arithmetic required different carrying.

The correction models a two-digit percent multiplication as aligned tenths and hundredths partial products and counts carries in the addition of those partials.

Examples:

- `0.17 × 32 = 3.20 + 2.24` → 0 carries
- `0.27 × 64 = 12.80 + 4.48` → 1 carry
- `0.69 × 32 = 19.20 + 2.88` → 2 carries
- `0.88 × 64 = 51.20 + 5.12` → 0 carries

Each carry is charged using the already-existing per-operation weight. No special-case route choice or new arbitrary carry weight was introduced.

The corrected formal route costs are therefore:

- `17% of 32`: `7.900`
- `27% of 64`: `8.250`
- `69% of 32`: `8.600`
- `88% of 64`: `7.900`

This fixes the equal-cost bug. It does not settle whether a formal route should pedagogically beat decomposition in those awkward-whole cases. That human judgment remains a live integration gate.
