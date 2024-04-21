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
      },
    },
  },
  plugins: [],
};
