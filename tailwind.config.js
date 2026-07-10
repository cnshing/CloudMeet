import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Primitive Scales ──────────────────────────────────────────────
        //
        // The gray scale overrides Tailwind's default gray with the design
        // system values, so existing `gray-*` classes automatically reflect
        // the design tokens without any component surgery.
        gray: {
          50:  '#f3f4f1',
          100: '#e5e6e3',
          200: '#cdcecb',
          300: '#b3b4b1',
          400: '#9c9d9b',
          500: '#80807f',
          600: '#676866',
          700: '#555655',
          800: '#444444',
          900: '#3b3b3b',
        },

        // Neon green (primitivesGreenNeonGreen*)
        'neon-green': {
          50:  '#d4ff89',
          100: '#b9ff49',
          200: '#a3df42',
          300: '#8fc33c',
          400: '#7eaa37',
          500: '#688b2f',
          600: '#5c7b2b',
          700: '#475c24',
          800: '#394a1e',
          900: '#33401c',
        },

        // Pastel green (primitivesGreenPastelGreen*)
        'pastel-green': {
          50:  '#ebf4d8',
          100: '#dbecbb',
          200: '#b7d97b',
          300: '#86c322',
          400: '#77ac22',
          500: '#628c20',
          600: '#587c1f',
          700: '#445d1b',
          800: '#374a18',
          900: '#314117',
        },

        // Brand blacks (primitivesBlackBlack*)
        'brand-black': {
          1000: '#212121',
          1050: '#191919',
          1150: '#0c0c0c',
        },

        // Brand white (primitivesWhiteWhite0)
        'brand-white': '#fafafa',

        // ── Semantic Tokens ───────────────────────────────────────────────
        //
        // All semantic tokens are backed by CSS custom properties defined in
        // app.css.  Light-mode values live in :root, dark-mode overrides in
        // .dark.  Toggle the `dark` class on <html> to switch themes.
        //
        // Usage examples:
        //   bg-background      → page background
        //   bg-surface         → card / panel background
        //   text-foreground    → primary body text
        //   text-accent        → brand-tinted accent text
        //   bg-primary         → button fill
        //   text-primary-foreground → text on primary button
        //   border-border      → default border (shadcn convention)
        //   border-border-strong → high-contrast border / brand accent border

        // Backgrounds
        background:             'var(--color-background)',
        'background-gradient':  'var(--color-background-gradient)',
        surface:                'var(--color-surface)',
        'surface-2':            'var(--color-surface-2)',

        // Foreground / text
        foreground:             'var(--color-foreground)',
        'muted-foreground':     'var(--color-muted-foreground)',
        'subtle-foreground':    'var(--color-subtle-foreground)',

        // Accent (brand highlight)
        accent:                 'var(--color-accent)',
        'accent-subtle':        'var(--color-accent-subtle)',

        // Primary action (button)
        primary:                'var(--color-primary)',
        'primary-foreground':   'var(--color-primary-foreground)',

        // Borders  (follows the shadcn/ui `border-border` naming convention)
        border:                 'var(--color-border)',
        'border-strong':        'var(--color-border-strong)',
        'border-subtle':        'var(--color-border-subtle)',
        'border-medium':        'var(--color-border-medium)',
        'border-primary':       'var(--color-border-primary)',
        'border-icon':          'var(--color-border-icon)',
      },
    },
  },
  plugins: [forms, typography],
};
