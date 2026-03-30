/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#e6f9ee',
          100: '#b3eece',
          200: '#80e3ae',
          300: '#4dd88e',
          400: '#26cf76',
          500: '#00B14F',
          600: '#009a45',
          700: '#007a37',
          800: '#005a29',
          900: '#003a1b',
        },
        heading: '#212F3F',
        body: '#4D5965',
        meta: '#6F7882',
        line: '#E9EAEE',
        bgLight: '#F3F5F7',
        bgSection: '#F8F9FA',
      },
      boxShadow: {
        'card': '0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08)',
        'nav': '0 1px 0 #E9EAEE',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
