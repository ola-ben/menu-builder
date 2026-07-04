/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // StoreLink editorial canvas
        paper: '#FAFAF8',
        ink: '#0B0B0B',
        
        // Map brand color hooks to StoreLink editorial colors
        brand: {
          50: '#FAFAF8',
          100: '#FDF4F2',
          200: '#FBE8E2',
          300: '#CCCCCC',
          400: '#e86e4e',
          500: '#d25433',
          600: '#bc4223',
          700: '#9b3218',
          800: '#0B0B0B',
          900: '#0B0B0B',
        },
        whatsapp: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      opacity: {
        12: '0.12',
        15: '0.15',
        35: '0.35',
        45: '0.45',
        55: '0.55',
        65: '0.65',
      },
      boxShadow: {
        // Minimal shadows for maximum flat editorial look
        glow: 'none',
        'glow-green': 'none',
        soft: 'none',
        lift: 'none',
      },
      backgroundImage: {
        'grid-light':
          'radial-gradient(circle at center, rgba(11,11,11,0.05) 1px, transparent 1px)',
        'grid-dark':
          'radial-gradient(circle at center, rgba(250,250,248,0.05) 1px, transparent 1px)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
}
