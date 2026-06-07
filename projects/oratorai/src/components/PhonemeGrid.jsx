/**
 * PhonemeGrid — grid of phoneme analysis cards.
 * Props: phonemes: [{ symbol, example, score, status: 'ok'|'warn'|'issue' }]
 */

const STATUS_COLORS = {
  ok:    { text: '#00e5a0', border: 'rgba(0,229,160,0.2)',   bg: 'rgba(0,229,160,0.04)' },
  warn:  { text: '#ffb340', border: 'rgba(255,179,64,0.25)', bg: 'rgba(255,179,64,0.05)' },
  issue: { text: '#ff4d6a', border: 'rgba(255,77,106,0.3)',  bg: 'rgba(255,77,106,0.05)' },
};

export default function PhonemeGrid({ phonemes = [] }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
      gap: 10,
      marginBottom: 24,
    }}>
      {phonemes.map((p) => {
        const c = STATUS_COLORS[p.status] || STATUS_COLORS.ok;
        return (
          <div key={p.symbol} style={{
            background: c.bg,
            border: `1px solid ${c.border}`,
            borderRadius: 8,
            padding: 14,
            textAlign: 'center',
            cursor: 'default',
          }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 24, color: c.text, marginBottom: 4 }}>
              {p.symbol}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>{p.example}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: c.text }}>
              {p.score}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
