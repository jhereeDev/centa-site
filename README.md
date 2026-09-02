# centa-site

The Centa website: landing page, privacy policy, terms of use and support. These are the URLs App Store Connect and Google Play Console ask for.

Static HTML, one small build script, no framework. Deploys to GitHub Pages on every push to `main`.

## Run

```sh
npm ci
npm run build     # -> dist/
npm run serve     # build + local preview
```

## Fill these in before submitting to the stores

Everything user-facing comes from `site.config.json`:

| Key | What | Status |
|---|---|---|
| `siteUrl` | Canonical URL. `https://centa.jhere.site`; the build writes a CNAME file for Pages. | set |
| `developer` | Legal name shown in the policy, terms and footer. | set |
| `contactEmail` | Support address. Must be monitored; Apple and Google email it. | set |
| `postalAddress` | Physical address. Google Play requires a full street address for paid apps and shows it on the listing. | city only |
| `appStoreUrl`, `playStoreUrl` | Store links. Buttons render disabled until set. | empty |
| `formEndpoint` | A Formspree/Basin/etc. endpoint for the support form. Empty falls back to mailto. | empty |
| `analytics.domain` | Plausible site domain. Empty disables analytics and the notice entirely. | empty |

## DNS for centa.jhere.site

At your DNS provider for jhere.site add a CNAME record: host `centa`, value `jhereedev.github.io`. Pages issues the HTTPS certificate automatically once the record resolves (usually within an hour); then tick "Enforce HTTPS" in the repo Settings → Pages.

## Store forms

- **Apple App Privacy:** "Data Not Collected" for every category. Purchases go through StoreKit; RevenueCat receives the receipt and an anonymous app user ID (declare under "Purchases" only if you list RevenueCat as a third party; it does not link to identity).
- **Google Play Data safety:** no data collected or shared. App does not use encryption in transit for user data (nothing is transmitted). Provide the privacy policy URL from this site.
- **Account deletion (Play):** not applicable, no accounts. The support page still has a `#delete` section explaining how to remove local data, which reviewers like to see.

## What is here (the "is it a real site" checklist)

Custom 404, CTA above the fold and sticky on mobile, per-page title and description, Open Graph and Twitter cards with a generated 1200×630 image, favicon set (SVG, ICO, Apple touch icon, PWA icons, manifest), `robots.txt`, `sitemap.xml`, alt text on images, mobile breakpoints, loading and error states on the form, honeypot spam field, thank-you page, privacy policy, terms, analytics notice (only when analytics is on), real contact block in the footer, JSON-LD for the app, skip link, reduced-motion support, light and dark themes.

## Structure

```
site.config.json   values injected everywhere
layout.html        shared head/header/footer, {{placeholders}}
pages/*.html       fragment + JSON front matter (title, description, nav, jsonLd, noindex)
assets/            styles.css, main.js
brand/             mark.svg (favicons), og.svg (share image)
build.mjs          renders pages, sitemap, robots, manifest, icons, og.png
```
