export const fonts = {
  display: 'PlayfairDisplay_400Regular' as const,
  displayBold: 'PlayfairDisplay_700Bold' as const,
};

export const fontSizes = {
  xs: 12,
  sm: 13,
  md: 14,
  lg: 15,
  xl: 16,
  '2xl': 17,
  '3xl': 20,
  '4xl': 22,
  '5xl': 26,
  '6xl': 28,
  '7xl': 34,
  '8xl': 44,
} as const;

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const letterSpacings = {
  tight: -0.3,
  normal: 0,
  wide: 0.3,
  wider: 0.6,
  widest: 1.2,
  display: 2.4,
};
