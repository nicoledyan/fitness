/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        moon: {
          bg: '#FFFCF4',
          surface: '#EFE3FA',
          card: '#FFFFFF',
          accent: '#BFA2DC',
          text: '#2B2232',
          muted: '#6E5D78',
          border: '#E4D5F1'
        }
      },
      boxShadow: {
        soft: '0 16px 40px rgba(71, 44, 89, 0.08)'
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
