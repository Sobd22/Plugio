import type { PluginDefinition, TabDefinition } from './types';

export class PluginRegistry {
  private static _instance: PluginRegistry;
  private plugins = new Map<string, PluginDefinition>();
  private tabs = new Map<string, TabDefinition>();
  private eventListeners = new Map<string, Function[]>();
  
  static getInstance(): PluginRegistry {
    if (!this._instance) {
      this._instance = new PluginRegistry();
    }
    return this._instance;
  }
  

  register(plugin: PluginDefinition): boolean {
    try {
      if (this.plugins.has(plugin.name)) {
        console.warn(`Plugin with name "${plugin.name}" is already registered`);
        return false;
      }
      
      this.plugins.set(plugin.name, plugin);
      
      if (plugin.tabs) {
        for (const tab of plugin.tabs) {
          this.registerTab(tab, plugin);
        }
      }
      
      console.log(`Plugin "${plugin.name}" registered successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to register plugin "${plugin.name}":`, error);
      return false;
    }
  }
  

  unregister(pluginName: string): boolean {
    try {
      const plugin = this.plugins.get(pluginName);
      if (!plugin) {
        return false;
      }
      
      if (plugin.onUnload) {
        plugin.onUnload();
      }
      
      if (plugin.tabs) {
        for (const tab of plugin.tabs) {
          this.unregisterTab(tab.id);
        }
      }
      
      this.plugins.delete(pluginName);
      
      console.log(`Plugin "${pluginName}" unregistered successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to unregister plugin "${pluginName}":`, error);
      return false;
    }
  }
  

  getPlugin(name: string): PluginDefinition | undefined {
    return this.plugins.get(name);
  }
  

  getAllPlugins(): PluginDefinition[] {
    return Array.from(this.plugins.values());
  }
  
 
  private registerTab(tab: TabDefinition, plugin: PluginDefinition): void {
    const enhancedTab = {
      ...tab,
      pluginName: plugin.name,
      pluginVersion: plugin.version
    };
    
    this.tabs.set(tab.id, enhancedTab);
    
    this.emit('tab:added', { tab: enhancedTab, plugin });
  }
  

  private unregisterTab(tabId: string): void {
    const tab = this.tabs.get(tabId);
    if (tab) {
      this.tabs.delete(tabId);
      this.emit('tab:removed', { tabId, tab });
    }
  }
  

  getTab(tabId: string): TabDefinition | undefined {
    return this.tabs.get(tabId);
  }
  

  getAllTabs(): TabDefinition[] {
    return Array.from(this.tabs.values());
  }

  addEventListener(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }
  

  removeEventListener(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  

  emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for "${event}":`, error);
        }
      }
    }
  }
  

  getStats(): { 
    totalPlugins: number;
    totalTabs: number;
    eventListeners: number;
  } {
    return {
      totalPlugins: this.plugins.size,
      totalTabs: this.tabs.size,
      eventListeners: Array.from(this.eventListeners.values())
        .reduce((sum, listeners) => sum + listeners.length, 0)
    };
  }
}
