(() => {
  "use strict";

  const stage = document.querySelector(".garden-hero__stage");
  const image = stage?.querySelector(".garden-hero__image");
  const sign = stage?.querySelector(".oak-sign");

  if (!stage || !image || !sign) return;

  // Suspension point in the original image's pixel coordinates.
  const anchor = { x: 120, y: 280 };
  const referenceScale = 1.2;
  const mobileViewport = window.matchMedia("(max-width: 1150px)");

  function getPositionFraction(value = "center") {
    const keywordPositions = {
      left: 0,
      top: 0,
      center: 0.5,
      right: 1,
      bottom: 1,
    };

    if (value in keywordPositions) {
      return keywordPositions[value];
    }

    if (value.endsWith("%")) {
      const percentage = Number.parseFloat(value);
      return Number.isFinite(percentage) ? percentage / 100 : 0.5;
    }

    return 0.5;
  }

  function getImageScale(imageBox, objectFit) {
    const widthScale = imageBox.width / image.naturalWidth;
    const heightScale = imageBox.height / image.naturalHeight;

    if (objectFit === "fill") {
      return { x: widthScale, y: heightScale };
    }

    let scale = Math.min(widthScale, heightScale);

    if (objectFit === "cover") {
      scale = Math.max(widthScale, heightScale);
    } else if (objectFit === "none") {
      scale = 1;
    } else if (objectFit === "scale-down") {
      scale = Math.min(1, scale);
    }

    return { x: scale, y: scale };
  }

  function getAnchorPosition(stageBox, imageBox) {
    const imageStyle = getComputedStyle(image);
    const scale = getImageScale(imageBox, imageStyle.objectFit);
    const [horizontal, vertical] = imageStyle.objectPosition.split(/\s+/);

    // Account for the crop produced by object-fit and object-position.
    const cropX =
      (imageBox.width - image.naturalWidth * scale.x) *
      getPositionFraction(horizontal);
    const cropY =
      (imageBox.height - image.naturalHeight * scale.y) *
      getPositionFraction(vertical);

    const sourceX = imageBox.left + cropX + anchor.x * scale.x;
    const sourceY = imageBox.top + cropY + anchor.y * scale.y;

    // Convert viewport coordinates back to the stage's CSS coordinates.
    const cssScaleX = stage.clientWidth / stageBox.width;
    const cssScaleY = stage.clientHeight / stageBox.height;

    return {
      x: (sourceX - stageBox.left) * cssScaleX,
      y: (sourceY - stageBox.top) * cssScaleY,
      scale: scale.x * cssScaleX,
    };
  }

  function isAnchorVisible(position) {
    return (
      position.x >= -15 &&
      position.y >= -15 &&
      position.x <= stage.clientWidth - 70 &&
      position.y <= stage.clientHeight - 70
    );
  }

  function applySignPosition(position) {
    const visible = isAnchorVisible(position);

    sign.classList.toggle("oak-sign--anchored", visible);
    sign.classList.toggle("oak-sign--detached", !visible);

    if (!visible) return;

    const scale = Math.min(
      2.7,
      Math.max(0.75, position.scale / referenceScale),
    );

    sign.style.setProperty("--oak-image-x", `${position.x.toFixed(2)}px`);
    sign.style.setProperty("--oak-image-y", `${position.y.toFixed(2)}px`);
    sign.style.setProperty("--oak-image-scale", scale.toFixed(4));
  }

  function updateSignPosition() {
    if (mobileViewport.matches) {
      sign.classList.remove("oak-sign--anchored", "oak-sign--detached");
      return;
    }

    if (!image.naturalWidth || !image.naturalHeight) return;

    const stageBox = stage.getBoundingClientRect();
    const imageBox = image.getBoundingClientRect();

    if (
      !stageBox.width ||
      !stageBox.height ||
      !imageBox.width ||
      !imageBox.height
    ) {
      return;
    }

    applySignPosition(getAnchorPosition(stageBox, imageBox));
  }

  image.addEventListener("load", updateSignPosition);
  window.addEventListener("resize", updateSignPosition, { passive: true });
  mobileViewport.addEventListener("change", updateSignPosition);

  if (typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver(updateSignPosition);
    observer.observe(stage);
    observer.observe(image);
  }

  updateSignPosition();
})();