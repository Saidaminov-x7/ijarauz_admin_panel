/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Стратегия тёмной темы: добавление класса 'dark' на <html>
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Высококонтрастный синий акцентный цвет (Blue / Indigo)
        primary: {
          DEFAULT: '#2563eb',
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Тёмный фон (dark mode)
        dark: {
          bg:      '#0f0f0f',
          surface: '#1a1a1a',
          border:  '#2a2a2a',
          card:    '#1e1e1e',
          sidebar: '#111111',
        },
        // Светлый фон (light mode)
        light: {
          bg:      '#f4f6f9',
          surface: '#ffffff',
          border:  '#e5e7eb',
          card:    '#ffffff',
          sidebar: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'card-dark': '0 1px 3px 0 rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
};