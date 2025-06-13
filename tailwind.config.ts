/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#0c3c78',
        'brand-blue-dark': '#092e5e',
        'brand-blue-hover': '#0f4fa0',
        'brand-gray': '#ccc', // for borders like border: 1px solid #ccc
        'brand-light-gray': '#f0f0f0', // for backgrounds like .remove-student-btn
        'brand-dark-gray': '#333',    // for text like .remove-student-btn
        'brand-red-hover': '#e53935', // for .remove-student-btn:hover
        'brand-amber': '#ffc107',
        'brand-amber-dark': '#e0a800',
        'brand-green': '#4CAF50',
        'brand-green-dark': '#45a049',
        'brand-explore-blue': '#3b82f6', // New color
      }
    },
  },
  plugins: [],
}