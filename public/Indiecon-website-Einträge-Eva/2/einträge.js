const textarea = document.querySelector('.textfeld');
const nameInput = document.querySelector('.input-name');
const fileInput = document.querySelector('.input-foto');
const previewContainer = document.querySelector('.image-preview');
const publishButton = document.querySelector('.publish');
const storyContainer = document.querySelector('.storys');
const treeContainer = document.querySelector('.tree');

const userColors = {};
const colorPalette = generateDistinctColors(100);
let availableColors = [...colorPalette];

let treeNodes = []; // Merkt sich letzte Knoten pro Nutzername

function getUserColor(name) {
  if (userColors[name]) {
    return userColors[name];
  }

  if (availableColors.length === 0) {
    console.warn(`Keine Farben mehr verfügbar für: ${name}`);
    userColors[name] = '#444444';
    return '#444444';
  }

  const randomIndex = Math.floor(Math.random() * availableColors.length);
  const color = availableColors.splice(randomIndex, 1)[0];
  userColors[name] = color;
  return color;
}

function generateDistinctColors(count) {
  const colors = [];
  const steps = Math.ceil(Math.sqrt(count));
  let hueStep = 360 / steps;
  let satLightCombos = [
    [65, 40],
    [70, 45],
    [60, 50],
    [75, 35],
    [55, 55]
  ];

  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < steps && colors.length < count; j++) {
      const hue = Math.round(i * hueStep + Math.random() * (hueStep / 3));
      const [s, l] = satLightCombos[j % satLightCombos.length];
      colors.push(`hsl(${hue}, ${s}%, ${l}%)`);
    }
  }

  return colors;
}

fileInput.addEventListener('change', function () {
  const file = this.files[0];
  if (file) {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    previewContainer.innerHTML = '';
    previewContainer.appendChild(img);
  } else {
    previewContainer.innerHTML = '';
  }
});

publishButton.addEventListener('click', function () {
  const content = textarea.value.trim();
  const name = nameInput.value.trim() || 'Unbekannt';
  const file = fileInput.files[0];

  if (content === '' && !file) return;

  // Bisherige Teile bluren
  const allParts = storyContainer.querySelectorAll('.story-part');
  allParts.forEach(part => part.classList.add('blur'));

  const userColor = getUserColor(name);
  addToTree(name);
  const timestamp = new Date().toLocaleString();

  if (content !== '') {
    const textSpan = document.createElement('span');
    textSpan.classList.add('story-part');
    textSpan.style.color = userColor;
    textSpan.textContent = content + ' ';
    textSpan.setAttribute('data-info', `${name}\n${timestamp}`);
    storyContainer.appendChild(textSpan);
  }

  if (file) {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.classList.add('story-part', 'image-part');
    img.title = `Von: ${name} • ${timestamp}`;
    storyContainer.appendChild(img);
  }

  // Letzten Eintrag sichtbar machen
  const newParts = storyContainer.querySelectorAll('.story-part');
  if (newParts.length > 0) {
    newParts[newParts.length - 1].classList.remove('blur');
  }

  // Eintrag speichern (Text + Bild als DataURL)
  saveEntry({ name, content, timestamp, imageFile: file });

  // Eingabefelder zurücksetzen
  textarea.value = '';
  nameInput.value = '';
  fileInput.value = '';
  previewContainer.innerHTML = '';
});


function addToTree(userName) {
  const userColor = getUserColor(userName);

  const newKnoten = document.createElement('div');
  newKnoten.classList.add('knoten');
  newKnoten.style.color = userColor;
  newKnoten.setAttribute('data-user', userName);

  const lastKnoten = treeNodes.length > 0 ? treeNodes[treeNodes.length - 1] : null;

  if (lastKnoten) {
    const line = document.createElement('div');
    line.classList.add('linie');
    treeContainer.appendChild(line);
  }

  treeContainer.appendChild(newKnoten);
  treeNodes.push(newKnoten);
}

function saveEntry(entry) {
  if (entry.imageFile) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const dataUrl = e.target.result;
      const newEntry = {
        name: entry.name,
        content: entry.content,
        timestamp: entry.timestamp,
        imageDataUrl: dataUrl
      };
      storeEntry(newEntry);
    };
    reader.readAsDataURL(entry.imageFile);
  } else {
    const newEntry = {
      name: entry.name,
      content: entry.content,
      timestamp: entry.timestamp,
      imageDataUrl: null
    };
    storeEntry(newEntry);
  }
}

function storeEntry(newEntry) {
  let entries = JSON.parse(localStorage.getItem('chatEntries')) || [];
  entries.push(newEntry);
  localStorage.setItem('chatEntries', JSON.stringify(entries));
}

function loadEntries() {
  const entries = JSON.parse(localStorage.getItem('chatEntries')) || [];

  entries.forEach(entry => {
    // Bisherige Teile bluren
    const allParts = storyContainer.querySelectorAll('.story-part');
    allParts.forEach(part => part.classList.add('blur'));

    const userColor = getUserColor(entry.name);
    addToTree(entry.name);

    if (entry.content) {
      const textSpan = document.createElement('span');
      textSpan.classList.add('story-part');
      textSpan.style.color = userColor;
      textSpan.textContent = entry.content + ' ';
      textSpan.setAttribute('data-info', `${entry.name}\n${entry.timestamp}`);
      storyContainer.appendChild(textSpan);
    }

    if (entry.imageDataUrl) {
      const img = document.createElement('img');
      img.src = entry.imageDataUrl;
      img.classList.add('story-part', 'image-part');
      img.title = `Von: ${entry.name} • ${entry.timestamp}`;
      storyContainer.appendChild(img);
    }

    // Letzten Eintrag sichtbar machen
    const newParts = storyContainer.querySelectorAll('.story-part');
    if (newParts.length > 0) {
      newParts[newParts.length - 1].classList.remove('blur');
    }
  });
}

document.addEventListener('DOMContentLoaded', loadEntries);
