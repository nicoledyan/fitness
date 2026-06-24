/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        garden: {
          bg: '#F4FAF4',
          surface: '#D8EDD0',
          card: '#FFFFFF',
          accent: '#6F9F6A',
          text: '#1E301E',
          muted: '#486848',
          border: '#C8E0B8'
        }
      },
      boxShadow: {
        soft: '0 16px 40px rgba(30, 48, 30, 0.08)'
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
