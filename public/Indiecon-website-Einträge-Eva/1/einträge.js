const textarea = document.querySelector('.textfeld');
const nameInput = document.querySelector('.input-name');
const fileInput = document.querySelector('.input-foto');
const previewContainer = document.querySelector('.image-preview');
const publishButton = document.querySelector('.publish');

fileInput.addEventListener('change', function() {
  const file = this.files[0];
  if (file) {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);

    // Vorschau vorher leeren
    previewContainer.innerHTML = '';
    previewContainer.appendChild(img);
  } else {
    previewContainer.innerHTML = '';
  }
});

publishButton.addEventListener('click', function () {
  const content = textarea.value.trim();
  const name = nameInput.value.trim();
  const file = fileInput.files[0];

  if (content === "") return;

  // Bisherige Einträge bluren
  const allEntries = document.querySelectorAll('.story-entry');
  allEntries.forEach(entry => entry.classList.add('blur'));

  // Neuen Eintrag erstellen
  const entry = document.createElement('div');
  entry.classList.add('story-entry');

  // Inhalt zusammenbauen
  let innerHTML = "";
  if (file) {
    const imgURL = URL.createObjectURL(file);
    innerHTML += `<img src="${imgURL}" class="entry-image" alt="Foto">`;
  }
  if (name) {
    innerHTML += `<p><strong>${name}</strong></p>`;
  }
  innerHTML += `<p>${content}</p>`;

  entry.innerHTML = innerHTML;

  // Eintrag anzeigen
  document.querySelector('.storys').append(entry);
  entry.classList.remove('blur');

  // Felder leeren
  textarea.value = "";
  nameInput.value = "";
  fileInput.value = "";

  // Vorschau komplett löschen
  previewContainer.innerHTML = '';
});
