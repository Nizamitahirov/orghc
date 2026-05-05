/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // Explicitly set the dark mode strategy to 'class'
  theme: {
    extend: {
      colors: {
        // Original primary colors
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#2346A8",
          600: "#1e3a8a",
          700: "#1e40af",
          800: "#1e3a8a",
          900: "#1e3b8a",
          950: "#172554",
        },
        // New Almet custom colors
        almet: {
          mystic: "#e7ebf1",
          "cloud-burst": "#253360",
          "bali-hai": "#90a0b9",
          waterloo: "#7a829a",
          sapphire: "#30539b",
          astral: "#336fa5",
          "steel-blue": "#4e7db5",
          comet: "#4f5772",
          "santas-gray": "#9c9cb5",
          "san-juan": "#38587d",
        },
      },
      transitionProperty: {
        width: "width",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "fade-in": "fadeIn 0.2s ease-out both",
        "slide-up": "slideUp 0.25s ease-out both",
        "slide-down": "slideDown 0.25s ease-out both",
        "scale-in": "scaleIn 0.2s ease-out both",
      },
    },
  },
  plugins: [],
};