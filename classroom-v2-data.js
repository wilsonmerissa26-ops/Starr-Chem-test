/* Learner-facing V2 curriculum data. Day 1 content mirrors the locked curriculum; this file only expands teaching presentation and verified practice variety. */
(function(root){
'use strict';
const TARGETED={
 logs:{name:'Logs & estimation',teach:'A logarithm asks for an exponent. Start with a fact you know, like 10³ = 1,000. The logarithm asks the same relationship backward: log(1,000) = 3.',notice:'Find the power of ten first. For estimation, adjust for the front number after you identify the exponent.',confusion:'A negative log result does not mean the number itself is negative. It usually means the number is between 0 and 1.',watch:[
  {title:'Start forward',visual:'10³ = 1,000',say:'Ten to the third power equals one thousand.'},
  {title:'Ask backward',visual:'log(1,000) = ?',say:'Now I am asking: ten to what power gives one thousand?'},
  {title:'Reveal the exponent',visual:'log(1,000) = 3',say:'The relationship did not change. Only the direction of the question changed.'}
 ],together:{q:'10² = 100, so log(100) = ?',a:['2'],hint:'Read the exponent in the forward fact.'},guided:[
  {id:'log-g1',q:'log(10,000) = ?',a:['4'],why:'10⁴ = 10,000.'},
  {id:'log-g2',q:'If log(x) = -4, what is x?',a:['0.0001','10^-4','10⁻⁴'],why:'10⁻⁴ = 0.0001.'},
  {id:'log-g3',q:'Estimate -log(6 × 10⁻⁶) to one decimal.',a:['5.2'],tol:.15,why:'6 - log(6) ≈ 6 - 0.78 = 5.22.'}
 ],alone:[
  {id:'log-a1',q:'log(1,000,000) = ?',a:['6'],why:'10⁶ = 1,000,000.'},
  {id:'log-a2',q:'Estimate -log(5 × 10⁻⁴).',a:['3.3'],tol:.15,why:'4 - log(5) ≈ 4 - 0.70 = 3.30.'},
  {id:'log-a3',q:'Estimate -log(8 × 10⁻¹⁰).',a:['9.1'],tol:.15,why:'10 - log(8) ≈ 10 - 0.90 = 9.10.'},
  {id:'log-a4',q:'If log(x) = -7, what is x?',a:['10^-7','10⁻⁷','0.0000001'],why:'x = 10⁻⁷.'}
 ],fresh:[{id:'log-f1',q:'log(100,000) = ?',a:['5'],why:'10⁵ = 100,000.'},{id:'log-f2',q:'Estimate -log(3 × 10⁻⁸).',a:['7.5'],tol:.15,why:'8 - log(3) ≈ 8 - 0.48 = 7.52.'}],reference:'Use log(2)≈0.30, log(3)≈0.48, log(5)≈0.70.'},
 algebra:{name:'Algebra',teach:'An equation is a balance. Any operation you do to one side must also happen to the other side so the relationship stays true.',notice:'Collect variable terms, collect plain numbers, then divide by the coefficient.',confusion:'Moving a term is shorthand. What you are really doing is adding or subtracting the same amount on both sides.',watch:[
  {title:'Balanced equation',visual:'3x + 4 = 19',say:'Both sides are equal right now.'},
  {title:'Remove 4 from both sides',visual:'3x + 4 − 4 = 19 − 4',say:'I subtract four from both sides to keep the balance level.'},
  {title:'Simplify',visual:'3x = 15',say:'Now three equal x groups total fifteen.'},
  {title:'Divide both sides by 3',visual:'3x ÷ 3 = 15 ÷ 3',say:'Split both sides into three equal groups.'},
  {title:'Solution',visual:'x = 5',say:'Each x must be five.'}
 ],together:{q:'x + 4 = 9. What is x?',a:['5'],hint:'Subtract 4 from both sides.'},guided:[
  {id:'alg-g1',q:'4x + 5 = x + 20. Solve for x.',a:['5'],why:'Subtract x, subtract 5, then divide 15 by 3.'},
  {id:'alg-g2',q:'Solve V = lwh for h.',a:['v/(lw)','v/lw'],why:'Divide both sides by lw.'},
  {id:'alg-g3',q:'2/x = 6/15. Solve for x.',a:['5'],why:'Cross-multiply: 30 = 6x, so x = 5.'}
 ],alone:[
  {id:'alg-a1',q:'7x + 2 = 3x + 26. Solve for x.',a:['6'],why:'4x = 24, so x = 6.'},
  {id:'alg-a2',q:'4/x = 8/20. Solve for x.',a:['10'],why:'80 = 8x, so x = 10.'},
  {id:'alg-a3',q:'Solve P = 2l + 2w for w.',a:['(p-2l)/2','p/2-l'],why:'Subtract 2l, then divide by 2.'},
  {id:'alg-a4',q:'3x - 5 = x + 11. Solve for x.',a:['8'],why:'2x = 16, so x = 8.'}
 ],fresh:[{id:'alg-f1',q:'3x - 4 = x + 8. Solve for x.',a:['6'],why:'2x = 12.'},{id:'alg-f2',q:'5/x = 10/6. Solve for x.',a:['3'],why:'30 = 10x.'}]},
 exponents:{name:'Exponents',teach:'An exponent tells how many equal factors are multiplied. A negative exponent means reciprocal, not a negative answer.',notice:'Same-base multiplication adds exponents. Same-base division subtracts exponents.',confusion:'The exponent belongs to the base. It does not mean multiply the base by the exponent.',watch:[
  {title:'Expand',visual:'2³ = 2 × 2 × 2',say:'The exponent three means three factors of two.'},
  {title:'Multiply',visual:'2 × 2 × 2 = 8',say:'Now multiply the repeated factors.'},
  {title:'Negative exponent',visual:'2⁻³ = 1 / 2³',say:'A negative exponent tells us to take the reciprocal.'},
  {title:'Finish',visual:'2⁻³ = 1/8',say:'The sign belongs to the exponent rule, not the final number.'}
 ],together:{q:'2³ = ?',a:['8'],hint:'Write 2 × 2 × 2.'},guided:[
  {id:'exp-g1',q:'2⁻⁴ = ?',a:['1/16','0.0625'],why:'2⁴=16, then take the reciprocal.'},
  {id:'exp-g2',q:'(a⁴)(a³) ÷ a² = a^?',a:['5'],why:'4 + 3 - 2 = 5.'},
  {id:'exp-g3',q:'10² × 10³ = 10^?',a:['5'],why:'Add exponents for same-base multiplication.'}
 ],alone:[
  {id:'exp-a1',q:'6⁻² = ?',a:['1/36'],why:'6²=36, reciprocal gives 1/36.'},
  {id:'exp-a2',q:'(d³)(d⁵) = d^?',a:['8'],why:'3+5=8.'},
  {id:'exp-a3',q:'e⁷/e³ = e^?',a:['4'],why:'7-3=4.'},
  {id:'exp-a4',q:'3⁻³ = ?',a:['1/27'],why:'3³=27, reciprocal gives 1/27.'}
 ],fresh:[{id:'exp-f1',q:'5⁻² = ?',a:['1/25','0.04'],why:'5²=25, reciprocal gives 1/25.'},{id:'exp-f2',q:'(b⁵)(b²) ÷ b³ = b^?',a:['4'],why:'5+2-3=4.'}]},
 sci:{name:'Scientific notation',teach:'Scientific notation writes a number as a value from 1 up to 10 multiplied by a power of ten. The exponent records how far the decimal moved.',notice:'Large numbers usually use positive exponents. Small decimals usually use negative exponents.',confusion:'Do not count digits. Count decimal-place moves.',watch:[
  {title:'Start',visual:'3,000.0',say:'Imagine the decimal after the final zero.'},
  {title:'Move once',visual:'300.0 × 10¹',say:'One move left gives one power of ten.'},
  {title:'Move twice',visual:'30.0 × 10²',say:'Two moves left gives ten squared.'},
  {title:'Normalize',visual:'3.0 × 10³',say:'Three moves makes the front number between one and ten.'}
 ],together:{q:'Write 3,000 in scientific notation.',a:['3x10^3','3×10^3','3×10³','3e3'],hint:'Move the decimal three places left.'},guided:[
  {id:'sci-g1',q:'Write 0.00061 in scientific notation.',a:['6.1x10^-4','6.1×10^-4','6.1×10⁻⁴','6.1e-4'],why:'Move the decimal four places right, so the exponent is -4.'},
  {id:'sci-g2',q:'(4.0×10⁶)(2.0×10⁻³) = ?',a:['8x10^3','8×10^3','8×10³','8000'],why:'Multiply 4×2 and add 6+(-3).'},
  {id:'sci-g3',q:'(9.0×10⁻⁵) ÷ (3.0×10⁻²) = ?',a:['3x10^-3','3×10^-3','3×10⁻³','0.003'],why:'Divide 9/3 and subtract exponents: -5 - (-2) = -3.'}
 ],alone:[
  {id:'sci-a1',q:'Write 0.0072 in scientific notation.',a:['7.2x10^-3','7.2×10^-3','7.2×10⁻³','7.2e-3'],why:'Move three places right.'},
  {id:'sci-a2',q:'(3.0×10⁴)(3.0×10²) = ?',a:['9x10^6','9×10^6','9×10⁶','9000000'],why:'3×3=9 and 4+2=6.'},
  {id:'sci-a3',q:'(8.0×10⁻³) ÷ (4.0×10⁻⁶) = ?',a:['2x10^3','2×10^3','2×10³','2000'],why:'8/4=2 and -3 - (-6)=3.'},
  {id:'sci-a4',q:'Write 920,000 in scientific notation.',a:['9.2x10^5','9.2×10^5','9.2×10⁵','9.2e5'],why:'Move five places left.'}
 ],fresh:[{id:'sci-f1',q:'Write 0.0000452 in scientific notation.',a:['4.52x10^-5','4.52×10^-5','4.52×10⁻⁵','4.52e-5'],why:'Move five places right.'},{id:'sci-f2',q:'(5.0×10⁻²)(3.0×10⁵) = ?',a:['1.5x10^4','1.5×10^4','1.5×10⁴','15000'],why:'15×10³ normalizes to 1.5×10⁴.'}]},
 fractions:{name:'Fractions & percentages',teach:'Fractions describe equal-size pieces. Before adding or subtracting fractions, the pieces must be the same size. Percent means per hundred.',notice:'Use a common denominator for combining fractions. For percent, compare part to whole and scale to 100.',confusion:'You cannot add denominators just because you add numerators. Denominators define the piece size.',watch:[
  {title:'Different pieces',visual:'2/3  +  1/4',say:'Thirds and fourths are different-size pieces.'},
  {title:'Cut both into twelfths',visual:'8/12 + 3/12',say:'Twelve is a common denominator, so now the pieces match.'},
  {title:'Combine',visual:'11/12',say:'Now combine the number of equal-size pieces.'}
 ],together:{q:'1/2 + 1/2 = ?',a:['1','2/2'],hint:'The denominators already match.'},guided:[
  {id:'frac-g1',q:'5/6 − 1/3 = ?',a:['1/2','0.5'],why:'1/3 = 2/6, so 5/6-2/6=3/6=1/2.'},
  {id:'frac-g2',q:'3/8 of 160 = ?',a:['60'],why:'160÷8=20, then 20×3=60.'},
  {id:'frac-g3',q:'24 is what percent of 300?',a:['8','8%'],why:'24/300×100=8%.'}
 ],alone:[
  {id:'frac-a1',q:'5/8 − 1/4 = ?',a:['3/8','0.375'],why:'1/4=2/8.'},
  {id:'frac-a2',q:'2/5 of 90 = ?',a:['36'],why:'90÷5×2=36.'},
  {id:'frac-a3',q:'18 is what percent of 90?',a:['20','20%'],why:'18/90=0.2=20%.'},
  {id:'frac-a4',q:'7/12 + 1/6 = ?',a:['3/4','9/12','0.75'],why:'1/6=2/12, total 9/12=3/4.'}
 ],fresh:[{id:'frac-f1',q:'7/10 − 2/5 = ?',a:['3/10','0.3'],why:'2/5=4/10.'},{id:'frac-f2',q:'45 is what percent of 180?',a:['25','25%'],why:'45/180=1/4=25%.'}]},
 units:{name:'Unit conversions',teach:'A conversion factor is a form of one. Multiply by a relationship that cancels the old unit and leaves the unit you want.',notice:'Write units on every step. If the old unit does not cancel, the setup is not finished.',confusion:'Do not change a number without also changing its unit relationship.',watch:[
  {title:'Start quantity',visual:'0.062 L',say:'We want milliliters instead of liters.'},
  {title:'Multiply by a conversion factor',visual:'0.062 L × (1000 mL / 1 L)',say:'I place liters in the denominator so liters cancel.'},
  {title:'Cancel units',visual:'0.062 × 1000 mL',say:'The L units cancel because one is above and one is below.'},
  {title:'Finish',visual:'62 mL',say:'Now the remaining unit is milliliters.'}
 ],together:{q:'Convert 1 L to mL.',a:['1000','1000ml','1000 ml'],hint:'Use 1 L = 1000 mL.'},guided:[
  {id:'unit-g1',q:'Convert 0.062 L to mL.',a:['62','62ml','62 ml'],why:'0.062×1000=62.'},
  {id:'unit-g2',q:'At 8 g per 5 min, how many grams in 12 min?',a:['19.2','19.2g','19.2 g'],why:'8/5×12=19.2 g.'},
  {id:'unit-g3',q:'Convert 0.015 mol/s to mmol/min.',a:['900','900mmol/min','900 mmol/min'],why:'0.015×1000×60=900.'}
 ],alone:[
  {id:'unit-a1',q:'Convert 0.033 L to mL.',a:['33','33ml','33 ml'],why:'0.033×1000=33.'},
  {id:'unit-a2',q:'At 15 g per 6 min, how many grams in 10 min?',a:['25','25g','25 g'],why:'15/6×10=25 g.'},
  {id:'unit-a3',q:'Convert 0.0045 mol/s to mmol/min.',a:['270','270mmol/min','270 mmol/min'],why:'0.0045×1000×60=270.'},
  {id:'unit-a4',q:'Convert 0.12 mol/min to mmol/hour.',a:['7200','7200mmol/hour','7200 mmol/hour'],why:'0.12×1000×60=7200.'}
 ],fresh:[{id:'unit-f1',q:'Convert 0.008 L to mL.',a:['8','8ml','8 ml'],why:'0.008×1000=8.'},{id:'unit-f2',q:'Convert 0.0021 mol/s to mmol/min.',a:['126','126mmol/min','126 mmol/min'],why:'0.0021×1000×60=126.'}]}
};
const FOUNDATION={
 name:'Number Sense & Flexible Calculation',lessons:[
  {id:'compensation',title:'Compensation',teach:'Sometimes it is easier to change a number to a friendly number, solve, then compensate for the change.',watch:[['Start','50 + 38'],['Make 38 friendly','38 → 40'],['Add the friendly number','50 + 40 = 90'],['Undo the extra 2','90 − 2 = 88']],together:{q:'Use compensation: 60 + 29 = ?',a:['89'],hint:'Turn 29 into 30, then subtract 1.'},practice:[{id:'f-c1',q:'70 + 48 = ?',a:['118'],why:'70+50-2=118.'},{id:'f-c2',q:'199 + 36 = ?',a:['235'],why:'200+36-1=235.'},{id:'f-c3',q:'49 + 52 = ?',a:['101'],why:'50+52-1=101.'}]},
  {id:'decompose',title:'Decomposition',teach:'Break numbers into useful parts so your brain can work with easier chunks.',watch:[['Start','50 + 38'],['Break 38 apart','38 = 30 + 8'],['Add tens','50 + 30 = 80'],['Add ones','80 + 8 = 88']],together:{q:'Break apart 47 to solve 30 + 47.',a:['77'],hint:'30+40 first, then +7.'},practice:[{id:'f-d1',q:'40 + 56 = ?',a:['96'],why:'40+50+6=96.'},{id:'f-d2',q:'120 + 73 = ?',a:['193'],why:'120+70+3=193.'},{id:'f-d3',q:'65 + 24 = ?',a:['89'],why:'65+20+4=89.'}]},
  {id:'estimate',title:'Estimate First',teach:'Estimate before exact calculation so you know what size answer makes sense. Estimation is a reasonableness check, not a guess.',watch:[['Problem','198 + 403'],['Round','200 + 400'],['Estimate','≈ 600'],['Exact check','198 + 403 = 601']],together:{q:'Estimate first: 297 + 104 is closest to 300, 400, or 500?',a:['400'],hint:'Round 297 to 300 and 104 to 100.'},practice:[{id:'f-e1',q:'Estimate 612 + 189 to the nearest hundred.',a:['800'],why:'600+200≈800.'},{id:'f-e2',q:'Estimate 49 × 21 using friendly tens.',a:['1000'],why:'50×20≈1000.'}]}
 ]
};
const CHEM={
 teach:[
  {title:'Valence electrons',visual:'H 1   C 4   N 5   O 6',say:'Valence electrons are the outside electrons available for bonding in today’s molecules.'},
  {title:'A bond uses two electrons',visual:'H—H  =  2 shared electrons',say:'One single bond represents one shared pair, which is two electrons.'},
  {title:'Hydrogen rule',visual:'H wants 2 electrons',say:'Hydrogen is full with two electrons and is never the central atom in today’s Lewis structures.'},
  {title:'Octet pattern',visual:'C, N, O usually aim for 8 around them',say:'For today’s neutral structures, carbon, nitrogen, and oxygen commonly reach eight electrons around them.'},
  {title:'Lone pairs',visual:'N :   O ::',say:'Electrons not used in bonds can remain as lone pairs on an atom.'}
 ],watchNH3:[
  {atoms:['N'],bonds:0,pairs:0,used:0,remaining:8,say:'Nitrogen goes in the center. N contributes 5 valence electrons and three H contribute 3, for 8 total.'},
  {atoms:['N','H1'],bonds:1,pairs:0,used:2,remaining:6,say:'The first N-H bond uses 2 electrons.'},
  {atoms:['N','H1','H2'],bonds:2,pairs:0,used:4,remaining:4,say:'A second bond brings the used total to 4 electrons.'},
  {atoms:['N','H1','H2','H3'],bonds:3,pairs:0,used:6,remaining:2,say:'Three N-H bonds use 6 electrons. Two electrons remain.'},
  {atoms:['N','H1','H2','H3'],bonds:3,pairs:1,used:8,remaining:0,say:'The last 2 electrons become one lone pair on nitrogen. Now nitrogen has an octet.'}
 ],buildNH3:['Place N in the center','Add the first H','Form the first N-H bond','Add the second H','Form the second N-H bond','Add the third H','Form the third N-H bond','Place one lone pair on N','Check all 8 electrons'],
 guided:[
  {id:'chem-h2o',name:'H₂O',total:8,formula:'H₂O',prompt:'Build oxygen in the center with two O-H bonds and two lone pairs on O.',answer:'O center, two H bonded to O, two lone pairs on O'},
  {id:'chem-meoh',name:'CH₃OH',total:14,formula:'CH₃OH',prompt:'Build C bonded to three H and O; O bonded to C and H with two lone pairs.',answer:'C-H×3, C-O, O-H, two lone pairs on O'}
 ],fresh:{id:'chem-ch3nh2',name:'CH₃NH₂',total:14,formula:'CH₃NH₂',prompt:'Cold build: C bonded to three H and N; N bonded to C and two H with one lone pair.',answer:'C-H×3, C-N, N-H×2, one lone pair on N'}
};
root.ClassroomV2Data={TARGETED,FOUNDATION,CHEM};
if(typeof module!=='undefined'&&module.exports)module.exports=root.ClassroomV2Data;
})(typeof globalThis!=='undefined'?globalThis:this);
