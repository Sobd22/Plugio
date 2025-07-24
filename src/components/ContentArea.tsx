import React from 'react';
import { PluginRegistry } from '../core/plugin-system/registry';
import HomeContent from './HomeContent';
import PluginsContent from './PluginsContent';
import SettingsContent from './SettingsContent';
import '../styles/ContentArea.css';

interface ContentAreaProps {
  activeTab: string;
}

const ContentArea: React.FC<ContentAreaProps> = ({ activeTab }) => {
  const registry = PluginRegistry.getInstance();

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeContent />;
      case 'plugins':
        return <PluginsContent />;
      case 'settings':
        return <SettingsContent />;
      default:
        const pluginTab = registry.getTab(activeTab);
        if (pluginTab && pluginTab.component) {
          const Component = pluginTab.component;
          return (
            <div className="plugin-content">
              <Component />
            </div>
          );
        }
        
        return (
          <div className="error-content">
            <h2>❌ Вкладка не найдена</h2>
            <p>Вкладка "{activeTab}" не существует или плагин был отключен.</p>
          </div>
        );
    }
  };

  return (
    <div className="content-area">
      <div className="content-container">
        <div className="content-frame">
          <div className="content-inner">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentArea;
