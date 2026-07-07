# DRINK STOP site cleanup & hardening — design

## Context

`pley-clone` is a static export of a WordPress site (theme "pley-by-ney"), deployed to
Vercel as project "drinkstop". It was built as a visual clone/inspiration site and
carries WordPress/plugin scaffolding that no longer does anything useful in a static
context (TranslatePress, jQuery, a dead Instagram-feed stylesheet link) plus some gaps
that make it look more "real" than it functionally is (a contact form that posts to a
Contact Form 7 ajax endpoint which doesn't exist here).

Prior work in this session already: added `loading="lazy"` to below-the-fold images,
converted 37 large PNGs to WebP, re-encoded the two autoplay videos, and made both
videos load/play only via IntersectionObserver. This spec covers the next pass:
removing dead clone machinery and applying current best practices for performance,
accessibility, SEO, and mobile UX.

## Scope

One page (`index.html`) holds nearly all of the affected markup; `boy-better-know/`,
`order.html`, `onde-encontrar.html`, and `product/*/index.html` are checked for the
same issues but are mostly unaffected (TranslatePress/jQuery only load on the home
page).

### 1. Remove TranslatePress & dead plugin cruft

- Remove from `index.html`: `trp-language-switcher-v2.css` `<link>`, the two
  TranslatePress `<script src>` tags, the inline `trp_data` JSON blob and its
  `<script>` wrapper, the `translatepress-en_US` body class, all `data-trp-*` /
  `data-no-translation*` / `data-no-dynamic-translation` attributes on elements, the
  hidden `trp-form-language` form input, and the `<template id="tp-language">` tag.
- Remove `wp-content/plugins/translatepress-multilingual/` from disk.
- Remove `jquery.min.js` and `jquery-migrate.min.js` `<script>` tags and their files
  under `wp-includes/js/jquery/` — confirmed nothing in `bundle.js`, Contact Form 7's
  JS, or Akismet's JS references `jQuery`/`$`.
- Remove the dead `sbi_styles-css` (`instagram-feed`) stylesheet `<link>` — no feed
  markup exists anywhere in the page, it's a pure leftover `<link>` with nothing behind
  it. Leave the `instagram-feed` plugin directory itself alone (not worth the risk of
  deleting a directory that might be referenced elsewhere without checking every path)
  — just stop linking its CSS.
- Leave `bundle.js`'s own `["en","es"]` path-based routing helper untouched — it's
  unrelated custom theme code, not TranslatePress, and out of scope.

### 2. Contact form: stop the silent failure

- The `<form>` currently posts to a Contact Form 7 ajax endpoint that doesn't exist in
  this static deployment. Per your direction, no real backend gets wired up.
- Add a small inline script: on `submit`, `preventDefault()`, hide the form, and show
  an inline confirmation message ("Thanks — we'll be in touch") in its place. Purely
  client-side, no data goes anywhere, but the UI stops pretending to do something it
  can't.
- Also add real `<label>` elements (visually-hidden via a `.sr-only` utility class so
  the current placeholder-driven visual design is unchanged) for the 4 fields, plus
  `autocomplete` attributes (`name`, `email`, `tel`) for mobile autofill.

### 3. Performance

- Fix the broken `dns-prefetch` hrefs — they currently append `/index.html` to bare
  CDN domains (e.g. `cdn.jsdelivr.net/index.html`), which is not a valid prefetch
  target. Correct to bare origins (`https://cdn.jsdelivr.net`, etc.).
- Add `<link rel="preload">` for the hero LCP image and the Google Fonts stylesheet.
- Confirm/add `font-display=swap` on the Google Fonts request (via the `display=swap`
  query param) if not already present.
- Add `defer` to the ~15 end-of-body third-party `<script>` tags that don't need to
  block (gsap + plugins, swiper, plyr, fancybox, tabby, imask, addtoany). Scripts that
  the page's own inline scripts depend on synchronously (e.g. anything that assumes
  `gsap` is already defined the moment the next inline `<script>` runs) get tested
  after the change to confirm ordering still holds — `defer` preserves relative
  execution order among deferred scripts, so this should be safe, but it's the one
  change in this pass most likely to need a visual re-check.

### 4. Accessibility

- Fix the duplicate `<h1>` — both `.hero-title` and `.footer-title` are `<h1>`
  currently. Demote the footer one to a `<p class="footer-title">` (or `<span>`) with
  the same classes/styling, keeping `.hero-title` as the page's single `<h1>`.
- Remove `maximum-scale=1.0, user-scalable=no` from the viewport `<meta>` — this
  blocks pinch-zoom, a WCAG 1.4.4 failure with no real upside; keep
  `width=device-width, initial-scale=1.0`.
- Add a skip-to-content link as the first focusable element in `<body>`, visually
  hidden until focused, pointing at a `id="main"` landmark.
- Add explicit `width`/`height` attributes to the ~22 `<img>` tags currently missing
  them, to prevent layout shift as images load.

### 5. SEO / social

- Change `og:image` / `twitter:image` to absolute URLs (currently relative
  `wp-content/...`, which social crawlers cannot resolve against a relative base).
- Add a `Product` JSON-LD block per drink pouch (name, image, description) alongside
  the existing `Organization` / `WebSite` schema already in the page — additive, not a
  replacement.
- Add a minimal `robots.txt` (allow all, point at sitemap) and `sitemap.xml` listing
  `index.html`, `order.html`, `onde-encontrar.html`, `boy-better-know/`, and the 7
  `product/*/index.html` pages. Neither file exists today.
- Not doing: replacing the 564×362 logo used as `og:image` with a proper 1200×630
  social-card image — that requires new creative, not a code change, so it's called
  out here but left out of this implementation pass.

### 6. Mobile UX

- Spot-check nav links and CTA buttons (header nav, "Order Now", form submit, product
  card CTAs) against a 48×48px minimum tap target and adjust padding in CSS for any
  that fall short.
- `autocomplete` attributes on the contact form are covered under §2.

## Out of scope for this pass

- Real i18n (PT/EN toggle) — explicitly deferred per your earlier answer; this pass
  only removes the current (broken) TranslatePress wiring.
- Wiring the contact form to a real backend/email service — explicitly deferred per
  your answer.
- New creative assets (a proper 1200×630 OG image) — flagged above, not produced here.
- Deleting the `instagram-feed` and unused plugin directories from disk wholesale —
  only their dead `<link>`/`<script>` references are removed from the page; directory
  cleanup on disk is a separate, lower-risk-tolerance decision left for later.

## Testing / verification

This is a content/markup/script-loading change with no build step. Verification is:
load `index.html` locally (or via the existing `run`/browser tooling) and confirm:
- Page renders identically visually (spot-check hero, nav, product cards, footer).
- Contact form shows the confirmation message on submit instead of erroring/reloading.
- No console errors from removed jQuery/TranslatePress references (nothing else should
  depend on them).
- Scrolling still triggers the two lazy videos as before (unaffected by this pass, but
  confirms nothing in the `<head>`/script reordering broke GSAP/ScrollTrigger).
- View-source check: single `<h1>`, viewport meta allows zoom, skip link present and
  functional via keyboard Tab.
