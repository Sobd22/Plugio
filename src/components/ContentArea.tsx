import React from 'react';
import '../styles/ContentArea.css';

interface ContentAreaProps {
  activeTab: 'store' | 'plugins';
}

const ContentArea: React.FC<ContentAreaProps> = ({ activeTab }) => {
  return (
    <div className="content-area">
      <div className="content-container">
        <div className="content-frame">
          <div className="content-inner">
            {activeTab === 'store' ? (
              <div className="store-content">
                <h2>Магазин плагинов</h2>
                <p>Здесь будет отображаться список доступных плагинов для установки.</p>
              </div>
            ) : (
              <div className="plugins-content">
                <h2>Установленные плагины</h2>
                <p>Здесь будет отображаться список установленных плагинов.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentArea;
