// Enhanced max-all-skills script with SET BONUS support
const fs = require('fs');
const path = require('path');

console.log('🚀 ENHANCED SCRIPT - Max +All Skills with SET BONUSES');
console.log('🔍 Analyzing maximum possible +All Skills including set bonuses...\n');

// Equipment slots and their type codes (ALL expansion and elite codes included)
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
    '6lx', '6mx', '6hx', '6rx'
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
    // Class specific
    'baa', 'bab', 'bac', 'bad', 'bae', 'baf',
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
    'uld', 'uth', 'uul', 'uar', 'utp'
  ],
  'Belt': [
    // Basic
    'lbl', 'vbl', 'mbl', 'tbl', 'hbl',
    // Expansion
    'zlb', 'zvb', 'zmb', 'ztb', 'zhb',
    // Elite
    'ulc', 'uvc', 'umc', 'utc', 'uhc'
  ],
  'Ring': ['rin'],
  'Boots': [
    // Basic
    'lbt', 'vbt', 'mbt', 'tbt', 'hbt',
    // Expansion  
    'xlb', 'xvb', 'xmb', 'xtb', 'xhb',
    // Elite
    'ulb', 'uvb', 'umb', 'utb', 'uhb'
  ],
  'Gloves': [
    // Basic
    'lgl', 'vgl', 'mgl', 'tgl', 'hgl',
    // Expansion
    'xlg', 'xvg', 'xmg', 'xtg', 'xhg', 
    // Elite
    'ulg', 'uvg', 'umg', 'utg', 'uhg'
  ]
};

function parseUniqueItems(filePath) {
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
      properties: [],
      type: 'unique'
    };
    
    // Parse properties (prop1-prop12, each with par, min, max)
    for (let propNum = 1; propNum <= 12; propNum++) {
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
    
    items.push(item);
  }
  
  return items;
}

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
    
    // Parse SET BONUS properties (aprop1a, aprop1b, aprop2a, etc.)
    for (let bonusNum = 1; bonusNum <= 5; bonusNum++) {
      // Each bonus level has 'a' and 'b' variants
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
              bonusLevel: bonusNum,
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

// Parse all items
console.log('📊 Processing unique items...');
const uniqueItems = parseUniqueItems('Sample Mods/RandoFun4/RandoFun4.mpq/data/global/excel/uniqueitems.txt');
console.log(`✅ Parsed ${uniqueItems.length} unique items`);

console.log('📊 Processing set items...');
const setItems = parseSetItems('Sample Mods/RandoFun4/RandoFun4.mpq/data/global/excel/setitems.txt');
console.log(`✅ Parsed ${setItems.length} set items`);

// Group set items by set name
const setsByName = {};
setItems.forEach(item => {
  if (!setsByName[item.setName]) {
    setsByName[item.setName] = [];
  }
  setsByName[item.setName].push(item);
});

console.log(`📊 Found ${Object.keys(setsByName).length} unique sets`);

// Find sets with +All Skills bonuses
console.log('\n🔍 Sets with +All Skills bonuses:');
Object.entries(setsByName).forEach(([setName, items]) => {
  const allSkillsBonuses = [];
  
  items.forEach(item => {
    item.setBonuses.forEach(bonus => {
      if (bonus.prop === 'allskills') {
        allSkillsBonuses.push(bonus);
      }
    });
  });
  
  if (allSkillsBonuses.length > 0) {
    console.log(`  📋 ${setName}:`);
    allSkillsBonuses.forEach(bonus => {
      console.log(`    - Level ${bonus.bonusLevel}${bonus.variant}: +${bonus.min}-${bonus.max} All Skills`);
    });
  }
});

// Calculate best individual items for each slot
const bestIndividualItems = {};
const allItems = [...uniqueItems, ...setItems];

Object.keys(EQUIPMENT_SLOTS).forEach(slot => {
  bestIndividualItems[slot] = [];
});

allItems.forEach(item => {
  if (!item.code) return;
  
  // Find slot for this item
  let itemSlot = null;
  for (const [slot, codes] of Object.entries(EQUIPMENT_SLOTS)) {
    if (codes.includes(item.code)) {
      itemSlot = slot;
      break;
    }
  }
  
  if (!itemSlot) return;
  
  // Check for +All Skills properties
  item.properties.forEach(prop => {
    if (prop.prop === 'allskills') {
      const allSkillsValue = Math.max(prop.min, prop.max);
      bestIndividualItems[itemSlot].push({
        name: item.name,
        allSkills: allSkillsValue,
        min: prop.min,
        max: prop.max,
        type: item.type,
        setName: item.setName || null,
        item: item
      });
    }
  });
});

// Sort best individual items
Object.keys(bestIndividualItems).forEach(slot => {
  bestIndividualItems[slot].sort((a, b) => b.allSkills - a.allSkills);
});

// Calculate best set combinations
function calculateSetBonus(setName, items) {
  const setItems = setsByName[setName] || [];
  const totalBonuses = [];
  
  // Collect all set bonuses from all items in the set
  setItems.forEach(item => {
    item.setBonuses.forEach(bonus => {
      if (bonus.prop === 'allskills') {
        totalBonuses.push(bonus);
      }
    });
  });
  
  // Sum up all +All Skills bonuses for this set
  let totalAllSkills = 0;
  totalBonuses.forEach(bonus => {
    totalAllSkills += Math.max(bonus.min, bonus.max);
  });
  
  return {
    setName,
    items: setItems,
    totalAllSkills,
    bonusDetails: totalBonuses
  };
}

// Find best sets with +All Skills
const setsWithAllSkills = {};
Object.keys(setsByName).forEach(setName => {
  const setBonus = calculateSetBonus(setName);
  if (setBonus.totalAllSkills > 0) {
    setsWithAllSkills[setName] = setBonus;
  }
});

// Sort sets by total +All Skills
const topSets = Object.values(setsWithAllSkills)
  .sort((a, b) => b.totalAllSkills - a.totalAllSkills);

console.log('\n🏆 TOP SETS BY +ALL SKILLS BONUSES:');
topSets.slice(0, 10).forEach((setInfo, i) => {
  console.log(`  ${i+1}. ${setInfo.setName}: +${setInfo.totalAllSkills} All Skills (${setInfo.items.length} pieces)`);
  setInfo.bonusDetails.forEach(bonus => {
    console.log(`     - Level ${bonus.bonusLevel}${bonus.variant}: +${bonus.min}-${bonus.max}`);
  });
});

// Calculate maximum possible build considering both individual items and set bonuses
console.log('\n⚡ MAXIMUM POSSIBLE BUILD ANALYSIS:\n');

// Strategy 1: Best individual items only
let individualTotal = 0;
console.log('📋 Strategy 1: Best Individual Items Only');
Object.entries(bestIndividualItems).forEach(([slot, items]) => {
  if (items.length > 0) {
    const best = items[0];
    console.log(`${slot}: ${best.name} (+${best.allSkills})`);
    if (slot === 'Ring') {
      individualTotal += best.allSkills * 2;
    } else {
      individualTotal += best.allSkills;
    }
  } else {
    console.log(`${slot}: No +All Skills items found`);
  }
});
console.log(`📊 Total: +${individualTotal} All Skills\n`);

// Strategy 2: Best set + remaining slots filled with individual items
console.log('📋 Strategy 2: Best Set + Individual Items');
if (topSets.length > 0) {
  const bestSet = topSets[0];
  let setTotal = bestSet.totalAllSkills;
  
  console.log(`🎯 Using Set: ${bestSet.setName} (+${bestSet.totalAllSkills} set bonuses)`);
  
  // Find which slots are occupied by this set
  const occupiedSlots = new Set();
  bestSet.items.forEach(item => {
    for (const [slot, codes] of Object.entries(EQUIPMENT_SLOTS)) {
      if (codes.includes(item.code)) {
        occupiedSlots.add(slot);
        console.log(`  ${slot}: ${item.name} (set piece)`);
        break;
      }
    }
  });
  
  // Fill remaining slots with best individual items
  Object.entries(bestIndividualItems).forEach(([slot, items]) => {
    if (!occupiedSlots.has(slot) && items.length > 0) {
      const best = items[0];
      console.log(`  ${slot}: ${best.name} (+${best.allSkills})`);
      if (slot === 'Ring') {
        setTotal += best.allSkills * 2;
      } else {
        setTotal += best.allSkills;
      }
    }
  });
  
  console.log(`📊 Total: +${setTotal} All Skills`);
  
  if (setTotal > individualTotal) {
    console.log(`\n🏆 WINNER: Set strategy (+${setTotal - individualTotal} more than individual items!)`);
  } else {
    console.log(`\n🏆 WINNER: Individual items strategy (+${individualTotal - setTotal} more than sets!)`);
  }
} else {
  console.log('No sets with +All Skills bonuses found');
}

console.log('\n✨ Enhanced analysis complete!'); 