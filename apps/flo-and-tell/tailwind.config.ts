import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        comfortaa: ['Comfortaa', 'cursive'],
        quicksand: ['Quicksand', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        // * Theme Colors - Using CSS variables for consistency
        'rose-pink': 'hsl(var(--rose-pink))',
        coral: 'hsl(var(--coral))',
        lavender: 'hsl(var(--lavender))',
        mint: 'hsl(var(--mint))',
        peach: 'hsl(var(--peach))',
        cream: 'hsl(var(--cream))',
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
      },
      transitionDuration: {
        fast: 'var(--motion-fast)',
        base: 'var(--motion-base)',
        slow: 'var(--motion-slow)',
      },
      transitionTimingFunction: {
        ease: 'var(--motion-ease)',
        'ease-in': 'var(--motion-ease-in)',
        'ease-out': 'var(--motion-ease-out)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-out': {
          from: { opacity: '1', transform: 'translateY(0)' },
          to: { opacity: '0', transform: 'translateY(4px)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'scale-out': {
          from: { opacity: '1', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(0.96)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'page-enter': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'confetti-fall': {
          '0%': {
            transform: 'translateY(0) translateX(0) rotate(0deg)',
            opacity: '1',
          },
          '100%': {
            transform:
              'translateY(100vh) translateX(var(--x-drift, 0px)) rotate(720deg)',
            opacity: '0',
          },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-4px)' },
          '40%, 80%': { transform: 'translateX(4px)' },
        },
        checkmark: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-in-up': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-out-up': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-8px)', opacity: '0' },
        },
      },
      animation: {
        'accordion-down':
          'accordion-down var(--motion-base) var(--motion-ease-out)',
        'accordion-up':
          'accordion-up var(--motion-base) var(--motion-ease-out)',
        'fade-in': 'fade-in var(--motion-base) var(--motion-ease)',
        'fade-out': 'fade-out var(--motion-base) var(--motion-ease)',
        'scale-in': 'scale-in var(--motion-fast) var(--motion-ease-out)',
        'scale-out': 'scale-out var(--motion-fast) var(--motion-ease-in)',
        'slide-up': 'slide-up var(--motion-base) var(--motion-ease-out)',
        'slide-down': 'slide-down var(--motion-base) var(--motion-ease-out)',
        'pulse-soft': 'pulse-soft 2s var(--motion-ease) infinite',
        'bounce-subtle': 'bounce-subtle 1s var(--motion-ease) infinite',
        'slide-in-left':
          'slide-in-left var(--motion-slow) var(--motion-ease-out)',
        'page-enter': 'page-enter 300ms var(--motion-ease-out) forwards',
        'confetti-fall': 'confetti-fall 2s ease-out forwards',
        shimmer: 'shimmer 2s linear infinite',
        shake: 'shake 0.4s ease-out',
        checkmark: 'checkmark 0.3s ease-out forwards',
        'slide-in-up': 'slide-in-up 0.2s ease-out',
        'slide-out-up': 'slide-out-up 0.2s ease-out',
      },
      boxShadow: {
        soft: 'var(--shadow-base)',
        card: 'var(--shadow-md)',
        glow: 'var(--shadow-ring)',
        lg: 'var(--shadow-lg)',
      },
      dropShadow: {
        soft: '0 10px 8px rgba(0,0,0,0.04)',
        glow: '0 0 2px hsl(var(--ring) / 0.35)',
      },
      spacing: {
        // * Unified spacing scale - 4px base unit
        '18': '4.5rem', // 72px
        '22': '5.5rem', // 88px
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
