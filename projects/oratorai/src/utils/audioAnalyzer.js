/**
 * audioAnalyzer.js
 * Utilities for analyzing audio stream properties.
 */

/**
 * createAnalyser(stream)
 * Attaches a Web Audio AnalyserNode to a MediaStream.
 * Returns { analyser, audioContext } — pass analyser to useWaveform.
 */
export function createAnalyser(stream) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const source       = audioContext.createMediaStreamSource(stream);
  const analyser     = audioContext.createAnalyser();
  analyser.fftSize   = 2048;
  source.connect(analyser);
  return { analyser, audioContext };
}

/**
 * estimateWPM(transcript, durationSeconds)
 * Rough words-per-minute estimate from a transcript.
 */
export function estimateWPM(transcript, durationSeconds) {
  if (!transcript || durationSeconds <= 0) return 0;
  const wordCount = transcript.trim().split(/\s+/).length;
  return Math.round((wordCount / durationSeconds) * 60);
}

/**
 * scoreClarity(transcript, wpm, fillerRate)
 * Heuristic clarity score 0–100.
 */
export function scoreClarity(transcript, wpm, fillerRate) {
  let score = 100;
  /* penalise very fast or very slow speech */
  if (wpm > 180) score -= (wpm - 180) * 0.4;
  if (wpm < 80)  score -= (80 - wpm) * 0.3;
  /* penalise fillers */
  score -= fillerRate * 4;
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * scoreConfidence(wpm, fillerRate, pauseCount)
 * Heuristic confidence score 0–100.
 */
export function scoreConfidence(wpm, fillerRate, pauseCount = 0) {
  let score = 80;
  if (wpm < 100) score -= 10;
  score -= fillerRate * 3;
  score -= pauseCount * 1.5;
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * compositeScore({ clarity, structure, confidence, fillerRate, paceScore, accentScore })
 * Weighted overall score matching the OratorAI rubric.
 */
export function compositeScore({ clarity = 0, structure = 0, confidence = 0, fillerScore = 0, paceScore = 0, accentScore = 0 }) {
  return Math.round(
    clarity      * 0.25 +
    structure    * 0.20 +
    confidence   * 0.20 +
    fillerScore  * 0.15 +
    paceScore    * 0.10 +
    accentScore  * 0.10
  );
}
