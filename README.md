# Starr-Chem-test

## Launch Day 1

Open the repository/site root or `day1/` in a modern browser. The root entry redirects to `day1/`, which is the current learner-facing AStarryia Day 1 Math and Chemistry Foundation Reset.

The Day 1 content and interaction authorities are stored in `Day1_Curriculum.md`, `Day1_Interactive_Layer_Specification.md`, `day1/MATH_TEACHING_CONTRACT.md`, and `Math_Gym_Specification.md`. The standalone molecule workbench remains available as `molecule-stage.html`; the Day 1 learner session uses the same verification logic through `molecule-stage.js`.

## Day 1 completion rules

Day 1 is treated as the stable foundation for later days. Preserve working behavior unless a regression or real learner failure requires a change.

Current protected teaching rules include:
- teaching examples and independent practice use different equivalent problems;
- a helped problem is learning evidence, not cold independent mastery evidence;
- required formulas/rules are taught or available in the Toolbox before they are assumed;
- normal practice stops after the skill bank is completed instead of looping forever; fluency repetition belongs in Math Gym;
- free-text answer checking accepts conservative mathematically equivalent forms where supported while still rejecting wrong answers.

## Manual real-device verification still required

Automated CI is necessary but does not certify the physical phone experience. Before calling a release visually/device certified, verify on AStarryia's actual phone that:
- algebra Check accepts a correct equivalent response such as `x = 5`;
- lesson examples differ from the practice problem that follows;
- the last normal-practice item ends the skill instead of wrapping to the first item;
- math scrolling, buttons, speech, and Toolbox access remain comfortable;
- chemistry progresses from NH3 teaching to fresh H2O guided practice, CH4 independent work, H2S error analysis, and PH3 transfer without reusing NH3 as mastery evidence.

Passing the automated suite means code/contract verified. The phone pass is a separate visual and touch certification step.
