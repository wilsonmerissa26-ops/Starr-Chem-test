(function(){'use strict';
function normalize(s){return String(s)
 .replace(/H₂O|H2O/g,'H two O').replace(/NH₃|NH3/g,'N H three')
 .replace(/CH₄|CH4/g,'C H four').replace(/H₂S|H2S/g,'H two S')
 .replace(/PH₃|PH3/g,'P H three').replace(/SiH₄|SiH4/g,'silicon H four')
 .replace(/e⁻/g,' electrons ').replace(/\bmmol\b/g,' millimoles ')
 .replace(/\bmol\b/g,' moles ').replace(/\bmcg\b/g,' micrograms ')
 .replace(/\bmg\b/g,' milligrams ').replace(/\bmL\b/g,' milliliters ')
 .replace(/\bL\b/g,' liters ').replace(/\bg\b/g,' grams ')
 .replace(/10\^\(?[−-](\d+)\)?/g,'ten to the negative $1 power')
 .replace(/10\^\(?(\d+)\)?/g,'ten to the $1 power')
 .replace(/%/g,' percent ').replace(/×/g,' times ').replace(/÷/g,' divided by ')
 .replace(/−/g,' minus ').replace(/≈/g,' approximately ')
 .replace(/→|↔/g,' converts to ').replace(/\bpKa\b/gi,'p K a')
 .replace(/\n+/g,'. ').replace(/\s+/g,' ').trim();}
window.DrMerissaVoice={normalize:normalize,defaultRate:.82};
if(!window.speechSynthesis||!window.speechSynthesis.speak)return;
var nativeSpeak=window.speechSynthesis.speak.bind(window.speechSynthesis);
window.speechSynthesis.speak=function(utterance){
 var spoken=new SpeechSynthesisUtterance(normalize(utterance&&utterance.text||''));
 spoken.rate=Math.min((utterance&&utterance.rate)||.82,.82);
 spoken.pitch=utterance&&utterance.pitch||1;
 spoken.volume=utterance&&utterance.volume==null?1:utterance.volume;
 return nativeSpeak(spoken);
};
})();
