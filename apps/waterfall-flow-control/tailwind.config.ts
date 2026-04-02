import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

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
    		padding: '2rem',
    		screens: {
    			'2xl': '1400px'
    		}
    	},
    	extend: {
    		colors: {
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
			success: {
				DEFAULT: 'hsl(var(--success))',
				foreground: 'hsl(var(--success-foreground))'
			},
			warning: {
				DEFAULT: 'hsl(var(--warning))',
				foreground: 'hsl(var(--warning-foreground))'
			},
			info: {
				DEFAULT: 'hsl(var(--info))',
				foreground: 'hsl(var(--info-foreground))'
			}
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		spacing: {
    			'18': '4.5rem',
    			'88': '22rem'
    		},
    		fontSize: {
    			'2xs': [
    				'0.625rem',
    				{
    					lineHeight: '0.75rem'
    				}
    			]
    		},
		keyframes: {
			'accordion-down': {
				from: { height: '0' },
				to: { height: 'var(--radix-accordion-content-height)' }
			},
			'accordion-up': {
				from: { height: 'var(--radix-accordion-content-height)' },
				to: { height: '0' }
			},
			'fade-in': {
				'0%': { opacity: '0', transform: 'translateY(4px)' },
				'100%': { opacity: '1', transform: 'translateY(0)' }
			},
			'fade-up': {
				'0%': { opacity: '0', transform: 'translateY(8px)' },
				'100%': { opacity: '1', transform: 'translateY(0)' }
			},
			'fade-down': {
				'0%': { opacity: '0', transform: 'translateY(-8px)' },
				'100%': { opacity: '1', transform: 'translateY(0)' }
			},
			'scale-in': {
				'0%': { transform: 'scale(0.95)', opacity: '0' },
				'100%': { transform: 'scale(1)', opacity: '1' }
			},
			'scale-out': {
				'0%': { transform: 'scale(1)', opacity: '1' },
				'100%': { transform: 'scale(0.95)', opacity: '0' }
			},
			'slide-in-right': {
				'0%': { transform: 'translateX(100%)' },
				'100%': { transform: 'translateX(0)' }
			},
			'slide-in-left': {
				'0%': { transform: 'translateX(-100%)' },
				'100%': { transform: 'translateX(0)' }
			},
			'slide-out-right': {
				'0%': { transform: 'translateX(0)' },
				'100%': { transform: 'translateX(100%)' }
			},
			'slide-out-left': {
				'0%': { transform: 'translateX(0)', opacity: '1' },
				'100%': { transform: 'translateX(-100%)', opacity: '0' }
			},
			'collapse-height': {
				'0%': { height: 'var(--height)', opacity: '1', marginBottom: 'var(--margin)' },
				'100%': { height: '0', opacity: '0', marginBottom: '0' }
			},
			'draw-in': {
				'0%': { strokeDashoffset: 'var(--path-length)' },
				'100%': { strokeDashoffset: '0' }
			},
			'shimmer': {
				'100%': { transform: 'translateX(100%)' }
			},
			'pulse-soft': {
				'0%, 100%': { opacity: '1' },
				'50%': { opacity: '0.7' }
			},
			'bounce-subtle': {
				'0%, 100%': { transform: 'translateY(0)' },
				'50%': { transform: 'translateY(-5%)' }
			},
			'spin-slow': {
				'0%': { transform: 'rotate(0deg)' },
				'100%': { transform: 'rotate(360deg)' }
			},
			'float': {
				'0%, 100%': { transform: 'translateY(0)' },
				'50%': { transform: 'translateY(-10px)' }
			},
			'glow-pulse': {
				'0%, 100%': { boxShadow: '0 0 20px -5px hsl(var(--primary) / 0.3)' },
				'50%': { boxShadow: '0 0 30px -5px hsl(var(--primary) / 0.5)' }
			},
			'success-check': {
				'0%': { transform: 'scale(0) rotate(-45deg)', opacity: '0' },
				'50%': { transform: 'scale(1.2) rotate(-45deg)', opacity: '1' },
				'100%': { transform: 'scale(1) rotate(-45deg)', opacity: '1' }
			},
			// Creative UI animations
			'breathing': {
				'0%, 100%': { transform: 'scale(1)', opacity: '0.6' },
				'50%': { transform: 'scale(1.03)', opacity: '0.9' }
			},
			'hint-bounce': {
				'0%, 100%': { transform: 'translateY(0)' },
				'15%': { transform: 'translateY(-6px)' },
				'30%': { transform: 'translateY(0)' },
				'45%': { transform: 'translateY(-4px)' },
				'60%': { transform: 'translateY(0)' }
			},
			'ripple': {
				'0%': { transform: 'scale(0)', opacity: '0.6' },
				'100%': { transform: 'scale(2.5)', opacity: '0' }
			},
			'ambient-drift': {
				'0%, 100%': { transform: 'translate(0, 0) scale(1)' },
				'25%': { transform: 'translate(5%, 3%) scale(1.02)' },
				'50%': { transform: 'translate(0, 5%) scale(1)' },
				'75%': { transform: 'translate(-3%, 2%) scale(0.98)' }
			},
			'ambient-drift-reverse': {
				'0%, 100%': { transform: 'translate(0, 0) scale(1)' },
				'25%': { transform: 'translate(-4%, -2%) scale(0.98)' },
				'50%': { transform: 'translate(0, -4%) scale(1)' },
				'75%': { transform: 'translate(3%, -1%) scale(1.02)' }
			},
			'grow-bar': {
				'0%': { transform: 'scaleY(0)', opacity: '0' },
				'100%': { transform: 'scaleY(1)', opacity: '1' }
			},
			'sparkle': {
				'0%, 100%': { opacity: '0', transform: 'scale(0) rotate(0deg)' },
				'50%': { opacity: '1', transform: 'scale(1) rotate(180deg)' }
			}
		},
		animation: {
			'accordion-down': 'accordion-down 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
			'accordion-up': 'accordion-up 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
			'fade-in': 'fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
			'fade-up': 'fade-up 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
			'fade-down': 'fade-down 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
			'scale-in': 'scale-in 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
			'scale-out': 'scale-out 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
			'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
			'slide-in-left': 'slide-in-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
			'slide-out-right': 'slide-out-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
			'slide-out-left': 'slide-out-left 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
			'collapse-height': 'collapse-height 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
			'draw-in': 'draw-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards',
			'shimmer': 'shimmer 2s infinite',
			'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
			'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
			'spin-slow': 'spin-slow 3s linear infinite',
			'float': 'float 3s ease-in-out infinite',
			'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
			'success-check': 'success-check 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
			// Creative UI animations
			'breathing': 'breathing 3s ease-in-out infinite',
			'hint-bounce': 'hint-bounce 2s ease-in-out',
			'ripple': 'ripple 0.6s ease-out forwards',
			'ambient-drift': 'ambient-drift 20s ease-in-out infinite',
			'ambient-drift-reverse': 'ambient-drift-reverse 25s ease-in-out infinite',
			'grow-bar': 'grow-bar 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
			'sparkle': 'sparkle 1.5s ease-in-out infinite'
		},
    		boxShadow: {
    			'2xs': 'var(--shadow-2xs)',
    			xs: 'var(--shadow-xs)',
    			sm: 'var(--shadow-sm)',
    			md: 'var(--shadow-md)',
    			lg: 'var(--shadow-lg)',
    			xl: 'var(--shadow-xl)',
    			'2xl': 'var(--shadow-2xl)'
    		},
    		fontFamily: {
    			sans: [
    				'Source Sans Pro',
    				'ui-sans-serif',
    				'system-ui',
    				'-apple-system',
    				'BlinkMacSystemFont',
    				'Segoe UI',
    				'Roboto',
    				'Helvetica Neue',
    				'Arial',
    				'Noto Sans',
    				'sans-serif'
    			],
    			serif: [
    				'Source Serif Pro',
    				'ui-serif',
    				'Georgia',
    				'Cambria',
    				'Times New Roman',
    				'Times',
    				'serif'
    			],
    			mono: [
    				'Source Code Pro',
    				'ui-monospace',
    				'SFMono-Regular',
    				'Menlo',
    				'Monaco',
    				'Consolas',
    				'Liberation Mono',
    				'Courier New',
    				'monospace'
    			]
    		}
    	}
    },
	plugins: [tailwindcssAnimate],
} satisfies Config;
