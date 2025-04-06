/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        'bgf-burgundy': '#9A2A2A',
        'rich-black': '#333333',
        'cream': '#F8F5F0',

        // Secondary Colors
        'gold': '#D4AF37',
        'deep-burgundy': '#6D1A1A',
        'charcoal': '#2C2C2C',

        // Accent Colors
        'forest-green': '#2F5233',
        'navy-blue': '#1A365D',
        'terracotta': '#C35A38',
        'slate-gray': '#708090',

        // Text Colors
        'text-primary': '#333333',
        'text-secondary': '#5A5A5A',
        'text-muted': '#8A8A8A',
        'text-light': '#F8F5F0',
      },
      fontFamily: {
        'playfair': ['"Playfair Display"', 'serif'],
        'lato': ['Lato', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
