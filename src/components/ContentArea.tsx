import React from 'react';
import '../styles/ContentArea.css';

interface ContentAreaProps {
  activeTab: 'home' | 'settings';
}

const ContentArea: React.FC<ContentAreaProps> = ({ activeTab }) => {
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="home-content">
            <h2>Главная</h2>
            <p>Добро пожаловать в Plugio! Здесь вы можете управлять своими плагинами.</p>
          </div>
        );
      case 'settings':
        return (
          <div className="settings-content">
            <h2>Настройки</h2>
            <p>Здесь вы можете настроить параметры приложения.</p>
          </div>
        );
      default:
        return null;
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
