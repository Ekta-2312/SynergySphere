/**
 * Accessibility Utilities
 * Helper functions and constants for improving accessibility
 */

// ARIA roles and attributes
export const ariaRoles = {
  // Navigation
  navigation: 'navigation',
  banner: 'banner',
  main: 'main',
  contentinfo: 'contentinfo',
  search: 'search',
  
  // Interactive elements
  button: 'button',
  link: 'link',
  menuitem: 'menuitem',
  option: 'option',
  tab: 'tab',
  tabpanel: 'tabpanel',
  
  // Form elements
  form: 'form',
  group: 'group',
  textbox: 'textbox',
  combobox: 'combobox',
  listbox: 'listbox',
  
  // Dialog and overlays
  dialog: 'dialog',
  alertdialog: 'alertdialog',
  tooltip: 'tooltip',
  
  // Status and feedback
  alert: 'alert',
  status: 'status',
  progressbar: 'progressbar',
  
  // Lists and grids
  list: 'list',
  listitem: 'listitem',
  grid: 'grid',
  gridcell: 'gridcell',
  row: 'row',
  
  // Presentation
  presentation: 'presentation',
  img: 'img',
} as const;

// Keyboard navigation keys
export const keyboardKeys = {
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

// Screen reader text utility
export const srOnly = {
  position: 'absolute' as const,
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden' as const,
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap' as const,
  border: '0',
};

// Focus management utilities
export const focusUtilities = {
  /**
   * Get all focusable elements within a container
   */
  getFocusableElements: (container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'button:not([disabled]):not([aria-hidden])',
      'input:not([disabled]):not([aria-hidden])',
      'select:not([disabled]):not([aria-hidden])',
      'textarea:not([disabled]):not([aria-hidden])',
      'a[href]:not([aria-hidden])',
      '[tabindex]:not([tabindex="-1"]):not([aria-hidden])',
      '[contenteditable]:not([aria-hidden])',
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
  },

  /**
   * Trap focus within a container (useful for modals)
   */
  trapFocus: (container: HTMLElement, e: KeyboardEvent) => {
    const focusableElements = focusUtilities.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.key === keyboardKeys.TAB) {
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  },

  /**
   * Auto focus first focusable element
   */
  focusFirst: (container: HTMLElement) => {
    const focusableElements = focusUtilities.getFocusableElements(container);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  },

  /**
   * Return focus to previous element
   */
  returnFocus: (element: HTMLElement | null) => {
    if (element && element.focus) {
      element.focus();
    }
  },
};

// ARIA live region utilities
export const liveRegions = {
  polite: 'polite' as const,
  assertive: 'assertive' as const,
  off: 'off' as const,
};

// Common aria attributes for components
export const ariaAttributes = {
  /**
   * Modal/Dialog attributes
   */
  modal: {
    role: ariaRoles.dialog,
    'aria-modal': 'true',
    'aria-labelledby': '', // Should be set to modal title id
    'aria-describedby': '', // Should be set to modal description id
  },

  /**
   * Button attributes for different states
   */
  button: {
    default: {
      type: 'button' as const,
    },
    toggle: (pressed: boolean) => ({
      'aria-pressed': pressed.toString(),
    }),
    expand: (expanded: boolean) => ({
      'aria-expanded': expanded.toString(),
    }),
    loading: {
      'aria-busy': 'true',
      'aria-live': 'polite' as const,
    },
  },

  /**
   * Form field attributes
   */
  formField: {
    required: {
      'aria-required': 'true',
    },
    invalid: (message?: string) => ({
      'aria-invalid': 'true',
      'aria-describedby': message ? 'error-message' : undefined,
    }),
    valid: {
      'aria-invalid': 'false',
    },
  },

  /**
   * List attributes
   */
  list: {
    role: ariaRoles.list,
    'aria-label': '', // Should be set to describe the list
  },

  listItem: {
    role: ariaRoles.listitem,
  },

  /**
   * Status attributes
   */
  status: {
    success: {
      role: ariaRoles.status,
      'aria-live': 'polite' as const,
    },
    error: {
      role: ariaRoles.alert,
      'aria-live': 'assertive' as const,
    },
    loading: {
      role: ariaRoles.status,
      'aria-live': 'polite' as const,
      'aria-busy': 'true',
    },
  },

  /**
   * Navigation attributes
   */
  navigation: {
    role: ariaRoles.navigation,
    'aria-label': '', // Should describe the navigation
  },

  /**
   * Tab attributes
   */
  tab: (selected: boolean, controls: string) => ({
    role: ariaRoles.tab,
    'aria-selected': selected.toString(),
    'aria-controls': controls,
    tabIndex: selected ? 0 : -1,
  }),

  tabPanel: (labelledBy: string) => ({
    role: ariaRoles.tabpanel,
    'aria-labelledby': labelledBy,
    tabIndex: 0,
  }),
};

// Common ARIA labels for the application
export const ariaLabels = {
  // General actions
  close: 'Close',
  open: 'Open',
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  edit: 'Edit',
  add: 'Add',
  remove: 'Remove',
  search: 'Search',
  filter: 'Filter',
  sort: 'Sort',
  menu: 'Menu',
  settings: 'Settings',
  profile: 'Profile',
  logout: 'Logout',
  
  // Task specific
  task: {
    create: 'Create new task',
    edit: 'Edit task',
    delete: 'Delete task',
    assign: 'Assign task',
    complete: 'Mark task as complete',
    priority: 'Set task priority',
    dueDate: 'Set due date',
    status: 'Change task status',
    details: 'View task details',
  },
  
  // Project specific
  project: {
    create: 'Create new project',
    edit: 'Edit project',
    delete: 'Delete project',
    invite: 'Invite team members',
    settings: 'Project settings',
    dashboard: 'Project dashboard',
  },
  
  // Form specific
  form: {
    required: 'Required field',
    optional: 'Optional field',
    error: 'Error message',
    success: 'Success message',
    loading: 'Loading...',
  },
  
  // Navigation
  navigation: {
    main: 'Main navigation',
    breadcrumb: 'Breadcrumb navigation',
    pagination: 'Pagination navigation',
    tabs: 'Tab navigation',
  },
  
  // Status messages
  status: {
    loading: 'Loading content',
    empty: 'No items found',
    error: 'An error occurred',
    success: 'Action completed successfully',
  },
};

// Keyboard navigation helpers
export const keyboardNavigation = {
  /**
   * Handle arrow key navigation in a list
   */
  handleArrowNavigation: (
    e: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onIndexChange: (index: number) => void
  ) => {
    let newIndex = currentIndex;

    switch (e.key) {
      case keyboardKeys.ARROW_DOWN:
        e.preventDefault();
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case keyboardKeys.ARROW_UP:
        e.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case keyboardKeys.HOME:
        e.preventDefault();
        newIndex = 0;
        break;
      case keyboardKeys.END:
        e.preventDefault();
        newIndex = items.length - 1;
        break;
      default:
        return;
    }

    onIndexChange(newIndex);
    items[newIndex]?.focus();
  },

  /**
   * Handle grid navigation (for task boards)
   */
  handleGridNavigation: (
    e: KeyboardEvent,
    grid: HTMLElement[][],
    currentRow: number,
    currentCol: number,
    onPositionChange: (row: number, col: number) => void
  ) => {
    let newRow = currentRow;
    let newCol = currentCol;

    switch (e.key) {
      case keyboardKeys.ARROW_UP:
        e.preventDefault();
        newRow = Math.max(0, currentRow - 1);
        break;
      case keyboardKeys.ARROW_DOWN:
        e.preventDefault();
        newRow = Math.min(grid.length - 1, currentRow + 1);
        break;
      case keyboardKeys.ARROW_LEFT:
        e.preventDefault();
        newCol = Math.max(0, currentCol - 1);
        break;
      case keyboardKeys.ARROW_RIGHT:
        e.preventDefault();
        newCol = Math.min(grid[currentRow]?.length - 1 || 0, currentCol + 1);
        break;
      case keyboardKeys.HOME:
        e.preventDefault();
        newCol = 0;
        break;
      case keyboardKeys.END:
        e.preventDefault();
        newCol = grid[currentRow]?.length - 1 || 0;
        break;
      default:
        return;
    }

    // Ensure the new position exists
    if (grid[newRow] && grid[newRow][newCol]) {
      onPositionChange(newRow, newCol);
      grid[newRow][newCol].focus();
    }
  },
};

export default {
  ariaRoles,
  keyboardKeys,
  srOnly,
  focusUtilities,
  liveRegions,
  ariaAttributes,
  ariaLabels,
  keyboardNavigation,
};
