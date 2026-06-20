/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#000000',
          card: 'rgba(10, 10, 20, 0.75)',
          blue: '#0052ff',
          glow: '#ffffff',
          white: '#ffffff',
          slate: '#0d1117',
          textMuted: '#94a3b8',
        }
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'neon-blue': '0 0 15px rgba(0, 82, 255, 0.45)',
        'neon-glow': '0 0 15px rgba(255, 255, 255, 0.3)',
        'neon-white': '0 0 15px rgba(255, 255, 255, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.55)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-blue': 'glowBlue 2s ease-in-out infinite alternate',
        'glow-cyan': 'glowWhite 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        glowBlue: {
          '0%': { boxShadow: '0 0 5px rgba(0, 82, 255, 0.2)', borderColor: 'rgba(0, 82, 255, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 82, 255, 0.6)', borderColor: 'rgba(0, 82, 255, 0.6)' },
        },
        glowWhite: {
          '0%': { boxShadow: '0 0 5px rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.1)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 255, 255, 0.4)', borderColor: 'rgba(255, 255, 255, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
