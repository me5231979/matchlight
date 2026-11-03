# Build Prompt: Matchlight Website

Paste everything below into Claude Code with the MotionSites MCP connected. Put `Matchlight_Brand.md` in the project root first.

---

## ROLE

You are a senior creative developer at a studio that wins Awwwards Site of the Day. Build the marketing site for **Matchlight**, a capability firm. It should feel like a hardware launch page crossed with a top WebGL studio site: dark, cinematic, precise, and fast.

Build a site people send to each other. Not a template.

## THE COMPANY

**Matchlight builds what replaces L&D.**
L&D as we know it is over. Learning isn't the product. Capability is.

Three offerings:
1. **Matchlight Studio**: custom capability builds and consulting for organizations. Simulations, interactive experiences, platforms, sites, and media. Delivered as a hosted site, a SCORM package, or a repo the client owns.
2. **Matchbook**: ready-to-run courses at $99 each. Every course ships with an LMS file, a classroom version, and a facilitator guide.
3. **Matchlight Academy**: open-enrollment programs for individuals.

The core metaphor is **a match striking in a dark room.** One spark, then light. Every design decision serves that.

---

## STEP 1: READ THE BRAND

Read `Matchlight_Brand.md` before writing any code. It is the source of truth for copy, color, type, and motion. Brand tokens override anything that conflicts in the MotionSites prompts.

The non-negotiables:

| Token | Value |
|---|---|
| Ink (background) | `#0E0E0C` |
| Char (surfaces) | `#1C1B19` |
| Bone (text) | `#F5F2EC` |
| Ember (the one accent) | `#FF5A1F` |
| Ember Deep (accent on light) | `#B8360A` |
| Flare (glow only, never text) | `#FFB547` |
| Ash (muted text) | `#8A857C` |
| Display and body font | Geist 400/500/600 |
| Accent font | Instrument Serif Italic. One word per headline, in Ember. |
| Label font | Geist Mono 500, uppercase, +8% tracking |

**Rule: one Ember moment per screen.** About 80% Ink, 15% Bone, 5% Ember.

**Voice rule:** no em dashes anywhere in the copy. No hype words (unlock, empower, seamless, journey, revolutionary).

---

## STEP 2: PULL THE MOTIONSITES INGREDIENTS

Use the MotionSites MCP. Call `get_prompt` for each ID and study its structure, spacing, and animation code. Then **re-skin each one with Matchlight brand tokens.** Do not copy their colors, fonts, or copy.

| Role | MotionSites ID | What to take | What to change |
|---|---|---|---|
| **Base layout and hero** | `prisma-landing` | Inset rounded hero card with a video background, noise overlay, giant bottom-aligned headline, word pull-up animation, scroll-linked character opacity reveal, and the custom ease `[0.16, 1, 0.3, 1]` | Swap Almarai for Geist, and cream for Bone and Ember. Replace the hanging pill nav with the nav spec below. |
| **Scroll cinematics** | `cinematic-landing-page` | Scroll-driven `clip-path: ellipse()` transitions between sticky full-screen panels, GSAP SplitText char reveals, and scrubbed word reveals that go from blur and 0.1 opacity to sharp | Use only these techniques. Drop the gold, the script font, and the bakery layout. |
| **Alternate hero reference** | `scroll-landing` | Study its scroll choreography for pacing | Reference only |
| **Offerings section** | `nimbus-sticky-cards` | Sticky stacking cards that pile up as you scroll | One card each for Studio, Matchbook, and Academy |
| **CTA** | `rocket-cta` | Structure and motion beat | Rebuild around an ember glow |
| **Footer** | `nietzsche-sustainibilty` | Layout and the oversized wordmark treatment | Matchlight wordmark and links |
| **Hero video** | `get_background_video` with ID `d38a1a89-24e8-44a4-aa78-30b77fc2ae7f` | Abstract dark motion loop | Color-grade it warm with a CSS overlay: `mix-blend-mode: color` in Ember at 25 to 35%, plus a gradient to Ink at the bottom |

Note: `remix_site` suggested Anton and IBM Plex Mono. **Ignore that.** Use the brand fonts.

Optionally, call `list_backgrounds` with `kind: "gradient"` and pick a dark warm gradient to use as a fallback poster for the hero video.

---

## STEP 3: STUDY THE REFERENCES

Open each site and take one specific idea from it. Don't clone any of them.

| Site | Take this |
|---|---|
| **Apple iPhone** (apple.com/iphone) | Full-viewport pinned moments. Each idea gets its own screen and scroll beat. Specs fade in on timed sequences. |
| **Lusion** (lusion.co) | A WebGL scene that reacts to the cursor and morphs with scroll. This is the bar for the hero spark field. |
| **Active Theory** (activetheory.net) | A full-screen WebGL homepage with choreographed transitions. Confidence through restraint. |
| **Unseen Studio** (unseen.co) | A logo hover that opens a full-screen nav with previews, plus a custom cursor. |
| **Epic** (epic.net) | Typography that shifts and morphs as you scroll. |
| **Uncommon Studio** (uncommonstudio.com.au) | Staggered grid reveals and slide-and-fade section transitions. |
| **BDSN Club** (bdsn.club) | Generative visuals that respond to the mouse. Minimal cursor work. |
| **Wakuli Impact** (wakuli-impact.com) | Restrained motion placed only at key story beats. The motion serves the narrative. |

---

## STEP 4: TECH STACK

- **Vite, React 18, TypeScript, Tailwind CSS 3**
- **GSAP 3** with ScrollTrigger and SplitText (all GSAP plugins are free now)
- **Lenis** for smooth scroll, synced to ScrollTrigger
- **Three.js** via `@react-three/fiber` and `@react-three/drei` for the spark field. Use a custom GLSL particle shader.
- **lucide-react** for icons, at 1.5px stroke
- Use GSAP for all motion. Don't mix in framer-motion.
- Deploy target: Vercel

---

## STEP 5: PAGE ARCHITECTURE AND SIGNATURE MOMENTS

Build these sections in order. Each one has a single "wow" moment. Use the copy from `Matchlight_Brand.md`, section 2.

### 0. Preloader: The Strike (1.2s max)
- Ink screen. A single 1px strike line draws left to right, fading from transparent to Ember to Flare.
- At the end of the line, a spark flares and the page "ignites" into the hero. Use a radial reveal mask from that point.
- Skip it on repeat visits (sessionStorage) and under reduced motion.

### 1. Hero: Ignition
- Layout from `prisma-landing`: an inset rounded card (24px padding, 32px radius) with the brand-graded video inside.
- **WebGL spark field** over the video: around 2,000 tiny ember particles drifting upward like heat. The cursor acts as a heat source. Particles near it brighten to Flare and accelerate upward. Keep it subtle, in the spirit of Lusion.
- Headline, set bottom-left, split into chars with a staggered rise (y 40 to 0, 30ms stagger, power3.out):
  **L&D as you know it is over.**
  **We build what *replaces* it.** ("replaces" in Instrument Serif Italic, Ember)
- Right column: the subhead plus two buttons. Primary: Ember pill with Ink text and an arrow chip. Secondary: Bone outline.
- Nav: fixed, transparent, turning to Ink at 80% opacity with a backdrop blur after 50px of scroll. Lowercase "matchlight" wordmark on the left. Links: Studio, Matchbook, Academy, How it works. "Start a build" pill on the right.
- Hovering the logo opens a **full-screen nav overlay** (Unseen Studio style) with oversized links. Each link reveals a preview of its section.

### 2. The Problem: Burn the Old Model
- A pinned section about 200vh tall.
- Huge words in Ash stack up: **Seat time. Completions. Smile sheets. Hours logged.**
- As you scroll, each word **burns away**: a GLSL dissolve or an SVG noise displacement mask, with the edges glowing Ember, leaving ash particles.
- When they're gone, one word rises in Instrument Serif Italic, Ember, enormous: ***Capability.***
- Then the body copy reveals character by character (the `prisma-landing` technique): "The work is changing faster than courses can be written..."

### 3. Three Ways In: Sticky Stack
- Based on `nimbus-sticky-cards`. Three Char cards stack as you scroll, each tilting slightly into place.
- Each card has: a Geist Mono label (01 / STUDIO), a large title, two lines of copy, the deliverables, and a CTA.
- Matchbook shows **$99** in Geist Mono with three icons for its deliverables: LMS file, classroom version, facilitator guide.
- The edge of the active card gets a thin Ember glow. Cards behind it dim to 40%.

### 4. How a Build Works: The Strike Line
- A pinned, horizontally scrolling track with four steps: **Strike, First light, Shape, Ship.**
- A single strike line draws across all four as you scroll, scrubbed to scroll progress.
- Each step "lights" when the line reaches it: its number goes from Ash to Ember, and a small spark bursts.
- On mobile it becomes a vertical line drawn down the left edge.

### 5. What We Believe: Type in Motion
- Five belief statements, one per viewport beat. Epic-style typography that shifts weight and tracking as it enters and leaves.
- Use the `cinematic-landing-page` scrub reveal: words go from blur(4px) at 0.1 opacity to sharp, with a slight rotation settling to 0.
- Between sections, transition with the `clip-path: ellipse()` reveal, growing out from the center of the screen.

### 6. Proof Strip (placeholder)
- A quiet marquee of client logos or build screenshots. Mark it clearly as placeholder content for later.

### 7. CTA: Bring the Light
- Full-screen Ink. **The cursor carries a soft ember glow,** a radial gradient that follows it with eased lag, lighting the surface under it.
- Headline: **The work changed. Your people *can* too.**
- One giant Ember button: "Start a build." Its glow intensifies as the cursor gets closer.

### 8. Footer
- Based on `nietzsche-sustainibilty`. An oversized "matchlight" wordmark bleeding off the bottom edge, in Char on Ink.
- Columns for Studio, Matchbook, Academy, Contact, and LinkedIn.
- A strike line across the top that draws on scroll-in.

### Global details
- **Custom cursor:** a 10px Bone dot that grows into a 48px ring over interactive elements, showing labels like "View" and "Build." Hidden on touch devices.
- **Grain:** an SVG fractal noise overlay at 3 to 4% opacity on all dark sections (use the `noise-overlay` utility from `prisma-landing`).
- **Page transitions:** the ellipse clip-path wipe.
- **Section rhythm:** at least 160px of vertical padding on desktop. Max width 1200px.
- **Links:** strike-line underline on hover, drawn left to right.

---

## STEP 6: PERFORMANCE AND ACCESSIBILITY

Cutting edge also means fast. These are requirements, not suggestions.

- **Lighthouse:** Performance 90+ on desktop, 80+ on mobile. Accessibility 95+.
- **LCP under 2.5s.** The hero headline renders before the WebGL and the video. Use a gradient poster on the video. Lazy-load Three.js after first paint.
- **`prefers-reduced-motion`:** no preloader, no WebGL, no scrubbing. Use simple fades and a static hero image.
- **Mobile:** cut particles to around 400 or replace them with a CSS glow. Pinned sections become simpler stacked reveals. Test at 375px.
- Text contrast must meet WCAG AA. Never put Ember text on Bone; use Ember Deep.
- Make it fully keyboard navigable, with visible Ember focus rings.
- Use semantic HTML: one H1, and landmarks for nav, main, and footer.
- Handle the WebGL context and SplitText cleanly, and kill ScrollTriggers on unmount.

---

## STEP 7: DELIVERABLES

1. A working Vite project that builds without errors.
2. Componentized sections: `Preloader`, `Hero`, `SparkField`, `BurnSection`, `Offerings`, `StrikeProcess`, `Beliefs`, `ProofStrip`, `CTA`, `Footer`, `Cursor`, `Nav`.
3. Brand tokens in `tailwind.config.ts` and as CSS variables.
4. A `README.md` with run and deploy steps.
5. Deploy to Vercel and share the preview URL.

## STEP 8: SELF-CHECK BEFORE YOU HAND IT OFF

Open the site in a browser and go through it top to bottom:
- [ ] Does each section have exactly one Ember moment?
- [ ] Does the hero stop someone in the first 2 seconds?
- [ ] Does the burn section land "Capability" as a real reveal?
- [ ] Is every line of copy free of em dashes and hype words?
- [ ] Does it hold up at 375px with reduced motion on?
- [ ] Lighthouse scores meet the targets above?
- [ ] Would this get an Awwwards Site of the Day nomination? If not, find the weakest section and push it further.

Report what you built, the preview URL, the Lighthouse scores, and any section you think still needs work.
