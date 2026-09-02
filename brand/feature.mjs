// Google Play feature graphic (1024x500) in the OG image's language:
// ink gradient, the bitten coin, the headline, and a pay-period day strip.
// Output: bta/store/play/feature-graphic.png
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const out = resolve('../bta/store/play');
mkdirSync(out, { recursive: true });

const BLOB = 'M 250 104 C 352 96 452 158 446 254 C 440 350 352 410 254 406 C 156 402 64 348 68 254 C 72 160 148 112 250 104 Z';
const mark = (x, y, s) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><defs><mask id="fb"><rect width="512" height="512" fill="#fff"/><circle cx="452" cy="178" r="66" fill="#000"/></mask></defs>` +
  `<path d="${BLOB}" fill="#FFFFFF" mask="url(#fb)"/><rect x="196" y="214" width="20" height="50" rx="10" fill="#0E0E0E"/><rect x="262" y="214" width="20" height="50" rx="10" fill="#0E0E0E"/></g>`;

const dots = (() => {
  const parts = [];
  for (let i = 0; i < 15; i++) {
    const cx = 72 + i * 30;
    const today = i === 4;
    const fill = i <= 4 ? '#FFFFFF' : '#4A4A4A';
    parts.push(`<circle cx="${cx}" cy="440" r="${today ? 12 : 7}" fill="${fill}"/>`);
  }
  return parts.join('');
})();

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 500" width="1024" height="500">
  <defs><linearGradient id="ink" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0B0B0B"/><stop offset="1" stop-color="#2A2A2A"/></linearGradient></defs>
  <rect width="1024" height="500" fill="url(#ink)"/>
  ${mark(700, 40, 0.62)}
  <text x="64" y="120" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="22" letter-spacing="4" fill="#8A8A86">CENTA</text>
  <text x="64" y="230" font-family="Arial Black, Arial, Helvetica, sans-serif" font-weight="900" font-size="60" fill="#FFFFFF">know what you can</text>
  <text x="64" y="300" font-family="Arial Black, Arial, Helvetica, sans-serif" font-weight="900" font-size="60" fill="#FFFFFF">spend today.</text>
  <text x="64" y="370" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#B4B4B0">widgets for the 15th and the 30th. one tap to log. offline.</text>
  <g>${dots}</g>
</svg>`;

await sharp(Buffer.from(svg), { density: 144 }).resize(1024, 500).png().toFile(resolve(out, 'feature-graphic.png'));
console.log('wrote', resolve(out, 'feature-graphic.png'));
