// Memory Box Theme - Yellow with Blue touches
export const theme = {
  colors: {
    // Primary yellow family  
    primary: '#FFF9C4',        // Light yellow - happiness and warmth
    primaryLight: '#FFFDE7',   // Cream yellow - soft and gentle
    primaryDark: '#F9A825',    // Golden yellow - energy and joy
    
    // Baby blue accents
    secondary: '#B3E5FC',      // Baby blue - trust and serenity
    secondaryLight: '#E1F5FE', // Light blue - calm and peace
    secondaryDark: '#1A237E',  // Dark navy - reliability and strength
    
    // Supporting colors
    accent: '#E8F5E8',         // Soft mint green - growth and harmony
    accentWarm: '#FFF8E1',     // Light amber - warmth and comfort
    accentSoft: '#F3E5F5',     // Light lavender - love and care
    
    // Functional colors
    success: '#4CAF50',        // Green - achievement
    warning: '#FF9800',        // Orange - attention (friendly warning)
    error: '#F44336',          // Red - gentle error indication
    
    // Neutral palette
    background: '#FEFEFE',     // Almost white - clean and bright
    surface: '#FFFFFF',        // Pure white - clarity
    surfaceWarm: '#FFFEF7',    // Warm white - cozy background
    
    // Text colors
    text: '#1A237E',          // Dark navy - easy to read and professional
    textSecondary: '#546E7A',  // Blue gray - secondary text
    textLight: '#90A4AE',      // Light blue gray - subtle text
    textWarm: '#5D4037',       // Brown - warm accent text
    
    // Interactive elements
    border: '#E3F2FD',         // Light blue - soft borders
    borderWarm: '#FFF8E1',     // Light amber - warm borders
    shadow: 'rgba(249, 168, 37, 0.15)', // Golden shadow
    
    // Special family colors
    familyBond: '#E1BEE7',     // Light purple - family connection
    memories: '#FFF9C4',       // Light yellow - precious memories
    love: '#F8BBD9',          // Light pink - love and affection
    trust: '#B3E5FC',         // Baby blue - trust and security
    joy: '#F9A825',           // Golden yellow - happiness and celebration
  },

  // Typography
  fonts: {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_600SemiBold', 
    bold: 'Poppins_700Bold',
  },

  // Sizing
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  // Border radius
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    round: 9999,
  },

  // Shadows
  shadows: {
    small: {
      shadowColor: '#F9A825',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#F9A825',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#F9A825',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};
