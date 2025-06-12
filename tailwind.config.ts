import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: "class", // often added by shadcn
  theme: {
    extend: {
      colors: {}, // For shadcn theme colors
      borderRadius: {}, // For shadcn border radius
      keyframes: {}, // For shadcn animations
      animation: {}, // For shadcn animations
    },
  },
  plugins: [require("tailwindcss-animate")], // often added by shadcn
}
export default config
