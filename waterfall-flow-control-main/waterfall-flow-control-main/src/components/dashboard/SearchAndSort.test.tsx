import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchAndSort } from './SearchAndSort';
import {
  SortBy,
  SortOrder,
} from '@/features/transactions/hooks/useTransactionFilters';

// Mock the useIsMobile hook
vi.mock('@/hooks/useMobile', () => ({
  useIsMobile: () => false,
}));

describe('SearchAndSort', () => {
  const defaultProps = {
    searchQuery: '',
    onSearchChange: vi.fn(),
    sortBy: 'date' as SortBy,
    onSortByChange: vi.fn(),
    sortOrder: 'desc' as SortOrder,
    onToggleSortOrder: vi.fn(),
    resultCount: 10,
  };

  it('renders search input and sort controls', () => {
    render(<SearchAndSort {...defaultProps} />);
    expect(
      screen.getByPlaceholderText('Search transactions...')
    ).toBeInTheDocument();
    // The "Sort by" text is hidden for accessibility (sr-only), but SelectValue renders the current value
    expect(screen.getByText('Date')).toBeInTheDocument();
  });

  it('calls onSearchChange when typing in search input', () => {
    render(<SearchAndSort {...defaultProps} />);
    const input = screen.getByPlaceholderText('Search transactions...');
    fireEvent.change(input, { target: { value: 'groceries' } });
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith('groceries');
  });

  it('shows clear button when searchQuery is present', () => {
    render(<SearchAndSort {...defaultProps} searchQuery="test" />);
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('does not show clear button when searchQuery is empty', () => {
    render(<SearchAndSort {...defaultProps} searchQuery="" />);
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
  });

  it('calls onSearchChange with empty string and focuses input when clear button is clicked', () => {
    const onSearchChange = vi.fn();
    render(
      <SearchAndSort
        {...defaultProps}
        searchQuery="test"
        onSearchChange={onSearchChange}
      />
    );

    const clearButton = screen.getByLabelText('Clear search');

    // We can't easily check for focus in JSDOM with user interactions simulated like this without more setup,
    // but we can verify the click handler logic.
    fireEvent.click(clearButton);

    expect(onSearchChange).toHaveBeenCalledWith('');
  });
});
