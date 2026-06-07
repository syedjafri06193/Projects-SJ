'use client';

import { LayoutDashboard, Server, Rocket, HeartPulse, Settings, Terminal, GitBranch } from 'lucide-react';
import type { Page } from '@/app/page';

const nav: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: 'overview',    label: 'Overview',     icon: LayoutDashboard },
  { id: 'services',   label: 'Services',     icon: Server },
  { id: 'deployments', label: 'Deployments', icon: Rocket },
  { id: 'health',     label: 'Health',       icon: HeartPulse },
];

interface SidebarProps {
  current: Page;
  onChange: (p: Page) => void;
}

export function Sidebar({ current, onChange }: SidebarProps) {
  return (
    <aside className="w-60 flex flex-col h-full bg-[hsl(var(--card))] border-r border-[hsl(var(--border))]">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--accent))] flex items-center justify-center">
            <GitBranch size={16} className="text-black" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight">DPO</div>
            <div className="text-[10px] text-[hsl(var(--muted-foreground))] tracking-widest uppercase">Pipeline Orchestrator</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all ${
              current === id
                ? 'bg-[hsl(var(--accent)/0.15)] text-[hsl(var(--accent))] font-medium'
                : 'text-[hsl(var(--muted-foreground))] hover:text-white hover:bg-[hsl(var(--muted))]'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-[hsl(var(--border))]">
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-2 h-2 rounded-full bg-[hsl(var(--accent))]" style={{ boxShadow: '0 0 6px hsl(142 71% 45%)' }} />
          <span className="text-xs text-[hsl(var(--muted-foreground))]">API Connected</span>
        </div>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-[hsl(var(--muted-foreground))] hover:text-white hover:bg-[hsl(var(--muted))] transition-all mt-1">
          <Settings size={16} />
          Settings
        </button>
      </div>
    </aside>
  );
}
