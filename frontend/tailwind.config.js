/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#080c14',
          surface: '#0e1420',
          'surface-raised': '#131b2e',
          'surface-high': '#1a2340',
          'surface-border': '#1f2d4a',
          muted: '#2a3a5c',
          text: '#e8eaf6',
          'text-secondary': '#8b9cc8',
          'text-muted': '#4a5680',
          indigo: '#6366f1',
          'indigo-bright': '#818cf8',
          'indigo-light': '#a5b4fc',
          'indigo-dim': '#4338ca',
          'indigo-glow': '#3730a3',
          'indigo-subtle': 'rgba(99,102,241,0.08)',
          cyan: '#22d3ee',
          'cyan-bright': '#67e8f9',
          emerald: '#10b981',
          'emerald-bright': '#34d399',
          amber: '#f59e0b',
          'amber-bright': '#fbbf24',
          rose: '#f43f5e',
          'rose-bright': '#fb7185',
          violet: '#8b5cf6',
          'violet-bright': '#a78bfa',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        slideIn: {
          from: { opacity: '0', transform: 'translateX(10px)' },
          to: { opacity: '1', transform: 'translateX(0)' }
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.94)' },
          to: { opacity: '1', transform: 'scale(1)' }
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      animation: {
        'slide-in': 'slideIn 0.25s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'fade-in': 'fadeIn 0.15s ease-out',
        'blink': 'blink 1.2s step-end infinite',
        'shimmer': 'shimmer 2s linear infinite'
      }
    },
  },
  plugins: [],
}