// FIXED Comprehensive Set Analysis - ALL sets with +All Skills bonuses
const fs = require('fs');

console.log('🔍 FIXED COMPREHENSIVE SET ANALYSIS - ALL SETS');
console.log('Finding optimal partial set combinations across ALL sets...\n');

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

const EQUIPMENT_SLOTS = {
  'Weapon (1H)': ['hax', 'axe', '2ax', 'mpi', 'wax', 'lax', 'bax', 'btx', 'gax', 'gix', 'wnd', 'ywn', 'bwn', 'gwn', 'clb', 'scp', 'gsc', 'wsp', 'spc', 'mac', 'mst', 'fla', 'whm', 'mau', 'gma', 'ssd', 'scm', 'sbr', 'flc', 'crs', 'bsd', 'lsd', 'wsd', 'dgr', 'dir', 'kri', 'bld'],
  'Weapon (2H)': ['2hs', 'clm', 'gis', 'bsw', 'flb', 'gsd', 'spr', 'tri', 'brn', 'spt', 'pik', 'bar', 'vou', 'scy', 'pax', 'hal', 'wsc', 'sst', 'lst', 'cst', 'bst', 'wst', 'sbw', 'hbw', 'lbw', 'cbw', 'sbb', 'lbb', 'swb', 'lwb', 'lxb', 'mxb', 'hxb', 'rxb'],
  'Shield/Off-hand': ['buc', 'sml', 'lrg', 'bsh', 'spk', 'kit', 'tow', 'gts'],
  'Helmet': ['cap', 'skp', 'hlm', 'fhl', 'bhm', 'ghm', 'crn', 'msk'],
  'Amulet': ['amu'],
  'Chest Armor': ['qui', 'lea', 'hla', 'stu', 'rng', 'scl', 'chn', 'brs', 'spl', 'plt', 'fld', 'gth', 'ful', 'aar', 'ltp'],
  'Belt': ['lbl', 'vbl', 'mbl', 'tbl', 'hbl'],
  'Ring': ['rin'],
  'Boots': ['lbt', 'vbt', 'mbt', 'tbt', 'hbt'],
  'Gloves': ['lgl', 'vgl', 'mgl', 'tgl', 'hgl']
};

function parseSetItems(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) return [];
  
  const header = lines[0].split('\t');
  const items = [];
  
  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split('\t');
    if (columns.length < header.length) continue;
    
    const item = {
      name: columns[header.indexOf('*ItemName')] || 'Unknown',
      code: columns[header.indexOf('item')] || '', // FIXED: using 'item' column
      setName: columns[header.indexOf('set')] || '',
      setBonuses: []
    };
    
    // Parse SET BONUS properties (aprop1a=2piece, aprop2a=3piece, etc.)
    for (let bonusNum = 1; bonusNum <= 5; bonusNum++) {
      for (const variant of ['a', 'b']) {
        const propIndex = header.indexOf(`aprop${bonusNum}${variant}`);
        const minIndex = header.indexOf(`amin${bonusNum}${variant}`);
        const maxIndex = header.indexOf(`amax${bonusNum}${variant}`);
        
        if (propIndex !== -1 && columns[propIndex]) {
          const prop = columns[propIndex].trim();
          const min = parseInt(columns[minIndex]) || 0;
          const max = parseInt(columns[maxIndex]) || 0;
          
          if (prop === 'allskills') {
            item.setBonuses.push({ 
              prop, min, max, 
              piecesRequired: bonusNum + 1, // aprop1 = 2 pieces, aprop2 = 3 pieces, etc.
              variant: variant
            });
          }
        }
      }
    }
    
    items.push(item);
  }
  
  return items;
}

function getSlotForItem(code) {
  for (const [slot, codes] of Object.entries(EQUIPMENT_SLOTS)) {
    if (codes.includes(code)) {
      return slot;
    }
  }
  return null;
}

// Parse set items
const setItems = parseSetItems('Sample Mods/RandoFun4/RandoFun4.mpq/data/global/excel/setitems.txt');

// Group set items by set name
const setsByName = {};
setItems.forEach(item => {
  if (!setsByName[item.setName]) {
    setsByName[item.setName] = [];
  }
  setsByName[item.setName].push(item);
});

// Analyze sets with +All Skills bonuses
const setsWithAllSkills = [];

Object.entries(setsByName).forEach(([setName, items]) => {
  const allSkillsBonuses = [];
  const setSlots = [];
  
  items.forEach(item => {
    const slot = getSlotForItem(item.code);
    if (slot) {
      setSlots.push(slot);
    }
    
    item.setBonuses.forEach(bonus => {
      if (bonus.prop === 'allskills') {
        allSkillsBonuses.push({
          piecesRequired: bonus.piecesRequired,
          value: Math.max(bonus.min, bonus.max)
        });
      }
    });
  });
  
  if (allSkillsBonuses.length > 0) {
    // Calculate progressive bonuses
    const progressiveBonuses = {};
    let cumulativeBonus = 0;
    
    for (let pieces = 2; pieces <= items.length; pieces++) {
      const bonusesForThisPieceCount = allSkillsBonuses.filter(b => b.piecesRequired === pieces);
      if (bonusesForThisPieceCount.length > 0) {
        const bonusValue = bonusesForThisPieceCount.reduce((sum, b) => sum + b.value, 0);
        cumulativeBonus += bonusValue;
      }
      progressiveBonuses[pieces] = cumulativeBonus;
    }
    
    setsWithAllSkills.push({
      setName,
      items,
      setSlots: [...new Set(setSlots)], // Remove duplicates
      progressiveBonuses,
      maxBonus: cumulativeBonus
    });
  }
});

console.log(`📊 Found ${setsWithAllSkills.length} sets with +All Skills bonuses`);

// Calculate optimal strategies for each set
const allStrategies = [];

// Base strategy: Pure Individual (fixed calculation)
const pureIndividualTotal = 5 + 2 + 2 + 2 + 4 + 2 + 4 + 2 + 2; // All individual items including 2x rings
allStrategies.push({
  strategy: 'Pure Individual Items',
  setName: 'None',
  piecesUsed: 0,
  slotsOccupied: [],
  setBonus: 0,
  total: pureIndividualTotal
});

console.log(`\n🔥 Base Strategy: Pure Individual = +${pureIndividualTotal} All Skills`);

// Calculate strategies for each set
setsWithAllSkills.forEach(set => {
  Object.entries(set.progressiveBonuses).forEach(([pieces, setBonus]) => {
    const piecesNum = parseInt(pieces);
    if (setBonus > 0) {
      
      // Find the least valuable slots this set occupies
      const relevantSlots = set.setSlots.filter(slot => slot !== 'Ring'); // Handle rings separately
      const slotValues = relevantSlots.map(slot => [slot, bestIndividualItems[slot] || 0]);
      slotValues.sort((a, b) => a[1] - b[1]); // Sort by value ascending
      
      const slotsToSacrifice = slotValues.slice(0, Math.min(piecesNum, slotValues.length));
      const individualLoss = slotsToSacrifice.reduce((sum, [slot, value]) => sum + value, 0);
      
      const total = setBonus + (pureIndividualTotal - individualLoss);
      
      if (total > pureIndividualTotal) { // Only include if it beats pure individual
        allStrategies.push({
          strategy: `${piecesNum}-piece ${set.setName}`,
          setName: set.setName,
          piecesUsed: piecesNum,
          slotsOccupied: slotsToSacrifice.map(([slot]) => slot),
          setBonus,
          individualLoss,
          total
        });
      }
    }
  });
});

// Sort strategies by total
allStrategies.sort((a, b) => b.total - a.total);

console.log('\n🏆 TOP 10 STRATEGIES:');
allStrategies.slice(0, 10).forEach((strategy, index) => {
  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
  console.log(`${medal} ${strategy.strategy}: +${strategy.total} All Skills`);
  if (strategy.setBonus > 0) {
    console.log(`    📈 Set bonus: +${strategy.setBonus}, 📉 Individual loss: -${strategy.individualLoss || 0}, 📊 Net: +${strategy.setBonus - strategy.individualLoss}`);
    console.log(`    🔒 Slots used: ${strategy.slotsOccupied.join(', ') || 'None'}`);
  }
});

console.log('');
console.log(`💡 GLOBAL OPTIMAL: ${allStrategies[0].strategy} (+${allStrategies[0].total} All Skills)`);

console.log('\n✨ Fixed comprehensive analysis complete!'); 