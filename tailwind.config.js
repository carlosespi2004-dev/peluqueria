/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          300: '#E8C97A',
          400: '#D4A843',
          500: '#B8860B',
          600: '#9A7009',
          700: '#7A5807',
        },
        ink: {
          50:  '#F5F0E8',
          100: '#E8E0D0',
          200: '#C8BCA8',
          300: '#A09080',
          400: '#706050',
        },
        surface: {
          50:  '#2A2A2A',
          100: '#1E1E1E',
          200: '#161616',
          300: '#101010',
          400: '#0A0A0A',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body:    ['"Syne"', 'system-ui', 'sans-serif'],
        mono:    ['"DM Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}

