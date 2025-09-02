function scaleMap() {
  const slider = document.getElementById("slider");
  const tree = document.querySelector(".tree");
  const plusBtn = document.getElementById("treePlus");
  const minusBtn = document.getElementById("treeMinus");

  const scales = [0.25, 0.5, 1];
  let currentIndex = 2; // start at 1

  function updateScale(index) {
    currentIndex = Math.max(0, Math.min(scales.length - 1, index));
    const currentScale = scales[currentIndex];

    tree.classList.remove("big", "small");
    if (currentScale === 1) {
      tree.classList.add("big");
    } else if (currentScale === 0.25) {
      tree.classList.add("small");
    }

    slider.style.transform = `scaleX(${currentScale})`;
    console.log(currentScale);
  }

  // drag logic
  slider.addEventListener("mousedown", (e) => {
    e.preventDefault();
    slider.dataset.dragging = "true";
    slider.dataset.startX = e.clientX;
    slider.dataset.startIndex = currentIndex;
  });

  document.addEventListener("mousemove", (e) => {
    if (slider.dataset.dragging !== "true") return;
    const startX = Number(slider.dataset.startX);
    const startIndex = Number(slider.dataset.startIndex);
    const deltaX = e.clientX - startX;
    // drag right increases index, left decreases
    let newIndex = startIndex + (deltaX > 30 ? 1 : deltaX < -30 ? -1 : 0);
    updateScale(newIndex);
  });

  document.addEventListener("mouseup", () => {
    slider.dataset.dragging = "false";
  });
  document.addEventListener("mouseleave", () => {
    slider.dataset.dragging = "false";
  });

  // button logic
  plusBtn.addEventListener("click", () => {
    updateScale(currentIndex + 1);
  });

  minusBtn.addEventListener("click", () => {
    updateScale(currentIndex - 1);
  });

  updateScale(currentIndex);
}

scaleMap();
