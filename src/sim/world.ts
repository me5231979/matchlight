// The world around the conversation: what the manager can find on their
// laptop before the 1:1, and what it looks like two weeks later.
// All people and companies here are fictional. No em dashes in copy.

export type Mail = { id: string; from: string; org?: string; subject: string; when: string; body: string[]; unread?: boolean; clue?: string };
export type Msg = { who: string; text: string; when: string };
export type Thread = { id: string; name: string; kind: 'dm' | 'channel'; msgs: Msg[]; unread?: number; clue?: string; live?: Msg[] };
export type Version = { v: string; when: string; who: string; late?: boolean };
export type FileItem = { id: string; name: string; edited: string; note: string; versions: Version[]; clue?: string };
export type CalEvent = { day: number; start: number; end: number; title: string; who: 'me' | 'jordan'; join?: boolean; muted?: boolean };

export type World = {
  dateLine: string;
  clock: [number, number];
  mail: Mail[];
  chat: Thread[];
  files: FileItem[];
  cal: CalEvent[];
  calWeek: string;
  toasts: { at: number; app: App; title: string; text: string; open?: string }[];
};

export type App = 'mail' | 'chat' | 'calendar' | 'files' | 'notes';

/** The things a prepared manager would notice. Used in the debrief. */
export const CLUES: Record<string, { label: string; insight: string }> = {
  harlow: { label: 'The client email', insight: 'Harlow saw a draft with comments still in it. Specific, recent, verifiable.' },
  q3: { label: 'The Q3 report timestamp', insight: 'Jordan sent it at 2:07 AM. Late, but not careless.' },
  backfill: { label: "Priya's backfill on hold", insight: "Nobody replaced Priya. Her accounts went somewhere." },
  pulse: { label: 'The team pulse', insight: 'Workload scores fell from 3.8 to 2.1 since September.' },
  farewell: { label: "Priya's farewell", insight: '"Jordan, the Harlow files are all yours." The handover was a joke that came true.' },
  jordan_dm: { label: "Jordan's message", insight: '"Something came up at home." A door, left slightly open.' },
  calendar: { label: "Jordan's calendar", insight: "Priya's client meetings, plus private blocks every Tuesday and Thursday evening." },
  files: { label: 'The version history', insight: 'Every save on the report was after 10 PM.' },
};

export const BEFORE: World = {
  dateLine: 'Monday, November 3',
  clock: [9, 12],
  calWeek: 'Nov 3 to 7',
  mail: [
    {
      id: 'harlow',
      from: 'Marcus Webb',
      org: 'Harlow Group',
      subject: 'Onboarding deck',
      when: 'Fri 4:41 PM',
      unread: true,
      clue: 'harlow',
      body: [
        'Hi,',
        "Quick flag before the weekend. The onboarding deck we received Thursday still had review comments in it, and two slides were marked TBD. Our COO opened it before I did.",
        "I know your team is stretched. Can we get the final by Wednesday? And a quick note on what happened would help me upstairs.",
        'Thanks,\nMarcus',
      ],
    },
    {
      id: 'q3',
      from: 'Jordan Ellis',
      subject: 'Q3 client report (final)',
      when: 'Mon Oct 27, 2:07 AM',
      clue: 'q3',
      body: ['Attached. Sorry this is late.', 'J'],
    },
    {
      id: 'pulse',
      from: 'Regal People Ops',
      subject: 'Your team pulse: October',
      when: 'Oct 24',
      clue: 'pulse',
      body: [
        'Here are your team results for October (6 of 6 responded).',
        'Clarity of priorities: 3.9 / 5\nRecognition: 3.6 / 5\nWorkload is manageable: 2.1 / 5 (September: 3.8)',
        'One comment: "Since the reorg, some of us are covering two roles and nobody has said how long for."',
      ],
    },
    {
      id: 'backfill',
      from: 'Regal People Ops',
      subject: 'Backfill update: Project Coordinator (P. Nair)',
      when: 'Oct 20',
      clue: 'backfill',
      body: [
        "The requisition to backfill Priya Nair's role is on hold pending the Q4 budget review.",
        'In the meantime, please keep her accounts covered within the existing team. We will update you in December.',
      ],
    },
    {
      id: 'it',
      from: 'Regal IT',
      subject: 'Your password expires in 5 days',
      when: 'Oct 31',
      body: ['Update your password before it expires to avoid losing access.'],
    },
  ],
  chat: [
    {
      id: 'dana',
      name: 'Dana Okafor',
      kind: 'dm',
      clue: undefined,
      msgs: [{ who: 'Dana Okafor', text: 'Can you send me the Q4 headcount numbers when you get a chance?', when: 'Thu 3:10 PM' }],
      live: [
        { who: 'Dana Okafor', text: 'Morning. Marcus from Harlow called me on Friday about the deck.', when: '9:13 AM' },
        { who: 'Dana Okafor', text: "What's going on with Jordan? This isn't like them.", when: '9:13 AM' },
        { who: 'Dana Okafor', text: 'Let me know how your 1:1 goes.', when: '9:14 AM' },
      ],
    },
    {
      id: 'jordan_dm',
      name: 'Jordan Ellis',
      kind: 'dm',
      clue: 'jordan_dm',
      msgs: [
        { who: 'Jordan Ellis', text: 'sorry, missed standup. will catch up from the notes', when: 'Oct 14' },
        { who: 'You', text: 'No worries', when: 'Oct 14' },
        { who: 'Jordan Ellis', text: 'hey, can we move our 1:1 to Monday? something came up at home', when: 'Thu 4:52 PM' },
        { who: 'You', text: 'Sure. Monday 9:30', when: 'Thu 5:20 PM' },
      ],
    },
    {
      id: 'farewell',
      name: 'project-team',
      kind: 'channel',
      clue: 'farewell',
      msgs: [
        { who: 'Priya Nair', text: 'Last day today! Thank you all, this team made it easy. Jordan, the Harlow and Mercer files are all yours 🙃', when: 'Sep 5' },
        { who: 'Jordan Ellis', text: "who's going to answer my 11pm questions now", when: 'Sep 5' },
        { who: 'Sam Torres', text: 'cake in the kitchen, come get it', when: 'Sep 5' },
        { who: 'Sam Torres', text: '@Jordan did the Harlow timeline get updated?', when: 'Wed 2:30 PM' },
        { who: 'Jordan Ellis', text: 'updated. sorry for the delay', when: 'Wed 11:48 PM' },
      ],
    },
  ],
  files: [
    {
      id: 'files',
      name: 'Q3 Client Report',
      edited: 'Edited Oct 27 by Jordan Ellis',
      note: 'Version history',
      clue: 'files',
      versions: [
        { v: 'v7 · Final', when: 'Mon Oct 27, 2:07 AM', who: 'Jordan Ellis', late: true },
        { v: 'v6', when: 'Sun Oct 26, 11:52 PM', who: 'Jordan Ellis', late: true },
        { v: 'v5', when: 'Fri Oct 24, 1:14 AM', who: 'Jordan Ellis', late: true },
        { v: 'v4', when: 'Thu Oct 23, 10:40 PM', who: 'Jordan Ellis', late: true },
        { v: 'v3', when: 'Tue Oct 14, 3:05 PM', who: 'Priya Nair (template)' },
      ],
    },
    {
      id: 'deck',
      name: 'Harlow Onboarding Deck',
      edited: 'Edited Thu 11:58 PM by Jordan Ellis',
      note: '14 unresolved comments',
      versions: [
        { v: 'Shared with client', when: 'Thu 11:58 PM', who: 'Jordan Ellis', late: true },
        { v: 'Draft', when: 'Thu 10:31 PM', who: 'Jordan Ellis', late: true },
      ],
    },
  ],
  cal: [
    { day: 0, start: 9, end: 9.25, title: 'Standup', who: 'me', muted: true },
    { day: 0, start: 9.5, end: 10, title: '1:1 Jordan Ellis', who: 'me', join: true },
    { day: 0, start: 11, end: 12, title: 'Q4 planning', who: 'me' },
    { day: 1, start: 9, end: 9.25, title: 'Standup', who: 'me', muted: true },
    { day: 2, start: 9, end: 9.25, title: 'Standup', who: 'me', muted: true },
    { day: 2, start: 14, end: 15, title: 'Leadership sync', who: 'me' },
    { day: 3, start: 9, end: 9.25, title: 'Standup', who: 'me', muted: true },
    { day: 4, start: 9, end: 9.25, title: 'Standup', who: 'me', muted: true },
    // Jordan's shared calendar
    { day: 0, start: 13, end: 14, title: 'Harlow weekly', who: 'jordan' },
    { day: 0, start: 15, end: 16, title: 'Mercer review (was Priya)', who: 'jordan' },
    { day: 1, start: 10, end: 11, title: 'Brightline check-in (was Priya)', who: 'jordan' },
    { day: 1, start: 17.5, end: 21, title: 'Busy (private)', who: 'jordan' },
    { day: 2, start: 13, end: 14.5, title: 'Harlow deck rework', who: 'jordan' },
    { day: 3, start: 11, end: 12, title: 'Mercer status (was Priya)', who: 'jordan' },
    { day: 3, start: 17.5, end: 21, title: 'Busy (private)', who: 'jordan' },
    { day: 4, start: 14, end: 16, title: 'Q4 report draft', who: 'jordan' },
  ],
  toasts: [
    { at: 7, app: 'chat', title: 'Dana Okafor', text: "What's going on with Jordan? This isn't like them.", open: 'dana' },
    { at: 75, app: 'calendar', title: '1:1 Jordan Ellis', text: 'Starts in 15 minutes.', open: 'join' },
  ],
};

export type Tier = 'lit' | 'flicker' | 'out';

const later = (tier: Tier): World => {
  const base = { dateLine: 'Monday, November 17', clock: [9, 12] as [number, number], calWeek: 'Nov 17 to 21', files: BEFORE.files.slice(0, 0) };
  if (tier === 'lit')
    return {
      ...base,
      mail: [
        {
          id: 'l1',
          from: 'Marcus Webb',
          org: 'Harlow Group',
          subject: 'Re: Onboarding deck',
          when: 'Thu 10:02 AM',
          unread: true,
          body: ['The final deck was excellent, and on time. Jordan walked our COO through it. Thank you for turning that around.', 'Marcus'],
        },
        {
          id: 'l2',
          from: 'Regal People Ops',
          subject: 'Approved: interim cover for Mercer and Brightline',
          when: 'Tue 4:15 PM',
          unread: true,
          body: ['Your request for interim contractor cover was approved. Start date: Monday, November 24.'],
        },
      ],
      chat: [
        {
          id: 'l3',
          name: 'Jordan Ellis',
          kind: 'dm',
          unread: 2,
          msgs: [
            { who: 'Jordan Ellis', text: 'Sent the Q4 outline last night. A day early for once.', when: 'Wed 5:40 PM' },
            { who: 'Jordan Ellis', text: "Also, Dad's home care starts Thursday, so I have my evenings back. Thanks for actually asking.", when: 'Wed 5:41 PM' },
          ],
        },
        {
          id: 'l4',
          name: 'Dana Okafor',
          kind: 'dm',
          unread: 1,
          msgs: [{ who: 'Dana Okafor', text: 'Marcus mentioned Jordan by name on our call. Whatever you did, it worked.', when: 'Fri 9:05 AM' }],
        },
      ],
      cal: [{ day: 0, start: 9.5, end: 10, title: '1:1 Jordan Ellis', who: 'me' }],
      toasts: [
        { at: 0.8, app: 'chat', title: 'Jordan Ellis', text: "Dad's home care starts Thursday, so I have my evenings back. Thanks for actually asking.", open: 'l3' },
        { at: 2.6, app: 'mail', title: 'Marcus Webb', text: 'The final deck was excellent, and on time.', open: 'l1' },
        { at: 4.2, app: 'chat', title: 'Dana Okafor', text: 'Marcus mentioned Jordan by name. Whatever you did, it worked.', open: 'l4' },
      ],
    };
  if (tier === 'flicker')
    return {
      ...base,
      mail: [
        {
          id: 'f1',
          from: 'Jordan Ellis',
          subject: 'Q4 outline',
          when: 'Thu 1:12 AM',
          body: ['Attached.'],
          unread: true,
        },
        {
          id: 'f2',
          from: 'Regal People Ops',
          subject: 'Absence recorded: Jordan Ellis',
          when: 'Fri 8:02 AM',
          unread: true,
          body: ['Two unplanned absence days were recorded for Jordan Ellis (Thursday, Friday). No reason given.'],
        },
      ],
      chat: [
        {
          id: 'f3',
          name: 'Dana Okafor',
          kind: 'dm',
          unread: 1,
          msgs: [{ who: 'Dana Okafor', text: 'The Harlow deck landed fine. Jordan still seemed off in the sync though. Did you get to the bottom of it?', when: 'Fri 4:30 PM' }],
        },
        {
          id: 'f4',
          name: 'project-team',
          kind: 'channel',
          unread: 1,
          msgs: [{ who: 'Sam Torres', text: 'is anyone covering Mercer this week? Jordan is out again', when: 'Fri 9:40 AM' }],
        },
      ],
      cal: [],
      toasts: [
        { at: 0.8, app: 'mail', title: 'Jordan Ellis', text: 'Q4 outline. Sent 1:12 AM.', open: 'f1' },
        { at: 2.6, app: 'mail', title: 'People Ops', text: 'Two unplanned absence days recorded for Jordan Ellis.', open: 'f2' },
        { at: 4.2, app: 'chat', title: 'Dana Okafor', text: 'Jordan still seemed off. Did you get to the bottom of it?', open: 'f3' },
      ],
    };
  return {
    ...base,
    mail: [
      {
        id: 'o1',
        from: 'Regal People Ops',
        subject: 'Resignation: Jordan Ellis',
        when: 'Fri 5:48 PM',
        unread: true,
        body: [
          'Jordan Ellis submitted their resignation today. Their last day will be Monday, December 1.',
          'Please schedule a handover for the Harlow, Mercer, and Brightline accounts. Exit interview notes will follow.',
        ],
      },
      {
        id: 'o2',
        from: 'Marcus Webb',
        org: 'Harlow Group',
        subject: 'Timeline',
        when: 'Thu 3:20 PM',
        unread: true,
        body: ['This is the second slipped date this month. We should talk about the account before renewal.', 'Marcus'],
      },
    ],
    chat: [
      {
        id: 'o3',
        name: 'Dana Okafor',
        kind: 'dm',
        unread: 1,
        msgs: [{ who: 'Dana Okafor', text: 'Just heard about Jordan. Harlow is going to be a problem. Can we talk at 10?', when: '8:51 AM' }],
      },
    ],
    cal: [],
    toasts: [
      { at: 0.8, app: 'mail', title: 'People Ops', text: 'Resignation: Jordan Ellis. Last day December 1.', open: 'o1' },
      { at: 2.6, app: 'mail', title: 'Marcus Webb', text: 'This is the second slipped date this month.', open: 'o2' },
      { at: 4.2, app: 'chat', title: 'Dana Okafor', text: 'Just heard about Jordan. Can we talk at 10?', open: 'o3' },
    ],
  };
};

export const LATER = later;
