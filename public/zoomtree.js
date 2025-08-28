function scaleMap() {
  const slider = document.getElementById("slider");
  let isDragging = false;
  let currentScale = 1;
  let lastMouseX = 0;

  slider.addEventListener("mousedown", (e) => {
    e.preventDefault();
    isDragging = true;
    lastMouseX = e.clientX;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMouseX;
    lastMouseX = e.clientX;

    currentScale -= deltaX / 25;

    // clamp
    currentScale = Math.min(Math.max(currentScale, 0.5), 2);

    if (currentScale >= 1.75) {
      currentScale = 2;
    } else if (currentScale <= 0.6) {
      currentScale = 0.5;
    } else if (currentScale > 0.8 && currentScale < 1.4) {
      currentScale = 1;
    }

    slider.classList.remove("big", "small");

    const tree = document.querySelector(".tree");

    if (currentScale === 2) {
      tree.classList.add("big");
      tree.classList.remove("small");
    } else if (currentScale === 0.5) {
      tree.classList.add("small");
      tree.classList.remove("big");
    } else if (currentScale < 2 && currentScale > 0.5) {
      tree.classList.remove("big", "small");
    }
    slider.style.transform = `scaleX(${currentScale})`;
    console.log(currentScale);
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  document.addEventListener("mouseleave", () => {
    isDragging = false;
  });
}

scaleMap();
