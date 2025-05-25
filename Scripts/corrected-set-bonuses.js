console.log('🔧 CORRECTED SET BONUS ANALYSIS - NO 1-PIECE BONUSES');
console.log('Minimum set bonus requires 2 pieces\n');

// Best individual items by slot
const bestIndividualItems = {
  'Weapon (1H)': 5,     // Flanged Mace
  'Shield/Off-hand': 2, // Large Shield  
  'Helmet': 2,          // Full Helm
  'Amulet': 2,          // Amulet
  'Chest Armor': 4,     // shadow plate
  'Belt': 2,            // Mesh Belt
  'Ring': 2,            // Ring (x2 = +4 total)
  'Boots': 2,           // War Boots
  'Gloves': 2           // Sharkskin Gloves
};

// Corrected interpretation of Iratha's Finery 11 progressive bonuses
// Based on the analysis output:
// - "1 pieces: +3" actually means 2-piece bonus = +3
// - "4 pieces: +4" actually means 5-piece bonus = +4  
// - "5 pieces: +1" actually means 6-piece bonus = +1 (but only 4 pieces exist)

const irathaProgression = {
  2: 3,  // 2 pieces = +3 All Skills (what I mistakenly called "1 piece")
  // 3 pieces = +3 All Skills (same as 2 pieces, no additional bonus)
  4: 7,  // 4 pieces = +7 All Skills total (3 + 4 from the analysis)
};

const irathaSlots = ['Helmet', 'Amulet', 'Belt', 'Gloves'];

console.log('📋 STRATEGY COMPARISON:');
console.log('');

// Strategy 1: Pure Individual Items  
let pureIndividualTotal = 0;
console.log('🔥 Strategy 1: Pure Individual Items');
Object.entries(bestIndividualItems).forEach(([slot, value]) => {
  if (slot === 'Ring') {
    console.log(`  ${slot}: +${value} each (x2) = +${value * 2}`);
    pureIndividualTotal += value * 2;
  } else {
    console.log(`  ${slot}: +${value}`);
    pureIndividualTotal += value;
  }
});
console.log(`📊 Total: +${pureIndividualTotal} All Skills`);
console.log('');

// Strategy 2: 2 Iratha Pieces + Individual Items
const irathaSlotValues = irathaSlots.map(slot => [slot, bestIndividualItems[slot]]);
irathaSlotValues.sort((a, b) => a[1] - b[1]); // Sort by value, ascending

const twoLeastValuableSlots = irathaSlotValues.slice(0, 2);
const lostFromTwoSlots = twoLeastValuableSlots.reduce((sum, [slot, value]) => sum + value, 0);

const twoIrathaTotal = irathaProgression[2] + (pureIndividualTotal - lostFromTwoSlots);
console.log('🎯 Strategy 2: 2 Iratha Pieces + Individual Items');
console.log(`  🔄 Set Bonus: +${irathaProgression[2]} All Skills (minimum 2 pieces)`);
console.log(`  📉 Use Iratha pieces in: ${twoLeastValuableSlots.map(([slot, value]) => `${slot} (lose +${value})`).join(', ')}`);
console.log(`  📈 Keep remaining individual items: +${pureIndividualTotal - lostFromTwoSlots}`);
console.log(`📊 Total: +${twoIrathaTotal} All Skills`);
console.log('');

// Strategy 3: 4 Iratha Pieces + Individual Items
let lostFromAllIrathaSlots = 0;
irathaSlots.forEach(slot => {
  lostFromAllIrathaSlots += bestIndividualItems[slot];
});

const fourIrathaTotal = irathaProgression[4] + (pureIndividualTotal - lostFromAllIrathaSlots);
console.log('🎯 Strategy 3: 4 Iratha Pieces + Individual Items');
console.log(`  🔄 Set Bonus: +${irathaProgression[4]} All Skills (all 4 pieces)`);
console.log(`  📉 Use all Iratha pieces: ${irathaSlots.join(', ')} (lose +${lostFromAllIrathaSlots} total)`);
console.log(`  📈 Keep remaining individual items: +${pureIndividualTotal - lostFromAllIrathaSlots}`);
console.log(`📊 Total: +${fourIrathaTotal} All Skills`);
console.log('');

// Find the winner
const strategies = [
  { name: 'Pure Individual', total: pureIndividualTotal },
  { name: '2 Iratha Pieces', total: twoIrathaTotal },
  { name: '4 Iratha Pieces', total: fourIrathaTotal }
];

strategies.sort((a, b) => b.total - a.total);

console.log('🏆 FINAL RESULTS:');
strategies.forEach((strategy, index) => {
  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
  console.log(`  ${medal} ${strategy.name}: +${strategy.total} All Skills`);
});

console.log('');
console.log(`💡 OPTIMAL STRATEGY: ${strategies[0].name} (+${strategies[0].total} All Skills)`);
console.log('');
console.log('✅ Corrected: No 1-piece set bonuses exist in D2');
console.log('📏 Minimum: 2 pieces required for any set bonus'); 