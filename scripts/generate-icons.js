#!/usr/bin/env node

/**
 * Generate simple green PNG icons for NutriTrack PWA
 * Creates 192x192 and 512x512 PNG icons with a green leaf/circle design
 */

const fs = require('fs');
const path = require('path');

// PNG file creation helper - creates a minimal valid PNG file
function createMinimalPNG(width, height, filename) {
  // Create a simple PNG file with a solid green background and a leaf/circle icon
  // This is a minimal valid PNG structure

  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk (image header)
  const ihdr = createIHDRChunk(width, height);

  // IDAT chunk (image data) - create green pixels
  const idat = createIDATChunk(width, height);

  // IEND chunk (end marker)
  const iend = Buffer.from([
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
  ]);

  const png = Buffer.concat([signature, ihdr, idat, iend]);
  fs.writeFileSync(filename, png);
  console.log(`Created: ${filename}`);
}

function createIHDRChunk(width, height) {
  const chunk = Buffer.alloc(13);
  chunk.writeUInt32BE(width, 0);
  chunk.writeUInt32BE(height, 4);
  chunk[8] = 8;  // bit depth
  chunk[9] = 2;  // color type (2 = RGB)
  chunk[10] = 0; // compression
  chunk[11] = 0; // filter
  chunk[12] = 0; // interlace

  const crc = calculateCRC(Buffer.concat([Buffer.from('IHDR'), chunk]));

  const length = Buffer.alloc(4);
  length.writeUInt32BE(13, 0);

  return Buffer.concat([length, Buffer.from('IHDR'), chunk, crc]);
}

function createIDATChunk(width, height) {
  // Create simple uncompressed image data with green color
  // This is a simplified approach - creates a green background with a leaf icon in center
  const pixelData = Buffer.alloc(width * height * 3);

  // Fill with green (#16a34a = rgb(22, 163, 74))
  const greenR = 22;
  const greenG = 163;
  const greenB = 74;

  // Create a leaf/circle icon in the center
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.35;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 3;

      // Calculate distance from center
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Create a circle/leaf shape - use darker green for contrast
      if (dist < radius) {
        // Lighter green for the circle
        pixelData[idx] = 34;     // R
        pixelData[idx + 1] = 197; // G
        pixelData[idx + 2] = 94;  // B
      } else {
        // Main green background
        pixelData[idx] = greenR;
        pixelData[idx + 1] = greenG;
        pixelData[idx + 2] = greenB;
      }
    }
  }

  // Add scanline filter bytes (0 = no filter)
  const filtered = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    filtered[y * (width * 3 + 1)] = 0; // filter type
    pixelData.copy(filtered, y * (width * 3 + 1) + 1, y * width * 3, (y + 1) * width * 3);
  }

  // Simple zlib compression (just use raw data with minimal compression)
  const zlib = require('zlib');
  const compressed = zlib.deflateSync(filtered);

  const crc = calculateCRC(Buffer.concat([Buffer.from('IDAT'), compressed]));

  const length = Buffer.alloc(4);
  length.writeUInt32BE(compressed.length, 0);

  return Buffer.concat([length, Buffer.from('IDAT'), compressed, crc]);
}

function calculateCRC(data) {
  // Simplified CRC calculation for PNG
  // This is a stub - real implementation would use proper CRC32
  // For our purposes, we'll use a basic calculation
  const crc = Buffer.alloc(4);
  let crcValue = 0xffffffff;

  for (let i = 0; i < data.length; i++) {
    crcValue = crcValue ^ data[i];
    for (let j = 0; j < 8; j++) {
      if (crcValue & 1) {
        crcValue = (crcValue >>> 1) ^ 0xedb88320;
      } else {
        crcValue = crcValue >>> 1;
      }
    }
  }

  crcValue = crcValue ^ 0xffffffff;
  crc.writeUInt32BE(crcValue, 0);
  return crc;
}

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate PNG icons
console.log('Generating NutriTrack PWA icons...');
createMinimalPNG(192, 192, path.join(iconsDir, 'icon-192.png'));
createMinimalPNG(512, 512, path.join(iconsDir, 'icon-512.png'));
console.log('Icons generated successfully!');
