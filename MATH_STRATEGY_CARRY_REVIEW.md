# Math Strategy Carry-Sensitivity Review

## Status

**IMPLEMENTATION CORRECTION SOURCE-VERIFIED; CALIBRATION ASSUMPTION DOCUMENTED.**

The first generalization review showed that four different formal decimal multiplications received the same cost even though their arithmetic required different carrying.

The correction models a two-digit percent multiplication as aligned tenths and hundredths partial products and counts carries in the addition of those partials.

Examples:

- `0.17 × 32 = 3.20 + 2.24` → 0 carries
- `0.27 × 64 = 12.80 + 4.48` → 1 carry
- `0.69 × 32 = 19.20 + 2.88` → 2 carries
- `0.88 × 64 = 51.20 + 5.12` → 0 carries

Each carry is currently charged using the already-existing generic operation-count weight, `0.35`.

That means a carry adds a small fixed increment **on top of** the route's separate division difficulty, multiplication difficulty, decimal complexity, and other cost dimensions. It does not replace those dimensions and does not equate a carry with the full cost of a division or multiplication.

The choice `1 carry = 1 generic operation-count increment` is nevertheless a calibration assumption, not a mathematical fact. It is intentionally documented so future reviewers can change it deliberately if human-reviewed data supports a different relative cost.

The corrected formal route costs are:

- `17% of 32`: `7.900`
- `27% of 64`: `8.250`
- `69% of 32`: `8.600`
- `88% of 64`: `7.900`

The test suite now verifies both sides of the carry feature:

- the reviewed carry counts are exactly `0, 1, 2, 0`;
- the two zero-carry examples, `17% of 32` and `88% of 64`, retain equal formal-route cost (`7.900`).

This closes the equal-cost implementation defect without claiming that `0.35` is the permanently correct cognitive price for a carry.
