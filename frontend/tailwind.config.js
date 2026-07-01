/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background:       '#F8FAFC',
        card:             '#FFFFFF',
        surface:          '#F1F5F9',
        primary:          '#14B8A6',
        'primary-hover':  '#0F9D8A',
        accent:           '#3B82F6',
        success:          '#22C55E',
        warning:          '#F59E0B',
        danger:           '#EF4444',
        text:             '#0F172A',
        'text-muted':     '#64748B',
        border:           '#E2E8F0',
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        premium:    '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
        'premium-lg':'0 20px 25px -5px rgba(0,0,0,0.08), 0 10px 10px -5px rgba(0,0,0,0.04)',
        glass:      '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
        glow:       '0 0 20px rgba(20,184,166,0.3)',
        'glow-lg':  '0 0 40px rgba(20,184,166,0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in':  'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
        shimmer:    'shimmer 1.8s infinite',
        float:      'float 4s ease-in-out infinite',
        glow:       'glow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' },                           '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '200% 0' },           '100%': { backgroundPosition: '-200% 0' } },
        float:   { '0%,100%': { transform: 'translateY(0)' },        '50%':  { transform: 'translateY(-8px)' } },
        glow:    { '0%,100%': { boxShadow: '0 0 10px rgba(20,184,166,0.2)' }, '50%': { boxShadow: '0 0 30px rgba(20,184,166,0.5)' } },
      },
    },
  },
  plugins: [],
};
