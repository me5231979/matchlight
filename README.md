# Matchlight

Marketing site for Matchlight. Vite, React 18, TypeScript, Tailwind 3, GSAP (ScrollTrigger, SplitText), Lenis, and Three.js through `@react-three/fiber`.

`Matchlight_Brand.md` is the source of truth for copy, color, type, and motion. `Matchlight_Site_Build_Prompt.md` is the original build brief.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build to dist/
npm run preview    # serve dist/ at http://localhost:4173
```

## Deploy (Vercel)

`vercel.json` is set up for a Vite static build (`npm run build`, output `dist`, immutable caching on `/assets`).

```bash
npx vercel          # preview deployment
npx vercel --prod   # production
```

Or import the GitHub repo in the Vercel dashboard. No environment variables are needed.

## Structure

| Path | What it is |
|---|---|
| `src/components/Preloader.tsx` | The Strike: line draws, spark flares, radial ignite reveal. Skipped on repeat visits and reduced motion. |
| `src/components/Hero.tsx`, `HeroWorlds.tsx` | Two worlds in one frame. The surface is the classroom: one slide broadcast to rows of seats, an LMS sidebar, a completion certificate. Underneath is the floor of the work: a lit horizon, people out of their seats in a live sim, coached by AI, shipping. The cursor is a match whose ember lens burns through. It drifts on its own with no cursor; scrolling out widens it until the old world is gone. |
| `src/components/SparkField.tsx` | WebGL ember particles (custom GLSL, one draw call). Desktop only, lazy loaded after first paint. Phones get a CSS glow. |
| `src/components/BurnSection.tsx` | Seat time. Completions. Smile sheets. Hours logged. burn away through an SVG noise threshold with Ember edges and ash, then *Capability.* rises. |
| `src/components/Offerings.tsx` | What we do: Consult, Build, Partner as sticky stacking cards (after MotionSites `nimbus-sticky-cards`). |
| `src/components/StrikeProcess.tsx` | Pinned horizontal track; a strike line lights Strike, First light, Shape, Ship. Vertical on mobile. |
| `src/components/Beliefs.tsx` | Five beliefs, scrubbed blur-to-sharp reveal with weight and tracking shifts, ellipse wipe entry. |
| `src/components/ProofStrip.tsx` | **Placeholder** marquee. Replace with real logos or build screenshots. |
| `src/components/CTA.tsx` | Cursor carries an ember glow; the button burns brighter as you approach. |
| `src/components/Footer.tsx` | Oversized wordmark bleeding off the bottom (after `nietzsche-sustainibilty`). |
| `src/components/Nav.tsx` | Hover or click the logo for the full-screen menu with previews. |
| `src/components/Cursor.tsx` | Dot to ring cursor with labels. Fine pointers only. |
| `src/lib/content.ts` | All site copy. |
| `src/lib/motion.ts` | GSAP registration, Lenis, media hooks, idle-time section setup. |
| `tailwind.config.ts`, `src/index.css` | Brand tokens as Tailwind theme and CSS variables. |

## Accessibility and performance

- `prefers-reduced-motion`: no preloader, no WebGL, no video, no scrubbing. Static lens, static layouts.
- Fonts are self-hosted (Geist, Geist Mono, Instrument Serif; SIL Open Font License), latin subset, preloaded.
- Everything in the hero is drawn in code (SVG, CSS, WebGL); no stock footage or third-party media. Three.js loads after first paint. Section ScrollTriggers set up in idle time, one section per task.
- One `h1`, landmarks for nav, main, and footer, skip link, Ember focus rings, focus trap in the menu.

## Placeholders to replace before launch

- `hello@matchlight.ai` contact address (Nav, CTA, Footer).
- LinkedIn link in the footer points to linkedin.com.
- Proof strip entries.
- Scenes and numbers in the hero and service cards (shipped day 9, capability map gaps) are illustrative.
