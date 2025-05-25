// Comprehensive Set Analysis - ALL sets with +All Skills bonuses
const fs = require('fs');

console.log('🔍 COMPREHENSIVE SET ANALYSIS - ALL SETS');
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
  'Weapon (1H)': ['hax', 'axe', '2ax', 'mpi', 'wax', 'lax', 'bax', 'btx', 'gax', 'gix', 'wnd', 'ywn', 'bwn', 'gwn', 'clb', 'scp', 'gsc', 'wsp', 'spc', 'mac', 'mst', 'fla', 'whm', 'mau', 'gma', 'ssd', 'scm', 'sbr', 'flc', 'crs', 'bsd', 'lsd', 'wsd', 'dgr', 'dir', 'kri', 'bld', '9ha', '9ax', '92a', '9mp', '9wa', '9la', '9ba', '9bt', '9ga', '9gi', '9wn', '9yw', '9bw', '9gw', '9cl', '9sc', '9qs', '9ws', '9sp', '9ma', '9mt', '9fl', '9wh', '9m9', '9gm', '9ss', '9sm', '9sb', '9fc', '9cr', '9bs', '9ls', '9wd', '9dg', '9di', '9kr', '9bl', '9ta', '9tw', '9lw', '9cs', '9wb', '7ha', '7ax', '72a', '7mp', '7wa', '7la', '7ba', '7bt', '7ga', '7gi', '7wn', '7yw', '7bw', '7gw', '7cl', '7sc', '7qs', '7ws', '7sp', '7ma', '7mt', '7fl', '7wh', '7m7', '7gm', '7ss', '7sm', '7sb', '7fc', '7cr', '7bs', '7ls', '7wd', '7dg', '7di', '7kr', '7bl', '7ta', '7tw', '7lw', '7cs', '7wb'],
  'Weapon (2H)': ['2hs', 'clm', 'gis', 'bsw', 'flb', 'gsd', 'spr', 'tri', 'brn', 'spt', 'pik', 'bar', 'vou', 'scy', 'pax', 'hal', 'wsc', 'sst', 'lst', 'cst', 'bst', 'wst', 'sbw', 'hbw', 'lbw', 'cbw', 'sbb', 'lbb', 'swb', 'lwb', 'lxb', 'mxb', 'hxb', 'rxb', '92h', '9cm', '9gs', '9b9', '9fb', '9gd', '9sr', '9tr', '9br', '9st', '9p9', '9b7', '9vo', '9s8', '9pa', '9h9', '9wc', '8ss', '8ls', '8cs', '8bs', '8ws', '8sb', '8hb', '8lb', '8cb', '8s8', '8l8', '8sw', '8lw', '8lx', '8mx', '8hx', '8rx', '7cm', '7gs', '7b7', '7fb', '7gd', '7sr', '7tr', '7br', '7st', '7p7', '7b8', '7vo', '7s8', '7pa', '7h9', '7wc', '6ss', '6ls', '6cs', '6bs', '6ws', '6sb', '6hb', '6lb', '6cb', '6s7', '6l7', '6sw', '6lw', '6lx', '6mx', '6hx', '6rx'],
  'Shield/Off-hand': ['buc', 'sml', 'lrg', 'bsh', 'spk', 'kit', 'tow', 'gts', 'xuc', 'xml', 'xrg', 'xsh', 'xpk', 'xit', 'xow', 'xts', 'uuc', 'uml', 'urg', 'ush', 'upk', 'uit', 'uow', 'uts', 'nea', 'neb', 'nec', 'ned', 'nee', 'nef', 'paa', 'pab', 'pac', 'pad', 'pae', 'paf', 'pa9', 'dra', 'drb', 'drc', 'drd', 'dre', 'drf', 'oba', 'obb', 'obc', 'obd', 'obe', 'obf', 'ama', 'amb', 'amc', 'amd', 'ame', 'amf', 'am7', 'am8', 'am9'],
  'Helmet': ['cap', 'skp', 'hlm', 'fhl', 'bhm', 'ghm', 'crn', 'msk', 'xap', 'xkp', 'xlm', 'xhl', 'xhm', 'xrn', 'xsk', 'xh9', 'uap', 'ukp', 'ulm', 'uhl', 'uhm', 'urn', 'usk', 'uh9', 'baa', 'bab', 'bac', 'bad', 'bae', 'baf', 'drz', 'dr1', 'dr2', 'dr3', 'dr4', 'dr5', 'dra', 'drb', 'drc', 'drd', 'dre', 'ci0', 'ci1', 'ci2', 'ci3'],
  'Amulet': ['amu'],
  'Chest Armor': ['qui', 'lea', 'hla', 'stu', 'rng', 'scl', 'chn', 'brs', 'spl', 'plt', 'fld', 'gth', 'ful', 'aar', 'ltp', 'xui', 'xea', 'xla', 'xtu', 'xng', 'xcl', 'xhn', 'xrs', 'xpl', 'xlt', 'xld', 'xth', 'xul', 'xar', 'xtp', 'uui', 'uea', 'ula', 'utu', 'ung', 'ucl', 'uhn', 'urs', 'upl', 'ult', 'uld', 'uth', 'uul', 'uar', 'utp'],
  'Belt': ['lbl', 'vbl', 'mbl', 'tbl', 'hbl', 'zlb', 'zvb', 'zmb', 'ztb', 'zhb', 'ulc', 'uvc', 'umc', 'utc', 'uhc'],
  'Ring': ['rin'],
  'Boots': ['lbt', 'vbt', 'mbt', 'tbt', 'hbt', 'xlb', 'xvb', 'xmb', 'xtb', 'xhb', 'ulb', 'uvb', 'umb', 'utb', 'uhb'],
  'Gloves': ['lgl', 'vgl', 'mgl', 'tgl', 'hgl', 'xlg', 'xvg', 'xmg', 'xtg', 'xhg', 'ulg', 'uvg', 'umg', 'utg', 'uhg']
};

function parseSetItems(filePath) {
  if (!fs.existsSync(filePath)) return [];
  
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
      code: columns[header.indexOf('code')] || '',
      setName: columns[header.indexOf('set')] || '',
      properties: [],
      setBonuses: [],
      type: 'set'
    };
    
    // Parse individual item properties (prop1-prop9)
    for (let propNum = 1; propNum <= 9; propNum++) {
      const propIndex = header.indexOf(`prop${propNum}`);
      const parIndex = header.indexOf(`par${propNum}`);
      const minIndex = header.indexOf(`min${propNum}`);
      const maxIndex = header.indexOf(`max${propNum}`);
      
      if (propIndex !== -1 && columns[propIndex]) {
        const prop = columns[propIndex].trim();
        const par = columns[parIndex] || '';
        const min = parseInt(columns[minIndex]) || 0;
        const max = parseInt(columns[maxIndex]) || 0;
        
        if (prop) {
          item.properties.push({ prop, par, min, max });
        }
      }
    }
    
    // Parse SET BONUS properties (aprop1a=2piece, aprop2a=3piece, etc.)
    for (let bonusNum = 1; bonusNum <= 5; bonusNum++) {
      for (const variant of ['a', 'b']) {
        const propIndex = header.indexOf(`aprop${bonusNum}${variant}`);
        const parIndex = header.indexOf(`apar${bonusNum}${variant}`);
        const minIndex = header.indexOf(`amin${bonusNum}${variant}`);
        const maxIndex = header.indexOf(`amax${bonusNum}${variant}`);
        
        if (propIndex !== -1 && columns[propIndex]) {
          const prop = columns[propIndex].trim();
          const par = columns[parIndex] || '';
          const min = parseInt(columns[minIndex]) || 0;
          const max = parseInt(columns[maxIndex]) || 0;
          
          if (prop) {
            item.setBonuses.push({ 
              prop, par, min, max, 
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

// Analyze ALL sets with +All Skills bonuses
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
console.log('');

// Calculate optimal strategies for each set
const allStrategies = [];

// Base strategy: Pure Individual
const pureIndividualTotal = Object.values(bestIndividualItems).reduce((sum, val) => {
  return sum + (val === 2 && bestIndividualItems.Ring ? val * 2 : val); // Handle ring special case
}, 0) - 2; // Subtract one Ring value since we counted it twice

allStrategies.push({
  strategy: 'Pure Individual Items',
  setName: 'None',
  piecesUsed: 0,
  slotsOccupied: [],
  setBonus: 0,
  total: pureIndividualTotal
});

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
  });
});

// Sort strategies by total
allStrategies.sort((a, b) => b.total - a.total);

console.log('🏆 TOP 10 STRATEGIES:');
allStrategies.slice(0, 10).forEach((strategy, index) => {
  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
  console.log(`${medal} ${strategy.strategy}: +${strategy.total} All Skills`);
  if (strategy.setBonus > 0) {
    console.log(`    📈 Set bonus: +${strategy.setBonus}, 📉 Individual loss: -${strategy.individualLoss || 0}`);
    console.log(`    🔒 Slots used: ${strategy.slotsOccupied.join(', ') || 'None'}`);
  }
});

console.log('');
console.log(`💡 GLOBAL OPTIMAL: ${allStrategies[0].strategy} (+${allStrategies[0].total} All Skills)`);

console.log('\n✨ Comprehensive analysis complete!'); 