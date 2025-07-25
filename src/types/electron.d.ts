export interface ElectronAPI {
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  
  getPluginsPath: () => string;
  getUserDataPath: () => string;
  readPluginFile: (filePath: string) => Promise<string | null>;
  scanPluginsDirectory: () => Promise<string[]>;
  openExternal: (url: string) => Promise<{ success: boolean; error?: string }>;
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
