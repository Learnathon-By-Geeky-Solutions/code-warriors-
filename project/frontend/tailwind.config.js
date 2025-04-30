// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // Adjust based on your project structure
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: {
          DEFAULT: 'rgb(var(--border))', // Using CSS variable for border color
        },
        // ... other custom colors ...
      },
    },
  },
  plugins: [],
}
