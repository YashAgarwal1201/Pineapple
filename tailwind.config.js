/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      'metallic-brown': '#A14712',
      'ochre': '#C27815',
      'naples-yellow': '#FFD964',
      'fern-green': '#557B3F',
      'bud-green': '#7CB35C'
    },
    extend: {},
  },
  plugins: [],
}

