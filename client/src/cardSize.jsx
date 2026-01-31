import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CardSizeContext = createContext(null);

export function CardSizeProvider({ children }) {
  const [size, setSize] = useState(() => localStorage.getItem('cardSize') || 'md');

  useEffect(() => {
    localStorage.setItem('cardSize', size);

    const root = document.documentElement;
    if (size === 'sm') {
      root.style.setProperty('--card-min', '220px');
      root.style.setProperty('--card-thumb-h', '64px');
      root.style.setProperty('--card-thumb-w', '46px');
    } else if (size === 'lg') {
      root.style.setProperty('--card-min', '340px');
      root.style.setProperty('--card-thumb-h', '110px');
      root.style.setProperty('--card-thumb-w', '78px');
    } else {
      root.style.setProperty('--card-min', '280px');
      root.style.setProperty('--card-thumb-h', '84px');
      root.style.setProperty('--card-thumb-w', '60px');
    }
  }, [size]);

  const value = useMemo(() => ({ size, setSize }), [size]);

  return (
    <CardSizeContext.Provider value={value}>{children}</CardSizeContext.Provider>
  );
}

export function useCardSize() {
  const ctx = useContext(CardSizeContext);
  if (!ctx) throw new Error('useCardSize must be used within CardSizeProvider');
  return ctx;
}
