// Generates monochrome Android app-shortcut foreground images for Centa.
// Output: bta/apps/mobile/assets/shortcuts/<name>.png (432x432, glyph in the
// adaptive-icon safe zone). Ink glyph on transparent; the plugin adds the
// off-white background.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const out = resolve('../bta/apps/mobile/assets/shortcuts');
mkdirSync(out, { recursive: true });

const S = 432; // adaptive foreground canvas; visible circle is the middle 66%
const glyphs = {
  // plus
  shortcut_add: `<path d="M216 132v168M132 216h168" stroke="#0E0E0E" stroke-width="28" stroke-linecap="round" fill="none"/>`,
  // calendar (bills / plan)
  shortcut_plan: `<rect x="132" y="150" width="168" height="150" rx="22" stroke="#0E0E0E" stroke-width="24" fill="none"/><path d="M132 198h168M176 122v50M256 122v50" stroke="#0E0E0E" stroke-width="24" stroke-linecap="round"/>`,
  // 2x2 grid (widgets)
  shortcut_widget: `<rect x="132" y="132" width="72" height="72" rx="16" fill="#0E0E0E"/><rect x="228" y="132" width="72" height="72" rx="16" fill="#0E0E0E"/><rect x="132" y="228" width="72" height="72" rx="16" fill="#0E0E0E"/><rect x="228" y="228" width="72" height="72" rx="16" fill="#0E0E0E"/>`,
};

for (const [name, body] of Object.entries(glyphs)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">${body}</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(resolve(out, `${name}.png`));
  console.log('wrote', name);
}
