// Enhanced Memory Box Design System - Family-Focused & Warm
import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const enhancedTheme = {
  // Color palette inspired by the logo and family warmth
  colors: {
    // Primary colors - Warm and inviting
    primary: '#B3E5FC',           // Soft baby blue (trust, calm)
    primaryDark: '#1A237E',       // Deep navy (stability, tech)
    primaryLight: '#E1F5FE',      // Very light blue (background)
    
    // Secondary colors - Warm and joyful
    secondary: '#FFF9C4',         // Soft yellow (warmth, joy)
    secondaryDark: '#F57F17',     // Warm amber
    secondaryLight: '#FFFDE7',    // Very light yellow
    
    // Accent colors
    accent: '#FFD54F',            // Golden yellow (like logo box)
    accentDark: '#FF8F00',        // Deep orange
    
    // Semantic colors
    success: '#66BB6A',           // Soft green
    warning: '#FFA726',           // Warm orange
    error: '#EF5350',             // Soft red
    info: '#42A5F5',              // Blue
    
    // Neutral colors
    background: '#FAFAFA',        // Very light gray
    surface: '#FFFFFF',           // Pure white
    surfaceVariant: '#F5F5F5',    // Light gray
    
    // Text colors
    text: '#1A237E',              // Deep navy (primary text)
    textSecondary: '#455A64',     // Medium gray
    textLight: '#78909C',         // Light gray
    textOnPrimary: '#FFFFFF',     // White text on primary colors
    
    // Border and divider colors
    border: '#E0E0E0',            // Light border
    divider: '#F0F0F0',           // Very light divider
    
    // Family-specific colors
    family: {
      mom: '#E1BEE7',             // Soft purple
      dad: '#81C784',             // Soft green
      child: '#FFAB91',           // Soft orange
      baby: '#F8BBD9',            // Soft pink
      grandparent: '#A5D6A7',     // Sage green
    },
    
    // Plan colors
    plans: {
      free: '#B0BEC5',            // Light gray
      premium: '#42A5F5',         // Blue
      family: '#FFD54F',          // Golden (like logo)
    }
  },

  // Typography - Rounded, friendly, family-focused
  typography: {
    // Font families
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
      light: 'System',
    },
    
    // Font sizes - Responsive and accessible
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
    },
    
    // Font weights
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    
    // Line heights
    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
      loose: 1.8,
    }
  },

  // Spacing system - Consistent and harmonious
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
    '4xl': 96,
  },

  // Border radius - Soft and rounded
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
  },

  // Shadows - Subtle and elegant
  shadows: {
    none: 'none',
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 5,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  // Layout dimensions
  layout: {
    screenWidth,
    screenHeight,
    headerHeight: 60,
    tabBarHeight: 70,
    containerPadding: 16,
    cardMaxWidth: screenWidth - 32,
  },

  // Component styles - Pre-defined for consistency
  components: {
    // Button styles
    button: {
      primary: {
        backgroundColor: '#42A5F5',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      secondary: {
        backgroundColor: '#FFF9C4',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderWidth: 1,
        borderColor: '#F57F17',
      },
      ghost: {
        backgroundColor: 'transparent',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderWidth: 1,
        borderColor: '#E0E0E0',
      }
    },

    // Card styles
    card: {
      default: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F0F0F0',
      },
      elevated: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 5,
      }
    },

    // Input styles
    input: {
      default: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        fontSize: 16,
        color: '#1A237E',
      },
      focused: {
        borderColor: '#42A5F5',
        borderWidth: 2,
        shadowColor: '#42A5F5',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }
    }
  },

  // Animation durations
  animation: {
    fast: 150,
    normal: 250,
    slow: 350,
    verySlow: 500,
  },
};

// Helper functions for responsive design
export const getResponsiveSize = (size) => {
  const baseWidth = 375; // iPhone X width as base
  return (screenWidth / baseWidth) * size;
};

export const isTablet = () => screenWidth >= 768;
export const isDesktop = () => screenWidth >= 1024;

// Utility functions for colors
export const hexToRgba = (hex, alpha = 1) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const lightenColor = (color, percent) => {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
};

export default enhancedTheme;
