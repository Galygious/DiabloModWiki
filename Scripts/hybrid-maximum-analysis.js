// HYBRID Maximum Analysis - Mix Magic, Set, and Unique Items
const fs = require('fs');

console.log('🔍 HYBRID MAXIMUM +ALL SKILLS ANALYSIS');
console.log('Mixing magic, set, and unique items for optimal combinations\n');

// All viable options by slot (regardless of item type)
const slotOptions = {
  'Weapon': {
    unique: { name: 'Flanged Mace', value: 5, type: 'unique' },
    magic: { name: 'Elysian Weapon of Ice Bolts', value: 8, type: 'magic', note: 'Requires Sorceress + knife' },
    magicAlt: { name: 'Trump Weapon of Life', value: 7, type: 'magic', note: 'More accessible' },
    set: { name: 'None viable', value: 0, type: 'set' }
  },
  'Shield': {
    unique: { name: 'Large Shield', value: 2, type: 'unique' },
    magic: { name: 'Tangerine Shield of Life', value: 6, type: 'magic', note: 'Farm low-level areas' },
    set: { name: 'None viable', value: 0, type: 'set' }
  },
  'Helmet': {
    unique: { name: 'Full Helm', value: 2, type: 'unique' },
    magic: { name: 'Tangerine Circlet of Life', value: 6, type: 'magic', note: 'Farm low-level areas' },
    set: { name: 'None viable', value: 0, type: 'set' }
  },
  'Amulet': {
    unique: { name: 'Amulet', value: 2, type: 'unique' },
    magic: { name: 'Tangerine Amulet of Craftsmanship', value: 6, type: 'magic', note: 'Farm low-level areas' },
    magicAlt: { name: 'Chromatic Amulet of the Ox', value: 4, type: 'magic', note: 'High-level alternative' },
    set: { name: 'None viable', value: 0, type: 'set' }
  },
  'Chest Armor': {
    unique: { name: 'shadow plate', value: 4, type: 'unique' },
    magic: { name: 'Tangerine Armor of Life', value: 6, type: 'magic', note: 'Farm low-level areas' },
    set: { name: 'None viable', value: 0, type: 'set' }
  },
  'Belt': {
    unique: { name: 'Mesh Belt', value: 2, type: 'unique' },
    magic: { name: 'Belt of the Ox', value: 2, type: 'magic' },
    set: { name: 'Death\'s Disguise Belt (2pc)', value: 3, type: 'set', note: 'Net +1 if paired with gloves' }
  },
  'Ring': {
    unique: { name: 'Ring', value: 2, type: 'unique' },
    magic: { name: 'Tangerine Ring of Craftsmanship', value: 6, type: 'magic', note: 'Farm low-level areas' },
    set: { name: 'None viable', value: 0, type: 'set' }
  },
  'Boots': {
    unique: { name: 'War Boots', value: 2, type: 'unique' },
    magic: { name: 'Dragon\'s Boots of Fortune', value: 3, type: 'magic', note: 'Frequency 0 - very rare' },
    set: { name: 'None viable', value: 0, type: 'set' }
  },
  'Gloves': {
    unique: { name: 'Sharkskin Gloves', value: 2, type: 'unique' },
    magic: { name: 'Cobalt Gloves of Fortune', value: 4, type: 'magic', note: 'High level + frequency 0' },
    set: { name: 'Death\'s Disguise Gloves (2pc)', value: 3, type: 'set', note: 'Net +1 if paired with belt' }
  }
};

// Calculate different hybrid strategies
const strategies = [];

// Strategy 1: Pure Magic (Tangerine farming approach)
let magicBuild = {
  name: 'Pure Magic (Tangerine Farming)',
  description: 'Farm Tangerine items from low-level areas',
  slots: {},
  total: 0
};

Object.entries(slotOptions).forEach(([slot, options]) => {
  // Prefer Tangerine magic items, fallback to best available
  let best = options.magic || options.magicAlt || options.unique;
  magicBuild.slots[slot] = best;
  magicBuild.total += slot === 'Ring' ? best.value * 2 : best.value;
});

strategies.push(magicBuild);

// Strategy 2: Hybrid Magic + Set (Death's Disguise 2pc)
let hybridBuild = {
  name: 'Hybrid Magic + Set (Death\'s Disguise)',
  description: 'Use Death\'s Disguise 2pc + magic items elsewhere',
  slots: {},
  total: 0
};

Object.entries(slotOptions).forEach(([slot, options]) => {
  if (slot === 'Belt' || slot === 'Gloves') {
    // Use Death's Disguise pieces
    hybridBuild.slots[slot] = options.set;
    hybridBuild.total += 2; // Individual item value (set bonus calculated separately)
  } else {
    // Use best magic item
    let best = options.magic || options.magicAlt || options.unique;
    hybridBuild.slots[slot] = best;
    hybridBuild.total += slot === 'Ring' ? best.value * 2 : best.value;
  }
});

// Add Death's Disguise set bonus
hybridBuild.total += 5; // 2pc set bonus
hybridBuild.total -= 4; // Subtract individual belt+gloves values to avoid double counting

strategies.push(hybridBuild);

// Strategy 3: Optimal Slot-by-Slot (no restrictions)
let optimalBuild = {
  name: 'Optimal Slot-by-Slot',
  description: 'Best item for each slot regardless of type',
  slots: {},
  total: 0
};

Object.entries(slotOptions).forEach(([slot, options]) => {
  // Find the highest value option
  let best = Object.values(options).reduce((best, current) => {
    return current.value > best.value ? current : best;
  }, { value: 0 });
  
  optimalBuild.slots[slot] = best;
  optimalBuild.total += slot === 'Ring' ? best.value * 2 : best.value;
});

strategies.push(optimalBuild);

// Strategy 4: Realistic High-Level Magic
let realisticBuild = {
  name: 'Realistic High-Level Magic',
  description: 'Avoid frequency 0 and low-level farming',
  slots: {},
  total: 0
};

Object.entries(slotOptions).forEach(([slot, options]) => {
  // Prefer high-level magic alternatives or unique items
  let best = options.magicAlt || options.unique;
  if (options.magic && !options.magic.note?.includes('Farm low-level') && !options.magic.note?.includes('frequency 0')) {
    best = options.magic;
  }
  
  realisticBuild.slots[slot] = best;
  realisticBuild.total += slot === 'Ring' ? best.value * 2 : best.value;
});

strategies.push(realisticBuild);

// Display results
console.log('🏆 STRATEGY COMPARISON:\n');

strategies.sort((a, b) => b.total - a.total);

strategies.forEach((strategy, index) => {
  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
  console.log(`${medal} ${strategy.name}: +${strategy.total} All Skills`);
  console.log(`   ${strategy.description}\n`);
});

// Detailed breakdown of the winning strategy
const winner = strategies[0];
console.log(`🔥 DETAILED BREAKDOWN - ${winner.name}:\n`);

Object.entries(winner.slots).forEach(([slot, item]) => {
  const slotTotal = slot === 'Ring' ? `+${item.value * 2} (2x rings)` : `+${item.value}`;
  console.log(`${slot}: ${item.name} ${slotTotal} [${item.type}]`);
  if (item.note) {
    console.log(`   💡 ${item.note}`);
  }
});

console.log(`\n💥 TOTAL: +${winner.total} ALL SKILLS`);

// Key insights
console.log('\n💡 KEY INSIGHTS:');
console.log('1. Tangerine (+4) IS viable - just farm it from low-level areas!');
console.log('2. Mixed builds can outperform pure strategies');
console.log('3. Magic items dominate when level restrictions are worked around');
console.log('4. Rings provide the biggest magic advantage (+6 vs +2 unique)');
console.log('5. Set bonuses become less relevant with proper magic farming');

console.log('\n✨ Hybrid analysis complete!'); 