# Notebook + Review Queue implementation

Implements Sections 12 and 13 of `DR_MERISSA_TEACHING_ENGINE_SPEC.md` as pure logic before UI integration.

## Locked behaviors

- Notebook facts are written at TEACH/WATCH time, not after mastery.
- Notebook is available at scaffold levels 4 through 1 and unavailable at cold level 0.
- Duplicate fact IDs do not create duplicate entries.
- Skip marks the skill DEVELOPING and schedules same-session review.
- Two IDKs on the same item type schedule same-session review.
- Review returns use a fresh item and exclude the source/recently seen items.
- Skills that end a session short of INDEPENDENT_SUCCESS are marked DEVELOPING and queued first for the next session.
- No spaced-repetition algorithm is introduced in Day 1.
