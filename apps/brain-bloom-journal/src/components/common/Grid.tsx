import React from 'react';
import styled from 'styled-components';
import { breakpoints } from '../../styles/responsive';

export interface GridProps {
  children: React.ReactNode;
  columns?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number } | 'auto-fit';
  gap?: 'none' | 'small' | 'medium' | 'large';
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyContent?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
  className?: string;
  style?: React.CSSProperties;
}

const StyledGrid = styled.div<GridProps>`
  display: grid;
  
  ${({ gap }) => {
    switch (gap) {
      case 'none':
        return 'gap: 0;';
      case 'small':
        return 'gap: 8px;';
      case 'large':
        return 'gap: 32px;';
      default:
        return 'gap: 16px;';
    }
  }}
  
  ${({ alignItems }) => alignItems && `align-items: ${alignItems};`}
  ${({ justifyContent }) => justifyContent && `justify-content: ${justifyContent};`}
  
  ${({ columns }) => {
    if (columns === 'auto-fit') {
      return 'grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));';
    }
    
    if (typeof columns === 'number') {
      return `grid-template-columns: repeat(${columns}, 1fr);`;
    }
    
    if (typeof columns === 'object') {
      let styles = '';
      
      if (columns.xs) {
        styles += `grid-template-columns: repeat(${columns.xs}, 1fr);`;
      }
      
      if (columns.sm) {
        styles += `
          @media (min-width: ${breakpoints.sm}) {
            grid-template-columns: repeat(${columns.sm}, 1fr);
          }
        `;
      }
      
      if (columns.md) {
        styles += `
          @media (min-width: ${breakpoints.md}) {
            grid-template-columns: repeat(${columns.md}, 1fr);
          }
        `;
      }
      
      if (columns.lg) {
        styles += `
          @media (min-width: ${breakpoints.lg}) {
            grid-template-columns: repeat(${columns.lg}, 1fr);
          }
        `;
      }
      
      if (columns.xl) {
        styles += `
          @media (min-width: ${breakpoints.xl}) {
            grid-template-columns: repeat(${columns.xl}, 1fr);
          }
        `;
      }
      
      return styles;
    }
    
    return 'grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));';
  }}
`;

const Grid: React.FC<GridProps> = ({
  children,
  columns = 'auto-fit',
  gap = 'medium',
  alignItems,
  justifyContent,
  className,
  style
}) => {
  return (
    <StyledGrid
      columns={columns}
      gap={gap}
      alignItems={alignItems}
      justifyContent={justifyContent}
      className={className}
      style={style}
    >
      {children}
    </StyledGrid>
  );
};

export default Grid;