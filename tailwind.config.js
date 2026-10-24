/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
  content: ['./src/**/*.{js,ts,jsx,tsx,css}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'primary-bg': 'var(--primary-bg)',
        'secondary-bg': 'var(--secondary-bg)',
        // … all other variables
      },
      fontFamily: {
        newyorker: ['NewYorker', 'Georgia', 'serif'],
        sans: ['system-ui', '-apple-system', 'sans-serif'],
        mono: ['Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default tailwindConfig;