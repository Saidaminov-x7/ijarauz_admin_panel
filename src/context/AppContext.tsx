import React, { createContext, useContext, useState, useEffect } from 'react';
import ru from '../messages/ru.json';
import en from '../messages/en.json';
import uz from '../messages/uz.json';

type Locale = 'ru' | 'en' | 'uz';
type Theme = 'light' | 'dark';

interface AppContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  theme: Theme;
  toggleTheme: () => void;
  t: typeof ru;
}

const dictionaries = { ru, en, uz };

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    return (localStorage.getItem('aubrin_admin_locale') as Locale) || 'ru';
  });

  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('aubrin_admin_theme') as Theme) || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('aubrin_admin_locale', locale);
  }, [locale]);

  useEffect(() => {
    localStorage.setItem('aubrin_admin_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const t = dictionaries[locale] || dictionaries.ru;

  return (
    <AppContext.Provider value={{ locale, setLocale, theme, toggleTheme, t }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
