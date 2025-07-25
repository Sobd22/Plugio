import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import './styles/index.css'
import App from './App.tsx'
import React, { useState, useEffect } from 'react'
import { definePlugin, Devs } from './core/definePlugin'

(window as any).React = React;
(window as any).PluginAPI = {
  definePlugin,
  Devs,
  useState,
  useEffect
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
