/**
 * fillerDetector.js
 * Detects and counts filler words in a transcript string.
 */

const FILLER_WORDS = [
  'um', 'uh', 'like', 'you know', 'basically', 'literally',
  'actually', 'honestly', 'right', 'so', 'anyway', 'kind of',
  'sort of', 'i mean', 'you see', 'well', 'okay so',
];

/**
 * detectFillers(transcript)
 * Returns: { counts: { word: count }, total, rate (per minute), chips: [{word, count}] }
 */
export function detectFillers(transcript, durationSeconds = 60) {
  if (!transcript) return { counts: {}, total: 0, rate: 0, chips: [] };

  const lower = transcript.toLowerCase();
  const counts = {};

  FILLER_WORDS.forEach((filler) => {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches && matches.length > 0) {
      counts[filler] = matches.length;
    }
  });

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const rate  = durationSeconds > 0 ? Math.round((total / durationSeconds) * 60 * 10) / 10 : 0;
  const chips = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([word, count]) => ({ word, count }));

  return { counts, total, rate, chips };
}

/**
 * highlightFillers(transcript)
 * Returns HTML string with filler words wrapped in <mark class="filler"> tags.
 */
export function highlightFillers(transcript) {
  if (!transcript) return '';
  let html = transcript;
  FILLER_WORDS.forEach((filler) => {
    const regex = new RegExp(`\\b(${filler})\\b`, 'gi');
    html = html.replace(regex, '<mark class="filler">$1</mark>');
  });
  return html;
}
