/* Re-applies the current coin mark to layout.html, og.svg and sheet.cjs. Run after changing generate.mjs geometry. */
const fs = require('fs');
const path = require('path');
const here = __dirname;
const BLOB = 'M 250 104 C 352 96 452 158 446 254 C 440 350 352 410 254 406 C 156 402 64 348 68 254 C 72 160 148 112 250 104 Z';
const BITE = '<circle cx="452" cy="178" r="66" fill="#000"/>';
const eyes = (eye) => `<rect x="196" y="214" width="20" height="50" rx="10" fill="${eye}"/><rect x="262" y="214" width="20" height="50" rx="10" fill="${eye}"/>`;
const coinInner = (fill, eye, id) => `<defs><mask id="${id}"><rect width="512" height="512" fill="#fff"/>${BITE}</mask></defs><path d="${BLOB}" fill="${fill}" mask="url(#${id})"/>${eyes(eye)}`;

// layout.html: header wordmark
let layout = fs.readFileSync(path.join(here, '..', 'layout.html'), 'utf8');
layout = layout.replace(/<svg[^>]*aria-hidden="true"[^>]*viewBox="0 0 512 512"[^>]*>[\s\S]*?<\/svg>|<svg viewBox="0 0 512 512" aria-hidden="true">[\s\S]*?<\/svg>/, `<svg viewBox="0 0 512 512" aria-hidden="true">${coinInner('currentColor', 'var(--ground)', 'wm')}</svg>`);
fs.writeFileSync(path.join(here, '..', 'layout.html'), layout);

// og.svg: the mark group
let og = fs.readFileSync(path.join(here, 'og.svg'), 'utf8');
og = og.replace(/<g transform="translate\(70 60\) scale\(0\.3\)">[\s\S]*?<\/g>/, `<g transform="translate(70 60) scale(0.3)">${coinInner('#FFFFFF', '#0E0E0E', 'ogb')}</g>`);
fs.writeFileSync(path.join(here, 'og.svg'), og);

// sheet.cjs: the coin helper + copy
let sh = fs.readFileSync(path.join(here, 'sheet.cjs'), 'utf8');
sh = sh.replace(/(let mid = 0;\n)?const coin = [\s\S]*?;\n(?=\nconst html)/, () =>
  "let mid = 0;\nconst coin = (fill, eye) => { const id = 'm' + (mid++); return `<svg viewBox=\"0 0 512 512\"><defs><mask id=\"${id}\"><rect width=\"512\" height=\"512\" fill=\"#fff\"/><circle cx=\"452\" cy=\"178\" r=\"66\" fill=\"#000\"/></mask></defs><path d=\"${BLOB}\" fill=\"${fill}\" mask=\"url(#${id})\"/><rect x=\"196\" y=\"214\" width=\"20\" height=\"50\" rx=\"10\" fill=\"${eye}\"/><rect x=\"262\" y=\"214\" width=\"20\" height=\"50\" rx=\"10\" fill=\"${eye}\"/></svg>`; };\n",
);
sh = sh
  .replace('<h1>a coin with a face.</h1>', '<h1>a coin with a bite.</h1>')
  .replace(
    'A soft, slightly wonky oval, wider than tall, with two dash eyes. One shape, one colour, no gradients, no outlines. It is a peso coin that looks back at you, in the same family as flat companion blobs. Everything below is generated from a single SVG path.',
    'A soft, wonky coin with a bite out of its top-right edge, so it is also a lowercase c, and two dash eyes. One shape, one colour, no gradients, no outlines. In the app the coin is alive: it blinks, glances toward your number, and its eyes narrow as money weather turns tight. Everything below is generated from a single SVG path.',
  )
  .replace(
    '<div><b>The eyes are the brand.</b><span>Two vertical dashes, 20×50 in a 512 box, 68 apart. Do not add a mouth, brows, or a blink.</span></div>',
    "<div><b>The bite is the difference.</b><span>A circle cut from the top-right edge. It turns the blob into a c and a coin at once; keep it at 2 o'clock, never at mouth height.</span></div><div><b>The eyes are alive, not expressive.</b><span>Two vertical dashes, 20×50 in a 512 box, 66 apart. They blink, glance and narrow (sunny → caution → tight). No mouth, no brows, no pupils.</span></div>",
  );
fs.writeFileSync(path.join(here, 'sheet.cjs'), sh);
console.log('applied mark to layout.html, og.svg, sheet.cjs', layout.includes('wm'), og.includes('ogb'), sh.includes("'m' + (mid++)"));
