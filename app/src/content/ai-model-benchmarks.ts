import type { Card, Course, Tier, Unit } from '../engine/types'

interface QuizSeed {
  id: string
  prompt: string
  answer: string
  detail?: string
  tier: Tier
}

const SOURCE_NOTE =
  'Sources checked 2026-06-27: OpenAI API pricing and reasoning docs, Anthropic Claude pricing and extended thinking docs, Cursor Models & Pricing docs, SWE-bench Verified, LiveCodeBench, Terminal-Bench, and LMArena.'

const quiz = ({ id, prompt, answer, detail, tier }: QuizSeed): Card => ({
  id,
  kind: 'quiz',
  target: prompt,
  translation: {
    literal: answer,
    natural: answer,
  },
  gloss: detail,
  tier,
  note: SOURCE_NOTE,
})

const CARDS: Card[] = [
  // ── Benchmarks ───────────────────────────────────────────────────────────
  quiz({
    id: 'Q-deck-sources',
    prompt: 'What four benchmarks/leaderboards does this deck draw data from?',
    answer: 'SWE-bench Verified, LiveCodeBench, Terminal-Bench, and LMArena.',
    detail: 'Data checked 2026-06-27 from official leaderboards and provider documentation.',
    tier: 'easy',
  }),
  quiz({
    id: 'Q-livecodebench-design',
    prompt: 'What is the key design property of LiveCodeBench that distinguishes it from static coding benchmarks?',
    answer: 'Problems are released continuously over time, reducing the risk of train-set contamination.',
    detail: 'Metric: pass@1 on programming problems.',
    tier: 'easy',
  }),
  quiz({
    id: 'Q-livecodebench-o4-high',
    prompt: 'On the LiveCodeBench window sampled for this deck, what pass@1 scores did O4-Mini Low, Medium, and High achieve?',
    answer: 'Low: 68.1  ·  Medium: 76.8  ·  High: 82.0',
    detail: 'Spread between Low and High: about 13.9 pass@1 points.',
    tier: 'mid',
  }),
  quiz({
    id: 'Q-livecodebench-claude-thinking',
    prompt: 'On the sampled LiveCodeBench window, what pass@1 scores did Claude Opus 4 and Claude Opus 4 Thinking achieve?',
    answer: 'Claude Opus 4: 50.8  ·  Claude Opus 4 Thinking: 60.0',
    detail: 'Difference: about 9.2 pass@1 points in favour of Thinking.',
    tier: 'mid',
  }),
  quiz({
    id: 'Q-swebench-what',
    prompt: 'What does SWE-bench Verified measure, and what is the headline metric?',
    answer: 'Whether an agent resolves real GitHub software issues; headline metric is percent of issues resolved.',
    detail: 'Leaderboard entries specify the scaffold used (e.g. mini-SWE-agent).',
    tier: 'easy',
  }),
  quiz({
    id: 'Q-swebench-top-scores',
    prompt: 'On SWE-bench Verified (mini-SWE-agent), what resolved % did Claude 4.5 Opus high reasoning and GPT-5-2 Codex achieve?',
    answer: 'Claude 4.5 Opus high reasoning: 76.8%  ·  GPT-5-2 Codex: 72.8%',
    tier: 'hard',
  }),
  quiz({
    id: 'Q-swebench-cost-compare',
    prompt: 'On SWE-bench Verified (mini-SWE-agent), what was the total run cost for GPT-5 mini medium vs Claude 4.5 Opus high reasoning?',
    answer: 'GPT-5 mini medium: $17.74  ·  Claude 4.5 Opus high reasoning: $376.95',
    detail: 'Resolved scores: GPT-5 mini medium 59.8%, Claude 4.5 Opus high 76.8%.',
    tier: 'hard',
  }),
  quiz({
    id: 'Q-terminalbench',
    prompt: 'What capability does Terminal-Bench evaluate?',
    answer: 'Agent performance on tasks solved inside a shell (terminal) environment.',
    detail: 'Terminal-Bench 2.x leaderboard submissions go through its Harbor flow.',
    tier: 'mid',
  }),
  quiz({
    id: 'Q-lmarena-method',
    prompt: 'What ranking method does LMArena use?',
    answer: 'Blind pairwise human preference voting between model outputs.',
    detail: 'Rankings reflect human chat preferences, not task accuracy metrics.',
    tier: 'easy',
  }),

  // ── OpenAI reasoning effort ───────────────────────────────────────────────
  quiz({
    id: 'Q-openai-efforts',
    prompt: 'What six reasoning effort levels does the OpenAI reasoning guide define?',
    answer: 'none · minimal · low · medium · high · xhigh',
    detail: 'Each level controls how many reasoning tokens the model allocates.',
    tier: 'mid',
  }),
  quiz({
    id: 'Q-openai-default',
    prompt: 'What is the documented default reasoning effort for gpt-5.5?',
    answer: 'medium',
    detail: 'Applies unless the caller overrides the effort parameter.',
    tier: 'easy',
  }),

  // ── OpenAI pricing ────────────────────────────────────────────────────────
  quiz({
    id: 'Q-openai-gpt55-standard',
    prompt: 'gpt-5.5 standard short-context prices per 1M tokens (input · cached input · output)?',
    answer: '$5.00  ·  $0.50  ·  $30.00',
    detail: 'Long-context standard: $10.00 input · $1.00 cached · $45.00 output.',
    tier: 'hard',
  }),
  quiz({
    id: 'Q-openai-gpt55-batch',
    prompt: 'gpt-5.5 Batch/Flex short-context prices per 1M tokens (input · cached input · output)?',
    answer: '$2.50  ·  $0.25  ·  $15.00',
    detail: 'Priority tier: $12.50 input · $1.25 cached · $75.00 output.',
    tier: 'hard',
  }),
  quiz({
    id: 'Q-openai-gpt55-pro',
    prompt: 'gpt-5.5-pro standard short-context prices per 1M tokens (input · output)?',
    answer: '$30.00 input  ·  $180.00 output',
    detail: 'No cached-input price was listed for this row when checked.',
    tier: 'hard',
  }),
  quiz({
    id: 'Q-openai-gpt54-mini',
    prompt: 'gpt-5.4-mini standard short-context prices per 1M tokens (input · cached input · output)?',
    answer: '$0.75  ·  $0.075  ·  $4.50',
    detail: 'gpt-5.4-nano: $0.20 input · $0.02 cached · $1.25 output.',
    tier: 'hard',
  }),
  quiz({
    id: 'Q-openai-gpt5-mini-nano',
    prompt: 'gpt-5-mini and gpt-5-nano standard short-context output prices per 1M tokens?',
    answer: 'gpt-5-mini: $2.00  ·  gpt-5-nano: $0.40',
    detail: 'Input prices: $0.25/M (mini) and $0.05/M (nano); cached input = 1/10 of input.',
    tier: 'mid',
  }),
  quiz({
    id: 'Q-openai-output-input-ratio',
    prompt: 'What is the output-to-input price ratio for gpt-5.5 standard short-context?',
    answer: '6 : 1  ($30.00 output vs $5.00 input per 1M tokens)',
    detail: 'Claude Opus 4.8 ratio: 5 : 1 ($25/M output vs $5/M input).',
    tier: 'mid',
  }),

  // ── Anthropic / Claude pricing ────────────────────────────────────────────
  quiz({
    id: 'Q-claude-columns',
    prompt: 'What are the five price columns in Anthropic\'s Claude pricing table (per MTok)?',
    answer: 'Base input · 5-min cache write · 1-hour cache write · cache hits/refreshes · output',
    tier: 'mid',
  }),
  quiz({
    id: 'Q-claude-fable-mythos',
    prompt: 'Claude Fable 5 and Claude Mythos 5 prices per MTok (base input · 5-min cache write · 1-hour cache write · cache hit · output)?',
    answer: '$10  ·  $12.50  ·  $20  ·  $1  ·  $50',
    tier: 'hard',
  }),
  quiz({
    id: 'Q-claude-opus48',
    prompt: 'Claude Opus 4.8 prices per MTok (base input · output)?',
    answer: '$5 input  ·  $25 output',
    detail: 'Opus 4.8, 4.7, 4.6, and 4.5 shared this row. Older Opus 4.1/4: $15 input · $75 output.',
    tier: 'hard',
  }),
  quiz({
    id: 'Q-claude-sonnet46',
    prompt: 'Claude Sonnet 4.6 prices per MTok (base input · 5-min cache write · 1-hour cache write · cache hit · output)?',
    answer: '$3  ·  $3.75  ·  $6  ·  $0.30  ·  $15',
    tier: 'hard',
  }),
  quiz({
    id: 'Q-claude-haiku45',
    prompt: 'Claude Haiku 4.5 prices per MTok (base input · output)?',
    answer: '$1 input  ·  $5 output',
    detail: 'Lowest-priced Claude 4.5-family row in the checked pricing table.',
    tier: 'mid',
  }),
  quiz({
    id: 'Q-claude-thinking-budget',
    prompt: 'What is the minimum value for budget_tokens in Anthropic extended thinking?',
    answer: '1,024 tokens',
    detail: 'budget_tokens is not supported for Claude Fable 5, Mythos 5, Opus 4.8, or Opus 4.7 — those models use effort instead.',
    tier: 'mid',
  }),
  quiz({
    id: 'Q-claude-adaptive',
    prompt: 'Which Claude models use effort (not budget_tokens) to control thinking depth?',
    answer: 'Claude Fable 5, Mythos 5, Opus 4.8, and Opus 4.7',
    detail: 'The Anthropic docs mark budget_tokens as not supported for those rows.',
    tier: 'hard',
  }),

  // ── Cursor pricing & routing ──────────────────────────────────────────────
  quiz({
    id: 'Q-cursor-pools',
    prompt: "What are Cursor's two model usage pools?",
    answer: 'Auto + Composer pool  ·  API pool',
    detail: 'Auto + Composer: Cursor pricing. Specific model selection and Premium routing: API pool at provider API rates.',
    tier: 'easy',
  }),
  quiz({
    id: 'Q-cursor-auto-pricing',
    prompt: 'Cursor Auto prices per 1M tokens (input + cache write · output · cache read)?',
    answer: '$1.25  ·  $6.00  ·  $0.25',
    detail: 'Composer 2.5 and Auto draw from the same Auto + Composer pool.',
    tier: 'hard',
  }),
  quiz({
    id: 'Q-cursor-composer',
    prompt: "What is Composer 2.5 in Cursor, and which pool does it draw from?",
    answer: "Cursor's own agentic-coding model; draws from the Auto + Composer pool.",
    tier: 'easy',
  }),
  quiz({
    id: 'Q-cursor-premium',
    prompt: 'What does Cursor Premium routing do, and how is it priced?',
    answer: 'Cursor selects more capable models for complex tasks; priced from the selected model\'s API rate.',
    detail: 'Cursor states it selects Premium models based on internal benchmarks, evaluations, and user feedback.',
    tier: 'mid',
  }),
  quiz({
    id: 'Q-cursor-max-mode',
    prompt: 'What does Cursor Max Mode change about context and pricing?',
    answer: 'Extends context to the model\'s maximum supported length; uses token-based pricing at the model API rate.',
    tier: 'mid',
  }),
  quiz({
    id: 'Q-cursor-token-rate',
    prompt: 'On Cursor Teams plans, what is the Cursor Token Rate that can apply to non-Auto agent requests?',
    answer: '$0.25 per 1M tokens, on top of model API pricing.',
    detail: 'Auto requests are exempt from this rate.',
    tier: 'hard',
  }),
  quiz({
    id: 'Q-cursor-plan-usage',
    prompt: 'What are the plan prices and included API usage for Cursor Pro, Pro Plus, and Ultra?',
    answer: 'Pro: $20/mo · $20 usage  ·  Pro Plus: $60/mo · $70 usage  ·  Ultra: $200/mo · $400 usage',
    tier: 'hard',
  }),
]

export const aiModelBenchmarks: Course = {
  id: 'ai-model-benchmarks-2026-06-27',
  lang: 'en',
  title: 'AI Model Benchmarks',
  subtitle: 'ChatGPT, Claude, Cursor: effort, benchmarks, token costs',
  units: [
    {
      id: 'U1',
      title: 'Benchmarks, effort, cost',
      cards: CARDS,
    } satisfies Unit,
  ],
}

export function lineOf(_course: Course, _card: Card): string | undefined {
  void _course
  void _card
  return undefined
}
