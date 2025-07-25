const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development' || process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath);

const getResourcePath = () => {
  if (isDev) {
    return path.join(__dirname, '..');
  } else {
    return path.join(__dirname, '..', '..');
  }
};


let mainWindow;

function ensurePluginsDirectory() {
  try {
    const userDataPath = app.getPath('userData');
    const pluginsPath = path.join(userDataPath, 'plugins');
    
    if (!fs.existsSync(pluginsPath)) {
      fs.mkdirSync(pluginsPath, { recursive: true });
      
    }
  } catch (error) {
    console.error('Failed to create plugins directory:', error);
  }
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
    const htmlPath = path.join(__dirname, '..', 'dist', 'index.html');
    mainWindow.loadFile(htmlPath);
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

ipcMain.handle('read-plugin-file', async (event, filePath) => {
  try {
    const pluginsPath = path.join(app.getPath('userData'), 'plugins');
    const normalizedPath = path.normalize(filePath);
    
    if (!normalizedPath.startsWith(pluginsPath)) {
      throw new Error('Access denied: file is outside plugins directory');
    }
    
    const content = await fs.promises.readFile(normalizedPath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Failed to read plugin file:', error);
    return null;
  }
});

ipcMain.handle('scan-plugins-directory', async () => {
  try {
    const pluginsPath = path.join(app.getPath('userData'), 'plugins');
    
    if (!fs.existsSync(pluginsPath)) {
      return [];
    }
    
    const files = await fs.promises.readdir(pluginsPath, { recursive: true });
    const pluginFiles = files.filter(file => 
      file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')
    ).map(file => path.join(pluginsPath, file));
    
    return pluginFiles;
  } catch (error) {
    console.error('Failed to scan plugins directory:', error);
    return [];
  }
});

app.whenReady().then(() => {
  ensurePluginsDirectory();
  
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
