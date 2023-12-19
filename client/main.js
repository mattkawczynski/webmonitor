'use strict'

const { app, BrowserWindow, ipcMain, Menu, Tray, session } = require('electron');
const path = require('path')
const url = require('url')
require('dotenv').config();
app.commandLine.appendSwitch('disable-web-security')

let mainWindow;
let dev = false;

if (process.env.NODE_ENV !== undefined && process.env.NODE_ENV === 'development') {
  dev = true
}

app.on('ready', createMainWindow)
function createMainWindow() {
  mainWindow = new BrowserWindow({
    //backgroundColor: '#2e2c29',
    width: 400,
    height: 768,
    //frame: false,
    //titleBarStyle: 'hiddenInset',
    titleBarOverlay: {
        color: '#2f3241',
        symbolColor: '#74b1be',
        height: 30,
    },
    trafficLightPosition: { x: 10, y: 10 },
    darkTheme: true,
    webPreferences: {
        devTools: true,
        nodeIntegration: true , 
        contextIsolation: false
    },
    show: false
  });
  
  if (dev) {
    const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer')

    installExtension(REACT_DEVELOPER_TOOLS)
      .catch(err => console.log('Error loading React DevTools: ', err))
    mainWindow.webContents.openDevTools()
  }
  // and load the index.html of the app.
  let indexPath
  
  if (dev && process.argv.indexOf('--noDevServer') === -1) {
    indexPath = url.format({
      protocol: 'http:',
      host: 'localhost:8080',
      pathname: 'index.html',
      slashes: true
    })
  } else {
    indexPath = url.format({
      protocol: 'file:',
      pathname: path.join(__dirname, 'dist', 'index.html'),
      slashes: true
    })
  }

  mainWindow.loadURL(indexPath)
  mainWindow.maximize()

  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('closed', function() {
    mainWindow = null
  })

  const iconPath = path.join(__dirname, './src/assets/windows-icon@2x.png');
  const tray = new Tray(iconPath)
  tray.setContextMenu(buildTrayMenu());
  tray.on('click', handleTrayClick);
}

function buildTrayMenu() {
  return Menu.buildFromTemplate([
    {
      label: 'Close',
      click: () => {
        mainWindow.close();
      }
    }
  ]);
}

function handleTrayClick(event, bounds) {
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    mainWindow.show();
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})