import React, { createContext, useContext, useEffect, useState } from 'react';

export type AppTheme =
  | 'dark'
  | 'light'
  | 'midnight-ocean'
  | 'nebula-purple'
  | 'matrix-scholar'
  | 'aurora-dark'
  | 'solar-scholar';

export type AccentColor = 'blue' | 'purple' | 'teal' | 'pink' | 'amber' | 'emerald';
export type FontSize = 'small' | 'medium' | 'large';
export type ScrollbarStyle = 'default' | 'minimal' | 'green' | 'hidden';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  accentColor: AccentColor;
  setAccentColor: (c: AccentColor) => void;
  fontSize: FontSize;
  setFontSize: (s: FontSize) => void;
  scrollbarStyle: ScrollbarStyle;
  setScrollbarStyle: (s: ScrollbarStyle) => void;
  compactMode: boolean;
  setCompactMode: (c: boolean) => void;
  toggleTheme: () => void; // legacy toggle between dark/light
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ALL_THEMES: AppTheme[] = [
  'dark', 'light', 'midnight-ocean', 'nebula-purple',
  'matrix-scholar', 'aurora-dark', 'solar-scholar',
];
const ALL_ACCENTS: AccentColor[] = ['blue', 'purple', 'teal', 'pink', 'amber', 'emerald'];
const ALL_FONTS: FontSize[] = ['small', 'medium', 'large'];
const ALL_SCROLLBARS: ScrollbarStyle[] = ['default', 'minimal', 'green', 'hidden'];

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('unimind-theme') as AppTheme | null;
    if (saved && ALL_THEMES.includes(saved)) return saved;
    return 'midnight-ocean';
  });

  const [accentColor, setAccentState] = useState<AccentColor>(() => {
    const saved = localStorage.getItem('unimind-accent') as AccentColor | null;
    if (saved && ALL_ACCENTS.includes(saved)) return saved;
    return 'blue';
  });

  const [fontSize, setFontState] = useState<FontSize>(() => {
    const saved = localStorage.getItem('unimind-font') as FontSize | null;
    if (saved && ALL_FONTS.includes(saved)) return saved;
    return 'medium';
  });

  const [scrollbarStyle, setScrollbarState] = useState<ScrollbarStyle>(() => {
    const saved = localStorage.getItem('unimind-scrollbar') as ScrollbarStyle | null;
    if (saved && ALL_SCROLLBARS.includes(saved)) return saved;
    return 'default';
  });

  const [compactMode, setCompactState] = useState<boolean>(() => {
    return localStorage.getItem('unimind-compact') === 'true';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Manage themes
    root.classList.remove(...ALL_THEMES);
    root.classList.add(theme);
    localStorage.setItem('unimind-theme', theme);

    // Manage accents
    root.classList.remove(...ALL_ACCENTS.map(a => `accent-${a}`));
    root.classList.add(`accent-${accentColor}`);
    localStorage.setItem('unimind-accent', accentColor);

    // Manage fonts
    root.classList.remove(...ALL_FONTS.map(f => `font-size-${f}`));
    root.classList.add(`font-size-${fontSize}`);
    localStorage.setItem('unimind-font', fontSize);

    // Manage scrollbars
    root.classList.remove(...ALL_SCROLLBARS.map(s => `scrollbar-${s}`));
    root.classList.add(`scrollbar-${scrollbarStyle}`);
    localStorage.setItem('unimind-scrollbar', scrollbarStyle);

    // Manage compact
    if (compactMode) root.classList.add('compact-mode');
    else root.classList.remove('compact-mode');
    localStorage.setItem('unimind-compact', String(compactMode));
  }, [theme, accentColor, fontSize, scrollbarStyle, compactMode]);

  const setTheme = (t: AppTheme) => setThemeState(t);
  const setAccentColor = (c: AccentColor) => setAccentState(c);
  const setFontSize = (s: FontSize) => setFontState(s);
  const setScrollbarStyle = (s: ScrollbarStyle) => setScrollbarState(s);
  const setCompactMode = (c: boolean) => setCompactState(c);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{
      theme, setTheme,
      accentColor, setAccentColor,
      fontSize, setFontSize,
      scrollbarStyle, setScrollbarStyle,
      compactMode, setCompactMode,
      toggleTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
