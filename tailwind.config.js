/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#15233B', soft: '#42536E', faint: '#7B89A0' },
        paper: '#FBFBF8',
        panel: { DEFAULT: '#F3F4F0', 2: '#ECEEE8' },
        line: { DEFAULT: '#D9DCDD', soft: '#E7E9E6' },
        copper: { DEFAULT: '#BC643A', deep: '#9A4F2B', tint: '#F7EBE2' },
        teal: { DEFAULT: '#1B7884', deep: '#13565F', tint: '#E3F0F0' },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        content: '1180px',
      },
    },
  },
  plugins: [],
};
