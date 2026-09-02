/**
 * Centa brand mark: a soft, slightly wonky coin with a bite out of the top-right edge
 * (so it also reads as a lowercase "c") and two dash eyes. One source shape, many outputs.
 *
 *   node brand/generate.mjs            writes SVGs here and PNGs into ../../bta/apps/mobile/assets
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const appAssets = path.resolve(here, '../../bta/apps/mobile/assets');

const INK = '#0E0E0E';
const PAPER = '#FFFFFF';
const GROUND = '#F2F2F0';

/** The coin, in a 512 box, centred on (256,256). Wider than tall, a touch heavier on the right. */
export const BLOB = 'M 250 104 C 352 96 452 158 446 254 C 440 350 352 410 254 406 C 156 402 64 348 68 254 C 72 160 148 112 250 104 Z';
/** The bite: a circle subtracted from the top-right edge. This is what makes it a "c" and not a blob. */
export const BITE = { cx: 452, cy: 178, r: 66 };
/** Two dash eyes, sitting a little left of centre, toward the coin's mass. */
export const EYES = [{ x: 196, y: 214 }, { x: 262, y: 214 }];
const EYE = { w: 20, h: 50, rx: 10 };

const eyes = (fill, extra = '') => EYES.map((e) => `<rect x="${e.x}" y="${e.y}" width="${EYE.w}" height="${EYE.h}" rx="${EYE.rx}" fill="${fill}"${extra}/>`).join('');

/** Coin with the bite cut out, as a group scaled about the centre. `bg` is the colour that shows through the bite. */
function coin(fill, eyeFill, scale = 1, id = 'c') {
  return `<defs><mask id="${id}"><rect width="512" height="512" fill="#fff"/><circle cx="${BITE.cx}" cy="${BITE.cy}" r="${BITE.r}" fill="#000"/></mask></defs>` +
    `<g transform="translate(256 256) scale(${scale}) translate(-256 -256)"><path d="${BLOB}" fill="${fill}" mask="url(#${id})"/>${eyes(eyeFill)}</g>`;
}
/** Silhouette (alpha only): coin minus bite minus eyes. For Android's themed layer. */
function silhouette(scale = 1) {
  return `<defs><mask id="s"><rect width="512" height="512" fill="#fff"/><circle cx="${BITE.cx}" cy="${BITE.cy}" r="${BITE.r}" fill="#000"/>${eyes('#000')}</mask></defs>` +
    `<g transform="translate(256 256) scale(${scale}) translate(-256 -256)"><path d="${BLOB}" fill="${PAPER}" mask="url(#s)"/></g>`;
}
const svg = (inner, bg = null, size = 512, rx = 116) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">${bg ? `<rect width="512" height="512" rx="${rx}" fill="${bg}"/>` : ''}${inner}</svg>`;

// ---- SVG sources ----------------------------------------------------------
const files = {
  'mark.svg': svg(coin(PAPER, INK, 0.92), INK),
  'mark-mono.svg': svg(coin(INK, PAPER, 1)),
  'mark-mono-inverse.svg': svg(coin(PAPER, INK, 1)),
  'mark-silhouette.svg': svg(silhouette(1)),
};
await Promise.all(Object.entries(files).map(([name, content]) => writeFile(path.join(here, name), content)));

const wordmark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 200" width="720" height="200">
  <g transform="translate(0 -56) scale(0.6)">${coin(INK, PAPER, 1, 'w')}</g>
  <text x="330" y="140" font-family="'Archivo Black', Arial Black, Arial, sans-serif" font-size="120" fill="${INK}" letter-spacing="-3">centa</text>
</svg>`;
await writeFile(path.join(here, 'wordmark.svg'), wordmark);

// ---- Rasters for the app ------------------------------------------------------
await mkdir(appAssets, { recursive: true });
const png = (source, size, out) => sharp(Buffer.from(source), { density: 400 }).resize(size, size).png().toFile(out);

await png(svg(coin(PAPER, INK, 0.92), INK, 1024, 0), 1024, path.join(appAssets, 'icon.png'));
await png(svg('', INK, 1024, 0), 1024, path.join(appAssets, 'android-icon-background.png'));
await png(svg(coin(PAPER, INK, 0.62), null, 1024, 0), 1024, path.join(appAssets, 'android-icon-foreground.png'));
await png(svg(silhouette(0.62), null, 1024, 0), 1024, path.join(appAssets, 'android-icon-monochrome.png'));
await png(svg(coin(INK, GROUND, 0.7)), 512, path.join(appAssets, 'splash-icon.png'));
await png(svg(coin(PAPER, INK, 0.92), INK, 512, 116), 48, path.join(appAssets, 'favicon.png'));

console.log('brand: wrote', Object.keys(files).join(', '), 'wordmark.svg and app icons to', appAssets);
