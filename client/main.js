'use strict';

const { app, BrowserWindow, ipcMain, Menu, Tray, dialog } = require('electron');
const url = require('url');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const configPath = path.join(app.getPath('userData'), 'config.json');
const encryptionKey = 'd94kcj27xnamdi20ldkqux763hd6zkfm4nc7382k'; // Replace with a secure key

function encrypt(text) {
  const cipher = crypto.createCipher('aes-256-cbc', encryptionKey);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(encrypted) {
  const decipher = crypto.createDecipher('aes-256-cbc', encryptionKey);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

ipcMain.handle('get-config', () => {
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath));
    return {
      serverUrl: config.serverUrl,
      authToken: decrypt(config.authToken),
    };
  }
  return null;
});

ipcMain.on('save-config', (_, config) => {
  const encryptedConfig = {
    serverUrl: config.serverUrl,
    authToken: encrypt(config.authToken),
  };
  fs.writeFileSync(configPath, JSON.stringify(encryptedConfig));
});

app.setName('WebMonitoring Service');
app.commandLine.appendSwitch('disable-web-security');

let mainWindow;
let tray;
let dev = process.env.NODE_ENV === 'development';

function createMainWindow() {
  mainWindow = new BrowserWindow({
    frame: false,
    width: 1000,
    height: 768,
    minHeight: 400,
    minWidth: 1000,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#2f3241',
      symbolColor: '#74b1be',
      height: 30,
    },
    darkTheme: true,
    webPreferences: {
      devTools: true,
      nodeIntegration: true,
      contextIsolation: false,
    },
    show: false,
  });
  if (dev) {
    const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');
    installExtension(REACT_DEVELOPER_TOOLS)
      .catch((err) => console.log('Error loading React DevTools:', err));
    mainWindow.webContents.openDevTools();
  }

  const indexPath = dev
    ? url.format({
      protocol: 'http:',
      host: 'localhost:8080',
      pathname: 'index.html',
      slashes: true,
    })
    : url.format({
      protocol: 'file:',
      pathname: path.join(__dirname, 'dist', 'index.html'),
      slashes: true,
    });

  mainWindow.loadURL(indexPath);
  mainWindow.maximize();

  mainWindow.on('close', (event) => {
    if (process.platform === 'darwin') {
      event.preventDefault();
      mainWindow.hide();
    } else {
      mainWindow = null;
      app.quit();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  tray = new Tray(path.join(__dirname, './src/assets/windows-icon@2x.png'));
  tray.setContextMenu(buildTrayMenu());
  tray.on('click', handleTrayClick);

  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(__dirname, './src/assets/icon.png'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

function buildTrayMenu() {
  return Menu.buildFromTemplate([
    {
      label: 'Quit',
      click: () => app.quit(),
    },
  ]);
}

function handleTrayClick() {
  if (mainWindow) {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  }
}

app.on('ready', () => {
  Menu.setApplicationMenu(null); // Remove default menu
  createMainWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
