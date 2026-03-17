/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontWeight: {
        '500': '500',
        '600': '600',
        '700': '700',
        '800': '800',
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        soil:  {
          DEFAULT: '#3D2B1F',
          50:  '#F5EDE8',
          100: '#E8D5C8',
          200: '#C9A98E',
          400: '#7A5235',
          600: '#2A1D14',
        },
        leaf:  {
          DEFAULT: '#2D6A4F',
          50:  '#E8F5EE',
          100: '#C8E6D5',
          200: '#8CCAAA',
          400: '#3A8B63',
          600: '#1F4D38',
        },
        grain: {
          DEFAULT: '#C9A84C',
          50:  '#FBF5E4',
          200: '#E8CE7E',
          500: '#A88830',
          600: '#7A6120',
        },
        sky:   {
          DEFAULT: '#1B6CA8',
          50:  '#E8F2FA',
          100: '#C5DDF0',
          200: '#8BBFDF',
          500: '#145485',
          600: '#0F3F66',
          700: '#092840',
        },
        stone: {
          50:  '#F7F5F2',
          100: '#EDE9E3',
          200: '#D4CCC0',
          300: '#B8AD9E',
          400: '#948477',
          500: '#6E5E54',
          600: '#4A3E37',
          700: '#2A221D',
          800: '#1A1410',
        },
      },
      boxShadow: {
        'card':       '0 1px 3px rgba(61,43,31,0.07), 0 4px 16px rgba(61,43,31,0.05)',
        'card-hover': '0 4px 12px rgba(61,43,31,0.10), 0 8px 28px rgba(61,43,31,0.08)',
        'glow-leaf':  '0 0 20px rgba(45,106,79,0.22)',
      },
      animation: {
        'fade-up':    'fadeUp 0.38s ease forwards',
        'fade-in':    'fadeIn 0.25s ease forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'spin-slow':  'spin 2.5s linear infinite',
      },
      keyframes: {
        fadeUp:    { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        pulseSoft: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.55 } },
      },
    },
  },
  plugins: [],
}
