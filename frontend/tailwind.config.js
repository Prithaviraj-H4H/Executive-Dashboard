/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#4F81BD',
          orange: '#F79646',
        },
        dark: {
          bg: '#0F1117',
          surface: '#1A1D27',
          card: '#1E2130',
          border: '#2D3142',
          muted: '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
