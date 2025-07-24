import type React from 'react';

// Base interfaces
export interface Author {
  name: string;
  id?: bigint;
}

export interface TabIcon {
  type: 'svg' | 'url' | 'emoji';
  content: string;
  size?: number;
}

export interface TabDefinition {
  id: string;
  title: string;
  icon?: TabIcon;
  component: React.ComponentType<any>;
}

export interface SettingsDefinition {
  [key: string]: SettingItem;
}

export interface SettingItem {
  type: 'string' | 'number' | 'boolean' | 'select';
  default: any;
  label: string;
  description?: string;
  options?: Array<{ label: string; value: any }>;
}

// Plugin API interface
export interface PluginAPI {
  addTab: (tab: TabDefinition) => void;
  removeTab: (tabId: string) => void;
  addGlobalStyle: (css: string) => void;
  removeGlobalStyle: (css: string) => void;
  getSetting: (key: string) => any;
  setSetting: (key: string, value: any) => void;
  on: (event: string, callback: Function) => void;
  emit: (event: string, data?: any) => void;
  notify: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  getPluginPath: () => string;
  getAssetPath: (filename: string) => string;
}

// Main plugin definition
export interface PluginDefinition {
  name: string;
  description: string;
  version?: string;
  authors: Author[];
  onLoad?: (api: PluginAPI) => void;
  onUnload?: () => void;
  tabs?: TabDefinition[];
  settings?: SettingsDefinition;
  styles?: string;
  _pluginPath?: string;
  _pluginName?: string;
}

export interface PluginContext {
  api: PluginAPI;
  plugin: PluginDefinition;
}

// Developer constants
export const Devs = {
  Plugio: { name: "Plugio Team", id: 1n },
  Community: { name: "Community", id: 2n },
} as const;
