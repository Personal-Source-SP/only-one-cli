/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0d14',
        surface: '#121722',
        surfaceBorder: '#1e2638',
        accentCyan: '#06b6d4',
        accentBlue: '#3b82f6',
        accentGreen: '#10b981',
        accentYellow: '#f59e0b',
        accentPurple: '#8b5cf6',
      },
    },
  },
  plugins: [],
};
