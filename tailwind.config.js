/** @type {import('tailwindcss').Config} */
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "metallic-brown": "#A14712",
        ochre: "#C27815",
        "naples-yellow": "#FFD964",
        "fern-green": "#557B3F",
        "bud-green": "#7CB35C",
      },
      fontFamily: {
        heading: ["var(--heading)", ...fontFamily.sans], // Specify backup font family as serif
        content: ["var(--content)", ...fontFamily.serif], // Specify backup font family as sans-serif
      },
      screens: {
        xs: "480px",
        xl: "1280px",
        mdl: "896px",
      },
      animation: {
        spin: "spin 5s linear infinite",
        "bounce-right": "bounce-right 5s infinite",
      },
      keyframes: {
        "bounce-right": {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(20px)" }, // Adjust the distance as needed
        },
      },
      transitionDuration: {
        2000: "2000ms",
        3000: "3000ms",
        5000: "5000ms",
        // Add more custom durations if needed
      },
    },
  },
  plugins: [],
};
