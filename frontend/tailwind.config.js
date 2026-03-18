export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#D4AF37",
        "primary-dark": "#B8860B",
        accent: "#FFD700",
        danger: "#ef476f",
        dark: "#000000",
        "dark-soft": "#121212",
        light: "#f8faff",
        "gold-light": "#F5E6BE",
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
