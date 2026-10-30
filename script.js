(() => {
  "use strict";

  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#main-navigation");
  const mobileViewport = window.matchMedia("(max-width: 1000px)");

  if (!menuButton || !navigation) return;

  function setMenuOpen(isOpen) {
    navigation.hidden = !isOpen;
    menuButton.setAttribute("aria-expanded", String(isOpen));
  }

  function updateNavigationLayout() {
    menuButton.hidden = !mobileViewport.matches;
    setMenuOpen(!mobileViewport.matches);
  }

  function toggleNavigation() {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isOpen);
  }

  function handleNavigationClick(event) {
    if (!(event.target instanceof Element)) return;

    if (mobileViewport.matches && event.target.closest("a")) {
      setMenuOpen(false);
    }
  }

  function handleNavigationKeydown(event) {
    if (
      event.key !== "Escape" ||
      !mobileViewport.matches ||
      navigation.hidden
    ) {
      return;
    }

    setMenuOpen(false);
    menuButton.focus();
  }

  menuButton.addEventListener("click", toggleNavigation);
  navigation.addEventListener("click", handleNavigationClick);
  document.addEventListener("keydown", handleNavigationKeydown);
  mobileViewport.addEventListener("change", updateNavigationLayout);

  updateNavigationLayout();
})();