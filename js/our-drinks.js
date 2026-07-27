/* ==========================================================================
   Drink Stop — Our Drinks
   Page JavaScript — Hero Stage, Card Grid & Reveal Animations
   ========================================================================== */

(() => {
  "use strict";

  if (typeof drinks === "undefined") return;

  const sortedDrinks = [...drinks].sort((a, b) => a.sortOrder - b.sortOrder);

  /* ================================================================
     MODULE 1 — Hero Product Stage
     Renders the drinks flagged featuredInHero (max 3: left/centre/right).
     ================================================================ */

  const heroStage = document.getElementById("hero-product-stage");

  if (heroStage) {
    const heroDrinks = sortedDrinks
      .filter((drink) => drink.featuredInHero)
      .slice(0, 3);

    const positions = ["left", "centre", "right"];

    const fragment = document.createDocumentFragment();

    heroDrinks.forEach((drink, index) => {
      const position = positions[index] || "right";

      const wrap = document.createElement("div");
      wrap.className = `hero-product hero-product--${position}`;
      wrap.dataset.drinkId = drink.id;

      wrap.innerHTML = `
        <img
          class="hero-product-image"
          src="${drink.productImage}"
          alt="${drink.productAltText}"
          loading="eager"
          decoding="async"
        >
      `;

      fragment.append(wrap);
    });

    heroStage.replaceChildren(fragment);

    // Dim the other drinks when one is hovered/focused (no :has() dependency,
    // works the same in every supported browser and is easy to reason about).
    const heroProducts = heroStage.querySelectorAll(".hero-product");

    heroProducts.forEach((product) => {
      const onEnter = () => heroStage.classList.add("has-active-product");
      const onLeave = () => heroStage.classList.remove("has-active-product");

      product.addEventListener("mouseenter", () => {
        onEnter();
        product.classList.add("is-active-product");
      });

      product.addEventListener("mouseleave", () => {
        onLeave();
        product.classList.remove("is-active-product");
      });

      product.addEventListener("focusin", () => {
        onEnter();
        product.classList.add("is-active-product");
      });

      product.addEventListener("focusout", () => {
        onLeave();
        product.classList.remove("is-active-product");
      });
    });
  }

  /* ================================================================
     MODULE 2 — Drink Card Grid
     Renders every drink (in sortOrder) into the "Choose Your Flavour"
     grid. Unavailable drinks keep their card but swap the CTA for a
     disabled "Currently unavailable" state instead of disappearing.
     ================================================================ */

  const drinksGrid = document.getElementById("drinks-card-grid");

  function createDrinkCard(drink) {
    const article = document.createElement("article");
    article.className = "drink-card";
    article.dataset.drinkId = drink.id;

    article.style.setProperty("--drink-accent", drink.accentColour);
    article.style.setProperty("--drink-border", drink.cardBorderColour);

    const isAvailable = drink.availability === "available";

    const cta = isAvailable
      ? `<a class="drink-details-button" href="${drink.detailsUrl}" aria-label="Order ${drink.name}">
          <span>View Details</span>
          <img src="assets/party/icons/arrow-right.svg" alt="" aria-hidden="true">
        </a>`
      : `<span class="drink-details-button is-unavailable" aria-disabled="true">
          <span>Currently Unavailable</span>
        </span>`;

    article.innerHTML = `
      <div class="drink-card-art">
        <img
          class="drink-card-product"
          src="${drink.productImage}"
          alt="${drink.productAltText}"
          loading="lazy"
          decoding="async"
        >
      </div>

      <div class="drink-card-content">
        <h3 class="drink-card-title">${drink.shortName}</h3>

        <p class="drink-card-flavour">${drink.flavourName}</p>

        <p class="drink-card-description">${drink.description}</p>

        <p class="drink-card-alcohol">${drink.alcoholPercentage} &middot; ${drink.size}</p>

        ${cta}
      </div>
    `;

    return article;
  }

  function renderDrinks() {
    if (!drinksGrid) return;

    const fragment = document.createDocumentFragment();

    sortedDrinks.forEach((drink) => {
      fragment.append(createDrinkCard(drink));
    });

    drinksGrid.replaceChildren(fragment);
  }

  renderDrinks();

  /* ================================================================
     MODULE 3 — Entrance Reveal (Intersection Observer)
     ================================================================ */

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Cards are rendered after this script runs, so query for .reveal
  // targets (including freshly-created cards) right before observing.
  const revealItems = document.querySelectorAll(
    ".reveal, .drink-card, .benefit-item"
  );

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.14 }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }
})();
