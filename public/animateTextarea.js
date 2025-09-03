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
  "Wie würden Publikationen von nicht-menschlichen Wesen aussehen?",
  "Ein Virus breitet sich auf der Indiecon aus, der alle Publikationen durchfrisst, welche Spuren hinterlässt er?",
  "Es existieren nur noch ausschließlich KI generierte Publikationen … doch dann hörst du von einem geheimen Festival in Hamburg …",
  "Welche Aussteller*innen auf der Indiecon wollen heimlich Printprodukte abschaffen und wie sehen diese Pläne aus?",
  "Welche Publikation von der Indiecon wird ausgewählt um anhand dieser eine neue Weltordnung zu gestalten und wie würde die Welt dann aussehen?",
  "Wie könnte eine resourcenschonende Art Publikation zu veröffentlichen aussehen?",
  "Du findest eine Publikation aus dem Jahr 2225 …",
  "Du findest eine Publikation aus dem Jahr 1525 …",
  "Eine Publikation von der Indiecon wird in einem anderen Jahrhundert gefunden …",
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
