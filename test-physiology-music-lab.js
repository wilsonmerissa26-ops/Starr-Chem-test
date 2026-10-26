"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const root=path.join(__dirname,"physiology-song-lab");
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,"songs.js"),"utf8"),sandbox);
const songs=sandbox.window.ASTARRYIA_PHYSIOLOGY_SONGS;
assert.equal(songs.length,10,"Expected ten study songs");
assert.equal(new Set(songs.map(s=>s.id)).size,10,"IDs must be unique");
let total=0;
for(const song of songs){
 assert.match(song.id,/^[a-z0-9-]+$/,"Safe song ID");
 assert.ok(song.title&&song.system&&song.hook&&song.style);
 assert.match(song.lyrics,/\[Chorus\]/);
 assert.match(song.lyrics,/\[Verse 1\]/);
 assert.ok(song.lyrics.split("\n").length>=16,"Song is complete");
 assert.equal(song.quiz.length,2,"Two questions per song");
 for(const item of song.quiz){
  assert.ok(item.q&&item.why);
  assert.ok(item.options.length>=3);
  assert.ok(Number.isInteger(item.answer)&&item.answer>=0&&item.answer<item.options.length);
  total++;
 }
}
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
for(const anchor of ["songList","songLyrics","copyLyrics","copyStyle","audioFile","player","quiz","songs.js","app.js"]){
 assert.ok(html.includes(anchor),"Missing UI hook "+anchor);
}
const app=fs.readFileSync(path.join(root,"app.js"),"utf8");
assert.match(app,/indexedDB/);
assert.match(app,/createObjectURL/);
const courseHub=fs.readFileSync(path.join(__dirname,"course-hub","index.html"),"utf8");
assert.match(courseHub,/\.\.\/physiology-song-lab\//);
console.log("Physiology Music Lab: "+songs.length+" songs, "+total+" questions; site links and player hooks verified.");
