let footnoteCounter = 1;

// --- Elemente ---
const textarea = document.querySelector('.textfeld');
const nameInput = document.querySelector('.input-name');
const fileInput = document.querySelector('.input-foto');
const previewContainer = document.querySelector('.image-preview');
const publishButton = document.querySelector('.publish');
const storyContainer = document.querySelector('.storys');
const treeContainer = document.querySelector('.tree');
const wahlButtons = document.querySelectorAll('.wahl-buttons button');
const textfeld = document.querySelector('.textfeld');
const canvas = document.querySelector('.skizze-canvas');
const audioDiv = document.querySelector('.audio-recorder');
const startAudioBtn = document.querySelector('.start-audio');
const stopAudioBtn = document.querySelector('.stop-audio');
const audioPreview = document.querySelector('.audio-preview');

// --- Farben ---
const userColors = {};
const colorPalette = generateDistinctColors(100);
let availableColors = [...colorPalette];
let treeNodes = [];

function generateDistinctColors(count) {
  const colors = [];
  const steps = Math.ceil(Math.sqrt(count));
  const hueStep = 360 / steps;
  const satLightCombos = [[65, 40], [70, 45], [60, 50], [75, 35], [55, 55]];
  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < steps && colors.length < count; j++) {
      const hue = Math.round(i * hueStep + Math.random() * (hueStep / 3));
      const [s, l] = satLightCombos[j % satLightCombos.length];
      colors.push(`hsl(${hue}, ${s}%, ${l}%)`);
    }
  }
  return colors;
}

function getUserColor(name) {
  if (userColors[name]) return userColors[name];
  if (availableColors.length === 0) return '#444444';
  const idx = Math.floor(Math.random() * availableColors.length);
  const color = availableColors.splice(idx, 1)[0];
  userColors[name] = color;
  return color;
}

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

function addFootnote(index, name, timestamp, color) {
  const footnoteList = document.querySelector('.footnotes');
  const fnItem = document.createElement('div');
  fnItem.classList.add('footnote');
  fnItem.innerHTML = `<sup style="color:${color}">${index}</sup> <span style="color:${color}">${name} (${timestamp})</span>`;
  footnoteList.appendChild(fnItem);
}

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    previewContainer.innerHTML = '';
    previewContainer.appendChild(img);
  } else {
    previewContainer.innerHTML = '';
  }
});

let selectedType = null;

wahlButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    selectedType = btn.dataset.type;
    showInputForType(selectedType);
  });
});

function showInputForType(type) {
  textfeld.style.display = 'none';
  fileInput.style.display = 'none';
  previewContainer.innerHTML = '';
  canvas.style.display = 'none';
  audioDiv.style.display = 'none';
  stopAudioBtn.disabled = true;
  startAudioBtn.disabled = false;
  audioPreview.src = '';

  if (type === 'text') textfeld.style.display = 'block';
  else if (type === 'image') fileInput.style.display = 'block';
  else if (type === 'sketch') canvas.style.display = 'block';
  else if (type === 'audio') audioDiv.style.display = 'block';
}

// --- Canvas Zeichnen ---
const ctx = canvas.getContext('2d');
let isDrawing = false;
let lastX = 0;
let lastY = 0;

function getMousePos(canvas, evt) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (evt.clientX - rect.left) * scaleX,
    y: (evt.clientY - rect.top) * scaleY
  };
}

canvas.addEventListener('mousedown', e => {
  isDrawing = true;
  const pos = getMousePos(canvas, e);
  lastX = pos.x;
  lastY = pos.y;
});

canvas.addEventListener('mousemove', e => {
  if (!isDrawing) return;
  const pos = getMousePos(canvas, e);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();

  lastX = pos.x;
  lastY = pos.y;
});

canvas.addEventListener('mouseup', () => { isDrawing = false; });
canvas.addEventListener('mouseout', () => { isDrawing = false; });

function isCanvasEmpty() {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return !imgData.data.some(channel => channel !== 0);
}

// --- Audioaufnahme ---
let mediaRecorder = null;
let audioChunks = [];

startAudioBtn.addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks);
      audioPreview.src = URL.createObjectURL(audioBlob);
      audioPreview.controls = true;
    };

    mediaRecorder.start();
    startAudioBtn.disabled = true;
    stopAudioBtn.disabled = false;
  } catch (err) {
    alert('Audioaufnahme nicht möglich: ' + err.message);
  }
});

stopAudioBtn.addEventListener('click', () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  startAudioBtn.disabled = false;
  stopAudioBtn.disabled = true;
});

// --- Veröffentlichen ---
publishButton.addEventListener('click', () => {
  const name = nameInput.value.trim() || 'Unbekannt';
  const timestamp = new Date().toLocaleString();
  const userColor = getUserColor(name);
  let content = textarea.value.trim();
  const file = fileInput.files[0];

  if ((selectedType === 'text' && content === '') ||
      (selectedType === 'image' && !file) ||
      (selectedType === 'sketch' && isCanvasEmpty()) ||
      (selectedType === 'audio' && audioPreview.src === '')) return;

  storyContainer.querySelectorAll('.story-part').forEach(p => p.classList.add('blur'));

  addToTree(name);

  if (selectedType === 'text') {
    const lastEntry = Array.from(storyContainer.querySelectorAll('.story-part')).reverse()
      .find(el => el.style.color === userColor && el.tagName.toLowerCase() === 'span');

    const footnoteIndex = footnoteCounter++;

    if (lastEntry) {
      lastEntry.textContent += ' ' + content + ' ';
      const footnoteTag = document.createElement('sup');
      footnoteTag.textContent = footnoteIndex;
      footnoteTag.style.color = userColor;
      lastEntry.appendChild(footnoteTag);
      lastEntry.setAttribute('data-info', `${name}\n${timestamp}`);
    } else {
      const footnoteTag = document.createElement('sup');
      footnoteTag.textContent = footnoteIndex;
      footnoteTag.style.color = userColor;

      const textSpan = document.createElement('span');
      textSpan.classList.add('story-part');
      textSpan.style.color = userColor;
      textSpan.textContent = content + ' ';
      textSpan.appendChild(footnoteTag);
      textSpan.setAttribute('data-info', `${name}\n${timestamp}`);

      storyContainer.appendChild(textSpan);
    }

    addFootnote(footnoteIndex, name, timestamp, userColor);
  }

  else if (selectedType === 'image') {
  const footnoteIndex = footnoteCounter++;
  const wrapper = document.createElement('div');
  wrapper.classList.add('story-part', 'image-wrapper');
  wrapper.style.position = 'relative';

  const img = document.createElement('img');
  img.src = URL.createObjectURL(file);
  img.classList.add('image-part');
  img.title = `Von: ${name} • ${timestamp}`;

  const sup = document.createElement('sup');
  sup.textContent = footnoteIndex;
  sup.style.color = userColor;

  wrapper.appendChild(img);
  wrapper.appendChild(sup);
  storyContainer.appendChild(wrapper);
  addFootnote(footnoteIndex, name, timestamp, userColor);
}


  else if (selectedType === 'sketch') {
  const footnoteIndex = footnoteCounter++;
  const wrapper = document.createElement('div');
  wrapper.classList.add('story-part', 'image-wrapper');
  wrapper.style.position = 'relative';

  const img = document.createElement('img');
  img.src = canvas.toDataURL('image/png');
  img.classList.add('image-part');
  img.title = `Skizze von: ${name} • ${timestamp}`;

  const sup = document.createElement('sup');
  sup.textContent = footnoteIndex;
  sup.style.color = userColor;

  wrapper.appendChild(img);
  wrapper.appendChild(sup);
  storyContainer.appendChild(wrapper);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  addFootnote(footnoteIndex, name, timestamp, userColor);
}


  else if (selectedType === 'audio') {
  const footnoteIndex = footnoteCounter++;
  const container = document.createElement('div');
  container.classList.add('story-part', 'audio-part');
  container.title = `Audio von: ${name} • ${timestamp}`;

  const audioEl = document.createElement('audio');
  audioEl.src = audioPreview.src;
  audioEl.style.display = 'none';
  container.appendChild(audioEl);

  const playBtn = document.createElement('button');
  playBtn.classList.add('audio-play-btn');
  playBtn.textContent = '▶️';
  container.appendChild(playBtn);

  playBtn.addEventListener('click', () => {
    if (audioEl.paused) {
      audioEl.play();
      playBtn.textContent = '⏸️';
    } else {
      audioEl.pause();
      playBtn.textContent = '▶️';
    }
  });

  audioEl.addEventListener('ended', () => {
    playBtn.textContent = '▶️';
  });

  const sup = document.createElement('sup');
  sup.textContent = footnoteIndex;
  sup.style.color = userColor;
  container.appendChild(sup);

  storyContainer.appendChild(container);
  addFootnote(footnoteIndex, name, timestamp, userColor);
}


  const parts = storyContainer.querySelectorAll('.story-part');
  if (parts.length > 0) parts[parts.length - 1].classList.remove('blur');

  textarea.value = '';
  nameInput.value = '';
  fileInput.value = '';
  previewContainer.innerHTML = '';
  audioPreview.src = '';
  selectedType = null;

  textfeld.style.display = 'none';
  fileInput.style.display = 'none';
  canvas.style.display = 'none';
  audioDiv.style.display = 'none';
});
s