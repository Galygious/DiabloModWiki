// Progressive Set Bonus Analysis
const fs = require('fs');

console.log('🔍 PROGRESSIVE SET BONUS ANALYSIS');
console.log('Analyzing optimal partial set combinations...\n');

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
              piecesRequired: bonusNum,
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

// Focus on Iratha's Finery 11
const irathaSet = setsByName['Iratha\'s Finery 11'];
if (irathaSet) {
  console.log('🎯 IRATHA\'S FINERY 11 DETAILED ANALYSIS:');
  console.log('');
  
  // Show set pieces and their individual bonuses
  console.log('📋 Set Pieces:');
  irathaSet.forEach(item => {
    const slot = getSlotForItem(item.code);
    console.log(`  ${item.name} (${slot})`);
    
    // Check for individual +All Skills
    const individualAllSkills = item.properties.find(prop => prop.prop === 'allskills');
    if (individualAllSkills) {
      console.log(`    📈 Individual bonus: +${individualAllSkills.max} All Skills`);
    }
  });
  
  console.log('');
  
  // Analyze progressive bonuses
  console.log('🔄 Progressive Set Bonuses:');
  const allBonuses = [];
  
  irathaSet.forEach(item => {
    item.setBonuses.forEach(bonus => {
      if (bonus.prop === 'allskills') {
        allBonuses.push({
          piecesRequired: bonus.piecesRequired,
          variant: bonus.variant,
          value: Math.max(bonus.min, bonus.max),
          fromItem: item.name
        });
      }
    });
  });
  
  // Group by pieces required
  const bonusByPieces = {};
  allBonuses.forEach(bonus => {
    if (!bonusByPieces[bonus.piecesRequired]) {
      bonusByPieces[bonus.piecesRequired] = [];
    }
    bonusByPieces[bonus.piecesRequired].push(bonus);
  });
  
  // Show progressive structure
  for (let pieces = 1; pieces <= 5; pieces++) {
    if (bonusByPieces[pieces]) {
      let totalForThisPieceCount = 0;
      bonusByPieces[pieces].forEach(bonus => {
        totalForThisPieceCount += bonus.value;
      });
      
      console.log(`  ${pieces} pieces: +${totalForThisPieceCount} All Skills`);
      bonusByPieces[pieces].forEach(bonus => {
        console.log(`    - +${bonus.value} (from ${bonus.fromItem}, variant ${bonus.variant})`);
      });
    }
  }
  
  console.log('');
  
  // Calculate optimal combinations
  console.log('⚡ OPTIMAL COMBINATIONS:');
  
  for (let pieceCount = 1; pieceCount <= Math.min(4, irathaSet.length); pieceCount++) {
    let cumulativeBonus = 0;
    
    // Add up all bonuses from 1 piece up to this piece count
    for (let p = 1; p <= pieceCount; p++) {
      if (bonusByPieces[p]) {
        bonusByPieces[p].forEach(bonus => {
          cumulativeBonus += bonus.value;
        });
      }
    }
    
    const slotsOccupied = pieceCount;
    const slotsRemaining = 10 - slotsOccupied; // Total equipment slots minus rings (counted as 1)
    
    console.log(`📊 ${pieceCount} pieces: +${cumulativeBonus} set bonus, ${slotsOccupied} slots occupied, ${slotsRemaining} free slots`);
  }
}

function getSlotForItem(code) {
  const slotMap = {
    'amu': 'Amulet',
    'tgl': 'Gloves', 
    'crn': 'Helmet',
    'tbl': 'Belt',
    'lrg': 'Shield',
    'brs': 'Chest',
    // Add more as needed
  };
  
  return slotMap[code] || 'Unknown';
}

console.log('\n✨ Analysis complete!'); 