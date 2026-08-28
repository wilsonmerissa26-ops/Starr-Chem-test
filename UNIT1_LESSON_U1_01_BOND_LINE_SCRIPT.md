# UNIT 1 LESSON U1-01 — BOND-LINE STRUCTURES
## Fully authored beginner lesson script

**Status:** content draft for instructional review before runtime implementation.

**Parent curriculum:** `UNIT1_BEGINNER_TEACHING_CURRICULUM.md`

**Teaching-engine contract:** `DR_MERISSA_TEACHING_ENGINE_SPEC.md`

**Purpose of this file:** define exactly what the learner sees, hears, predicts, builds, explains, and is asked to do so the lesson can be audited as teaching before any code is written.

---

# 1. LESSON GOAL

A learner who begins with little usable knowledge of bond-line notation should leave able to:

1. identify every carbon represented by a line end or vertex,
2. infer missing hydrogens on carbon from carbon's usual four-bond pattern,
3. recognize that heteroatoms remain explicitly labeled,
4. translate between expanded/condensed structures and bond-line structures,
5. explain why the atoms are still present even when their labels are omitted,
6. solve a fresh bond-line problem without prompts.

This lesson is not complete merely because the learner has seen a zig-zag structure. It is complete only when she can recover the hidden atoms and use the notation independently.

---

# 2. LEARNER-FACING ORIENTATION

## Screen title

**Bond-line structures: learning to see the atoms that are not written**

## Dr. Merissa narration

> "Organic molecules can get crowded fast if we write every carbon and every hydrogen. Chemists use a shortcut called a bond-line structure. The shortcut hides some labels, but it does not remove the atoms. By the end of this lesson, you will be able to look at a few lines and know exactly where the carbons and hydrogens are."

## Immediate learner check

Prompt:

**Before we start: when a chemistry drawing leaves out a label, do you think the atom is gone, or do you think the drawing may be using a shortcut?**

Choices:
- The atom is gone.
- The drawing may be using a shortcut.
- I am not sure yet.

This is not scored as mastery. It is used only to establish the mental model.

If learner selects **The drawing may be using a shortcut**:

> "Exactly. That is the idea we are going to make precise."

If learner selects **The atom is gone** or **I am not sure yet**:

> "Good place to start. In bond-line notation, some atoms are still part of the molecule even when their letter is not written. We are going to make every hidden atom visible first, then learn the shortcut."

---

# 3. SMALLEST PREREQUISITE GATE

Do not test more than this lesson actually needs.

## Gate item P1

Prompt:

**In the neutral organic structures we are using here, how many total bonds does carbon commonly make?**

Choices: 2, 3, 4, 6, I do not know yet.

Correct: **4**

## Gate item P2

Visual: show `C—C` with the line between the atoms emphasized.

Prompt:

**What does the line between these two atoms represent?**

Choices:
- A covalent bond
- A carbon atom
- A hydrogen atom
- Empty space
- I do not know yet

Correct: **A covalent bond**

## Gate routing

### 2/2 correct

Proceed immediately to the teaching sequence.

### Carbon-bond pattern missed

Show a tiny prerequisite repair only.

Dr. Merissa:

> "For the neutral carbon atoms we will use in this lesson, carbon is trying to reach a total bond order of four. A single bond counts as 1, a double bond counts as 2, and a triple bond counts as 3. We will use that total to figure out how many hydrogens must be hiding on carbon."

Low-risk interaction:

Visual: `H3C—CH3` with one carbon selected.

Prompt:

**This carbon already has one C—C single bond. How many C—H bonds must it have to reach four total bonds?**

Correct: **3**

If missed, show four empty bond slots around carbon and fill one with the C—C bond, then let the learner fill the remaining three slots with H. Do not merely restate the sentence.

### Bond-line meaning missed

Show two labeled atoms with a bond appearing between them.

Dr. Merissa:

> "The line is the connection between atoms. The line itself is not a carbon. That distinction is going to matter in about two minutes."

Low-risk interaction:

Prompt:

**If three carbon atoms are connected in a row, how many C—C bond lines connect them?**

Correct: **2**

If missed, animate atom 1 connecting to atom 2, then atom 2 connecting to atom 3 and count the two connections.

Once the repair interaction is correct, continue to the full lesson. Do not demand a second full prerequisite quiz.

---

# 4. TEACHING SEQUENCE — I DO

## Core worked molecule

Use **butane**, first as a fully expanded four-carbon chain.

The lesson should begin with all four carbon atoms and all attached hydrogens visible.

The learner controls progression with **Next**, **Back**, **Replay current step**, and **Pause**. Nothing auto-advances.

---

## WATCH STEP 1 — Start with everything visible

### Visual

Show a fully expanded four-carbon chain with every `C`, every `H`, and every bond visible.

### Dr. Merissa

> "Right now nothing is hidden. We can see four carbon atoms connected in a chain, and we can see every hydrogen attached to them."

### Low-risk interaction

Prompt:

**Tap each carbon once.**

The learner must tap all four labeled carbon atoms.

Feedback after all four:

> "Four carbons. Keep that number in mind. We are about to make the drawing shorter without changing the molecule."

---

## WATCH STEP 2 — Separate the carbon skeleton from the hydrogens

### Visual

Hydrogens become visually lighter while the four carbon atoms and three C—C bonds remain emphasized.

### Dr. Merissa

> "This connected chain of carbon atoms is the carbon skeleton. The hydrogens are still part of the molecule, but the carbon-to-carbon pattern is the part chemists usually sketch first."

Vocabulary is introduced only now:

> "When we say **carbon skeleton**, we mean the connected pattern of carbon atoms in the molecule."

### Prediction

Prompt:

**If we stop writing the H labels that are attached to carbon, will the molecule suddenly have fewer hydrogen atoms?**

Choices:
- Yes
- No
- I am not sure yet

Correct: **No**

If correct:

> "Right. The notation changes. The molecule does not."

If incorrect or unsure:

> "Watch what changes next. We are going to hide the labels without breaking a single bond."

---

## WATCH STEP 3 — Hide carbon-bound hydrogen labels

### Visual

Each H attached to carbon fades one at a time. The carbon labels and carbon-carbon bonds remain.

A small label remains visible:

**Same molecule. Fewer written labels.**

### Dr. Merissa

> "The hydrogens attached to carbon are no longer written, but they are still implied. If I want to know how many hydrogens belong on a carbon, I look at the bonds already drawn to that carbon and ask how many more bonds it needs to reach four."

### Immediate interaction

Select the first terminal carbon. It has one visible single bond to the next carbon.

Prompt:

**This carbon already has 1 bond. How many C—H bonds are implied here so carbon reaches 4?**

Correct: **3**

On correct, briefly reveal three ghosted H labels around that carbon, then hide them again.

If wrong:

Do not reveal the final answer immediately. Show four bond slots around carbon, mark one as already occupied by the C—C bond, and ask:

**How many bond slots remain?**

Correct: **3**

Then reconnect that to three implied hydrogens.

---

## WATCH STEP 4 — Hide the carbon letters one carbon at a time

### Visual

The carbon labels collapse in this order:

1. left terminal C becomes the left line end,
2. second C becomes the first corner,
3. third C becomes the second corner,
4. right terminal C becomes the right line end.

Do not jump from the expanded structure directly to a finished zig-zag.

### Dr. Merissa

> "Now we are shortening the carbon labels too. Watch carefully. A carbon at the end of the chain becomes a **line end**. A carbon where two bond lines meet becomes a **vertex**, which just means a corner."

Definition in plain language first:

> "This corner where two lines meet is called a vertex. In a bond-line structure, an unlabeled vertex represents carbon."

### Prediction pause after two carbons collapse

Prompt:

**The letter C disappeared from this corner. Did the carbon atom disappear?**

Choices:
- Yes
- No, the corner now stands for the carbon
- I am not sure yet

Correct: **No, the corner now stands for the carbon**

If missed, toggle the C label on and off over the same vertex three times while keeping all bonds fixed.

Dr. Merissa:

> "Same position, same bonds, same carbon. Only the label is being abbreviated."

---

## WATCH STEP 5 — Finished bond-line structure

### Visual

Show the finished four-carbon zig-zag with three bond segments.

Underneath it, display four temporary numbered markers:

`1` at left line end, `2` at first vertex, `3` at second vertex, `4` at right line end.

### Dr. Merissa

> "This drawing has three visible bond lines, but it represents four carbon atoms. That is one of the first traps beginners hit: lines are bonds. Carbons are at unlabeled line ends and unlabeled vertices."

### Immediate interaction

Prompt:

**Tap every carbon in the bond-line structure.**

Correct taps are the two line ends plus two vertices.

If learner taps the middle of a bond segment:

> "That is a bond between carbons, not another carbon. Look for an end or a corner."

If learner misses an endpoint:

> "A line end counts too. Endpoints are carbon unless another atom is explicitly labeled there."

After all four:

> "Exactly four, just like the fully written structure we started with."

Then toggle expanded ↔ bond-line views while keeping numbered carbons mapped.

---

## WATCH STEP 6 — Infer hydrogens on different carbons

### Visual

Keep butane bond-line structure visible. Select carbon 2, an internal carbon with two single C—C bonds.

### Dr. Merissa

> "Now we recover the hydrogens that are not written. This carbon has two single bonds already drawn to other carbons. Two bonds are visible. Carbon commonly needs four total, so two C—H bonds are implied. This carbon is CH2 even though neither the C nor the H2 is written."

### Learner interaction

Select carbon 3.

Prompt:

**Carbon 3 also has two visible single bonds. How many hydrogens are implied?**

Correct: **2**

Then select carbon 4.

Prompt:

**This end carbon has one visible single bond. How many hydrogens are implied?**

Correct: **3**

### Wrong-answer response

If learner enters number greater than needed:

> "Count the bond order already visible first. Carbon is not getting four new hydrogens. It is reaching four total bonds."

If learner enters too few:

Show a running count:

`visible bond order + implied C—H bonds = 4`

Do not say only "remember carbon makes four bonds."

---

## WATCH STEP 7 — Heteroatoms are not hidden like carbon

### Visual

Transform a simple carbon chain into a structure ending in `O—H`, for example the bond-line form of 1-propanol.

Keep the `O` and its attached `H` written.

### Dr. Merissa

> "Carbon gets special shorthand in bond-line notation. Other elements are normally written with their symbols. Chemists often call a non-carbon atom in an organic structure a **heteroatom**. Oxygen is a heteroatom, so we write O. Nitrogen would be written N. Halogens such as Cl or Br are written too."

Plain-language definition:

> "Heteroatom just means an atom in the organic structure that is not carbon or hydrogen."

### Prediction

Prompt:

**If this oxygen label disappeared completely, would the bond-line drawing still tell us an oxygen is there?**

Correct: **No**

Feedback:

> "Right. Unlabeled ends and corners default to carbon. An oxygen must be labeled O."

### Misconception guard

Do not teach the false blanket rule "all hydrogens are hidden." State instead:

> "Hydrogens attached to carbon are usually omitted in bond-line notation. Hydrogens attached to heteroatoms are often shown because they can change the functional group and chemical behavior."

---

## WATCH STEP 8 — Multiple bonds stay visible

### Visual

Show a four-carbon chain containing one C=C double bond. First show it with carbon labels, then collapse carbon labels while keeping the double bond as two parallel lines.

### Dr. Merissa

> "The shortcut does not erase bond order. A double bond is still drawn as a double bond, and a triple bond is still drawn as a triple bond. That matters when we infer hydrogens."

Select a carbon in the double bond that has one single bond and one double bond to other carbons.

### Interaction

Prompt:

**This carbon already has bond order 3: one single bond plus one double bond. How many C—H bonds are implied?**

Correct: **1**

If learner says 2 because she counts neighbors instead of bond order:

> "You counted two neighboring atoms, which is useful, but hydrogen counting depends on bond order. The double bond contributes 2 and the single bond contributes 1. That gives 3 already, leaving room for only one hydrogen."

---

# 5. QUICK CONCEPT CHECK BEFORE BUILD TOGETHER

This is still supported instruction, not independent evidence.

Present four statements. Learner marks true/false.

1. **Every bond line represents a carbon atom.** False.
2. **An unlabeled line end usually represents carbon.** True.
3. **An unlabeled vertex usually represents carbon.** True.
4. **Hydrogens attached to carbon may be implied rather than written.** True.

If 4/4 correct, proceed.

If any are wrong, revisit only the relevant visual step. Do not replay the entire lesson automatically.

---

# 6. BUILD TOGETHER — WE DO

## Fresh molecule

Use **pentane**, not butane.

Start from a blank workspace.

Show condensed formula:

`CH3CH2CH2CH2CH3`

Dr. Merissa:

> "Now we are going to build the shortcut ourselves. I will guide the decisions, but you will make them."

## Build step 1 — Count carbons

Prompt:

**How many carbon atoms are in this formula?**

Correct: **5**

If wrong, allow learner to tap each `C` in the condensed formula and number them.

## Build step 2 — Determine connections

Prompt:

**Are these five carbons connected as one continuous chain or is a branch shown in this condensed formula?**

Correct: **one continuous chain**

## Build step 3 — Place the first two carbons as a bond

The learner taps two points to create the first bond segment.

Dr. Merissa:

> "One bond connects carbon 1 to carbon 2. Remember, the line is the bond. The two positions at its ends are the carbons."

## Build step 4 — Continue the chain

Learner adds three more bond segments to create five carbon positions total.

After each new segment, show temporary carbon numbers for one second.

Do not permanently label the carbons.

## Build step 5 — Self-check carbon count

Prompt:

**Tap the five carbon positions you created.**

The system should reject bond-center taps as carbon locations.

## Build step 6 — Recover one hidden hydrogen count

Select the middle carbon.

Prompt:

**This carbon has two visible single bonds. How many hydrogens are implied?**

Correct: **2**

## Build Together completion statement

> "You just built a bond-line structure from a condensed formula. The important move was not drawing a zig-zag. It was preserving the carbon connectivity while removing labels the notation lets us infer."

Supported success is logged as `BUILD_TOGETHER_SUCCESS`, never independent evidence.

---

# 7. GUIDED PRACTICE — YOU DO WITH SUPPORT

## Fresh molecule

Use **2-methylbutane**, condensed as:

`CH3CH(CH3)CH2CH3`

Do not use this molecule in the worked example or Build Together.

Dr. Merissa:

> "This time there is a branch. I will not tell you every move, but help is available if you need it."

## Guided task A — atom inventory

Prompt:

**How many total carbon atoms are present?**

Correct: **5**

Hint if requested:

> "Count every written C, including the one inside parentheses."

Using the hint contaminates this guided item only; it was already supported practice and was never eligible for mastery.

## Guided task B — connectivity

Visual shows carbon tokens numbered only during setup: 1-2-3-4 main sequence plus the branch carbon attached to carbon 2.

Prompt:

**Which carbon in the written formula has the branch attached to it?**

Correct: the second carbon in the condensed sequence.

### If wrong — visual connectivity repair

Do not rely on highlighting alone.

1. Box the substring `CH(CH3)` without changing the rest of the formula.
2. Place a temporary **host** marker under the `CH` immediately before the parentheses and a **branch** marker under the `CH3` inside the parentheses.
3. Animate a short attachment line from the branch `CH3` marker back to that host `CH`. Do not connect it to the carbon before or after the host.
4. In the numbered carbon-token view, highlight carbon 2 and the branch carbon simultaneously, then toggle once between the condensed formula and the matching skeletal branch while preserving the same two markers.

Dr. Merissa:

> "Parentheses do not create a separate floating piece. The group inside the parentheses is attached to the atom immediately before the parentheses. Here, the branch CH3 is attached to this CH, which is carbon 2 in the main sequence."

Repair interaction:

**Tap the host carbon in `CH3CH(CH3)CH2CH3`, then tap the matching host carbon in the numbered skeleton.**

Both taps must identify carbon 2. If either is wrong, keep the host/branch markers visible and repeat only this mapping step with a fresh condensed example before returning.

## Guided task C — build bond-line form

Learner creates the skeleton.

System checks:
- 5 carbons total,
- correct branch connectivity,
- no extra carbon placed at the middle of a bond,
- branch connected to correct carbon.

## Guided task D — hydrogen inference

Select the branched carbon, which has three C—C single bonds.

Prompt:

**How many hydrogens are implied on this carbon?**

Correct: **1**

Explanation after learner answer:

> "Three visible single bonds give bond order 3. Carbon reaches four with one C—H bond."

## Guided success criterion

Learner must complete two supported decisions in a row without a corrective reveal before support fades.

**What support fades means operationally in this lesson:**

1. After the first two consecutive guided decisions without a corrective reveal, remove the temporary numbered carbon tokens.
2. Replace step-by-step directive prompts with the task goal only; for example, change "find carbon 2, then place the branch" to "build the correct carbon skeleton."
3. Keep hints available only if the learner actively requests them; do not display the hint text automatically.
4. Do **not** jump from Guided directly to a cold item simply because support faded. The remainder of this Guided example is still supported practice and cannot count as independent evidence.
5. If an error appears after a scaffold has faded, restore only the minimum scaffold needed for that subskill and reset the two-success guided streak.

If repeated errors occur, do not push to independent. Route to the misconception-specific responses below.

---

# 8. MISCONCEPTION CONTRASTS

Every misconception response must show the difference, not merely state the rule again.

## M1 — "Three lines means three carbons"

### Wrong idea

Learner counts bond segments instead of carbon positions.

### Representation switch

Overlay circles on every endpoint and vertex, then number the carbon positions.

Dr. Merissa:

> "The three lines are three C—C bonds. Four carbon positions are needed to make those three connections. Count positions, not segments."

### Repair interaction

Show a two-segment zig-zag.

Prompt:

**How many carbon positions are represented?**

Correct: **3**

---

## M2 — "Only corners count as carbon"

### Wrong idea

Learner ignores line ends.

### Representation switch

Show a skeletal chain with endpoints enlarged and labeled temporarily as `end carbon` while vertices are labeled `corner carbon`.

Dr. Merissa:

> "Both types count: unlabeled ends and unlabeled corners."

### Repair interaction

Learner taps all carbon positions in a fresh short chain.

---

## M3 — "The hydrogens disappeared"

### Wrong idea

Learner believes omitted H means molecule has fewer H atoms.

### Representation switch

Use a slider or toggle:

`show implied H` ↔ `hide implied H`

The carbon skeleton never moves.

Dr. Merissa:

> "We are changing the amount of writing, not the molecular formula."

### Repair interaction

Prompt:

**When the H labels are hidden, does the carbon still need enough hydrogens to reach four total bonds?**

Correct: **Yes**

---

## M4 — "Oxygen or nitrogen can be hidden at a corner too"

### Wrong idea

Learner treats every unlabeled position as any possible atom.

### Representation switch

Compare two drawings side by side:
- one with an unlabeled vertex,
- one with `O` written at that position.

Dr. Merissa:

> "An unlabeled bond-line position represents carbon by default. If the atom is oxygen, nitrogen, sulfur, or a halogen, its symbol must be shown in the notation used here."

### Repair interaction

Ask learner which of two drawings contains oxygen.

---

## M5 — "Two neighbors means two hydrogens"

### Wrong idea

Learner counts neighboring atoms instead of total bond order.

### Representation switch

Show:
- carbon with two single bonds: bond order 2 → 2 H,
- carbon with one single + one double: bond order 3 → 1 H.

Dr. Merissa:

> "The number of neighboring atoms can be the same while bond order is different. Hydrogen counting uses the total bond order already drawn."

### Repair interaction

Present one single + one double bond around carbon.

Prompt:

**Visible bond order?** 3.

Then:

**Implied hydrogens?** 1.

---

# 9. SIX-WAY "I DON'T KNOW" CONTENT ROUTING

The shared router remains authoritative. This lesson supplies the content response for each route.

## IDK 1 — "I don't understand what the question means"

Response:

> "We are not asking you to name the molecule. We are asking you to find the carbon positions hidden by the shorthand. An unlabeled end or corner stands for carbon. Let's mark those positions first."

Switch to explicit atom-overlay view and ask the learner only to identify carbon positions.

Do not return to the same item verbatim afterward.

## IDK 2 — "I understand it, I don't know how to start"

Response:

> "Start with one decision: find every line end and every corner. Do not count hydrogens yet."

Model only the first carbon position, then hand the fresh structure back.

## IDK 3 — "I forgot something I need"

Offer two tiny prerequisite options:
- "I forgot how many bonds carbon makes."
- "I forgot what a single/double/triple bond counts as."

Route only to that micro-review, confirm it, then return to a fresh bond-line item.

## IDK 4 — "I started but got stuck"

Preserve the learner's work.

Ask:

**Where did you get stuck?**
- counting carbons
- deciding connectivity
- counting implied hydrogens
- handling a heteroatom
- handling a multiple bond

Repair only that step.

## IDK 5 — "I need to see an example"

Show a new worked example that has not appeared in independent evidence, such as a three-carbon chain ending in `OH`.

Use full Watch controls.

Then return to a fresh item.

## IDK 6 — "This explanation isn't making sense"

Do not paraphrase the original narration.

Switch representation to **Atom Overlay Mode**:
- draw the bond-line structure,
- place a numbered carbon token on every end/vertex,
- show four bond slots around one selected carbon,
- fill visible bond-order slots first,
- let learner fill remaining slots with H,
- toggle overlay off after success.

If this representation also fails, switch to a physical-path analogy:

> "Think of each carbon as a stop on a road. The road segments connect stops. A bend in the road is still a stop, and the two ends are stops too. We count the stops, not the pieces of road."

Then immediately map the analogy back to the chemical drawing so the analogy never replaces the chemistry.

---

# 10. INDEPENDENT PRACTICE — COLD EVIDENCE BANK

These items must never appear during Teach, Watch, Build Together, Guided, or IDK worked examples.

During cold evidence:
- no notebook,
- no atom overlay,
- no implied-H reveal,
- no hints,
- no carbon counter,
- chemistry toolbox hidden unless the assessment explicitly allows it.

If help is requested, the current item converts to supported practice and cannot count as independent evidence.

## BL-I1 — Read carbons from a fresh unbranched skeleton

Visual: six-carbon zig-zag with five bond segments.

Prompt:

**How many carbon atoms are represented?**

Correct: **6**

Follow-up explanation:

**Tell me what you counted.**

### BL-I1 explanation scoring contract

This response must be graded by **role-preserving meaning**, not by keyword presence.

Required relationship:
- the learner identifies the **two line ends** and the **vertices/corners** as the positions counted as carbon atoms.

Accept examples such as:
- "I counted both ends and every corner as carbons."
- "The carbons are at the line ends and vertices."

If the learner also discusses line segments, the relationship must remain correct: the segments are **bonds/connections**, not additional carbon positions.

Reject even when all expected words appear if the roles are reversed or contradicted. Examples that **fail**:
- "The vertices are the bonds and the line segments are the carbons."
- "I counted the middle of each line as a carbon and the ends as bonds."

A keyword set such as `line`, `end`, `vertex`, `carbon`, `bond` is never sufficient by itself. The grader must preserve **which object has which role**.

## BL-I2 — Infer hydrogens on a branched carbon

Visual: fresh skeletal structure with selected carbon having three C—C single bonds.

Prompt:

**How many hydrogens are implied on the selected carbon?**

Correct: **1**

Explain why:

Expected reasoning: three visible single bonds give bond order 3, so one H is needed to reach 4.

## BL-I3 — Heteroatom reading

Visual: fresh bond-line structure containing an explicitly written oxygen and an `O—H` group.

Prompt:

**How many carbons are represented, and which written atom is not carbon?**

Score both parts.

## BL-I4 — Multiple-bond hydrogen inference

Visual: fresh alkene skeleton with selected alkene carbon having one double bond and one single bond.

Prompt:

**How many hydrogens are implied on the selected carbon?**

Correct: **1**

## BL-I5 — Condensed to bond-line production

Prompt:

**Draw the bond-line structure for `CH3CH2CH(CH3)CH2CH3`.**

System checks connectivity, carbon count, and branch position.

## BL-I6 — Bond-line back to explicit/condensed reasoning

Visual: fresh five-carbon branched bond-line structure.

Prompt:

**Write a correct condensed formula for this structure.**

This confirms the learner can recover information from the shorthand rather than only draw a familiar zig-zag.

---

# 11. INDEPENDENT EVIDENCE RULE

The lesson records **Independent evidence** when the learner completes a cold fresh item correctly without support.

Do not display `Mastered` after one correct answer.

To satisfy the shared mastery rule for this skill, the engine must eventually record:

1. at least one cold independent success,
2. a correct-shaped explanation of why,
3. a second different cold success after a meaningful interval.

Recommended coverage before calling the skill ready for Test 1 mixed practice:

- one carbon-count/read item,
- one implied-hydrogen item,
- one translation/production item,
- at least one explanation response,
- later fresh retrieval.

If the system already has compatible cold evidence for one subskill, it should not force unnecessary repetition.

---

# 12. EXPLAIN-WHY PROMPTS

Use short prompts tied to the exact decision.

Accept semantically correct learner language; do not require memorized wording.

## Role-preserving explanation rule

Every explanation in this lesson must be graded as a set of **relationships/propositions**, not as a bag of expected words.

A response passes when it expresses the required relationship in correct learner language, even if it uses synonyms or a different sentence order. A response fails if it attaches the correct terms to the wrong roles, reverses cause and effect, or contradicts a required relationship, even when every expected keyword is present.

**Implementation guard:** a keyword-only, unordered token, or "contains all required words" grader is not allowed for these prompts.

Examples:

### E-W1

**Why does a three-segment unbranched bond-line chain contain four carbons instead of three?**

Required propositions:
1. The three visible segments/lines are **bonds or connections**, not three carbon atoms.
2. Carbon positions occur at **both line ends and the vertices/corners**.
3. In the shown three-segment unbranched chain, those positions total **four carbons**.

Acceptable learner language:
- "The three lines are the bonds. The carbons are the two ends and the two corners, so there are four."

Wrong-but-keyword-complete response that must fail:
- "The vertices are bonds, and the three line segments plus an end are the four carbons."

Why it fails: it reverses the roles of vertices and bond segments even though it contains `vertices`, `bonds`, `segments`, and `carbons`.

### E-W2

**Why is the selected internal carbon CH2 even though no H labels are drawn?**

Required propositions:
1. The selected carbon already has **two visible C—C single bonds**, giving visible bond order 2.
2. The neutral carbon pattern used here requires a total bond order of **four**.
3. Therefore **two C—H bonds are implied**, making that carbon CH2.

Acceptable learner language:
- "It already has two single bonds to carbons, so it needs two more bonds to reach four. Those two are hidden C-H bonds."

Wrong-but-keyword-complete response that must fail:
- "The two hidden hydrogens give the carbon its two visible C-C bonds, and those visible bonds are what get implied to reach four."

Why it fails: it reverses what is visible versus implied and reverses the causal bookkeeping relationship.

### E-W3

**Why do we write O explicitly but usually omit C labels at ordinary line ends and vertices?**

Required propositions:
1. An **unlabeled line end or vertex defaults to carbon** in the bond-line notation used here.
2. Oxygen is a **heteroatom** and must be shown with its element symbol `O` so the drawing identifies oxygen rather than carbon.

Acceptable learner language:
- "An unlabeled end or corner already means carbon, but oxygen is different, so O has to be written."

Wrong-but-keyword-complete response that must fail:
- "Oxygen is the default atom at unlabeled vertices, while carbon has to be explicitly labeled C."

Why it fails: it assigns the default unlabeled role to oxygen and the explicit-label role to carbon, exactly reversing the chemistry.

A vague response such as "because that's the rule" is not correct-shaped evidence.

If a response contains one correct proposition and one contradictory proposition, it does not pass merely because the correct proposition is present. The contradiction must be resolved on a fresh explanation prompt before explanation evidence is recorded.

---

# 13. TRANSFER TASK

Use a problem that looks different from the teaching examples.

## Transfer BL-T1

Prompt:

**A classmate says this bond-line structure has only four atoms because she sees four corners. Without redrawing the whole molecule, explain what she is missing and determine the actual number of carbon atoms.**

Visual must include both line ends plus several vertices so the learner must mention both.

Required output:
- correct carbon count,
- explanation that line ends also represent carbon,
- no counting of bond centers as carbon.

If helped or wrong, repair and later use fresh Transfer BL-T2 rather than repeating T1.

## Transfer BL-T2

Prompt:

**A selected carbon in a bond-line structure has one double bond and two single bonds. How many hydrogens can be attached to that carbon in the neutral structure? Explain.**

Correct: **0**

Reason: bond order 2 + 1 + 1 = 4 already.

---

# 14. LATER RETRIEVAL

Same-session retrieval should occur after at least one different lesson or meaningful activity intervenes.

Example return item:

Show a fresh bond-line structure with:
- one branch,
- one heteroatom,
- no structure previously seen in the lesson.

Ask only two questions:
1. total carbon count,
2. implied H count on one selected carbon.

If both are clean and explanation evidence already exists, this can satisfy the second-cold-item component of mastery.

Do not reopen the full beginner lesson if she passes the retrieval.

---

# 15. ADAPTIVE TEST-OUT PATH

Beginner-first does not mean forced beginner instruction.

Before full teaching, a learner may receive a 3-item cold probe:

1. count carbons in a simple bond-line structure,
2. infer H on a selected carbon,
3. translate one simple condensed structure to bond-line form.

### 3/3 clean

Skip full Teach/Watch. Give one later light confirmation.

### 2/3

Teach only the failed subskill, then fresh verification.

### 0-1/3

Run the full lesson in this file.

Any hint or help makes a probe item non-clean.

---

# 16. ACCESSIBILITY + PHONE/IPAD REQUIREMENTS

1. Carbon positions cannot be distinguished by color alone; use numbered markers, outlines, labels, or shape changes too.
2. Every visual transformation requires equivalent text describing what changed.
3. Reduced-motion mode must replace animation with discrete before/after states, not remove the instructional transformation.
4. Tap targets for line ends and vertices must be larger than the drawn atom position while preserving unambiguous selection.
5. Bond-center taps must give a specific response instead of silently failing.
6. Portrait mode must show the full molecule without horizontal scrolling for ordinary lesson examples.
7. Landscape mode may enlarge the molecule but must preserve controls and narration.
8. `Back`, `Replay`, `Pause`, and `Next` must stay reachable without covering the molecule.
9. Voice narration is optional support; all content must remain understandable with sound off.
10. The lesson must preserve the return destination when entered from Test 1 support.

---

# 17. CHEMISTRY TOOLBOX RULES FOR THIS LESSON

During Teach, Watch, Build Together, and Guided, the toolbox may show:

- carbon's common neutral four-bond pattern,
- bond-order reminder: single 1, double 2, triple 3,
- periodic table if learner opens it.

The periodic table is not necessary to complete the ordinary bond-line tasks, so the lesson should not force the learner to open it.

During cold independent evidence, the toolbox is hidden unless the assessment configuration explicitly permits references.

Opening the toolbox during a supported phase does not create mastery evidence. Opening a disallowed support tool during a cold item converts that item to supported practice.

---

# 18. IMPLEMENTATION EVENT CONTRACT

The eventual runtime should emit enough information for the shared student model to know what happened.

Suggested events:

- `BONDLINE_PREREQ_PASS`
- `BONDLINE_PREREQ_REPAIR`
- `BONDLINE_WATCH_COMPLETE`
- `BONDLINE_PREDICTION_RESPONSE`
- `BONDLINE_BUILD_TOGETHER_SUCCESS`
- `BONDLINE_GUIDED_SUCCESS`
- `BONDLINE_MISCONCEPTION` with code
- `BONDLINE_REPRESENTATION_SWITCH`
- `BONDLINE_INDEPENDENT_ATTEMPT`
- `BONDLINE_INDEPENDENT_SUCCESS`
- `BONDLINE_EXPLAIN_WHY_RESULT`
- `BONDLINE_TRANSFER_RESULT`
- `BONDLINE_RETRIEVAL_RESULT`

Suggested misconception codes:

- `LINES_AS_CARBONS`
- `MISSED_LINE_END`
- `HYDROGENS_TREATED_AS_GONE`
- `HETEROATOM_HIDDEN`
- `NEIGHBORS_NOT_BOND_ORDER`
- `BRANCH_CONNECTIVITY_ERROR`

The content layer reports these outcomes. It does not declare mastery on its own.

---

# 19. BEGINNER-CLARITY RELEASE GATE

Before implementation, an auditor must answer YES to all of these:

1. Can the learner understand the opening without already knowing `vertex`, `heteroatom`, or `implied hydrogen`?
2. Does the lesson visibly transform a fully written molecule into bond-line shorthand one change at a time?
3. Does the learner do something with the information before independent recall?
4. Is the difference between bond segments and carbon positions made explicit?
5. Are both line ends and vertices taught as carbon positions?
6. Is implied hydrogen reasoning derived from visible bond order rather than memorized CH3/CH2 patterns alone?
7. Are heteroatoms handled without teaching the false rule that all element labels disappear?
8. Are double/triple bonds preserved and connected to hydrogen inference?
9. Does Build Together start from blank?
10. Does Guided use a different structure from Watch and Build Together?
11. Are misconception repairs visual or interactive rather than verbal repetition?
12. Does every IDK route return to a fresh item afterward?
13. Is independent evidence fully uncontaminated by support?
14. Is mastery kept separate from one-time independent success?
15. Can the learner translate in both directions, not merely count carbons?
16. Does reduced-motion mode preserve the instructional transformation?
17. Can the entire flow be operated comfortably on a phone/iPad?
18. Are explanation graders defined by role-preserving propositions so a keyword-complete reversal cannot pass?

Any NO blocks production.

---

# 20. DEFINITION OF DONE FOR U1-01

The lesson is successful when a beginner can look at a new bond-line structure and say, in her own reasoning:

- where each carbon is,
- why a line is a bond rather than an atom,
- how many hydrogens are hidden on a selected carbon,
- why O/N/halogen labels remain visible,
- how the shorthand maps back to a real molecular structure,

and can then complete a fresh translation problem without the teaching screen.

The standard is not:

> "She watched a zig-zag appear."

The standard is:

> **"She now understands what every part of that zig-zag stands for and can reconstruct the chemistry from it."**
