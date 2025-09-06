
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// Register custom scenes/effects

// Import registration modules to auto-register custom scenes, effects, actions
import './components/custom/registerScene';
import './components/custom/registerEffect';
import './components/custom/registerAction';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

