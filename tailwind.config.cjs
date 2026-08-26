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
        // Акцентный teal/бирюзовый
        primary: {
          DEFAULT: '#14b8a6',
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
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