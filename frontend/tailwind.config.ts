import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#faf8ff',
        surface: '#faf8ff',
        surface_container: '#eaedff',
        surface_container_low: '#f2f3ff',
        surface_container_high: '#e2e7ff',
        surface_container_lowest: '#ffffff',
        primary: '#003d9b',
        primary_container: '#0052cc',
        secondary: '#515f74',
        secondary_container: '#d5e3fd',
        error: '#ba1a1a',
        error_container: '#ffdad6',
      },
    },
  },
  plugins: [],
}
export default config
