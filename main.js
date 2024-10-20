// File: main.js
const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');
const clipboardWatcher = require('electron-clipboard-watcher');

let mainWindow;
let lastClipboardText = '';

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
  // Change the position to top right
  mainWindow.setPosition(width - 380, 20);

  mainWindow.once('ready-to-show', () => {
    mainWindow.showInactive(); // Show the window without focusing it
  });

  // Add error handling for window loading
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load window:', errorDescription);
    app.quit();
  });
}

app.whenReady().then(() => {
  createWindow();

  clipboardWatcher({
    watchDelay: 100,
    onTextChange: (text) => {
      if (mainWindow && !mainWindow.isDestroyed() && text !== lastClipboardText) {
        lastClipboardText = text;
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

// Add a global error handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  app.quit();
});
