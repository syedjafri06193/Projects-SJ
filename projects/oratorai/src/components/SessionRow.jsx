/**
 * SessionRow — single row in the session history list.
 * Props: date (string), mode (string), score (number)
 */
export default function SessionRow({ date, mode, score }) {
  const color = score >= 75 ? '#00e5a0' : score >= 55 ? '#ffb340' : '#ff4d6a';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '12px 0', borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', width: 68 }}>
        {date}
      </span>
      <span style={{
        fontSize: 12, padding: '3px 10px', borderRadius: 4,
        background: 'var(--bg3)', color: 'var(--text2)', width: 90, textAlign: 'center',
      }}>
        {mode}
      </span>
      <div style={{ flex: 1, height: 6, background: 'var(--bg4)', borderRadius: 3 }}>
        <div style={{ height: 6, width: `${score}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color, width: 34, textAlign: 'right' }}>
        {score}
      </span>
    </div>
  );
}
