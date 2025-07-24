import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { setActiveTab } from '../store/appSlice';
import TitleBar from './TitleBar';
import Sidebar from './Sidebar';
import ContentArea from './ContentArea';
import '../styles/MainScreen.css';

const MainScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { activeTab } = useSelector((state: RootState) => state.app);

  const handleTabChange = (tab: 'store' | 'plugins') => {
    dispatch(setActiveTab(tab));
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
