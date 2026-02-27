import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('renders loading spinner when loading is true', () => {
    render(<Button loading>Loading...</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    // Loader2 from lucide-react usually renders an svg, but we can't easily query by icon name in jsdom without proper mocks or aria-labels.
    // However, we can check if the button is disabled.
    // We can also check if the children are present.
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Check for the spinner class or element if possible.
    // Since we didn't add a specific aria-label to the loader, we can check for the animate-spin class.
    const spinner = button.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('does not fire onClick when loading', () => {
    const handleClick = jest.fn();
    render(<Button loading onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Click me</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('renders different variants', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-destructive');
  });
});
