console.log('🎯 OPTIMAL PARTIAL SET STRATEGY ANALYSIS');
console.log('');

// Best individual items by slot (from previous analysis)
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
// Find the LEAST valuable slot to sacrifice for set piece
const slotValues = Object.entries(bestIndividualItems).filter(([slot]) => slot !== 'Ring');
slotValues.sort((a, b) => a[1] - b[1]); // Sort by value, ascending
const leastValuableSlot = slotValues[0];

const oneIrathaTotal = 3 + (pureIndividualTotal - leastValuableSlot[1]); // Set bonus + all except sacrificed slot
console.log('🎯 Strategy 2: 1 Iratha Piece + Individual Items');
console.log(`  🔄 Set Bonus: +3 All Skills`);
console.log(`  📉 Sacrifice: ${leastValuableSlot[0]} (losing +${leastValuableSlot[1]})`);
console.log(`  📈 Keep all other individual items: +${pureIndividualTotal - leastValuableSlot[1]}`);
console.log(`📊 Total: +${oneIrathaTotal} All Skills`);
console.log('');

// Strategy 3: 4 Iratha Pieces + Individual Items
const irathaSlots = ['Helmet', 'Amulet', 'Belt', 'Gloves'];
let lostFromIrathaSlots = 0;
irathaSlots.forEach(slot => {
  lostFromIrathaSlots += bestIndividualItems[slot];
});

const fourIrathaTotal = 7 + (pureIndividualTotal - lostFromIrathaSlots);
console.log('🎯 Strategy 3: 4 Iratha Pieces + Individual Items');
console.log(`  🔄 Set Bonus: +7 All Skills`);
console.log(`  📉 Sacrifice: Helmet (+${bestIndividualItems['Helmet']}), Amulet (+${bestIndividualItems['Amulet']}), Belt (+${bestIndividualItems['Belt']}), Gloves (+${bestIndividualItems['Gloves']}) = +${lostFromIrathaSlots} lost`);
console.log(`  📈 Keep remaining individual items: +${pureIndividualTotal - lostFromIrathaSlots}`);
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
  console.log(`   💭 Use 1 piece in ${leastValuableSlot[0]} slot for +3 set bonus`);
  console.log(`   💭 This beats pure individual by +${strategies[0].total - strategies[2].total}!`);
} 