/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
        "primary-dark": "#4f46e5",
        accent: "#FF6B35",
        "text-primary": "#1a1a1a",
        "text-secondary": "#666",
        "text-tertiary": "#999",
        "bg-light": "#f3f4f6",
        "bg-lighter": "#f5f3ff",
        "bg-lightest": "#e8e6ff",
        border: "#e5e7eb",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
        "gradient-hero": "linear-gradient(135deg, #f5f3ff 0%, #e8e6ff 100%)",
      },
      boxShadow: {
        "md-custom": "0 10px 30px rgba(0, 0, 0, 0.1)",
        "lg-custom": "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        "xl-custom": "0 4px 12px rgba(99, 102, 241, 0.3)",
      },
    },
  },
  plugins: [],
}
