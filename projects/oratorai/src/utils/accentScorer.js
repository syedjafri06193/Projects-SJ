/**
 * accentScorer.js
 * Accent comparison and phoneme analysis utilities.
 * In production, replace stub data with output from a forced-alignment model
 * (e.g. Montreal Forced Aligner, Whisper + phoneme layer, or Deepgram phoneme API).
 */

export const ACCENT_PROFILES = {
  'General American': {
    label: 'General American',
    flag: '🇺🇸',
    description: 'Neutral US English — the standard broadcast accent.',
    keyPhonemes: ['/æ/', '/ɑː/', '/ɪ/', '/θ/', '/eɪ/', '/r/', '/iː/', '/ʊ/'],
  },
  'New York': {
    label: 'New York',
    flag: '🗽',
    description: 'Non-rhotic vowel shifts, cot-caught merger absent.',
    keyPhonemes: ['/ɔː/', '/æ/', '/ɑː/', '/r/', '/θ/', '/ð/', '/iː/', '/ʊ/'],
  },
  'British RP': {
    label: 'British RP',
    flag: '🇬🇧',
    description: 'Received Pronunciation — non-rhotic, trap-bath split.',
    keyPhonemes: ['/ɑː/', '/æ/', '/ɒ/', '/ʌ/', '/əʊ/', '/juː/', '/ɪə/', '/eə/'],
  },
  'Australian': {
    label: 'Australian',
    flag: '🇦🇺',
    description: 'Non-rhotic with distinctive vowel shifts.',
    keyPhonemes: ['/æ/', '/ɑː/', '/ɪ/', '/eɪ/', '/aɪ/', '/əʊ/', '/uː/', '/ɜː/'],
  },
  'Neutral Global': {
    label: 'Neutral Global',
    flag: '🌏',
    description: 'Internationally intelligible, rhotic, clear consonants.',
    keyPhonemes: ['/æ/', '/ɑː/', '/ɪ/', '/r/', '/θ/', '/ð/', '/eɪ/', '/iː/'],
  },
};

export const SHADOWING_SENTENCES = {
  'General American': [
    { text: '"The water was really cold in the morning."', focus: ['/ɑː/ in "water"', '/r/ in "really"'] },
    { text: '"I thought about it thoroughly before deciding."', focus: ['/θ/ in "thought" and "thoroughly"'] },
    { text: '"Better butter makes the batter better."', focus: ['/æ/ in "batter"', '/ɛ/ in "better"'] },
    { text: '"She can\'t stand the fast-paced environment."', focus: ['/æ/ in "can\'t"', '/eɪ/ in "paced"'] },
  ],
  'British RP': [
    { text: '"I can\'t dance after half past four."', focus: ['/ɑː/ trap-bath split'] },
    { text: '"The path to the castle is rather long."', focus: ['/ɑː/ in "path", "rather"'] },
  ],
  'Australian': [
    { text: '"Today is a great day to play outside."', focus: ['/eɪ/ → /æɪ/ shift'] },
    { text: '"I\'ve been waiting all day for this."', focus: ['/eɪ/ in "waiting", "day"'] },
  ],
  'New York': [
    { text: '"I walked all the way to the corner store."', focus: ['/ɔː/ in "walked", "all"'] },
  ],
  'Neutral Global': [
    { text: '"Speak clearly and confidently in every situation."', focus: ['Clear /r/', 'Crisp /t/ and /d/'] },
  ],
};

/**
 * getPhonemeAnalysis(accentName)
 * Returns stub phoneme-level scores for demo/prototype.
 * Replace with real forced-alignment output in production.
 */
export function getPhonemeAnalysis(accentName) {
  const base = [
    { symbol: '/æ/', example: 'cat, trap',   score: 91, status: 'ok' },
    { symbol: '/ɑː/', example: 'water, father', score: 52, status: 'issue' },
    { symbol: '/ɪ/', example: 'bit, ship',   score: 88, status: 'ok' },
    { symbol: '/θ/', example: 'think, three', score: 44, status: 'issue' },
    { symbol: '/eɪ/', example: 'face, day',  score: 85, status: 'ok' },
    { symbol: '/r/', example: 'red, right',  score: 63, status: 'warn' },
    { symbol: '/iː/', example: 'see, beat',  score: 93, status: 'ok' },
    { symbol: '/ʊ/', example: 'book, foot',  score: 79, status: 'ok' },
  ];
  return base;
}

/**
 * accentSimilarityScore(phonemeResults)
 * Weighted average of phoneme scores → overall accent match %.
 */
export function accentSimilarityScore(phonemeResults) {
  if (!phonemeResults || phonemeResults.length === 0) return 0;
  const total = phonemeResults.reduce((sum, p) => sum + p.score, 0);
  return Math.round(total / phonemeResults.length);
}
