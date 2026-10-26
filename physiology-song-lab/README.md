# AStarryia Physiology Music Lab

**Status:** Ten original lyric drafts and matching application checks are implemented as a companion to CHM 221, **not** mapped to the student's anatomy/physiology syllabus. The only currently verified Mercer syllabus in the project is CHM 221 Organic Chemistry. Do not imply the physiology order or exam emphasis has been verified.

## Where it lives

- [AStarryia Course Hub](../course-hub/) links to this module.
- [Music Lab](./index.html) displays the playlist, lyrics, Suno production prompts, MP3/WAV player, and 20 knowledge/application questions.
- The materials in `songs.js` are original and are separate from the CHM 221 chemistry learning/grade/mastery data. The check is an immediate study check, not independent mastery certification.

## Producing the actual music

1. On each track in the Music Lab, copy the **Production style** and the **Lyrics**.
2. Open https://suno.com/create and switch to custom lyrics mode. Paste both into their respective Suno fields; use the track title.
3. Generate, listen, and check all physiological phrases/pronunciations before exporting. Reuse/revise the prompt as needed.
4. Download an MP3 (download allowances depend on account plan). Keep the file named by slug, for example `homeostasis.mp3`.

**Music licensing:** The Suno free tier generally allows noncommercial personal use only. If this learning program may be sold, licensed, monetized, or offered in a commercial context, verify the plan and current license first and generate/download tracks on an appropriately licensed paid plan. Subscribing later does not automatically grant retroactive commercial rights to tracks created on the free plan. Independently written original lyrics are included here.

## Add one song for the current browser

The learner clicks **Import MP3 or WAV**. The selected file is stored in the browser's IndexedDB if supported, under the song slug, and played by the audio controls. This is **device/browser local only** (not a server upload, shared to phones, or a cloud backup). Files are size-limited to 25 MB.

## Publish MP3s for all students/devices

This needs a developer or site editor commit:
1. Put licensed MP3 files in `physiology-song-lab/audio/`. The intended filenames are each song's `id` plus `.mp3`.
2. For each song with published audio, add a field to the corresponding object in `songs.js`:
   `"audioFile": "audio/homeostasis.mp3"` (example for the homeostasis song).
3. Commit the change and publish the updated GitHub Pages site. The website will automatically use the shared audio when a local song has not been imported.

Do **not** embed Suno account credentials or API keys in this static site. A local upload should not be represented as a shared server upload.

## Course alignment follow-up

When the actual anatomy/physiology syllabus becomes available, align the playlist to chapters, remove/explain topics the course does not cover, add exam-relevant mechanisms, and check terms against the professor's instructional resources.

## Study method

Listen once with the lyrics, sing or speak the mechanism aloud, hide lyrics, answer the questions, and explain the full stimulus → response chain. Review what was missed later. A catchy song is not proof of independent mastery.
