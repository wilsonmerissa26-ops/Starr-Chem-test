'use strict';
var cost = require('./math-strategy-cost.js');
var EPS = 1e-9;
function close(a,b){return Math.abs(a-b)<=EPS*Math.max(1,Math.abs(a),Math.abs(b));}
function step(id,prompt,expected,skills,hint){return{id:id,prompt:prompt,expected:expected,prerequisiteSkillIds:skills||[],hint:hint||''};}
function pctAnswer(p,w){return p*w/100;}
function decimalComplexity(values){return values.reduce(function(s,v){return s+cost.decimals(v);},0);}
function percentCandidate(id,p,w,answer,features,steps,copy){return{strategyId:id,answer:answer,valid:close(answer,pctAnswer(p,w)),features:features,steps:steps||[],concept:(copy&&copy.concept)||'Percent means parts per hundred.',mentalRoute:(copy&&copy.mentalRoute)||'',hint:(copy&&copy.hint)||''};}

function percentCandidates(problem){
  var p=problem.percent,w=problem.whole,ans=pctAnswer(p,w),out=[];
  var ten=w/10,one=w/100;

  if(close(p,1)) out.push(percentCandidate('percent_one',p,w,one,{operationCount:1,benchmarkBonus:1,divisionDifficulty:cost.divisionDifficulty(w,100),decimalComplexity:decimalComplexity([one])},[step('one','Find 1% of '+w+'.',one,['divide_by_100'],'1% is one hundredth.')],{mentalRoute:'1% is one hundredth.'}));
  if(close(p,10)) out.push(percentCandidate('percent_ten',p,w,ten,{operationCount:1,benchmarkBonus:1,divisionDifficulty:cost.divisionDifficulty(w,10),decimalComplexity:decimalComplexity([ten])},[step('ten','Find 10% of '+w+'.',ten,['divide_by_10'],'10% is one tenth.')],{mentalRoute:'10% is one tenth.'}));
  if(close(p,5)) {
    var directFive=ten/2;
    out.push(percentCandidate('percent_five',p,w,directFive,{operationCount:2,benchmarkBonus:2,divisionDifficulty:cost.divisionDifficulty(w,10),decimalComplexity:decimalComplexity([ten,directFive]),mentalLoad:1},[step('ten','Find 10% of '+w+'.',ten,['divide_by_10'],'10% is one tenth.'),step('five','Take half of '+ten+'.',directFive,['halving'],'5% is half of 10%.')],{mentalRoute:'Find 10%, then halve it.'}));
  }
  if(Number.isInteger(p)&&p>=20&&p<=90&&p%10===0&&!close(p,50)) {
    var tensCount=p/10,tensResult=ten*tensCount;
    out.push(percentCandidate('percent_'+p+'_from_10',p,w,tensResult,{operationCount:2,benchmarkBonus:1,divisionDifficulty:cost.divisionDifficulty(w,10),multiplicationDifficulty:cost.multiplicationDifficulty(ten,tensCount),decimalComplexity:decimalComplexity([ten,tensResult]),mentalLoad:1},[step('ten','Find 10% of '+w+'.',ten,['divide_by_10'],'10% is one tenth.'),step('scale','Build '+p+'% from '+tensCount+' ten-percent chunks.',tensResult,['multiply_by_small_whole'],'Scale the 10% chunk.')],{mentalRoute:p+'% is '+tensCount+' groups of 10%.'}));
  }
  if(close(p,50)) out.push(percentCandidate('percent_half',p,w,w/2,{operationCount:1,benchmarkBonus:1,divisionDifficulty:cost.divisionDifficulty(w,2)},[step('half','Find half of '+w+'.',w/2,['halving'],'50% means half.')],{mentalRoute:'50% is half.'}));
  if(close(p,25)) out.push(percentCandidate('percent_quarter',p,w,w/4,{operationCount:1,benchmarkBonus:1,divisionDifficulty:cost.divisionDifficulty(w,4)},[step('quarter','Find one fourth of '+w+'.',w/4,['quartering'],'25% means one fourth.')],{mentalRoute:'25% is one fourth.'}));
  if(close(p,12.5)) out.push(percentCandidate('percent_eighth',p,w,w/8,{operationCount:1,benchmarkBonus:1,divisionDifficulty:cost.divisionDifficulty(w,8)},[step('eighth','Find one eighth of '+w+'.',w/8,['eighths'],'12.5% is one eighth for this internal strategy test.')],{mentalRoute:'Use one eighth.'}));
  if(close(p,75)){
    var half=w/2,quarter=w/4;
    out.push(percentCandidate('percent_half_plus_quarter',p,w,half+quarter,{operationCount:3,benchmarkBonus:2,divisionDifficulty:cost.divisionDifficulty(w,2)+cost.divisionDifficulty(w,4),decimalComplexity:decimalComplexity([half,quarter]),mentalLoad:1},[step('half','What is 50% of '+w+'?',half,['halving'],'Take half.'),step('quarter','What is 25% of '+w+'?',quarter,['quartering'],'Take one fourth.'),step('combine','Combine 50% and 25%.',half+quarter,['add_friendly_chunks'],'Add the two friendly parts.')],{mentalRoute:'75% = 50% + 25%.'}));
  }
  if(close(p,15)){
    var five=ten/2;
    out.push(percentCandidate('percent_10_plus_5',p,w,ten+five,{operationCount:3,benchmarkBonus:2,divisionDifficulty:cost.divisionDifficulty(w,10),decimalComplexity:decimalComplexity([ten,five]),mentalLoad:1},[step('ten','What is 10% of '+w+'?',ten,['divide_by_10'],'10% is one tenth.'),step('five','What is half of '+ten+'?',five,['halving'],'5% is half of 10%.'),step('combine','Combine 10% and 5%.',ten+five,['add_friendly_chunks'],'Add the two parts.')],{mentalRoute:'15% = 10% + 5%.'}));
  }

  var near10=Math.round(p/10)*10;
  if(near10>=10&&near10<=90&&!close(near10,p)){
    var diff=p-near10,absDiff=Math.abs(diff);
    if(absDiff<=4.0000001){
      var anchor=ten*(near10/10),corr=one*absDiff,result=diff>0?anchor+corr:anchor-corr;
      var id='percent_'+near10+'_'+(diff>0?'plus':'minus')+'_'+absDiff;
      out.push(percentCandidate(id,p,w,result,{operationCount:5,anchorAcquisition:0.1,divisionDifficulty:cost.divisionDifficulty(w,10)+cost.divisionDifficulty(w,100),multiplicationDifficulty:cost.multiplicationDifficulty(ten,near10/10)+cost.multiplicationDifficulty(one,absDiff),decimalComplexity:decimalComplexity([ten,one,anchor,corr]),mentalLoad:2,compensationComplexity:diff<0?1:0.7},[step('ten','Find 10% of '+w+'.',ten,['divide_by_10'],'Use the 10% anchor.'),step('anchor','Build '+near10+'% from 10%.',anchor,['multiply_by_small_whole'],'Scale the 10% chunk.'),step('one','Find 1% of '+w+'.',one,['divide_by_100'],'Use the 1% correction chunk.'),step('correction','Build '+absDiff+'% from 1%.',corr,['multiply_by_small_whole'],'Make the small correction.'),step('adjust',(diff>0?'Add':'Subtract')+' the correction.',result,[diff>0?'add_friendly_chunks':'subtract_friendly_chunks'],'Adjust from the nearby ten.')],{mentalRoute:p+'% = '+near10+'% '+(diff>0?'+ ':'- ')+absDiff+'%.'}));
    }
  }

  if(Number.isInteger(p)&&p>0){
    var oneScaled=one*p;
    out.push(percentCandidate('percent_1_then_scale',p,w,oneScaled,{operationCount:2,divisionDifficulty:cost.divisionDifficulty(w,100),multiplicationDifficulty:cost.multiplicationDifficulty(one,p),decimalComplexity:decimalComplexity([one,oneScaled]),mentalLoad:1,routeOverhead:(Number.isInteger(one)?1.15:3.0)+Math.max(0,4-Math.abs(p-Math.round(p/10)*10))*0.55},[step('one','Find 1% of '+w+'.',one,['divide_by_100'],'1% is one hundredth.'),step('scale','Scale that 1% chunk to '+p+'%.',oneScaled,['multiply_by_small_whole'],'Use the clean 1% chunk.')],{mentalRoute:'Find 1%, then scale it to '+p+'%.'}));
  }

  var complement=100-p;
  if(p<100&&complement>0&&complement<=20&&Number.isInteger(complement)){
    var tensPart=Math.floor(complement/10)*10,onesPart=complement-tensPart;
    if(tensPart>0&&onesPart>0){
      var tensValue=ten*(tensPart/10),onesValue=one*onesPart,freeResult=w-tensValue-onesValue;
      out.push(percentCandidate('percent_100_minus_'+tensPart+'_minus_'+onesPart,p,w,freeResult,{operationCount:5,anchorAcquisition:0,divisionDifficulty:cost.divisionDifficulty(w,10)+cost.divisionDifficulty(w,100),multiplicationDifficulty:cost.multiplicationDifficulty(ten,tensPart/10)+cost.multiplicationDifficulty(one,onesPart),decimalComplexity:decimalComplexity([ten,one,tensValue,onesValue]),mentalLoad:2,compensationComplexity:1.3,routeOverhead:0.6},[step('whole','Start from 100%: '+w+'.',w,[],'100% is the whole.'),step('tens','Find '+tensPart+'% to remove.',tensValue,['divide_by_10','multiply_by_small_whole'],'Build the tens correction.'),step('ones','Find '+onesPart+'% to remove.',onesValue,['divide_by_100','multiply_by_small_whole'],'Build the small correction.'),step('subtract_tens','Subtract '+tensPart+'%.',w-tensValue,['subtract_friendly_chunks'],'Subtract from the free 100% anchor.'),step('subtract_ones','Subtract the remaining '+onesPart+'%.',freeResult,['subtract_friendly_chunks'],'Finish the correction.')],{mentalRoute:p+'% = 100% - '+tensPart+'% - '+onesPart+'%.'}));
    }
  }

  out.push(percentCandidate('percent_formal_decimal',p,w,(p/100)*w,{operationCount:2,divisionDifficulty:cost.divisionDifficulty(p,100),multiplicationDifficulty:cost.multiplicationDifficulty(p/100,w),decimalComplexity:decimalComplexity([p/100,ans]),mentalLoad:1,routeOverhead:1.5},[step('decimal','Convert '+p+'% to '+(p/100)+'.',p/100,['place_value_decimal_shift'],'Percent means divide by 100.'),step('multiply','Multiply by '+w+'.',ans,['multiply_by_small_whole'],'Now multiply the decimal by the whole.')],{mentalRoute:'Convert percent to a decimal and multiply.'}));
  return out;
}

function fractionCandidates(problem){
  var n=problem.numerator,d=problem.denominator,w=problem.whole,ans=n*w/d,out=[];
  var labels={2:'halves',4:'quarters',5:'fifths',8:'eighths',10:'tenths'};
  if(labels[d]){
    var unit=w/d,result=unit*n;
    out.push({strategyId:'fraction_'+labels[d],answer:result,valid:close(result,ans),features:{operationCount:n===1?1:2,benchmarkBonus:1,divisionDifficulty:cost.divisionDifficulty(w,d),multiplicationDifficulty:n===1?0:cost.multiplicationDifficulty(unit,n),decimalComplexity:decimalComplexity([unit,result]),mentalLoad:1},steps:[step('unit','Find 1/'+d+' of '+w+'.',unit,[labels[d]],'Divide the whole into '+d+' equal parts.'),step('scale','Take '+n+' of those parts.',result,['multiply_by_small_whole'],'Multiply the one-part value by '+n+'.')],concept:'A fraction of a whole means divide into equal parts, then take the required number of parts.',mentalRoute:'Divide by '+d+', then multiply by '+n+'.',hint:'Find one '+labels[d].replace(/s$/,'')+' first.'});
  }
  out.push({strategyId:'fraction_denominator_first',answer:ans,valid:true,features:{operationCount:2,divisionDifficulty:cost.divisionDifficulty(w,d),multiplicationDifficulty:cost.multiplicationDifficulty(w/d,n),fractionComplexity:labels[d]?0.3:0.8,mentalLoad:1},steps:[step('divide','Divide '+w+' by '+d+'.',w/d,['fraction_denominator_first'],'Find one denominator-sized part.'),step('multiply','Multiply by '+n+'.',ans,['multiply_by_small_whole'],'Take '+n+' equal parts.')],concept:'Divide by the denominator, then multiply by the numerator.',mentalRoute:'Denominator first, numerator second.',hint:'Find one part first.'});
  return out;
}

function whatPercentCandidates(problem){
  var part=problem.part,w=problem.whole,ans=part/w*100,out=[];
  out.push({strategyId:'what_percent_formal',answer:ans,valid:true,features:{operationCount:2,divisionDifficulty:cost.divisionDifficulty(part,w),multiplicationDifficulty:cost.multiplicationDifficulty(part/w,100),decimalComplexity:decimalComplexity([part/w,ans]),mentalLoad:1},steps:[step('ratio','Divide the part by the whole.',part/w,['part_whole_relationship'],'Percent starts with part ÷ whole.'),step('percent','Multiply by 100.',ans,['multiply_by_small_whole'],'Convert the ratio to percent.')],concept:'Percent compares a part to a whole out of 100.',mentalRoute:'part ÷ whole × 100',hint:'Start with part ÷ whole.'});
  var one=w/100;
  if(close(part/one,Math.round(part/one))){
    var p=part/one;
    out.push({strategyId:'what_percent_one_chunk',answer:p,valid:close(p,ans),features:{operationCount:2,divisionDifficulty:cost.divisionDifficulty(w,100)+cost.divisionDifficulty(part,one),decimalComplexity:decimalComplexity([one]),mentalLoad:1,benchmarkBonus:0.5},steps:[step('one','Find 1% of '+w+'.',one,['divide_by_100'],'1% is one hundredth.'),step('count','How many '+one+' chunks make '+part+'?',p,['part_whole_relationship'],'Count the 1% chunks.')],concept:'If you know the size of 1%, count how many of those chunks fit the part.',mentalRoute:'Find 1% and count chunks.',hint:'Find 1% of the whole.'});
  }
  return out;
}

function generate(problem){if(problem.family==='percent_of_whole')return percentCandidates(problem);if(problem.family==='fraction_of_whole')return fractionCandidates(problem);if(problem.family==='what_percent_of')return whatPercentCandidates(problem);throw new Error('unsupported family');}
module.exports={generate:generate,close:close};