/**
 * Newsprint Design System - Component Styles
 * Sharp corners, high contrast, editorial aesthetic
 * All colors use HSL values from the design system
 */

/**
 * Animation style variants - kept for motion utilities
 */
export const animationStyles = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  slideInLeft: 'animate-slide-in-left',
  scaleIn: 'animate-scale-in',
  transition: 'transition-all duration-300 ease-out',
  transitionFast: 'transition-all duration-200 ease-out',
  transitionSlow: 'transition-all duration-500 ease-out',
  hover: 'hover:scale-[1.02] transition-transform duration-200',
} as const;

/**
 * Newsprint Card Styles
 */
export const newsprintCardStyles = {
  default: 'bg-newsprint-bg border border-newsprint-border sharp-corners p-6',
  article: 'bg-newsprint-bg border border-newsprint-border sharp-corners p-6 hover:bg-newsprint-neutral-100 transition-colors duration-200',
  column: 'bg-newsprint-bg border-r border-b border-newsprint-border sharp-corners p-6',
  hover: 'bg-newsprint-bg border border-newsprint-border sharp-corners p-6 hard-shadow-hover',
  inverted: 'bg-newsprint-foreground border border-newsprint-border sharp-corners p-6 text-newsprint-bg',
} as const;

/**
 * Newsprint Button Styles
 */
export const newsprintButtonStyles = {
  primary: 'bg-newsprint-foreground text-newsprint-bg border border-transparent hover:bg-newsprint-bg hover:text-newsprint-foreground hover:border-newsprint-foreground sharp-corners uppercase tracking-widest transition-all duration-200 min-h-[44px] min-w-[44px]',
  secondary: 'border border-newsprint-foreground bg-transparent hover:bg-newsprint-foreground hover:text-newsprint-bg sharp-corners uppercase tracking-widest transition-all duration-200 min-h-[44px] min-w-[44px]',
  ghost: 'hover:bg-newsprint-muted hover:text-newsprint-foreground sharp-corners transition-all duration-200 min-h-[44px] min-w-[44px]',
  link: 'text-newsprint-foreground underline-offset-4 decoration-2 decoration-newsprint-accent hover:underline sharp-corners',
} as const;

/**
 * Newsprint Text Styles
 */
export const newsprintTextStyles = {
  // Hero Headlines - Massive, viewport-dominating
  h1: 'font-newsprint-serif text-5xl sm:text-6xl lg:text-9xl font-black leading-[0.9] tracking-tighter text-newsprint-foreground',
  // Section Headers
  h2: 'font-newsprint-serif text-4xl lg:text-5xl font-black uppercase text-newsprint-foreground',
  // Card Titles
  h3: 'font-newsprint-serif text-2xl lg:text-3xl font-bold text-newsprint-foreground',
  // Body Text
  body: 'font-newsprint-body text-sm lg:text-lg leading-relaxed text-newsprint-foreground',
  bodyJustified: 'font-newsprint-body text-sm lg:text-lg leading-relaxed text-justify text-newsprint-foreground',
  // Metadata/Labels
  metadata: 'font-newsprint-mono text-xs uppercase tracking-widest text-newsprint-neutral-500',
  label: 'font-newsprint-sans text-xs uppercase tracking-widest text-newsprint-foreground',
  // Muted Text
  muted: 'font-newsprint-body text-sm text-newsprint-neutral-500',
  caption: 'font-newsprint-mono text-xs text-newsprint-neutral-500',
} as const;

/**
 * Newsprint Input Styles
 */
export const newsprintInputStyles = {
  default: 'border-b-2 border-newsprint-foreground bg-transparent px-3 py-2 font-newsprint-mono text-sm focus-visible:bg-newsprint-neutral-100 focus-visible:outline-none sharp-corners',
  textarea: 'border-b-2 border-newsprint-foreground bg-transparent px-3 py-2 font-newsprint-mono text-sm focus-visible:bg-newsprint-neutral-100 focus-visible:outline-none sharp-corners resize-none',
} as const;

/**
 * Newsprint Badge Styles
 */
export const newsprintBadgeStyles = {
  default: 'bg-newsprint-foreground text-newsprint-bg sharp-corners px-2 py-1 text-xs font-newsprint-mono uppercase tracking-widest',
  accent: 'bg-newsprint-accent text-newsprint-bg sharp-corners px-2 py-1 text-xs font-newsprint-mono uppercase tracking-widest',
  outline: 'border border-newsprint-foreground text-newsprint-foreground bg-transparent sharp-corners px-2 py-1 text-xs font-newsprint-mono uppercase tracking-widest',
} as const;

/**
 * Newsprint Layout Styles
 */
export const newsprintLayoutStyles = {
  container: 'max-w-screen-xl mx-auto px-4',
  section: 'py-16',
  grid: 'grid grid-cols-12 gap-0', // Collapsed borders
  column: 'border-r border-b border-newsprint-border', // For grid cells
} as const;

/**
 * Newsprint Separator Styles
 */
export const newsprintSeparatorStyles = {
  default: 'border-t border-newsprint-border',
  bold: 'border-t-4 border-newsprint-foreground',
  accent: 'border-t-2 border-newsprint-accent',
  vertical: 'border-l border-newsprint-border',
} as const;
