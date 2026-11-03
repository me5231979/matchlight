import type { Config } from 'tailwindcss';

// Brand tokens from Matchlight_Brand.md. Mirrored as CSS variables in src/index.css.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0E0E0C',
        char: '#1C1B19',
        bone: '#F5F2EC',
        smoke: '#E6E1D8',
        ember: '#FF5A1F',
        'ember-deep': '#B8360A',
        flare: '#FFB547',
        ash: '#8A857C',
        slate: '#5E5A53',
        line: 'rgba(245,242,236,0.08)',
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
