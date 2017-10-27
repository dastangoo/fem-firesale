const { app, BrowserWindow, dialog } = require('electron');



app.on('ready', () => {
  mainWindow = new BrowserWindow({ show: false });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    getFileFromUserSelection();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};


const getFileFromUserSelection = () => {
  const files = dialog.showOpenDialog(mainWindow, {
    properties: ['openFile']
  });

  if (!files) return;

  const file = files[0];
  console.log(file);
};

