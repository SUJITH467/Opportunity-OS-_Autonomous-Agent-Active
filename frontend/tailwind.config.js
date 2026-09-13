/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        aqua: {
          50: '#f0ffff',
          100: '#ccfbf7',
          200: '#99f6ed',
          300: '#7ef8eb',
          400: '#42f5e3', // rgb(66, 245, 227)
          500: '#18e6d2',
          600: '#0dbab0',
          700: '#0f948c',
          800: '#117570',
          900: '#13605c',
        },
        brand: {
          50: '#f0ffff',
          100: '#ccfbf7',
          400: '#42f5e3', // rgb(66, 245, 227) primary
          500: '#42f5e3',
          600: '#18e6d2',
          700: '#0dbab0',
          900: '#063937',
        },
        lightgreen: {
          300: '#7bfdbb',
          400: '#4EFEA5',
          500: '#32F5A6',
          600: '#10B981',
        },
        slate: {
          850: '#151e2e',
          900: '#0f172a',
          950: '#090d16',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(66, 245, 227, 0.5)',
        'glow-aqua': '0 0 30px -5px rgba(66, 245, 227, 0.6)',
        'glow-sm': '0 0 15px -3px rgba(66, 245, 227, 0.35)',
      }
    },
  },
  plugins: [],
}
