import { render, screen } from '@testing-library/react';
import { TransactionFormFields } from './TransactionFormFields';
import { describe, it, expect, vi } from 'vitest';

describe('TransactionFormFields Security', () => {
  it('should enforce a max length on the transaction name input', () => {
    const mockOnChange = vi.fn();
    const formData = {
      name: 'Test Transaction',
      date: '2023-01-01',
      person: 'Test Person',
      inflow: '100',
      outflow: '0',
    };

    render(
      <TransactionFormFields formData={formData} onChange={mockOnChange} />
    );

    const nameInput = screen.getByLabelText(/Transaction Name/i);
    expect(nameInput).toHaveAttribute('maxLength', '100');
  });
});
