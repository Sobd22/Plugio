import React from 'react';
import '../styles/Sidebar.css';

interface SidebarProps {
  activeTab: 'store' | 'plugins';
  onTabChange: (tab: 'store' | 'plugins') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-tabs">
        <button
          className={`tab-button ${activeTab === 'store' ? 'active' : ''}`}
          onClick={() => onTabChange('store')}
        >
          <div className="tab-icon store-icon">
            <img src="/icons/store.svg" alt="Store" />
          </div>
        </button>
        <button
          className={`tab-button ${activeTab === 'plugins' ? 'active' : ''}`}
          onClick={() => onTabChange('plugins')}
        >
          <div className="tab-icon plugins-icon">
            <img src="/icons/plugins.svg" alt="Plugins" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
