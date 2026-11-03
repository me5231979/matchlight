# Matchlight Brand Guide

**Version 0.1 · November 2026**

---

## 1. Positioning

**L&D as we know it is over. We build what replaces it.**

Learning isn't the product. Capability is.

Matchlight is a capability firm. We don't sell courses, hours, or completions. We build the things that make people able to do the work in front of them, and we ship them fast.

**One-line description**
Matchlight builds what replaces L&D: capability experiences designed, built, and shipped in days, not quarters.

**Meta description (SEO, 150 characters)**
Matchlight builds what replaces L&D. Custom capability builds, ready-to-run courses, and open programs. Learning isn't the product. Capability is.

---

## 2. Site Copy

### Hero

# L&D as you know it is over.
# We build what replaces it.

Learning isn't the product. Capability is. Matchlight designs, builds, and ships the experiences that make people able to do the work. Fast.

**[Start a build]** **[See the catalog]**

---

### The problem

Most training measures the wrong thing. Seat time. Completions. Smile sheets.

None of that tells you if someone can do the job.

The work is changing faster than courses can be written. The old model can't keep up. So we stopped writing courses and started building capability.

---

### Three ways in

**Matchlight Studio**
*For organizations*
Custom capability builds and consulting. Simulations, interactive experiences, learning platforms, sites, and media. Scoped with you, built by us, delivered as a hosted site, SCORM package, or code you own.

**Matchbook**
*For teams · $99 per course*
Ready-to-run courses on the skills that matter now. Every course ships with three things: an LMS-ready file, a classroom version, and a facilitator guide. Buy it. Run it this week.

**Matchlight Academy**
*For individuals*
Open-enrollment programs for people who want to build real capability on their own terms. Cohort-based, practical, and built for the work that's coming.

---

### How a build works

1. **Strike.** You tell us the capability gap. We scope it in one conversation.
2. **First light.** You see a working version in days, not a storyboard in weeks.
3. **Shape.** You comment directly on the build. We refine.
4. **Ship.** Hosted site, SCORM, or the full repo. Your call.

---

### What we believe

- Capability is the outcome. Everything else is overhead.
- If it can't be practiced, it won't stick.
- Speed is a form of respect.
- Build it, test it, then polish it.
- People learn by doing the work, not watching someone talk about it.

---

### Closing

**The work changed. Your people can too.**

**[Start a build]**

---

## 3. Voice

Direct. Confident. Human. Never hype.

| Do | Don't |
|---|---|
| Short declarative sentences | Long, padded paragraphs |
| Say what it does | Promise transformation |
| Plain words: build, ship, able, work | Jargon: synergy, leverage, upskilling journey |
| One idea per line | Stacked adjectives |
| Confidence from specifics | Exclamation points |

**Words we use:** build, ship, capability, able, work, practice, fast, real.
**Words we avoid:** journey, empower, unlock, seamless, robust, leverage, delve, revolutionary.
**Punctuation rule:** no em dashes. Use a period.

---

## 4. Color

The palette is the moment a match strikes: a dark room, one bright flame. Dark leads. Ember is rare and deliberate.

### Core

| Name | Hex | Role |
|---|---|---|
| **Ink** | `#0E0E0C` | Primary background. Warm near-black. |
| **Char** | `#1C1B19` | Cards and raised surfaces on dark. |
| **Bone** | `#F5F2EC` | Primary text on dark. Light-mode background. |
| **Smoke** | `#E6E1D8` | Rules, borders, and surfaces on light. |

### Accent

| Name | Hex | Role |
|---|---|---|
| **Ember** | `#FF5A1F` | The flame. CTAs, key words, the strike line. On dark only. |
| **Ember Deep** | `#B8360A` | Ember for text and links on light backgrounds. |
| **Flare** | `#FFB547` | Glow and highlight. Gradients and hover only, never text. |

### Neutral text

| Name | Hex | Role |
|---|---|---|
| **Ash** | `#8A857C` | Secondary text on dark. |
| **Slate** | `#5E5A53` | Secondary text on light. |

### Contrast (WCAG)

- Bone on Ink: 17:1 ✓
- Ember on Ink: 6.2:1 ✓
- Ash on Ink: 5.2:1 ✓
- Ember Deep on Bone: 5.3:1 ✓
- Slate on Bone: 6.2:1 ✓
- **Never** put Ember on Bone (3:1). Use Ember Deep.

### Ratio

**80% Ink/Char · 15% Bone · 5% Ember.** One Ember moment per screen.

### CSS tokens

```css
:root {
  --ink: #0E0E0C;
  --char: #1C1B19;
  --bone: #F5F2EC;
  --smoke: #E6E1D8;
  --ember: #FF5A1F;
  --ember-deep: #B8360A;
  --flare: #FFB547;
  --ash: #8A857C;
  --slate: #5E5A53;
  --strike: linear-gradient(90deg, transparent 0%, var(--ember) 70%, var(--flare) 100%);
}
```

---

## 5. Typography

All three faces are free on Google Fonts.

| Role | Font | Use |
|---|---|---|
| **Display and UI** | **Geist** | Headlines, nav, buttons, body. Modern and precise. |
| **Accent** | **Instrument Serif** *Italic* | One word per headline, set in Ember. The warm human moment. |
| **Label** | **Geist Mono** | Eyebrows, prices, step numbers, metadata. |

### The signature move

Headlines are set in Geist. The one word that matters is swapped to Instrument Serif Italic in Ember.

> We build what *replaces* it.
> Learning isn't the product. *Capability* is.

Use it once per headline, at most. It only works when it's rare.

### Scale

| Token | Size / Line | Weight | Tracking |
|---|---|---|---|
| Display | 88 / 92px | Geist 600 | -3% |
| H1 | 64 / 68px | Geist 600 | -2.5% |
| H2 | 40 / 46px | Geist 600 | -2% |
| H3 | 24 / 32px | Geist 500 | -1% |
| Body L | 20 / 32px | Geist 400 | 0 |
| Body | 17 / 28px | Geist 400 | 0 |
| Label | 13 / 16px | Geist Mono 500 | +8%, uppercase |

Mobile: Display drops to 48px, H1 to 40px.

```html
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500&family=Instrument+Serif:ital@1&display=swap" rel="stylesheet">
```

---

## 6. Design Look

**Feel:** a dark, quiet room and one bright idea. Minimal, product-grade, confident. Closer to a hardware launch page than a training catalog.

### Principles

1. **Dark first.** Ink is home. Light sections are a deliberate change of pace.
2. **Huge type, few words.** Headlines carry the page. Cut copy until it hurts.
3. **One flame per screen.** A single Ember element pulls the eye. Never two.
4. **Space is the luxury.** Generous padding. Sections breathe at 160px or more on desktop.
5. **Show the work.** Real screenshots of real builds, not stock photos.

### The strike line

The core brand motif: a thin 1px horizontal line that fades from transparent to Ember to Flare, like a match being drawn across a striker.

- Section dividers
- Underline on hover for links and nav
- Progress bars in courses
- Animates left to right on scroll, in 400ms with ease-out

### Layout

- 12-column grid, 1200px max width, 24px gutters
- 16px side margins on mobile
- Left-aligned text. Centered only for the hero and the closing CTA.
- Cards: Char background, 1px border at `rgba(245,242,236,0.08)`, 16px radius, no drop shadows

### Buttons

- **Primary:** Ember fill, Ink text, 999px pill radius, Geist 500. Hover: a soft Flare glow.
- **Secondary:** transparent with a 1px Bone border, Bone text. Hover: border turns Ember.

### Imagery

- Real people doing real work. Hands, tools, screens, in warm low light.
- Product screenshots of actual builds, framed in device mockups or floating on Char.
- Light grain overlay (3 to 4% opacity) on dark sections for warmth.
- **Never:** people smiling at laptops, lightbulbs, puzzle pieces, graduation caps, or literal matches in stock photos.

### Iconography

- 1.5px stroke line icons, rounded caps
- Bone on dark, Slate on light
- Ember only for active states

### Motion

- Fast and purposeful: 200 to 400ms, ease-out
- Elements fade up 12px on scroll
- The strike line draws on entry
- No bounce, no spin, no parallax overload
- Respect `prefers-reduced-motion`

---

## 7. Logo Direction

- **Wordmark:** "matchlight" in lowercase Geist 600, tracking -3%
- **Mark:** a single short diagonal stroke, the strike, in Ember with a Flare tip. It works alone as a favicon and app icon.
- **Lockups:** mark plus wordmark horizontally. Sub-brands are set as "matchlight **studio**", "matchlight **academy**", and "**matchbook**".
- Clear space equals the height of the "m" on all sides.
- On light backgrounds, the mark switches to Ember Deep.

---

## 8. Sub-brand System

| Brand | Audience | Accent use |
|---|---|---|
| **Matchlight Studio** | Organizations | Full Ember. The flagship. |
| **Matchbook** | Teams buying courses | Flare as the lead accent. Warmer, more retail. |
| **Matchlight Academy** | Individuals | Ember on Bone light-mode pages. Open and inviting. |

All three share the same type, grid, and strike line. Only the accent weighting shifts.

---

## 9. Domains

- matchlight.ai (primary)
- matchlightstudio.com (redirect)
- matchlight.studio and matchlight.academy (sub-brand redirects)

All were open as of November 2, 2026. Register them together.
