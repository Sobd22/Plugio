import type { PluginDefinition } from './plugin-system/types';


export function definePlugin(definition: PluginDefinition): PluginDefinition {
  if (!definition.name || typeof definition.name !== 'string') {
    throw new Error('Plugin must have a valid name');
  }
  
  if (!definition.description || typeof definition.description !== 'string') {
    throw new Error('Plugin must have a valid description');
  }
  
  if (!definition.authors || !Array.isArray(definition.authors) || definition.authors.length === 0) {
    throw new Error('Plugin must have at least one author');
  }
  
  const plugin: PluginDefinition = {
    version: '1.0.0',
    ...definition,
  };
  
  if (import.meta.env.DEV) {
    console.log(` Defining plugin: ${plugin.name} v${plugin.version}`);
    
    if (plugin.tabs) {
      console.log(` Tabs: ${plugin.tabs.map(tab => tab.title).join(', ')}`);
    }
    
    if (plugin.settings) {
      console.log(` Settings: ${Object.keys(plugin.settings).length} options`);
    }
    
    if (plugin.styles) {
      console.log(`  Has custom styles`);
    }
  }
  
  return plugin;
}

export type { 
  PluginDefinition, 
  PluginAPI as PluginAPIType, 
  TabDefinition, 
  TabIcon, 
  Author,
  SettingsDefinition,
  SettingItem
} from './plugin-system/types';

export { Devs } from './plugin-system/types';

export { PluginAPIImpl as PluginAPI } from './plugin-system/api';
export { PluginRegistry } from './plugin-system/registry';
export { PluginLoader } from './plugin-system/loader';
