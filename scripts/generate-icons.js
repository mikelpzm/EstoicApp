#!/usr/bin/env node

/**
 * Script para generar iconos PNG para la PWA
 * Uso: node scripts/generate-icons.js
 */

import { PNG } from 'pngjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Colores del tema (RGB)
const bgDark = { r: 15, g: 15, b: 15 };
const gold = { r: 201, g: 165, b: 92 };

function drawIcon(png, size) {
  const scale = size / 512;

  // Función para dibujar un pixel
  function setPixel(x, y, color) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x >= 0 && x < size && y >= 0 && y < size) {
      const idx = (size * y + x) << 2;
      png.data[idx] = color.r;
      png.data[idx + 1] = color.g;
      png.data[idx + 2] = color.b;
      png.data[idx + 3] = 255;
    }
  }

  // Función para dibujar un rectángulo
  function fillRect(x, y, w, h, color) {
    for (let i = 0; i < w; i++) {
      for (let j = 0; j < h; j++) {
        setPixel(x + i, y + j, color);
      }
    }
  }

  // Función para dibujar un triángulo
  function fillTriangle(x1, y1, x2, y2, x3, y3, color) {
    const minX = Math.floor(Math.min(x1, x2, x3));
    const maxX = Math.ceil(Math.max(x1, x2, x3));
    const minY = Math.floor(Math.min(y1, y2, y3));
    const maxY = Math.ceil(Math.max(y1, y2, y3));

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        // Barycentric coordinates
        const denominator = ((y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3));
        const a = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) / denominator;
        const b = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) / denominator;
        const c = 1 - a - b;

        if (a >= 0 && a <= 1 && b >= 0 && b <= 1 && c >= 0 && c <= 1) {
          setPixel(x, y, color);
        }
      }
    }
  }

  // Rellenar fondo
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      setPixel(x, y, bgDark);
    }
  }

  // Columnas del templo
  const colWidth = 40 * scale;
  const colHeight = 220 * scale;
  const colY = 180 * scale;

  fillRect(120 * scale, colY, colWidth, colHeight, gold);
  fillRect(236 * scale, colY, colWidth, colHeight, gold);
  fillRect(352 * scale, colY, colWidth, colHeight, gold);

  // Capiteles
  const capWidth = 60 * scale;
  const capHeight = 25 * scale;
  const capY = 160 * scale;

  fillRect(110 * scale, capY, capWidth, capHeight, gold);
  fillRect(226 * scale, capY, capWidth, capHeight, gold);
  fillRect(342 * scale, capY, capWidth, capHeight, gold);

  // Frontón (techo triangular)
  fillTriangle(
    256 * scale, 80 * scale,
    420 * scale, 150 * scale,
    92 * scale, 150 * scale,
    gold
  );

  // Base
  fillRect(80 * scale, 400 * scale, 352 * scale, 30 * scale, gold);
}

async function generateIcons() {
  // Asegurarse de que existe el directorio
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  for (const size of sizes) {
    const png = new PNG({ width: size, height: size });

    drawIcon(png, size);

    const buffer = PNG.sync.write(png);
    const filePath = path.join(iconsDir, `icon-${size}.png`);
    fs.writeFileSync(filePath, buffer);

    console.log(`Generated: icon-${size}.png`);
  }

  console.log('Icons generated successfully!');
}

generateIcons().catch(console.error);
