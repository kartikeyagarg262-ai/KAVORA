/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#06070a',
          900: '#0a0c12',
          850: '#0f131c',
          800: '#141824',
          700: '#1f2438',
          600: '#2d334d',
        },
        vault: {
          amber: '#f59e0b',
          gold: '#eab308',
          purple: '#8b5cf6',
          violet: '#a855f7',
        },
        flexible: {
          green: '#10b981',
          emerald: '#059669',
          mint: '#34d399',
          glow: '#6ee7b7',
        },
        spending: {
          cyan: '#06b6d4',
          blue: '#3b82f6',
          sky: '#0284c7',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(16, 185, 129, 0.5)' },
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
