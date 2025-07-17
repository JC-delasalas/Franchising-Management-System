// Script to generate favicon files from SVG
// This would typically use a tool like sharp or canvas to convert SVG to different formats
// For now, we'll create the necessary file structure and placeholders

const fs = require('fs');
const path = require('path');

// Create favicon directory structure
const publicDir = path.join(__dirname, '..', 'public');
const faviconSizes = [16, 32, 192, 512];

// SVG content for different sizes
const createFaviconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#E57373;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#B71C1C;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#F8BBD9;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#E91E63;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#EF5350;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#C62828;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <rect x="4" y="16" width="16" height="40" fill="url(#grad1)" rx="2" />
  <rect x="24" y="8" width="16" height="48" fill="url(#grad2)" rx="2" />
  <rect x="44" y="12" width="16" height="44" fill="url(#grad3)" rx="2" />
  
  <rect x="7" y="20" width="3" height="3" fill="white" />
  <rect x="13" y="20" width="3" height="3" fill="white" />
  <rect x="7" y="26" width="3" height="3" fill="white" />
  <rect x="13" y="26" width="3" height="3" fill="white" />
  
  <rect x="27" y="14" width="3" height="3" fill="white" />
  <rect x="33" y="14" width="3" height="3" fill="white" />
  <rect x="27" y="20" width="3" height="3" fill="white" />
  <rect x="33" y="20" width="3" height="3" fill="white" />
  
  <rect x="47" y="18" width="3" height="3" fill="white" />
  <rect x="53" y="18" width="3" height="3" fill="white" />
  <rect x="47" y="24" width="3" height="3" fill="white" />
  <rect x="53" y="24" width="3" height="3" fill="white" />
  
  <path d="M20,32 Q32,28 44,32" stroke="white" stroke-width="3" fill="none" />
  <circle cx="32" cy="32" r="4" fill="white" />
</svg>`;

// Generate favicon files
faviconSizes.forEach(size => {
  const svgContent = createFaviconSVG(size);
  fs.writeFileSync(path.join(publicDir, `favicon-${size}x${size}.svg`), svgContent);
});

console.log('Favicon files generated successfully!');
