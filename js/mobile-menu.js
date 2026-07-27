/* ==========================================================================
   Drink Stop — Premium Mobile Navigation ("ds-menu")
   Controller: open/close state machine, submenu panel, focus trap, ESC,
   swipe-to-close, scroll lock. Markup lives inline in each page; styling in
   css/mobile-menu.css. One instance per page.
   ========================================================================== */

(() => {
  "use strict";

  const root = document.querySelector(".ds-menu");
  if (!root) return;

  const panel = root.querySelector(".ds-menu__panel");
  const triggers = document.querySelectorAll(".mobile-menu-button, .offcanvas-toggle");
  const closers = root.querySelectorAll("[data-ds-close]");
  const scrim = root.querySelector(".ds-menu__scrim");
  const submenuOpeners = root.querySelectorAll("[data-ds-open-submenu]");
  const backButtons = root.querySelectorAll("[data-ds-back]");
  const drinkList = root.querySelector("[data-ds-drink-list]");
  const navLinks = root.querySelectorAll(".ds-menu__link[data-key]");

  const usesOffcanvasClass = document.querySelector(".offcanvas-toggle") !== null;

  /* ── Drink data (mirrors js/our-drinks-data.js) ─────────────────────── */

  const DRINKS = [
    { slug: "rum-for-your-life", name: "Rum For Your Life", flavour: "Fruit Punch + Watermelon" },
    { slug: "rumbaclart-2", name: "Rumbaclart 2.0", flavour: "Pineapple + Apple + Guava" },
    { slug: "rumbaclart-1", name: "Rumbaclart 1.0", flavour: "Mango + Passionfruit + Orange" },
    { slug: "summer-set", name: "Summer Set", flavour: "Pineapple + Coconut" },
    { slug: "blutiful", name: "Blutiful", flavour: "Raspberry + Apple + Lemon" },
    { slug: "rumazing", name: "Rumazing", flavour: "Apple + Mango" },
    { slug: "suck-your-rum", name: "Suck Your Rum", flavour: "Apple + Lemon + Ginger" },
  ];

  function buildDrinkList() {
    if (!drinkList) return;
    drinkList.innerHTML = DRINKS.map((drink, i) => `
      <a
        class="ds-menu__drink-row"
        href="index.html#${drink.slug}"
        style="--row-delay:${i * 45}ms"
      >
        <span class="ds-menu__drink-thumb" style="background-image:url('assets/drinks/${drink.slug}/hero.webp')"></span>
        <span class="ds-menu__drink-copy">
          <span class="ds-menu__drink-name">${drink.name}</span>
          <span class="ds-menu__drink-flavour">${drink.flavour}</span>
        </span>
        <svg class="ds-menu__drink-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 8h10M8.5 3.5 13 8l-4.5 4.5" stroke="#111" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </a>
    `).join("") + `
      <a class="ds-menu__view-all" href="our-drinks.html" style="--row-delay:${DRINKS.length * 45}ms">
        <span>View All</span>
        <svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M8 32h45M39 17l15 15-15 15" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
    `;
  }

  /* ── Active nav item ─────────────────────────────────────────────────── */

  function markActiveLink() {
    const current = root.dataset.current;
    if (!current) return;
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.key === current);
    });
  }

  /* ── Focus trap ──────────────────────────────────────────────────────── */

  let lastFocused = null;

  function getFocusable(container) {
    return Array.from(
      container.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => el.offsetParent !== null);
  }

  function trapFocus(event) {
    if (event.key !== "Tab") return;
    const activeView = panel.classList.contains("is-submenu-open")
      ? root.querySelector(".ds-menu__view--submenu")
      : root.querySelector(".ds-menu__view--main");
    const focusable = getFocusable(activeView);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* ── Open / close ────────────────────────────────────────────────────── */

  function setTriggersExpanded(expanded) {
    triggers.forEach((btn) => btn.setAttribute("aria-expanded", String(expanded)));
  }

  function openMenu() {
    lastFocused = document.activeElement;
    markActiveLink();
    root.classList.add("is-open");
    root.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-menu-open");
    if (usesOffcanvasClass) {
      document.body.classList.add("has-offcanvas");
      if (window.dsSmoother) window.dsSmoother.paused(true);
    }
    setTriggersExpanded(true);
    document.addEventListener("keydown", onKeydown);
    const closeBtn = root.querySelector(".ds-menu__view--main .ds-menu__close");
    window.setTimeout(() => closeBtn && closeBtn.focus(), 360);
  }

  function closeMenu() {
    root.classList.remove("is-open");
    root.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-menu-open");
    if (usesOffcanvasClass) {
      document.body.classList.remove("has-offcanvas");
      if (window.dsSmoother) window.dsSmoother.paused(false);
    }
    setTriggersExpanded(false);
    document.removeEventListener("keydown", onKeydown);
    window.setTimeout(() => {
      panel.classList.remove("is-submenu-open");
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    }, 350);
  }

  function openSubmenu() {
    panel.classList.add("is-submenu-open");
    const backBtn = root.querySelector(".ds-menu__back");
    window.setTimeout(() => backBtn && backBtn.focus(), 360);
  }

  function closeSubmenu() {
    panel.classList.remove("is-submenu-open");
    const opener = root.querySelector('[data-ds-open-submenu="drinks"]');
    window.setTimeout(() => opener && opener.focus(), 360);
  }

  function onKeydown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      if (panel.classList.contains("is-submenu-open")) {
        closeSubmenu();
      } else {
        closeMenu();
      }
      return;
    }
    trapFocus(event);
  }

  /* ── Swipe right to close ────────────────────────────────────────────── */

  let touchStartX = 0;
  let touchStartY = 0;

  panel.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    },
    { passive: true }
  );

  panel.addEventListener(
    "touchend",
    (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (dx > 70 && Math.abs(dy) < 60) {
        if (panel.classList.contains("is-submenu-open")) {
          closeSubmenu();
        } else {
          closeMenu();
        }
      }
    },
    { passive: true }
  );

  /* ── Wire up ─────────────────────────────────────────────────────────── */

  triggers.forEach((btn) => {
    btn.setAttribute("aria-controls", "ds-menu");
    btn.addEventListener("click", () => {
      if (root.classList.contains("is-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  });

  closers.forEach((btn) => btn.addEventListener("click", closeMenu));
  if (scrim) scrim.addEventListener("click", closeMenu);

  submenuOpeners.forEach((btn) => btn.addEventListener("click", openSubmenu));
  backButtons.forEach((btn) => btn.addEventListener("click", closeSubmenu));

  root.querySelectorAll(".ds-menu__link[href]").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  if (drinkList) {
    drinkList.addEventListener("click", (event) => {
      if (event.target.closest(".ds-menu__drink-row, .ds-menu__view-all")) closeMenu();
    });
  }

  buildDrinkList();
  markActiveLink();
})();
