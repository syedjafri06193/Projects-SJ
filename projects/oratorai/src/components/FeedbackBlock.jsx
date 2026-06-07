/**
 * FeedbackBlock — renders structured AI coach feedback.
 * Props: items: [{ type: 'good'|'warn'|'bad', tag: string, text: string }]
 */

const TAG_STYLES = {
  good: { background: 'rgba(0,229,160,0.12)', color: '#00e5a0' },
  warn: { background: 'rgba(255,179,64,0.15)', color: '#ffb340' },
  bad:  { background: 'rgba(255,77,106,0.12)', color: '#ff4d6a' },
};

export default function FeedbackBlock({ items = [], loading = false }) {
  if (loading) {
    return (
      <div style={blockStyle}>
        <span style={{ color: 'var(--text3)', fontStyle: 'italic' }}>Analyzing your speech...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={blockStyle}>
        <span style={{ color: 'var(--text3)', fontStyle: 'italic' }}>
          Record a session and click Analyze to get feedback.
        </span>
      </div>
    );
  }

  return (
    <div style={blockStyle}>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: i < items.length - 1 ? 14 : 0 }}>
          <span style={{
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 500,
            marginBottom: 6,
            ...TAG_STYLES[item.type],
          }}>
            {item.tag}
          </span>
          <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, margin: 0 }}>
            {item.text}
          </p>
        </div>
      ))}
    </div>
  );
}

const blockStyle = {
  background: 'var(--bg3)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: 14,
  fontSize: 13,
  color: 'var(--text2)',
  lineHeight: 1.6,
};
