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
        "primary-fixed": "#9af7a8",
        secondary: "#b61622",
        "secondary-container": "#da3437",
        "secondary-fixed": "#ffdad7",
        tertiary: "#80253d",
        "tertiary-container": "#9f3d54",
        surface: "#f9f9ff",
        "surface-bright": "#f9f9ff",
        "surface-dim": "#cfdaf2",
        "surface-container": "#e7eeff",
        "surface-container-low": "#f0f3ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-high": "#dee8ff",
        "surface-container-highest": "#d8e3fb",
        "surface-variant": "#d8e3fb",
        "on-surface": "#111c2d",
        "on-surface-variant": "#3f493f",
        "on-primary": "#ffffff",
        "on-primary-container": "#91ee9f",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#fffbff",
        outline: "#6f7a6e",
        "outline-variant": "#becabc",
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
        "inverse-surface": "#263143",
        "inverse-on-surface": "#ecf1ff",
        "inverse-primary": "#7fda8e",
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
