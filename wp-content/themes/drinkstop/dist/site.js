/**
 * DRINK STOP — site animation layer.
 *
 * First-party rewrite of the theme's animation module. The previous version was
 * inherited from an earlier multilingual build of the site, with a different
 * form backend, a different locale's phone-number format, and a sports
 * sponsorship section this brand has no part in. Ported over what still
 * applies to this single-locale UK site and dropped what doesn't — see the
 * section notes below.
 *
 * Load order matches the vendor <script> tags in index.html: gsap, its plugins,
 * Fancybox, Tabby, Plyr, Swiper, IMask, then this file as a module.
 */

gsap.registerPlugin(ScrollSmoother, ScrollTrigger, ScrollToPlugin);
// TextPlugin and SplitText were both registered by the old bundle. TextPlugin was
// never used anywhere; SplitText only drove the intro splash, which nothing on
// this site's pages triggers (see the note at the bottom of this file) — so
// neither is registered or loaded here.

let smoother;

function initSmoothScroll() {
  smoother = ScrollSmoother.create({
    smooth: 1,
    effects: true,
    normalizeScroll: { nestedScroll: true },
  });

  // Same-page anchor links scroll smoothly instead of jumping.
  document.querySelectorAll('a[href*="#"]:not([href="#"])').forEach((a) => {
    a.addEventListener('click', (e) => {
      if (a.origin !== window.location.origin) return;
      const hash = a.hash;
      if (!hash) return;
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      smoother.scrollTo(target, true);
    });
  });

  window.addEventListener('resize', () => ScrollTrigger.refresh());

  ScrollTrigger.create({
    trigger: '.footer',
    pin: true,
    start: 'bottom bottom',
    end: '+=100%',
  });

  // The old bundle also carried a multilingual-CMS locale-root URL scheme here
  // (/en/, /es/, root = a third locale) for a sessionStorage scroll-restore-
  // after-navigation flow. This site has one locale and no cross-page anchor
  // jumps that need it, so it's gone.
}

function initStopMotion() {
  const els = gsap.utils.toArray('.stop-motion');
  if (!els.length) return;

  const PROFILES = {
    jitter: { rotation: 6, move: 2, skew: 1 },
    sway: { rotation: 12, move: 5, skew: 3 },
    float: { rotation: 4, move: 8, skew: 1 },
    shake: { rotation: 15, move: 6, skew: 2 },
  };

  function buildFrames(profile, count) {
    const frames = [];
    for (let i = 0; i < count; i++) {
      frames.push({
        rotation: gsap.utils.random(-profile.rotation, profile.rotation, 0.1),
        x: gsap.utils.random(-profile.move, profile.move, 0.1),
        y: gsap.utils.random(-profile.move, profile.move, 0.1),
        skewX: gsap.utils.random(-profile.skew, profile.skew, 0.1),
        skewY: gsap.utils.random(-profile.skew, profile.skew, 0.1),
      });
    }
    return frames;
  }

  els.forEach((el) => {
    const mode =
      el.dataset.motion ||
      (el.classList.contains('stop-jitter') && 'jitter') ||
      (el.classList.contains('stop-sway') && 'sway') ||
      (el.classList.contains('stop-float') && 'float') ||
      (el.classList.contains('stop-shake') && 'shake') ||
      'jitter';
    const profile = PROFILES[mode];
    el.dataset.motion = mode;
    el.dataset.frameIndex = 0;
    el._frames = buildFrames(profile, gsap.utils.random(5, 8, 1));
    el._frameDelay = gsap.utils.random(2, 5, 1);
    el._frameCounter = 0;
  });

  const FRAME_MS = 1000 / 24;
  let last = 0;
  function tick(now) {
    if (now - last >= FRAME_MS) {
      last = now;
      els.forEach((el) => {
        el._frameCounter++;
        if (el._frameCounter >= el._frameDelay) {
          const frames = el._frames;
          const i = parseInt(el.dataset.frameIndex, 10);
          gsap.set(el, frames[i]);
          el.dataset.frameIndex = (i + 1) % frames.length;
          el._frameCounter = 0;
          if (Math.random() < 0.3) el._frameDelay = gsap.utils.random(2, 5, 1);
        }
      });
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function initHeaderState() {
  const body = document.body;
  let lastY = window.scrollY;
  let ticking = false;

  function update() {
    const y = window.scrollY;
    body.classList.toggle('has-scrolled', y > 40);
    if (y > lastY && y > 40) body.classList.add('has-sticky-header');
    else if (y < lastY) body.classList.remove('has-sticky-header');
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  });

  // The old bundle also rewrote `.languages-menu__link` hrefs for a 3-locale
  // language switcher here. There's no language switcher on this site —
  // dropped along with the markup.
}

function initOffcanvas() {
  const toggle = document.querySelector('.offcanvas-toggle');
  const body = document.body;
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const open = body.classList.toggle('has-offcanvas');
    if (smoother) smoother.paused(open);
  });

  document.querySelectorAll('.offcanvas-menu__item--has-submenu > a').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      a.closest('.offcanvas-menu__item').classList.toggle('offcanvas-menu__item--open');
    });
  });

  document
    .querySelectorAll('.offcanvas-menu__item:not(.offcanvas-menu__item--has-submenu) a')
    .forEach((a) => {
      a.addEventListener('click', () => {
        body.classList.remove('has-offcanvas');
        if (smoother) smoother.paused(false);
      });
    });

  // The old bundle force-navigated to "/" on every non-submenu offcanvas link
  // click when not already on the homepage — a leftover from a single-page,
  // anchor-only structure. This site has real multi-page navigation
  // (choose-your-vibe.html, order.html, product pages), so that redirect would
  // break normal link clicks. Dropped.
  //
  // It also wired `.offcanvas-products-category-link` clicks to a global
  // `handleTabClick`, which isn't defined anywhere in this codebase — those
  // links are plain anchor jumps to product sections and need no JS at all.
}

function initFancybox() {
  Fancybox.bind('[data-modal], [data-product-modal]', {
    dragToClose: false,
    Carousel: {
      Toolbar: false,
    },
    on: {
      ready: () => smoother && smoother.paused(true),
      close: () => smoother && smoother.paused(false),
    },
  });
  // The old bundle also wired a Tabby-tabs + image-swap handler here for a
  // `[data-tabs]`/`#modal-tab-img` layout inside the product modal. No product
  // fragment on this site uses either — each is a single nutrition table with
  // no size-tab switcher — so there's nothing for it to attach to. Tabby is
  // still loaded (index.html) in case a future product redesign wants it.
}

function initMarquee() {
  document.querySelectorAll('.marquee[data-text]').forEach((m) => {
    const text = m.dataset.text;
    m.innerHTML = '';
    for (let g = 0; g < 2; g++) {
      const group = document.createElement('div');
      group.className = 'marquee__group';
      for (let i = 0; i < 6; i++) {
        const item = document.createElement('div');
        item.className = 'marquee__item';
        const h4 = document.createElement('h4');
        h4.className = 'marquee__item--text';
        h4.textContent = text;
        item.appendChild(h4);
        group.appendChild(item);
      }
      m.appendChild(group);
    }
  });
  // Building the initial .marquee__group/.marquee__item structure is all this
  // does now — the Safari-safe resizing and GSAP x-tween that actually animate
  // it live in the "drinkstop-marquee" inline script in index.html, which
  // rebuilds each strip to the viewport width instead of relying on one huge
  // composited CSS animation (that blows past WebKit's texture size limit on
  // Retina and paints blank). Keeping both in one place would just be the same
  // fix written twice.
}

function initFullImageReveal() {
  const img = document.querySelector('.full-image img');
  if (!img) return;
  gsap.timeline({
    scrollTrigger: {
      trigger: '.full-image',
      start: 'top bottom',
      end: 'top-=25% top',
      scrub: true,
    },
  }).fromTo(
    img,
    { clipPath: 'inset(5% round 30px)' },
    { clipPath: 'inset(0 round 0px)', ease: 'none' }
  );
}

function initLifestyleDesktop() {
  gsap.matchMedia().add('(min-width: 1024px)', () => {
    const section = document.querySelector('.lifestyle');
    const cards = gsap.utils.toArray('.lifestyle__card');
    if (!section || !cards.length) return;
    const flying = cards.slice().reverse().slice(0, -1);
    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, pin: true, scrub: true, end: '+=3000' },
    });
    flying.forEach((card, i) => {
      tl.to(
        card,
        { y: '-100vh', rotation: `+=${gsap.utils.random(-20, 20)}`, ease: 'power3.inOut', duration: 1.6 },
        i * 0.5
      );
    });
  });
  // The mobile equivalent already lives in the "drinkstop-lifestyle-mobile"
  // inline script in index.html (added when the theme's desktop-only animation
  // needed a small-screen counterpart) — not duplicated here.
}

function initCustomPouchReveal() {
  const bg = document.querySelector('.custom-pouch__bg');
  if (!bg) return;
  gsap.timeline({
    scrollTrigger: {
      trigger: '.custom-pouch',
      start: 'top bottom',
      end: 'top top',
      scrub: true,
    },
  }).fromTo(
    bg,
    { clipPath: 'inset(0 5% round 30px 30px 0 0)' },
    { clipPath: 'inset(0 0% round 0px)', ease: 'none' }
  );
  // The old bundle also played `.packaging-video` here on ScrollTrigger onEnter.
  // That element is now a static <img class="packaging-video"> (the pouch
  // section no longer uses a video in this design) — nothing to autoplay.
  //
  // It separately played the collab section's video the same way, under its
  // old selector. That video already carries `class="lazy-autoplay-video"` and
  // is autoplayed by the IntersectionObserver in index.html the moment it
  // scrolls into view, with proper lazy `data-src` loading — a strictly better
  // mechanism than a second ScrollTrigger doing the
  // same job, so it isn't ported here.
}

function initProductMarquee() {
  gsap.matchMedia().add('(min-width: 1024px)', () => {
    document.querySelectorAll('.products-marquee').forEach((marquee, gi) => {
      const cards = [];
      let node = marquee.nextElementSibling;
      // Cards live in the sibling .container that follows the marquee banner;
      // walk it (and any further siblings, in case more than one marquee/group
      // is ever added to this section) collecting .product-card elements in
      // document order.
      while (node && !node.classList.contains('products-marquee')) {
        node.querySelectorAll?.('.product-card').forEach((c) => cards.push(c));
        node = node.nextElementSibling;
      }
      if (!cards.length) return;

      ScrollTrigger.create({
        id: `marquee-${gi}`,
        trigger: marquee,
        start: 'top top',
        end: () => `+=${cards.length * window.innerHeight}`,
        pin: marquee,
        scrub: true,
      });

      const master = gsap.timeline({
        scrollTrigger: {
          id: `master-timeline-${gi}`,
          trigger: cards[0],
          start: 'top top',
          end: () => `+=${cards.length * window.innerHeight}`,
          pin: cards[0],
          scrub: true,
        },
      });

      cards.forEach((card, i) => {
        const content = card.querySelector('.product-content');
        const tl = gsap.timeline();
        tl.fromTo(
          card,
          { clipPath: 'inset(8% round 40px)', scale: 0.94 },
          { clipPath: 'inset(0% round 0px)', scale: 1, ease: 'none' }
        );
        if (content) tl.fromTo(content, { opacity: 0 }, { opacity: 1, ease: 'none' }, '<');
        if (i < cards.length - 1) {
          tl.to(card, { scale: 0.96, rotationX: 4, ease: 'none' });
        }

        if (i === 0) {
          master.add(tl);
        } else {
          ScrollTrigger.create({
            id: `card-${gi}-${i + 1}`,
            trigger: card,
            start: 'top top',
            end: () => `+=${window.innerHeight}`,
            pin: card,
            scrub: true,
            animation: tl,
          });
        }
      });
    });
  });
}

function initContactForm() {
  if (window.Swiper) {
    new Swiper('.contact-slider', {
      effect: 'cards',
      loop: true,
      grabCursor: true,
      cardsEffect: { slideShadows: false },
      autoplay: { delay: 5000 },
    });
  }

  const phone = document.querySelector('input[name="phone"]');
  if (phone && window.IMask) {
    IMask(phone, {
      mask: [{ mask: '00000 000000' }, { mask: '0000 000 0000' }],
    });
  }
  // The old bundle masked the phone field against a different locale's format
  // ((00) 0000-0000 / (00) 00000-0000) and, on a plugin-specific submit-failure
  // event, injected a hardcoded error string in that locale's language. Both
  // the field and the validation now target the renamed UK "phone" field with
  // UK-shaped masks; the old plugin-specific submit-event hook is gone along
  // with the plugin.
}

initSmoothScroll();
initStopMotion();
initHeaderState();
initOffcanvas();
initFancybox();
initMarquee();

// The rest are effectively page-detail behaviours: they no-op safely via their
// own guards (missing element / matchMedia) on pages that don't have the
// matching section, so they're safe to call unconditionally on every page that
// loads this module.
initFullImageReveal();
initLifestyleDesktop();
initCustomPouchReveal();
initProductMarquee();
initContactForm();

// Dropped entirely, not ported:
//
// - The Instagram feed marquee (#sbi_images): Smash Balloon, the plugin behind
//   it, was removed in the asset-purge phase, and the code carried /en//es/
//   path gating plus hardcoded Portuguese alt text ("Post do Instagram").
// - The one-time "site intro" splash (SplitText title stagger, shuffled card
//   scale-in, expanding wipe overlay): there is no `.site-intro` element
//   anywhere in this site's markup — it was replaced by the simpler
//   "drinkstop-hero-rotate" pouch carousel in index.html. The old code
//   silently no-op'd on every page load for the same reason; porting it would
//   add a SplitText dependency for an animation nothing on the page triggers.
