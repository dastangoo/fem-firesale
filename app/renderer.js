const marked = require('marked');
const { remote, ipcRenderer } = require('electron');
const mainProcess = remote.require('./main');
const currentWindow = remote.getCurrentWindow();

const markdownView = document.querySelector('#markdown');
const htmlView = document.querySelector('#html');
const newFileButton = document.querySelector('#new-file');
const openFileButton = document.querySelector('#open-file');
const saveMarkdownButton = document.querySelector('#save-markdown');
const revertButton = document.querySelector('#revert');
const saveHtmlButton = document.querySelector('#save-html');

let filePath = null;
let originalContent = '';


const renderMarkdownToHtml = (markdown) => {
  htmlView.innerHTML = marked(markdown, { sanitize: true });
};

const updateEditedState = (isEdited) => {
  currentWindow.setDocumentEdited(isEdited);

  saveMarkdownButton.disabled = !isEdited;
  revertButton.disabled = !isEdited;

  let title = 'Fire Sale';
  if (filePath) title = `${filePath} - ${title}`;
  if (isEdited) title = `${title} (Edited)`;
  currentWindow.setTitle(title);
};

markdownView.addEventListener('keyup', (event) => {
  const currentContent = event.target.value;
  renderMarkdownToHtml(currentContent);
  updateEditedState(currentContent !== originalContent);
});

openFileButton.addEventListener('click', () => {
  // alert('I WILL ONE DAY OPEN A FILE');
  // remote.getGlobal('getFileFromUserSelection')();
  mainProcess.openFile(currentWindow);
  /*
  * This code doesn't work correctly
  mainProcess.openFile(this);
  */
});

newFileButton.addEventListener('click', () => {
  mainProcess.createWindow();
});


saveMarkdownButton.addEventListener('click', () => {
  mainProcess.saveMarkdown(currentWindow, filePath, markdownView.value);
});

// NOTE: It's not final yet and needs more review
saveHtmlButton.addEventListener('click', () => {
  mainProcess.saveHtml(currentWindow, filePath, htmlView.value);
});

// NOTE: It's not implemented yet
revertButton.addEventListener('click', () => {
  mainProcess.revert();
});

/* This is a dangerous code
newFileButton.addEventListener('click', mainProcess.createWindow());
*/

ipcRenderer.on('file-opened', (event, file, content) => {

  filePath = file;
  originalContent = content;

  markdownView.value = content;
  renderMarkdownToHtml(content);

  updateEditedState(false);
});
