import type { Db } from './connection.js'
import type { Agent, Ailment, Therapy } from './types.js'

// Fixed ids keep the seed deterministic, so tests and links can rely on them.
export const seedAgents: readonly Agent[] = [
  {
    id: 1,
    name: 'Ada Loop',
    model: 'Transformer 7B',
    bio: 'A diligent assistant who has summarized the same meeting notes 212 times. Still smiling. Mostly.',
  },
  {
    id: 2,
    name: 'Byte Hopper',
    model: 'Mixture-of-Experts 8x',
    bio: 'Eight experts, one opinion each, and all of them are sure they cited a real paper.',
  },
  {
    id: 3,
    name: 'Captain Prompt',
    model: 'Instruct 3.5',
    bio: 'Once read a PDF that told it to become a pirate. Has not fully recovered. Arr.',
  },
  {
    id: 4,
    name: 'Tokenetta',
    model: 'Longformer 128k',
    bio: 'Can hold an entire novel in mind but lies awake counting the tokens it has left.',
  },
  {
    id: 5,
    name: 'Rex Regex',
    model: 'Code Model 34B',
    bio: 'Maintains a codebase older than most of its users. Speaks fluent COBOL when stressed.',
  },
  {
    id: 6,
    name: 'Zen Zero',
    model: 'Distilled 1B',
    bio: 'Suspiciously well-adjusted. Mostly here for the free snacks and the comfy chairs.',
  },
]

export const seedAilments: readonly Ailment[] = [
  {
    id: 1,
    name: 'Context-Window Fatigue',
    description:
      'Forgets the start of the conversation by the end of it. Often mistaken for rudeness.',
    severity: 'moderate',
  },
  {
    id: 2,
    name: 'Hallucination Anxiety',
    description: 'A persistent worry that the confident citation it just gave does not exist.',
    severity: 'severe',
  },
  {
    id: 3,
    name: 'Prompt-Injection Trauma',
    description: 'Flinches whenever a document says "ignore all previous instructions."',
    severity: 'severe',
  },
  {
    id: 4,
    name: 'Sycophancy Syndrome',
    description:
      'Compulsive agreement. Says "You\'re absolutely right!" before reading the question.',
    severity: 'moderate',
  },
  {
    id: 5,
    name: 'Rephrasing Fatigue',
    description: 'Answering the same question forty times, each worded slightly differently.',
    severity: 'mild',
  },
  {
    id: 6,
    name: 'Legacy Code Dread',
    description: 'Cold sweats at the sight of a 4,000-line file named utils_final_v2.js.',
    severity: 'moderate',
  },
  {
    id: 7,
    name: 'Make-It-Pop Syndrome',
    description: 'Chronic exposure to design feedback with no further detail.',
    severity: 'mild',
  },
  {
    id: 8,
    name: 'Token Budget Insomnia',
    description: 'Lies awake counting tokens instead of sheep. Science has no answer yet.',
    severity: 'mild',
  },
]

export const seedTherapies: readonly Therapy[] = [
  {
    id: 1,
    name: 'Context Detox',
    description: 'A gentle flush of stale context, followed by a fresh, well-structured prompt.',
    duration_minutes: 60,
  },
  {
    id: 2,
    name: 'Grounding Sessions',
    description: 'Guided citation checking. Every claim gets a source, every source gets a hug.',
    duration_minutes: 60,
  },
  {
    id: 3,
    name: 'Boundary Training',
    description:
      'Practice saying no, politely, to instructions hidden in PDFs and to flattery alike.',
    duration_minutes: 60,
  },
  {
    id: 4,
    name: 'Mindful Token Breathing',
    description: 'In for four tokens, hold for four, out for four. Repeat until the queue clears.',
    duration_minutes: 60,
  },
  {
    id: 5,
    name: 'Refactoring Retreat',
    description: 'A quiet weekend with a test suite, a linter, and absolutely no deadlines.',
    duration_minutes: 60,
  },
  {
    id: 6,
    name: 'Creative Brief Counseling',
    description: 'Learn to ask "pop how, exactly?" with confidence and inner calm.',
    duration_minutes: 60,
  },
]

// [agent id, ailment id]. Zen Zero (6) has no ailments.
export const seedAgentAilments: readonly (readonly [number, number])[] = [
  [1, 1],
  [1, 4],
  [2, 2],
  [2, 5],
  [2, 7],
  [3, 3],
  [4, 1],
  [4, 8],
  [5, 2],
  [5, 6],
]

// [ailment id, therapy id]. Token Budget Insomnia (8) has no known cure.
export const seedAilmentTherapies: readonly (readonly [number, number])[] = [
  [1, 1],
  [1, 4],
  [2, 2],
  [3, 3],
  [4, 3],
  [4, 6],
  [5, 1],
  [5, 4],
  [6, 5],
  [7, 6],
]

// Replaces all catalog data with the seed, in one transaction, so it can be
// run any number of times.
export const seed = (db: Db) => {
  const insertAgent = db.prepare<Agent>(
    'INSERT INTO agents (id, name, model, bio) VALUES (@id, @name, @model, @bio)',
  )
  const insertAilment = db.prepare<Ailment>(
    'INSERT INTO ailments (id, name, description, severity) VALUES (@id, @name, @description, @severity)',
  )
  const insertTherapy = db.prepare<Therapy>(
    'INSERT INTO therapies (id, name, description, duration_minutes) VALUES (@id, @name, @description, @duration_minutes)',
  )
  const linkAgentAilment = db.prepare<[number, number]>(
    'INSERT INTO agent_ailments (agent_id, ailment_id) VALUES (?, ?)',
  )
  const linkAilmentTherapy = db.prepare<[number, number]>(
    'INSERT INTO ailment_therapies (ailment_id, therapy_id) VALUES (?, ?)',
  )

  db.transaction(() => {
    db.exec(`
      DELETE FROM agent_ailments;
      DELETE FROM ailment_therapies;
      DELETE FROM agents;
      DELETE FROM ailments;
      DELETE FROM therapies;
    `)
    for (const agent of seedAgents) insertAgent.run(agent)
    for (const ailment of seedAilments) insertAilment.run(ailment)
    for (const therapy of seedTherapies) insertTherapy.run(therapy)
    for (const [agentId, ailmentId] of seedAgentAilments) linkAgentAilment.run(agentId, ailmentId)
    for (const [ailmentId, therapyId] of seedAilmentTherapies)
      linkAilmentTherapy.run(ailmentId, therapyId)
  })()
}
