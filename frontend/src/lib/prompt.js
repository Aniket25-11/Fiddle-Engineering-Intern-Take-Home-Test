export const FORMALITY = ['Formal', 'Neutral', 'Casual']
export const WARMTH = ['Stern', 'Neutral', 'Friendly']

// map cell -> style labels
export function styleFromCell(row, col) {
  return {
    formality: FORMALITY[row],
    warmth: WARMTH[col]
  }
}

// Manhattan distance from center (1,1) in a 3x3 grid
export function intensityFromCell(row, col) {
  const center = { r: 1, c: 1 }
  return Math.abs(row - center.r) + Math.abs(col - center.c) // 0..2
}

export function buildSystemPrompt({ formality, warmth }) {
  return [
    `You are an expert copy editor.`,
    `Rewrite the user's text to match the requested tone.`,
    `Tone:`,
    `- Formality: ${formality}`,
    `- Warmth: ${warmth}`,
    `Rules:`,
    `- Preserve the original meaning and key facts.`,
    `- Keep length roughly similar (±10%).`,
    `- Maintain existing markdown, emojis, and inline code snippets when present.`,
    `- Keep the same language as the input.`,
    `- Return only the revised text without any extra commentary.`
  ].join('\n')
}

export function temperatureFromIntensity(intensity) {
  // center should be conservative/low randomness; extremes a bit higher
  return [0.2, 0.35, 0.55][intensity] ?? 0.35
}
