/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/templates/**/*.html", "./app/sections.py"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        // Warm neutral scale (replaces Tailwind's default cool "slate"), derived from the
        // LUZURY STORE design (oklch, hue ~50-60) so every existing slate-* class
        // across the templates picks up the new palette without touching each file.
        slate: {
          50: "#FCF5F0",
          100: "#F8F0EA",
          200: "#E2D9D2",
          300: "#C6BBB4",
          400: "#9F9690",
          500: "#72665F",
          600: "#564A43",
          700: "#41352F",
          800: "#302621",
          900: "#251A15",
        },
        canvas: "#EEE6E0",
        dulces: {
          50: "#FFE7DF",
          100: "#FFE7DF",
          600: "#CB4A2A",
          700: "#AF2F09",
        },
        tecnologia: {
          50: "#DFF3F3",
          100: "#DFF3F3",
          600: "#008687",
          700: "#006E70",
        },
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "card-hover": "0 4px 12px 0 rgb(0 0 0 / 0.08)",
      },
    },
  },
  plugins: [],
};
