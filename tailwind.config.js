/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/templates/**/*.html", "./app/sections.py"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        dulces: {
          50: "#FFF1F2",
          100: "#FFE4E6",
          600: "#E11D48",
          700: "#BE123C",
        },
        tecnologia: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          600: "#4F46E5",
          700: "#4338CA",
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
