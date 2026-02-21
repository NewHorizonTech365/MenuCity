// styles/theme.ts
import React, { createContext, useContext } from 'react';

export const colors = {
    primary: '#FF7A00',          // Orange "food / chaleureux"
    primaryLight: '#FF9F4D',
    primaryDark: '#E56A00',
    accent: '#FF4D4D',

    background: '#F8F8F8',
    backgroundAlt: '#FFFFFF',
    card: 'rgba(255,255,255,0.8)', // pour glass effect
    border: 'rgba(0,0,0,0.05)',
    text: '#181818',
    textLight: '#6A6A6A',
};

export const radius = {
    sm: 8,
    md: 14,
    lg: 22,
    xl: 28,
    pill: 100,
};

export const spacing = {
    xs: 6,
    sm: 12,
    md: 18,
    lg: 24,
    xl: 32,
    xxl: 40,
};

export const typography = {
    regular: 'Inter_400Regular',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
};

// ---------- Theme Provider ----------
const ThemeContext = createContext({
    colors,
    radius,
    spacing,
    typography,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    return (
    <ThemeContext.Provider value={{ colors, radius, spacing, typography }}>
        {children}
    </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
