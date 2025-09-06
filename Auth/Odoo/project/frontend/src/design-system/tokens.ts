/**
 * Global Design Tokens
 * Centralized design system tokens for colors, typography, spacing, and other design elements
 */

// Color Palette
export const colors = {
  // Primary colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Secondary colors
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  // Status colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Neutral colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Task priority colors
  priority: {
    low: {
      bg: '#f0fdf4',
      text: '#166534',
      border: '#bbf7d0',
    },
    medium: {
      bg: '#fffbeb',
      text: '#92400e',
      border: '#fde68a',
    },
    high: {
      bg: '#fff7ed',
      text: '#c2410c',
      border: '#fed7aa',
    },
    urgent: {
      bg: '#fef2f2',
      text: '#991b1b',
      border: '#fecaca',
    },
  },

  // Task status colors
  status: {
    todo: {
      bg: '#f8fafc',
      text: '#475569',
      border: '#e2e8f0',
    },
    'in-progress': {
      bg: '#eff6ff',
      text: '#1d4ed8',
      border: '#bfdbfe',
    },
    'in-review': {
      bg: '#fffbeb',
      text: '#d97706',
      border: '#fde68a',
    },
    done: {
      bg: '#f0fdf4',
      text: '#15803d',
      border: '#bbf7d0',
    },
  },
};

// Typography
export const typography = {
  fontFamily: {
    primary: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    secondary: ['Roboto', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['Fira Code', 'Monaco', 'Consolas', 'monospace'],
  },

  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
  },

  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  lineHeight: {
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

// Spacing
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  40: '10rem',    // 160px
  48: '12rem',    // 192px
  56: '14rem',    // 224px
  64: '16rem',    // 256px
};

// Border Radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000',
};

// Z-Index
export const zIndex = {
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1020,
  banner: 1030,
  overlay: 1040,
  modal: 1050,
  popover: 1060,
  skipLink: 1070,
  toast: 1080,
  tooltip: 1090,
};

// Breakpoints
export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Animation
export const animation = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  
  easing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// Accessibility
export const accessibility = {
  focusRing: {
    outline: '2px solid',
    outlineColor: colors.primary[500],
    outlineOffset: '2px',
  },
  
  contrast: {
    high: {
      background: colors.neutral[900],
      text: colors.neutral[50],
    },
    normal: {
      background: colors.neutral[50],
      text: colors.neutral[900],
    },
  },
};

// Component specific tokens
export const components = {
  button: {
    sizes: {
      sm: {
        height: '32px',
        paddingX: spacing[3],
        paddingY: spacing[1],
        fontSize: typography.fontSize.sm,
      },
      md: {
        height: '40px',
        paddingX: spacing[4],
        paddingY: spacing[2],
        fontSize: typography.fontSize.base,
      },
      lg: {
        height: '48px',
        paddingX: spacing[6],
        paddingY: spacing[3],
        fontSize: typography.fontSize.lg,
      },
    },
  },
  
  input: {
    sizes: {
      sm: {
        height: '32px',
        paddingX: spacing[3],
        paddingY: spacing[1],
        fontSize: typography.fontSize.sm,
      },
      md: {
        height: '40px',
        paddingX: spacing[3],
        paddingY: spacing[2],
        fontSize: typography.fontSize.base,
      },
      lg: {
        height: '48px',
        paddingX: spacing[4],
        paddingY: spacing[3],
        fontSize: typography.fontSize.lg,
      },
    },
  },
  
  modal: {
    sizes: {
      sm: { maxWidth: '384px' },
      md: { maxWidth: '512px' },
      lg: { maxWidth: '768px' },
      xl: { maxWidth: '1024px' },
      '2xl': { maxWidth: '1280px' },
      full: { maxWidth: '100%' },
    },
  },
  
  card: {
    padding: {
      sm: spacing[4],
      md: spacing[6],
      lg: spacing[8],
    },
  },
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  breakpoints,
  animation,
  accessibility,
  components,
};
