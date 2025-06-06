/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#646cff', // azul Kustodia
        primaryDark: '#535bf2',
        accent: '#e0e7ff',
        accentLight: '#c7d2fe',
        background: '#f1f5f9',
        text: '#213547',
        secondary: '#747bff',
      },
    },
  },
  plugins: [],
};
