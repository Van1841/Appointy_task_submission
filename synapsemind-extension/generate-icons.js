// Quick script to generate basic PNG icons
const fs = require('fs');

// Create a simple PNG file (1x1 purple pixel as base64)
function createIcon(size, filename) {
  // This is a base64 encoded tiny PNG that we'll write
  // For simplicity, we'll create a very basic PNG header + purple pixel

  // Simple approach: Create a data URI for a purple square
  const canvas = `
<!DOCTYPE html>
<html>
<head><title>Generate Icon</title></head>
<body>
<canvas id="c" width="${size}" height="${size}"></canvas>
<script>
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

// Create gradient
const gradient = ctx.createLinearGradient(0, 0, ${size}, ${size});
gradient.addColorStop(0, '#667eea');
gradient.addColorStop(1, '#764ba2');

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, ${size}, ${size});

// Draw text
ctx.fillStyle = 'white';
ctx.font = 'bold ${Math.floor(size * 0.6)}px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('SM', ${size/2}, ${size/2});

// Download
canvas.toBlob(blob => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '${filename}';
  a.click();
});
</script>
</body>
</html>`;

  fs.writeFileSync(filename.replace('.png', '.html'), canvas);
  console.log(`Created ${filename.replace('.png', '.html')}`);
}

// For now, let's just create a minimal valid PNG
// This is a 1x1 purple PNG in base64
const purplePNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

function createSimplePNG(filename) {
  const buffer = Buffer.from(purplePNG, 'base64');
  fs.writeFileSync(filename, buffer);
  console.log(`✓ Created ${filename}`);
}

// Create all three icons
createSimplePNG('icon16.png');
createSimplePNG('icon48.png');
createSimplePNG('icon128.png');

console.log('\n✅ All icons created successfully!');
console.log('Note: These are simple placeholder icons. The extension will work fine with them.');
