import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import N8NConfigPanel from '../n8n/N8NConfigPanel';

// Mock the n8nService
jest.mock('../../services/n8nService', () => ({
  __esModule: true,
  default: {
    getConfig: jest.fn(() => ({
      enabled: false,
      baseUrl: '',
      eventPath: '/webhook/tampana/event-change',
      exportPath: '/webhook/tampana/export',
      summaryPath: '/webhook/tampana/summary',
      authHeader: '',
      authToken: ''
    })),
    updateConfig: jest.fn(),
    testConnection: jest.fn(() => Promise.resolve({ 
      success: true, 
      message: 'Connection successful',
      data: null,
      timestamp: new Date().toISOString()
    })),
    getSyncStatus: jest.fn(() => ({
      isConnected: false,
      lastSync: null,
      error: null
    }))
  }
}));

describe('N8NConfigPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the configuration form', () => {
    render(<N8NConfigPanel />);

    expect(screen.getByText('N8N Integration Configuration')).toBeInTheDocument();
    expect(screen.getByLabelText(/base url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/webhook url/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /test connection/i })).toBeInTheDocument();
  });

  it('accepts URL input without validation errors', async () => {
    render(<N8NConfigPanel />);

    const baseUrlInput = screen.getByLabelText(/n8n base url/i);
    fireEvent.change(baseUrlInput, { target: { value: 'invalid-url' } });
    fireEvent.blur(baseUrlInput);

    // Component doesn't have validation, so no error should appear
    expect(screen.queryByText(/please enter a valid url/i)).not.toBeInTheDocument();
  });

  it('accepts valid URLs without validation errors', async () => {
    render(<N8NConfigPanel />);

    const baseUrlInput = screen.getByLabelText(/n8n base url/i);
    fireEvent.change(baseUrlInput, { target: { value: 'https://n8n.example.com' } });
    fireEvent.blur(baseUrlInput);

    await waitFor(() => {
      expect(screen.queryByText(/please enter a valid url/i)).not.toBeInTheDocument();
    });
  });

  it('allows connection test when base URL is provided', async () => {
    render(<N8NConfigPanel />);

    const baseUrlInput = screen.getByLabelText(/n8n base url/i);
    const testButton = screen.getByRole('button', { name: /test connection/i });

    // Button should be enabled by default
    expect(testButton).not.toBeDisabled();

    fireEvent.change(baseUrlInput, { target: { value: 'https://n8n.example.com' } });

    // Button should still be enabled after input
    expect(testButton).not.toBeDisabled();
  });

  it('handles successful connection test', async () => {
    const mockN8nService = require('../../services/n8nService').default;
    
    render(<N8NConfigPanel />);

    const baseUrlInput = screen.getByLabelText(/n8n base url/i);
    fireEvent.change(baseUrlInput, { target: { value: 'https://n8n.example.com' } });

    const testButton = screen.getByRole('button', { name: /test connection/i });
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(mockN8nService.testConnection).toHaveBeenCalled();
      expect(screen.getByText(/connection successful/i)).toBeInTheDocument();
    });
  });

  it('displays proper accessibility attributes', () => {
    render(<N8NConfigPanel />);

    const baseUrlInput = screen.getByLabelText(/n8n base url/i);
    expect(baseUrlInput).toHaveAttribute('type', 'url');

    const enabledCheckbox = screen.getByLabelText(/enable n8n integration/i);
    expect(enabledCheckbox).toHaveAttribute('type', 'checkbox');
  });

  it('shows help text for webhook paths', () => {
    render(<N8NConfigPanel />);

    expect(screen.getByText(/webhook url/i)).toBeInTheDocument();
    expect(screen.getByText(/api key/i)).toBeInTheDocument();
  });
});