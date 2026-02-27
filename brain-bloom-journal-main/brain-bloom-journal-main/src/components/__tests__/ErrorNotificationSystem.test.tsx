import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorNotificationSystem from '../ErrorNotificationSystem';
import { ErrorNotification } from '../../types/errors';

const mockNotifications: ErrorNotification[] = [
  {
    id: '1',
    type: 'error',
    title: 'Test Error',
    message: 'This is a test error message',
    dismissible: true,
    duration: 5000,
    timestamp: new Date().toISOString()
  },
  {
    id: '2',
    type: 'success',
    title: 'Test Success',
    message: 'This is a test success message',
    dismissible: false,
    timestamp: new Date().toISOString()
  }
];

describe('ErrorNotificationSystem', () => {
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders notifications correctly', () => {
    render(
      <ErrorNotificationSystem 
        notifications={mockNotifications} 
        onDismiss={mockOnDismiss} 
      />
    );

    expect(screen.getByText('Test Error')).toBeInTheDocument();
    expect(screen.getByText('This is a test error message')).toBeInTheDocument();
    expect(screen.getByText('Test Success')).toBeInTheDocument();
    expect(screen.getByText('This is a test success message')).toBeInTheDocument();
  });

  it('applies correct ARIA attributes for error notifications', () => {
    render(
      <ErrorNotificationSystem 
        notifications={[mockNotifications[0]]} 
        onDismiss={mockOnDismiss} 
      />
    );

    const errorNotification = screen.getByRole('alert');
    expect(errorNotification).toHaveAttribute('aria-live', 'assertive');
    expect(errorNotification).toHaveAttribute('aria-atomic', 'true');
  });

  it('applies correct ARIA attributes for non-error notifications', () => {
    render(
      <ErrorNotificationSystem 
        notifications={[mockNotifications[1]]} 
        onDismiss={mockOnDismiss} 
      />
    );

    const successNotification = screen.getByRole('status');
    expect(successNotification).toHaveAttribute('aria-live', 'polite');
    expect(successNotification).toHaveAttribute('aria-atomic', 'true');
  });

  it('shows dismiss button for dismissible notifications', () => {
    render(
      <ErrorNotificationSystem 
        notifications={[mockNotifications[0]]} 
        onDismiss={mockOnDismiss} 
      />
    );

    const dismissButton = screen.getByRole('button', { name: /dismiss test error notification/i });
    expect(dismissButton).toBeInTheDocument();
  });

  it('hides dismiss button for non-dismissible notifications', () => {
    render(
      <ErrorNotificationSystem 
        notifications={[mockNotifications[1]]} 
        onDismiss={mockOnDismiss} 
      />
    );

    const dismissButton = screen.queryByRole('button', { name: /dismiss/i });
    expect(dismissButton).not.toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', async () => {
    render(
      <ErrorNotificationSystem 
        notifications={[mockNotifications[0]]} 
        onDismiss={mockOnDismiss} 
      />
    );

    const dismissButton = screen.getByRole('button', { name: /dismiss test error notification/i });
    fireEvent.click(dismissButton);

    await waitFor(() => {
      expect(mockOnDismiss).toHaveBeenCalledWith('1');
    }, { timeout: 500 });
  });

  it('renders progress bar for notifications with duration', () => {
    render(
      <ErrorNotificationSystem 
        notifications={[mockNotifications[0]]} 
        onDismiss={mockOnDismiss} 
      />
    );

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-label', 'Time remaining for this notification');
  });

  it('does not render progress bar for notifications without duration', () => {
    render(
      <ErrorNotificationSystem 
        notifications={[mockNotifications[1]]} 
        onDismiss={mockOnDismiss} 
      />
    );

    const progressBar = screen.queryByRole('progressbar');
    expect(progressBar).not.toBeInTheDocument();
  });

  it('handles keyboard navigation correctly', () => {
    render(
      <ErrorNotificationSystem 
        notifications={[mockNotifications[0]]} 
        onDismiss={mockOnDismiss} 
      />
    );

    const notification = screen.getByRole('alert');
    expect(notification).toHaveAttribute('tabIndex', '0');
    
    const dismissButton = screen.getByRole('button', { name: /dismiss test error notification/i });
    dismissButton.focus();
    expect(dismissButton).toHaveFocus();
  });
});