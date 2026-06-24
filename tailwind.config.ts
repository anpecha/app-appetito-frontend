import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        text: {
          primary: 'hsl(var(--text-primary))',
          secondary: 'hsl(var(--text-secondary))',
          muted: 'hsl(var(--text-muted))',
          'on-dark': 'hsl(var(--text-on-dark))',
          'on-brand': 'hsl(var(--text-on-brand))',
        },
        surface: {
          page: 'hsl(var(--surface-page))',
          section: 'hsl(var(--surface-section))',
          card: 'hsl(var(--surface-card))',
          subtle: 'hsl(var(--surface-subtle))',
          elevated: 'hsl(var(--surface-elevated))',
        },
        action: {
          primary: {
            DEFAULT: 'hsl(var(--action-primary))',
            hover: 'hsl(var(--action-primary-hover))',
            active: 'hsl(var(--action-primary-active))',
          },
          secondary: 'hsl(var(--action-secondary))',
          strong: {
            DEFAULT: 'hsl(var(--action-strong))',
            hover: 'hsl(var(--action-strong-hover))',
          },
        },
        border: {
          DEFAULT: 'hsl(var(--border-default))',
          subtle: 'hsl(var(--border-subtle))',
          focus: 'hsl(var(--border-focus))',
        },
        status: {
          success: 'hsl(var(--status-success))',
          warning: 'hsl(var(--status-warning))',
          error: 'hsl(var(--status-error))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        'radius-sm': '6px',
        'radius-md': '8px',
        'radius-lg': '12px',
        'radius-xl': '16px',
        'radius-2xl': '24px',
        'radius-full': '9999px',
      },
      boxShadow: {
        'shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'shadow-card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'shadow-card-hover':
          '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'shadow-button-primary':
          '0 4px 6px -1px hsla(44, 100%, 58%, 0.4), 0 2px 4px -1px hsla(44, 100%, 58%, 0.2)',
      },
      spacing: {
        'space-1': '4px',
        'space-2': '8px',
        'space-3': '12px',
        'space-4': '16px',
        'space-6': '24px',
        'space-8': '32px',
        'space-12': '48px',
        'space-16': '64px',
        'space-20': '80px',
      },
      fontSize: {
        'text-xs': '12px',
        'text-sm': '14px',
        'text-base': '16px',
        'text-lg': '18px',
        'text-xl': '20px',
        'text-2xl': '24px',
        'text-3xl': '30px',
        'text-4xl': '36px',
        'text-5xl': '48px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
