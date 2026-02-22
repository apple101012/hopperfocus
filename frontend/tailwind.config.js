/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'fantasy': ['Cinzel', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        house: {
          primary: 'var(--house-primary)',
          secondary: 'var(--house-secondary)',
        }
      },
      animation: {
        'pulse-red': 'pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'confetti': 'confetti 3s ease-out forwards',
        'wax-seal': 'wax-seal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      },
      keyframes: {
        'pulse-red': {
          '0%, 100%': { 
            opacity: 1,
            boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)'
          },
          '50%': { 
            opacity: 0.8,
            boxShadow: '0 0 0 10px rgba(239, 68, 68, 0)'
          },
        },
        'confetti': {
          '0%': { transform: 'translateY(-100vh) rotate(0deg)', opacity: 1 },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: 0 },
        },
        'wax-seal': {
          '0%': { transform: 'scale(0) rotate(-180deg)', opacity: 0 },
          '50%': { transform: 'scale(1.2) rotate(10deg)', opacity: 1 },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: 1 },
        }
      }
    },
  },
  plugins: [],
}
