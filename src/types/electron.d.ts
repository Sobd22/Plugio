export interface ElectronAPI {
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  
  // Поддержка плагинов
  getPluginsPath: () => string;
  getUserDataPath: () => string;
}

export interface Platform {
  isWindows: boolean;
  isMac: boolean;
  isLinux: boolean;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    platform: Platform;
  }
}
