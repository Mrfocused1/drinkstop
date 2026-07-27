(() => {
  "use strict";

  const menuButton = document.querySelector(".mobile-menu-button");
  const mobileNavigation = document.querySelector(".mobile-navigation");

  if (!menuButton || !mobileNavigation) return;

  function openMenu() {
    menuButton.setAttribute("aria-expanded", "true");
    mobileNavigation.classList.add("is-open");
    document.body.classList.add("menu-open");
  }

  function closeMenu() {
    menuButton.setAttribute("aria-expanded", "false");
    mobileNavigation.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }

  menuButton.addEventListener("click", () => {
    const expanded = menuButton.getAttribute("aria-expanded") === "true";
    if (expanded) closeMenu();
    else openMenu();
  });

  mobileNavigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
})();
