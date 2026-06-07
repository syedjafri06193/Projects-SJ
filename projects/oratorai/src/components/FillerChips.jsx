/**
 * FillerChips — displays detected filler words as chips.
 * Props: chips: [{ word: string, count: number }]
 */
export default function FillerChips({ chips = [] }) {
  if (chips.length === 0) {
    return (
      <p style={{ fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>
        No filler words detected yet.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
      {chips.map(({ word, count }) => (
        <span key={word} style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          padding: '3px 10px',
          borderRadius: 4,
          background: 'rgba(255,77,106,0.1)',
          border: '1px solid rgba(255,77,106,0.2)',
          color: 'var(--red)',
        }}>
          {word} ×{count}
        </span>
      ))}
    </div>
  );
}
