import React from 'react';
import styled from 'styled-components';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  hoverable?: boolean;
}

const StyledCard = styled.div<{
  $variant?: 'default' | 'glass' | 'elevated' | 'outlined';
  $padding?: 'none' | 'small' | 'medium' | 'large';
  $hoverable?: boolean;
  onClick?: () => void;
}>`
  border-radius: 12px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  
  ${({ $hoverable, onClick }) => (onClick || $hoverable) && `
    cursor: pointer;
    &:hover {
      transform: translateY(-2px);
    }
  `}
  
  ${({ $variant }) => {
    switch ($variant) {
      case 'glass':
        return `
          background: rgba(42, 42, 42, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        `;
      case 'elevated':
        return `
          background: #2a2a2a;
          border: 1px solid #444;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        `;
      case 'outlined':
        return `
          background: transparent;
          border: 2px solid #4ECDC4;
        `;
      default:
        return `
          background: #2a2a2a;
          border: 1px solid #444;
        `;
    }
  }}
  
  ${({ $padding }) => {
    switch ($padding) {
      case 'none':
        return 'padding: 0;';
      case 'small':
        return 'padding: 12px;';
      case 'large':
        return 'padding: 32px;';
      default:
        return 'padding: 20px;';
    }
  }}
`;

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  className,
  style,
  onClick,
  hoverable = false,
  ...props
}) => {
  return (
    <StyledCard
      $variant={variant}
      $padding={padding}
      className={className}
      style={style}
      onClick={onClick}
      $hoverable={hoverable}
      {...props}
    >
      {children}
    </StyledCard>
  );
};

export default Card;