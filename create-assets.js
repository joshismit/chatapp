/**
 * Create minimal placeholder PNG images for Expo
 * Requires: npm install sharp --save-dev
 * Run: node create-assets.js
 */

const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('⚠️  Sharp not installed. Installing...');
  console.log('   Run: npm install sharp --save-dev');
  console.log('   Then run this script again.\n');
  process.exit(1);
}

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create a simple colored square as placeholder
async function createPlaceholder(name, width, height, color = '#6200ee') {
  const filePath = path.join(assetsDir, name);
  
  // Create a simple colored image
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${color}"/>
      <text x="50%" y="50%" font-family="Arial" font-size="${Math.min(width, height) / 10}" 
            fill="white" text-anchor="middle" dominant-baseline="middle">
        ${name.replace('.png', '')}
      </text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(filePath);
  
  console.log(`✅ Created: ${name} (${width}x${height})`);
}

async function generateAssets() {
  console.log('🎨 Generating placeholder assets...\n');
  
  try {
    await createPlaceholder('icon.png', 1024, 1024, '#6200ee');
    await createPlaceholder('splash.png', 1242, 2436, '#ffffff');
    await createPlaceholder('adaptive-icon.png', 1024, 1024, '#6200ee');
    await createPlaceholder('favicon.png', 48, 48, '#6200ee');
    
    console.log('\n✨ All assets created successfully!');
    console.log('📝 Note: Replace these with your actual app icons and splash screens for production.\n');
  } catch (error) {
    console.error('❌ Error creating assets:', error.message);
    process.exit(1);
  }
}

generateAssets();

