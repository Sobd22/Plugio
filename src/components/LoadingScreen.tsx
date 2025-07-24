import React from 'react';
import '../styles/LoadingScreen.css';

const LoadingScreen: React.FC = () => {
  return (
    <div className="loading-screen">
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-frame">
            <img src="/icons/logo.svg" alt="Plugio" className="loading-logo" />
            <div className="loading-text">
              Загрузка компонентов
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
