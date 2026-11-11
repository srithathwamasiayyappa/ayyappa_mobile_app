/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        devotional: {
          orange: '#D84315',
          gold: '#FFB300',
          dark: '#121212',
          card: '#1E1E1E',
          border: '#2C2C2C',
        }
      }
    },
  },
  plugins: [],
}

