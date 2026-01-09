/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1773cf",
        "background-light": "#f6f7f8",
        "background-dark": "#111921",
        "surface-dark": "#1a2632",
        "surface-card": "#243647",
        "border-dark": "#344d65",
        "text-muted-dark": "#93adc8",
        "status-good": "#10b981",
        "status-maintain": "#f59e0b",
        "status-replace": "#ef4444",
      },
      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
}
