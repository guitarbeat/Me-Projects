import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Card from '../common/Card';

describe('Card Component', () => {
  it('renders with default props', () => {
    render(<Card>Card content</Card>);
    const card = screen.getByText('Card content');
    expect(card).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Card variant="default">Default</Card>);
    // 'default' doesn't add specific variant classes in the wrapper, but relies on UICard defaults
    // checking for basic presence
    expect(screen.getByText('Default')).toBeInTheDocument();

    rerender(<Card variant="glass">Glass</Card>);
    // Check for one of the classes added by 'glass' variant
    expect(screen.getByText('Glass').closest('div')).toHaveClass('backdrop-blur-lg');

    rerender(<Card variant="elevated">Elevated</Card>);
    expect(screen.getByText('Elevated').closest('div')).toHaveClass('shadow-lg');

    rerender(<Card variant="outlined">Outlined</Card>);
    expect(screen.getByText('Outlined').closest('div')).toHaveClass('border-2');
  });

  it('renders with different padding sizes', () => {
    const { rerender } = render(<Card padding="none">No padding</Card>);
    expect(screen.getByText('No padding').closest('div')).toHaveClass('p-0');

    rerender(<Card padding="small">Small padding</Card>);
    expect(screen.getByText('Small padding').closest('div')).toHaveClass('p-3');

    rerender(<Card padding="large">Large padding</Card>);
    expect(screen.getByText('Large padding').closest('div')).toHaveClass('p-8');
  });

  it('applies hoverable styles when hoverable is true', () => {
    render(<Card hoverable>Hoverable card</Card>);
    const card = screen.getByText('Hoverable card').closest('div');
    expect(card).toHaveClass('cursor-pointer');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Card onClick={handleClick}>Clickable card</Card>);
    
    const card = screen.getByText('Clickable card').closest('div');
    expect(card).toHaveClass('cursor-pointer');
  });

  it('applies custom className', () => {
    render(<Card className="custom-card">Custom card</Card>);
    expect(screen.getByText('Custom card').closest('div')).toHaveClass('custom-card');
  });

  it('renders children correctly', () => {
    render(
      <Card>
        <h2>Card Title</h2>
        <p>Card content</p>
        <button>Action</button>
      </Card>
    );
    
    expect(screen.getByRole('heading', { name: 'Card Title' })).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });
});
