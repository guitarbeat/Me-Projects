
/**
 * Application Entry Point
 * 
 * Mounts the main React component (<App />) to the DOM.
 * Uses the React 18 createRoot API.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GlobalErrorBoundary } from './components';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <GlobalErrorBoundary>
    <App />
  </GlobalErrorBoundary>
);
