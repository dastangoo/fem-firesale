const { app, BrowserWindow, dialog } = require('electron');
const fs = require('fs');

const windows = new Set();
const fileWatchers = new Map();

const createWindow = exports.createWindow = (file) => {
  let newWindow = new BrowserWindow({ show: false });
  windows.add(newWindow);

  newWindow.loadURL(`file://${__dirname}/index.html`);
  // newWindow.webContents.loadURL(`file://${__dirname}/index.html`);

  newWindow.once('ready-to-show', () => {

    if(file) openFile(newWindow, file);
    newWindow.show();

    // getFileFromUserSelection();
  });

  newWindow.on('close', (event) => {
    if (newWindow.isDocumentEdited()) {
      event.preventDefault();
      const result = dialog.showMessageBox(newWindow, {
        type: 'warning',
        title: 'Quit with unsaved changes?',
        message: 'Your changes will be lost if you do not save first.',
        buttons: [
          'Quit Anyway',
          'Cancel'
        ],
        defaultId: 0,
        cancelId: 1
      });

      if (result === 0) newWindow.destroy();
    }
  });

  newWindow.on('closed', () => {
    windows.delete(newWindow);
    stopWatchingFiles(newWindow);
    newWindow = null;
  });
};

const getFileFromUserSelection = exports.getFileFromUserSelection = (targetWindow) => {
  const files = dialog.showOpenDialog(targetWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Text Files', extensions: ['txt', 'text'] },
      { name: 'Markdown Files', extensions: ['md', 'markdown'] }
    ]
  });

  if (!files) return;
  // console.log(content);

  return files[0];
};

const openFile = exports.openFile = (targetWindow, filePath) => {
  const file = filePath || getFileFromUserSelection(targetWindow);
  const content = fs.readFileSync(file).toString();

  app.addRecentDocument(file);
  startWatchingFiles(targetWindow, file);

  targetWindow.webContents.send('file-opened', file, content);
  targetWindow.setRepresentedFilename(file);
};

const saveMarkdown = exports.saveMarkdown = (targetWindow, file, content) => {
  if (!file) {
    file = dialog.showSaveDialog(targetWindow, {
      title: 'Save Markdown',
      defaultPath: app.getPath('documents'),
      filters: [
        { name: 'Markdown Files', extensions: ['md', 'markdown']}
      ]
    });
  }

  if (!file) return;

  fs.writeFileSync(file, content);
  targetWindow.webContents.send('file-opened', file, content);
};

// NOTE: It's not final yet and needs more review
const saveHtml = exports.saveHtml = (targetWindow, file, content) => {
  if (!file) {
    file = dialog.showSaveDialog(targetWindow, {
      title: 'Save HTML',
      defaultPath: app.getPath('documents'),
      filters: [
        { name: 'HTML Files', extensions: ['html', 'htm'] }
      ]
    });
  }
  if (!file) return;

  fs.writeFileSync(file, content);
  targetWindow.webContents.send('file-opened', file, content);
};

// NOTE: It's not implemented yet.
const revert = exports.revert = () => {

};

const startWatchingFiles = (targetWindow, file) => {
  stopWatchingFiles(targetWindow);
  const watcher = fs.watch(file, (event) => {
    if (event === 'change') {
      const content = fs.readFileSync(file).toString();
      targetWindow.webContents.send('file-changed', file, content);
    }
  });

  fileWatchers.set(targetWindow, watcher);
};


const stopWatchingFiles = (targetWindow) => {
  if (fileWatchers.has(targetWindow)) {
    fileWatchers.get(targetWindow).close();
    fileWatchers.delete(targetWindow);
  }
};
app.on('ready', () => {
  createWindow();
});

app.on('will-finish-launching', () => {
  app.on('open-file', (event, filePath) => {
     createWindow(filePath);
  });
});