const fs = require('fs');

console.log('🚀 TEST: Starting simple test');

try {
  const content = fs.readFileSync('Sample Mods/RandoFun4/RandoFun4.mpq/data/global/excel/uniqueitems.txt', 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  console.log(`📊 Found ${lines.length} lines`);
  
  const header = lines[0].split('\t');
  console.log(`📊 Header: ${header.slice(0, 5).join(', ')}...`);
  
  // Look for Gorerider
  const goreriderLines = lines.filter(line => 
    line.toLowerCase().includes('gorerider')
  );
  
  console.log(`🔍 Found ${goreriderLines.length} Gorerider entries`);
  
  goreriderLines.forEach((line, i) => {
    const columns = line.split('\t');
    const name = columns[header.indexOf('*ItemName')] || 'Unknown';
    const code = columns[header.indexOf('code')] || '';
    
    console.log(`  ${i+1}. ${name} (${code})`);
    
    // Check for allskills
    for (let propNum = 1; propNum <= 12; propNum++) {
      const propIndex = header.indexOf(`prop${propNum}`);
      const minIndex = header.indexOf(`min${propNum}`);
      const maxIndex = header.indexOf(`max${propNum}`);
      
      if (propIndex !== -1 && columns[propIndex] === 'allskills') {
        const min = columns[minIndex] || 0;
        const max = columns[maxIndex] || 0;
        console.log(`    🎯 HAS ALLSKILLS: +${min}-${max}`);
      }
    }
  });
  
} catch (error) {
  console.error('❌ Error:', error.message);
}

console.log('✅ Test complete'); 