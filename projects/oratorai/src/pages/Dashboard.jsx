import { useEffect, useRef } from 'react';
import SessionRow from '../components/SessionRow';
import Heatmap from '../components/Heatmap';

const SESSIONS = [
  { date: 'May 09', mode: 'Impromptu',    score: 82 },
  { date: 'May 08', mode: 'Interview',    score: 78 },
  { date: 'May 07', mode: 'Accent',       score: 74 },
  { date: 'May 06', mode: 'Debate',       score: 69 },
  { date: 'May 04', mode: 'Presentation', score: 71 },
];

const KPI = [
  { label: 'Overall Score', val: '78',      delta: '↑ +11 from baseline', up: true },
  { label: 'Filler Words',  val: '4.2/min', delta: '↓ −62% reduction',   up: true },
  { label: 'Avg Pace',      val: '138 wpm', delta: '↑ Improved control',  up: true },
  { label: 'Accent Match',  val: '74%',     delta: '↑ +19pts this month', up: true },
  { label: 'Sessions',      val: '24',      delta: '↑ 6 this week',       up: true },
];

const WEAKNESSES = [
  { label: 'Filler Words',   pct: 38, color: '#ff4d6a', status: 'Needs Work' },
  { label: 'Pace Control',   pct: 60, color: '#ffb340', status: 'Improving' },
  { label: 'Accent Accuracy',pct: 65, color: '#ffb340', status: 'Improving' },
  { label: 'Clarity',        pct: 82, color: '#00e5a0', status: 'Strong' },
  { label: 'Structure',      pct: 75, color: '#00e5a0', status: 'Good' },
];

export default function Dashboard() {
  const progressRef = useRef(null);
  const fillerRef   = useRef(null);
  const chartInited = useRef(false);

  useEffect(() => {
    if (chartInited.current) return;
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
    script.onload = () => {
      chartInited.current = true;
      const labels      = Array.from({ length: 30 }, (_, i) => i + 1);
      const scoreData   = [55,57,56,60,62,61,65,67,66,68,70,69,71,72,70,73,74,72,75,76,74,76,77,75,78,77,79,78,79,78];
      const fillerData  = [18,16,17,15,14,13,12,14,11,10,10,9,8,9,7,8,7,6,6,5,6,5,5,4,5,4,4,4,4,4];

      if (progressRef.current) {
        new window.Chart(progressRef.current, {
          type: 'line',
          data: { labels, datasets: [{ data: scoreData, borderColor: '#00e5a0', backgroundColor: 'rgba(0,229,160,0.08)', borderWidth: 2, fill: true, tension: 0.4, pointRadius: 0 }] },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#4a5670', font: { size: 10 }, maxTicksLimit: 6 } }, y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#4a5670', font: { size: 10 } }, min: 40, max: 100 } } },
        });
      }
      if (fillerRef.current) {
        new window.Chart(fillerRef.current, {
          type: 'bar',
          data: { labels, datasets: [{ data: fillerData, backgroundColor: fillerData.map(v => v > 10 ? 'rgba(255,77,106,0.7)' : v > 6 ? 'rgba(255,179,64,0.7)' : 'rgba(0,229,160,0.7)'), borderWidth: 0, borderRadius: 2 }] },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#4a5670', font: { size: 10 }, maxTicksLimit: 6 } }, y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#4a5670', font: { size: 10 } } } } },
        });
      }
    };
    document.head.appendChild(script);
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Progress Dashboard</div>
        <div style={{ color: 'var(--text2)', fontSize: 14 }}>Past 30 days · 24 sessions completed · 12 day streak 🔥</div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 28 }}>
        {KPI.map((k) => (
          <div key={k.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 20px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{k.label}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 26, fontWeight: 700, color: k.up ? 'var(--accent)' : 'var(--red)' }}>{k.val}</div>
            <div style={{ fontSize: 12, marginTop: 4, color: k.up ? 'var(--accent)' : 'var(--red)' }}>{k.delta}</div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div style={chartCard}>
          <div style={chartTitle}>Score progression</div>
          <div style={{ position: 'relative', height: 200 }}>
            <canvas ref={progressRef} role="img" aria-label="Line chart showing score improvement from 55 to 78 over 30 days">Score improved from 55 to 78.</canvas>
          </div>
        </div>
        <div style={chartCard}>
          <div style={chartTitle}>Filler word reduction</div>
          <div style={{ position: 'relative', height: 200 }}>
            <canvas ref={fillerRef} role="img" aria-label="Bar chart of filler word count per session decreasing over time">Filler words decreased from 18 to 4 per minute.</canvas>
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={chartCard}>
          <div style={chartTitle}>Recent sessions</div>
          <div>
            {SESSIONS.map((s) => <SessionRow key={s.date + s.mode} {...s} />)}
          </div>
        </div>
        <div style={chartCard}>
          <div style={chartTitle}>Weakness heatmap</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {WEAKNESSES.map((w) => (
              <div key={w.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>
                  <span>{w.label}</span><span style={{ color: w.color }}>{w.status}</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg4)', borderRadius: 3 }}>
                  <div style={{ height: 6, width: `${w.pct}%`, background: w.color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={chartTitle}>Practice frequency</div>
          <Heatmap weeks={4} />
        </div>
      </div>
    </div>
  );
}

const chartCard  = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 };
const chartTitle = { fontSize: 13, fontWeight: 500, marginBottom: 16 };
