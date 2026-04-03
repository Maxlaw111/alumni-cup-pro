/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5", // Modern Indigo
        secondary: "#0f172a", // Slate 900
      },
      fontFamily: {
        sans: ["Inter", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
}
