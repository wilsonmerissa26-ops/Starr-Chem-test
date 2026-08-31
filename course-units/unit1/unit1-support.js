(function(root,factory){
  const api=factory(
    typeof module==='object'&&module.exports?require('../../student-model-idk-router.js'):root.StudentModelIdkRouter
  );
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.CHM221Unit1Support=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(Router){
  'use strict';
  if(!Router)throw new Error('StudentModelIdkRouter is required');

  const R=Router.IDK_REASONS;
  const REASONS=Object.freeze([
    {id:R.DONT_UNDERSTAND,label:"I don't understand the concept"},
    {id:R.DONT_KNOW_START,label:"I don't know how to start"},
    {id:R.FORGOT_PREREQUISITE,label:'I forgot something I need first'},
    {id:R.STARTED_STUCK,label:'I started, but I got stuck'},
    {id:R.SHOW_EXAMPLE,label:'Show me a similar example'},
    {id:R.EXPLANATION_NOT_MAKING_SENSE,label:"The explanation isn't making sense"}
  ]);

  const P=Object.freeze({
    R1:{
      hint:'Every unlabeled line end and every corner is one carbon. Then complete that carbon to four bonds with implied hydrogen.',
      concept:'Bond-line drawings show the carbon skeleton instead of writing every C and H. Each unlabeled line end or vertex is a carbon. Hydrogens attached to carbon are usually hidden, so mentally add only enough H atoms to give that carbon four total bonds.',
      start:'Start with the drawing marks, not the molecular formula. Step 1: point to each unlabeled end and corner and call it carbon. Step 2: count the bonds already drawn to that carbon. Step 3: fill the rest of carbon\'s four bonds with implied H.',
      prerequisite:'The prerequisite is carbon valence: neutral carbon normally makes four bonds. If that rule is not solid yet, use the Day 1 foundation refresh before coming back to bond-line notation.',
      stuck:'If you already found the carbon, stop there and count only the bonds touching it. Four minus the bond order already shown tells you how many hydrogens are implied on that carbon.',
      example:'A bond-line drawing that is just one single line has two unlabeled ends, so it represents two carbons. Each carbon already has one C-C bond, so each carbon has three implied hydrogens. That is ethane, CH3-CH3.',
      alternate:'Think of the zigzag as a carbon skeleton. The ends and corners are the carbon joints. Hydrogens are invisible fillers added only until each carbon reaches four bonds.',
      check:{prompt:'A bond-line drawing is one single line with two unlabeled ends. How many carbon atoms are represented?',accepted:['2','two'],success:'Right. Each unlabeled end is one carbon.',correction:'Count the unlabeled ends themselves. One line has two ends, so it represents two carbons.'}
    },
    R2:{
      hint:'Hydrogens on carbon are omitted because carbon\'s four-bond pattern lets you infer how many H atoms are missing.',
      concept:'Most C-H bonds are left out because carbon has a predictable valence of four. Once you see how many bonds a carbon already has to non-hydrogen atoms, the remaining bond positions tell you how many hydrogens must be there.',
      start:'Start by choosing one carbon. Count the bond order already drawn to it. Subtract that total from four. The remainder is the number of implied hydrogens on that carbon.',
      prerequisite:'The prerequisite is carbon\'s normal valence of four. If that is fuzzy, review the Day 1 foundation material before using bond-line shorthand.',
      stuck:'If the carbon is at the end of one single bond, it already has one bond shown. Carbon needs four total, so three C-H bonds are implied even though they are not drawn.',
      example:'At the end of a single bond, a carbon has one visible bond to the next atom. The other three bonds are to hidden hydrogens, so that endpoint is CH3.',
      alternate:'Treat every carbon like a four-slot connector. Visible lines fill some slots. Hidden hydrogens fill whatever slots are left.',
      check:{prompt:'A terminal carbon in a bond-line structure has one single bond drawn to another carbon. How many hydrogens are implied on that terminal carbon?',accepted:['3','three'],success:'Exactly. One visible bond plus three C-H bonds gives carbon four bonds.',correction:'Carbon needs four total bonds. With one bond already drawn, three bond positions remain for H.'}
    },
    F1:{
      hint:'Do not count four nonbonding electrons as four lone pairs. A lone pair contains two electrons, so four nonbonding electrons make two lone pairs.',
      concept:'Neutral oxygen has six valence electrons and commonly appears with two bonds and two lone pairs. With two single bonds already drawn, the remaining four nonbonding electrons are grouped into two pairs. So the answer is two lone pairs, not four.',
      start:'Use only three facts. The atom is oxygen. It is neutral. It already has two single bonds. Neutral oxygen with two bonds has two lone pairs.',
      prerequisite:'The prerequisite is the difference between electrons and electron pairs. Four nonbonding electrons make two lone pairs. Day 2 reviews valence electrons, lone pairs, and formal charge if you need that piece rebuilt.',
      stuck:'If you got 4, you probably counted individual nonbonding electrons. Group them in twos: four electrons become two lone pairs.',
      example:'In water, H-O-H, oxygen has two single bonds. The oxygen also carries two lone pairs. The same neutral-oxygen pattern applies here.',
      alternate:'Picture oxygen with two bond lines already attached. The four leftover nonbonding electrons sit as two pairs: one pair on one side and one pair on the other. Two pairs total.',
      check:{prompt:'In H2O, oxygen has two single bonds. How many lone pairs are on the oxygen?',accepted:['2','two'],success:'Yes. Two bonds plus two lone pairs is the common neutral oxygen pattern.',correction:'Water uses the same pattern: oxygen has two O-H bonds and two lone pairs.'}
    },
    F2:{
      hint:'Neutral carbon usually has four bonds. Three bonds with no lone pair is the electron-deficient carbocation pattern.',
      concept:'A neutral carbon normally has four bonds. A carbon with only three bonds and no lone pair is missing electron density compared with neutral carbon, so it carries a +1 formal charge. That species is a carbocation.',
      start:'First count the carbon\'s bonds. There are three. Then check for a lone pair. There is none. Three bonds plus no lone pair on carbon means +1.',
      prerequisite:'The prerequisite is carbon\'s usual neutral pattern: four bonds. If formal charge patterns are not automatic yet, use the Day 2 foundation refresh.',
      stuck:'Do not decide the sign by guessing. Compare with neutral carbon\'s four-bond pattern. One bond short with no lone pair is the positive carbon pattern.',
      example:'A tert-butyl carbocation has a central carbon bonded to three other carbons and no lone pair. That central carbon is C+.',
      alternate:'Think of neutral carbon as having four bonding connections. If it has only three connections and no extra lone pair to compensate, mark it positive: +1.',
      check:{prompt:'A carbon atom has three single bonds and an empty orbital, with no lone pair. What formal charge does it have?',accepted:['+1','1+','positive 1','positive one','positive','carbocation'],success:'Correct. Three bonds and no lone pair is the +1 carbocation pattern.',correction:'Compare it with neutral carbon\'s four bonds. Three bonds with no lone pair gives carbon a +1 charge.'}
    },
    G1:{
      hint:'Look for the O-H bond in the actual connectivity. An -OH group attached to saturated carbon is an alcohol.',
      concept:'Functional groups are identified from connectivity, not just the list of atoms. In CH3CH2OH, the oxygen is bonded to hydrogen and to a saturated carbon. That -OH pattern is an alcohol functional group.',
      start:'Find the non-carbon atom first. Here it is O. Ask what O is connected to. It is connected to H and to an sp3 carbon, giving an -OH group. That is an alcohol.',
      prerequisite:'The prerequisite is reading condensed structures from left to right and recognizing which atoms are directly bonded. Rebuild that first if CH3CH2OH does not look like CH3-CH2-O-H to you.',
      stuck:'If you saw oxygen but were unsure of the name, focus on the O-H bond. Oxygen bonded to H in this saturated structure is the alcohol pattern.',
      example:'CH3OH is methanol. It contains C-O-H, so its functional group is an alcohol. CH3CH2OH contains the same C-O-H pattern.',
      alternate:'Circle the O and the H attached to it. The circled -OH piece is the clue. That piece is called an alcohol group.',
      check:{prompt:'What functional group is present in CH3CH2CH2OH?',accepted:['alcohol','hydroxyl'],success:'Right. The terminal -OH group identifies an alcohol.',correction:'Rewrite it as CH3-CH2-CH2-O-H. The O-H group attached to carbon is an alcohol.'}
    },
    G2:{
      hint:'Find C=O. If that carbonyl carbon is bonded to carbon groups on both sides, the functional group is a ketone.',
      concept:'CH3COCH3 contains a carbonyl, C=O. The carbonyl carbon is attached to a carbon group on each side, so the functional group is a ketone.',
      start:'Step 1: locate the oxygen. Step 2: recognize that CO here means a carbonyl carbon double-bonded to O. Step 3: check what is attached to the carbonyl carbon. Carbon on both sides means ketone.',
      prerequisite:'The prerequisite is recognizing C=O as a carbonyl and reading condensed connectivity. If that pattern is not clear, review the Chapter 2 functional-group foundation first.',
      stuck:'If you found the carbonyl but forgot the name, ask what flanks it. Carbon group + C=O + carbon group is a ketone.',
      example:'Acetone is CH3COCH3. Its central carbonyl carbon is bonded to two CH3 groups, so acetone is a ketone.',
      alternate:'Think of a ketone as a carbonyl sitting inside the carbon chain rather than at an end: carbon-C(=O)-carbon.',
      check:{prompt:'What functional group is present in CH3COCH2CH3?',accepted:['ketone'],success:'Correct. The carbonyl carbon has carbon groups on both sides, so it is a ketone.',correction:'Find C=O, then look left and right of that carbonyl carbon. Both sides are carbon groups, which makes it a ketone.'}
    },
    N1:{
      hint:'Find the longest chain first. It has five carbons. Then number from the end nearest the methyl branch.',
      concept:'For CH3-CH(CH3)-CH2-CH2-CH3, the longest continuous chain has five carbons, so the parent is pentane. Number from the nearer end, placing the methyl substituent on carbon 2. The name is 2-methylpentane.',
      start:'Do not name the branch first. Step 1: trace the longest continuous chain. Step 2: name that parent. Step 3: number from the end that gives the first branch the smaller number. Step 4: add the substituent name.',
      prerequisite:'The prerequisite is being able to trace a continuous carbon chain without jumping across branches. If chain tracing is shaky, practice that before locants.',
      stuck:'If you already found pentane, compare numbering from both ends. The methyl branch would be 2 from one end and 4 from the other. Choose 2.',
      example:'CH3-CH(CH3)-CH2-CH3 has a four-carbon parent and a methyl branch at carbon 2, so it is 2-methylbutane. The same sequence works here.',
      alternate:'Think parent first, address second: five-carbon street = pentane; methyl branch lives at house 2 = 2-methylpentane.',
      check:{prompt:'Give the IUPAC name for CH3-CH(CH3)-CH2-CH3.',accepted:['2-methylbutane','2 methylbutane'],success:'Yes. Four-carbon parent plus a methyl branch at carbon 2 gives 2-methylbutane.',correction:'The longest chain has four carbons, and numbering from the nearer end places the methyl branch at carbon 2.'}
    },
    N2:{
      hint:'The parent chain has five carbons. The methyl branch is on the middle carbon, which is carbon 3 from either end.',
      concept:'For CH3-CH2-CH(CH3)-CH2-CH3, the longest chain is pentane. The methyl substituent sits on carbon 3. Because the molecule is symmetric around that center for numbering, either direction gives locant 3. The name is 3-methylpentane.',
      start:'Trace the five-carbon parent first. Then number it. The branch sits on the third carbon of that five-carbon chain. Add methyl in front of pentane.',
      prerequisite:'The prerequisite is distinguishing the parent chain from a substituent branch. The parent is the longest continuous chain, not simply the straight-looking line on the page.',
      stuck:'If you found pentane but got a different number, count the carbon positions carefully from either end: 1-2-3-4-5. The branch is attached at 3.',
      example:'In 2-methylpentane the branch is closer to one end, so it gets locant 2. Here the branch is exactly in the middle of pentane, so it gets locant 3.',
      alternate:'Label the parent carbons 1 through 5 directly under the formula. The CH3 branch hangs from carbon 3, making 3-methylpentane.',
      check:{prompt:'Give the IUPAC name for CH3-CH2-CH(CH3)-CH3.',accepted:['2-methylbutane','2 methylbutane'],success:'Correct. The longest chain is butane and the methyl branch gets the lowest locant, 2.',correction:'Use a four-carbon parent, then number from the end closest to the branch. That makes the substituent carbon 2: 2-methylbutane.'}
    },
    I1:{
      hint:'Constitutional isomers must change connectivity, not just orientation. C4H10 has the straight chain and one branched connectivity.',
      concept:'C4H10 has two constitutional isomers: straight-chain butane and branched 2-methylpropane. Redrawing or rotating either one does not create a new constitutional isomer because the atom connectivity has not changed.',
      start:'Hold the formula fixed at four carbons. First draw all four in one chain. Then make the only genuinely different connection by using a three-carbon parent with one methyl branch. After that, any new drawing repeats one of those connectivities.',
      prerequisite:'The prerequisite is the definition of constitutional isomer: same molecular formula, different atom-to-atom connectivity. Shape or rotation alone does not count.',
      stuck:'Compare which carbon is connected to which. If your new drawing has the same connections as butane or 2-methylpropane, it is not a third isomer.',
      example:'Butane can be drawn bent or zigzagged many ways, but all those drawings still have the same C-C-C-C connectivity. They are the same constitutional isomer.',
      alternate:'Think of connectivity as a friendship map. Moving the people around on the page does not create a new network; changing who is connected to whom does.',
      check:{prompt:'How many constitutional isomers does C5H12 have?',accepted:['3','three'],success:'Right. C5H12 has three distinct carbon connectivities.',correction:'For five carbons, the distinct connectivities are pentane, 2-methylbutane, and 2,2-dimethylpropane: three total.'}
    },
    I2:{
      hint:'For an acyclic saturated alkane, use CnH2n+2 and substitute n=6.',
      concept:'Acyclic saturated alkanes follow CnH2n+2. With n=6 carbons, H=2(6)+2=14, so the molecular formula is C6H14.',
      start:'Write CnH2n+2 first. Replace n with 6. Calculate 2×6+2=14. Keep the carbon count 6, giving C6H14.',
      prerequisite:'The prerequisite is recognizing this as an acyclic saturated alkane. Rings and double bonds use different hydrogen relationships, so identify the structure class before using the formula.',
      stuck:'If you have C6, only calculate the H subscript now: 2n+2 = 12+2 = 14.',
      example:'For butane, n=4, so CnH2n+2 gives C4H10. Six carbons uses the same rule.',
      alternate:'Each time an acyclic alkane gains one carbon, it gains two hydrogens. Starting from C4H10 gives C5H12, then C6H14.',
      check:{prompt:'What is the molecular formula of an acyclic saturated alkane with 4 carbon atoms?',accepted:['c4h10','C4H10','c 4 h 10'],success:'Correct. C4H10 follows CnH2n+2.',correction:'Use CnH2n+2 with n=4: H=2(4)+2=10, so C4H10.'}
    },
    C1:{
      hint:'Staggered plus the two largest groups 180° apart is the anti conformation.',
      concept:'In a staggered Newman projection, anti means the two largest substituents are opposite each other, 180° apart. Gauche is also staggered, but the large groups are 60° apart.',
      start:'Check two things in order: Is it staggered or eclipsed? Then measure the relationship between the largest groups. Staggered + 180° = anti.',
      prerequisite:'The prerequisite is reading a Newman projection and recognizing dihedral angle. If 60°, 180°, and aligned positions are not clear, rebuild that visual first.',
      stuck:'You already know it is staggered. Now ignore the small groups and look only at the two largest groups. Opposite sides of the circle means 180°, which is anti.',
      example:'In butane, the lowest-energy staggered conformation places the two CH3 groups opposite each other. That 180° relationship is anti.',
      alternate:'Imagine a clock face: put one large group at 12 o\'clock and the other at 6 o\'clock. They are opposite, so the conformation is anti.',
      check:{prompt:'In a staggered Newman projection, the two largest groups are 60° apart. What is that relationship called?',accepted:['gauche'],success:'Yes. Staggered with the large groups 60° apart is gauche.',correction:'Anti is 180° apart. The staggered 60° relationship is gauche.'}
    },
    C2:{
      hint:'If front and back bonds line up when viewed down the C-C bond, the conformation is eclipsed.',
      concept:'An eclipsed conformation occurs when bonds on the front carbon line up with bonds on the back carbon in the Newman view. Their dihedral angle is 0°, and torsional strain is higher than in a staggered arrangement.',
      start:'Look at whether the front and back bonds overlap in the viewing direction. If they line up, call it eclipsed. If they are offset, call it staggered.',
      prerequisite:'The prerequisite is knowing which three bonds belong to the front carbon and which three belong to the back carbon in a Newman projection.',
      stuck:'Do not focus on which substituent is largest yet. First decide alignment. Bonds directly behind one another = eclipsed.',
      example:'If every back C-H bond sits directly behind a front C-H bond, the Newman projection is eclipsed and has maximum torsional overlap for that rotation.',
      alternate:'Think of two three-blade fans viewed from the front. If the back blades hide behind the front blades, they are eclipsed. If you can see them between the front blades, they are staggered.',
      check:{prompt:'When the front and back bonds in a Newman projection are offset by 60° instead of lining up, what general conformation is this?',accepted:['staggered'],success:'Correct. Offset bonds are staggered.',correction:'Aligned bonds are eclipsed; bonds offset by 60° are staggered.'}
    },
    Y1:{
      hint:'Bulky substituents prefer the position that avoids 1,3-diaxial crowding: equatorial.',
      concept:'In a monosubstituted cyclohexane chair, a bulky substituent is usually more stable equatorial. An axial bulky group has unfavorable 1,3-diaxial interactions with other axial hydrogens on the ring.',
      start:'Identify whether the substituent is axial or equatorial in each chair. For a bulky group, choose the orientation with less steric crowding. That is usually equatorial.',
      prerequisite:'The prerequisite is distinguishing axial bonds from equatorial bonds on a cyclohexane chair. If those directions are not visually clear, practice identifying them before comparing stability.',
      stuck:'If both chairs look similar, focus only on the bulky group. Axial points roughly up/down and crowds axial hydrogens; equatorial points outward and is less crowded.',
      example:'tert-Butylcyclohexane strongly prefers the chair with tert-butyl equatorial because the axial version creates severe 1,3-diaxial interactions.',
      alternate:'Picture the bulky group needing elbow room. Axial puts it into the crowded vertical lane; equatorial points it outward into open space.',
      check:{prompt:'A tert-butyl group on cyclohexane is generally more stable axial or equatorial?',accepted:['equatorial'],success:'Exactly. A bulky tert-butyl group strongly prefers equatorial.',correction:'The bulky group avoids 1,3-diaxial crowding when it is equatorial.'}
    },
    Y2:{
      hint:'A saturated ring has two fewer hydrogens than the matching acyclic alkane, giving CnH2n.',
      concept:'A saturated monocyclic cycloalkane follows CnH2n. Closing an acyclic alkane chain into one ring removes two hydrogens compared with CnH2n+2.',
      start:'First confirm there is one ring and no double bond. Then use the monocyclic saturated formula CnH2n.',
      prerequisite:'The prerequisite is distinguishing an acyclic alkane from a cycloalkane. A single ring changes the hydrogen count by two.',
      stuck:'Keep the carbon count as n. For one saturated ring, the hydrogen subscript is simply 2n, with no +2.',
      example:'Cyclohexane has six carbons and formula C6H12. That matches CnH2n with n=6.',
      alternate:'Start with the acyclic alkane formula CnH2n+2. Forming one ring connects the two ends and costs one H from each end, leaving CnH2n.',
      check:{prompt:'What is the molecular formula of saturated monocyclic cyclohexane?',accepted:['c6h12','C6H12','c 6 h 12'],success:'Correct. Six carbons in one saturated ring gives C6H12.',correction:'Use CnH2n for one saturated ring. With n=6, the formula is C6H12.'}
    }
  });

  function planFor(itemId){return P[itemId]||null;}
  function textFor(plan,reason){
    if(!plan)return null;
    if(reason===R.DONT_UNDERSTAND)return plan.concept;
    if(reason===R.DONT_KNOW_START)return plan.start;
    if(reason===R.FORGOT_PREREQUISITE)return plan.prerequisite;
    if(reason===R.STARTED_STUCK)return plan.stuck;
    if(reason===R.SHOW_EXAMPLE)return plan.example;
    if(reason===R.EXPLANATION_NOT_MAKING_SENSE)return plan.alternate;
    return null;
  }
  function labelFor(reason){const x=REASONS.find(r=>r.id===reason);return x?x.label:reason;}
  function hintFor(itemId,fallback){const p=planFor(itemId);return p&&p.hint?p.hint:fallback;}

  return {REASONS,planFor,textFor,labelFor,hintFor};
});
