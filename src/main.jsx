import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// 1. استيراد الراوتر
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. الراوتر لازم يكون أول حاجة هنا */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);