/* ==========================================================================
   Drink Stop — Brand Page
   JavaScript — Scroll Animations
   ========================================================================== */

(() => {
  "use strict";

  /* ================================================================
     Viewport-filling Logo Marquees

     Each track needs two identical sequences for the translateX(-50%)
     animation. Repeat the supplied logos within each sequence until one
     sequence is wider than its row, then clone it for a seamless loop.
     ================================================================ */

  const marqueeTracks = document.querySelectorAll('.marquee-row__track');
  const marqueeTemplates = new Map(
    Array.from(marqueeTracks, (track) => [
      track,
      Array.from(track.children)
        .filter((card) => card.getAttribute('aria-hidden') !== 'true')
        .map((card) => card.cloneNode(true)),
    ]),
  );

  function fillMarqueeTrack(track) {
    const templates = marqueeTemplates.get(track);
    const row = track.closest('.marquee-row');
    if (!row || !templates?.length) return;

    const sequence = document.createElement('div');
    sequence.className = 'marquee-sequence';
    track.replaceChildren(sequence);

    do {
      templates.forEach((template) => sequence.append(template.cloneNode(true)));
    } while (sequence.scrollWidth < row.clientWidth);

    const duplicate = sequence.cloneNode(true);
    duplicate.setAttribute('aria-hidden', 'true');
    duplicate.querySelectorAll('img').forEach((image) => { image.alt = ''; });
    track.append(duplicate);
  }

  function fillMarquees() {
    marqueeTracks.forEach(fillMarqueeTrack);
  }

  fillMarquees();

  let resizeFrame;
  window.addEventListener('resize', () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(fillMarquees);
  });

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
