const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];
const inputDir = path.join(__dirname, '../public/icons');
const outputDir = path.join(__dirname, '../public/icons');

async function convertSvgToPng(size) {
  const svgPath = path.join(inputDir, `icon${size}.svg`);
  const pngPath = path.join(outputDir, `icon${size}.png`);
  
  const svg = fs.readFileSync(svgPath, 'utf8');
  
  const resvg = new Resvg(svg, {
    font: {
      loadSystemFonts: false,
    },
    background: 'transparent',
  });
  
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  
  fs.writeFileSync(pngPath, pngBuffer);
  
  console.log(`Converted icon${size}.svg to icon${size}.png`);
}

async function main() {
  try {
    for (const size of sizes) {
      await convertSvgToPng(size);
    }
    console.log('All icons converted successfully!');
  } catch (error) {
    console.error('Error converting icons:', error);
    process.exit(1);
  }
}

main(); 