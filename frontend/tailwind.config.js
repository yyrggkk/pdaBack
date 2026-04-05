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
        primary: "#005322",
        "primary-container": "#006e2f",
        surface: "#f9f9ff",
        "on-surface": "#111c2d",
        "surface-container-low": "#f0f3ff",
        "surface-container-lowest": "#ffffff",
        outline: "#6f7a6e",
        "outline-variant": "#becabc",
        "status-occupied": "#EF4444",
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px"
      },
      fontFamily: {
        jakarta: ["PlusJakartaSans_400Regular"],
        "jakarta-bold": ["PlusJakartaSans_700Bold"],
        work: ["WorkSans_400Regular"],
        "work-bold": ["WorkSans_600SemiBold"],
      }
    },
  },
  plugins: [],
}

