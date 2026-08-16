# Day 1 v4 fix notes

Phone testing found three learner-flow defects after v3:

1. Math practice did not let the learner return to a previous seen problem.
2. Wrong fraction answers did not have an explicit protected retry contract.
3. Skip behavior was not explicit enough about staying in the same math skill.

v4 fixes these by keeping per-skill problem history, adding Previous problem and Next seen problem controls, preserving the same problem after a wrong answer or IDK, and making Skip generate a fresh problem from the same skill. All six math areas remain available from All math skills. Fractions and percentages retain separate teaching for common denominators, fraction-of-a-number reasoning, mental percentages, and the formal percent method.