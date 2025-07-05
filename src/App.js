// src/App.jsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import AppContent from './AppContent';
import ToastProvider from './context/ToastContext';
import { UnsavedProvider } from './context/UnsavedContext'; // <-- добавляем
import './styles/global.css';

const App = () => {
  return (
    <ToastProvider>
      <UnsavedProvider> {/* <-- Оборачиваем всё в UnsavedProvider */}
        <Router>
          <div style={{ display: 'flex' }}>
            <Sidebar />
            <AppContent />
          </div>
        </Router>
      </UnsavedProvider>
    </ToastProvider>
  );
};

export default App;
