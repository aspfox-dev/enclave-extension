/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#111215',
          raised: '#17181d',
          elevated: '#1d1e24',
          border: '#2b2d38',
          borderStrong: '#44475a',
        },
        accent: {
          DEFAULT: '#5e6ad2',
          muted: '#3d4494',
        },
        status: {
          success: '#3dd68c',
          warning: '#f0a940',
          error: '#e05c5c',
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
