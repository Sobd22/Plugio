const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  
  openExternal: (url) => {
    return ipcRenderer.invoke('open-external', url);
  },
  
  getPluginsPath: () => {
    const userDataPath = process.env.APPDATA || 
      (process.platform === 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME + '/.local/share');
    return userDataPath + '/plugio/plugins';
  },
  getUserDataPath: () => {
    const userDataPath = process.env.APPDATA || 
      (process.platform === 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME + '/.local/share');
    return userDataPath + '/plugio';
  },
  
  readPluginFile: (filePath) => {
    return ipcRenderer.invoke('read-plugin-file', filePath);
  },
  scanPluginsDirectory: () => {
    return ipcRenderer.invoke('scan-plugins-directory');
  }
});

contextBridge.exposeInMainWorld('platform', {
  isWindows: process.platform === 'win32',
  isMac: process.platform === 'darwin',
  isLinux: process.platform === 'linux'
});
