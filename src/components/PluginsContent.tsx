import React, { useState, useEffect } from 'react';
import { PluginRegistry } from '../core/plugin-system/registry';
import { PluginLoader } from '../core/plugin-system/loader';
import type { PluginDefinition } from '../core/plugin-system/types';
import '../styles/PluginsContent.css';

interface PluginCardProps {
  plugin: PluginDefinition;
  isEnabled: boolean;
  onToggle: (pluginName: string, enabled: boolean) => void;
}

const PluginCard: React.FC<PluginCardProps> = ({ plugin, isEnabled, onToggle }) => {
  const handleToggle = () => {
    onToggle(plugin.name, !isEnabled);
  };

  return (
    <div className="plugin-card">
      <div className="plugin-info">
        <div className="plugin-header">
          <div className="plugin-title-section">
            <h3 className="plugin-name">{plugin.name}</h3>
            <span className="plugin-version">v{plugin.version || '1.0.0'}</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={handleToggle}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <p className="plugin-description">{plugin.description}</p>
        <div className="plugin-authors">
          {plugin.authors.map(author => author.name).join(', ')}
        </div>
        {plugin.tabs && plugin.tabs.length > 0 && (
          <div className="plugin-features">
            <span className="feature-badge">
              {plugin.tabs.length} вкладк{plugin.tabs.length === 1 ? 'а' : plugin.tabs.length < 5 ? 'и' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const PluginsContent: React.FC = () => {
  const [plugins, setPlugins] = useState<PluginDefinition[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [enabledPlugins, setEnabledPlugins] = useState<Set<string>>(new Set());
  
  const registry = PluginRegistry.getInstance();
  const loader = PluginLoader.getInstance();

  useEffect(() => {
    const updatePlugins = () => {
      const allPlugins = loader.getAllAvailablePlugins();
      setPlugins(allPlugins);
      
      const loadedPlugins = loader.getLoadedPlugins();
      const enabledSet = new Set(loadedPlugins.map(p => p.name));
      setEnabledPlugins(enabledSet);
    };

    updatePlugins();

    const handlePluginChange = () => updatePlugins();
    registry.addEventListener('plugin:loaded', handlePluginChange);
    registry.addEventListener('plugin:unloaded', handlePluginChange);

    return () => {
      registry.removeEventListener('plugin:loaded', handlePluginChange);
      registry.removeEventListener('plugin:unloaded', handlePluginChange);
    };
  }, []);

  const handlePluginToggle = async (pluginName: string, enabled: boolean) => {
    if (enabled) {
      const plugin = plugins.find(p => p.name === pluginName);
      if (plugin) {
        const success = await loader.loadPlugin(plugin);
        if (success) {
          setEnabledPlugins(prev => new Set(prev).add(pluginName));
        }
      }
    } else {
      const success = await loader.unloadPlugin(pluginName);
      if (success) {
        setEnabledPlugins(prev => {
          const newSet = new Set(prev);
          newSet.delete(pluginName);
          return newSet;
        });
      }
    }
  };

  const filteredPlugins = plugins.filter(plugin =>
    plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.authors.some(author => author.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const enabledCount = enabledPlugins.size;
  const totalCount = plugins.length;

  return (
    <div className="plugins-content">
      <div className="plugins-header">
        <div className="plugins-title-section">
          <h1>Плагины</h1>
          <div className="plugins-stats">
            <span className="stat-item">
              <span className="stat-number">{enabledCount}</span>
              <span className="stat-label">включено</span>
            </span>
            <span className="stat-divider">•</span>
            <span className="stat-item">
              <span className="stat-number">{totalCount}</span>
              <span className="stat-label">всего</span>
            </span>
          </div>
        </div>
        
        <div className="plugins-search">
          <input
            type="text"
            placeholder="Поиск плагинов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="plugins-list">
        {filteredPlugins.length === 0 ? (
          <div className="no-plugins">
            {searchQuery ? (
              <>
                <h3>Плагины не найдены</h3>
                <p>Попробуйте изменить поисковый запрос</p>
              </>
            ) : (
              <>
                <h3>Нет плагинов</h3>
                <p>Плагины не обнаружены в системе</p>
              </>
            )}
          </div>
        ) : (
          filteredPlugins.map(plugin => (
            <PluginCard
              key={plugin.name}
              plugin={plugin}
              isEnabled={enabledPlugins.has(plugin.name)}
              onToggle={handlePluginToggle}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default PluginsContent;
