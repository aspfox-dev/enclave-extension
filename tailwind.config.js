/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0f1115',
          raised: '#171a21',
          border: '#252a34',
        },
        accent: {
          DEFAULT: '#5b8cff',
          muted: '#3a5bb0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
