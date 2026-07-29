import type { Config } from 'tailwindcss';
import uiPreset from '@me-projects/ui/tailwind-preset';

export default {
  presets: [uiPreset],
  darkMode: ['class'],
  content: [
    './client/index.html',
    './client/src/**/*.{js,jsx,ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
} satisfies Config;
