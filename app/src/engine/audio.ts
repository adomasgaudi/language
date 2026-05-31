// Layered audio. One interface, three tiers that degrade gracefully:
//   A — premium  : pre-generated ElevenLabs clips with forced-alignment segments
//   B — backup   : pre-generated offline TTS (espeak-ng / Piper) files
//   C — fallback : browser speechSynthesis at runtime (no key, no files)
//
// Only Tier C is wired today (no API key yet). A/B slot in by registering clips
// with per-segment [start, end] timestamps; `play()` then prefers them.

export interface Segment {
  start: number
  end: number
}

/** A pre-generated clip: an <audio>-playable src plus optional word/line segments. */
export interface Clip {
  src: string
  /** Map from a segment key (e.g. line id or word) to [start, end] seconds. */
  segments?: Record<string, Segment>
}

const clips = new Map<string, Clip>()

/** Tier A/B register their generated clips here. */
export function registerClip(id: string, clip: Clip): void {
  clips.set(id, clip)
}

export function hasClip(id: string): boolean {
  return clips.has(id)
}

let audioEl: HTMLAudioElement | null = null
let stopTimer: ReturnType<typeof setTimeout> | null = null

function clearStopTimer() {
  if (stopTimer) {
    clearTimeout(stopTimer)
    stopTimer = null
  }
}

/** Stop whatever is currently playing (clip or speech). */
export function stop(): void {
  clearStopTimer()
  if (audioEl) audioEl.pause()
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel()
}

interface PlayRequest {
  /** Clip id to look up a pre-generated segment, if any. */
  clip?: string
  /** Segment key within the clip (line id or word). */
  segmentKey?: string
  /** The text to speak if no pre-generated segment is available (Tier C). */
  text: string
  lang?: string
  rate?: number
}

/**
 * Play audio for a request. Prefers a registered clip segment (Tier A/B);
 * otherwise speaks the text with speechSynthesis (Tier C). Always stops any
 * prior playback first. Set currentTime synchronously so replays aren't stale.
 */
export function play(req: PlayRequest): void {
  stop()
  const clip = req.clip ? clips.get(req.clip) : undefined
  const seg = clip && req.segmentKey ? clip.segments?.[req.segmentKey] : undefined

  if (clip && seg) {
    if (!audioEl) audioEl = new Audio()
    if (audioEl.src !== clip.src) audioEl.src = clip.src
    audioEl.currentTime = seg.start // synchronous, not in a timeout
    void audioEl.play()
    const ms = Math.max(0, (seg.end - seg.start) * 1000)
    stopTimer = setTimeout(() => audioEl?.pause(), ms)
    return
  }

  speak(req.text, req.lang ?? 'fr-FR', req.rate ?? 0.95)
}

/** Tier C: browser TTS. Best-effort French voice selection. */
export function speak(text: string, lang = 'fr-FR', rate = 0.95): void {
  if (typeof speechSynthesis === 'undefined') return
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang
  u.rate = rate
  const voice = pickVoice(lang)
  if (voice) u.voice = voice
  speechSynthesis.speak(u)
}

function pickVoice(lang: string): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === 'undefined') return null
  const voices = speechSynthesis.getVoices()
  const base = lang.split('-')[0]
  return (
    voices.find((v) => v.lang === lang) ??
    voices.find((v) => v.lang.startsWith(base)) ??
    null
  )
}

/** True if any TTS path is available (clip registered or speechSynthesis present). */
export function audioAvailable(): boolean {
  return clips.size > 0 || typeof speechSynthesis !== 'undefined'
}
