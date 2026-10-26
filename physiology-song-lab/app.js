"use strict";
(function(){
const songs=window.ASTARRYIA_PHYSIOLOGY_SONGS||[];
const byId=(id)=>document.getElementById(id);
const list=byId("songList"), title=byId("songTitle"), systemTag=byId("systemTag"), hook=byId("memoryHook");
const lyrics=byId("songLyrics"), style=byId("songStyle"), player=byId("player"), empty=byId("audioEmpty"), audioStatus=byId("audioStatus"), remove=byId("removeAudio");
let active=songs[0]||null;
let selected={};
let currentUrl=null;
const DB_NAME="astarryia-physiology-music-v1";
const DB_STORE="tracks";
let dbPromise=null;
function db(){
 if(!("indexedDB" in window))return Promise.resolve(null);
 if(!dbPromise)dbPromise=new Promise(resolve=>{
  try{
   const req=indexedDB.open(DB_NAME,1);
   req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(DB_STORE))req.result.createObjectStore(DB_STORE,{keyPath:"id"});};
   req.onsuccess=()=>resolve(req.result);
   req.onerror=()=>resolve(null);
   req.onblocked=()=>resolve(null);
  }catch(_){resolve(null);}
 });
 return dbPromise;
}
async function trackGet(id){
 const database=await db();if(!database)return null;
 return new Promise(resolve=>{try{const req=database.transaction(DB_STORE,"readonly").objectStore(DB_STORE).get(id);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>resolve(null);}catch(_){resolve(null);}});
}
async function trackPut(id,blob,name){
 const database=await db();if(!database)return false;
 return new Promise(resolve=>{try{const tx=database.transaction(DB_STORE,"readwrite");tx.objectStore(DB_STORE).put({id,blob,name});tx.oncomplete=()=>resolve(true);tx.onerror=()=>resolve(false);tx.onabort=()=>resolve(false);}catch(_){resolve(false);}});
}
async function trackRemove(id){
 const database=await db();if(!database)return;
 return new Promise(resolve=>{try{const tx=database.transaction(DB_STORE,"readwrite");tx.objectStore(DB_STORE).delete(id);tx.oncomplete=()=>resolve();tx.onerror=()=>resolve();}catch(_){resolve();}});
}
function removeUrl(){
 player.pause();player.removeAttribute("src");player.load();
 if(currentUrl)URL.revokeObjectURL(currentUrl);
 currentUrl=null;player.hidden=true;
}
function setAudio(blob,name){
 removeUrl();currentUrl=URL.createObjectURL(blob);
 player.src=currentUrl;player.hidden=false;empty.hidden=true;remove.disabled=false;
 audioStatus.textContent="Loaded: "+name;
}
async function loadAudio(song){
 removeUrl();remove.disabled=true;empty.hidden=false;
 audioStatus.textContent="Checking for an imported audio track…";
 const expectedId=song.id;
 const track=await trackGet(expectedId);
 if(active?.id!==expectedId)return;
 if(track&&track.blob){setAudio(track.blob,track.name||"Local audio");return;}
 if(song.audioFile){
  player.src=song.audioFile;player.hidden=false;empty.hidden=true;
  audioStatus.textContent="Shared track available for playback.";remove.disabled=true;return;
 }
 audioStatus.textContent="No audio saved for this song yet.";
}
function makeButton(text,cls,cb){
 const b=document.createElement("button");b.type="button";b.textContent=text;b.className=cls;b.addEventListener("click",cb);return b;
}
function renderQuiz(){
 const wrap=byId("quiz");wrap.replaceChildren();
 active.quiz.forEach((q,idx)=>{
  const box=document.createElement("div");box.className="quizitem";
  const h=document.createElement("h4");h.textContent=(idx+1)+". "+q.q;box.append(h);
  const choices=document.createElement("div");choices.className="choices";box.append(choices);
  const feedback=document.createElement("p");feedback.className="feedback";feedback.hidden=true;feedback.setAttribute("role","status");
  q.options.forEach((answer,n)=>{
   const b=makeButton(answer,"choice",()=>{
    selected[idx]=n;
    Array.from(choices.children).forEach((el,i)=>{el.classList.toggle("correct",i===q.answer);el.classList.toggle("incorrect",i===n&&n!==q.answer);el.setAttribute("aria-pressed",String(i===n));});
    feedback.hidden=false;feedback.textContent=(n===q.answer?"Correct. ":"Not quite. ")+q.why;
    renderScore();
   });b.setAttribute("aria-pressed","false");choices.append(b);
  });
  box.append(feedback);wrap.append(box);
 });
 renderScore();
}
function renderScore(){
 byId("score").textContent=active.quiz.filter((q,i)=>selected[i]===q.answer).length+" / "+active.quiz.length;
}
function choose(id){
 const found=songs.find(s=>s.id===id);if(!found)return;
 active=found;selected={};
 title.textContent=found.title;systemTag.textContent=found.system;hook.textContent="Remember: "+found.hook;
 lyrics.textContent=found.lyrics;style.textContent=found.style;
 list.querySelectorAll("button").forEach(b=>b.setAttribute("aria-current",String(b.dataset.song===id)));
 byId("copyStatus").textContent="";
 renderQuiz();loadAudio(found);
}
async function copy(text,part){
 try{await navigator.clipboard.writeText(text);byId("copyStatus").textContent=part+" copied. Paste it into Suno Custom mode.";}
 catch(e){byId("copyStatus").textContent="Clipboard unavailable. Select and copy the "+part.toLowerCase()+" above.";}
}
list.replaceChildren();
songs.forEach((s,i)=>{
 const b=document.createElement("button");b.className="song";b.type="button";b.dataset.song=s.id;
 const index=document.createElement("span");index.className="song-index";index.textContent=String(i+1).padStart(2,"0");
 const meta=document.createElement("span");const strong=document.createElement("strong");strong.textContent=s.title;
 const small=document.createElement("small");small.textContent=s.system;meta.append(strong,small);b.append(index,meta);
 b.addEventListener("click",()=>choose(s.id));list.append(b);
});
byId("copyLyrics").addEventListener("click",()=>{if(active)copy(active.lyrics,"Lyrics");});
byId("copyStyle").addEventListener("click",()=>{if(active)copy(active.style,"Style");});
byId("resetQuiz").textContent="Retry without looking at lyrics";
byId("resetQuiz").addEventListener("click",()=>{selected={};renderQuiz();});
byId("audioFile").addEventListener("change",async e=>{
 const file=e.target.files?.[0];e.target.value="";
 if(!file||!active)return;
 const id=active.id;
 if(!/\.(mp3|wav)$/i.test(file.name) && !/^(audio\/mpeg|audio\/wav|audio\/x-wav)$/.test(file.type)){
  audioStatus.textContent="Please choose an MP3 or WAV audio file.";return;
 }
 if(file.size>25*1024*1024){audioStatus.textContent="This file is over 25 MB. Choose a smaller MP3 or WAV.";return;}
 audioStatus.textContent="Saving audio locally…";
 const saved=await trackPut(id,file,file.name);
 if(active?.id!==id)return;
 setAudio(file,file.name);
 if(!saved)audioStatus.textContent="Loaded for this session. Your browser could not permanently save this file. Keep the original MP3.";
});
remove.addEventListener("click",async ()=>{
 if(!active)return;const id=active.id;await trackRemove(id);if(active?.id===id)loadAudio(active);
});
if(active)choose(active.id);
else{title.textContent="Songs unavailable";audioStatus.textContent="Try refreshing the page.";}
})();