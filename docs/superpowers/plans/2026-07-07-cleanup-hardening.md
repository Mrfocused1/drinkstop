# DRINK STOP Cleanup & Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove dead WordPress/TranslatePress/jQuery clone scaffolding from `pley-clone/index.html` and apply the perf/a11y/SEO/mobile fixes agreed in `docs/superpowers/specs/2026-07-07-cleanup-hardening-design.md`.

**Architecture:** This is a static HTML site with no build step and no test framework — all work is direct edits to `index.html` (plus two new root files: `robots.txt`, `sitemap.xml`). There is no `npm test`; "tests" in this plan are `grep`/`view-source` verification commands with an exact expected result, run after each change.

**Tech Stack:** Static HTML/CSS/vanilla JS, deployed to Vercel. Tools used during implementation: `grep`, `python3` (for the one bulk-edit script), a browser for visual spot-checks.

---

## Before starting

All work happens in `/Users/paulbridges/Desktop/drinkss/pley-clone`. Confirm the working tree is clean before beginning (this repo already has uncommitted webp/video conversions from a prior session — check with the user before touching those if `git status` isn't clean when you start; don't discard them):

```bash
cd /Users/paulbridges/Desktop/drinkss/pley-clone && git status --short
```

Every task below edits `index.html` unless stated otherwise. Line numbers will drift as edits land — always re-`grep` for the anchor string before editing rather than trusting a remembered line number.

---

### Task 1: Remove TranslatePress markup and scripts

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Remove the TranslatePress `<link>` and `<script>` tags from `<head>`**

Find and delete this line (appears once, near the other stylesheet links):

```html
<link rel='stylesheet' id='trp-language-switcher-v2-css' href='wp-content/plugins/translatepress-multilingual/assets/css/trp-language-switcher-v2.css' type='text/css' media='all' />
```

And this line (in the head script block):

```html
<script type="text/javascript" src="wp-content/plugins/translatepress-multilingual/assets/js/trp-frontend-language-switcher.js" id="trp-language-switcher-js-v2-js"></script>
```

- [ ] **Step 2: Remove the `translatepress-en_US` body class**

Find:

```html
<body class="home wp-singular page-template-default page page-id-6 wp-embed-responsive wp-theme-pley-by-ney translatepress-en_US">
```

Replace with:

```html
<body class="home wp-singular page-template-default page page-id-6 wp-embed-responsive wp-theme-pley-by-ney">
```

- [ ] **Step 3: Remove the speculationrules script, tp-language template, and trp_data blob**

Find this whole block (it's contiguous — the `<template>` tag, the `speculationrules` script, the "Instagram Feed JS" var script, and the `trp_data` script all sit together):

```html
</div>    <template id="tp-language" data-tp-language="en_US"></template><script type="speculationrules">
{"prefetch":[{"source":"document","where":{"and":[{"href_matches":"\/en\/*"},{"not":{"href_matches":["\/wp-*.php","\/wp-admin\/*","\/wp-content\/uploads\/*","\/wp-content\/*","\/wp-content\/plugins\/*","\/wp-content\/themes\/pley-by-ney\/*","\/en\/*\\?(.+)"]}},{"not":{"selector_matches":"a[rel~=\"nofollow\"]"}},{"not":{"selector_matches":".no-prefetch, .no-prefetch a"}}]},"eagerness":"conservative"}]}
</script>
<!-- Instagram Feed JS -->
<script type="text/javascript">
var sbiajaxurl = "https://pleybyney.com.br/wp-admin/admin-ajax.php";
</script>
<script type="text/javascript" id="trp-dynamic-translator-js-extra">
/* <![CDATA[ */
var trp_data = {"trp_custom_ajax_url":"https:\/\/pleybyney.com.br\/wp-content\/plugins\/translatepress-multilingual\/includes\/trp-ajax.php","trp_wp_ajax_url":"https:\/\/pleybyney.com.br\/wp-admin\/admin-ajax.php","trp_language_to_query":"en_US","trp_original_language":"pt_BR","trp_current_language":"en_US","trp_skip_selectors":["[data-no-translation]","[data-no-dynamic-translation]","[data-trp-translate-id-innertext]","script","style","head","trp-span","translate-press","[data-trp-translate-id]","[data-trpgettextoriginal]","[data-trp-post-slug]"],"trp_base_selectors":["data-trp-translate-id","data-trpgettextoriginal","data-trp-post-slug"],"trp_attributes_selectors":{"text":{"accessor":"outertext","attribute":false},"block":{"accessor":"innertext","attribute":false},"image_src":{"selector":"img[src]","accessor":"src","attribute":true},"submit":{"selector":"input[type='submit'],input[type='button'], input[type='reset']","accessor":"value","attribute":true},"placeholder":{"selector":"input[placeholder],textarea[placeholder]","accessor":"placeholder","attribute":true},"title":{"selector":"[title]","accessor":"title","attribute":true},"a_href":{"selector":"a[href]","accessor":"href","attribute":true},"button":{"accessor":"outertext","attribute":false},"option":{"accessor":"innertext","attribute":false},"aria_label":{"selector":"[aria-label]","accessor":"aria-label","attribute":true},"video_src":{"selector":"video[src]","accessor":"src","attribute":true},"video_poster":{"selector":"video[poster]","accessor":"poster","attribute":true},"video_source_src":{"selector":"video source[src]","accessor":"src","attribute":true},"audio_src":{"selector":"audio[src]","accessor":"src","attribute":true},"audio_source_src":{"selector":"audio source[src]","accessor":"src","attribute":true},"picture_image_src":{"selector":"picture image[src]","accessor":"src","attribute":true},"picture_source_srcset":{"selector":"picture source[srcset]","accessor":"srcset","attribute":true}},"trp_attributes_accessors":["outertext","innertext","src","value","placeholder","title","href","aria-label","poster","srcset"],"gettranslationsnonceregular":"d9f99284c0","showdynamiccontentbeforetranslation":"","skip_strings_from_dynamic_translation":[],"skip_strings_from_dynamic_translation_for_substrings":{"href":["amazon-adsystem","googleads","g.doubleclick"]},"duplicate_detections_allowed":"100","trp_translate_numerals_opt":"no","trp_no_auto_translation_selectors":["[data-no-auto-translation]"]};
/* ]]> */
</script>
<script type="text/javascript" src="wp-content/plugins/translatepress-multilingual/assets/js/trp-translate-dom-changes.js" id="trp-dynamic-translator-js"></script>
```

Replace it with just the closing div (keep the DOM structure intact, drop everything else):

```html
</div>
```

- [ ] **Step 4: Remove the hidden `trp-form-language` input from the contact form**

Find (inside the contact form, just before `</form>`):

```html
<input type="hidden" name="trp-form-language" value="en"/></form>
```

Replace with:

```html
</form>
```

- [ ] **Step 5: Remove `data-trp-original-action`, `data-no-translation-aria-label`, `data-no-translation` and similar TranslatePress data attributes**

Run this to find every remaining TranslatePress reference:

```bash
grep -no "data-trp[a-z-]*\|data-no-translation[a-z-]*\|data-no-dynamic-translation" index.html
```

For each match, remove just that one attribute (and its value) from its tag — leave the rest of the tag untouched. There are roughly 3-6 of these; the biggest is in the contact form's `<form>` tag:

```html
<form action="index.html#wpcf7-f20-o1" method="post" class="wpcf7-form init" aria-label="Formulários de contato" novalidate="novalidate" data-status="init" data-no-translation-aria-label="" data-trp-original-action="/en/#wpcf7-f20-o1">
```

becomes:

```html
<form action="index.html#wpcf7-f20-o1" method="post" class="wpcf7-form init" aria-label="Formulários de contato" novalidate="novalidate" data-status="init">
```

- [ ] **Step 6: Delete the TranslatePress plugin directory**

```bash
rm -rf wp-content/plugins/translatepress-multilingual
```

- [ ] **Step 7: Verify no TranslatePress references remain**

```bash
grep -ci "translatepress\|trp_data\|trp-language\|tp-language" index.html
```

Expected: `0`

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Remove TranslatePress scaffolding (dead on a static export)"
```

---

### Task 2: Remove jQuery and jquery-migrate

**Files:**
- Modify: `index.html`
- Delete: `wp-includes/js/jquery/jquery.min.js`, `wp-includes/js/jquery/jquery-migrate.min.js`

Already confirmed in the design doc that nothing in `bundle.js`, Contact Form 7's JS, or Akismet's JS references `jQuery`/`$` — this is pure dead weight loaded render-blocking in `<head>`.

- [ ] **Step 1: Remove the two script tags**

Find and delete both lines (they're adjacent, near the top of `<head>`):

```html
<script type="text/javascript" src="wp-includes/js/jquery/jquery.min.js" id="jquery-core-js"></script>
<script type="text/javascript" src="wp-includes/js/jquery/jquery-migrate.min.js" id="jquery-migrate-js"></script>
```

- [ ] **Step 2: Delete the now-unused files**

```bash
rm -f wp-includes/js/jquery/jquery.min.js wp-includes/js/jquery/jquery-migrate.min.js
```

- [ ] **Step 3: Verify removal**

```bash
grep -c "jquery.min.js\|jquery-migrate" index.html
```

Expected: `0`

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Remove unused jQuery/jquery-migrate (nothing on the page depends on it)"
```

---

### Task 3: Remove dead Instagram-feed stylesheet reference

**Files:**
- Modify: `index.html`

There is no Instagram feed markup anywhere on the page — this `<link>` loads a stylesheet with nothing to style, and Task 1 Step 3 already removed the `sbiajaxurl` inline script that went with it.

- [ ] **Step 1: Remove the stylesheet link**

Find and delete:

```html
<link rel='stylesheet' id='sbi_styles-css' href='wp-content/plugins/instagram-feed/css/sbi-styles.min.css' type='text/css' media='all' />
```

- [ ] **Step 2: Verify**

```bash
grep -c "sbi_styles\|sbiajaxurl" index.html
```

Expected: `0`

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Remove dead Instagram-feed stylesheet link (no feed markup exists)"
```

---

### Task 4: Fix broken dns-prefetch hints

**Files:**
- Modify: `index.html`

**Files:** these hrefs currently append `/index.html` to bare CDN domains, which is not a valid dns-prefetch target (it's not even a valid URL without a scheme) — the hint currently does nothing.

- [ ] **Step 1: Fix the four dns-prefetch lines**

Find:

```html
<link rel='dns-prefetch' href='cdn.jsdelivr.net/index.html' />
<link rel='dns-prefetch' href='https://cdn.plyr.io/' />
<link rel='dns-prefetch' href='static.addtoany.com/index.html' />
<link rel='dns-prefetch' href='unpkg.com/index.html' />
```

Replace with:

```html
<link rel='dns-prefetch' href='https://cdn.jsdelivr.net' />
<link rel='dns-prefetch' href='https://cdn.plyr.io' />
<link rel='dns-prefetch' href='https://static.addtoany.com' />
<link rel='dns-prefetch' href='https://unpkg.com' />
```

- [ ] **Step 2: Verify**

```bash
grep -n "dns-prefetch" index.html
```

Expected: four lines, each `href='https://...'` with no `/index.html` suffix.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Fix broken dns-prefetch hrefs (were appending /index.html to bare domains)"
```

---

### Task 5: Preload the hero LCP image

**Files:**
- Modify: `index.html`

The Google Fonts stylesheet is already loaded eagerly with `preconnect` hints in place. `font-display: swap` is already set in the locally-saved `fonts.googleapis.com/css2.css` (confirmed — no change needed there). The remaining win is preloading the hero image, which is the page's LCP candidate.

- [ ] **Step 1: Add a preload link for the hero mobile image**

Find:

```html
  <link href="fonts.googleapis.com/css2.css" rel="stylesheet">
```

Add immediately after it:

```html
  <link href="fonts.googleapis.com/css2.css" rel="stylesheet">
  <link rel="preload" as="image" href="wp-content/uploads/2025/drinks/hero-mobile.webp" media="(max-width: 63.9em)">
  <link rel="preload" as="image" href="wp-content/uploads/2025/drinks/pouch-red.webp" media="(min-width: 64em)">
```

(`hero-mobile.webp` is the visible LCP image on mobile per the existing `.hero-mobile-image` CSS; `pouch-red.webp` is the equivalent visible hero pouch on desktop widths, per the existing `.hero-pouch.is-active` markup.)

- [ ] **Step 2: Verify**

```bash
grep -c 'rel="preload" as="image"' index.html
```

Expected: `2`

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Preload hero LCP image for mobile and desktop"
```

---

### Task 6: Defer end-of-body third-party scripts

**Files:**
- Modify: `index.html`

These scripts sit at the end of `<body>` already (a decent pattern), but none carry `defer`, so each still blocks the HTML parser at the point it's encountered while the browser fetches/executes it. Adding `defer` lets the browser fetch them in parallel without blocking, and — critically — `defer` preserves execution order relative to other deferred scripts, so GSAP loads before its plugins, which load before `bundle.js`'s plugin registration call.

- [ ] **Step 1: Add `defer` to each of these lines**

Find this block:

```html
<script type="text/javascript" src="cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js" id="gsap-js"></script>
<script type="text/javascript" src="cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollSmoother.min.js" id="scrollsmoother-js"></script>
<script type="text/javascript" src="cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js" id="scrolltrigger-js"></script>
<script type="text/javascript" src="cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollToPlugin.min.js" id="scrollto-js"></script>
<script type="text/javascript" src="cdn.jsdelivr.net/npm/gsap@3.13.0/dist/TextPlugin.min.js" id="text-js"></script>
<script type="text/javascript" src="cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js" id="splittext-js"></script>
<script type="text/javascript" src="cdn.jsdelivr.net/npm/@fancyapps/ui@6.0/dist/fancybox/fancybox.umd.js" id="fancybox-js-js"></script>
<script type="text/javascript" src="cdn.jsdelivr.net/gh/cferdinandi/tabby@12.0.3/dist/js/tabby.polyfills.min.js" id="tabby-js-js"></script>
<script type="text/javascript" src="cdn.plyr.io/3.8.3/plyr.js" id="plyr-js"></script>
<script type="text/javascript" src="cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js" id="swiper-js-js"></script>
<script type="text/javascript" src="static.addtoany.com/menu/page.js" id="addtoany-js-js"></script>
<script type="text/javascript" src="unpkg.com/imask.js" id="imask-js"></script>
```

Replace with (each gets `defer` added right after `type="text/javascript"`):

```html
<script type="text/javascript" defer src="cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js" id="gsap-js"></script>
<script type="text/javascript" defer src="cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollSmoother.min.js" id="scrollsmoother-js"></script>
<script type="text/javascript" defer src="cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js" id="scrolltrigger-js"></script>
<script type="text/javascript" defer src="cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollToPlugin.min.js" id="scrollto-js"></script>
<script type="text/javascript" defer src="cdn.jsdelivr.net/npm/gsap@3.13.0/dist/TextPlugin.min.js" id="text-js"></script>
<script type="text/javascript" defer src="cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js" id="splittext-js"></script>
<script type="text/javascript" defer src="cdn.jsdelivr.net/npm/@fancyapps/ui@6.0/dist/fancybox/fancybox.umd.js" id="fancybox-js-js"></script>
<script type="text/javascript" defer src="cdn.jsdelivr.net/gh/cferdinandi/tabby@12.0.3/dist/js/tabby.polyfills.min.js" id="tabby-js-js"></script>
<script type="text/javascript" defer src="cdn.plyr.io/3.8.3/plyr.js" id="plyr-js"></script>
<script type="text/javascript" defer src="cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js" id="swiper-js-js"></script>
<script type="text/javascript" defer src="static.addtoany.com/menu/page.js" id="addtoany-js-js"></script>
<script type="text/javascript" defer src="unpkg.com/imask.js" id="imask-js"></script>
```

`bundle.js` (`<script type="module" src="wp-content/themes/pley-by-ney/dist/bundle.js">`) is already deferred by default via `type="module"` — leave it as-is. The inline `<script id="drinkstop-hero-rotate">` etc. that follow all this run after the deferred scripts execute (deferred scripts run in order, before `DOMContentLoaded`, and before any subsequent parser-inserted inline script) — so ordering is preserved.

- [ ] **Step 2: Verify**

```bash
grep -c 'type="text/javascript" defer src' index.html
```

Expected: `11`

- [ ] **Step 3: Visual/functional re-check (this is the one change in this plan most likely to shift behavior)**

Open `index.html` in a browser (or via the project's `run`/browser tooling) and confirm:
- GSAP-driven scroll animations (hero, marquee, product reveals) still fire on scroll.
- Swiper carousel (contact-card sliders) still swipes/paginates.
- Fancybox (if used for a gallery/lightbox) still opens on click.
- No new console errors mentioning `gsap`, `ScrollTrigger`, `Swiper`, or `Plyr` being undefined.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Defer end-of-body third-party scripts to stop blocking the parser"
```

---

### Task 7: Fix duplicate `<h1>`

**Files:**
- Modify: `index.html`

Two `<h1>` elements exist (`.hero-title` and `.footer-title`). Keep `.hero-title` as the page's single `<h1>`; demote the footer one.

- [ ] **Step 1: Change the footer heading tag**

Find:

```html
        <h1 class="footer-title">
          <span class="footer-title--first">Pley</span>
          <span class="footer-title--second">is on.</span>
        </h1>
```

Replace with:

```html
        <p class="footer-title">
          <span class="footer-title--first">Pley</span>
          <span class="footer-title--second">is on.</span>
        </p>
```

- [ ] **Step 2: Verify exactly one `<h1>` remains**

```bash
grep -c "<h1" index.html
```

Expected: `1`

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Demote footer heading from h1 to p (page should have a single h1)"
```

---

### Task 8: Fix viewport meta to allow zoom

**Files:**
- Modify: `index.html`

`maximum-scale=1.0, user-scalable=no` blocks pinch-zoom — a WCAG 1.4.4 failure with no real upside.

- [ ] **Step 1: Fix the viewport meta tag**

Find:

```html
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

Replace with:

```html
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
```

- [ ] **Step 2: Verify**

```bash
grep -c "user-scalable\|maximum-scale" index.html
```

Expected: `0`

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "Allow pinch-zoom (remove maximum-scale/user-scalable lock from viewport meta)"
```

---

### Task 9: Add a skip-to-content link

**Files:**
- Modify: `index.html`

`<main class="page-home">` already exists at the point content starts — it just needs an `id` to be a valid link target, plus the link itself and minimal CSS to keep it visually hidden until focused.

- [ ] **Step 1: Add the skip link as the first element inside `<body>`**

Find:

```html
<body class="home wp-singular page-template-default page page-id-6 wp-embed-responsive wp-theme-pley-by-ney">
```

Replace with:

```html
<body class="home wp-singular page-template-default page page-id-6 wp-embed-responsive wp-theme-pley-by-ney">
  <a class="skip-to-content" href="index.html#main-content">Skip to content</a>
```

- [ ] **Step 2: Give `<main>` the matching id**

Find:

```html
    <main class="page-home">
```

Replace with:

```html
    <main class="page-home" id="main-content">
```

- [ ] **Step 3: Add the visually-hidden-until-focused CSS**

Find the `wp-custom-css` style block:

```html
		<style type="text/css" id="wp-custom-css">
			.sustainability__products--image .btn--ghost {
    display: none !important;
}
```

Replace with (adding the new rule before the existing one):

```html
		<style type="text/css" id="wp-custom-css">
			.skip-to-content {
    position: absolute;
    left: -9999px;
    top: 0;
    z-index: 1000;
    padding: 0.75rem 1.25rem;
    background: #000;
    color: #fff;
    text-decoration: none;
}
.skip-to-content:focus {
    left: 0.5rem;
    top: 0.5rem;
}
			.sustainability__products--image .btn--ghost {
    display: none !important;
}
```

- [ ] **Step 4: Verify**

```bash
grep -c "skip-to-content" index.html
grep -c 'id="main-content"' index.html
```

Expected: `3` (link + two CSS rules) and `1`.

- [ ] **Step 5: Keyboard test**

Open the page in a browser, press `Tab` once from the top of the page — confirm the "Skip to content" link becomes visible, and pressing `Enter` moves focus/scrolls to the main content area.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add skip-to-content link for keyboard navigation"
```

---

### Task 10: Add explicit width/height to images missing them

**Files:**
- Create: `add_image_dimensions.py` (temporary script, deleted after use)
- Modify: `index.html`

40 `<img>` tags lack `width`/`height`, which allows layout shift as each image loads. This is mechanical and repetitive across many tags, so it's done with a script rather than 40 manual edits — the script reads each image file's real dimensions and inserts them.

- [ ] **Step 1: Write the script**

Create `add_image_dimensions.py` in `pley-clone/`:

```python
import re
import subprocess

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

def get_dims(src):
    result = subprocess.run(
        ["magick", "identify", "-format", "%w %h", src],
        capture_output=True, text=True, check=True,
    )
    w, h = result.stdout.strip().split()
    return w, h

def add_dims(match):
    tag = match.group(0)
    if 'width="' in tag:
        return tag
    src_match = re.search(r'src="([^"]+)"', tag)
    if not src_match:
        return tag
    src = src_match.group(1)
    try:
        w, h = get_dims(src)
    except Exception as e:
        print(f"skip {src}: {e}")
        return tag
    return tag.replace("<img ", f'<img width="{w}" height="{h}" ', 1)

new_html = re.sub(r"<img\b[^>]*>", add_dims, html)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(new_html)

print("done")
```

- [ ] **Step 2: Run it**

```bash
python3 add_image_dimensions.py
```

Expected output: `done`, with any `skip ...` lines printed for images the script couldn't find on disk (investigate any that appear — there shouldn't be any, since every remaining `<img>` src was verified to exist in Task work done in the prior session).

- [ ] **Step 3: Verify no `<img>` tags are missing width**

```bash
grep -c "<img" index.html
grep -c 'width="' index.html
```

Expected: both counts equal (62).

- [ ] **Step 4: Delete the script**

```bash
rm add_image_dimensions.py
```

- [ ] **Step 5: Visual spot-check**

Open the page in a browser and confirm no images look stretched or squished — native `width`/`height` set the aspect ratio, but CSS `width:100%`/`object-fit` (already present on most of these via existing classes) still controls final rendered size, so this should be purely cosmetic-neutral. Pay particular attention to `.hero-pouch` images and the decorative star/spark images, since those are absolutely positioned.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add explicit width/height to all img tags to prevent layout shift"
```

---

### Task 11: Contact form — labels, autocomplete, and graceful non-submit

**Files:**
- Modify: `index.html`

The form currently posts to a Contact Form 7 ajax endpoint that doesn't exist in this static deployment. Per the design doc, no backend gets wired up — instead the submit is intercepted client-side and a confirmation message replaces the form.

- [ ] **Step 1: Add a `.sr-only` utility class (if not already present)**

```bash
grep -c "\.sr-only" index.html
```

If this prints `0`, add the class to the same `wp-custom-css` block touched in Task 9:

Find:

```html
.skip-to-content:focus {
    left: 0.5rem;
    top: 0.5rem;
}
```

Replace with:

```html
.skip-to-content:focus {
    left: 0.5rem;
    top: 0.5rem;
}
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
```

- [ ] **Step 2: Add labels and autocomplete to the four fields**

Find:

```html
    <span class="wpcf7-form-control-wrap" data-name="nome"><input size="40" maxlength="400" class="wpcf7-form-control wpcf7-text wpcf7-validates-as-required" aria-required="true" aria-invalid="false" placeholder="Full name" value="" type="text" name="nome" /></span>
```

Replace with:

```html
    <label for="wpcf7-nome" class="sr-only">Full name</label>
    <span class="wpcf7-form-control-wrap" data-name="nome"><input id="wpcf7-nome" size="40" maxlength="400" class="wpcf7-form-control wpcf7-text wpcf7-validates-as-required" aria-required="true" aria-invalid="false" placeholder="Full name" value="" type="text" name="nome" autocomplete="name" /></span>
```

Find:

```html
    <span class="wpcf7-form-control-wrap" data-name="email"><input size="40" maxlength="400" class="wpcf7-form-control wpcf7-email wpcf7-validates-as-required wpcf7-text wpcf7-validates-as-email" aria-required="true" aria-invalid="false" placeholder="E-mail" value="" type="email" name="email" /></span>
```

Replace with:

```html
    <label for="wpcf7-email" class="sr-only">Email</label>
    <span class="wpcf7-form-control-wrap" data-name="email"><input id="wpcf7-email" size="40" maxlength="400" class="wpcf7-form-control wpcf7-email wpcf7-validates-as-required wpcf7-text wpcf7-validates-as-email" aria-required="true" aria-invalid="false" placeholder="E-mail" value="" type="email" name="email" autocomplete="email" /></span>
```

Find:

```html
    <span class="wpcf7-form-control-wrap" data-name="telefone"><input size="40" maxlength="400" class="wpcf7-form-control wpcf7-tel wpcf7-validates-as-required wpcf7-text wpcf7-validates-as-tel" aria-required="true" aria-invalid="false" placeholder="Telephone" value="" type="tel" name="telefone" /></span>
```

Replace with:

```html
    <label for="wpcf7-telefone" class="sr-only">Telephone</label>
    <span class="wpcf7-form-control-wrap" data-name="telefone"><input id="wpcf7-telefone" size="40" maxlength="400" class="wpcf7-form-control wpcf7-tel wpcf7-validates-as-required wpcf7-text wpcf7-validates-as-tel" aria-required="true" aria-invalid="false" placeholder="Telephone" value="" type="tel" name="telefone" autocomplete="tel" /></span>
```

Find:

```html
    <span class="wpcf7-form-control-wrap" data-name="mensagem"><textarea cols="40" rows="10" maxlength="2000" class="wpcf7-form-control wpcf7-textarea wpcf7-validates-as-required" aria-required="true" aria-invalid="false" placeholder="Message" name="mensagem"></textarea></span>
```

Replace with:

```html
    <label for="wpcf7-mensagem" class="sr-only">Message</label>
    <span class="wpcf7-form-control-wrap" data-name="mensagem"><textarea id="wpcf7-mensagem" cols="40" rows="10" maxlength="2000" class="wpcf7-form-control wpcf7-textarea wpcf7-validates-as-required" aria-required="true" aria-invalid="false" placeholder="Message" name="mensagem"></textarea></span>
```

- [ ] **Step 3: Give the form itself an id and wrap it for the swap-on-submit behavior**

Find:

```html
<div class="wpcf7 no-js" id="wpcf7-f20-o1" lang="pt-BR" dir="ltr" data-wpcf7-id="20">
```

Replace with:

```html
<div class="wpcf7 no-js" id="wpcf7-f20-o1" lang="pt-BR" dir="ltr" data-wpcf7-id="20">
<p class="contact-form-success sr-only" id="contact-form-success" role="status">Thanks — we'll be in touch.</p>
```

- [ ] **Step 4: Add the intercept script**

Find the closing `</form>` from Task 1 Step 4's result:

```html
</form>
```

(this is the only `</form>` in the file — confirm with `grep -c "</form>" index.html` before editing, expected `1`)

Replace with:

```html
</form>
<script>
  (function () {
    var form = document.querySelector('#wpcf7-f20-o1 form');
    var success = document.getElementById('contact-form-success');
    if (!form || !success) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.style.display = 'none';
      success.classList.remove('sr-only');
    });
  })();
</script>
```

- [ ] **Step 5: Verify**

```bash
grep -c '<label for="wpcf7-' index.html
grep -c "contact-form-success" index.html
```

Expected: `4` and `2`.

- [ ] **Step 6: Functional test**

Open the page in a browser, scroll to the contact form, fill in all four fields, click Send. Confirm: the form disappears, the "Thanks — we'll be in touch." message appears in its place, and no network error/console error appears from a failed ajax POST.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Add form labels/autocomplete and replace broken CF7 submit with client-side confirmation"
```

---

### Task 12: SEO — absolute OG image URLs and Product JSON-LD

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Make `og:image`/`twitter:image` absolute**

Find:

```html
<meta property="og:image" content="wp-content/uploads/2025/10/drinkstop-logo.webp" />
<meta property="og:image:secure_url" content="wp-content/uploads/2025/10/drinkstop-logo.webp" />
```

Replace with:

```html
<meta property="og:image" content="https://drinkstop.co.uk/wp-content/uploads/2025/10/drinkstop-logo.webp" />
<meta property="og:image:secure_url" content="https://drinkstop.co.uk/wp-content/uploads/2025/10/drinkstop-logo.webp" />
```

Find:

```html
<meta name="twitter:image" content="wp-content/uploads/2025/10/drinkstop-logo.webp" />
```

Replace with:

```html
<meta name="twitter:image" content="https://drinkstop.co.uk/wp-content/uploads/2025/10/drinkstop-logo.webp" />
```

(`https://drinkstop.co.uk` matches the existing `og:url`/canonical already in the page — confirmed via `grep -n "og:url\|rel=\"canonical\""` before this task.)

Note: the underlying image is 564×362 and the existing `og:image:width`/`og:image:height` meta tags already correctly declare that size — no change needed there. A proper 1200×630 social-card image is flagged in the design doc as a follow-up requiring new creative; not part of this task.

- [ ] **Step 2: Add Product JSON-LD for each drink**

Find the closing of the existing Organization/WebSite JSON-LD script (identify the exact end of the `@graph` array — it currently ends with three objects: Organization, WebSite, WebPage):

```html
<script type="application/ld+json" class="rank-math-schema">{"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":"https://drinkstop.co.uk/#organization","name":"Drink Stop","url":"https://drinkstop.co.uk","logo":{"@type":"ImageObject","@id":"https://drinkstop.co.uk/#logo","url":"wp-content/uploads/2025/10/drinkstop-logo.webp","contentUrl":"wp-content/uploads/2025/10/drinkstop-logo.webp","caption":"DRINK STOP — Frozen rum cocktails in a pouch","width":"564","height":"362"},"description":"Frozen rum cocktails in a pouch. Real rum, bold flavours, built for the party."},{"@type":"WebSite","@id":"https://drinkstop.co.uk/#website","url":"https://drinkstop.co.uk/","name":"DRINK STOP","publisher":{"@id":"https://drinkstop.co.uk/#organization"}},{"@type":"WebPage","@id":"https://drinkstop.co.uk/#webpage","url":"https://drinkstop.co.uk/","name":"DRINK STOP","about":{"@id":"https://drinkstop.co.uk/#organization"},"isPartOf":{"@id":"https://drinkstop.co.uk/#website"}}]}</script>
```

This existing script stays as-is (don't restructure it — risk of a JSON syntax error outweighs the benefit of merging). Add a **new, separate** script directly after it with the six Product entries, using the product names/images already confirmed on the page (`Rum For Your Life` / mangofunk, `Suck Your Rum` / greengroov, `Rumbaclart 2.0` / tropisamba, `Rumbaclart 1.0`, `Summer Set`, `Blutiful`, `Rumazing` — matching the `alt` text already on each product card's `<img class="product-image">`):

```html
<script type="application/ld+json">
{"@context":"https://schema.org","@graph":[
{"@type":"Product","name":"DRINK STOP Rum For Your Life","image":"https://drinkstop.co.uk/wp-content/uploads/2026/07/responsive/mobile-mangofunk.webp","description":"Frozen rum cocktail pouch — Rum For Your Life flavour.","brand":{"@type":"Brand","name":"DRINK STOP"}},
{"@type":"Product","name":"DRINK STOP Suck Your Rum","image":"https://drinkstop.co.uk/wp-content/uploads/2026/07/responsive/mobile-greengroov.webp","description":"Frozen rum cocktail pouch — Suck Your Rum flavour.","brand":{"@type":"Brand","name":"DRINK STOP"}},
{"@type":"Product","name":"DRINK STOP Rumbaclart 2.0","image":"https://drinkstop.co.uk/wp-content/uploads/2026/07/responsive/mobile-tropisamba.webp","description":"Frozen rum cocktail pouch — Rumbaclart 2.0 flavour.","brand":{"@type":"Brand","name":"DRINK STOP"}},
{"@type":"Product","name":"DRINK STOP Rumbaclart 1.0","image":"https://drinkstop.co.uk/wp-content/uploads/2026/07/responsive/mobile-rumbaclart1.webp","description":"Frozen rum cocktail pouch — Rumbaclart 1.0 flavour.","brand":{"@type":"Brand","name":"DRINK STOP"}},
{"@type":"Product","name":"DRINK STOP Summer Set","image":"https://drinkstop.co.uk/wp-content/uploads/2026/07/responsive/mobile-summerset.webp","description":"Frozen rum cocktail pouch — Summer Set flavour.","brand":{"@type":"Brand","name":"DRINK STOP"}},
{"@type":"Product","name":"DRINK STOP Blutiful","image":"https://drinkstop.co.uk/wp-content/uploads/2026/07/responsive/mobile-blutiful.webp","description":"Frozen rum cocktail pouch — Blutiful flavour.","brand":{"@type":"Brand","name":"DRINK STOP"}},
{"@type":"Product","name":"DRINK STOP Rumazing","image":"https://drinkstop.co.uk/wp-content/uploads/2026/07/responsive/mobile-rumazing.webp","description":"Frozen rum cocktail pouch — Rumazing flavour.","brand":{"@type":"Brand","name":"DRINK STOP"}}
]}
</script>
```

- [ ] **Step 3: Verify JSON validity**

```bash
python3 -c "
import re, json
html = open('index.html').read()
for m in re.findall(r'<script type=\"application/ld\+json\"[^>]*>(.*?)</script>', html, re.S):
    json.loads(m)
print('all JSON-LD blocks valid')
"
```

Expected: `all JSON-LD blocks valid`

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Make OG/Twitter image URLs absolute, add Product JSON-LD for each drink"
```

---

### Task 13: Add robots.txt and sitemap.xml

**Files:**
- Create: `robots.txt`
- Create: `sitemap.xml`

- [ ] **Step 1: Create `robots.txt`**

```
User-agent: *
Allow: /

Sitemap: https://drinkstop.co.uk/sitemap.xml
```

- [ ] **Step 2: Create `sitemap.xml`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://drinkstop.co.uk/</loc></url>
  <url><loc>https://drinkstop.co.uk/order.html</loc></url>
  <url><loc>https://drinkstop.co.uk/onde-encontrar.html</loc></url>
  <url><loc>https://drinkstop.co.uk/boy-better-know/</loc></url>
  <url><loc>https://drinkstop.co.uk/product/greengroov/</loc></url>
  <url><loc>https://drinkstop.co.uk/product/summerset/</loc></url>
  <url><loc>https://drinkstop.co.uk/product/rumazing/</loc></url>
  <url><loc>https://drinkstop.co.uk/product/blutiful/</loc></url>
  <url><loc>https://drinkstop.co.uk/product/tropisamba/</loc></url>
  <url><loc>https://drinkstop.co.uk/product/mangofunk/</loc></url>
  <url><loc>https://drinkstop.co.uk/product/rumbaclart1/</loc></url>
</urlset>
```

- [ ] **Step 3: Verify both files are valid**

```bash
python3 -c "import xml.dom.minidom as m; m.parse('sitemap.xml'); print('sitemap valid')"
cat robots.txt
```

Expected: `sitemap valid`, followed by the robots.txt content printed back.

- [ ] **Step 4: Commit**

```bash
git add robots.txt sitemap.xml
git commit -m "Add robots.txt and sitemap.xml"
```

---

### Task 14: Mobile tap-target spot-check

**Files:**
- Modify: `index.html` (only if a gap is found)

- [ ] **Step 1: Measure the interactive elements most likely to be small on mobile**

Open the page in a browser at a 375px-wide viewport (iPhone SE-ish) using devtools, and for each of: header nav links, the "Order Now" CTA, the hamburger/offcanvas toggle, and the contact form's submit button — use devtools to check the rendered box size.

- [ ] **Step 2: For any element measuring under 44×44px, increase padding**

There's no way to know in advance which (if any) fall short without measuring live in a real browser against the actual computed CSS (which lives in `wp-content/themes/pley-by-ney/dist/bundle.css`, a large generated file). If a gap is found, add a small targeted override in the same `wp-custom-css` block used in Tasks 9 and 11, scoped to the specific class found wanting, e.g.:

```css
.offcanvas-toggle {
    min-width: 44px;
    min-height: 44px;
}
```

(Substitute the real class name and needed values found during measurement — don't guess at classes that weren't actually measured.)

- [ ] **Step 3: Commit (only if Step 2 made a change)**

```bash
git add -A
git commit -m "Increase tap target size for <element> to meet 44px minimum"
```

---

### Task 15: Final full-page verification

**Files:** none (verification only)

- [ ] **Step 1: Confirm no dead references remain**

```bash
cd /Users/paulbridges/Desktop/drinkss/pley-clone
grep -ci "translatepress\|jquery\|sbi_styles\|sbiajaxurl" index.html
```

Expected: `0`

- [ ] **Step 2: Confirm structural fixes hold**

```bash
grep -c "<h1" index.html
grep -c "user-scalable\|maximum-scale" index.html
grep -c "<img" index.html; grep -c 'width="' index.html
```

Expected: `1`, `0`, and the two `<img>`/`width` counts equal.

- [ ] **Step 3: Full visual walkthrough**

Load `index.html` in a browser and click/scroll through the whole page top to bottom: hero, about section (video), products, santos partnership (video), sustainability, contact form (submit it), footer. Confirm nothing looks broken, no console errors, and both lazy-loaded videos still play on scroll (unaffected by this pass, but confirms the `defer` change in Task 6 didn't break GSAP/ScrollTrigger ordering).

- [ ] **Step 4: Push**

```bash
git push
```

(Per the user's standing preference: prefer `git push` and let Vercel's CI rebuild/deploy rather than building locally first.)
