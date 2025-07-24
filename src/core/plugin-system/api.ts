import type { PluginAPI, PluginDefinition, TabDefinition } from './types';
import { PluginRegistry } from './registry';
import { PluginPaths } from './paths';

export class PluginAPIImpl implements PluginAPI {
  private registry: PluginRegistry;
  private paths: PluginPaths;
  private plugin: PluginDefinition;
  private globalStyles = new Set<string>();
  private notifications: Array<{ message: string; type: string; id: string }> = [];
  
  constructor(plugin: PluginDefinition) {
    this.plugin = plugin;
    this.registry = PluginRegistry.getInstance();
    this.paths = PluginPaths.getInstance();
  }
  
  addTab(tab: TabDefinition): void {
    try {
      if (this.registry.getTab(tab.id)) {
        console.warn(`Tab with ID "${tab.id}" already exists`);
        return;
      }
      
      if (!this.plugin.tabs) {
        this.plugin.tabs = [];
      }
      
      this.plugin.tabs.push(tab);
      
      this.registry.emit('tab:added', { tab, plugin: this.plugin });
      
      console.log(`Tab "${tab.title}" added by plugin "${this.plugin.name}"`);
    } catch (error) {
      console.error(`Failed to add tab "${tab.id}":`, error);
    }
  }
  
  removeTab(tabId: string): void {
    try {
      if (!this.plugin.tabs) {
        return;
      }
      
      const tabIndex = this.plugin.tabs.findIndex(tab => tab.id === tabId);
      if (tabIndex === -1) {
        console.warn(`Tab with ID "${tabId}" not found in plugin "${this.plugin.name}"`);
        return;
      }
      
      const removedTab = this.plugin.tabs.splice(tabIndex, 1)[0];
      
      this.registry.emit('tab:removed', { tabId, plugin: this.plugin });
      
      console.log(`Tab "${removedTab.title}" removed by plugin "${this.plugin.name}"`);
    } catch (error) {
      console.error(`Failed to remove tab "${tabId}":`, error);
    }
  }
  
  addGlobalStyle(css: string): void {
    try {
      if (this.globalStyles.has(css)) {
        return;
      }
      
      const styleElement = document.createElement('style');
      styleElement.setAttribute('data-plugin', this.plugin.name);
      styleElement.textContent = css;
      
      document.head.appendChild(styleElement);
      
      this.globalStyles.add(css);
      
      console.log(`Global style added by plugin "${this.plugin.name}"`);
    } catch (error) {
      console.error(`Failed to add global style:`, error);
    }
  }
  
  removeGlobalStyle(css: string): void {
    try {
      if (!this.globalStyles.has(css)) {
        return;
      }
      
      const styleElements = document.querySelectorAll(`style[data-plugin="${this.plugin.name}"]`);
      
      for (const element of styleElements) {
        if (element.textContent === css) {
          element.remove();
          break;
        }
      }
      
      this.globalStyles.delete(css);
      
      console.log(`Global style removed by plugin "${this.plugin.name}"`);
    } catch (error) {
      console.error(`Failed to remove global style:`, error);
    }
  }
  
  getSetting(key: string): any {
    try {
      const storageKey = `plugin:${this.plugin.name}:${key}`;
      const value = localStorage.getItem(storageKey);
      
      if (value === null) {
        if (this.plugin.settings && this.plugin.settings[key]) {
          return this.plugin.settings[key].default;
        }
        return null;
      }
      
      return JSON.parse(value);
    } catch (error) {
      console.error(`Failed to get setting "${key}":`, error);
      return null;
    }
  }
  
  setSetting(key: string, value: any): void {
    try {
      const storageKey = `plugin:${this.plugin.name}:${key}`;
      localStorage.setItem(storageKey, JSON.stringify(value));
      
      this.registry.emit('setting:changed', {
        plugin: this.plugin.name,
        key,
        value
      });
      
      console.log(`Setting "${key}" updated by plugin "${this.plugin.name}"`);
    } catch (error) {
      console.error(`Failed to set setting "${key}":`, error);
    }
  }
  
  on(event: string, callback: Function): void {
    this.registry.addEventListener(event, callback);
  }
  
  emit(event: string, data?: any): void {
    this.registry.emit(event, data);
  }
  
  notify(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    try {
      const notification = {
        id: `${this.plugin.name}-${Date.now()}`,
        message,
        type,
        plugin: this.plugin.name,
        timestamp: new Date()
      };
      
      this.notifications.push(notification);
      
      this.registry.emit('notification:show', notification);
      
      console.log(`Notification from plugin "${this.plugin.name}": ${message}`);
    } catch (error) {
      console.error(`Failed to show notification:`, error);
    }
  }
  
  getPluginPath(): string {
    return this.plugin._pluginPath || '';
  }
  
  getAssetPath(filename: string): string {
    if (!this.plugin._pluginName) {
      return filename;
    }
    
    return this.paths.createAssetUrl(this.plugin._pluginName, filename);
  }
  
  getPluginInfo(): PluginDefinition {
    return { ...this.plugin };
  }
  
  getNotifications(): Array<{ message: string; type: string; id: string }> {
    return [...this.notifications];
  }
  
  clearNotifications(): void {
    this.notifications = [];
  }
}
