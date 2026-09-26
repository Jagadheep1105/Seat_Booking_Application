/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#07090E',
          900: '#0B0F19',
          850: '#0F1626',
          800: '#141E33',
          700: '#1F2C47',
          600: '#2F4066'
        },
        accent: {
          cyan: '#06B6D4',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
          purple: '#8B5CF6'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.4)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.4)',
        'glow-amber': '0 0 25px -5px rgba(245, 158, 11, 0.4)',
        'glow-rose': '0 0 25px -5px rgba(244, 63, 94, 0.4)'
      }
    }
  },
  plugins: []
};
