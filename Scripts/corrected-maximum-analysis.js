// CORRECTED Maximum Analysis - Realistic Constraints
const fs = require('fs');

console.log('🔍 CORRECTED MAXIMUM +ALL SKILLS ANALYSIS');
console.log('Using only viable combinations with realistic constraints\n');

// Based on realistic analysis, here are the ACTUALLY viable options:

// ENDGAME VIABLE PREFIXES (Level 86-99):
const viablePrefixes = {
  'Elysian': { value: 5, items: ['weap'], level: 45, freq: 1, group: 123 },
  'Trump': { value: 5, items: ['weap'], level: 50, freq: 7, group: 111 },
  'Bone': { value: 4, items: ['jewl'], level: 32, freq: 4, group: 101 },
  'Red': { value: 4, items: ['mcha'], level: 30, freq: 4, group: 103 },
  'Rugged': { value: 4, items: ['scha'], level: 1, freq: 4, group: 109 },
  'Chromatic': { value: 2, items: ['amul', 'circ'], level: 55, freq: 3, group: 116 },
  'Dragon\'s': { value: 1, items: ['tors', 'helm', 'boot', 'glov'], level: 52, freq: 0, group: 118 },
  'Viridian': { value: 1, items: ['tors', 'helm', 'shld', 'scep', 'staf', 'ring', 'amul'], level: 18, freq: 0, group: 124 }
};

// ENDGAME VIABLE SUFFIXES (Level 86-99):
const viableSuffixes = {
  'of Ice Bolts': { value: 3, items: ['knif'], level: 14, freq: 1, group: 44, classReq: 'sor' },
  'of Craftsmanship': { value: 2, items: ['weap', 'ring', 'amul'], level: 1, freq: 0, group: 13 },
  'of Fortune': { value: 2, items: ['boot', 'glov', 'amul'], level: 16, freq: 0, group: 23 },
  'of Life': { value: 2, items: ['tors', 'shld', 'circ'], level: 41, freq: 4, group: 1 },
  'of the Ox': { value: 2, items: ['amul', 'belt', 'club', 'hamm', 'circ'], level: 26, freq: 3, group: 31 },
  'of Light': { value: 1, items: ['armo', 'rod', 'miss', 'ring', 'amul'], level: 6, freq: 0, group: 26 }
};

// Map item codes to slots
const ITEM_TO_SLOT = {
  'weap': 'Weapon',
  'mele': 'Weapon',
  'knif': 'Weapon',
  'staf': 'Weapon (2H)',
  'wand': 'Weapon (1H)',
  'shld': 'Shield',
  'helm': 'Helmet',
  'circ': 'Helmet',
  'tors': 'Chest Armor',
  'armo': 'Chest Armor',
  'boot': 'Boots',
  'glov': 'Gloves',
  'belt': 'Belt',
  'ring': 'Ring',
  'amul': 'Amulet',
  'jewl': 'Jewel (socketable)'
};

// Calculate best realistic combinations by slot
const slots = ['Weapon', 'Shield', 'Helmet', 'Amulet', 'Chest Armor', 'Belt', 'Ring', 'Boots', 'Gloves'];

console.log('🎯 REALISTIC MAXIMUM BY SLOT:\n');

let totalRealistic = 0;
const realisticBuild = {};

slots.forEach(slot => {
  let bestCombination = { prefix: null, suffix: null, total: 0 };
  
  // Find best prefix for this slot
  Object.entries(viablePrefixes).forEach(([prefixName, prefix]) => {
    prefix.items.forEach(itemType => {
      if (ITEM_TO_SLOT[itemType] === slot && prefix.freq > 0) { // Only non-zero frequency
        
        // Find best compatible suffix
        let bestSuffix = null;
        Object.entries(viableSuffixes).forEach(([suffixName, suffix]) => {
          suffix.items.forEach(suffixItemType => {
            if (ITEM_TO_SLOT[suffixItemType] === slot && 
                suffix.freq > 0 && // Only non-zero frequency
                suffix.group !== prefix.group) { // No group conflict
              
              if (!bestSuffix || suffix.value > bestSuffix.value) {
                bestSuffix = { name: suffixName, value: suffix.value };
              }
            }
          });
        });
        
        const total = prefix.value + (bestSuffix?.value || 0);
        if (total > bestCombination.total) {
          bestCombination = {
            prefix: { name: prefixName, value: prefix.value },
            suffix: bestSuffix,
            total: total
          };
        }
      }
    });
  });
  
  // Also check suffix-only options
  Object.entries(viableSuffixes).forEach(([suffixName, suffix]) => {
    suffix.items.forEach(itemType => {
      if (ITEM_TO_SLOT[itemType] === slot && suffix.freq > 0) {
        if (suffix.value > bestCombination.total) {
          bestCombination = {
            prefix: null,
            suffix: { name: suffixName, value: suffix.value },
            total: suffix.value
          };
        }
      }
    });
  });
  
  realisticBuild[slot] = bestCombination;
  const slotTotal = slot === 'Ring' ? bestCombination.total * 2 : bestCombination.total;
  totalRealistic += slotTotal;
  
  console.log(`${slot}: +${bestCombination.total} All Skills`);
  if (bestCombination.prefix) {
    console.log(`  🔴 Prefix: ${bestCombination.prefix.name} (+${bestCombination.prefix.value})`);
  }
  if (bestCombination.suffix) {
    console.log(`  🔵 Suffix: ${bestCombination.suffix.name} (+${bestCombination.suffix.value})`);
  }
  if (bestCombination.total === 0) {
    console.log(`  ❌ No viable magic options found`);
  }
  if (slot === 'Ring') {
    console.log(`  💍 Ring total: +${slotTotal} (2x rings)`);
  }
  console.log('');
});

console.log(`🏆 REALISTIC MAGIC MAXIMUM: +${totalRealistic} ALL SKILLS\n`);

// Compare to previous analysis
console.log('📊 CORRECTED COMPARISON:');
console.log('Previous unrealistic estimate: +59 All Skills');
console.log(`Corrected realistic maximum: +${totalRealistic} All Skills`);
console.log('Pure unique items: +25 All Skills');
console.log('Best set strategy: +26 All Skills');
console.log('');

if (totalRealistic > 26) {
  console.log(`🎉 Magic items still win by +${totalRealistic - 26} over sets!`);
} else if (totalRealistic > 25) {
  console.log(`🎉 Magic items still win by +${totalRealistic - 25} over pure unique!`);
} else {
  console.log('😅 Magic items are not as powerful as initially thought...');
}

console.log('\n💡 KEY REALISTIC INSIGHTS:');
console.log('1. Level caps severely limit high-value prefixes');
console.log('2. Frequency 0 means many combinations are practically impossible');
console.log('3. Group conflicts prevent optimal prefix+suffix stacking');
console.log('4. Best realistic prefix: Elysian/Trump (+5) on weapons');
console.log('5. Best realistic suffix: of Life (+2) with frequency 4');

console.log('\n✨ Corrected analysis complete!'); 