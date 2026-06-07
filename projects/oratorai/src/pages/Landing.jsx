import { useRef } from 'react';
import Waveform from '../components/Waveform';

export default function Landing({ onNavigate }) {
  return (
    <div>
      {/* Hero */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - 56px)' }}>
        <div style={{ padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.12em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 20 }}>
            ⬡ AI Communication Intelligence
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 600, lineHeight: 1.15, marginBottom: 20 }}>
            Speak with<br /><span style={{ color: 'var(--accent)' }}>Precision.</span><br />Sound Confident.
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 36, maxWidth: 440 }}>
            OratorAI listens to how you speak, tracks every metric — filler words, pace, accent accuracy — and gives you a personal AI coach that transforms your communication in measurable steps.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => onNavigate('coach')} style={btnPrimary}>
              🎤 Start Session
            </button>
            <button onClick={() => onNavigate('dashboard')} style={btnSecondary}>
              📊 View Dashboard
            </button>
          </div>
        </div>

        <div style={{ padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg2)' }}>
          <div style={{ width: '100%', maxWidth: 440 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: '0.08em', marginBottom: 12 }}>
              // LIVE AUDIO ANALYSIS
            </div>
            <Waveform active height={120} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 24 }}>
              {[['87', 'Clarity Score'], ['142', 'WPM'], ['74%', 'Accent Match']].map(([val, lbl]) => (
                <div key={lbl} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: 14, textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>{val}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid var(--border)' }}>
        {FEATURES.map((f, i) => (
          <div key={i} style={{ padding: '28px 24px', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 12, color: 'var(--accent)' }}>
              {f.icon}
            </div>
            <div style={{ fontWeight: 500, marginBottom: 4, fontSize: 13 }}>{f.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const FEATURES = [
  { icon: '〰', title: 'Real-Time Analysis', desc: 'Filler words, pace, and clarity scored live as you speak.' },
  { icon: '🌍', title: 'Accent Mastery', desc: 'Phoneme-level feedback for 5 major accent targets.' },
  { icon: '📈', title: 'Progress Tracking', desc: 'Long-term trends, heatmaps, and streak tracking.' },
  { icon: '🎯', title: 'Practice Modes', desc: 'Impromptu, Interview, Presentation, and Debate modes.' },
];

const btnPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  padding: '12px 24px', background: 'var(--accent)', color: '#000',
  border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'var(--sans)',
};

const btnSecondary = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  padding: '12px 24px', background: 'transparent', color: 'var(--text)',
  border: '1px solid var(--border2)', borderRadius: 8, fontSize: 14,
  cursor: 'pointer', fontFamily: 'var(--sans)',
};
