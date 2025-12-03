/**
 * Generate PWA icons from SVG
 * For now, creates simple colored placeholder PNGs
 * In production, use a tool like sharp or canvas to generate from SVG
 */

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '../public/icons');

// Simple SVG icon template
const createSvgIcon = (
  size
) => `<svg width="${size}" height="${size}" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="64" fill="#0f0f0f"/>
  <circle cx="256" cy="200" r="100" fill="#a3e635"/>
  <ellipse cx="256" cy="210" rx="70" ry="60" fill="#0f0f0f"/>
  <circle cx="230" cy="190" r="12" fill="#a3e635"/>
  <circle cx="280" cy="190" r="12" fill="#a3e635"/>
  <path d="M220 250 Q256 280 292 250" stroke="#a3e635" stroke-width="6" fill="none" stroke-linecap="round"/>
  <text x="256" y="360" text-anchor="middle" fill="#a3e635" font-family="Arial" font-size="60" font-weight="bold">M&amp;M</text>
</svg>`;

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG files for each size (can be converted to PNG with imagemagick or browser)
sizes.forEach((size) => {
  const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(svgPath, createSvgIcon(size));
  console.log(`Created: icon-${size}x${size}.svg`);
});

console.log('\n✅ SVG icons generated!');
console.log('\nTo convert to PNG, you can:');
console.log('1. Use an online converter like cloudconvert.com');
console.log('2. Use ImageMagick: convert icon.svg icon.png');
console.log('3. Use sharp npm package');
console.log('\nFor now, the manifest will use SVG icons as fallback.');
