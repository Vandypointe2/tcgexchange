import React from 'react';

export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      className="btn btn-ghost"
      onClick={onToggle}
      title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {theme === 'dark' ? 'Dark' : 'Light'}
    </button>
  );
}
