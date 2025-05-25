console.log('🎯 CORRECTED OPTIMAL STRATEGY ANALYSIS');
console.log('');

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

// Iratha's Finery 11 set pieces (only these slots have Iratha pieces)
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

// Strategy 2: 1 Iratha Piece + Individual Items
// Find the LEAST valuable Iratha slot to sacrifice
const irathaSlotValues = irathaSlots.map(slot => [slot, bestIndividualItems[slot]]);
irathaSlotValues.sort((a, b) => a[1] - b[1]); // Sort by value, ascending
const leastValuableIrathaSlot = irathaSlotValues[0];

const oneIrathaTotal = 3 + (pureIndividualTotal - leastValuableIrathaSlot[1]);
console.log('🎯 Strategy 2: 1 Iratha Piece + Individual Items');
console.log(`  🔄 Set Bonus: +3 All Skills`);
console.log(`  📉 Use Iratha piece in ${leastValuableIrathaSlot[0]} (sacrificing +${leastValuableIrathaSlot[1]} individual bonus)`);
console.log(`  📈 Keep all other individual items: +${pureIndividualTotal - leastValuableIrathaSlot[1]}`);
console.log(`📊 Total: +${oneIrathaTotal} All Skills`);
console.log('');

// Strategy 3: 4 Iratha Pieces + Individual Items  
let lostFromAllIrathaSlots = 0;
irathaSlots.forEach(slot => {
  lostFromAllIrathaSlots += bestIndividualItems[slot];
});

const fourIrathaTotal = 7 + (pureIndividualTotal - lostFromAllIrathaSlots);
console.log('🎯 Strategy 3: 4 Iratha Pieces + Individual Items');
console.log(`  🔄 Set Bonus: +7 All Skills`);
console.log(`  📉 Use all Iratha pieces: ${irathaSlots.join(', ')} (sacrificing +${lostFromAllIrathaSlots} individual bonuses)`);
console.log(`  📈 Keep remaining individual items: +${pureIndividualTotal - lostFromAllIrathaSlots}`);
console.log(`📊 Total: +${fourIrathaTotal} All Skills`);
console.log('');

// Find the winner
const strategies = [
  { name: 'Pure Individual', total: pureIndividualTotal },
  { name: '1 Iratha Piece', total: oneIrathaTotal },
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

if (strategies[0].name === '1 Iratha Piece') {
  console.log(`   💭 Wear any 1 Iratha piece (best: ${leastValuableIrathaSlot[0]}) for +3 set bonus`);
  console.log(`   💭 Net gain over pure individual: +${strategies[0].total - strategies.find(s => s.name === 'Pure Individual').total}`);
} 