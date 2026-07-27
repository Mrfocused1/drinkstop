/* ==========================================================================
   Drink Stop — shared header cart behaviour
   Badge mirrors the vibe basket in localStorage. Click → order.html when the
   basket has items, else choose-your-vibe.html. On order.html itself the
   click just bounces (we're already on the basket/checkout page — navigating
   would reset the wizard).
   choose-your-vibe.html does NOT load this: it wires its own richer behaviour.
   ========================================================================== */

(() => {
  "use strict";

  const KEY = "drinkstop_vibe_basket";

  function basketCount() {
    try {
      const raw = localStorage.getItem(KEY);
      const items = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(items)) return 0;
      return items.reduce((n, line) => n + (line.qty || 0), 0);
    } catch (_) {
      return 0;
    }
  }

  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = String(basketCount());
  });

  const onOrderPage = /\/order\.html$/.test(window.location.pathname);

  document.querySelectorAll("[data-open-basket]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (onOrderPage) {
        if (btn.animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          btn.animate(
            [{ transform: "scale(1)" }, { transform: "scale(1.2)" }, { transform: "scale(1)" }],
            { duration: 260, easing: "ease-out" }
          );
        }
        return;
      }
      window.location.href = basketCount() > 0 ? "order.html" : "choose-your-vibe.html";
    });
  });
})();
