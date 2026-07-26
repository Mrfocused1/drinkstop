/* ==========================================================================
   Drink Stop — Brand Page
   JavaScript — Mobile Menu & Scroll Animations
   ========================================================================== */

(() => {
  "use strict";

  /* ================================================================
     MODULE 1 — Mobile Menu Toggle
     ================================================================ */

  const menuButton = document.querySelector(".mobile-menu-button");
  const mobileNavigation = document.querySelector(".mobile-navigation");

  if (menuButton && mobileNavigation) {

    /** Close the mobile navigation panel. */
    function closeMenu() {
      menuButton.setAttribute("aria-expanded", "false");
      mobileNavigation.classList.remove("is-open");
      document.body.classList.remove("menu-open");
    }

    /** Open the mobile navigation panel. */
    function openMenu() {
      menuButton.setAttribute("aria-expanded", "true");
      mobileNavigation.classList.add("is-open");
      document.body.classList.add("menu-open");
    }

    /**
     * Toggle menu state on button click.
     * Reads the current aria-expanded attribute to decide.
     */
    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close menu when any navigation link is clicked
    mobileNavigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    // Close menu on Escape key
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

  } // end menu guard


  /* ================================================================
     MODULE 2 — Staggered Logo Card Entrance Animation
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
