/**
 * Heatmap — practice frequency calendar heatmap.
 * Props: data: number[] (0–1 intensity values), weeks (int)
 */
export default function Heatmap({ data = [], weeks = 4 }) {
  const cells = data.length > 0 ? data : Array.from({ length: weeks * 7 }, () => Math.random());

  const toColor = (v) => {
    if (v < 0.15) return 'var(--bg4)';
    if (v < 0.4)  return 'rgba(0,229,160,0.25)';
    if (v < 0.7)  return 'rgba(0,229,160,0.55)';
    return 'rgba(0,229,160,0.9)';
  };

  return (
    <div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4,
      }}>
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} style={{ fontSize: 10, color: 'var(--text3)', textAlign: 'center', fontFamily: 'var(--mono)' }}>
            {d}
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {cells.map((v, i) => (
          <div key={i} style={{
            height: 24, borderRadius: 4,
            background: toColor(v),
            title: `Intensity: ${Math.round(v * 100)}%`,
          }} />
        ))}
      </div>
    </div>
  );
}
