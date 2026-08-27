/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0f172a',    // zinc-900
          darker: '#09090b',  // zinc-950
          accent: '#10b981',  // emerald-500
          accentHover: '#059669', // emerald-600
          glow: '#8b5cf6',    // violet-500
          text: '#f4f4f5'     // zinc-50
        }
      }
    },
  },
  plugins: [],
}