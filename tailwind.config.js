/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        bg: '#111827',
        primary: '#FF7A00',
        ssr: '#FFD700',
        epic: '#A855F7',
        rare: '#3B82F6',
        normal: '#9CA3AF',
        danger: '#EF4444',
        cyber: '#22D3EE',
      },
      fontFamily: {
        sans: ['PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        mono: ['JetBrains Mono', 'DIN', 'monospace'],
      },
    },
  },
  plugins: [],
}
