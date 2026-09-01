(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.Test1AdaptivePolicy=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){'use strict';var P=Object.freeze({
'hybridization':{minClean:2,coverage:{non_sp3:['HY-I2','HY-I3','HY-I4']}},
'functional-ir':{minClean:2,coverage:{spectrum_interpretation:['IR-I1','IR-I2','IR-I3']}},
'imf-boiling':{minClean:2,coverage:{boiling_reasoning:['IM-I2','IM-I3'],force_identification:['IM-I1','IM-I4']}},
'alkane-isomers':{minClean:2,coverage:{connectivity:['AI-I2','AI-I3','AI-I4']}},
'nomenclature':{minClean:2,coverage:{full_name:['NM-I1','NM-I2','NM-I3','NM-I4']}},
'relationships':{minClean:2,coverage:{stereochemical_comparison:['RL-I2','RL-I3'],connectivity_comparison:['RL-I1','RL-I4']}},
'newman-energy':{minClean:2,coverage:{conformation_stability:['NW-I1','NW-I2','NW-I3'],energy_profile:['NW-I3','NW-I4']}},
'ring-strain':{minClean:2,coverage:{strain_explanation:['RS-I1','RS-I4'],strain_source:['RS-I2','RS-I3']}},
'cyclohexane-chairs':{minClean:2,coverage:{ring_flip:['CH-I1','CH-I2'],chair_stability:['CH-I3','CH-I4']}}
});function forLesson(id){return P[id]||{minClean:2,coverage:{}};}function status(id,cleanIds){var p=forLesson(id),ids=Array.from(new Set(cleanIds||[])),covered={},missing=[];Object.keys(p.coverage).forEach(function(k){var hit=p.coverage[k].some(function(itemId){return ids.indexOf(itemId)!==-1;});covered[k]=hit;if(!hit)missing.push(k);});return{ready:ids.length>=p.minClean&&missing.length===0,cleanCount:ids.length,minClean:p.minClean,covered:covered,missing:missing,requirements:Object.keys(p.coverage)};}function eligible(id,requirement){var p=forLesson(id);return(p.coverage[requirement]||[]).slice();}return Object.freeze({POLICIES:P,forLesson:forLesson,status:status,eligible:eligible});});