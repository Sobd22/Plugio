const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV !== 'production';

let mainWindow;
let loadingWindow;

function ensurePluginsDirectory() {
  try {
    const userDataPath = app.getPath('userData');
    const pluginsPath = path.join(userDataPath, 'plugins');
    
    if (!fs.existsSync(pluginsPath)) {
      fs.mkdirSync(pluginsPath, { recursive: true });
      console.log(`Created plugins directory: ${pluginsPath}`);
    }
  } catch (error) {
    console.error('Failed to create plugins directory:', error);
  }
}

function createLoadingWindow() {
  loadingWindow = new BrowserWindow({
    width: 1170,
    height: 617,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    backgroundColor: '#16181E',
    show: false
  });

  if (isDev) {
    loadingWindow.loadURL('http://localhost:5173/#/loading');
  } else {
    loadingWindow.loadFile(path.join(__dirname, '../dist/index.html'), { hash: 'loading' });
  }

  loadingWindow.once('ready-to-show', () => {
    loadingWindow.show();
    
    setTimeout(() => {
      createMainWindow();
      loadingWindow.close();
    }, 3000);
  });

  loadingWindow.on('closed', () => {
    loadingWindow = null;
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1170,
    height: 617,
    frame: false,
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    backgroundColor: '#16181E',
    show: false
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

ipcMain.on('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.handle('open-external', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    console.error('Failed to open external URL:', error);
    return { success: false, error: error.message };
  }
});

app.whenReady().then(() => {
  ensurePluginsDirectory();
  
  createLoadingWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createLoadingWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
