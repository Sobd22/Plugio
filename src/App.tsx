import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from './store';
import { setCurrentScreen, setLoading } from './store/appSlice';
import LoadingScreen from './components/LoadingScreen';
import MainScreen from './components/MainScreen';

function App() {
  const dispatch = useDispatch();
  const { currentScreen, isLoading } = useSelector((state: RootState) => state.app);

  useEffect(() => {
    // Проверяем хэш URL для определения экрана
    const hash = window.location.hash;
    if (hash === '#/loading') {
      dispatch(setCurrentScreen('loading'));
      dispatch(setLoading(true));
      
      // Симуляция загрузки (3 секунды)
      setTimeout(() => {
        dispatch(setLoading(false));
        dispatch(setCurrentScreen('main'));
        window.location.hash = '';
      }, 3000);
    } else {
      dispatch(setCurrentScreen('main'));
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  if (currentScreen === 'loading' || isLoading) {
    return <LoadingScreen />;
  }

  return <MainScreen />;
}

export default App;
