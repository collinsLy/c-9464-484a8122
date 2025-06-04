
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple bundle analyzer
function analyzeBundleSize(dir = 'dist') {
  if (!fs.existsSync(dir)) {
    console.log('Build directory not found. Run "npm run build" first.');
    return;
  }

  const files = [];
  
  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (item.endsWith('.js') || item.endsWith('.css')) {
        files.push({
          name: path.relative(dir, fullPath),
          size: stat.size,
          sizeKB: (stat.size / 1024).toFixed(2)
        });
      }
    }
  }
  
  walkDir(dir);
  
  // Sort by size descending
  files.sort((a, b) => b.size - a.size);
  
  console.log('\n📦 Bundle Analysis');
  console.log('==================');
  
  let totalSize = 0;
  files.forEach(file => {
    totalSize += file.size;
    console.log(`${file.name.padEnd(40)} ${file.sizeKB.padStart(8)} KB`);
  });
  
  console.log('==================');
  console.log(`Total: ${(totalSize / 1024).toFixed(2)} KB`);
  
  // Warn about large files
  const largeFiles = files.filter(f => f.size > 200 * 1024);
  if (largeFiles.length > 0) {
    console.log('\n⚠️  Large files detected (>200KB):');
    largeFiles.forEach(file => {
      console.log(`- ${file.name}: ${file.sizeKB} KB`);
    });
  }
}

analyzeBundleSize();
