// FINAL Comprehensive Set Analysis - ALL sets with +All Skills bonuses
const fs = require('fs');

console.log('🔍 FINAL COMPREHENSIVE SET ANALYSIS - ALL SETS');
console.log('Finding optimal partial set combinations across ALL sets...\n');

// Best individual items by slot
const bestIndividualItems = {
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

// COMPLETE Equipment slots mapping including ALL expansion and elite codes
const EQUIPMENT_SLOTS = {
  'Weapon (1H)': [
    // Basic
    'hax', 'axe', '2ax', 'mpi', 'wax', 'lax', 'bax', 'btx', 'gax', 'gix', 
    'wnd', 'ywn', 'bwn', 'gwn', 'clb', 'scp', 'gsc', 'wsp', 'spc', 'mac', 
    'mst', 'fla', 'whm', 'mau', 'gma', 'ssd', 'scm', 'sbr', 'flc', 'crs', 
    'bsd', 'lsd', 'wsd', 'dgr', 'dir', 'kri', 'bld',
    // Expansion 
    '9ha', '9ax', '92a', '9mp', '9wa', '9la', '9ba', '9bt', '9ga', '9gi',
    '9wn', '9yw', '9bw', '9gw', '9cl', '9sc', '9qs', '9ws', '9sp', '9ma',
    '9mt', '9fl', '9wh', '9m9', '9gm', '9ss', '9sm', '9sb', '9fc', '9cr',
    '9bs', '9ls', '9wd', '9dg', '9di', '9kr', '9bl', '9ta', '9tw', '9lw',
    '9cs', '9wb',
    // Elite
    '7ha', '7ax', '72a', '7mp', '7wa', '7la', '7ba', '7bt', '7ga', '7gi',
    '7wn', '7yw', '7bw', '7gw', '7cl', '7sc', '7qs', '7ws', '7sp', '7ma', 
    '7mt', '7fl', '7wh', '7m7', '7gm', '7ss', '7sm', '7sb', '7fc', '7cr',
    '7bs', '7ls', '7wd', '7dg', '7di', '7kr', '7bl', '7ta', '7tw', '7lw',
    '7cs', '7wb'
  ],
  'Weapon (2H)': [
    // Basic
    '2hs', 'clm', 'gis', 'bsw', 'flb', 'gsd', 'spr', 'tri', 'brn', 'spt', 
    'pik', 'bar', 'vou', 'scy', 'pax', 'hal', 'wsc', 'sst', 'lst', 'cst', 
    'bst', 'wst', 'sbw', 'hbw', 'lbw', 'cbw', 'sbb', 'lbb', 'swb', 'lwb',
    'lxb', 'mxb', 'hxb', 'rxb',
    // Expansion
    '92h', '9cm', '9gs', '9b9', '9fb', '9gd', '9sr', '9tr', '9br', '9st',
    '9p9', '9b7', '9vo', '9s8', '9pa', '9h9', '9wc', '8ss', '8ls', '8cs',
    '8bs', '8ws', '8sb', '8hb', '8lb', '8cb', '8s8', '8l8', '8sw', '8lw',
    '8lx', '8mx', '8hx', '8rx',
    // Elite  
    '7cm', '7gs', '7b7', '7fb', '7gd', '7sr', '7tr', '7br', '7st',
    '7p7', '7b8', '7vo', '7s8', '7pa', '7h9', '7wc', '6ss', '6ls', '6cs',
    '6bs', '6ws', '6sb', '6hb', '6lb', '6cb', '6s7', '6l7', '6sw', '6lw',
    '6lx', '6mx', '6hx', '6rx', '7m7' // Added Ogre Maul
  ],
  'Shield/Off-hand': [
    // Basic
    'buc', 'sml', 'lrg', 'bsh', 'spk', 'kit', 'tow', 'gts',
    // Expansion
    'xuc', 'xml', 'xrg', 'xsh', 'xpk', 'xit', 'xow', 'xts',
    // Elite
    'uuc', 'uml', 'urg', 'ush', 'upk', 'uit', 'uow', 'uts',
    // Class specific
    'nea', 'neb', 'nec', 'ned', 'nee', 'nef',
    'paa', 'pab', 'pac', 'pad', 'pae', 'paf', 'pa9',
    'dra', 'drb', 'drc', 'drd', 'dre', 'drf',
    'oba', 'obb', 'obc', 'obd', 'obe', 'obf',
    'ama', 'amb', 'amc', 'amd', 'ame', 'amf', 'am7', 'am8', 'am9'
  ],
  'Helmet': [
    // Basic
    'cap', 'skp', 'hlm', 'fhl', 'bhm', 'ghm', 'crn', 'msk',
    // Expansion 
    'xap', 'xkp', 'xlm', 'xhl', 'xhm', 'xrn', 'xsk', 'xh9',
    // Elite
    'uap', 'ukp', 'ulm', 'uhl', 'uhm', 'urn', 'usk', 'uh9',
    // Class specific (including barbarian)
    'baa', 'bab', 'bac', 'bad', 'bae', 'baf', 'ba5', // Added ba5
    'drz', 'dr1', 'dr2', 'dr3', 'dr4', 'dr5', 'dra', 'drb', 'drc', 'drd', 'dre',
    'ci0', 'ci1', 'ci2', 'ci3'
  ],
  'Amulet': ['amu'],
  'Chest Armor': [
    // Basic
    'qui', 'lea', 'hla', 'stu', 'rng', 'scl', 'chn', 'brs', 'spl', 'plt', 
    'fld', 'gth', 'ful', 'aar', 'ltp',
    // Expansion
    'xui', 'xea', 'xla', 'xtu', 'xng', 'xcl', 'xhn', 'xrs', 'xpl', 'xlt',
    'xld', 'xth', 'xul', 'xar', 'xtp',
    // Elite
    'uui', 'uea', 'ula', 'utu', 'ung', 'ucl', 'uhn', 'urs', 'upl', 'ult',
    'uld', 'uth', 'uul', 'uar', 'utp' // uar is Sacred Armor
  ],
  'Belt': [
    // Basic
    'lbl', 'vbl', 'mbl', 'tbl', 'hbl',
    // Expansion
    'zlb', 'zvb', 'zmb', 'ztb', 'zhb', // zhb is War Belt
    // Elite
    'ulc', 'uvc', 'umc', 'utc', 'uhc'
  ],
  'Ring': ['rin'],
  'Boots': [
    // Basic
    'lbt', 'vbt', 'mbt', 'tbt', 'hbt',
    // Expansion  
    'xlb', 'xvb', 'xmb', 'xtb', 'xhb', // xhb is War Boots
    // Elite
    'ulb', 'uvb', 'umb', 'utb', 'uhb'
  ],
  'Gloves': [
    // Basic
    'lgl', 'vgl', 'mgl', 'tgl', 'hgl',
    // Expansion
    'xlg', 'xvg', 'xmg', 'xtg', 'xhg', // xhg is War Gauntlets
    // Elite
    'ulg', 'uvg', 'umg', 'utg', 'uhg'
  ]
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
      code: columns[header.indexOf('item')] || '',
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
              piecesRequired: bonusNum + 1,
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

// Test Immortal King 11 specifically
console.log('🔍 TESTING: Immortal King 11 slot mapping:');
const ikSet = setsByName['Immortal King 11'] || [];
ikSet.forEach(item => {
  const slot = getSlotForItem(item.code);
  console.log(`  ${item.name} (${item.code}) → ${slot || 'UNMAPPED!'}`);
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

console.log(`\n📊 Found ${setsWithAllSkills.length} sets with +All Skills bonuses`);

// Calculate optimal strategies for each set
const allStrategies = [];

// Base strategy: Pure Individual
const pureIndividualTotal = 5 + 2 + 2 + 2 + 4 + 2 + 4 + 2 + 2; // All individual items including 2x rings
allStrategies.push({
  strategy: 'Pure Individual Items',
  setName: 'None',
  piecesUsed: 0,
  slotsOccupied: [],
  setBonus: 0,
  total: pureIndividualTotal
});

console.log(`🔥 Base Strategy: Pure Individual = +${pureIndividualTotal} All Skills`);

// Calculate strategies for top sets only (to avoid overwhelming output)
const topSets = setsWithAllSkills
  .sort((a, b) => b.maxBonus - a.maxBonus)
  .slice(0, 10);

console.log(`\n🔍 Analyzing top ${topSets.length} sets...`);

topSets.forEach(set => {
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

console.log('\n✨ Final comprehensive analysis complete!'); 