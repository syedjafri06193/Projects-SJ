import { useState } from 'react';
import Waveform from '../components/Waveform';
import ScoreRing from '../components/ScoreRing';
import FeedbackBlock from '../components/FeedbackBlock';
import FillerChips from '../components/FillerChips';
import { useRecorder } from '../hooks/useRecorder';
import { useTimer } from '../hooks/useTimer';
import { detectFillers, highlightFillers } from '../utils/fillerDetector';

const MODES = ['Impromptu', 'Interview', 'Presentation', 'Debate'];
const PROMPTS = {
  Impromptu: 'Describe a challenge you faced recently and how you overcame it. Focus on clarity and confident delivery.',
  Interview: 'Tell me about a time you led a team through a difficult project. Use the STAR method.',
  Presentation: 'Present a 2-minute pitch for a product or idea you believe in strongly.',
  Debate: 'Argue for or against remote work becoming the default for knowledge workers.',
};

const DEMO_TRANSCRIPT = 'I want to talk about, um, the challenge I faced last year. It was, like, really difficult because, you know, the team was not aligned and, basically, we had to restart from scratch. But, um, we managed to, like, pull through by communicating better.';

const INITIAL_FEEDBACK = [
  { type: 'good', tag: 'Strength', text: 'Your ideas are well-structured and the opening hook is compelling.' },
  { type: 'warn', tag: 'Pacing', text: 'Speaking at ~168 WPM — try slowing to 140 WPM for clarity.' },
  { type: 'bad',  tag: 'Fillers', text: '16 filler words detected. Add intentional pauses instead of fillers.' },
];

export default function Coach() {
  const [mode, setMode]             = useState('Impromptu');
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback]     = useState(INITIAL_FEEDBACK);
  const [analyzing, setAnalyzing]   = useState(false);
  const { isRecording, startRecording, stopRecording } = useRecorder();
  const timer = useTimer();

  const fillerData = detectFillers(transcript || DEMO_TRANSCRIPT, Math.max(timer.seconds, 30));

  const toggleRecording = async () => {
    if (!isRecording) {
      await startRecording();
      timer.start();
      setTimeout(() => setTranscript(DEMO_TRANSCRIPT), 2500);
    } else {
      stopRecording();
      timer.stop();
    }
  };

  const analyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setFeedback([
        { type: 'good', tag: 'Strength', text: 'Narrative arc is clear and the conclusion lands well.' },
        { type: 'warn', tag: 'Pacing',   text: 'Slow down in key moments — you rushed the resolution.' },
        { type: 'bad',  tag: 'Fillers',  text: `${fillerData.total} filler words detected. Replace with deliberate pauses.` },
      ]);
      setAnalyzing(false);
    }, 1200);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', minHeight: 'calc(100vh - 56px)' }}>
      {/* Main */}
      <div style={{ padding: 32, borderRight: '1px solid var(--border)' }}>
        <div style={sectionLabel}>// practice mode</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {MODES.map((m) => (
            <button key={m} onClick={() => setMode(m)} style={mode === m ? modeActive : modeBtn}>{m}</button>
          ))}
        </div>

        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: '3px solid var(--accent3)', borderRadius: 8, padding: '16px 20px', marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: 'var(--accent3)', marginBottom: 6, fontFamily: 'var(--mono)' }}>// your prompt</div>
          <div style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.5 }}>{PROMPTS[mode]}</div>
        </div>

        <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, padding: 32, textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 28, color: 'var(--text)', marginBottom: 16 }}>{timer.display}</div>
          <button
            onClick={toggleRecording}
            style={{
              width: 72, height: 72, borderRadius: '50%',
              background: isRecording ? 'rgba(255,77,106,0.15)' : 'var(--red)',
              border: isRecording ? '2px solid var(--red)' : 'none',
              cursor: 'pointer', fontSize: 28, marginBottom: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? '⏹' : '⏺'}
          </button>
          <div style={{ fontSize: 13, color: isRecording ? 'var(--red)' : 'var(--text2)' }}>
            {isRecording ? 'Recording... speak clearly' : 'Click to start recording'}
          </div>
          <Waveform active={isRecording} color={isRecording ? '#ff4d6a' : '#1e2530'} height={64} style={{ marginTop: 16 }} />
        </div>

        {transcript && (
          <div
            style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, fontSize: 13, color: 'var(--text2)', lineHeight: 1.8, maxHeight: 120, overflowY: 'auto', marginBottom: 16 }}
            dangerouslySetInnerHTML={{ __html: highlightFillers(transcript) }}
          />
        )}

        <button onClick={analyze} style={{ ...btnPrimary, marginBottom: 16 }}>
          ✨ Analyze with AI Coach
        </button>
      </div>

      {/* Sidebar */}
      <div style={{ background: 'var(--bg2)', padding: 24, overflowY: 'auto' }}>
        <div style={sectionLabel}>// session score</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <ScoreRing score={75} />
          <div style={{ flex: 1 }}>
            {SCORE_BARS.map((s) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text2)', width: 72 }}>{s.label}</span>
                <div style={{ flex: 1, height: 4, background: 'var(--bg4)', borderRadius: 2, margin: '0 10px' }}>
                  <div style={{ height: 4, width: `${s.val}%`, background: s.color, borderRadius: 2 }} />
                </div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text2)', width: 28, textAlign: 'right' }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={sectionLabel}>// detected filler words</div>
        <FillerChips chips={fillerData.chips.length ? fillerData.chips : DEFAULT_FILLERS} />

        <div style={{ ...sectionLabel, marginTop: 24 }}>// ai coach feedback</div>
        <FeedbackBlock items={feedback} loading={analyzing} />

        <div style={{ ...sectionLabel, marginTop: 24 }}>// speaking pace</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 24, color: 'var(--amber)', marginBottom: 4 }}>
          168 <span style={{ fontSize: 14, color: 'var(--text3)' }}>WPM</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text2)' }}>Target: 120–150 WPM · Too fast</div>
        <div style={{ height: 4, background: 'var(--bg4)', borderRadius: 2, marginTop: 10 }}>
          <div style={{ height: 4, width: '72%', background: 'var(--amber)', borderRadius: 2 }} />
        </div>
      </div>
    </div>
  );
}

const SCORE_BARS = [
  { label: 'Clarity',    val: 82, color: '#00e5a0' },
  { label: 'Structure',  val: 70, color: '#7c6eff' },
  { label: 'Confidence', val: 74, color: '#0ef' },
  { label: 'Pace',       val: 65, color: '#ffb340' },
];

const DEFAULT_FILLERS = [
  { word: 'um', count: 4 }, { word: 'like', count: 7 },
  { word: 'you know', count: 2 }, { word: 'basically', count: 3 },
];

const sectionLabel = { fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em', color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 16 };
const modeBtn   = { padding: '7px 16px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--sans)' };
const modeActive = { ...modeBtn, borderColor: 'var(--accent)', color: 'var(--accent)', background: 'rgba(0,229,160,0.08)' };
const btnPrimary = { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' };
