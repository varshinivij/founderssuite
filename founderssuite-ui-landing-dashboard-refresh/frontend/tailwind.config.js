/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          dark: "#1a1a2e",
          accent: "#2d1b4e",
          card: "#2d1b4e",
        },
        purple: {
          deep: "#210b2c",
          mid: "#3d1454",
          DEFAULT: "#8b5cf6",
          light: "#a78bfa",
          soft: "#c084fc",
        },
        accent: {
          peach: "#f7d9c4",
          champagne: "#f2a58e",
          sand: "#e8c9a0",
          "dusty-rose": "#d4a5a5",
        },
        neutral: {
          "off-white": "#faf9fd",
          "text-gray": "#a8a9ad",
          "text-muted": "#6b7280",
          "muted-gray": "#584566",
          "near-black": "#0a0a0f",
          "rich-black": "#0f0f15",
        },
        match: {
          red: "#dc2626",
          yellow: "#eab308",
          green: "#22c55e",
        },
        border: "#3f3f46",
        divider: "#27272a",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        "page-header": ["96px", { lineHeight: "100%", fontWeight: "800" }],
        "section-header": ["32px", { lineHeight: "120%", fontWeight: "800" }],
        subsection: ["24px", { lineHeight: "140%", fontWeight: "600" }],
      },
      boxShadow: {
        card: "0 4px 12px rgba(0, 0, 0, 0.25)",
        "card-hover": "0 12px 32px rgba(139, 92, 246, 0.15)",
        modal: "0 20px 60px rgba(0, 0, 0, 0.5)",
      },
      borderRadius: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
      },
    },
  },
  plugins: [],
};

