/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "var(--bg-main)",
        surface: "var(--bg-surface)",
        surfaceHover: "var(--bg-surface-hover)",
        borderLight: "var(--border-color)",
        primaryText: "var(--text-primary)",
        secondaryText: "var(--text-secondary)",
        heart: "var(--accent-heart)",
        tealRisk: "var(--color-teal)",
        amberRisk: "var(--color-amber)",
        crimsonRisk: "var(--color-crimson)",
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
