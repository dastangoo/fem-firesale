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

const renderMarkdownToHtml = (markdown) => {
  htmlView.innerHTML = marked(markdown, { sanitize: true });
};

markdownView.addEventListener('keyup', (event) => {
  renderMarkdownToHtml(event.target.value);
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

/* This is a dangerous code
newFileButton.addEventListener('click', mainProcess.createWindow());
*/

ipcRenderer.on('file-opened', (event, file, content) => {
  markdownView.value = content;
  renderMarkdownToHtml(content);

});
