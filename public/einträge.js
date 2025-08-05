const BaseURL = "https://staging.co-o-pub.space/api/" // change to /api/ in production


// --- Elemente ---
const textarea = document.querySelector('.textfeld')
const nameInput = document.querySelector('.input-name')
const fileInput = document.querySelector('.input-foto')
const previewContainer = document.querySelector('.image-preview')
const publishButton = document.querySelector('.publish')
const storyContainer = document.querySelector('.storys')
const wahlButtons = document.querySelectorAll('.wahl-buttons button')
const textfeld = document.querySelector('.textfeld')
const canvas = document.querySelector('.skizze-canvas')
const audioDiv = document.querySelector('.audio-recorder')
const startAudioBtn = document.querySelector('.start-audio')
const stopAudioBtn = document.querySelector('.stop-audio')
const audioPreview = document.querySelector('.audio-preview')

async function getLeafBranch () {
  try {
    const response = await fetch(BaseURL + 'post')
    const json = await response.json()
    return json.data
  }
  catch (e) {
    console.error(e)
  }
}

async function publishPost (post) {
  try {
    await fetch(BaseURL + 'posts', {
      method: "POST",
      body: JSON.stringify(post),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    })
  }
  catch (e) {
    console.error(e)
  }
}

// --- State Management ---
let currentPosts = []
let lastLoadedPostId = null

// --- Farben ---
const userColors = {}
const colorPalette = generateDistinctColors(100)
let availableColors = [...colorPalette]

function generateDistinctColors (count) {
  const colors = []
  const steps = Math.ceil(Math.sqrt(count))
  const hueStep = 360 / steps
  const satLightCombos = [[65, 40], [70, 45], [60, 50], [75, 35], [55, 55]]
  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < steps && colors.length < count; j++) {
      const hue = Math.round(i * hueStep + Math.random() * (hueStep / 3))
      const [s, l] = satLightCombos[j % satLightCombos.length]
      colors.push(`hsl(${hue}, ${s}%, ${l}%)`)
    }
  }
  return colors
}

function getUserColor (name) {
  if (userColors[name]) return userColors[name]
  if (availableColors.length === 0) return '#444444'
  const idx = Math.floor(Math.random() * availableColors.length)
  const color = availableColors.splice(idx, 1)[0]
  userColors[name] = color
  return color
}

// --- Backend Integration ---
async function loadAndDisplayPosts() {
  try {
    const posts = await getLeafBranch();


    // Clear existing content
    storyContainer.innerHTML = '';

    // Render each post
    for (const post of posts) {
      await renderPost(post);
    }

    currentPosts = posts;
    lastLoadedPostId = posts.length > 0 ? Math.max(...posts.map(p => p.id)) : null;

  } catch (error) {
    console.error('Error loading posts:', error);
  }
}

async function renderPost(post) {
  const userName = post.author;
  const timestamp = new Date(post.date * 1000).toLocaleString();
  const userColor = getUserColor(userName);


  // Blur existing posts
  storyContainer.querySelectorAll('.story-part').forEach(p => p.classList.add('blur'));

  if (post.type === 'text') {
    const lastEntry = Array.from(storyContainer.querySelectorAll('.story-part')).reverse()
      .find(el => el.style.color === userColor && el.tagName.toLowerCase() === 'span');

    if (lastEntry) {
      lastEntry.textContent += ' ' + post.content + ' ';
      lastEntry.setAttribute('data-info', `${userName}\n${timestamp}`);
    } else {
      const textSpan = document.createElement('span');
      textSpan.classList.add('story-part');
      textSpan.style.color = userColor;
      textSpan.textContent = post.content;
      textSpan.setAttribute('data-info', `${userName}\n${timestamp}`);
      storyContainer.appendChild(textSpan);
    }
  }

  else if (post.type === 'image') {
    const wrapper = document.createElement('div');
    wrapper.classList.add('story-part', 'image-wrapper');
    wrapper.style.position = 'relative';

    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.classList.add('image-part');
    img.title = `Von: ${userName} • ${timestamp}`;

    wrapper.appendChild(img);
    storyContainer.appendChild(wrapper);
  }

  else if (post.type === 'sketch') {
    const wrapper = document.createElement('div');
    wrapper.classList.add('story-part', 'image-wrapper');
    wrapper.style.position = 'relative';

    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');
    img.classList.add('image-part');
    img.title = `Skizze von: ${userName} • ${timestamp}`;

    wrapper.appendChild(img);
    storyContainer.appendChild(wrapper);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  else if (post.type === 'audio') {
    const container = document.createElement('div');
    container.classList.add('story-part', 'audio-part');
    container.title = `Audio von: ${userName} • ${timestamp}`;

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

    storyContainer.appendChild(container);
  }


  // Remove blur from the latest post
  const parts = storyContainer.querySelectorAll('.story-part');
  if (parts.length > 0) parts[parts.length - 1].classList.remove('blur');
}


// --- File Upload Helpers ---
function fileToDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

function canvasToDataURL(canvas) {
  return canvas.toDataURL('image/png');
}

function audioToDataURL(audioBlob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsDataURL(audioBlob);
  });
}

// --- Post Creation ---
async function createPost(author, type, content) {
  // This function should make an API call to create a new post
  const parentId = currentPosts[currentPosts.length - 1].id

  const newPost = {
    author: author,
    parent_id: parentId,
    type: type,
    content: content,
  };

  // Here you would typically make an API call to save the post
  await publishPost(newPost);

  return newPost;
}

// --- UI Event Handlers ---
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0]
  if (file) {
    const img = document.createElement('img')
    img.src = URL.createObjectURL(file)
    previewContainer.innerHTML = ''
    previewContainer.appendChild(img)
  } else {
    previewContainer.innerHTML = ''
  }
})

let selectedType = null

wahlButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    selectedType = btn.dataset.type
    showInputForType(selectedType)
  })
})

function showInputForType (type) {
  textfeld.style.display = 'none'
  fileInput.style.display = 'none'
  previewContainer.innerHTML = ''
  canvas.style.display = 'none'
  audioDiv.style.display = 'none'
  stopAudioBtn.disabled = true
  startAudioBtn.disabled = false
  audioPreview.src = ''

  if (type === 'text') textfeld.style.display = 'block'
  else if (type === 'image') fileInput.style.display = 'block'
  else if (type === 'sketch') canvas.style.display = 'block'
  else if (type === 'audio') audioDiv.style.display = 'block'
}

// --- Canvas Drawing ---
const ctx = canvas.getContext('2d')
let isDrawing = false
let lastX = 0
let lastY = 0

function getMousePos (canvas, evt) {
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  return {
    x: (evt.clientX - rect.left) * scaleX,
    y: (evt.clientY - rect.top) * scaleY
  }
}

canvas.addEventListener('mousedown', e => {
  isDrawing = true
  const pos = getMousePos(canvas, e)
  lastX = pos.x
  lastY = pos.y
})

canvas.addEventListener('mousemove', e => {
  if (!isDrawing) return
  const pos = getMousePos(canvas, e)
  ctx.strokeStyle = 'black'
  ctx.lineWidth = 3
  ctx.lineCap = 'round'

  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(pos.x, pos.y)
  ctx.stroke()

  lastX = pos.x
  lastY = pos.y
})

canvas.addEventListener('mouseup', () => { isDrawing = false })
canvas.addEventListener('mouseout', () => { isDrawing = false })

function isCanvasEmpty () {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  return !imgData.data.some(channel => channel !== 0)
}

// --- Audio Recording ---
let mediaRecorder = null
let audioChunks = []

startAudioBtn.addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    audioChunks = []

    mediaRecorder.ondataavailable = e => audioChunks.push(e.data)
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks)
      audioPreview.src = URL.createObjectURL(audioBlob)
      audioPreview.controls = true
    }

    mediaRecorder.start()
    startAudioBtn.disabled = true
    stopAudioBtn.disabled = false
  } catch (err) {
    alert('Audioaufnahme nicht möglich: ' + err.message)
  }
})

stopAudioBtn.addEventListener('click', () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
  startAudioBtn.disabled = false
  stopAudioBtn.disabled = true
})

// --- Publishing ---
publishButton.addEventListener('click', async () => {
  const name = nameInput.value.trim() || 'Unbekannt'
  let content = textarea.value.trim()
  const file = fileInput.files[0]

  // Validate input based on selected type
  if ((selectedType === 'text' && content === '') ||
    (selectedType === 'image' && !file) ||
    (selectedType === 'sketch' && isCanvasEmpty()) ||
      (selectedType === 'audio' && audioPreview.src === '')) {
    alert('Bitte fülle alle erforderlichen Felder aus.');
    return;
  }

  publishButton.disabled = true;
  publishButton.textContent = 'Wird veröffentlicht...';

  try {
    let postContent = '';

    // Process content based on type
    if (selectedType === 'text') {
      postContent = content;
    } else if (selectedType === 'image') { // This doesnt work yet
      // postContent = await fileToDataURL(file);
      return
    } else if (selectedType === 'sketch') {
      // postContent = canvasToDataURL(canvas);
      return
    } else if (selectedType === 'audio') {
      // const audioBlob = new Blob(audioChunks);
      // postContent = await audioToDataURL(audioBlob);
      return
    }

    // Create the post
    const newPost = await createPost(name, selectedType, postContent);

    // Add to current posts and re-render
    currentPosts.push(newPost);
    await renderPost(newPost);

    // Clear form
    textarea.value = '';
    nameInput.value = '';
    fileInput.value = '';
    previewContainer.innerHTML = '';
    audioPreview.src = '';
    if (selectedType === 'sketch') {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    selectedType = null;

    // Hide all input types
    textfeld.style.display = 'none';
    fileInput.style.display = 'none';
    canvas.style.display = 'none';
    audioDiv.style.display = 'none';

  } catch (error) {
    console.error('Error publishing post:', error);
    alert('Fehler beim Veröffentlichen. Bitte versuche es erneut.');
  } finally {
    publishButton.disabled = false;
    publishButton.textContent = 'Veröffentlichen';
  }
});

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
  await loadAndDisplayPosts();
});

// Initial load
loadAndDisplayPosts();
