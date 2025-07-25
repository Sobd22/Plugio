import React, { useEffect, useState } from 'react';
import { PluginRegistry } from '../core/plugin-system/registry';
import type { TabDefinition } from '../core/plugin-system/types';
import { TabIcon } from './TabIcon';
import { getIconPath } from '../utils/paths';
import '../styles/Sidebar.css';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const [pluginTabs, setPluginTabs] = useState<TabDefinition[]>([]);
  const registry = PluginRegistry.getInstance();

  useEffect(() => {
    const updateTabs = () => {
      const tabs = registry.getAllTabs();
      setPluginTabs(tabs);
    };

    updateTabs();

    const handleTabAdded = (_data: any) => {
      updateTabs();
    };
    const handleTabRemoved = (_data: any) => {
      updateTabs();
    };

    registry.addEventListener('tab:added', handleTabAdded);
    registry.addEventListener('tab:removed', handleTabRemoved);

    return () => {
      registry.removeEventListener('tab:added', handleTabAdded);
      registry.removeEventListener('tab:removed', handleTabRemoved);
    };
  }, []);

  const builtinTabs = [
    {
      id: 'home',
      title: 'Главная',
      icon: { type: 'url' as const, content: getIconPath('home.svg'), size: 16 }
    },
    {
      id: 'plugins',
      title: 'Плагины',
      icon: { type: 'url' as const, content: getIconPath('exstn.svg'), size: 16 }
    },
    {
      id: 'settings',
      title: 'Настройки',
      icon: { type: 'url' as const, content: getIconPath('settings.svg'), size: 16 }
    }
  ];

  const allTabs = [...builtinTabs, ...pluginTabs];

  return (
    <div className="sidebar">
      <div className="sidebar-tabs">
        {allTabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            title={tab.title}
          >
            <div className="tab-icon">
              <TabIcon icon={tab.icon} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
