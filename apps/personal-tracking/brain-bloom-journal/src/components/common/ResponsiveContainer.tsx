import React from 'react';
import styled from 'styled-components';
import { breakpoints, containerMaxWidths } from '../../styles/responsive';

export interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: keyof typeof containerMaxWidths;
  padding?: 'none' | 'small' | 'medium' | 'large';
  center?: boolean;
  className?: string;
}

const Container = styled.div<ResponsiveContainerProps>`
  width: 100%;
  margin: 0 auto;
  
  ${({ center }) => center && 'text-align: center;'}
  
  ${({ maxWidth = 'xl' }) => `
    max-width: ${containerMaxWidths[maxWidth]};
  `}
  
  ${({ padding }) => {
    switch (padding) {
      case 'none':
        return 'padding: 0;';
      case 'small':
        return `
          padding: 0 16px;
          @media (min-width: ${breakpoints.sm}) {
            padding: 0 24px;
          }
        `;
      case 'large':
        return `
          padding: 0 24px;
          @media (min-width: ${breakpoints.sm}) {
            padding: 0 32px;
          }
          @media (min-width: ${breakpoints.lg}) {
            padding: 0 48px;
          }
        `;
      default:
        return `
          padding: 0 20px;
          @media (min-width: ${breakpoints.sm}) {
            padding: 0 24px;
          }
          @media (min-width: ${breakpoints.lg}) {
            padding: 0 32px;
          }
        `;
    }
  }}
`;

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = 'xl',
  padding = 'medium',
  center = false,
  className
}) => {
  return (
    <Container
      maxWidth={maxWidth}
      padding={padding}
      center={center}
      className={className}
    >
      {children}
    </Container>
  );
};

export default ResponsiveContainer;