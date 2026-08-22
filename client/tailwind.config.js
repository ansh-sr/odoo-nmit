/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#101828',
        canvas: '#F5F6FA',
        surface: '#FFFFFF',
        line: '#E4E7EF',
        muted: '#667085',
        accent: {
          DEFAULT: '#F59E0B',
          deep: '#B45309',
          soft: '#FEF3E2',
        },
        indigo: {
          DEFAULT: '#4F46E5',
          soft: '#EEF0FD',
        },
        success: { DEFAULT: '#16A34A', soft: '#E9F8EF' },
        warning: { DEFAULT: '#D97706', soft: '#FEF3E2' },
        danger: { DEFAULT: '#DC2626', soft: '#FDEDED' },
      },
      fontFamily: {
        display: ['"Lexend"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
        pop: '0 8px 24px rgba(16, 24, 40, 0.10)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}