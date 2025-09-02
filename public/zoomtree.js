function scaleMap() {
  const slider = document.getElementById("slider");
  const tree = document.querySelector(".tree");
  const plusBtn = document.getElementById("treePlus");
  const minusBtn = document.getElementById("treeMinus");

  let isDragging = false;
  let currentScale = 1;
  let lastMouseX = 0;

  function updateScale(newScale) {
    // clamp
    currentScale = Math.min(Math.max(newScale, 0.25), 2);

    if (currentScale >= 1.75) {
      currentScale = 2;
    } else if (currentScale <= 0.4) {
      currentScale = 0.25;
    } else if (currentScale > 0.5 && currentScale < 1.7) {
      currentScale = 1;
    }

    slider.classList.remove("big", "small");

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
  }

  // drag logic
  slider.addEventListener("mousedown", (e) => {
    e.preventDefault();
    isDragging = true;
    lastMouseX = e.clientX;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMouseX;
    lastMouseX = e.clientX;

    updateScale(currentScale + deltaX / 5);
  });

  document.addEventListener("mouseup", () => (isDragging = false));
  document.addEventListener("mouseleave", () => (isDragging = false));

  // button logic
  plusBtn.addEventListener("click", () => {
    updateScale(currentScale + 1); // zoom in
  });

  minusBtn.addEventListener("click", () => {
    updateScale(currentScale - 0.5); // zoom out
  });
}

scaleMap();
