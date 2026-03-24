import React from 'react';
import styled from 'styled-components';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const StyledButton = styled.button<{
  $fullWidth?: boolean;
  $variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info';
  $size?: 'small' | 'medium' | 'large';
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  position: relative;
  overflow: hidden;
  
  ${({ $fullWidth }) => $fullWidth && 'width: 100%;'}
  
  ${({ $size }) => {
    switch ($size) {
      case 'small':
        return `
          padding: 6px 12px;
          font-size: 0.8rem;
          min-height: 32px;
        `;
      case 'large':
        return `
          padding: 16px 32px;
          font-size: 1.1rem;
          min-height: 48px;
        `;
      default:
        return `
          padding: 10px 20px;
          font-size: 0.9rem;
          min-height: 40px;
        `;
    }
  }}
  
  ${({ $variant }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: #4ECDC4;
          color: #1a1a1a;
          &:hover:not(:disabled) {
            background: #45b7b8;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
          }
        `;
      case 'secondary':
        return `
          background: transparent;
          color: #4ECDC4;
          border: 2px solid #4ECDC4;
          &:hover:not(:disabled) {
            background: #4ECDC4;
            color: #1a1a1a;
          }
        `;
      case 'danger':
        return `
          background: #ff4757;
          color: #fff;
          &:hover:not(:disabled) {
            background: #ff3742;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
          }
        `;
      case 'success':
        return `
          background: #2ed573;
          color: #fff;
          &:hover:not(:disabled) {
            background: #26d065;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(46, 213, 115, 0.3);
          }
        `;
      case 'warning':
        return `
          background: #ffa502;
          color: #fff;
          &:hover:not(:disabled) {
            background: #ff9500;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255, 165, 2, 0.3);
          }
        `;
      case 'info':
        return `
          background: #3742fa;
          color: #fff;
          &:hover:not(:disabled) {
            background: #2f3cdb;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(55, 66, 250, 0.3);
          }
        `;
      default:
        return `
          background: #666;
          color: #fff;
          &:hover:not(:disabled) {
            background: #777;
          }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
  
  &:focus {
    outline: 2px solid #4ECDC4;
    outline-offset: 2px;
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = 'left',
  disabled,
  ...props
}) => {
  const isDisabled = disabled || loading;
  
  const renderContent = () => {
    if (loading) {
      return (
        <>
          <LoadingSpinner />
          {children}
        </>
      );
    }
    
    if (icon) {
      return (
        <>
          {iconPosition === 'left' && icon}
          {children}
          {iconPosition === 'right' && icon}
        </>
      );
    }
    
    return children;
  };

  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      disabled={isDisabled}
      {...props}
    >
      {renderContent()}
    </StyledButton>
  );
};

export default Button;