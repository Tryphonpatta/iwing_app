const fs = require('fs');
const path = require('path');

function findFiles(dir) {
    const allFiles = [];
    function searchFiles(currentDir) {
      const files = fs.readdirSync(currentDir);
      files.forEach((file) => {
        const filePath = path.join(currentDir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          searchFiles(filePath);
        } else {
          allFiles.push({ path: filePath, size: stats.size });
        }
      });
    }
    searchFiles(dir);
    return allFiles;
  }
  
const result = findFiles(__dirname);
console.log('All files found:');
result.forEach((file) => {
    console.log(`File: ${file.path}, Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`);
});