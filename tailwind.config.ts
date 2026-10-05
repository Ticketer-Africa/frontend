import type { Config } from "tailwindcss";

// all in fixtures is set to tailwind v3 as interims solutions

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Syne", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Clash Grotesk", "Syne", "ui-sans-serif", "sans-serif"],
      },
      fontSize: {
        caption: ["10px", { lineHeight: "1.4" }],
        // Fluid display scale for Syne ExtraBold, whose glyphs are ~11.2x the font
        // size wide for a 16-char line: capped by viewport (7.8vw) on phones so the
        // line never touches the screen edge, easing up to the 72px desktop hero.
        "fluid-hero": [
          "clamp(1.5rem, min(7.8vw, 0.45rem + 6.3vw), 4.5rem)",
          { lineHeight: "1.1", letterSpacing: "-0.02em" },
        ],
        "fluid-h1": [
          "clamp(1.875rem, 1.3rem + 2.9vw, 3rem)",
          { lineHeight: "1.12", letterSpacing: "-0.015em" },
        ],
        "fluid-h2": [
          "clamp(1.625rem, 1.2rem + 2vw, 2.5rem)",
          { lineHeight: "1.15", letterSpacing: "-0.01em" },
        ],
        "fluid-h3": [
          "clamp(1.25rem, 1.05rem + 1vw, 1.75rem)",
          { lineHeight: "1.25" },
        ],
        "fluid-lead": [
          "clamp(1rem, 0.92rem + 0.45vw, 1.25rem)",
          { lineHeight: "1.6" },
        ],
      },
      screens: {
        xs: "420px",
      },
      spacing: {
        navbar: "60px",
        sidebar: "16rem",
      },
      willChange: {
        opacity: "opacity",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
