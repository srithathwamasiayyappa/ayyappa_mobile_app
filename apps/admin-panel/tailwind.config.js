/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        title: ['var(--admin-title-font)', 'Poppins', 'sans-serif'],
        desc: ['var(--admin-desc-font)', 'Raleway', 'sans-serif'],
      },
      colors: {
        // Aligned with the official website theme colors
        maroon: {
          DEFAULT: 'var(--admin-maroon)',
          dark: 'var(--admin-maroon-dark)',
          mid: 'var(--admin-maroon-mid)',
        },
        saffron: {
          DEFAULT: 'var(--admin-saffron)',
          deep: 'var(--admin-saffron-deep)',
        },
        gold: {
          DEFAULT: 'var(--admin-gold)',
          light: 'var(--admin-gold-light)',
          bright: 'var(--admin-gold-bright)',
        },
        ivory: 'var(--admin-ivory)',
        cream: {
          DEFAULT: 'var(--admin-cream)',
          dark: 'var(--admin-cream-dark)',
        },
        ink: 'var(--admin-ink)',
        muted: 'var(--admin-muted)',
        line: 'var(--admin-line)',
        devotional: {
          orange: 'var(--admin-saffron)',
          gold: 'var(--admin-gold)',
          dark: 'var(--admin-bg-base)',
          card: 'var(--admin-bg-card)',
          border: 'var(--admin-border-subtle)',
        }
      }
    },
  },
  plugins: [],
}
