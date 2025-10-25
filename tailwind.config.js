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
        'primary-text': 'var(--primary-text)',
        'secondary-text': 'var(--secondary-text)',
        'primary-border': 'var(--primary-border)',
        'secondary-border': 'var(--secondary-border)',
        'primary-label': 'var(--primary-label)',
        'secondary-label': 'var(--secondary-label)',
        'primary-placeholder': 'var(--primary-placeholder)',
        'secondary-placeholder': 'var(--secondary-placeholder)',
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