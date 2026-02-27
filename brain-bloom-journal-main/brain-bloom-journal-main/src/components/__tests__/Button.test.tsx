import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '../common/Button';

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    // Primary maps to 'default' which uses bg-primary
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');

    // Secondary maps to 'outline' in the wrapper logic
    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('border-input');

    // Danger maps to 'destructive'
    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive');
  });

  it('renders with different sizes', () => {
    // Small maps to 'sm'
    const { rerender } = render(<Button size="small">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-9');

    // Large maps to 'lg'
    rerender(<Button size="large">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-11');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    // The loading text might be there if children are rendered, but let's check content.
    // The implementation renders Spinner + children when loading.
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('renders with icon', () => {
    const icon = <span data-testid="icon">🔍</span>;
    render(<Button icon={icon}>Search</Button>);
    
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('renders with icon on the right', () => {
    const icon = <span data-testid="icon">→</span>;
    render(<Button icon={icon} iconPosition="right">Next</Button>);
    
    const button = screen.getByRole('button');
    const iconElement = screen.getByTestId('icon');
    const textElement = screen.getByText('Next');
    
    expect(button).toContainElement(iconElement);
    expect(button).toContainElement(textElement);
  });

  it('applies fullWidth prop', () => {
    render(<Button fullWidth>Full Width</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50');
  });

  it('is disabled when loading', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('forwards other props', () => {
    render(<Button data-testid="custom-button" aria-label="Custom button">Test</Button>);
    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('aria-label', 'Custom button');
  });
});
