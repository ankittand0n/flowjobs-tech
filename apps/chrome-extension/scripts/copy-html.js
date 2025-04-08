const fs = require('fs');
const path = require('path');

// Read the source index.html
const sourceHtml = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

// Create the production version with correct paths
const productionHtml = sourceHtml
  .replace('"/style.css"', '"style.css"')
  .replace('"/src/main.tsx"', '"main.js"');

// Write to the dist directory
fs.writeFileSync(path.resolve(__dirname, '../dist/index.html'), productionHtml);
console.log('HTML file copied successfully!'); 