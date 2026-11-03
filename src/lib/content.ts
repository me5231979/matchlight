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
  id: string;
  num: string;
  label: string;
  title: string;
  audience: string;
  copy: string;
  deliverables: string[];
  cta: string;
  price?: string;
};

export const offerings: Offering[] = [
  {
    id: 'studio',
    num: '01',
    label: 'Studio',
    title: 'Matchlight Studio',
    audience: 'For organizations',
    copy: 'Custom capability builds and consulting. Simulations, interactive experiences, learning platforms, sites, and media. Scoped with you, built by us.',
    deliverables: ['Hosted site', 'SCORM package', 'Code you own'],
    cta: 'Start a build',
  },
  {
    id: 'matchbook',
    num: '02',
    label: 'Matchbook',
    title: 'Matchbook',
    audience: 'For teams',
    copy: 'Ready-to-run courses on the skills that matter now. Buy it. Run it this week.',
    deliverables: ['LMS-ready file', 'Classroom version', 'Facilitator guide'],
    cta: 'See the catalog',
    price: '$99',
  },
  {
    id: 'academy',
    num: '03',
    label: 'Academy',
    title: 'Matchlight Academy',
    audience: 'For individuals',
    copy: 'Open-enrollment programs for people who want to build real capability on their own terms. Cohort-based, practical, and built for the work that’s coming.',
    deliverables: ['Cohort-based', 'Practical', 'Open enrollment'],
    cta: 'Join a cohort',
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
  { id: 'studio', label: 'Studio', href: '#offerings', preview: 'Custom capability builds. Simulations, platforms, sites, media.' },
  { id: 'matchbook', label: 'Matchbook', href: '#offerings', preview: '$99 courses. LMS file, classroom version, facilitator guide.' },
  { id: 'academy', label: 'Academy', href: '#offerings', preview: 'Open-enrollment cohorts for individuals.' },
  { id: 'how', label: 'How it works', href: '#process', preview: 'Strike. First light. Shape. Ship.' },
];
