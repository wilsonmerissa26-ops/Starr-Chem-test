/* AStarryia Release 1 chemistry vertical slice.
   Same teacher-runtime architecture as math; chemistry content stays in curriculum. */
var A=require('../../teacher-runtime.js').ACTIONS;
module.exports={
  id:'astarryia_lewis_vertical_slice_v1',subject:'chemistry',concept:'lewis_structure_foundation',
  prerequisites:['valence_electrons','electron_count','basic_bonding'],
  masteryPolicy:{minIndependentCorrect:3,minForms:2,requireTransfer:true},
  steps:[
    {id:'say_intro',type:A.SAY,text:'We are going to build ammonia from an empty workspace. I will show you where every electron goes and why.'},
    {id:'write_formula',type:A.WRITE,target:'formula',content:'NH₃'},
    {id:'say_count_n',type:A.SAY,text:'Nitrogen brings five valence electrons.'},
    {id:'animate_n_e',type:A.ANIMATE,animation:'show_valence_electrons',atom:'N',count:5},
    {id:'say_count_h',type:A.SAY,text:'Each hydrogen brings one. Three hydrogens add three more.'},
    {id:'animate_h_e',type:A.ANIMATE,animation:'show_three_hydrogen_electrons',count:3},
    {id:'write_total',type:A.WRITE,target:'counter',content:'5 + 3 = 8 valence electrons'},
    {id:'ask_total',type:A.ASK,prompt:'How many total valence electrons does NH₃ have?',answerSpec:{type:'numeric',value:8},misconceptionTag:'electron_count'},
    {id:'say_center',type:A.SAY,text:'Hydrogen can make only one bond, so it cannot sit in the center. Nitrogen will be our central atom.'},
    {id:'animate_center',type:A.ANIMATE,animation:'move_atom_to_center',atom:'N'},
    {id:'say_place_h',type:A.SAY,text:'Now watch the three hydrogens move around nitrogen.'},
    {id:'animate_h_place',type:A.ANIMATE,animation:'arrange_hydrogens_around_center',count:3},
    {id:'say_bond',type:A.SAY,text:'Each N-H bond uses two electrons, one shared pair.'},
    {id:'animate_bonds',type:A.ANIMATE,animation:'form_three_single_bonds',bonds:3,electronsUsed:6},
    {id:'write_counter_2',type:A.WRITE,target:'counter',content:'8 available → 6 in bonds → 2 remaining'},
    {id:'say_lone',type:A.SAY,text:'The last two electrons stay together as one lone pair on nitrogen.'},
    {id:'animate_lone',type:A.ANIMATE,animation:'place_lone_pair',atom:'N',pairs:1},
    {id:'say_verify',type:A.SAY,text:'Now verify, not memorize. Nitrogen sees eight electrons around it. Each hydrogen sees two.'},
    {id:'animate_octet',type:A.HIGHLIGHT,target:'octet_check',value:'N=8,H=2'},
    {id:'ask_lone',type:A.ASK,prompt:'How many lone pairs are on nitrogen in NH₃?',answerSpec:{type:'numeric',value:1},misconceptionTag:'lone_pair_count'},
    {id:'say_watch_done',type:A.SAY,text:'That was the demonstration. Next, you will build a fresh structure with me from an empty stage.'},
    {id:'manip_center',type:A.LET_STUDENT_MANIPULATE,prompt:'Place the central atom for NH₃.',expected:{action:'place_center',element:'N'},subskill:'central_atom'},
    {id:'manip_h',type:A.LET_STUDENT_MANIPULATE,prompt:'Place three hydrogens around nitrogen.',expected:{action:'place_atoms',element:'H',count:3},subskill:'skeleton'},
    {id:'manip_bonds',type:A.LET_STUDENT_MANIPULATE,prompt:'Create the three N-H single bonds.',expected:{action:'bond',count:3},subskill:'bonding'},
    {id:'manip_lone',type:A.LET_STUDENT_MANIPULATE,prompt:'Place the remaining lone pair.',expected:{action:'lone_pair',atom:'N',count:1},subskill:'remaining_electrons'},
    {id:'say_phase',type:A.SAY,text:'Now let us make sure you can use this on fresh molecules. One correct click will not finish the skill.'}
  ]
};
