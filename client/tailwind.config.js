/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        "max-sm": { max: "800px" },
        "max-w-xs": { max: "525px" },

        max: { min: "440px" },
        md: { min: "900px" },
        sm: { min: "800px" },
        print: { raw: "print" },
      },

      animation: {
        "carousel-slide": "carousel 0.8s ease-in-out",
      },

      keyframes: {
        carousel: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
    },
  },
  plugins: [
    require("daisyui"),
    require("@tailwindcss/line-clamp"),
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".hide-scrollbar": {
          /* For webkit-based browsers */
          "-webkit-overflow-scrolling": "touch",
          "-ms-overflow-style": "none", // For IE and Edge
          "scrollbar-width": "none", // For Firefox
        },
        ".hide-scrollbar::-webkit-scrollbar": {
          display: "none", // For Chrome, Safari, and Edge
        },
      });
    }),
  ],
};
