/* Builds the brand sheet page (.shots/brand-sheet.html in the app repo) with inline SVGs and rendered icons. */
const fs = require('fs');
const path = require('path');
const here = __dirname;
const assets = path.resolve(here, '../../bta/apps/mobile/assets');
const out = path.resolve(here, '../../bta/.shots/brand-sheet.html');
const svg = (n) => fs.readFileSync(path.join(here, n), 'utf8');
const png = (p) => `data:image/png;base64,${fs.readFileSync(p).toString('base64')}`;
const BLOB = 'M 250 104 C 352 96 452 158 446 254 C 440 350 352 410 254 406 C 156 402 64 348 68 254 C 72 160 148 112 250 104 Z';
let mid = 0;
const coin = (fill, eye) => { const id = 'm' + (mid++); return `<svg viewBox="0 0 512 512"><defs><mask id="${id}"><rect width="512" height="512" fill="#fff"/><circle cx="452" cy="178" r="66" fill="#000"/></mask></defs><path d="${BLOB}" fill="${fill}" mask="url(#${id})"/><rect x="196" y="214" width="20" height="50" rx="10" fill="${eye}"/><rect x="262" y="214" width="20" height="50" rx="10" fill="${eye}"/></svg>`; };

const html = `<title>Centa Brand Mark</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600;800&display=swap">
<style>
  :root { --ground:#F2F2F0; --surface:#FFFFFF; --ink:#0E0E0E; --muted:#75756F; --faint:#E3E3DF; }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --ground:#0B0B0B; --surface:#161616; --ink:#F5F5F3; --muted:#9A9A94; --faint:#262626; } }
  :root[data-theme="dark"] { --ground:#0B0B0B; --surface:#161616; --ink:#F5F5F3; --muted:#9A9A94; --faint:#262626; }
  body { margin:0; background:var(--ground); color:var(--ink); font-family:Inter,system-ui,sans-serif; font-size:15px; line-height:1.55; }
  main { max-width:1080px; margin:0 auto; padding:48px 24px 96px; }
  h1,h2 { font-family:'Archivo Black',sans-serif; font-weight:400; letter-spacing:-.02em; margin:0; text-wrap:balance; }
  h1 { font-size:40px; line-height:1.05; } h2 { font-size:22px; margin:48px 0 16px; }
  .eyebrow { font-size:11px; font-weight:600; letter-spacing:.09em; text-transform:uppercase; color:var(--muted); }
  .lede { color:var(--muted); max-width:60ch; margin-top:12px; }
  .row { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:16px; }
  .tile { background:var(--surface); border-radius:20px; padding:20px; box-shadow:0 10px 24px rgba(0,0,0,.045); display:grid; gap:12px; justify-items:center; }
  .tile.dark { background:#0E0E0E; color:#fff; } .tile.paper { background:#F2F2F0; color:#0E0E0E; } .tile.light { background:#fff; color:#0E0E0E; }
  .tile svg, .tile img { width:120px; height:120px; display:block; }
  .tile .cap { font-size:12px; color:inherit; opacity:.6; text-align:center; }
  .sizes { display:flex; align-items:flex-end; gap:24px; flex-wrap:wrap; }
  .sizes img { display:block; border-radius:22%; }
  .lockup { display:flex; align-items:center; gap:14px; font-family:'Archivo Black',sans-serif; font-size:44px; letter-spacing:-.03em; }
  .lockup svg { width:52px; height:52px; }
  .rules { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:12px; }
  .rules div { background:var(--surface); border-radius:16px; padding:16px 18px; box-shadow:0 10px 24px rgba(0,0,0,.045); }
  .rules b { display:block; margin-bottom:4px; } .rules span { color:var(--muted); font-size:14px; }
  .phone { width:min(100%, 320px); border-radius:28px; background:#111; padding:18px; display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
  .phone .app { display:grid; gap:6px; justify-items:center; font-size:10px; color:#ddd; }
  .phone .app i { width:52px; height:52px; border-radius:14px; background:#333; display:block; }
  .phone .app img { width:52px; height:52px; border-radius:14px; }
</style>
<main>
  <div class="eyebrow">centa · brand mark · ${new Date().toISOString().slice(0, 10)}</div>
  <h1>a coin with a bite.</h1>
  <p class="lede">A soft, wonky coin with a bite out of its top-right edge, so it is also a lowercase c, and two dash eyes. One shape, one colour, no gradients, no outlines. In the app the coin is alive: it blinks, glances toward your number, and its eyes narrow as money weather turns tight. Everything below is generated from a single SVG path.</p>

  <h2>the mark</h2>
  <div class="row">
    <div class="tile dark">${coin('#FFFFFF', '#0E0E0E')}<span class="cap">on ink · app icon</span></div>
    <div class="tile light">${coin('#0E0E0E', '#FFFFFF')}<span class="cap">on white · logo</span></div>
    <div class="tile paper">${coin('#0E0E0E', '#F2F2F0')}<span class="cap">on ground · in-app</span></div>
    <div class="tile dark"><img src="${png(path.join(assets, 'icon.png'))}" alt="iOS app icon, white coin on black"><span class="cap">iOS icon 1024</span></div>
  </div>

  <h2>lockup</h2>
  <div class="tile light" style="justify-items:start;padding:28px 32px"><div class="lockup">${coin('#0E0E0E', '#FFFFFF')}<span>centa</span></div><span class="cap">wordmark: Archivo Black, lowercase, −3% tracking, mark at cap height × 1.2</span></div>

  <h2>at size</h2>
  <div class="tile light" style="justify-items:start"><div class="sizes">
    ${[180, 120, 80, 60, 40, 29].map((s) => `<img src="${png(path.join(assets, 'icon.png'))}" width="${s}" height="${s}" alt="icon at ${s}px">`).join('')}
  </div><span class="cap">180 · 120 · 80 · 60 · 40 · 29 px. The eyes hold down to 29.</span></div>

  <h2>on a home screen</h2>
  <div class="row">
    <div class="tile dark" style="justify-items:center"><div class="phone">
      <div class="app"><i></i>Photos</div><div class="app"><img src="${png(path.join(assets, 'icon.png'))}" alt="Centa icon among other apps">centa</div><div class="app"><i></i>GCash</div><div class="app"><i></i>Maya</div>
    </div><span class="cap">iOS, dark wallpaper</span></div>
    <div class="tile light" style="justify-items:center"><div class="phone" style="background:#e8e8e4"><div class="app" style="color:#333"><i style="background:#cfcfca"></i>Photos</div><div class="app" style="color:#333"><img src="${png(path.join(assets, 'icon.png'))}" style="border-radius:50%" alt="Centa icon, Android round mask">centa</div><div class="app" style="color:#333"><i style="background:#cfcfca"></i>GCash</div><div class="app" style="color:#333"><i style="background:#cfcfca"></i>Maya</div></div><span class="cap">Android, round mask</span></div>
    <div class="tile paper"><img src="${png(path.join(assets, 'splash-icon.png'))}" alt="splash icon, ink coin on off-white"><span class="cap">splash</span></div>
    <div class="tile dark"><img src="${png(path.join(assets, 'android-icon-monochrome.png'))}" alt="Android themed icon layer" style="background:#3a3a3a;border-radius:24px"><span class="cap">Android themed layer</span></div>
  </div>

  <h2>rules</h2>
  <div class="rules">
    <div><b>Two colours, ever.</b><span>Ink #0E0E0E and white. On the off-white ground the eyes take the ground colour so the coin looks punched, not printed.</span></div>
    <div><b>Never outline, never gradient the coin.</b><span>The ink gradient belongs to cards, not to the mark. The coin stays flat so it survives at 29 px.</span></div>
    <div><b>The bite is the difference.</b><span>A circle cut from the top-right edge. It turns the blob into a c and a coin at once; keep it at 2 o'clock, never at mouth height.</span></div><div><b>The eyes are alive, not expressive.</b><span>Two vertical dashes, 20×50 in a 512 box, 66 apart. They blink, glance and narrow (sunny → caution → tight). No mouth, no brows, no pupils.</span></div>
    <div><b>Clear space.</b><span>Half the coin's height on every side. In the lockup the mark sits at 1.2× cap height of "centa".</span></div>
    <div><b>Widgets keep the day strip.</b><span>The coin is for identity surfaces: icon, splash, site, store listing. Widgets stay typographic.</span></div>
    <div><b>Source of truth.</b><span>centa-site/brand/generate.mjs. Run it to regenerate every icon and SVG after any change to the path.</span></div>
  </div>
</main>
`;
fs.writeFileSync(out, html);
console.log('wrote', out, Math.round(fs.statSync(out).size / 1024), 'KB');
