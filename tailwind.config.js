/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '2rem',
    },
    extend: {
      colors: {
        bamboo: {
          50: '#F7F9F2',
          100: '#EDF2E0',
          200: '#D9E4BC',
          300: '#BED38E',
          400: '#9FC062',
          500: '#7BA83E',
          600: '#6B8E23',
          700: '#55701C',
          800: '#445A19',
          900: '#3A4C19',
          950: '#1E290B',
        },
        parchment: {
          50: '#FBF9F3',
          100: '#F5F0E1',
          200: '#EBE0C2',
          300: '#DDC99A',
          400: '#CDAE6E',
          500: '#C09750',
          600: '#B0803F',
          700: '#926535',
          800: '#775231',
          900: '#62442B',
          950: '#352316',
        },
        ink: {
          50: '#F6F5F3',
          100: '#E8E5DF',
          200: '#D3CDC2',
          300: '#B8AE9E',
          400: '#9C8E7B',
          500: '#857562',
          600: '#6E5F50',
          700: '#5A4E43',
          800: '#4A3F35',
          900: '#3F352D',
          950: '#211C17',
        },
        cinnabar: {
          50: '#FEF3F2',
          100: '#FEE4E2',
          200: '#FDCDCA',
          300: '#FAA8A3',
          400: '#F57770',
          500: '#EC5048',
          600: '#D93A32',
          700: '#B85450',
          800: '#982A25',
          900: '#7E2724',
          950: '#450F0D',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', '"Songti SC"', 'SimSun', 'serif'],
        sans: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
      backgroundImage: {
        'bamboo-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236B8E23' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'weave-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%234A3728' fill-opacity='0.04' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'bamboo': '0 4px 14px -2px rgba(107, 142, 35, 0.15), 0 2px 6px -2px rgba(107, 142, 35, 0.1)',
        'parchment': '0 8px 24px -4px rgba(74, 55, 40, 0.1), 0 4px 12px -4px rgba(74, 55, 40, 0.08)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
