function animatePlaceholder(text) {
  const textarea = document.getElementById("body-input");
  let index = 0;

  function type() {
    if (index <= text.length) {
      textarea.placeholder = text.slice(0, index);
      index++;
      setTimeout(type, 50);
    }
  }

  type();
}

const textContent = [
  "Welche Publikation gefällt dir besonders gut?",
  "Was versteckt sich in den Ecken der Halle?",
  "Wie stellst du dir die indiecon in 100 Jahren vor?",
  "Füge hier deinen Text-Beitrag hinzu...",
];
let isRunning = false;

function loopTextContent() {
  if (isRunning) return;
  isRunning = true;
  let totalDelay = 0;
  textContent.forEach((text, i) => {
    setTimeout(() => {
      animatePlaceholder(text);
      if (i === textContent.length - 1) {
        isRunning = false;
      }
    }, totalDelay);
    totalDelay += text.length * 50 + 3000;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loopTextContent();
});

document.getElementById("add").addEventListener("click", () => {
  loopTextContent();
});
