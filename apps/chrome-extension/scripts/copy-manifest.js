const fs = require('fs');
const path = require('path');

const sourceManifest = path.join(__dirname, '../src/manifest.json');
const destManifest = path.join(__dirname, '../dist/manifest.json');

// Ensure dist directory exists
if (!fs.existsSync(path.dirname(destManifest))) {
  fs.mkdirSync(path.dirname(destManifest), { recursive: true });
}

// Read the manifest
const manifest = JSON.parse(fs.readFileSync(sourceManifest, 'utf8'));

// Write the manifest with proper formatting
fs.writeFileSync(destManifest, JSON.stringify(manifest, null, 2));
console.log('Manifest file copied successfully!'); 