import React, { createContext, useContext } from 'react';
import { Platform } from 'react-native';

export const colors = {
  primary: '#FF7A00',
  primaryLight: '#FF9F4D',
  primarySoft: '#FFF0E3',
  primaryDark: '#D85F00',
  accent: '#FF4D4D',
  gold: '#F4B740',
  success: '#208B5B',
  warning: '#B66A00',
  error: '#D92D20',
  background: '#F7F7F8',
  backgroundAlt: '#F0F1F3',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E7E7EB',
  borderStrong: '#D6D6DC',
  text: '#18181B',
  textSecondary: '#606068',
  textLight: '#606068',
  textMuted: '#92929B',
  white: '#FFFFFF',
  overlay: 'rgba(14, 14, 16, 0.42)',
  scrim: 'rgba(14, 14, 16, 0.68)',
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  xxl: 30,
  pill: 999,
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 56,
};

export const typography = {
  regular: 'Inter_400Regular',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const typeScale = {
  display: { fontSize: 28, lineHeight: 34 },
  h1: { fontSize: 26, lineHeight: 32 },
  h2: { fontSize: 22, lineHeight: 28 },
  title: { fontSize: 18, lineHeight: 24 },
  body: { fontSize: 15, lineHeight: 22 },
  caption: { fontSize: 12, lineHeight: 16 },
};

export const shadows = {
  soft: Platform.select({
    web: { boxShadow: '0 6px 22px rgba(18, 18, 22, 0.07)' },
    default: {
      shadowColor: '#111114',
      shadowOpacity: 0.09,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
  }),
  raised: Platform.select({
    web: { boxShadow: '0 12px 34px rgba(18, 18, 22, 0.13)' },
    default: {
      shadowColor: '#111114',
      shadowOpacity: 0.13,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
  }),
};

export const layout = {
  maxWidth: 1200,
  screenPadding: spacing.md,
  touchTarget: 48,
};

const theme = { colors, radius, spacing, typography, typeScale, shadows, layout };
const ThemeContext = createContext(theme);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
