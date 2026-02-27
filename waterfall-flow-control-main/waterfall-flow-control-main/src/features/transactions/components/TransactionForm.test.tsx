import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionForm } from './TransactionForm';
import { TooltipProvider } from '@/components/ui/tooltip';
import { vi } from 'vitest';

// Mock the hook
vi.mock('@/hooks/useMobile', () => ({
  useIsMobile: () => false,
}));

// Mock the form fields to simplify testing
vi.mock('./TransactionFormFields', () => ({
  TransactionFormFields: ({ formData, onChange }: any) => (
    <div data-testid="form-fields">
      <input
        aria-label="Name"
        value={formData.name}
        onChange={e => onChange({ ...formData, name: e.target.value })}
      />
      <input
        aria-label="Person"
        value={formData.person}
        onChange={e => onChange({ ...formData, person: e.target.value })}
      />
      <input
        aria-label="Inflow"
        value={formData.inflow}
        onChange={e => onChange({ ...formData, inflow: e.target.value })}
      />
    </div>
  ),
}));

describe('TransactionForm', () => {
  const mockOnAdd = vi.fn();

  beforeEach(() => {
    mockOnAdd.mockClear();
  });

  const renderComponent = () => {
    return render(
      <TooltipProvider>
        <TransactionForm onAdd={mockOnAdd} open={true} />
      </TooltipProvider>
    );
  };

  it('initially has a disabled submit button', () => {
    renderComponent();

    // We target the button by its text content "Add Transaction"
    const submitButton = screen.getByRole('button', {
      name: /add transaction/i,
    });
    expect(submitButton).toBeDisabled();
  });

  it('enables the submit button when form is valid', () => {
    renderComponent();

    const nameInput = screen.getByLabelText('Name');
    const personInput = screen.getByLabelText('Person');
    const inflowInput = screen.getByLabelText('Inflow');

    fireEvent.change(nameInput, { target: { value: 'Test Transaction' } });
    fireEvent.change(personInput, { target: { value: 'Me' } });
    fireEvent.change(inflowInput, { target: { value: '100' } });

    const submitButton = screen.getByRole('button', {
      name: /add transaction/i,
    });
    expect(submitButton).not.toBeDisabled();
  });

  it('renders tooltip for disabled button (existence check)', async () => {
    renderComponent();

    const submitButton = screen.getByRole('button', {
      name: /add transaction/i,
    });
    expect(submitButton).toBeDisabled();

    // Trigger focus on the wrapper to trigger tooltip mount
    const wrapper = submitButton.parentElement;
    fireEvent.focus(wrapper!);

    // Check for tooltip content existence.
    // We use findAllByText because Radix might duplicate text for accessibility,
    // and we stick to { exact: false } to be flexible.
    const tooltipTexts = await screen.findAllByText(
      /Please enter a name, person, and an amount/i
    );
    expect(tooltipTexts.length).toBeGreaterThan(0);
  });
});
