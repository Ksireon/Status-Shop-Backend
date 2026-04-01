/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sidebar: {
          DEFAULT: '#1a1a2e',
          dark: '#16213e',
        },
        accent: {
          blue: '#4361ee',
          green: '#2ec4b6',
          amber: '#ff9f1c',
          red: '#e63946',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
      },
    },
  },
  plugins: [],
}
