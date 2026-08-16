(function(){'use strict';
function install(frame){if(!frame||frame.dataset.talkthroughLoaded)return;frame.dataset.talkthroughLoaded='1';frame.addEventListener('load',function(){try{var d=frame.contentDocument;if(!d||d.getElementById('chemTalkthroughScript'))return;var s=d.createElement('script');s.id='chemTalkthroughScript';s.src='/Starr-Chem-test/chemistry-teacher-preview/chemistry-talkthrough.js';d.body.appendChild(s)}catch(e){}});try{if(frame.contentDocument&&frame.contentDocument.readyState==='complete'){var ev=new Event('load');frame.dispatchEvent(ev)}}catch(e){}}
function scan(){document.querySelectorAll('.iframeWrap iframe').forEach(install)}
new MutationObserver(scan).observe(document.getElementById('view'),{childList:true,subtree:true});scan();
})();