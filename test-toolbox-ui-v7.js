var fs=require('fs');var s=fs.readFileSync('day1/toolbox-ui-v7.js','utf8');var p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}
ok('toolbox is closed by default',/removeAttribute\('open'\)/.test(s));
ok('toolbox is moved near top of math view',/insertBefore\(details,firstCard\)/.test(s));
ok('all six math areas have compact references',['Fractions & percentages','Algebra','Exponents','Scientific notation','Logs & estimation','Unit conversions'].every(function(x){return s.indexOf("'"+x+"':")>=0;}));
ok('reference uses one example language',s.indexOf('One example')>=0);
ok('reference identifies itself as reminder only',s.indexOf('reminder only')>=0);
ok('old percent toolbox is removed to prevent duplicate help',s.indexOf("[data-percent-toolbox]")>=0);
ok('chemistry gets its own closed subject toolbox',s.indexOf('data-chemistry-toolbox')>=0&&s.indexOf('🧪 Chemistry Toolbox')>=0&&!/data-chemistry-toolbox[^\n]*open/.test(s));
ok('chemistry toolbox is available on menu and iframe views',s.indexOf('Chemistry Foundation')>=0&&s.indexOf('iframe[title^="Chemistry"]')>=0);
ok('chemistry toolbox lists only current Lewis atoms and valence counts',['H','C','N','O','Si','P','S'].every(function(x){return s.indexOf("['"+x+"'")>=0;}));
ok('chemistry toolbox teaches count-center-bond-lone-pair build order',s.indexOf('Count total valence electrons')>=0&&s.indexOf('Hydrogen is never the center')>=0&&s.indexOf('Each single bond uses 2 electrons')>=0&&s.indexOf('remaining electrons as lone pairs')>=0);
ok('chemistry toolbox does not add unrelated pKa material yet',s.toLowerCase().indexOf('pka')<0);
console.log('\nToolbox UI v7: '+p+' passed, '+f+' failed');if(f)process.exit(1);