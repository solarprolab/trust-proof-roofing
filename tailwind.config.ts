import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#f0f7f4', 100: '#d9ede2', 200: '#b5dbc7', 300: '#85c2a5', 400: '#57a680', 500: '#368a63', 600: '#276e4f', 700: '#205941', 800: '#1c4735', 900: '#183b2d', 950: '#0c2119' },
        accent: { 50: '#fef8ee', 100: '#fcefd8', 200: '#f8dbb0', 300: '#f3c17d', 400: '#eda048', 500: '#e98825', 600: '#da6e1b', 700: '#b55418', 800: '#91431b', 900: '#753919', 950: '#3f1b0b' },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
