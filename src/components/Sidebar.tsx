import React from 'react';
import '../styles/Sidebar.css';

interface SidebarProps {
  activeTab: 'home' | 'settings';
  onTabChange: (tab: 'home' | 'settings') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-tabs">
        <button
          className={`tab-button ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => onTabChange('home')}
        >
          <div className="tab-icon home-icon">
            <img src="/icons/home.svg" alt="Home" />
          </div>
        </button>
        <button
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => onTabChange('settings')}
        >
          <div className="tab-icon settings-icon">
            <img src="/icons/settings.svg" alt="Settings" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
