/**
 * Application Entry Point
 * 
 * Mounts the main React component (<App />) to the DOM.
 * Uses the React 18 createRoot API.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class GlobalErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };
  readonly props!: Readonly<ErrorBoundaryProps>;

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: any): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Global Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding: 40, color: '#d8c8b8', background: '#141110', height: '100vh', fontFamily: 'monospace', overflow: 'auto'}}>
          <h1 style={{fontSize: '24px', marginBottom: '20px', color: '#d13a34'}}>Application Error</h1>
          <pre style={{whiteSpace: 'pre-wrap', background: '#1c1817', padding: '20px', borderRadius: '8px', border: '1px solid #38312e'}}>
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <GlobalErrorBoundary>
    <App />
  </GlobalErrorBoundary>
);