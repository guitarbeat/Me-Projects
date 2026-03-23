import styled from 'styled-components';

// Base typography styles
const baseTextStyles = `
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: inherit;
`;

// Heading components
export const H1 = styled.h1`
  ${baseTextStyles}
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.025em;
  margin-bottom: 1.5rem;
`;

export const H2 = styled.h2`
  ${baseTextStyles}
  font-size: 2rem;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.025em;
  margin-bottom: 1.25rem;
`;

export const H3 = styled.h3`
  ${baseTextStyles}
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.025em;
  margin-bottom: 1rem;
`;

export const H4 = styled.h4`
  ${baseTextStyles}
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: -0.025em;
  margin-bottom: 0.75rem;
`;

export const H5 = styled.h5`
  ${baseTextStyles}
  font-size: 1.125rem;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: -0.025em;
  margin-bottom: 0.5rem;
`;

export const H6 = styled.h6`
  ${baseTextStyles}
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: -0.025em;
  margin-bottom: 0.5rem;
`;

// Body text components
export const BodyLarge = styled.p`
  ${baseTextStyles}
  font-size: 1.125rem;
  font-weight: 400;
  line-height: 1.6;
  letter-spacing: 0.025em;
  margin-bottom: 1rem;
`;

export const Body = styled.p`
  ${baseTextStyles}
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.6;
  letter-spacing: 0.025em;
  margin-bottom: 1rem;
`;

export const BodySmall = styled.p`
  ${baseTextStyles}
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0.025em;
  margin-bottom: 0.75rem;
`;

export const Caption = styled.span`
  ${baseTextStyles}
  font-size: 0.75rem;
  font-weight: 400;
  line-height: 1.4;
  letter-spacing: 0.025em;
  text-transform: uppercase;
`;

// Special text components
export const Display = styled.h1`
  ${baseTextStyles}
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.05em;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const Lead = styled.p`
  ${baseTextStyles}
  font-size: 1.25rem;
  font-weight: 300;
  line-height: 1.7;
  letter-spacing: 0.025em;
  margin-bottom: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
`;

export const Code = styled.code`
  ${baseTextStyles}
  font-family: 'JetBrains Mono', 'Fira Code', Monaco, Consolas, monospace;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.5;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  color: #fbbf24;
`;

export const Link = styled.a`
  ${baseTextStyles}
  color: #60a5fa;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    color: #93c5fd;
    text-decoration: underline;
  }
  
  &:focus {
    outline: 2px solid #60a5fa;
    outline-offset: 2px;
    border-radius: 0.25rem;
  }
`;

// Utility text components
export const TextMuted = styled.span`
  ${baseTextStyles}
  color: rgba(255, 255, 255, 0.6);
`;

export const TextAccent = styled.span`
  ${baseTextStyles}
  color: #fbbf24;
  font-weight: 500;
`;

export const TextSuccess = styled.span`
  ${baseTextStyles}
  color: #34d399;
  font-weight: 500;
`;

export const TextError = styled.span`
  ${baseTextStyles}
  color: #f87171;
  font-weight: 500;
`;

export const TextWarning = styled.span`
  ${baseTextStyles}
  color: #fbbf24;
  font-weight: 500;
`;

// List components
export const List = styled.ul`
  ${baseTextStyles}
  margin-bottom: 1rem;
  padding-left: 1.5rem;
  
  li {
    margin-bottom: 0.5rem;
    line-height: 1.6;
    letter-spacing: 0.025em;
  }
`;

export const OrderedList = styled.ol`
  ${baseTextStyles}
  margin-bottom: 1rem;
  padding-left: 1.5rem;
  
  li {
    margin-bottom: 0.5rem;
    line-height: 1.6;
    letter-spacing: 0.025em;
  }
`;

// Blockquote component
export const Blockquote = styled.blockquote`
  ${baseTextStyles}
  font-style: italic;
  font-size: 1.125rem;
  line-height: 1.6;
  letter-spacing: 0.025em;
  margin: 1.5rem 0;
  padding: 1rem 1.5rem;
  border-left: 4px solid #60a5fa;
  background: rgba(96, 165, 250, 0.1);
  border-radius: 0.5rem;
  
  &::before {
    content: '"';
    font-size: 3rem;
    color: #60a5fa;
    line-height: 0;
    margin-right: 0.5rem;
  }
`;

// Export all components
export default {
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  BodyLarge,
  Body,
  BodySmall,
  Caption,
  Display,
  Lead,
  Code,
  Link,
  TextMuted,
  TextAccent,
  TextSuccess,
  TextError,
  TextWarning,
  List,
  OrderedList,
  Blockquote,
};