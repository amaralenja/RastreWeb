/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1', // Electric Violet
          600: '#4f46e5',
          700: '#4338ca',
          900: '#1e1b4b',
        },
        emeraldBrand: {
          500: '#10b981', // Cyber Emerald
          600: '#059669',
        }
      }
    },
  },
  plugins: [],
}
