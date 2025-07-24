import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { setActiveTab } from '../store/appSlice';
import { PluginLoader } from '../core/plugin-system/loader';
import { PluginRegistry } from '../core/plugin-system/registry';
import TitleBar from './TitleBar';
import Sidebar from './Sidebar';
import ContentArea from './ContentArea';
import '../styles/MainScreen.css';

const MainScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { activeTab } = useSelector((state: RootState) => state.app);

  useEffect(() => {
    const loadPlugins = async () => {
      const loader = PluginLoader.getInstance();
      await loader.loadAllPlugins();
    };

    loadPlugins();

    const handleTabRemoved = (data: any) => {
      const { tabId } = data;
      if (activeTab === tabId) {
        console.log(`\ud83d\udd04 Switching to home tab because ${tabId} was removed`);
        dispatch(setActiveTab('home'));
      }
    };

    const registryInstance = PluginRegistry.getInstance();
    registryInstance.addEventListener('tab:removed', handleTabRemoved);

    return () => {
      registryInstance.removeEventListener('tab:removed', handleTabRemoved);
    };
  }, [activeTab, dispatch]);

  const handleTabChange = (tab: string) => {
    dispatch(setActiveTab(tab as any));
  };

  return (
    <div className="main-screen">
      <TitleBar />
      <div className="main-content">
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
        <ContentArea activeTab={activeTab} />
      </div>
    </div>
  );
};

export default MainScreen;
