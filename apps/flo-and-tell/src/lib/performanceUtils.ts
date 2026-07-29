// Performance monitoring and optimization utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Measure component render time
  startMeasure(name: string): void {
    this.metrics.set(name, performance.now());
  }

  endMeasure(name: string): number {
    const startTime = this.metrics.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.metrics.delete(name);
      return duration;
    }
    return 0;
  }

  // Monitor Core Web Vitals (silent in production)
  measureWebVitals(): void {
    if (!import.meta.env.DEV) {
      return;
    }

    if ('web-vital' in window) {
      new PerformanceObserver(() => {
        // LCP metric available in dev tools
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    }

    // First Input Delay would be measured here in production
    // Layout Shift would be measured here in production
  }
}
