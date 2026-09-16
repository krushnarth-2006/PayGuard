/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Neutral scale — used for surfaces, borders, and body text in both themes.
        ink: {
          50: "#F7F8F9",
          100: "#EEF1F3",
          200: "#DEE4E8",
          300: "#C7D0D6",
          400: "#98A6B0",
          500: "#6B7A87",
          600: "#4E5D6A",
          700: "#374551",
          800: "#212D38",
          850: "#161F29",
          900: "#0F1720",
          950: "#0A1119",
        },
        // Single restrained brand accent, teal-leaning, used sparingly.
        accent: {
          50: "#EAF7F4",
          100: "#CFEEE6",
          300: "#7BCDBB",
          400: "#3FB39D",
          500: "#158F79",
          600: "#0F7563",
          700: "#0C5F51",
        },
        // Semantic status colors — meaning-bearing, not decorative.
        safe: { 100: "#E4F4EC", 500: "#1E9A5C", 600: "#177C4A", dark: "#38C787" },
        review: { 100: "#FCF1DD", 500: "#B4790E", 600: "#8F600A", dark: "#E3A73B" },
        danger: { 100: "#FBE9E8", 500: "#C4392E", 600: "#9C2E25", dark: "#E5645A" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "12px",
        pill: "999px",
        chip: "8px",
      },
      boxShadow: {
        panel: "0 1px 2px rgba(15,23,32,0.04), 0 6px 20px -10px rgba(15,23,32,0.10)",
        "panel-dark": "0 1px 2px rgba(0,0,0,0.24), 0 8px 24px -8px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};
