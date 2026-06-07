import { useState } from 'react';
import PhonemeGrid from '../components/PhonemeGrid';
import Waveform from '../components/Waveform';
import { ACCENT_PROFILES, SHADOWING_SENTENCES, getPhonemeAnalysis, accentSimilarityScore } from '../utils/accentScorer';

const ACCENT_SCORES = { 'General American': 74, 'New York': 61, 'British RP': 48, 'Australian': 52, 'Neutral Global': 82 };

export default function AccentMastery() {
  const [selectedAccent, setSelectedAccent] = useState('General American');
  const [shadowIdx, setShadowIdx]           = useState(0);
  const [playing, setPlaying]               = useState(false);

  const profile    = ACCENT_PROFILES[selectedAccent];
  const phonemes   = getPhonemeAnalysis(selectedAccent);
  const score      = ACCENT_SCORES[selectedAccent];
  const sentences  = SHADOWING_SENTENCES[selectedAccent] || SHADOWING_SENTENCES['General American'];
  const sentence   = sentences[shadowIdx % sentences.length];

  const nextSentence = () => {
    setShadowIdx((i) => i + 1);
    setPlaying(false);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: 'calc(100vh - 56px)' }}>
      {/* Accent nav */}
      <div style={{ background: 'var(--bg2)', borderRight: '1px solid var(--border)', padding: '24px 16px' }}>
        <div style={sectionLabel}>// target accent</div>
        {Object.values(ACCENT_PROFILES).map((p) => (
          <div
            key={p.label}
            onClick={() => setSelectedAccent(p.label)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', borderRadius: 8, cursor: 'pointer', marginBottom: 4,
              border: selectedAccent === p.label ? '1px solid rgba(0,229,160,0.2)' : '1px solid transparent',
              background: selectedAccent === p.label ? 'rgba(0,229,160,0.08)' : 'transparent',
            }}
          >
            <span style={{ fontSize: 22 }}>{p.flag}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{p.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{p.description.slice(0, 28)}...</div>
            </div>
            {selectedAccent === p.label && <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontSize: 14 }}>✓</span>}
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ padding: 32 }}>
        {/* Score hero */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '28px 32px', marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 64, fontWeight: 700, color: 'var(--accent)', lineHeight: 1 }}>{score}</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>{profile.label} Accuracy</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>Accent similarity vs. target model</div>
            <div style={{ height: 8, background: 'var(--bg4)', borderRadius: 4, marginBottom: 8 }}>
              <div style={{ height: 8, width: `${score}%`, background: 'var(--accent)', borderRadius: 4, transition: 'width 0.6s ease' }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>
              Intonation: 80 · Stress: 71 · Rhythm: 69 · Phonemes: 76
            </div>
          </div>
        </div>

        <div style={sectionLabel}>// phoneme analysis</div>
        <PhonemeGrid phonemes={phonemes} />

        <div style={sectionLabel}>// shadowing practice</div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 20, color: 'var(--text)', lineHeight: 1.5, marginBottom: 12, fontStyle: 'italic' }}>
            {sentence.text}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16, fontFamily: 'var(--mono)' }}>
            Focus: {sentence.focus.join(' · ')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setPlaying((p) => !p)}
              style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent2)', border: 'none', cursor: 'pointer', fontSize: 18, color: '#000' }}
              aria-label={playing ? 'Pause' : 'Play target accent'}
            >
              {playing ? '⏸' : '▶'}
            </button>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>Listen, then repeat</span>
            <button onClick={nextSentence} style={{ marginLeft: 'auto', ...btnSecondary }}>
              Next sentence →
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 6 }}>TARGET ACCENT</div>
              <Waveform active={playing} color="#0ef" height={48} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', marginBottom: 6 }}>YOUR SPEECH</div>
              <Waveform active={false} color="#00e5a0" height={48} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const sectionLabel = { fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 16 };
const btnSecondary = { padding: '8px 16px', background: 'transparent', color: 'var(--text)', border: '1px solid var(--border2)', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--sans)' };
