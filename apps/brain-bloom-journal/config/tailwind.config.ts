import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Journal theme colors
        journal: {
          primary: "hsl(var(--journal-primary))",
          "primary-light": "hsl(var(--journal-primary-light))",
          secondary: "hsl(var(--journal-secondary))",
          accent: "hsl(var(--journal-accent))",
          text: "hsl(var(--journal-text))",
          "text-light": "hsl(var(--journal-text-light))",
          bg: "hsl(var(--journal-bg))",
          card: "hsl(var(--journal-card))",
          border: "hsl(var(--journal-border))",
        },
        // Newspaper theme colors
        newspaper: {
          cream: "hsl(var(--newspaper-cream))",
          navy: "hsl(var(--newspaper-navy))",
          gold: "hsl(var(--newspaper-gold))",
          charcoal: "hsl(var(--newspaper-charcoal))",
        },
        // Newsprint Design System colors
        newsprint: {
          bg: "hsl(var(--newsprint-bg))",
          foreground: "hsl(var(--newsprint-foreground))",
          muted: "hsl(var(--newsprint-muted))",
          accent: "hsl(var(--newsprint-accent))",
          border: "hsl(var(--newsprint-border))",
          headline: "hsl(var(--newsprint-headline))",
          body: "hsl(var(--newsprint-body))",
          caption: "hsl(var(--newsprint-caption))",
          link: "hsl(var(--newsprint-link))",
          "link-hover": "hsl(var(--newsprint-link-hover))",
          success: "hsl(var(--newsprint-success))",
          warning: "hsl(var(--newsprint-warning))",
          info: "hsl(var(--newsprint-info))",
          neutral: {
            100: "hsl(var(--newsprint-neutral-100))",
            200: "hsl(var(--newsprint-neutral-200))",
            400: "hsl(var(--newsprint-neutral-400))",
            500: "hsl(var(--newsprint-neutral-500))",
            600: "hsl(var(--newsprint-neutral-600))",
            700: "hsl(var(--newsprint-neutral-700))",
          },
        },
        // Audio theme colors
        audio: {
          primary: "hsl(var(--audio-primary))",
          secondary: "hsl(var(--audio-secondary))",
          bg: "hsl(var(--audio-bg))",
        },
        sidebar: {
          background: "hsl(var(--sidebar-background))",
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
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        none: "0px", // Newsprint: sharp corners
      },
      fontFamily: {
        inter: ["Inter", "system-ui", "sans-serif"],
        playfair: ["Playfair Display", "serif"],
        crimson: ["Crimson Text", "serif"],
        journal: ["var(--font-journal)"],
        newspaper: ["Crimson Text", "Times New Roman", "serif"],
        // Newsprint Design System fonts
        "newsprint-serif": ["'Playfair Display'", "'Times New Roman'", "serif"],
        "newsprint-body": ["'Lora'", "Georgia", "serif"],
        "newsprint-sans": ["'Inter'", "'Helvetica Neue'", "sans-serif"],
        "newsprint-mono": ["'JetBrains Mono'", "'Courier New'", "monospace"],
      },
      backgroundImage: {
        "gradient-journal": "var(--gradient-journal)",
        "gradient-soft": "var(--gradient-soft)",
      },
      boxShadow: {
        journal: "var(--shadow-journal)",
        soft: "var(--shadow-soft)",
        medium: "var(--shadow-medium)",
        strong: "var(--shadow-strong)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-in-left": "slide-in-left 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        "scale-in": "scale-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
  // Safelist for dynamically generated classes
  safelist: [
    'animate-fade-in',
    'animate-bounce',
    'animate-pulse',
    'delay-100',
    'delay-200',
  ],
} satisfies Config;