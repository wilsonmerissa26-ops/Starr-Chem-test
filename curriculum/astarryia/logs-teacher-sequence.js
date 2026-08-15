/* AStarryia Release 1 vertical slice: logarithm meaning -> product rule -> log(6). */
var A=require('../../teacher-runtime.js').ACTIONS;

module.exports={
  id:'astarryia_logs_vertical_slice_v1',
  subject:'math',
  concept:'logarithm_meaning_product_rule_no_calculator',
  prerequisites:['powers_of_ten','basic_exponents','multiplication_decomposition'],
  steps:[
    {id:'say_intro',type:A.SAY,text:'Before I give this a name, watch what the exponent is doing.'},
    {id:'write_10_1',type:A.WRITE,target:'equation',content:'10¹ = 10'},
    {id:'highlight_1',type:A.HIGHLIGHT,target:'exponent',value:'1'},
    {id:'say_1',type:A.SAY,text:'The exponent one tells us ten is used once.'},
    {id:'write_10_2',type:A.WRITE,target:'equation',content:'10² = 100'},
    {id:'highlight_2',type:A.HIGHLIGHT,target:'exponent',value:'2'},
    {id:'write_10_3',type:A.WRITE,target:'equation',content:'10³ = 1000'},
    {id:'highlight_3',type:A.HIGHLIGHT,target:'exponent',value:'3'},
    {id:'reverse_relation',type:A.ANIMATE,animation:'reverse_power_to_log',from:'10³ = 1000',to:'log₁₀(1000) = 3'},
    {id:'say_log_meaning',type:A.SAY,text:'A logarithm asks the power question backward: ten to what power gives one thousand?'},
    {id:'ask_power',type:A.ASK,prompt:'10 to what power gives 1000?',answerSpec:{type:'numeric',value:3},misconceptionTag:'log_meaning'},
    {id:'say_product_discovery',type:A.SAY,text:'Now watch what happens when the number itself is a product.'},
    {id:'write_product',type:A.WRITE,target:'equation',content:'1000 = 10 × 100'},
    {id:'animate_log_product',type:A.ANIMATE,animation:'split_log_product',from:'log(10 × 100)',to:['log(10)','+','log(100)']},
    {id:'say_product_rule_reason',type:A.SAY,text:'Ten contributes one power of ten. One hundred contributes two more. Together the powers add: one plus two equals three.'},
    {id:'write_product_values',type:A.WRITE,target:'equation',content:'log(10) + log(100) = 1 + 2 = 3'},
    {id:'name_product_rule',type:A.SAY,text:'That pattern has a name: the product rule. Log of a product becomes the sum of the logs.'},
    {id:'write_product_rule',type:A.WRITE,target:'rule',content:'log(ab) = log(a) + log(b)'},
    {id:'ask_product_rule',type:A.ASK,prompt:'Which matches log(2 × 5)?',answerSpec:{type:'choice',value:'log(2) + log(5)'},misconceptionTag:'log_product_rule'},
    {id:'say_build6',type:A.SAY,text:'Now we can build log six without a calculator. You are not supposed to magically know point seven eight.'},
    {id:'animate_6_decompose',type:A.ANIMATE,animation:'decompose_factor',from:'6',to:['2','×','3']},
    {id:'write_6_log',type:A.WRITE,target:'equation',content:'log(6) = log(2 × 3)'},
    {id:'animate_6_split',type:A.ANIMATE,animation:'split_log_product',from:'log(2 × 3)',to:['log(2)','+','log(3)']},
    {id:'write_landmarks',type:A.WRITE,target:'toolbox',content:'log(2)≈0.30   log(3)≈0.48   log(5)≈0.70'},
    {id:'say_landmarks',type:A.SAY,text:'For no calculator work, memorize only this tiny landmark set. Build other values from them.'},
    {id:'animate_add_landmarks',type:A.ANIMATE,animation:'combine_landmarks',from:['0.30','+','0.48'],to:'0.78'},
    {id:'ask_log15',type:A.ASK,prompt:'Use the landmarks to estimate log(15).',answerSpec:{type:'numericTolerance',value:1.18,tolerance:0.03},misconceptionTag:'log_landmark_transfer'},
    {id:'say_close',type:A.SAY,text:'Good. You just built a logarithm instead of memorizing a random decimal.'}
  ]
};
