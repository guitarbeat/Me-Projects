import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import { InstallPage } from './pages/Install.tsx';
import './index.css';
import { setupGlobalErrorHandling } from '@/lib/errorTracking';

setupGlobalErrorHandling();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <BrowserRouter>
    <Routes>
      <Route path="/install" element={<InstallPage />} />
      <Route path="/*" element={<App />} />
    </Routes>
  </BrowserRouter>
);
