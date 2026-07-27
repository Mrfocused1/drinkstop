/* ==========================================================================
   Drink Stop — Brand Page
   JavaScript — Scroll Animations
   ========================================================================== */

(() => {
  "use strict";

  /* ================================================================
     Staggered Logo Card Entrance Animation
     (Mobile menu behaviour now lives in js/mobile-menu.js — the .ds-menu
     component shared across every page.)
     ================================================================ */

  const logoCards = document.querySelectorAll(".partner-card");

  if (logoCards.length > 0 && "IntersectionObserver" in window) {

    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Only act when a card enters the viewport
          if (!entry.isIntersecting) return;

          const card = entry.target;

          // Calculate staggered delay based on card position in the node list
          const index = Array.from(logoCards).indexOf(card);
          const delay = Math.min(index * 45, 450); // cap at 450ms

          card.style.transitionDelay = `${delay}ms`;

          card.classList.add("is-visible");

          // Stop observing once the card has appeared
          cardObserver.unobserve(card);
        });
      },
      {
        threshold: 0.15, // trigger when 15 % of the card is visible
      }
    );

    logoCards.forEach((card) => {
      cardObserver.observe(card);
    });

  } else {

    // Fallback: if IntersectionObserver is unavailable, show all cards immediately
    logoCards.forEach((card) => {
      card.classList.add("is-visible");
    });

  }

})();
