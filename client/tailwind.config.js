/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg0: '#070712',
        bg1: '#0b0b18',
        neonCyan: '#19f6d2',
        neonPink: '#ff2bd6',
      },
    },
  },
  plugins: [],
};

