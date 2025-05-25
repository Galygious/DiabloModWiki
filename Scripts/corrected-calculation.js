console.log('🔧 CORRECTED CALCULATION - Iratha\'s Finery 11 + Individual Items');
console.log('');

// Set bonus
const setBonusAllSkills = 8;
console.log('🎯 Set Bonus: Iratha\'s Finery 11 = +' + setBonusAllSkills + ' All Skills');
console.log('📋 Set pieces occupy: Amulet, Gloves, Helmet, Belt');
console.log('');

// Individual items for REMAINING slots only
console.log('🔓 Available slots for individual items:');
const individualItems = {
  'Weapon (1H)': 5,   // Flanged Mace
  'Shield/Off-hand': 2, // Large Shield  
  'Chest Armor': 4,   // shadow plate
  'Ring': 2,          // Ring (x2)
  'Boots': 2          // War Boots
};

let individualTotal = 0;
Object.entries(individualItems).forEach(([slot, allSkills]) => {
  if (slot === 'Ring') {
    console.log('  ' + slot + ': +' + allSkills + ' each (x2) = +' + (allSkills * 2));
    individualTotal += allSkills * 2;
  } else {
    console.log('  ' + slot + ': +' + allSkills);
    individualTotal += allSkills;
  }
});

console.log('');
console.log('📊 CORRECTED TOTALS:');
console.log('  Set Bonus: +' + setBonusAllSkills);
console.log('  Individual Items: +' + individualTotal);
console.log('  ACTUAL TOTAL: +' + (setBonusAllSkills + individualTotal) + ' All Skills');
console.log('');
console.log('❌ Previous (incorrect): +37');
console.log('✅ Corrected calculation: +' + (setBonusAllSkills + individualTotal));

// Compare with pure individual strategy
console.log('');
console.log('🔍 COMPARISON:');
const pureIndividualTotal = 5 + 2 + 4 + 2 + 2 + 2 + 2 + 4 + 2 + 2; // All best individual items
console.log('Strategy 1 (Pure Individual): +' + pureIndividualTotal + ' All Skills');
console.log('Strategy 2 (Iratha\'s Set + Individual): +' + (setBonusAllSkills + individualTotal) + ' All Skills');

if ((setBonusAllSkills + individualTotal) > pureIndividualTotal) {
  console.log('🏆 WINNER: Set strategy (+' + ((setBonusAllSkills + individualTotal) - pureIndividualTotal) + ' more)');
} else {
  console.log('🏆 WINNER: Individual strategy (+' + (pureIndividualTotal - (setBonusAllSkills + individualTotal)) + ' more)');
} 