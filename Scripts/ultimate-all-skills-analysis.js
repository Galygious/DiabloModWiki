// ULTIMATE +All Skills Analysis - Including Magic/Rare Prefix/Suffix Combinations
const fs = require('fs');

console.log('🔍 ULTIMATE +ALL SKILLS ANALYSIS');
console.log('Including unique items, set bonuses, AND magic/rare prefix/suffix combinations\n');

// Parse magic prefixes with +All Skills
function parseMagicPrefixes(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const header = lines[0].split('\t');
  const prefixes = [];
  
  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split('\t');
    if (columns.length < header.length) continue;
    
    const name = columns[header.indexOf('Name')] || '';
    const level = parseInt(columns[header.indexOf('level')]) || 0;
    const classSpecific = columns[header.indexOf('classspecific')] || '';
    
    // Look for allskills property
    for (let modNum = 1; modNum <= 3; modNum++) {
      const modCodeIndex = header.indexOf(`mod${modNum}code`);
      const modMinIndex = header.indexOf(`mod${modNum}min`);
      const modMaxIndex = header.indexOf(`mod${modNum}max`);
      
      if (modCodeIndex !== -1 && columns[modCodeIndex] === 'allskills') {
        const min = parseInt(columns[modMinIndex]) || 0;
        const max = parseInt(columns[modMaxIndex]) || 0;
        const value = Math.max(min, max);
        
        if (value > 0) {
          // Parse item types
          const itemTypes = [];
          for (let typeNum = 1; typeNum <= 7; typeNum++) {
            const typeIndex = header.indexOf(`itype${typeNum}`);
            if (typeIndex !== -1 && columns[typeIndex]) {
              itemTypes.push(columns[typeIndex]);
            }
          }
          
          prefixes.push({
            name,
            value,
            level,
            classSpecific,
            itemTypes,
            type: 'prefix'
          });
        }
      }
    }
  }
  
  return prefixes;
}

// Parse magic suffixes with +All Skills
function parseMagicSuffixes(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const header = lines[0].split('\t');
  const suffixes = [];
  
  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split('\t');
    if (columns.length < header.length) continue;
    
    const name = columns[header.indexOf('Name')] || '';
    const level = parseInt(columns[header.indexOf('level')]) || 0;
    const classSpecific = columns[header.indexOf('classspecific')] || '';
    
    // Look for allskills property
    for (let modNum = 1; modNum <= 3; modNum++) {
      const modCodeIndex = header.indexOf(`mod${modNum}code`);
      const modMinIndex = header.indexOf(`mod${modNum}min`);
      const modMaxIndex = header.indexOf(`mod${modNum}max`);
      
      if (modCodeIndex !== -1 && columns[modCodeIndex] === 'allskills') {
        const min = parseInt(columns[modMinIndex]) || 0;
        const max = parseInt(columns[modMaxIndex]) || 0;
        const value = Math.max(min, max);
        
        if (value > 0) {
          // Parse item types
          const itemTypes = [];
          for (let typeNum = 1; typeNum <= 7; typeNum++) {
            const typeIndex = header.indexOf(`itype${typeNum}`);
            if (typeIndex !== -1 && columns[typeIndex]) {
              itemTypes.push(columns[typeIndex]);
            }
          }
          
          suffixes.push({
            name,
            value,
            level,
            classSpecific,
            itemTypes,
            type: 'suffix'
          });
        }
      }
    }
  }
  
  return suffixes;
}

// Map item types to equipment slots
const SLOT_MAPPING = {
  'weap': ['Weapon (1H)', 'Weapon (2H)'],
  'mele': ['Weapon (1H)', 'Weapon (2H)'],
  'miss': ['Weapon (2H)'],
  'wand': ['Weapon (1H)'],
  'staf': ['Weapon (2H)'],
  'orb': ['Shield/Off-hand'],
  'shld': ['Shield/Off-hand'],
  'helm': ['Helmet'],
  'armo': ['Chest Armor'],
  'tors': ['Chest Armor'],
  'boot': ['Boots'],
  'glov': ['Gloves'],
  'belt': ['Belt'],
  'ring': ['Ring'],
  'amul': ['Amulet'],
  'circ': ['Helmet']
};

function getSlotForItemType(itemType) {
  return SLOT_MAPPING[itemType] || [];
}

// Best individual unique items by slot (from previous analysis)
const bestUniqueItems = {
  'Weapon (1H)': 5,     // Flanged Mace
  'Weapon (2H)': 4,     // Long War Bow
  'Shield/Off-hand': 2, // Large Shield  
  'Helmet': 2,          // Full Helm
  'Amulet': 2,          // Amulet
  'Chest Armor': 4,     // shadow plate
  'Belt': 2,            // Mesh Belt
  'Ring': 2,            // Ring (x2 = +4 total)
  'Boots': 2,           // War Boots
  'Gloves': 2           // Sharkskin Gloves
};

// Parse magic prefixes and suffixes
const prefixes = parseMagicPrefixes('Sample Mods/RandoFun4/RandoFun4.mpq/data/global/excel/magicprefix.txt');
const suffixes = parseMagicSuffixes('Sample Mods/RandoFun4/RandoFun4.mpq/data/global/excel/magicsuffix.txt');

console.log(`📊 Found ${prefixes.length} prefixes with +All Skills`);
console.log(`📊 Found ${suffixes.length} suffixes with +All Skills`);

// Find best magic combinations by slot
const magicCombinations = {};

// For each equipment slot
Object.keys(bestUniqueItems).forEach(slot => {
  magicCombinations[slot] = {
    bestPrefix: null,
    bestSuffix: null,
    maxCombination: 0,
    uniqueBest: bestUniqueItems[slot]
  };
  
  // Find best prefix for this slot
  prefixes.forEach(prefix => {
    prefix.itemTypes.forEach(itemType => {
      const slots = getSlotForItemType(itemType);
      if (slots.includes(slot)) {
        if (!magicCombinations[slot].bestPrefix || prefix.value > magicCombinations[slot].bestPrefix.value) {
          magicCombinations[slot].bestPrefix = prefix;
        }
      }
    });
  });
  
  // Find best suffix for this slot
  suffixes.forEach(suffix => {
    suffix.itemTypes.forEach(itemType => {
      const slots = getSlotForItemType(itemType);
      if (slots.includes(slot)) {
        if (!magicCombinations[slot].bestSuffix || suffix.value > magicCombinations[slot].bestSuffix.value) {
          magicCombinations[slot].bestSuffix = suffix;
        }
      }
    });
  });
  
  // Calculate best combination
  const prefixValue = magicCombinations[slot].bestPrefix?.value || 0;
  const suffixValue = magicCombinations[slot].bestSuffix?.value || 0;
  magicCombinations[slot].maxCombination = prefixValue + suffixValue;
});

console.log('\n🎯 MAGIC/RARE POTENTIAL BY SLOT:');
Object.entries(magicCombinations).forEach(([slot, data]) => {
  const prefixStr = data.bestPrefix ? `${data.bestPrefix.name} (+${data.bestPrefix.value})` : 'None';
  const suffixStr = data.bestSuffix ? `${data.bestSuffix.name} (+${data.bestSuffix.value})` : 'None';
  
  console.log(`${slot}:`);
  console.log(`  🔵 Best Unique: +${data.uniqueBest}`);
  console.log(`  🟡 Best Magic: +${data.maxCombination} (${prefixStr} + ${suffixStr})`);
  console.log(`  📈 Magic Advantage: ${data.maxCombination > data.uniqueBest ? '+' : ''}${data.maxCombination - data.uniqueBest}`);
  console.log('');
});

// Calculate total maximums
const totalUnique = Object.values(bestUniqueItems).reduce((sum, val, index) => {
  // Handle rings (2x)
  return sum + (Object.keys(bestUniqueItems)[index] === 'Ring' ? val * 2 : val);
}, 0);

const totalMagic = Object.entries(magicCombinations).reduce((sum, [slot, data]) => {
  return sum + (slot === 'Ring' ? data.maxCombination * 2 : data.maxCombination);
}, 0);

console.log('📊 MAXIMUM TOTALS:');
console.log(`🔵 Pure Unique Items: +${totalUnique} All Skills`);
console.log(`🟡 Pure Magic/Rare Items: +${totalMagic} All Skills`);
console.log(`📈 Magic Advantage: +${totalMagic - totalUnique} All Skills\n`);

// Highlight the most significant upgrades
console.log('🔥 TOP MAGIC UPGRADES:');
const upgrades = Object.entries(magicCombinations)
  .map(([slot, data]) => ({
    slot,
    advantage: data.maxCombination - data.uniqueBest,
    magicValue: data.maxCombination,
    uniqueValue: data.uniqueBest
  }))
  .sort((a, b) => b.advantage - a.advantage)
  .slice(0, 5);

upgrades.forEach((upgrade, index) => {
  if (upgrade.advantage > 0) {
    console.log(`${index + 1}. ${upgrade.slot}: +${upgrade.advantage} advantage (+${upgrade.magicValue} magic vs +${upgrade.uniqueValue} unique)`);
  }
});

console.log('\n✨ Ultimate analysis complete!'); 