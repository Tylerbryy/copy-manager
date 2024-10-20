// File: main.js
const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');
const clipboardWatcher = require('electron-clipboard-watcher');

let mainWindow;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: 360,
    height: 120,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false,
    },
    show: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    focusable: false, // This prevents the window from capturing focus
  });

  mainWindow.loadFile('index.html');
  mainWindow.setVisibleOnAllWorkspaces(true);
  mainWindow.setPosition(width - 380, height - 140);

  mainWindow.once('ready-to-show', () => {
    mainWindow.showInactive(); // Show the window without focusing it
  });
}

app.whenReady().then(() => {
  createWindow();

  clipboardWatcher({
    watchDelay: 100,
    onTextChange: (text) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.showInactive(); // Show the window when there's a clipboard change
        mainWindow.webContents.send('clipboard-change', text);
      }
    },
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Listen for a message from the renderer process to hide the window
ipcMain.on('hide-window', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.hide();
  }
});
