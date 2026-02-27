import React from 'react';
import styled from 'styled-components';

const StatusBanner = styled.div<{ status: 'connected' | 'disconnected' | 'error' }>`
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-weight: 500;
  
  ${({ status }) => {
    switch (status) {
      case 'connected':
        return 'background: rgba(40, 167, 69, 0.1); border: 1px solid #28a745; color: #28a745;';
      case 'disconnected':
        return 'background: rgba(108, 117, 125, 0.1); border: 1px solid #6c757d; color: #6c757d;';
      case 'error':
        return 'background: rgba(220, 53, 69, 0.1); border: 1px solid #dc3545; color: #dc3545;';
    }
  }}
`;

const StatusDot = styled.div<{ status: 'connected' | 'disconnected' | 'error' }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  
  ${({ status }) => {
    switch (status) {
      case 'connected':
        return 'background: #28a745;';
      case 'disconnected':
        return 'background: #6c757d;';
      case 'error':
        return 'background: #dc3545;';
    }
  }}
`;

interface N8NStatusProps {
  status: 'connected' | 'disconnected' | 'error';
  message?: string;
}

export const N8NStatus: React.FC<N8NStatusProps> = ({ status, message }) => {
  const defaultMessages = {
    connected: 'Connected to N8N Instance',
    disconnected: 'N8N Integration Disabled',
    error: 'Connection Error - Check Configuration'
  };

  return (
    <StatusBanner status={status}>
      <StatusDot status={status} />
      {message || defaultMessages[status]}
    </StatusBanner>
  );
};
