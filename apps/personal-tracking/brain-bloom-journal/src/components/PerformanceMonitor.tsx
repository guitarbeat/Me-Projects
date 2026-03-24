import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
}

const MonitorContainer = styled.div<{ $visible: boolean }>`
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
  z-index: 9999;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: ${props => props.$visible ? 'block' : 'none'};
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    bundleSize: 0
  });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show in development or when explicitly enabled
    const isDev = import.meta.env.DEV;
    const isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'true';
    
    if (!isDev && !isDebugMode) return;

    const measurePerformance = () => {
      // Measure page load time
      const loadTime = performance.now();
      
      // Measure memory usage (if available)
      const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Estimate bundle size (rough calculation)
      const scripts = document.querySelectorAll('script[src]');
      let bundleSize = 0;
      scripts.forEach(script => {
        const src = script.getAttribute('src');
        if (src && src.includes('assets/')) {
          // This is a rough estimate - in reality you'd need to fetch the actual size
          bundleSize += 100; // Placeholder
        }
      });

      setMetrics({
        loadTime: Math.round(loadTime),
        renderTime: Math.round(performance.now() - loadTime),
        memoryUsage: Math.round(memoryUsage / 1024 / 1024), // Convert to MB
        bundleSize: Math.round(bundleSize)
      });
    };

    // Measure after initial render
    const timer = setTimeout(measurePerformance, 100);

    // Toggle visibility with Ctrl+Shift+P
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!visible) return null;

  return (
    <MonitorContainer $visible={visible}>
      <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#4ECDC4' }}>
        Performance Monitor
      </div>
      <MetricRow>
        <span>Load Time:</span>
        <span>{metrics.loadTime}ms</span>
      </MetricRow>
      <MetricRow>
        <span>Render Time:</span>
        <span>{metrics.renderTime}ms</span>
      </MetricRow>
      <MetricRow>
        <span>Memory:</span>
        <span>{metrics.memoryUsage}MB</span>
      </MetricRow>
      <MetricRow>
        <span>Bundle Size:</span>
        <span>~{metrics.bundleSize}KB</span>
      </MetricRow>
      <div style={{ marginTop: '8px', fontSize: '10px', color: '#888' }}>
        Press Ctrl+Shift+P to toggle
      </div>
    </MonitorContainer>
  );
};

export default PerformanceMonitor;