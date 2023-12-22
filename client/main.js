'use strict';

const { app, BrowserWindow, ipcMain, Menu, Tray, session } = require('electron');
const path = require('path');
const url = require('url');
require('dotenv').config();

app.commandLine.appendSwitch('disable-web-security');

let mainWindow;
let dev = process.env.NODE_ENV === 'development';

app.on('ready', createMainWindow);


function createMainWindow() {
  mainWindow = new BrowserWindow({
    frame: false,
    width: 400,
    height: 768,
    minHeight: 400,
    minWidth: 1000,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#2f3241',
      symbolColor: '#74b1be',
      height: 30,
    },
    trafficLightPosition: { x: 10, y: 10 },
    darkTheme: true,
    webPreferences: {
      devTools: dev,
      nodeIntegration: true,
      contextIsolation: false,
    },
    show: false,
  });

  if (dev) {
    const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');

    installExtension(REACT_DEVELOPER_TOOLS)
      .catch(err => console.log('Error loading React DevTools: ', err));

    mainWindow.webContents.openDevTools();
    
  } else {
    Menu.setApplicationMenu(null);
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
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  const mainMenu = Menu.buildFromTemplate(menuTemplate)
  Menu.setApplicationMenu(mainMenu);
  const iconPath = path.join(__dirname, './src/assets/windows-icon@2x.png');
  const tray = new Tray(iconPath);
  tray.setContextMenu(buildTrayMenu());
  tray.on('click', handleTrayClick);
}

function buildTrayMenu() {
  return Menu.buildFromTemplate([
    {
      label: "Menu",
      submenu: [
          {
              label: "Quit",
              accelerator: (() => {
                  if (process.platform === 'darwin') {
                      return 'Command+Q';
                  } else {
                      return 'Ctrl+Q';
                  }
              })(),
              click() {
                  app.quit();
              }
          }
      ]
  }
  ]);
}
const menuTemplate = [
  {
      label: "Files",
      submenu: [
          {
              label: "Quit",
              accelerator: (() => {
                  if (process.platform === 'darwin') {
                      return 'Command+Q';
                  } else {
                      return 'Ctrl+Q';
                  }
              })(),
              click() {
                  app.quit();
              }
          }
      ]
  }
]
function handleTrayClick() {
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    mainWindow.show();
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});