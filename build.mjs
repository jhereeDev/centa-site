/**
 * Static build: pages/*.html (fragment + JSON front matter) -> dist/ with the shared layout,
 * per-page meta, sitemap, robots, manifest, favicon set and OG image (rendered with sharp).
 */
import { mkdir, readdir, readFile, writeFile, cp } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const cfg = JSON.parse(await readFile(path.join(root, 'site.config.json'), 'utf8'));
const layout = await readFile(path.join(root, 'layout.html'), 'utf8');
const dist = path.join(root, 'dist');
await mkdir(dist, { recursive: true });

const siteUrl = cfg.siteUrl.replace(/\/$/, '');
const base = new URL(siteUrl).pathname.replace(/\/$/, ''); // '' for a root domain, '/centa-site' on project Pages
const year = new Date().getFullYear();

function fill(tpl, vars) {
  return tpl
    .replace(/\{\{cur:(\w+)\}\}/g, (_, k) => (vars.nav === k ? 'aria-current="page"' : ''))
    .replace(/\{\{(\w+)\}\}/g, (_, k) => (k in vars ? String(vars[k]) : ''));
}

const pageFiles = (await readdir(path.join(root, 'pages'))).filter((f) => f.endsWith('.html'));
const urls = [];
for (const file of pageFiles) {
  const raw = await readFile(path.join(root, 'pages', file), 'utf8');
  const m = raw.match(/^<!--\s*(\{[\s\S]*?\})\s*-->/);
  if (!m) throw new Error(`${file}: missing front matter`);
  const meta = JSON.parse(m[1]);
  let content = raw.slice(m[0].length).trim();
  const storeVars = {
    appStoreUrl: cfg.appStoreUrl || '#download',
    playStoreUrl: cfg.playStoreUrl || '#download',
    appStoreDisabled: cfg.appStoreUrl ? 'false' : 'true',
    playStoreDisabled: cfg.playStoreUrl ? 'false' : 'true',
  };
  content = fill(content, { base, siteUrl, ...cfg, ...storeVars, year });

  const slug = file.replace(/\.html$/, '');
  const outDir = slug === 'index' ? dist : path.join(dist, slug);
  const urlPath = slug === 'index' ? '/' : `/${slug}/`;
  const canonical = `${siteUrl}${urlPath === '/' ? '/' : urlPath}`;

  const jsonLd = meta.jsonLd ? `<script type="application/ld+json">${JSON.stringify(meta.jsonLd)}</script>` : '';
  const stickyCta = meta.stickyCta ? `<div class="sticky-cta"><a class="btn btn-primary" href="${base}/#download">Get Centa</a></div>` : '';
  const html = fill(layout, {
    ...cfg,
    siteName: cfg.name,
    siteUrl,
    base,
    year,
    title: meta.title,
    description: meta.description,
    canonical,
    nav: meta.nav ?? '',
    content,
    jsonLd,
    stickyCta,
    configJson: JSON.stringify({ contactEmail: cfg.contactEmail, formEndpoint: cfg.formEndpoint, analytics: cfg.analytics }),
  });
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, 'index.html'), html);
  if (slug === '404') await writeFile(path.join(dist, '404.html'), html); // GitHub Pages / Netlify convention
  if (!meta.noindex) urls.push({ loc: canonical, priority: slug === 'index' ? '1.0' : '0.6' });
  console.log('page', urlPath);
}

// Static assets
await cp(path.join(root, 'assets'), path.join(dist, 'assets'), { recursive: true });

// Custom domain for GitHub Pages
const host = new URL(siteUrl).host;
if (!host.endsWith('github.io')) await writeFile(path.join(dist, 'CNAME'), host + '\n');

// robots + sitemap
await writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
await writeFile(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${u.loc}</loc><lastmod>${cfg.effectiveDate}</lastmod><priority>${u.priority}</priority></url>`)
    .join('\n')}\n</urlset>\n`,
);

// Manifest
await writeFile(
  path.join(dist, 'site.webmanifest'),
  JSON.stringify({ name: cfg.name, short_name: cfg.name, start_url: `${base}/`, display: 'browser', background_color: '#F2F2F0', theme_color: '#0E0E0E', icons: [{ src: `${base}/icon-192.png`, sizes: '192x192', type: 'image/png' }, { src: `${base}/icon-512.png`, sizes: '512x512', type: 'image/png' }] }, null, 2),
);

// Favicon set + OG image
const mark = await readFile(path.join(root, 'brand', 'mark.svg'));
await writeFile(path.join(dist, 'favicon.svg'), mark);
for (const [name, size] of [['favicon-32.png', 32], ['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  await sharp(mark, { density: 300 }).resize(size, size).png().toFile(path.join(dist, name));
}
// .ico: a single 32px PNG payload in an ICO container (accepted by every modern browser).
const png32 = await sharp(mark, { density: 300 }).resize(32, 32).png().toBuffer();
const ico = Buffer.alloc(6 + 16);
ico.writeUInt16LE(0, 0); ico.writeUInt16LE(1, 2); ico.writeUInt16LE(1, 4);
ico.writeUInt8(32, 6); ico.writeUInt8(32, 7); ico.writeUInt8(0, 8); ico.writeUInt8(0, 9);
ico.writeUInt16LE(1, 10); ico.writeUInt16LE(32, 12); ico.writeUInt32LE(png32.length, 14); ico.writeUInt32LE(22, 18);
await writeFile(path.join(dist, 'favicon.ico'), Buffer.concat([ico, png32]));

const og = await readFile(path.join(root, 'brand', 'og.svg'));
await sharp(og, { density: 144 }).resize(1200, 630).png().toFile(path.join(dist, 'og.png'));

console.log(`built ${pageFiles.length} pages -> dist/ (base "${base || '/'}")`);
