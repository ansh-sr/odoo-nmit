/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1C2333',
        paper: '#F7F5F0',
        paperDim: '#EDEAE1',
        rule: '#D8D3C4',
        signal: '#E8A33D',
        slate: '#5B6478',
        success: '#3B7A57',
        danger: '#B23A2E',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
