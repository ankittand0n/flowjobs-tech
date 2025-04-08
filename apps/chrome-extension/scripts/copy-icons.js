const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];
const sourceIcon = path.join(__dirname, '../src/icons/icon.svg');
const iconsDir = path.join(__dirname, '../dist/icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Read the SVG content
const svgContent = fs.readFileSync(sourceIcon, 'utf8');

// Create PNG files for each size
sizes.forEach(size => {
  // For now, we'll just copy the SVG and rename it
  // In a real project, you'd want to use a proper SVG to PNG converter
  fs.writeFileSync(
    path.join(iconsDir, `icon${size}.svg`),
    svgContent.replace(/width="128" height="128"/, `width="${size}" height="${size}"`)
  );
});

console.log('Icons copied successfully!'); 