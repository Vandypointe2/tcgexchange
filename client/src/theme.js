import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'theme'; // 'light' | 'dark'

function getPreferredTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState(() => getPreferredTheme());

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    root.style.colorScheme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const api = useMemo(
    () => ({
      theme,
      setTheme,
      toggle() {
        setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
      },
    }),
    [theme]
  );

  return api;
}
