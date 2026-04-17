/** @type {import("tailwindcss").Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f8fafc",
          100: "#e2e8f0",
          900: "#0f172a",
          950: "#020617",
        },
        brand: {
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0f766e",
        },
      },
      boxShadow: {
        panel: "0 20px 60px rgba(15, 23, 42, 0.12)",
      },
      fontFamily: {
        sans: ["Satoshi", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
