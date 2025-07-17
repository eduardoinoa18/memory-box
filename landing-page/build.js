const fs = require('fs');
const path = require('path');

// Cross-platform build script for Memory Box Landing Page
console.log('🏗️  Building Memory Box Landing Page...');

// Ensure public directory exists
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log('✅ Created public directory');
}

// Copy index.html
try {
    fs.copyFileSync(
        path.join(__dirname, 'index.html'),
        path.join(publicDir, 'index.html')
    );
    console.log('✅ Copied index.html');
} catch (error) {
    console.error('❌ Error copying index.html:', error.message);
    process.exit(1);
}

// Copy memory-box-logo.svg
try {
    fs.copyFileSync(
        path.join(__dirname, 'memory-box-logo.svg'),
        path.join(publicDir, 'memory-box-logo.svg')
    );
    console.log('✅ Copied memory-box-logo.svg');
} catch (error) {
    console.error('❌ Error copying memory-box-logo.svg:', error.message);
    process.exit(1);
}

console.log('🎉 Build completed successfully!');
console.log('📁 Files in public directory:');
const files = fs.readdirSync(publicDir);
files.forEach(file => {
    console.log(`   - ${file}`);
});
