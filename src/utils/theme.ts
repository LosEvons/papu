/**
 * Centralized theme constants for consistent styling across the app.
 */

/** Primary color scheme for the app */
export const COLORS = {
  /** Primary blue used for primary actions and highlights */
  primary: '#007AFF',
  /** Background colors */
  background: {
    light: '#F5F5F5',
    dark: '#000000',
    card: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  /** Text colors */
  text: {
    primary: '#333333',
    secondary: '#666666',
    light: '#999999',
    white: '#FFFFFF',
    error: '#DC3545',
  },
  /** Border colors */
  border: {
    light: '#DDDDDD',
    medium: '#CCCCCC',
  },
  /** Button colors */
  button: {
    primary: '#007AFF',
    secondary: '#E0E0E0',
    danger: '#FF3B30',
    success: '#34C759',
  },
  /** Status colors */
  status: {
    error: '#DC3545',
    success: '#27AE60',
    warning: '#FFC107',
  },
} as const;

/** Font sizes for consistent typography */
export const FONT_SIZES = {
  small: 12,
  medium: 14,
  regular: 16,
  large: 18,
  title: 20,
  heading: 24,
  display: 48,
} as const;

/** Spacing values for consistent layout */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

/** Border radius values */
export const BORDER_RADIUS = {
  small: 4,
  medium: 8,
  large: 12,
  round: 20,
  pill: 9999,
} as const;
