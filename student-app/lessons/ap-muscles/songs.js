/* Merissa's study songs for the A&P muscle lessons.
 *
 * To add a song:
 *   1. Put the audio file (mp3 or m4a) in student-app/lessons/ap-muscles/songs/.
 *   2. Add one entry below. "set" is "head" or "trunk"; "muscles" lists the muscle keys the song covers
 *      (optional; used for the label); "lyrics" is optional text shown under the player.
 *
 * Songs appear at the top of the "Learn the muscles" step for their set. Playing a song is recorded as
 * learning only. It never counts as evidence that she can identify a muscle.
 *
 * Example:
 *   { id: "head-neck-1", set: "head", title: "Face and Jaw", src: "songs/face-and-jaw.mp3",
 *     muscles: ["orbicularis-oculi", "orbicularis-oris", "masseter"], lyrics: "" },
 */
window.StudySongs = [
];
