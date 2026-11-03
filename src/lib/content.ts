// All copy comes from Matchlight_Brand.md section 2. No em dashes, no hype words.

export const hero = {
  line1: 'L&D as you know it is over.',
  line2: ['We build what', 'replaces', 'it.'] as const,
  sub: "Learning isn't the product. Capability is. Matchlight designs, builds, and ships the experiences that make people able to do the work. Fast.",
};

export const problem = {
  intro: 'Most training measures the wrong thing.',
  burn: ['Seat time.', 'Completions.', 'Smile sheets.', 'Hours logged.'],
  after: 'None of that tells you if someone can do the job.',
  body: 'The work is changing faster than courses can be written. The old model can’t keep up. So we stopped writing courses and started building capability.',
};

export type Offering = {
  id: 'consult' | 'build' | 'partner';
  num: string;
  label: string;
  title: string;
  audience: string;
  copy: string;
  deliverables: string[];
  cta: string;
};

/** Three service lines. Consultancy and development, scoped per engagement. */
export const offerings: Offering[] = [
  {
    id: 'consult',
    num: '01',
    label: 'Consult',
    title: 'Capability consulting',
    audience: 'Find the real gap',
    copy: 'We work with your leaders to define what people need to be able to do, where they fall short today, and how you will know it changed. Scoped in one conversation.',
    deliverables: ['Capability map', 'Build plan', 'Measures that matter'],
    cta: 'Talk to us',
  },
  {
    id: 'build',
    num: '02',
    label: 'Build',
    title: 'Custom builds',
    audience: 'Practice, not slides',
    copy: 'Simulations, interactive experiences, AI practice partners, platforms, sites, and media. Designed and developed by our team, with a working version in days.',
    deliverables: ['Simulations', 'Platforms', 'AI coaches', 'Media'],
    cta: 'Start a build',
  },
  {
    id: 'partner',
    num: '03',
    label: 'Partner',
    title: 'Ship it and own it',
    audience: 'Built to hand over',
    copy: 'We deliver as a hosted site, a SCORM package, or the full repo, then stay on as your development partner for as long as it helps.',
    deliverables: ['Hosted site', 'SCORM package', 'Full repo'],
    cta: 'Plan an engagement',
  },
];

export const steps = [
  { num: '01', title: 'Strike', copy: 'You tell us the capability gap. We scope it in one conversation.' },
  { num: '02', title: 'First light', copy: 'You see a working version in days, not a storyboard in weeks.' },
  { num: '03', title: 'Shape', copy: 'You comment directly on the build. We refine.' },
  { num: '04', title: 'Ship', copy: 'Hosted site, SCORM, or the full repo. Your call.' },
];

/** Each belief marks its one accent word (rendered in Instrument Serif Italic). */
export const beliefs = [
  { text: 'Capability is the outcome. Everything else is overhead.', accent: 'outcome.' },
  { text: 'If it can’t be practiced, it won’t stick.', accent: 'practiced,' },
  { text: 'Speed is a form of respect.', accent: 'respect.' },
  { text: 'Build it, test it, then polish it.', accent: 'polish' },
  { text: 'People learn by doing the work, not watching someone talk about it.', accent: 'doing' },
];

export const navLinks = [
  { id: 'services', label: 'Services', href: '#offerings', preview: 'Consulting, custom builds, and a development partner that hands it over.' },
  { id: 'how', label: 'How we work', href: '#process', preview: 'Strike. First light. Shape. Ship.' },
  { id: 'beliefs', label: 'Beliefs', href: '#beliefs', preview: 'Capability is the outcome. Everything else is overhead.' },
  { id: 'demo', label: 'Demo', href: '/demo', preview: 'Practice a hard conversation out loud with Jordan, a direct report played by AI.' },
  { id: 'contact', label: 'Contact', href: '#cta', preview: 'One conversation to scope it. A working version in days.' },
];
