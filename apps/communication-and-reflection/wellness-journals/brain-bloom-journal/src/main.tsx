import ReactDOM from 'react-dom/client';
import { StrictMode, Suspense } from 'react';
import App from './App';
import ErrorBoundary from './ErrorBoundary';
import { LoadingSpinner } from './components/common/LoadingSpinner';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </StrictMode>
);

if ('serviceWorker' in navigator) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true });
  });
}
