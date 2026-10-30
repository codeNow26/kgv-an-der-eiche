(() => {
  "use strict";

  const branch = document.querySelector(".garden-hero__branch");
  const hero = document.querySelector(".garden-hero");
  const stage = document.querySelector(".garden-hero__stage");
  const gardens = document.querySelector("#gaerten");
  const main = document.querySelector("main");
  const pageHeading = document.querySelector("#garden-title");
  const contact = document.querySelector("#kontakt");

  if (!branch || !hero || !stage || !gardens || !main) return;

  const namespace = "http://www.w3.org/2000/svg";
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const sections = [
    {
      heading: document.querySelector("#verein h2"),
      href: "./verein.html",
      label: "Zum Verein",
    },
    {
      heading: document.querySelector("#updates-title"),
      href: "./aktuelles.html",
      label: "Zu den Neuigkeiten",
    },
    {
      heading: document.querySelector("#gardens-title"),
      href: "./gaerten.html",
      label: "Zu freien Gärten",
    },
  ];

  if (sections.some((section) => !section.heading)) return;

  const leafOutline = [
    "M0 0",
    "C-4 -8 -12 -9 -17 -16",
    "C-21 -22 -18 -27 -12 -28",
    "C-24 -28 -30 -33 -27 -40",
    "C-24 -46 -16 -44 -13 -47",
    "C-22 -50 -22 -58 -15 -61",
    "C-10 -64 -5 -60 0 -70",
    "C5 -60 11 -64 16 -59",
    "C23 -54 19 -48 13 -46",
    "C23 -45 29 -42 26 -35",
    "C23 -29 17 -29 12 -28",
    "C20 -23 21 -19 16 -15",
    "C11 -10 4 -8 0 0Z",
  ].join(" ");

  const leafVeins =
    "M0 -3V-61 M-1 -22L-13 -33 M1 -28L15 -39 " +
    "M0 -43L-11 -53 M1 -49L12 -56";

  let layout = null;
  let drawing = [];
  let foliage = [];
  let markers = [];
  let frame = null;
  let needsLayout = true;
  let previousLayout = "";

  const topButton = createTopButton();

  branch.removeAttribute("role");
  branch.removeAttribute("aria-label");
  branch.removeAttribute("aria-hidden");

  function svgElement(name, attributes = {}) {
    const element = document.createElementNS(namespace, name);

    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, String(value));
    });

    return element;
  }

  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function trunkX(y, width) {
    return width * (
      0.47 +
      Math.sin(y / 250) * 0.09 +
      Math.sin(y / 115 + 0.7) * 0.025
    );
  }

  function createLeaf(x, y, scale, angle, className) {
    const placement = svgElement("g", {
      transform: `translate(${x} ${y}) rotate(${angle}) scale(${scale})`,
      class: className,
    });

    const motion = svgElement("g", {
      class: "oak-branch__section-motion",
    });

    motion.append(
      svgElement("path", {
        d: leafOutline,
        fill: "currentColor",
      }),
      svgElement("path", {
        d: leafVeins,
        fill: "none",
        stroke: "#314d34",
        "stroke-width": 1.4,
        "stroke-linecap": "round",
        opacity: 0.4,
      })
    );

    placement.append(motion);
    return placement;
  }

  function createTopButton() {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "oak-branch__top";
    button.setAttribute("aria-label", "Zurück zum Seitenanfang");
    button.tabIndex = -1;

    const acorn = svgElement("svg", {
      class: "oak-branch__acorn",
      viewBox: "0 0 48 58",
      "aria-hidden": "true",
      focusable: "false",
    });

    acorn.append(
      svgElement("path", {
        d: "M24 15C23 10 24 6 28 3",
        fill: "none",
        stroke: "#726345",
        "stroke-width": 3,
        "stroke-linecap": "round",
      }),
      svgElement("path", {
        d: "M9 27C9 41 16 50 24 55C33 49 39 39 39 27Z",
        fill: "#b38a54",
      }),
      svgElement("path", {
        d: "M11 29C12 39 17 46 23 50",
        fill: "none",
        stroke: "#d0aa72",
        "stroke-width": 2,
        "stroke-linecap": "round",
      }),
      svgElement("path", {
        d: "M5 27C6 17 13 12 24 12C35 12 42 18 43 27"
          + "C31 24 17 24 5 27Z",
        fill: "#71805a",
      }),
      svgElement("path", {
        d: "M12 20Q24 15 36 21",
        fill: "none",
        stroke: "#94a174",
        "stroke-width": 2,
        "stroke-linecap": "round",
      })
    );

    const label = document.createElement("span");
    label.className = "oak-branch__top-label";
    label.textContent = "Nach oben";

    button.append(acorn, label);
    button.addEventListener("click", scrollToTop);

    return button;
  }

  function scrollToTop() {
    if (pageHeading) {
      pageHeading.setAttribute("tabindex", "-1");
      pageHeading.focus({ preventScroll: true });
    }

    window.scrollTo({
      top: 0,
      behavior: reducedMotion.matches ? "instant" : "smooth",
    });
  }

  function measureLayout() {
    const heroBox = hero.getBoundingClientRect();
    const stageBox = stage.getBoundingClientRect();
    const gardensBox = gardens.getBoundingClientRect();
    const containers = [...main.querySelectorAll(".container")];

    const contentLeft = Math.min(
      ...containers.map((element) => {
        return element.getBoundingClientRect().left;
      })
    );

    const width = Math.min(
      210,
      Math.floor(contentLeft - heroBox.left - 28)
    );

    const top = Math.round(stageBox.bottom - heroBox.top - 35);
    const bottom = gardensBox.bottom - heroBox.top - 110;
    const height = Math.max(0, Math.round(bottom - top));

    const sectionPositions = sections.map(({ heading }) => {
      const box = heading.getBoundingClientRect();

      return Math.round(
        box.top - heroBox.top - top + box.height / 2
      );
    });

    return { width, height, top, sectionPositions };
  }

  function addPath(parent, data, className, width, start, end) {
    const path = svgElement("path", {
      d: data,
      class: className,
      "stroke-width": width,
    });

    parent.append(path);
    drawing.push({ element: path, start, end, length: 0 });
  }

  function drawTrunk(parent) {
    const { width, height } = layout;
    const firstY = 75;
    const firstX = trunkX(firstY, width);

    addPath(
      parent,
      `M-8 0C${width * 0.3} 12 ${firstX} 25 ${firstX} ${firstY}`,
      "oak-branch__wood",
      4.8,
      0,
      firstY
    );

    const count = Math.ceil((height - firstY) / 130);

    for (let index = 0; index < count; index += 1) {
      const start = firstY + (height - firstY) * index / count;
      const end = firstY + (height - firstY) * (index + 1) / count;
      const startX = trunkX(start, width);
      const endX = trunkX(end, width);
      const middle = (start + end) / 2;

      addPath(
        parent,
        `M${startX} ${start}C${startX} ${middle} `
          + `${endX} ${middle} ${endX} ${end}`,
        "oak-branch__wood",
        4.8 - (index / count) * 3.2,
        start,
        end
      );
    }
  }

  function drawSmallLeaves(wood, leaves) {
    const { width, height, sectionPositions } = layout;
    const spacing = [155, 185, 145, 205];
    let index = 0;

    for (let y = 95; y < height - 100;) {
      const nearSection = sectionPositions.some((position) => {
        return Math.abs(position - y) < 100;
      });

      if (!nearSection) {
        const direction = index % 2 === 0 ? -1 : 1;
        const startX = trunkX(y, width);
        const endX = startX + direction * width * 0.21;
        const endY = y - 25;

        addPath(
          wood,
          `M${startX} ${y}Q${endX} ${y - 4} ${endX} ${endY}`,
          "oak-branch__twig",
          1.8,
          y,
          y + 35
        );

        const leaf = createLeaf(
          endX,
          endY,
          0.46,
          direction * 38,
          "oak-branch__small-leaf"
        );

        leaves.append(leaf);
        foliage.push({ element: leaf, start: y + 25 });
      }

      y += spacing[index % spacing.length];
      index += 1;
    }
  }

  function createSectionLink(section, index) {
    const y = layout.sectionPositions[index];
    const x = trunkX(y, layout.width);
    const link = document.createElement("a");

    link.className = "oak-branch__section-link";
    link.href = section.href;
    link.setAttribute("aria-label", section.label);
    link.style.setProperty("--leaf-top", `${y - 44}px`);
    link.style.setProperty("--leaf-left", `${x - 35}px`);

    const icon = svgElement("svg", {
      class: "oak-branch__section-icon",
      viewBox: "0 0 70 88",
      "aria-hidden": "true",
      focusable: "false",
    });

    icon.append(
      createLeaf(
        35,
        74,
        0.85,
        index % 2 === 0 ? -15 : 18,
        "oak-branch__link-leaf"
      )
    );

    const caption = document.createElement("span");
    caption.className = "oak-branch__section-caption";
    caption.setAttribute("aria-hidden", "true");
    caption.textContent = `${section.label} ↗`;

    link.append(icon, caption);
    return link;
  }

  function drawFinalLeaf(wood, leaves) {
    const { width, height } = layout;
    const x = trunkX(height, width);

    addPath(
      wood,
      `M${x} ${height - 12}Q${x + 24} ${height - 18} `
        + `${x + 27} ${height - 38}`,
      "oak-branch__twig",
      1.6,
      height - 65,
      height - 15
    );

    const leaf = createLeaf(
      x + 27,
      height - 38,
      0.47,
      32,
      "oak-branch__small-leaf"
    );

    leaves.append(leaf);
    foliage.push({ element: leaf, start: height - 35 });
  }

  function buildBranch() {
    drawing = [];
    foliage = [];

    const svg = svgElement("svg", {
      class: "oak-branch__svg",
      viewBox: `0 0 ${layout.width} ${layout.height}`,
      "aria-hidden": "true",
      focusable: "false",
    });

    const wood = svgElement("g");
    const leaves = svgElement("g");

    drawTrunk(wood);
    drawSmallLeaves(wood, leaves);
    drawFinalLeaf(wood, leaves);

    markers = sections.map(createSectionLink);

    svg.append(wood, leaves);
    branch.replaceChildren(svg, ...markers, topButton);

    drawing.forEach((item) => {
      item.length = item.element.getTotalLength();
      item.element.style.strokeDasharray = String(item.length);
    });
  }

  function updateLayout() {
    layout = measureLayout();

    const key = JSON.stringify(layout);
    if (key === previousLayout) return;

    previousLayout = key;

    const visible = layout.width >= 125 && layout.height >= 200;
    branch.classList.toggle("garden-hero__branch--ready", visible);

    if (!visible) return;

    branch.style.setProperty("--branch-width", `${layout.width}px`);
    branch.style.setProperty("--branch-height", `${layout.height}px`);
    branch.style.setProperty("--branch-top", `${layout.top}px`);

    buildBranch();
  }

  function updateDrawing(branchBox) {
    const position = window.innerHeight * 0.72 - branchBox.top;

    drawing.forEach((item) => {
      const progress = reducedMotion.matches
        ? 1
        : clamp((position - item.start) / (item.end - item.start), 0, 1);

      item.element.style.strokeDashoffset =
        String(item.length * (1 - progress));
    });

    foliage.forEach((item) => {
      const opacity = reducedMotion.matches
        ? 1
        : clamp((position - item.start) / 40, 0, 1);

      item.element.style.opacity = String(opacity);
    });
  }

  function updateMarkers() {
    const readingLine = window.innerHeight * 0.45;
    let active = -1;

    sections.forEach(({ heading }, index) => {
      if (heading.getBoundingClientRect().top <= readingLine) {
        active = index;
      }
    });

    if (contact && contact.getBoundingClientRect().top <= readingLine) {
      active = sections.length;
    }

    markers.forEach((marker, index) => {
      marker.classList.toggle(
        "oak-branch__section-link--active",
        index === active
      );

      marker.classList.toggle(
        "oak-branch__section-link--passed",
        index < active
      );
    });
  }

  function updateAcorn(branchBox) {
    const endpointY = branchBox.top + layout.height;
    const restingY = window.innerHeight - 110;
    const buttonY = Math.min(restingY, endpointY - 10);

    const endpointX = branchBox.left
      + trunkX(layout.height, layout.width);

    const visible = stage.getBoundingClientRect().bottom < 0
      && buttonY > 20;

    topButton.style.setProperty("--acorn-top", `${buttonY}px`);
    topButton.style.setProperty("--acorn-left", `${endpointX - 47}px`);

    topButton.classList.toggle("oak-branch__top--visible", visible);
    topButton.tabIndex = visible ? 0 : -1;
    topButton.setAttribute("aria-hidden", String(!visible));
  }

  function render() {
    frame = null;

    if (needsLayout) {
      needsLayout = false;
      updateLayout();
    }

    if (!branch.classList.contains("garden-hero__branch--ready")) {
      return;
    }

    const branchBox = branch.getBoundingClientRect();

    updateDrawing(branchBox);
    updateMarkers();
    updateAcorn(branchBox);
  }

  function scheduleRender() {
    if (frame !== null) return;
    frame = window.requestAnimationFrame(render);
  }

  function scheduleLayout() {
    needsLayout = true;
    scheduleRender();
  }

  window.addEventListener("scroll", scheduleRender, { passive: true });
  window.addEventListener("resize", scheduleLayout);
  window.addEventListener("load", scheduleLayout, { once: true });
  reducedMotion.addEventListener("change", scheduleRender);

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(scheduleLayout);
    observer.observe(main);
    observer.observe(stage);
  }

  document.fonts?.ready.then(scheduleLayout);
  scheduleRender();
})();