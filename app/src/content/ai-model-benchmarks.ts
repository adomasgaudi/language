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
  quiz({
    id: 'Q-benchmark-filter',
    prompt: 'What benchmark properties matter most if you want to avoid saturated, vendor-trained leaderboard trivia?',
    answer:
      'Prefer third-party, unaffiliated, held-out or continuously refreshed benchmarks with realistic tasks and public methodology.',
    detail:
      'Good examples for this deck: SWE-bench Verified, LiveCodeBench, Terminal-Bench, and LMArena. Treat static near-100% tests as weak signals.',
    tier: 'easy',
  }),
  quiz({
    id: 'Q-livecodebench-why',
    prompt: 'Why is LiveCodeBench a better coding-generation signal than many old coding benchmarks?',
    answer:
      'It is designed as a holistic, contamination-free coding benchmark with problems released over time.',
    detail:
      'Metric used in the deck: pass@1 on programming problems. Dynamic release windows reduce train-set memorization risk.',
    tier: 'easy',
  }),
  quiz({
    id: 'Q-livecodebench-o4-high',
    prompt: 'On the latest LiveCodeBench window sampled for this deck, which OpenAI effort setting led the table: O4-Mini low, medium, or high?',
    answer: 'O4-Mini High led among those three at about 82.0 pass@1.',
    detail:
      'Same latest window: O4-Mini Medium about 76.8; O4-Mini Low about 68.1. Higher effort bought meaningful coding accuracy.',
    tier: 'mid',
  }),
  quiz({
    id: 'Q-livecodebench-claude-thinking',
    prompt: 'In the sampled LiveCodeBench window, did Claude Opus 4 Thinking beat plain Claude Opus 4?',
    answer:
      'Yes. Claude Opus 4 Thinking was about 60.0 pass@1 vs about 50.8 for plain Opus 4.',
    detail:
      'This is a useful effort-level lesson: thinking/reasoning modes can matter more than model family alone on hard coding tasks.',
    tier: 'mid',
  }),
  quiz({
    id: 'Q-swebench-what',
    prompt: 'What does SWE-bench Verified measure?',
    answer:
      'Whether an agent can resolve real GitHub software issues; the headline score is percent resolved.',
    detail:
      'It is third-party and closer to agentic coding than pure code-completion tests, though leaderboard systems and scaffolds still matter.',
    tier: 'easy',
  }),
  quiz({
    id: 'Q-swebench-top-openai-claude',
    prompt: 'On SWE-bench Verified rows checked for this deck, what resolved scores did the top Claude and top OpenAI entries reach?',
    answer:
      'Claude 4.5 Opus high reasoning: 76.8% resolved. GPT-5-2 Codex: 72.8% resolved.',
    detail:
      'Both used mini-SWE-agent. The deck treats these as benchmark-specific results, not universal model quality.',
    tier: 'hard',
  }),
  quiz({
    id: 'Q-swebench-cost-compare',
    prompt: 'SWE-bench Verified run cost check: which was cheaper, GPT-5 mini medium reasoning or Claude 4.5 Opus high reasoning?',
    answer:
      'GPT-5 mini medium was much cheaper: about $17.74 total vs about $376.95 for Claude 4.5 Opus high reasoning.',
    detail:
      'The resolved scores differed too: GPT-5 mini medium about 59.8%, Claude 4.5 Opus high about 76.8%. Cost per task matters.',
    tier: 'hard',
  }),
  quiz({
    id: 'Q-terminalbench',
    prompt: 'What kind of capability does Terminal-Bench target?',
    answer:
      'Terminal-agent skill: solving tasks in a shell environment, not just answering text questions.',
    detail:
      'Terminal-Bench 2.x leaderboards require submissions through its Harbor flow, which is intended to standardize evaluations.',
    tier: 'mid',
  }),
  quiz({
    id: 'Q-lmarena-caveat',
    prompt: 'What does LMArena tell you, and what is the caveat?',
    answer:
      'It gives blind human preference rankings, useful for broad chat quality, but it is not a controlled task benchmark.',
    detail:
      'Use it as a taste/preference signal beside task benchmarks like SWE-bench Verified or LiveCodeBench.',
    tier: 'easy',
  }),
  quiz({
    id: 'Q-openai-efforts',
    prompt: 'What reasoning effort levels does the current OpenAI reasoning guide list?',
    answer: 'none, minimal, low, medium, high, and xhigh.',
    detail:
      'Lower effort favors speed and lower token usage; higher effort spends more reasoning tokens for harder work.',
    tier: 'mid',
  }),
  quiz({
    id: 'Q-openai-default',
    prompt: 'What is the documented default reasoning effort for gpt-5.5?',
    answer: 'medium.',
    detail:
      'The docs describe medium as the starting balance of quality, reliability, and performance for gpt-5.5.',
    tier: 'easy',
  }),
  quiz({
    id: 'Q-openai-gpt55-standard',
    prompt: 'Standard OpenAI API pricing check: what are gpt-5.5 short-context input, cached-input, and output prices per 1M tokens?',
    answer: '$5.00 input, $0.50 cached input, $30.00 output.',
    detail:
      'Long-context standard gpt-5.5 is higher: $10.00 input, $1.00 cached input, $45.00 output.',
    tier: 'hard',
  }),
  quiz({
    id: 'Q-openai-gpt55-batch',
    prompt: 'Batch/Flex pricing check: what are gpt-5.5 short-context input, cached-input, and output prices per 1M tokens?',
    answer: '$2.50 input, $0.25 cached input, $15.00 output.',
    detail:
      'Batch/Flex was half of standard for this row when checked. Priority was higher: $12.50 input, $1.25 cached, $75 output.',
    tier: 'hard',
  }),
  quiz({
    id: 'Q-openai-gpt54-mini',
    prompt: 'OpenAI price ladder: what are gpt-5.4-mini standard short-context prices per 1M tokens?',
    answer: '$0.75 input, $0.075 cached input, $4.50 output.',
    detail:
      'gpt-5.4-nano was lower: $0.20 input, $0.02 cached input, $1.25 output.',
    tier: 'hard',
  }),
  quiz({
    id: 'Q-openai-gpt5-mini-nano',
    prompt: 'Older GPT-5 family API price memory: what were gpt-5-mini and gpt-5-nano standard short-context output prices per 1M tokens?',
    answer: 'gpt-5-mini: $2.00 output. gpt-5-nano: $0.40 output.',
    detail:
      'Their input prices were $0.25/M and $0.05/M respectively; cached input was one tenth of input.',
    tier: 'mid',
  }),
  quiz({
    id: 'Q-openai-pro',
    prompt: 'Why should you be careful with OpenAI Pro-model pricing cards?',
    answer:
      'Pro rows can be dramatically more expensive and may lack cached-input pricing; check the exact context and service tier.',
    detail:
      'Example checked: gpt-5.5-pro standard short context was $30/M input and $180/M output.',
    tier: 'mid',
  }),
  quiz({
    id: 'Q-claude-columns',
    prompt: 'Anthropic pricing table memory: what do the five Claude price columns represent?',
    answer:
      'Base input, 5-minute cache write, 1-hour cache write, cache hits/refreshes, and output, all per million tokens.',
    detail: 'Claude docs label MTok as million tokens.',
    tier: 'mid',
  }),
  quiz({
    id: 'Q-claude-fable-mythos',
    prompt: 'What were Claude Fable 5 and Claude Mythos 5 base input and output prices per MTok when checked?',
    answer: '$10/M input and $50/M output.',
    detail:
      'Their cache prices were $12.50/M for 5-minute writes, $20/M for 1-hour writes, and $1/M for cache hits/refreshes.',
    tier: 'hard',
  }),
  quiz({
    id: 'Q-claude-opus48',
    prompt: 'What were Claude Opus 4.8 base input and output prices per MTok when checked?',
    answer: '$5/M input and $25/M output.',
    detail:
      'Opus 4.8, 4.7, 4.6, and 4.5 shared this current row. Older Opus 4.1/4 rows were $15/M input and $75/M output.',
    tier: 'hard',
  }),
  quiz({
    id: 'Q-claude-sonnet46',
    prompt: 'What were Claude Sonnet 4.6 base input and output prices per MTok when checked?',
    answer: '$3/M input and $15/M output.',
    detail:
      'Cache hit/refresh price was $0.30/M; 5-minute and 1-hour cache writes were $3.75/M and $6/M.',
    tier: 'hard',
  }),
  quiz({
    id: 'Q-claude-haiku45',
    prompt: 'What were Claude Haiku 4.5 base input and output prices per MTok when checked?',
    answer: '$1/M input and $5/M output.',
    detail:
      'Haiku 4.5 was the cheapest current Claude 4.5 row in the checked pricing table.',
    tier: 'mid',
  }),
  quiz({
    id: 'Q-claude-thinking-budget',
    prompt: 'In Anthropic extended thinking, what is the minimum thinking budget for budget_tokens?',
    answer: '1,024 tokens.',
    detail:
      'The docs recommend starting at the minimum and increasing gradually; larger budgets increase latency and cost.',
    tier: 'mid',
  }),
  quiz({
    id: 'Q-claude-adaptive',
    prompt: 'How did Anthropic describe thinking control for Claude Fable 5, Mythos 5, Opus 4.8, and Opus 4.7?',
    answer:
      'They use adaptive thinking; newer rows use effort to control thinking depth instead of budget_tokens.',
    detail:
      'The docs marked budget_tokens as not supported for Fable 5, Mythos 5, Opus 4.8, and Opus 4.7.',
    tier: 'hard',
  }),
  quiz({
    id: 'Q-cursor-pools',
    prompt: "What are Cursor's two model usage pools?",
    answer: 'Auto + Composer pool, and API pool.',
    detail:
      'Auto/Composer draw from Cursor pricing. Specific model selection and Premium routing draw from the API pool at provider API rates.',
    tier: 'easy',
  }),
  quiz({
    id: 'Q-cursor-auto-pricing',
    prompt: 'Cursor Auto pricing check: what are input/cache-write, output, and cache-read prices per 1M tokens?',
    answer: '$1.25 input + cache write, $6.00 output, $0.25 cache read.',
    detail:
      'Composer 2.5 and Auto draw from the same Auto + Composer pool according to Cursor docs.',
    tier: 'hard',
  }),
  quiz({
    id: 'Q-cursor-composer',
    prompt: 'What is Composer 2.5 in Cursor?',
    answer:
      "Cursor's own model for agentic coding; both Auto and Composer 2.5 draw from the Auto + Composer pool.",
    detail:
      'Use this card to distinguish Cursor-native routing from selecting a named provider model.',
    tier: 'easy',
  }),
  quiz({
    id: 'Q-cursor-premium',
    prompt: 'What does Cursor Premium routing do?',
    answer:
      "It lets Cursor select more capable models for complex tasks, priced from the selected model's API rate.",
    detail:
      'Cursor says it selects Premium models based on internal benchmarks, evaluations, and user feedback.',
    tier: 'mid',
  }),
  quiz({
    id: 'Q-cursor-max-mode',
    prompt: 'What does Cursor Max Mode change?',
    answer:
      'It extends context to the maximum a model supports and uses token-based pricing at the model API rate.',
    detail:
      'More context can improve codebase understanding but consumes included usage faster.',
    tier: 'mid',
  }),
  quiz({
    id: 'Q-cursor-token-rate',
    prompt: 'On Cursor Teams plans, what extra token rate can apply to non-Auto agent requests?',
    answer: '$0.25 per 1M tokens as the Cursor Token Rate.',
    detail:
      'Cursor docs say Auto is exempt; the rate applies on top of model API pricing for included, on-demand, and BYOK usage.',
    tier: 'hard',
  }),
  quiz({
    id: 'Q-cursor-plan-usage',
    prompt: 'Cursor individual plan memory: what API usage was included in Pro, Pro Plus, and Ultra when checked?',
    answer: 'Pro: $20. Pro Plus: $70. Ultra: $400.',
    detail:
      'Plan prices were $20/mo, $60/mo, and $200/mo respectively when checked.',
    tier: 'hard',
  }),
  quiz({
    id: 'Q-cost-trap-output',
    prompt: 'What token-pricing trap should you remember across OpenAI, Anthropic, and Cursor?',
    answer:
      'Output tokens are usually much more expensive than input tokens, and reasoning/thinking can increase billable token use.',
    detail:
      'Example: gpt-5.5 standard short output was 6x input; Claude Opus 4.8 output was 5x input.',
    tier: 'easy',
  }),
  quiz({
    id: 'Q-effort-cost-quality',
    prompt: 'What is the basic tradeoff behind higher reasoning effort or thinking depth?',
    answer:
      'Higher effort can improve hard-task quality but usually increases latency and token cost.',
    detail:
      'The benchmark lesson: compare quality gain against extra tokens, not only raw leaderboard rank.',
    tier: 'easy',
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
