import type { Config } from 'tailwindcss';

// Brand tokens from Matchlight_Brand.md. Mirrored as CSS variables in src/index.css.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        char: 'rgb(var(--c-char) / <alpha-value>)',
        bone: 'rgb(var(--c-bone) / <alpha-value>)',
        smoke: 'rgb(var(--c-smoke) / <alpha-value>)',
        ember: 'rgb(var(--c-ember) / <alpha-value>)',
        'ember-deep': 'rgb(var(--c-ember-deep) / <alpha-value>)',
        flare: 'rgb(var(--c-flare) / <alpha-value>)',
        ash: 'rgb(var(--c-ash) / <alpha-value>)',
        slate: 'rgb(var(--c-slate) / <alpha-value>)',
        line: 'var(--line)',
      },
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        display: ['88px', { lineHeight: '92px', letterSpacing: '-0.03em', fontWeight: '600' }],
        h1: ['64px', { lineHeight: '68px', letterSpacing: '-0.025em', fontWeight: '600' }],
        h2: ['40px', { lineHeight: '46px', letterSpacing: '-0.02em', fontWeight: '600' }],
        h3: ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '500' }],
        'body-l': ['20px', { lineHeight: '32px' }],
        body: ['17px', { lineHeight: '28px' }],
        label: ['13px', { lineHeight: '16px', letterSpacing: '0.08em', fontWeight: '500' }],
      },
      maxWidth: { site: '1200px' },
      borderRadius: { card: '16px' },
      transitionTimingFunction: {
        prisma: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
