import React, { useState, useEffect } from 'react';
import '../styles/SettingsContent.css';

interface SettingItem {
  id: string;
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
  helpIcon?: boolean;
}

const SettingsContent: React.FC = () => {
  const [autoLaunch, setAutoLaunch] = useState(false);
  const [apiNotifications, setApiNotifications] = useState(true);

  useEffect(() => {
    const savedAutoLaunch = localStorage.getItem('settings:autoLaunch');
    const savedApiNotifications = localStorage.getItem('settings:apiNotifications');
    
    if (savedAutoLaunch !== null) {
      setAutoLaunch(JSON.parse(savedAutoLaunch));
    }
    
    if (savedApiNotifications !== null) {
      setApiNotifications(JSON.parse(savedApiNotifications));
    }
  }, []);

  const handleAutoLaunchChange = (value: boolean) => {
    setAutoLaunch(value);
    localStorage.setItem('settings:autoLaunch', JSON.stringify(value));
    console.log('Автозапуск приложения:', value ? 'включен' : 'выключен');
  };

  const handleApiNotificationsChange = (value: boolean) => {
    setApiNotifications(value);
    localStorage.setItem('settings:apiNotifications', JSON.stringify(value));
    console.log('Уведомления API:', value ? 'включены' : 'выключены');
    
    window.dispatchEvent(new CustomEvent('settings:apiNotifications:changed', {
      detail: { enabled: value }
    }));
  };

  const settings: SettingItem[] = [
    {
      id: 'autolaunch',
      label: 'Автозапуск приложения',
      description: autoLaunch ? 'Включено' : 'Выключено',
      value: autoLaunch,
      onChange: handleAutoLaunchChange,
      helpIcon: false
    },
    {
      id: 'apiNotifications',
      label: 'Уведомления API',
      description: apiNotifications ? 'Включено - уведомления от плагинов будут показываться' : 'Выключено - уведомления от плагинов будут скрыты',
      value: apiNotifications,
      onChange: handleApiNotificationsChange,
      helpIcon: false
    }
  ];

  const renderToggle = (setting: SettingItem) => (
    <div key={setting.id} className="setting-item">
      <div className="setting-info">
        <div className="setting-header">
          <span className="setting-label">{setting.label}</span>
          {setting.helpIcon && (
            <button className="help-button" title="Справка">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm1 13H7v-2h2v2zm0-3H7V5h2v5z"/>
              </svg>
            </button>
          )}
        </div>
        <div className="setting-description">{setting.description}</div>
      </div>
      <div className="setting-control">
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={setting.value}
            onChange={(e) => setting.onChange(e.target.checked)}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="settings-content">
      <div className="settings-header">
        <h1>Настройки</h1>
        <p className="settings-subtitle">Настройки приложения</p>
      </div>

      <div className="settings-section">
        <div className="settings-list">
          {settings.map(renderToggle)}
        </div>
      </div>
    </div>
  );
};

export default SettingsContent;
