const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicons() {
  try {
    // Read the SVG favicon
    const svgBuffer = fs.readFileSync(path.join(__dirname, 'public', 'favicon.svg'));
    
    // Generate PNG favicons in different sizes
    await sharp(svgBuffer)
      .resize(16, 16)
      .png()
      .toFile(path.join(__dirname, 'public', 'favicon-16x16.png'));
    
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(__dirname, 'public', 'favicon-32x32.png'));
    
    await sharp(svgBuffer)
      .resize(48, 48)
      .png()
      .toFile(path.join(__dirname, 'public', 'favicon-48x48.png'));
    
    // Generate standard favicon.png
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(__dirname, 'public', 'favicon.png'));
    
    // Generate Apple touch icon
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(__dirname, 'public', 'apple-touch-icon.png'));
    
    // Generate ICO file (32x32)
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(path.join(__dirname, 'public', 'favicon.ico'));
    
    console.log('✅ All favicon files generated successfully!');
    console.log('Generated files:');
    console.log('- favicon-16x16.png');
    console.log('- favicon-32x32.png');
    console.log('- favicon-48x48.png');
    console.log('- favicon.png');
    console.log('- favicon.ico');
    console.log('- apple-touch-icon.png');
    
  } catch (error) {
    console.error('❌ Error generating favicons:', error);
  }
}

generateFavicons();
