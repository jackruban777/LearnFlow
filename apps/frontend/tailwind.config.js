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
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        dark: {
          950: 'var(--color-dark-950)',
          900: 'var(--color-dark-900, #06010f)',
          800: 'var(--color-dark-800, #0d0520)',
          700: 'var(--color-dark-700, #13082e)',
          600: 'var(--color-dark-600, #1e1040)',
        },
        accent: {
          violet:  'var(--accent-primary, #7c3aed)',
          indigo:  '#4f46e5',
          emerald: '#10b981',
          rose:    '#f43f5e',
          amber:   '#f59e0b',
          cyan:    '#06b6d4',
        },
        gray: {
          100: 'var(--text-gray-100)',
          300: 'var(--text-gray-300)',
          400: 'var(--text-gray-400)',
          500: 'var(--text-gray-500)',
          600: 'var(--text-gray-600)',
        },
      },
      textColor: {
        white: 'var(--text-white, #f5f3ff)',
      },
      backgroundImage: {
        'page-gradient':  'var(--page-gradient)',
        'glass-glow':     'var(--glass-glow)',
        'liquid-mesh':    'var(--liquid-mesh)',
        'emerald-glow':   'radial-gradient(circle at 50% 0%, rgba(16,185,129,0.15), transparent 70%)',
        'aurora-glow':    'radial-gradient(circle at 0% 0%, rgba(124,58,237,0.15), transparent 50%), radial-gradient(circle at 100% 100%, rgba(79,70,229,0.15), transparent 50%)',
        'specular':       'var(--glass-specular)',
      },
      boxShadow: {
        'glass':          'var(--glass-shadow)',
        'glass-inner':    'var(--glass-inner-glow)',
        'glass-highlight':'inset 0 1px 0 0 rgba(255,255,255,0.15)',
        'accent-glow':    '0 0 24px 4px var(--accent-glow-color)',
        'liquid':         '0 8px 40px rgba(99,60,220,0.12), 0 2px 8px rgba(99,60,220,0.06)',
      },
      backdropBlur: {
        glass:    '24px',
        'glass-lg': '40px',
        'glass-sm': '10px',
      },
      borderColor: {
        glass: 'var(--glass-border)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'orb-drift':   'orb-drift 18s ease-in-out infinite',
        'iridescent':  'iridescent-shift 4s linear infinite',
        'glass-ripple':'glass-ripple 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
