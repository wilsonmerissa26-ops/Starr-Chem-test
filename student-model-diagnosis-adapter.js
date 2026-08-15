/* Backward-compatible Student Model adapter for reasoning diagnosis evidence. */
function ensureDiagnosisFields(skill){
  if(!skill || typeof skill!=="object") throw new Error("skill object required");
  if(!Array.isArray(skill.diagnosticRecords)) skill.diagnosticRecords=[];
  if(!skill.reasoningProfile || typeof skill.reasoningProfile!=="object") skill.reasoningProfile={};
  return skill;
}

function recordDiagnosticEvidence(skill, record){
  ensureDiagnosisFields(skill);
  var clean={
    itemId:record.itemId||null,
    rawResponse:record.rawResponse==null?null:record.rawResponse,
    candidateHypotheses:Array.isArray(record.candidateHypotheses)?record.candidateHypotheses.slice():[],
    confirmedReasoningStep:record.confirmedReasoningStep||null,
    errorCode:record.errorCode||null,
    diagnosticProbe:record.diagnosticProbe||null,
    diagnosticProbeResponse:record.diagnosticProbeResponse==null?null:record.diagnosticProbeResponse,
    representationHistory:Array.isArray(record.representationHistory)?record.representationHistory.slice():[],
    repairCheckResult:record.repairCheckResult==null?null:!!record.repairCheckResult,
    transferResult:record.transferResult||null,
    timestamp:record.timestamp||Date.now()
  };
  skill.diagnosticRecords.push(clean);
  if(skill.diagnosticRecords.length>100) skill.diagnosticRecords=skill.diagnosticRecords.slice(-100);
  if(clean.confirmedReasoningStep){
    var p=skill.reasoningProfile[clean.confirmedReasoningStep]||{observations:0,repairsPassed:0,transfersPassed:0,lastSeen:null,lastErrorCode:null};
    p.observations++;
    if(clean.repairCheckResult===true) p.repairsPassed++;
    if(clean.transferResult && clean.transferResult.correct===true) p.transfersPassed++;
    p.lastSeen=clean.timestamp;
    p.lastErrorCode=clean.errorCode;
    skill.reasoningProfile[clean.confirmedReasoningStep]=p;
  }
  return clean;
}

function hasCurrentEvidence(skill,reasoningStep){
  ensureDiagnosisFields(skill);
  var p=skill.reasoningProfile[reasoningStep];
  return !!(p && p.transfersPassed>0);
}

function choosePrerequisitesToReteach(skill,prerequisites){
  ensureDiagnosisFields(skill);
  return (prerequisites||[]).filter(function(id){return !hasCurrentEvidence(skill,id);});
}

module.exports={ensureDiagnosisFields:ensureDiagnosisFields,recordDiagnosticEvidence:recordDiagnosticEvidence,hasCurrentEvidence:hasCurrentEvidence,choosePrerequisitesToReteach:choosePrerequisitesToReteach};
