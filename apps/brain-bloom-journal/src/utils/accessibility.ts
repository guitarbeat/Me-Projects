// Accessibility utilities for better user experience

/**
 * Generate a unique ID for accessibility attributes
 */
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create ARIA labels for screen readers
 */
export const createAriaLabel = (action: string, context?: string): string => {
  return context ? `${action} ${context}` : action;
};

/**
 * Generate accessible button labels
 */
export const createButtonLabel = (
  action: string,
  target?: string,
  state?: string
): string => {
  let label = action;
  if (target) label += ` ${target}`;
  if (state) label += ` (${state})`;
  return label;
};

/**
 * Create accessible form field labels
 */
export const createFieldLabel = (
  fieldName: string,
  required: boolean = false,
  description?: string
): string => {
  let label = fieldName;
  if (required) label += ' (required)';
  if (description) label += ` - ${description}`;
  return label;
};

/**
 * Generate accessible error messages
 */
export const createErrorMessage = (
  fieldName: string,
  error: string
): string => {
  return `${fieldName} error: ${error}`;
};

/**
 * Create accessible success messages
 */
export const createSuccessMessage = (
  action: string,
  result?: string
): string => {
  return result ? `${action} successful: ${result}` : `${action} successful`;
};

/**
 * Generate accessible loading states
 */
export const createLoadingMessage = (
  action: string,
  progress?: number
): string => {
  if (progress !== undefined) {
    return `${action} in progress: ${Math.round(progress)}% complete`;
  }
  return `${action} in progress`;
};

/**
 * Create accessible navigation labels
 */
export const createNavLabel = (
  section: string,
  current?: boolean
): string => {
  return current ? `Current page: ${section}` : `Navigate to ${section}`;
};

/**
 * Generate accessible table headers
 */
export const createTableHeader = (
  columnName: string,
  sortable: boolean = false,
  sortDirection?: 'asc' | 'desc'
): string => {
  let label = columnName;
  if (sortable) {
    if (sortDirection) {
      label += `, sorted ${sortDirection === 'asc' ? 'ascending' : 'descending'}`;
    } else {
      label += ', sortable';
    }
  }
  return label;
};

/**
 * Create accessible dialog labels
 */
export const createDialogLabel = (
  title: string,
  type: 'modal' | 'dialog' | 'alert' = 'dialog'
): string => {
  return `${type}: ${title}`;
};

/**
 * Generate accessible status messages
 */
export const createStatusMessage = (
  status: 'info' | 'success' | 'warning' | 'error',
  message: string
): string => {
  const statusLabels = {
    info: 'Information',
    success: 'Success',
    warning: 'Warning',
    error: 'Error'
  };
  
  return `${statusLabels[status]}: ${message}`;
};

/**
 * Create accessible progress labels
 */
export const createProgressLabel = (
  current: number,
  total: number,
  unit: string = 'item'
): string => {
  const unitLabel = current === 1 ? unit : `${unit}s`;
  return `${current} of ${total} ${unitLabel} completed`;
};

/**
 * Generate accessible time labels
 */
export const createTimeLabel = (
  time: Date,
  format: 'short' | 'long' | 'relative' = 'short'
): string => {
  switch (format) {
    case 'long':
      return time.toLocaleString();
    case 'relative': {
      const now = new Date();
      const diff = now.getTime() - time.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`;
      if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
      if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
      return 'Just now';
    }
    default:
      return time.toLocaleDateString();
  }
};

/**
 * Create accessible color contrast ratios
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  // Simplified contrast ratio calculation
  // In a real implementation, you'd use a proper color contrast library
  return 4.5; // Placeholder - should be calculated properly
};

/**
 * Check if a color combination meets WCAG standards
 */
export const meetsWCAG = (
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
};

/**
 * Generate accessible focus management
 */
export const createFocusTrap = (container: HTMLElement): (() => void) => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  };
  
  container.addEventListener('keydown', handleTabKey);
  
  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
};

/**
 * Create accessible keyboard navigation
 */
export const createKeyboardNavigation = (
  elements: HTMLElement[],
  orientation: 'horizontal' | 'vertical' | 'both' = 'horizontal'
) => {
  let currentIndex = 0;
  
  const updateFocus = (index: number) => {
    elements[currentIndex]?.setAttribute('tabindex', '-1');
    currentIndex = Math.max(0, Math.min(index, elements.length - 1));
    elements[currentIndex]?.setAttribute('tabindex', '0');
    elements[currentIndex]?.focus();
  };
  
  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        if (orientation === 'horizontal' || orientation === 'both') {
          e.preventDefault();
          updateFocus(currentIndex + 1);
        }
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        if (orientation === 'horizontal' || orientation === 'both') {
          e.preventDefault();
          updateFocus(currentIndex - 1);
        }
        break;
      case 'Home':
        e.preventDefault();
        updateFocus(0);
        break;
      case 'End':
        e.preventDefault();
        updateFocus(elements.length - 1);
        break;
    }
  };
  
  // Initialize
  elements.forEach((el, index) => {
    el.setAttribute('tabindex', index === 0 ? '0' : '-1');
    el.addEventListener('keydown', handleKeyDown);
  });
  
  return () => {
    elements.forEach(el => {
      el.removeEventListener('keydown', handleKeyDown);
      el.removeAttribute('tabindex');
    });
  };
};

/**
 * Generate accessible live regions for dynamic content
 */
export const createLiveRegion = (): HTMLElement => {
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.style.position = 'absolute';
  liveRegion.style.left = '-10000px';
  liveRegion.style.width = '1px';
  liveRegion.style.height = '1px';
  liveRegion.style.overflow = 'hidden';
  
  document.body.appendChild(liveRegion);
  
  return liveRegion;
};

/**
 * Announce messages to screen readers
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
  const liveRegion = document.querySelector('[aria-live]') as HTMLElement;
  if (liveRegion) {
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.textContent = message;
  }
};