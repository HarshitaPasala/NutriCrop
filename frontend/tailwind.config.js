/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nutri: {
          primary: "#174C32", // Forest green
          primaryHover: "#123C27",
          secondary: "#37804D", // Natural green
          secondaryLight: "#4E9B66",
          bg: "#F5F8F1", // Light cream-green
          card: "#FFFFFF",
          cardBorder: "#E3EAD8",
          warning: "#D97706",
          warningBg: "#FEF3C7",
          info: "#0284C7",
          infoBg: "#E0F2FE",
          accent: "#2D6A4F",
          dark: "#1B2A20",
          muted: "#5B7062"
        }
      },
      fontFamily: {
        sans: ["Inter", "Poppins", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        telugu: ["Noto Sans Telugu", "sans-serif"],
        devanagari: ["Noto Sans Devanagari", "sans-serif"],
        tamil: ["Noto Sans Tamil", "sans-serif"],
        bengali: ["Noto Sans Bengali", "sans-serif"],
        gurmukhi: ["Noto Sans Gurmukhi", "sans-serif"],
        kannada: ["Noto Sans Kannada", "sans-serif"],
        malayalam: ["Noto Sans Malayalam", "sans-serif"],
      },
      minHeight: {
        touch: "48px",
      },
      minWidth: {
        touch: "48px",
      }
    },
  },
  plugins: [],
};
