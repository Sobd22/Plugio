import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  isLoading: boolean;
  currentScreen: 'loading' | 'main';
  theme: 'dark';
  activeTab: 'home' | 'settings';
}

const initialState: AppState = {
  isLoading: true,
  currentScreen: 'loading',
  theme: 'dark',
  activeTab: 'home',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setCurrentScreen: (state, action: PayloadAction<'loading' | 'main'>) => {
      state.currentScreen = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<'home' | 'settings'>) => {
      state.activeTab = action.payload;
    },
  },
});

export const { setLoading, setCurrentScreen, setActiveTab } = appSlice.actions;
export default appSlice.reducer;
