import React from 'react';
import '../styles/TitleBar.css';

const TitleBar: React.FC = () => {
  const handleMinimize = () => {
    if (window.electronAPI) {
      window.electronAPI.minimizeWindow();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI) {
      window.electronAPI.maximizeWindow();
    }
  };

  const handleClose = () => {
    if (window.electronAPI) {
      window.electronAPI.closeWindow();
    }
  };

  return (
    <div className="title-bar">
      <div className="title-bar-content">
        <div className="title-bar-left">
          <div className="app-title">
            <span className="title-plug">Plug</span>
            <span className="title-io">io</span>
          </div>
        </div>
        <div className="title-bar-right">
          <div className="window-controls">
            
            <button className="control-button minimize" onClick={handleMinimize}>
              <img src="/icons/hide.svg" alt="Plugio" className="control-button minimize" />
            </button>
            <button className="control-button maximize" onClick={handleMaximize}>
              <img src="/icons/minimaze.svg" alt="Plugio" className="control-button minimize" />
            </button>
            <button className="control-button close" onClick={handleClose}>
              <img src="/icons/close.svg" alt="Plugio" className="control-button close" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TitleBar;
