import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CardSizeContext = createContext(null);

export function CardSizeProvider({ children }) {
  const [size, setSize] = useState(() => localStorage.getItem('cardSize') || 'md');

  useEffect(() => {
    localStorage.setItem('cardSize', size);

    // Small + Large define the endpoints; Medium is computed as halfway.
    const sm = { min: 220, h: 64, w: 46 };
    // Make Large very large (about 6x Small for the thumbnail size).
    const lg = { min: 820, h: sm.h * 6, w: sm.w * 6 };
    const md = {
      min: Math.round((sm.min + lg.min) / 2),
      h: Math.round((sm.h + lg.h) / 2),
      w: Math.round((sm.w + lg.w) / 2)
    };

    const preset = size === 'sm' ? sm : (size === 'lg' ? lg : md);

    const root = document.documentElement;
    root.style.setProperty('--card-min', `${preset.min}px`);
    root.style.setProperty('--card-thumb-h', `${preset.h}px`);
    root.style.setProperty('--card-thumb-w', `${preset.w}px`);
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
