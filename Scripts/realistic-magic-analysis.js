// REALISTIC Magic/Rare Analysis - Considering Level Restrictions & Group Conflicts
const fs = require('fs');

console.log('🔍 REALISTIC MAGIC/RARE ANALYSIS');
console.log('Considering level requirements, maxlevel caps, group conflicts, and spawn probabilities\n');

// Parse magic prefixes with detailed metadata
function parseMagicPrefixesDetailed(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const header = lines[0].split('\t');
  const prefixes = [];
  
  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split('\t');
    if (columns.length < header.length) continue;
    
    const name = columns[header.indexOf('Name')] || '';
    const version = parseInt(columns[header.indexOf('version')]) || 0;
    const spawnable = columns[header.indexOf('spawnable')] === '1';
    const rare = columns[header.indexOf('rare')] === '1';
    const level = parseInt(columns[header.indexOf('level')]) || 0;
    const maxlevel = parseInt(columns[header.indexOf('maxlevel')]) || 99;
    const levelreq = parseInt(columns[header.indexOf('levelreq')]) || 0;
    const frequency = parseInt(columns[header.indexOf('frequency')]) || 0;
    const group = parseInt(columns[header.indexOf('group')]) || 0;
    
    // Look for allskills property
    for (let modNum = 1; modNum <= 3; modNum++) {
      const modCodeIndex = header.indexOf(`mod${modNum}code`);
      const modMinIndex = header.indexOf(`mod${modNum}min`);
      const modMaxIndex = header.indexOf(`mod${modNum}max`);
      
      if (modCodeIndex !== -1 && columns[modCodeIndex] === 'allskills') {
        const min = parseInt(columns[modMinIndex]) || 0;
        const max = parseInt(columns[modMaxIndex]) || 0;
        const value = Math.max(min, max);
        
        if (value > 0 && spawnable) {
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
            version,
            spawnable,
            rare,
            level,
            maxlevel,
            levelreq,
            frequency,
            group,
            itemTypes,
            type: 'prefix'
          });
        }
      }
    }
  }
  
  return prefixes;
}

// Parse magic suffixes with detailed metadata
function parseMagicSuffixesDetailed(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const header = lines[0].split('\t');
  const suffixes = [];
  
  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split('\t');
    if (columns.length < header.length) continue;
    
    const name = columns[header.indexOf('Name')] || '';
    const version = parseInt(columns[header.indexOf('version')]) || 0;
    const spawnable = columns[header.indexOf('spawnable')] === '1';
    const rare = columns[header.indexOf('rare')] === '1';
    const level = parseInt(columns[header.indexOf('level')]) || 0;
    const maxlevel = parseInt(columns[header.indexOf('maxlevel')]) || 99;
    const levelreq = parseInt(columns[header.indexOf('levelreq')]) || 0;
    const frequency = parseInt(columns[header.indexOf('frequency')]) || 0;
    const group = parseInt(columns[header.indexOf('group')]) || 0;
    
    // Look for allskills property
    for (let modNum = 1; modNum <= 3; modNum++) {
      const modCodeIndex = header.indexOf(`mod${modNum}code`);
      const modMinIndex = header.indexOf(`mod${modNum}min`);
      const modMaxIndex = header.indexOf(`mod${modNum}max`);
      
      if (modCodeIndex !== -1 && columns[modCodeIndex] === 'allskills') {
        const min = parseInt(columns[modMinIndex]) || 0;
        const max = parseInt(columns[modMaxIndex]) || 0;
        const value = Math.max(min, max);
        
        if (value > 0 && spawnable) {
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
            version,
            spawnable,
            rare,
            level,
            maxlevel,
            levelreq,
            frequency,
            group,
            itemTypes,
            type: 'suffix'
          });
        }
      }
    }
  }
  
  return suffixes;
}

// Parse detailed prefix and suffix data
const prefixes = parseMagicPrefixesDetailed('Sample Mods/RandoFun4/RandoFun4.mpq/data/global/excel/magicprefix.txt');
const suffixes = parseMagicSuffixesDetailed('Sample Mods/RandoFun4/RandoFun4.mpq/data/global/excel/magicsuffix.txt');

console.log(`📊 Found ${prefixes.length} spawnable prefixes with +All Skills`);
console.log(`📊 Found ${suffixes.length} spawnable suffixes with +All Skills\n`);

// Analyze prefix details
console.log('🔍 PREFIX ANALYSIS:');
prefixes
  .sort((a, b) => b.value - a.value)
  .forEach(prefix => {
    console.log(`${prefix.name}: +${prefix.value} All Skills`);
    console.log(`  📊 Level: ${prefix.level}-${prefix.maxlevel}, Req: ${prefix.levelreq}, Group: ${prefix.group}, Freq: ${prefix.frequency}`);
    console.log(`  🎯 Items: ${prefix.itemTypes.join(', ')}`);
    if (prefix.maxlevel < prefix.level) {
      console.log(`  ⚠️  WARNING: maxlevel (${prefix.maxlevel}) < level (${prefix.level}) - May not spawn!`);
    }
    console.log('');
  });

// Analyze suffix details
console.log('🔍 SUFFIX ANALYSIS:');
suffixes
  .sort((a, b) => b.value - a.value)
  .forEach(suffix => {
    console.log(`${suffix.name}: +${suffix.value} All Skills`);
    console.log(`  📊 Level: ${suffix.level}-${suffix.maxlevel}, Req: ${suffix.levelreq}, Group: ${suffix.group}, Freq: ${suffix.frequency}`);
    console.log(`  🎯 Items: ${suffix.itemTypes.join(', ')}`);
    if (suffix.maxlevel < suffix.level) {
      console.log(`  ⚠️  WARNING: maxlevel (${suffix.maxlevel}) < level (${suffix.level}) - May not spawn!`);
    }
    console.log('');
  });

// Find realistic combinations considering level constraints
console.log('🎯 REALISTIC COMBINATIONS ANALYSIS:');

// Group prefixes by group number to identify conflicts
const prefixGroups = {};
prefixes.forEach(prefix => {
  if (!prefixGroups[prefix.group]) {
    prefixGroups[prefix.group] = [];
  }
  prefixGroups[prefix.group].push(prefix);
});

// Group suffixes by group number to identify conflicts
const suffixGroups = {};
suffixes.forEach(suffix => {
  if (!suffixGroups[suffix.group]) {
    suffixGroups[suffix.group] = [];
  }
  suffixGroups[suffix.group].push(suffix);
});

console.log(`📊 Prefix groups with conflicts: ${Object.keys(prefixGroups).length}`);
console.log(`📊 Suffix groups with conflicts: ${Object.keys(suffixGroups).length}\n`);

// Find viable prefixes for different level ranges
const levelRanges = [
  { name: 'Low Level (1-20)', min: 1, max: 20 },
  { name: 'Mid Level (21-50)', min: 21, max: 50 },
  { name: 'High Level (51-85)', min: 51, max: 85 },
  { name: 'End Game (86-99)', min: 86, max: 99 }
];

levelRanges.forEach(range => {
  console.log(`🎯 ${range.name}:`);
  
  const viablePrefixes = prefixes.filter(p => 
    p.level <= range.max && 
    (p.maxlevel === 0 || p.maxlevel >= range.min) &&
    p.spawnable
  );
  
  const viableSuffixes = suffixes.filter(s => 
    s.level <= range.max && 
    (s.maxlevel === 0 || s.maxlevel >= range.min) &&
    s.spawnable
  );
  
  const bestPrefix = viablePrefixes.reduce((best, current) => 
    current.value > best.value ? current : best, { value: 0 });
    
  const bestSuffix = viableSuffixes.reduce((best, current) => 
    current.value > best.value ? current : best, { value: 0 });
  
  console.log(`  🔴 Best Prefix: ${bestPrefix.name || 'None'} (+${bestPrefix.value || 0})`);
  console.log(`  🔵 Best Suffix: ${bestSuffix.name || 'None'} (+${bestSuffix.value || 0})`);
  console.log(`  💫 Max Combination: +${(bestPrefix.value || 0) + (bestSuffix.value || 0)}`);
  console.log('');
});

console.log('✨ Realistic analysis complete!'); 