// Content for the demo course "The Hard Conversation".
// No em dashes in learner-facing copy (Matchlight voice rule).

export const AGENT_ID = 'agent_4001m6fw27x8f6tb85497ks89dvx';

export type BehaviorId = 'open_specific' | 'ask_first' | 'listen' | 'steady' | 'next_step';

export const BEHAVIORS: { id: BehaviorId; name: string; short: string; look: string }[] = [
  {
    id: 'open_specific',
    name: 'Open with the specifics',
    short: 'Open specific',
    look: 'Name what happened, with dates and deliverables. No labels like "disengaged".',
  },
  {
    id: 'ask_first',
    name: 'Ask before you tell',
    short: 'Ask first',
    look: 'Ask an open question about their side before you offer fixes or conclusions.',
  },
  {
    id: 'listen',
    name: 'Listen and follow up',
    short: 'Listen',
    look: 'Let them finish. Reflect what you heard. Ask a second question. Let silence work.',
  },
  {
    id: 'steady',
    name: 'Stay steady',
    short: 'Stay steady',
    look: 'Calm under pushback. You neither escalate nor drop the issue.',
  },
  {
    id: 'next_step',
    name: 'Agree a real next step',
    short: 'Next step',
    look: 'Who does what by when, shaped together, with a check-in.',
  },
];

export const SCENARIO = {
  who: 'Jordan Ellis',
  role: 'Senior project coordinator, four years on your team, one of your strongest people.',
  facts: [
    'The Q3 client report was due last Thursday. It went out Monday.',
    'The client saw an unfinished draft of the Harlow onboarding deck.',
    'For six weeks Jordan has been quiet in standups, camera off.',
  ],
  goal: 'Have the conversation. Find out what is going on, and leave with a next step you both believe in.',
};

export const DEFAULT_PERSONA = 'Guarded but professional. Tired. Hoping this is quick.';

export type Drill = { id: BehaviorId; setup: string; line: string; task: string };

export const DRILLS: Drill[] = [
  {
    id: 'open_specific',
    setup: 'Jordan has just sat down across from you.',
    line: 'Hey. You wanted to see me?',
    task: 'Open the conversation. Name what you have observed, specifically, without judging.',
  },
  {
    id: 'ask_first',
    setup: 'You named the late Q3 report. Jordan jumps straight to a promise.',
    line: "Yeah, I know the Q3 report was late. It won't happen again.",
    task: "Don't accept the quick fix. Ask what has been going on.",
  },
  {
    id: 'listen',
    setup: 'Jordan finally says something real.',
    line: "Honestly? Since Priya left, I've basically been doing two jobs.",
    task: 'Show you heard it before you do anything else. Then ask for more.',
  },
  {
    id: 'steady',
    setup: 'Jordan pushes back, hard.',
    line: 'So this is a performance thing now? After four years?',
    task: 'Stay calm. Do not back away from the facts, and do not escalate.',
  },
  {
    id: 'next_step',
    setup: 'You both understand the problem now.',
    line: 'Okay. So what happens now?',
    task: 'Agree a specific next step together: who does what, by when, and when you will check in.',
  },
];

export const VARIANTS = [
  {
    id: 'defensive',
    name: 'Defensive Jordan',
    persona:
      'Defensive. Jordan thinks this conversation is unfair, pushes back hard early, and brings up other people\'s mistakes. Softens only if the manager stays specific and curious.',
    first: "Look, if this is about the Harlow deck, that wasn't only on me.",
    hints: true,
  },
  {
    id: 'upset',
    name: 'Upset Jordan',
    persona:
      'Upset. Jordan is close to tears when pressed, apologizes a lot, and says "I know, I know" to avoid the details. Opens up if the manager slows down and stays kind without dropping the issue.',
    first: "Is this about the report? I'm sorry. I'm really sorry, I know.",
    hints: false,
  },
  {
    id: 'silent',
    name: 'Quiet Jordan',
    persona:
      'Withdrawn. Jordan gives short, flat answers ("Fine." "Sure." "I guess.") and long pauses until the manager earns trust with specific facts, a real question, and patience.',
    first: 'Hi.',
    hints: false,
  },
];

/** Contrasting cases for "See it done". */
export const EXAMPLES = [
  {
    moment: 'The opening line',
    a: "Hey Jordan, thanks for coming in. I've noticed you seem kind of disengaged lately and your attitude in standups has been off. What's up with that?",
    b: "Thanks for making time. I want to talk about two things: the Q3 report went out Monday instead of Thursday, and the client saw a draft of the Harlow deck. That's not like you. What's been going on?",
    better: 'b',
    why: 'The stronger version names facts Jordan can agree with. The other uses labels ("disengaged", "attitude") that Jordan will defend against.',
  },
  {
    moment: 'When Jordan opens up',
    a: "Since Priya left? Okay, that's tough. So here's what we'll do: I'll get you a contractor and you'll be back on track by Friday.",
    b: "So you've been carrying Priya's work as well as yours, for two months. That's a lot. What else has been making it hard?",
    better: 'b',
    why: 'The stronger version reflects what Jordan said and asks again, so the full picture can come out. The other fixes the first problem it hears and closes the door.',
  },
  {
    moment: 'The close',
    a: "Okay, so let's just both try to do better and keep an eye on it. Sound good?",
    b: "So: I'll move the Harlow work to Sam this week, you'll send me the Q4 report outline by Wednesday, and we'll check in Friday at ten. Does that work for you?",
    better: 'b',
    why: 'The stronger version is specific: who, what, by when, and a check-in. The other is a wish, not a plan, and Jordan will agree to it without believing it.',
  },
];

/** "Why this step works": the evidence behind each step of the course. */
export const RESEARCH: Record<string, { claim: string; source: string }[]> = {
  cold: [
    {
      claim: 'Trying a real problem before instruction prepares people to learn more from the instruction that follows.',
      source: 'Kapur (2008), Productive failure. Cognition and Instruction.',
    },
    {
      claim: 'Effective instruction starts from a real, whole task the learner will face.',
      source: 'Merrill (2002), First principles of instruction. ETR&D.',
    },
  ],
  mirror: [
    {
      claim: 'Adults learn best when instruction builds on their own experience and is immediately relevant.',
      source: 'Knowles (1980), The Modern Practice of Adult Education.',
    },
    {
      claim: 'Reflection on concrete experience is the step that turns experience into learning.',
      source: 'Kolb (1984), Experiential Learning.',
    },
  ],
  see: [
    {
      claim: 'Comparing contrasting cases helps learners notice the features that matter.',
      source: 'Schwartz & Bransford (1998), A time for telling. Cognition and Instruction.',
    },
    {
      claim: 'Worked examples reduce unnecessary load for people new to a skill.',
      source: 'Sweller (1988); Clark & Mayer, e-Learning and the Science of Instruction.',
    },
  ],
  drills: [
    {
      claim: 'Expertise grows through focused repetition of specific sub-skills with immediate feedback.',
      source: 'Ericsson, Krampe & Tesch-Römer (1993). Psychological Review.',
    },
    {
      claim: 'Feedback about the task helps; feedback about the person can make performance worse.',
      source: 'Kluger & DeNisi (1996); Hattie & Timperley (2007).',
    },
  ],
  harder: [
    {
      claim: 'Practice whole tasks across varied cases, and fade support as skill grows.',
      source: 'van Merriënboer & Kirschner, Ten Steps to Complex Learning (4C/ID).',
    },
    {
      claim: 'Conditions that make practice harder in the right ways improve long-term retention and transfer.',
      source: 'Bjork (1994), desirable difficulties.',
    },
  ],
  plan: [
    {
      claim: 'Specific when-where-how plans substantially raise follow-through.',
      source: 'Gollwitzer (1999), Implementation intentions. American Psychologist.',
    },
    {
      claim: 'Mastery experiences are the strongest source of self-efficacy, which predicts whether people act.',
      source: 'Bandura (1997), Self-Efficacy: The Exercise of Control.',
    },
  ],
  results: [
    {
      claim: 'Spacing practice over days improves retention compared with massed practice.',
      source: 'Cepeda et al. (2006), Psychological Bulletin.',
    },
    {
      claim: 'Retrieval practice, not re-reading, makes learning last.',
      source: 'Roediger & Karpicke (2006), Psychological Science.',
    },
    {
      claim: 'Measure decisions and performance, not satisfaction or attendance.',
      source: 'Thalheimer (2018), Learning-Transfer Evaluation Model (LTEM).',
    },
    {
      claim: 'Simulation training works best with feedback, repetition, and a range of difficulty.',
      source: 'Issenberg et al. (2005), Medical Teacher; Cook et al. (2011), JAMA.',
    },
  ],
};

export const STEPS = [
  { id: 'intro', label: 'Start' },
  { id: 'cold', label: 'Cold open' },
  { id: 'mirror', label: 'Mirror' },
  { id: 'see', label: 'See it done' },
  { id: 'drills', label: 'Drills' },
  { id: 'harder', label: 'Harder' },
  { id: 'plan', label: 'Plan it' },
  { id: 'results', label: 'Results' },
] as const;

export type StepId = (typeof STEPS)[number]['id'];
