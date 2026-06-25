/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Warm, appetizing primary
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        whatsapp: {
          50: '#ecfdf5',
          100: '#d1fae5',
          400: '#34d399',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 10px 30px -10px rgba(234, 88, 12, 0.45)',
        'glow-green': '0 10px 30px -10px rgba(34, 197, 94, 0.5)',
        // Soft, layered “lifted” shadow for cards
        soft: '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -12px rgba(15,23,42,0.12)',
        lift: '0 1px 2px rgba(15,23,42,0.05), 0 18px 40px -18px rgba(234,88,12,0.28)',
      },
      backgroundImage: {
        'grid-light':
          'radial-gradient(circle at center, rgba(234,88,12,0.10) 1px, transparent 1px)',
        'grid-dark':
          'radial-gradient(circle at center, rgba(251,146,60,0.10) 1px, transparent 1px)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
