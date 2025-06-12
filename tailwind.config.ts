/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    // If rice-academy-clean uses an 'app' directory for Next.js App Router, add:
    // "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // You can keep existing theme extensions if the file is being updated
      // For a new file, this can be left empty or with default desired extensions
    },
  },
  plugins: [
    // You can keep existing plugins if the file is being updated
    // require('tw-animate-css') // If tw-animate-css is a tailwind plugin, it might go here
                               // but it's currently imported in globals.css
  ],
};
