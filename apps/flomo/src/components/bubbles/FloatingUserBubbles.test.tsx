import { render, screen, act, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { FloatingUserBubbles } from './FloatingUserBubbles';
import { TooltipProvider } from '@/components/ui/tooltip';

describe('FloatingUserBubbles', () => {
  beforeEach(() => {
    // Stub requestAnimationFrame
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      return setTimeout(callback, 16);
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => {
      clearTimeout(id);
    });

    // Mock ResizeObserver
    global.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    // Mock IntersectionObserver
    global.IntersectionObserver = class IntersectionObserver {
      constructoredCallback: (entries: IntersectionObserverEntry[]) => void;

      constructor(callback: (entries: IntersectionObserverEntry[]) => void) {
        this.constructoredCallback = callback;
      }

      observe() {
        // Simulate intersection immediately
        this.constructoredCallback([
          { isIntersecting: true } as IntersectionObserverEntry,
        ]);
      }
      unobserve() {}
      disconnect() {}
    } as any;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const sampleProfiles = [
    {
      id: '1',
      username: 'user1',
      display_name: 'User One',
      avatar_url: null,
    },
  ];

  it('renders without crashing when window is undefined', () => {
    const originalWindow = globalThis.window;

    try {
      (globalThis as Record<string, unknown>).window = undefined;

      expect(() => {
        renderToString(
          <MemoryRouter>
            <FloatingUserBubbles userProfiles={sampleProfiles} />
          </MemoryRouter>
        );
      }).not.toThrow();
    } finally {
      (globalThis as Record<string, unknown>).window = originalWindow;
    }
  });

  it('renders bubbles and updates position via animation loop', async () => {
    // Mock getBoundingClientRect
    const originalGetBoundingClientRect =
      Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 800,
      height: 600,
      top: 0,
      left: 0,
      bottom: 600,
      right: 800,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));

    render(
      <TooltipProvider>
        <FloatingUserBubbles userProfiles={sampleProfiles} />
      </TooltipProvider>
    );

    // Initial render might have 0 size if effect hasn't run or mocked rect wasn't ready
    // But we mocked it before render.
    // Trigger resize just in case to force update
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    const bubble = await screen.findByLabelText('Select User One');
    expect(bubble).toBeInTheDocument();

    const initialTransform = bubble.style.transform;
    expect(initialTransform).toContain('translate3d');

    // Wait for transform to change (animation loop running)
    // We use waitFor with a condition
    await waitFor(
      () => {
        const currentTransform = bubble.style.transform;
        expect(currentTransform).not.toBe(initialTransform);
      },
      { timeout: 2000 }
    );

    // Restore
    Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });
});
