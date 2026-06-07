import { useState } from 'react';
import Landing from './pages/Landing';
import Coach from './pages/Coach';
import AccentMastery from './pages/AccentMastery';
import Dashboard from './pages/Dashboard';
import './styles/globals.css';
import './styles/animations.css';

const PAGES = {
  landing: Landing,
  coach: Coach,
  accent: AccentMastery,
  dashboard: Dashboard,
};

const NAV_ITEMS = [
  { id: 'landing',   label: 'Home' },
  { id: 'coach',     label: 'Speech Coach' },
  { id: 'accent',    label: 'Accent Mastery' },
  { id: 'dashboard', label: 'Dashboard' },
];

export default function App() {
  const [page, setPage] = useState('landing');
  const PageComponent   = PAGES[page];

  return (
    <div>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 56,
        background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <button
          onClick={() => setPage('landing')}
          style={{ fontFamily: 'var(--mono)', fontSize: 15, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.04em', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'pulse-dot 2s ease-in-out infinite' }} />
          OratorAI
        </button>

        <div style={{ display: 'flex', gap: 4 }}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              style={{
                padding: '6px 16px', borderRadius: 6, fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: 'var(--sans)',
                background: page === item.id ? 'rgba(0,229,160,0.1)' : 'transparent',
                color: page === item.id ? 'var(--accent)' : 'var(--text2)',
                transition: 'all 0.15s',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--accent)', background: 'rgba(0,229,160,0.1)', border: '1px solid rgba(0,229,160,0.25)', padding: '4px 10px', borderRadius: 4 }}>
          LVL 7 · 2,840 XP
        </span>
      </nav>

      {/* Page content */}
      <main key={page} className="animate-fade-in">
        <PageComponent onNavigate={setPage} />
      </main>
    </div>
  );
}
