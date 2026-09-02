/**
 * Centa brand mark: a soft, slightly wonky oval (a coin) with two dash eyes,
 * in the spirit of flat single-colour companion blobs. One source shape, many outputs.
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

/** The blob, in a 512 box, centred on (256,256). Wider than tall, a touch heavier on the right. */
const BLOB = 'M 250 104 C 352 96 452 158 446 254 C 440 350 352 410 254 406 C 156 402 64 348 68 254 C 72 160 148 112 250 104 Z';
/** Two dash eyes. */
const eyes = (fill) => `<rect x="212" y="216" width="20" height="50" rx="10" fill="${fill}"/><rect x="280" y="216" width="20" height="50" rx="10" fill="${fill}"/>`;

const svg = (inner, bg = null, size = 512, rx = 116) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}">${bg ? `<rect width="512" height="512" rx="${rx}" fill="${bg}"/>` : ''}${inner}</svg>`;

/** Blob scaled about the centre so adaptive-icon safe zones are respected. */
const blobGroup = (fill, eyeFill, scale = 1) =>
  `<g transform="translate(256 256) scale(${scale}) translate(-256 -256)"><path d="${BLOB}" fill="${fill}"/>${eyes(eyeFill)}</g>`;

// ---- SVG sources ----------------------------------------------------------
const files = {
  // App icon / favicon: ink tile, white coin.
  'mark.svg': svg(blobGroup(PAPER, INK, 0.92), INK),
  // Logo on light surfaces: ink coin, no tile.
  'mark-mono.svg': svg(blobGroup(INK, PAPER, 1)),
  // Logo on dark surfaces.
  'mark-mono-inverse.svg': svg(blobGroup(PAPER, INK, 1)),
  // Android monochrome layer: silhouette only, eyes cut out (alpha).
  'mark-silhouette.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><mask id="m"><rect width="512" height="512" fill="#fff"/>${eyes('#000')}</mask></defs><path d="${BLOB}" fill="${PAPER}" mask="url(#m)"/></svg>`,
};

await Promise.all(Object.entries(files).map(([name, content]) => writeFile(path.join(here, name), content)));

// Wordmark lockup (SVG only; text uses the web font where available).
const wordmark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 200" width="720" height="200">
  <g transform="translate(0 -56) scale(0.6)">${blobGroup(INK, PAPER, 1)}</g>
  <text x="330" y="140" font-family="'Archivo Black', Arial Black, Arial, sans-serif" font-size="120" fill="${INK}" letter-spacing="-3">centa</text>
</svg>`;
await writeFile(path.join(here, 'wordmark.svg'), wordmark);

// ---- Rasters for the app ------------------------------------------------------
await mkdir(appAssets, { recursive: true });
const png = (source, size, out) => sharp(Buffer.from(source), { density: 400 }).resize(size, size).png().toFile(out);

// iOS app icon: full-bleed ink, the store rounds the corners.
await png(svg(blobGroup(PAPER, INK, 0.92), INK, 1024, 0), 1024, path.join(appAssets, 'icon.png'));
// Android adaptive: background (solid), foreground (coin in the 66% safe zone), monochrome (silhouette).
await png(svg('', INK, 1024, 0), 1024, path.join(appAssets, 'android-icon-background.png'));
await png(svg(blobGroup(PAPER, INK, 0.62), null, 1024, 0), 1024, path.join(appAssets, 'android-icon-foreground.png'));
await png(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><mask id="m"><rect width="512" height="512" fill="#fff"/><g transform="translate(256 256) scale(0.62) translate(-256 -256)">${eyes('#000')}</g></mask></defs><g mask="url(#m)"><g transform="translate(256 256) scale(0.62) translate(-256 -256)"><path d="${BLOB}" fill="${PAPER}"/></g></g></svg>`, 1024, path.join(appAssets, 'android-icon-monochrome.png'));
// Splash: ink coin on the off-white splash background (transparent PNG).
await png(svg(blobGroup(INK, GROUND, 0.7)), 512, path.join(appAssets, 'splash-icon.png'));
// Web favicon for Expo web.
await png(svg(blobGroup(PAPER, INK, 0.92), INK, 512, 116), 48, path.join(appAssets, 'favicon.png'));

console.log('brand: wrote', Object.keys(files).join(', '), 'wordmark.svg and app icons to', appAssets);
