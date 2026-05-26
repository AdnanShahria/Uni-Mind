/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        garamond: ['"EB Garamond"', 'serif'],
      },
      colors: {
        background: 'var(--bg-main)',
        white: 'rgb(var(--color-white-rgb) / <alpha-value>)',
        slate: {
          900: 'rgb(var(--color-slate-900-rgb) / <alpha-value>)',
          800: 'rgb(var(--color-slate-800-rgb) / <alpha-value>)',
          200: 'rgb(var(--color-slate-200-rgb) / <alpha-value>)',
          400: 'rgb(var(--color-slate-400-rgb) / <alpha-value>)',
          500: 'rgb(var(--color-slate-500-rgb) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'rgb(var(--color-primary-rgb) / <alpha-value>)',
          glow: 'rgb(var(--color-primary-glow-rgb) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: '#8b5cf6', // purple
          glow: '#a78bfa',
        },
        accent: {
          DEFAULT: '#06b6d4', // cyan
          glow: '#22d3ee',
        }
      },
      animation: {
        'blob': 'blob 7s infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.8s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'marquee': 'marquee 25s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
