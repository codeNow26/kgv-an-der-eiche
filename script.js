const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#main-navigation");
const mobileViewport = window.matchMedia("(max-width: 1000px)");

/**
 * Updates visibility and the accessible state of the mobile navigation.
 * @param {boolean} isOpen - Whether the mobile menu should be open.
 */
function setMenuOpen(isOpen) {
  navigation.hidden = !isOpen;
  menuButton.setAttribute("aria-expanded", String(isOpen));
}

/** Adapts the navigation when switching between desktop and mobile. */
function updateNavigationLayout() {
  menuButton.hidden = !mobileViewport.matches;
  setMenuOpen(!mobileViewport.matches);
}

/** Opens or closes the mobile navigation. */
function toggleNavigation() {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  setMenuOpen(!isOpen);
}

/**
 * Closes the mobile menu after selecting a navigation link.
 * @param {MouseEvent} event - Click inside the navigation.
 */
function handleNavigationClick(event) {
  if (mobileViewport.matches && event.target.closest("a")) {
    setMenuOpen(false);
  }
}

/**
 * Closes the mobile menu with Escape and restores button focus.
 * @param {KeyboardEvent} event - Keyboard interaction.
 */
function handleNavigationKeydown(event) {
  if (event.key === "Escape" && mobileViewport.matches && !navigation.hidden) {
    setMenuOpen(false);
    menuButton.focus();
  }
}

menuButton.addEventListener("click", toggleNavigation);
navigation.addEventListener("click", handleNavigationClick);
document.addEventListener("keydown", handleNavigationKeydown);
mobileViewport.addEventListener("change", updateNavigationLayout);

updateNavigationLayout();