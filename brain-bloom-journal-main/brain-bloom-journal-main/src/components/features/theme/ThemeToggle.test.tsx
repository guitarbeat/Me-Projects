import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './ThemeToggle';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { TooltipProvider } from '@/components/ui';

// Mock the icons
jest.mock('@/lib/icons/icon-imports', () => ({
  Moon: () => <span data-testid="moon-icon" />,
  Sun: () => <span data-testid="sun-icon" />,
  Monitor: () => <span data-testid="monitor-icon" />,
  Check: () => <span data-testid="check-icon" />,
  ChevronRight: () => <span data-testid="chevron-right-icon" />,
  Circle: () => <span data-testid="circle-icon" />,
  Newspaper: () => <span data-testid="newspaper-icon" />,
}));

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock pointer capture methods
Element.prototype.setPointerCapture = () => {};
Element.prototype.releasePointerCapture = () => {};

describe('ThemeToggle', () => {
  it('renders correctly', () => {
    render(
      <ThemeProvider>
        <TooltipProvider>
          <ThemeToggle />
        </TooltipProvider>
      </ThemeProvider>
    );
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
  });

  it('shows checkmark for active theme', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <TooltipProvider>
          <ThemeToggle />
        </TooltipProvider>
      </ThemeProvider>
    );

    // Open dropdown
    const trigger = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(trigger);

    // Wait for dropdown to open and verify checkmark exists
    await waitFor(() => {
        expect(screen.getByText('Light')).toBeInTheDocument();
    });

    // Verify Check icon is present
    expect(screen.getByTestId('check-icon')).toBeInTheDocument();
  });

  it('shows tooltip on hover', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <TooltipProvider>
          <ThemeToggle />
        </TooltipProvider>
      </ThemeProvider>
    );

    const trigger = screen.getByRole('button', { name: /toggle theme/i });
    await user.hover(trigger);

    // Wait for tooltip to appear
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('Toggle theme');
    });
  });
});
