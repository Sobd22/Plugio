const pathJoin = (...segments: string[]): string => {
  return segments
    .filter(segment => segment && segment.length > 0)
    .join('/')
    .replace(/\/+/g, '/');
};

export class PluginPaths {
  private static _instance: PluginPaths;
  
  static getInstance(): PluginPaths {
    if (!this._instance) {
      this._instance = new PluginPaths();
    }
    return this._instance;
  }
  
  getPluginsPath(): string {
    const isDev = import.meta.env.DEV;
    
    if (isDev) {
      return '/src/plugins';
    } else {
      if (window.electronAPI) {
        return window.electronAPI.getPluginsPath();
      }
      return './plugins';
    }
  }

  getAllPluginPaths(): string[] {
    const paths = [];
    const isDev = import.meta.env.DEV;
    
    if (isDev) {
      paths.push('/src/plugins');
    } else {
      paths.push('./plugins');
      
      if (window.electronAPI) {
        paths.push(window.electronAPI.getPluginsPath());
      }
    }
    
    return paths;
  }
  
 
  getPluginAssetPath(pluginName: string, assetName: string): string {
    const pluginPath = this.findPluginPath(pluginName);
    return pluginPath ? pathJoin(pluginPath, assetName) : '';
  }
  
  private findPluginPath(pluginName: string): string | null {
    const allPaths = this.getAllPluginPaths();
    
    for (const basePath of allPaths) {
      const pluginPath = pathJoin(basePath, pluginName);
      return pluginPath;
    }
    
    return null;
  }
  
  

  createAssetUrl(pluginName: string, assetName: string): string {
    const isDev = import.meta.env.DEV;
    
    if (isDev) {
      return `/src/plugins/${pluginName}/${assetName}`;
    } else {
      return `./plugins/${pluginName}/${assetName}`;
    }
  }
  

  isBuiltinPlugin(_pluginName: string): boolean {
    return true;
  }
}
