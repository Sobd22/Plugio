import type { PluginDefinition } from './types';
import { PluginRegistry } from './registry';
import { PluginAPIImpl } from './api';

export class PluginLoader {
  private static _instance: PluginLoader;
  private registry: PluginRegistry;
  private loadedPlugins = new Map<string, PluginDefinition>();
  private allAvailablePlugins = new Map<string, PluginDefinition>();
  private loadingPromise: Promise<void> | null = null;
  
  static getInstance(): PluginLoader {
    if (!this._instance) {
      this._instance = new PluginLoader();
    }
    return this._instance;
  }
  
  constructor() {
    this.registry = PluginRegistry.getInstance();
  }
  

  async loadAllPlugins(): Promise<void> {
    if (this.loadingPromise) {
      console.log('⏳ Plugin loading already in progress, waiting...');
      return this.loadingPromise;
    }
    
    if (this.loadedPlugins.size > 0) {
      console.log('✅ Plugins already loaded, skipping...');
      return;
    }
    
    this.loadingPromise = this.doLoadAllPlugins();
    
    try {
      await this.loadingPromise;
    } finally {
      this.loadingPromise = null;
    }
  }
  

  private async doLoadAllPlugins(): Promise<void> {
    try {
      console.log('🔌 Starting plugin loading...');
      
      const pluginModules = import.meta.glob('/src/plugins/*/index.tsx', { eager: false });
      
      const loadPromises = Object.entries(pluginModules).map(async ([path, moduleLoader]) => {
        try {
          const pluginName = this.extractPluginNameFromPath(path);
          console.log(`📦 Loading plugin: ${pluginName}`);
          
          const module = await moduleLoader() as { default: PluginDefinition };
          const plugin = module.default;
          
          if (!plugin) {
            throw new Error(`Plugin ${pluginName} does not export default`);
          }
          
          plugin._pluginName = pluginName;
          plugin._pluginPath = path.replace('/index.tsx', '');
          
          this.allAvailablePlugins.set(plugin.name, plugin);
          
          await this.loadPlugin(plugin);
          
          console.log(`✅ Plugin loaded: ${plugin.name} (${pluginName})`);
        } catch (error) {
          console.error(`❌ Failed to load plugin from ${path}:`, error);
        }
      });
      
      await Promise.all(loadPromises);
      
      const stats = this.registry.getStats();
      console.log(`🎉 Plugin loading complete! Loaded ${stats.totalPlugins} plugins with ${stats.totalTabs} tabs`);
      
    } catch (error) {
      console.error('💥 Failed to load plugins:', error);
    }
  }
  

  async loadPlugin(plugin: PluginDefinition): Promise<boolean> {
    try {
      if (!this.validatePlugin(plugin)) {
        const pluginName = (plugin && typeof plugin === 'object' && 'name' in plugin) ? (plugin as any).name : 'unknown';
        throw new Error(`Invalid plugin structure: ${pluginName}`);
      }
      
      if (this.loadedPlugins.has(plugin.name)) {
        console.warn(`Plugin "${plugin.name}" is already loaded`);
        return false;
      }
      
      if (!this.registry.register(plugin)) {
        throw new Error(`Failed to register plugin "${plugin.name}"`);
      }
      
      const api = new PluginAPIImpl(plugin);
      
      if (plugin.styles) {
        api.addGlobalStyle(plugin.styles);
      }
      
      if (plugin.onLoad) {
        try {
          await plugin.onLoad(api);
        } catch (error) {
          console.error(`Error in onLoad for plugin "${plugin.name}":`, error);
        }
      }
      
      this.loadedPlugins.set(plugin.name, plugin);
      
      this.registry.emit('plugin:loaded', { plugin, api });
      
      return true;
      
    } catch (error) {
      console.error(`Failed to load plugin "${plugin.name}":`, error);
      return false;
    }
  }
  
 
  async unloadPlugin(pluginName: string): Promise<boolean> {
    try {
      const plugin = this.loadedPlugins.get(pluginName);
      if (!plugin) {
        console.warn(`Plugin "${pluginName}" is not loaded`);
        return false;
      }
      
      if (plugin.onUnload) {
        try {
          await plugin.onUnload();
        } catch (error) {
          console.error(`Error in onUnload for plugin "${pluginName}":`, error);
        }
      }
      
      const styleElements = document.querySelectorAll(`style[data-plugin="${pluginName}"]`);
      for (const element of styleElements) {
        element.remove();
      }
      
      this.registry.unregister(pluginName);
      
      this.loadedPlugins.delete(pluginName);
      
      this.registry.emit('plugin:unloaded', { pluginName });
      
      console.log(`🗑️ Plugin "${pluginName}" unloaded successfully`);
      return true;
      
    } catch (error) {
      console.error(`Failed to unload plugin "${pluginName}":`, error);
      return false;
    }
  }
  

  async reloadPlugin(pluginName: string): Promise<boolean> {
    const wasLoaded = this.loadedPlugins.has(pluginName);
    
    if (wasLoaded) {
      await this.unloadPlugin(pluginName);
    }
    
    if (import.meta.env.DEV) {
      try {
        const modulePath = `/src/plugins/${pluginName}/index.tsx`;
        delete (window as any).__vite_module_cache?.[modulePath];
        
        const moduleLoader = import.meta.glob('/src/plugins/*/index.tsx', { eager: false })[modulePath];
        if (moduleLoader) {
          const module = await moduleLoader() as { default: PluginDefinition };
          const plugin = module.default;
          
          plugin._pluginName = pluginName;
          plugin._pluginPath = `/src/plugins/${pluginName}`;
          
          return await this.loadPlugin(plugin);
        }
      } catch (error) {
        console.error(`Failed to reload plugin "${pluginName}":`, error);
      }
    }
    
    return false;
  }

  getLoadedPlugins(): PluginDefinition[] {
    return Array.from(this.loadedPlugins.values());
  }
  

  getAllAvailablePlugins(): PluginDefinition[] {
    return Array.from(this.allAvailablePlugins.values());
  }
  
 
  isPluginLoaded(pluginName: string): boolean {
    return this.loadedPlugins.has(pluginName);
  }
  

  private validatePlugin(plugin: any): plugin is PluginDefinition {
    if (!plugin || typeof plugin !== 'object') {
      return false;
    }
    
    if (typeof plugin.name !== 'string' || plugin.name.trim() === '') {
      console.error('Plugin must have a non-empty name');
      return false;
    }
    
    if (typeof plugin.description !== 'string') {
      console.error('Plugin must have a description');
      return false;
    }
    
    if (!Array.isArray(plugin.authors) || plugin.authors.length === 0) {
      console.error('Plugin must have at least one author');
      return false;
    }
    
    for (const author of plugin.authors) {
      if (!author || typeof author.name !== 'string') {
        console.error('Each author must have a name');
        return false;
      }
    }
    
    if (plugin.tabs) {
      if (!Array.isArray(plugin.tabs)) {
        console.error('Plugin tabs must be an array');
        return false;
      }
      
      for (const tab of plugin.tabs) {
        if (!tab.id || !tab.title || !tab.component) {
          console.error('Each tab must have id, title, and component');
          return false;
        }
      }
    }
    
    return true;
  }
  

  private extractPluginNameFromPath(path: string): string {
    const matches = path.match(/\/src\/plugins\/([^\/]+)\/index\.tsx$/);
    return matches ? matches[1] : 'unknown';
  }

  getStats() {
    return {
      loadedPlugins: this.loadedPlugins.size,
      registryStats: this.registry.getStats()
    };
  }
}
