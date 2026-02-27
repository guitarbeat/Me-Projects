import React from 'react';
import styled from 'styled-components';

const AlertContainer = styled.div<{ type: 'success' | 'error' | 'info' }>`
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 0.9rem;
  
  ${({ type }) => {
    switch (type) {
      case 'success':
        return 'background: rgba(40, 167, 69, 0.1); border: 1px solid #28a745; color: #28a745;';
      case 'error':
        return 'background: rgba(220, 53, 69, 0.1); border: 1px solid #dc3545; color: #dc3545;';
      case 'info':
        return 'background: rgba(0, 122, 204, 0.1); border: 1px solid #007acc; color: #007acc;';
    }
  }}
`;

interface N8NAlertProps {
  type: 'success' | 'error' | 'info';
  message: string;
}

export const N8NAlert: React.FC<N8NAlertProps> = ({ type, message }) => {
  return <AlertContainer type={type}>{message}</AlertContainer>;
};
