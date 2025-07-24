import React, { useState, useEffect } from 'react';
import { PluginRegistry } from '../core/plugin-system/registry';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  plugin: string;
  timestamp: Date;
}

const PluginNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const registry = PluginRegistry.getInstance();

  useEffect(() => {
    const savedApiNotifications = localStorage.getItem('settings:apiNotifications');
    if (savedApiNotifications !== null) {
      setNotificationsEnabled(JSON.parse(savedApiNotifications));
    }

    const handleNotification = (notification: Notification) => {
      const currentSetting = localStorage.getItem('settings:apiNotifications');
      const isEnabled = currentSetting ? JSON.parse(currentSetting) : true;
      
      if (!isEnabled) {
        console.log('Уведомление от плагина заблокировано настройками:', notification.message);
        return;
      }

      setNotifications(prev => [...prev, notification]);
      
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    };

    const handleSettingsChange = (event: CustomEvent) => {
      const { enabled } = event.detail;
      setNotificationsEnabled(enabled);
      
      if (!enabled) {
        setNotifications([]);
      }
    };

    registry.addEventListener('notification:show', handleNotification);
    window.addEventListener('settings:apiNotifications:changed', handleSettingsChange as EventListener);

    return () => {
      registry.removeEventListener('notification:show', handleNotification);
      window.removeEventListener('settings:apiNotifications:changed', handleSettingsChange as EventListener);
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationStyle = (type: string) => {
    const baseStyle = {
      padding: '12px 16px',
      marginBottom: '8px',
      borderRadius: '8px',
      border: '1px solid',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minWidth: '300px',
      maxWidth: '400px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      animation: 'slideIn 0.3s ease-out'
    };

    switch (type) {
      case 'success':
        return {
          ...baseStyle,
          backgroundColor: '#1f4c3a',
          borderColor: '#22c55e',
          color: '#86efac'
        };
      case 'warning':
        return {
          ...baseStyle,
          backgroundColor: '#4c3d1f',
          borderColor: '#f59e0b',
          color: '#fbbf24'
        };
      case 'error':
        return {
          ...baseStyle,
          backgroundColor: '#4c1f1f',
          borderColor: '#ef4444',
          color: '#fca5a5'
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#1f2c4c',
          borderColor: '#3b82f6',
          color: '#93c5fd'
        };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
      `}</style>
      
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        pointerEvents: 'none'
      }}>
        {notifications.map(notification => (
          <div
            key={notification.id}
            style={{
              ...getNotificationStyle(notification.type),
              pointerEvents: 'auto'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>
                {getTypeIcon(notification.type)}
              </span>
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                  {notification.message}
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  opacity: 0.7,
                  fontStyle: 'italic'
                }}>
                  от {notification.plugin}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => removeNotification(notification.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                fontSize: '16px',
                opacity: 0.7,
                marginLeft: '12px',
                padding: '4px'
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.opacity = '0.7';
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default PluginNotifications;
