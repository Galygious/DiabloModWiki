// scripts/max-all-skills-fixed.js
const fs = require('fs');
const path = require('path');

console.log('🚀 SCRIPT STARTED - max-all-skills.js');
console.log('🔍 Analyzing maximum possible +All Skills...\n');

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
  console.log(`🔍 DEBUG: Starting parseUniqueItems with path: ${filePath}`);
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  console.log(`🔍 DEBUG: Found ${lines.length} lines in file`);
  
  if (lines.length < 2) return [];
  
  const header = lines[0].split('\t');
  console.log(`🔍 DEBUG: Header has ${header.length} columns`);
  console.log(`🔍 DEBUG: Header columns: ${header.slice(0, 10).join(', ')}...`);
  
  const items = [];
  
  // Find the starting index of properties (prop1 column)
  const prop1Index = header.indexOf('prop1');
  if (prop1Index === -1) {
    console.log('❌ Could not find prop1 column in header');
    return [];
  }
  
  console.log(`🔍 DEBUG: prop1 found at index ${prop1Index}`);
  
  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split('\t');
    if (columns.length < header.length) continue;
    
    const item = {
      name: columns[header.indexOf('*ItemName')] || 'Unknown',
      code: columns[header.indexOf('code')] || '',
      properties: []
    };
    
    // Debug for Gorerider specifically
    if (item.name && item.name.toLowerCase().includes('gore')) {
      console.log(`🔍 DEBUG: Found Gorerider-like item: ${item.name}, code: ${item.code}`);
    }
    
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
          
          // Debug for allskills specifically
          if (prop === 'allskills' && item.name && item.name.toLowerCase().includes('gore')) {
            console.log(`🔍 DEBUG: Gorerider has allskills: ${min}-${max}`);
          }
        }
      }
    }
    
    items.push(item);
  }
  
  console.log(`🔍 DEBUG: Parsed ${items.length} total items`);
  return items;
}

function parseSetItems(filePath) {
  // Similar parsing logic for set items
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
      properties: []
    };
    
    // Parse properties for set items (similar structure)
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
    
    items.push(item);
  }
  
  return items;
}

// Parse unique items
console.log('📊 Processing unique items...');
console.error('🚨 FORCING DEBUG OUTPUT - THIS SHOULD ALWAYS SHOW');
const uniqueItems = parseUniqueItems('Sample Mods/RandoFun4/RandoFun4.mpq/data/global/excel/uniqueitems.txt');
console.error(`🚨 PARSED ${uniqueItems.length} UNIQUE ITEMS - SHOULD SHOW`);
console.log(`✅ Parsed ${uniqueItems.length} unique items`);

// Parse set items
console.log('📊 Processing set items...');
const setItemsPath = 'Sample Mods/RandoFun4/RandoFun4.mpq/data/global/excel/setitems.txt';
const setItems = parseSetItems(setItemsPath);
console.log(`✅ Parsed ${setItems.length} set items`);

// Combine all items
const allItems = [...uniqueItems, ...setItems];
console.log(`🔍 Total items to analyze: ${allItems.length}`);

// Debug: Check first few items
console.log('\n🔍 First 5 unique items:');
uniqueItems.slice(0, 5).forEach((item, i) => {
  console.log(`  ${i+1}. ${item.name} (${item.code}) - ${item.properties.length} properties`);
});

// Check if any item contains "Gorerider" or similar
const goreriderItems = allItems.filter(item => 
  item.name && (item.name.toLowerCase().includes('gorerider') || item.name.toLowerCase().includes('gore'))
);
console.log(`\n🔍 Items with "gore" in name: ${goreriderItems.length}`);
goreriderItems.forEach(item => {
  console.log(`  - ${item.name} (${item.code})`);
});

// Find items with +All Skills
const allSkillsItems = {};

// Initialize best items for each slot
Object.keys(EQUIPMENT_SLOTS).forEach(slot => {
  allSkillsItems[slot] = [];
});

allItems.forEach(item => {
  if (!item.code) return;
  
  // Debug logging for Gorerider specifically
  if (item.name && item.name.toLowerCase().includes('gorerider')) {
    console.log(`🔍 Found Gorerider: ${item.name}, code: ${item.code}, properties:`, item.properties.map(p => `${p.prop}:${p.min}-${p.max}`));
  }
  
  // Find slot for this item
  let itemSlot = null;
  for (const [slot, codes] of Object.entries(EQUIPMENT_SLOTS)) {
    if (codes.includes(item.code)) {
      itemSlot = slot;
      break;
    }
  }
  
  if (!itemSlot) {
    // Debug logging for unknown item codes
    if (item.name && item.name.toLowerCase().includes('gorerider')) {
      console.log(`❌ Gorerider not matched to any slot! Code: ${item.code}`);
    }
    return;
  }
  
  // Debug logging for Gorerider slot detection
  if (item.name && item.name.toLowerCase().includes('gorerider')) {
    console.log(`✅ Gorerider matched to slot: ${itemSlot}`);
  }
  
  // Check for +All Skills properties
  item.properties.forEach(prop => {
    if (prop.prop === 'allskills') {
      const allSkillsValue = Math.max(prop.min, prop.max);
      allSkillsItems[itemSlot].push({
        name: item.name,
        allSkills: allSkillsValue,
        min: prop.min,
        max: prop.max
      });
      
      // Debug logging for boots specifically
      if (itemSlot === 'Boots') {
        console.log(`🔍 Found boots with +All Skills: ${item.name} (${item.code}) = +${prop.min}-${prop.max}`);
      }
    }
  });
});

// Sort and display results
console.log('\n📋 Best +All Skills Items by Equipment Slot:\n');

let totalMax = 0;
const bestItems = {};

Object.keys(EQUIPMENT_SLOTS).forEach(slot => {
  const items = allSkillsItems[slot];
  
  if (items.length > 0) {
    // Sort by max +All Skills value
    items.sort((a, b) => b.allSkills - a.allSkills);
    const best = items[0];
    bestItems[slot] = best;
    
    console.log(`${slot}: ${best.name} (+${best.min}-${best.max} All Skills)`);
    
    // For rings, we can have 2
    if (slot === 'Ring') {
      totalMax += best.allSkills * 2;
    } else {
      totalMax += best.allSkills;
    }
  } else {
    console.log(`${slot}: No +All Skills items found`);
  }
});

console.log('\n⚡ MAXIMUM POSSIBLE +ALL SKILLS CALCULATION:\n');

// Handle weapon configurations
const weapon1H = bestItems['Weapon (1H)'];
const weapon2H = bestItems['Weapon (2H)'];
const shield = bestItems['Shield/Off-hand'];

let weaponBonus = 0;
let weaponSetup = '';

if (weapon1H && shield) {
  const oneHandTotal = weapon1H.allSkills + shield.allSkills;
  const twoHandTotal = weapon2H ? weapon2H.allSkills : 0;
  
  if (oneHandTotal >= twoHandTotal) {
    weaponBonus = oneHandTotal;
    weaponSetup = `🗡️  Weapon Setup: ${weapon1H.name} + ${shield.name} = +${oneHandTotal}`;
  } else {
    weaponBonus = twoHandTotal;
    weaponSetup = `🗡️  Weapon Setup: ${weapon2H.name} (2H) = +${twoHandTotal}`;
  }
} else if (weapon2H) {
  weaponBonus = weapon2H.allSkills;
  weaponSetup = `🗡️  Weapon Setup: ${weapon2H.name} (2H) = +${weaponBonus}`;
} else if (weapon1H) {
  weaponBonus = weapon1H.allSkills;
  weaponSetup = `🗡️  Weapon Setup: ${weapon1H.name} (1H) = +${weaponBonus}`;
} else {
  weaponSetup = `🗡️  Weapon Setup: No +All Skills weapons found = +0`;
}

// Calculate other equipment
let otherBonus = 0;
const otherSlots = ['Helmet', 'Amulet', 'Chest Armor', 'Belt', 'Boots', 'Gloves'];
otherSlots.forEach(slot => {
  if (bestItems[slot]) {
    otherBonus += bestItems[slot].allSkills;
  }
});

const ringBonus = bestItems['Ring'] ? bestItems['Ring'].allSkills * 2 : 0;

const finalTotal = weaponBonus + otherBonus + ringBonus;

console.log(weaponSetup);
console.log(`🛡️  Other Equipment: +${otherBonus}`);
console.log(`💍 Rings (x2): +${ringBonus}`);
console.log(`\n🏆 MAXIMUM TOTAL: +${finalTotal} TO ALL SKILLS`);

console.log('\n📝 Optimal Equipment Build:');
console.log('============================================================');

if (bestItems['Helmet']) console.log(`👑 Helmet: ${bestItems['Helmet'].name} (+${bestItems['Helmet'].allSkills})`);
if (bestItems['Amulet']) console.log(`📿 Amulet: ${bestItems['Amulet'].name} (+${bestItems['Amulet'].allSkills})`);
if (bestItems['Chest Armor']) console.log(`🛡️  Chest: ${bestItems['Chest Armor'].name} (+${bestItems['Chest Armor'].allSkills})`);
if (bestItems['Belt']) console.log(`🔗 Belt: ${bestItems['Belt'].name} (+${bestItems['Belt'].allSkills})`);
if (bestItems['Ring']) console.log(`💍 Rings: 2x ${bestItems['Ring'].name} (+${bestItems['Ring'].allSkills} each)`);
if (bestItems['Boots']) console.log(`👢 Boots: ${bestItems['Boots'].name} (+${bestItems['Boots'].allSkills})`);
if (bestItems['Gloves']) console.log(`🧤 Gloves: ${bestItems['Gloves'].name} (+${bestItems['Gloves'].allSkills})`);

console.log('\n✨ Analysis complete!');