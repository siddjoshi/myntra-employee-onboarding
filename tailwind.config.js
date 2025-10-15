/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        myntra: {
          primary: '#ff3f6c',
          secondary: '#282c3f',
          accent: '#ff905a',
          light: '#f5f5f6',
          dark: '#282c3f',
        },
      },
    },
  },
  plugins: [],
}
