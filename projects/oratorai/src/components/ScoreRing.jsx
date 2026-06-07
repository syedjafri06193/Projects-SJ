/**
 * ScoreRing — circular SVG score display.
 * Props: score (0–100), size (px), color (string), label (string)
 */
export default function ScoreRing({ score = 0, size = 80, color = '#00e5a0', label = '' }) {
  const r          = (size / 2) - 6;
  const circumf    = 2 * Math.PI * r;
  const dashOffset = circumf - (score / 100) * circumf;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#1e2530" strokeWidth="6"
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circumf}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: size * 0.22, fontWeight: 700, color }}>
          {score}
        </span>
        {label && (
          <span style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>{label}</span>
        )}
      </div>
    </div>
  );
}
