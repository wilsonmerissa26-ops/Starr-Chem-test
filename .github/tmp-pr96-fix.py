from pathlib import Path

def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly 1 match, found {count}")
    return text.replace(old, new, 1)

engine = Path('course-units/unit1/test1/test1-engine.js')
s = engine.read_text()

s = replace_once(
    s,
    "function explanationGrade(cfg,text){var t=norm(text);if(!t||t.length<24)return{correct:false,reason:'too_short'};var ok=(cfg.requiredGroups||[]).every(function(group){return group.some(function(term){return t.indexOf(norm(term))!==-1;});});return{correct:ok,reason:ok?null:'missing_reasoning_component'};}",
    "function explanationGrade(cfg,text){var t=norm(text),words=t.split(/\\s+/).filter(Boolean);if(!t||t.length<32||words.length<8)return{correct:false,reason:'too_short'};var ok=(cfg.requiredGroups||[]).every(function(group){return group.some(function(term){return t.indexOf(norm(term))!==-1;});});if(!ok)return{correct:false,reason:'missing_reasoning_component'};var causal=/\\b(because|therefore|since|so|so that|which means|means|due to|causes?|causing|leads? to|results? in|thus|hence|gives|corresponds? to|maps? to)\\b/.test(t),sequence=/\\b(first|start|begin)\\b/.test(t)&&/\\b(then|next|after|finally)\\b/.test(t),contrast=/\\b(while|whereas|but|rather than|instead|compared to|compared with)\\b/.test(t);if(!(causal||sequence||contrast))return{correct:false,reason:'missing_reasoning_link'};return{correct:true,reason:null};}",
    'explanation reasoning guard')

s = replace_once(
    s,
    "function transferBank(l){return l.transfer.length>1?l.transfer:l.transfer.concat(l.retrieval.length?[l.retrieval[0]]:[]);}",
    "function transferBank(l){return l.transfer;}",
    'transfer/retrieval isolation')

s = replace_once(
    s,
    "function submitProbe(s,a,at){if(s.phase!=='probe')return{accepted:false,reason:'wrong_phase'};var item=currentItem(s),g=grade(item,a);",
    "function submitProbe(s,a,at){if(s.phase!=='probe')return{accepted:false,reason:'wrong_phase'};var item=currentItem(s);if(s.supportedIssue)return{accepted:false,reason:'diagnosis_required',diagnosisRequired:true,errorCode:s.supportedIssue.errorCode,label:Support.label(s.supportedIssue.errorCode)};var g=grade(item,a);",
    'probe diagnosis bypass guard')

s = replace_once(
    s,
    "function submitWatchCheck(s,a,at){if(s.phase!=='watch')return{accepted:false,reason:'wrong_phase'};var step=lesson(s).watch[s.watchIndex],item=step&&step.check;if(!item)return{accepted:false,reason:'no_watch_check'};var g=grade(item,a);",
    "function submitWatchCheck(s,a,at){if(s.phase!=='watch')return{accepted:false,reason:'wrong_phase'};var step=lesson(s).watch[s.watchIndex],item=step&&step.check;if(!item)return{accepted:false,reason:'no_watch_check'};if(s.supportedIssue)return{accepted:false,reason:'diagnosis_required',diagnosisRequired:true,errorCode:s.supportedIssue.errorCode,label:Support.label(s.supportedIssue.errorCode)};var g=grade(item,a);",
    'watch diagnosis bypass guard')

s = replace_once(
    s,
    "function submitSupported(s,a,at){if(['concept','build','guided','transfer'].indexOf(s.phase)===-1)return{accepted:false,reason:'wrong_phase'};var item=currentItem(s),g=grade(item,a);",
    "function submitSupported(s,a,at){if(['concept','build','guided','transfer'].indexOf(s.phase)===-1)return{accepted:false,reason:'wrong_phase'};var item=currentItem(s);if(s.supportedIssue)return{accepted:false,reason:'diagnosis_required',diagnosisRequired:true,errorCode:s.supportedIssue.errorCode,label:Support.label(s.supportedIssue.errorCode)};var g=grade(item,a);",
    'supported diagnosis bypass guard')
engine.write_text(s)

prod = Path('course-units/unit1/test1/test1-engine-production.js')
p = prod.read_text()
p = replace_once(
    p,
    "api.submitSupported=function(s,answers,timestamp){if(s.phase!=='transfer')return Base.submitSupported(s,answers,timestamp);var l=lesson(s),item=api.currentItem(s);",
    "api.submitSupported=function(s,answers,timestamp){if(s.phase!=='transfer')return Base.submitSupported(s,answers,timestamp);if(s.supportedIssue)return{accepted:false,reason:'diagnosis_required',diagnosisRequired:true,errorCode:s.supportedIssue.errorCode};var l=lesson(s),item=api.currentItem(s);",
    'production transfer diagnosis bypass guard')
prod.write_text(p)

test = Path('test-unit1-test1-adaptive.js')
a = test.read_text()
marker = "console.log('\\n'+passed+' adaptive assertions passed');"
if a.count(marker) != 1:
    raise SystemExit('adaptive regression insertion marker missing/duplicate')
extra = r'''
let keywordOnly=E.explanationGrade(D.lesson('nomenclature').explanation,'longest number substituent name without any reasoning');
ok('Explain Why rejects a keyword list with no reasoning relationship',!keywordOnly.correct);
let linkedReasoning=E.explanationGrade(D.lesson('nomenclature').explanation,'First choose the longest parent chain, then number it to give the lowest locants, then identify each substituent and assemble the name.');
ok('Explain Why accepts connected step-by-step reasoning',linkedReasoning.correct);
let Base=require('./course-units/unit1/test1/test1-engine.js'),baseTransfer=Base.createSession('alkane-isomers',t);Base.setPhase(baseTransfer,'transfer');let baseTransferId=Base.currentItem(baseTransfer).id;baseTransfer.firstColdItemId='AI-I2';baseTransfer.firstColdAt=t;let baseTr=Base.submitSupported(baseTransfer,{a:'14'},t+500);
ok('base engine never exposes Later Retrieval during Transfer',baseTr.correct&&baseTransfer.phase==='activity'&&baseTransferId==='AI-T1');
let probeBypass=E.createSession('nomenclature',t);let probeWrong=E.submitProbe(probeBypass,{a:'4'},t+510),probeRetry=E.submitProbe(probeBypass,{a:'5'},t+511);
ok('pending diagnostic repair cannot be bypassed by correcting the old probe form',!probeWrong.correct&&!probeRetry.accepted&&probeRetry.reason==='diagnosis_required'&&probeBypass.probeIndex===0&&!!probeBypass.supportedIssue);
let conceptBypass=E.createSession('nomenclature',t);E.setPhase(conceptBypass,'concept');let conceptWrong=E.submitSupported(conceptBypass,{a:'butane'},t+520),conceptRetry=E.submitSupported(conceptBypass,{a:'pentane'},t+521);
ok('pending supported repair cannot be bypassed by correcting the old concept form',!conceptWrong.correct&&!conceptRetry.accepted&&conceptRetry.reason==='diagnosis_required'&&conceptBypass.conceptIndex===0&&!!conceptBypass.supportedIssue);
let transferBypass=E.createSession('alkane-isomers',t);E.setPhase(transferBypass,'transfer');let transferWrong=E.submitSupported(transferBypass,{a:'13'},t+530),transferRetry=E.submitSupported(transferBypass,{a:'14'},t+531);
ok('production Transfer also blocks direct retry while diagnosis is pending',!transferWrong.correct&&!transferRetry.accepted&&transferRetry.reason==='diagnosis_required'&&transferBypass.phase==='transfer'&&transferBypass.transferIndex===0&&!!transferBypass.supportedIssue);
'''
test.write_text(a.replace(marker, extra + marker, 1))
