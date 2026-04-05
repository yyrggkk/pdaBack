/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1D4ED8",
        green: {
          brand: "#1B7A4A",
          dark: "#145C38",
        },
      }
    },
  },
  plugins: [],
}

