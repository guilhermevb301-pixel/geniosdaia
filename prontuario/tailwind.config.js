/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        jade: {
          50: "#EEFBF4",
          100: "#D6F5E3",
          200: "#B0EACB",
          300: "#7DD9AC",
          400: "#48C089",
          500: "#25A56F",
          600: "#178559",
          700: "#136A4A",
          800: "#13543D",
          900: "#114534",
          950: "#07271D",
        },
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        "ink-2": "rgb(var(--ink-2) / <alpha-value>)",
        "ink-3": "rgb(var(--ink-3) / <alpha-value>)",
        brand: "rgb(var(--brand) / <alpha-value>)",
        "brand-soft": "rgb(var(--brand-soft) / <alpha-value>)",
        "brand-ink": "rgb(var(--brand-ink) / <alpha-value>)",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        display: ['"Fraunces"', "Georgia", "Cambria", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgb(7 39 29 / 0.04), 0 4px 16px -4px rgb(7 39 29 / 0.08)",
        lift: "0 2px 4px rgb(7 39 29 / 0.06), 0 16px 40px -8px rgb(7 39 29 / 0.18)",
        glow: "0 0 0 4px rgb(37 165 111 / 0.15)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
        pulseRing: {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        shimmer: "shimmer 2.4s linear infinite",
        "pulse-ring": "pulseRing 1.6s cubic-bezier(0.2,0.6,0.4,1) infinite",
      },
    },
  },
  plugins: [],
};
