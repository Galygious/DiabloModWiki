// Debug Set Analysis
const fs = require('fs');

console.log('🔍 DEBUG SET ANALYSIS - Tancred\'s Battlegear 13');
console.log('');

const EQUIPMENT_SLOTS = {
  'Weapon (1H)': ['hax', 'axe', '2ax', 'mpi', 'wax', 'lax', 'bax', 'btx', 'gax', 'gix', 'wnd', 'ywn', 'bwn', 'gwn', 'clb', 'scp', 'gsc', 'wsp', 'spc', 'mac', 'mst', 'fla', 'whm', 'mau', 'gma', 'ssd', 'scm', 'sbr', 'flc', 'crs', 'bsd', 'lsd', 'wsd', 'dgr', 'dir', 'kri', 'bld'],
  'Helmet': ['cap', 'skp', 'hlm', 'fhl', 'bhm', 'ghm', 'crn', 'msk'],
  'Amulet': ['amu'],
  'Chest Armor': ['qui', 'lea', 'hla', 'stu', 'rng', 'scl', 'chn', 'brs', 'spl', 'plt', 'fld', 'gth', 'ful', 'aar', 'ltp'],
  'Belt': ['lbl', 'vbl', 'mbl', 'tbl', 'hbl'],
  'Ring': ['rin'],
  'Boots': ['lbt', 'vbt', 'mbt', 'tbt', 'hbt'],
  'Gloves': ['lgl', 'vgl', 'mgl', 'tgl', 'hgl']
};

function getSlotForItem(code) {
  for (const [slot, codes] of Object.entries(EQUIPMENT_SLOTS)) {
    if (codes.includes(code)) {
      return slot;
    }
  }
  return null;
}

// Test specific codes
console.log('🔍 Testing slot mapping:');
console.log('amu (Amulet):', getSlotForItem('amu'));
console.log('bhm (Bone Helm):', getSlotForItem('bhm'));
console.log('');

// Parse just Tancred's set
function parseSetItems(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const header = lines[0].split('\t');
  const items = [];
  
  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split('\t');
    if (columns.length < header.length) continue;
    
    const setName = columns[header.indexOf('set')] || '';
    if (!setName.includes('Tancred\'s Battlegear 13')) continue;
    
    const item = {
      name: columns[header.indexOf('*ItemName')] || 'Unknown',
      code: columns[header.indexOf('code')] || '',
      setName: setName,
      setBonuses: []
    };
    
    // Parse SET BONUS properties
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

const tancredItems = parseSetItems('Sample Mods/RandoFun4/RandoFun4.mpq/data/global/excel/setitems.txt');

console.log('🎯 Tancred\'s Battlegear 13 Items:');
tancredItems.forEach(item => {
  const slot = getSlotForItem(item.code);
  console.log(`  ${item.name} (${item.code}) → ${slot || 'UNMAPPED!'}`);
  
  if (item.setBonuses.length > 0) {
    console.log(`    Set bonuses:`);
    item.setBonuses.forEach(bonus => {
      console.log(`      ${bonus.piecesRequired} pieces: +${bonus.max} All Skills (variant ${bonus.variant})`);
    });
  }
});

// Calculate set slots
const setSlots = [];
tancredItems.forEach(item => {
  const slot = getSlotForItem(item.code);
  if (slot) {
    setSlots.push(slot);
  }
});

console.log('');
console.log('📋 Set occupies slots:', [...new Set(setSlots)]);

// Calculate progressive bonuses
const allBonuses = [];
tancredItems.forEach(item => {
  item.setBonuses.forEach(bonus => {
    allBonuses.push({
      piecesRequired: bonus.piecesRequired,
      value: Math.max(bonus.min, bonus.max)
    });
  });
});

console.log('');
console.log('🔄 All Skills bonuses found:');
allBonuses.forEach(bonus => {
  console.log(`  ${bonus.piecesRequired} pieces: +${bonus.value}`);
});

// Group and calculate progressive
const progressiveBonuses = {};
let cumulativeBonus = 0;

for (let pieces = 2; pieces <= tancredItems.length; pieces++) {
  const bonusesForThisPieceCount = allBonuses.filter(b => b.piecesRequired === pieces);
  if (bonusesForThisPieceCount.length > 0) {
    const bonusValue = bonusesForThisPieceCount.reduce((sum, b) => sum + b.value, 0);
    cumulativeBonus += bonusValue;
  }
  progressiveBonuses[pieces] = cumulativeBonus;
}

console.log('');
console.log('📊 Progressive bonuses:');
Object.entries(progressiveBonuses).forEach(([pieces, bonus]) => {
  console.log(`  ${pieces} pieces: +${bonus} cumulative`);
});

console.log('\n✨ Debug complete!'); 