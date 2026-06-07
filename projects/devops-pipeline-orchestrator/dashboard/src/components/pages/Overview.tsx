'use client';

import { useApi } from '@/hooks/useApi';
import { Service, Deployment, DeploymentMetrics } from '@dpo/shared';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Rocket, Server, CheckCircle2, AlertCircle, ArrowUpRight, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Stats {
  total: number;
  successful: number;
  failed: number;
  rolledBack: number;
  successRate: number;
  servicesHealthy: number;
  servicesTotal: number;
  deploymentsToday: number;
}

function StatCard({ label, value, sub, icon: Icon, accent }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; accent?: string;
}) {
  return (
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">{label}</p>
          <p className={`text-3xl font-bold ${accent || 'text-white'}`}>{value}</p>
          {sub && <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${accent ? 'bg-[hsl(var(--accent)/0.1)]' : 'bg-[hsl(var(--muted))]'}`}>
          <Icon size={18} className={accent || 'text-[hsl(var(--muted-foreground))]'} />
        </div>
      </div>
    </div>
  );
}

function DeploymentRow({ d }: { d: Deployment }) {
  const color = {
    success: 'text-green-400',
    failed: 'text-red-400',
    'rolled-back': 'text-yellow-400',
    'in-progress': 'text-blue-400',
    pending: 'text-gray-400',
    cancelled: 'text-gray-400',
  }[d.status] || 'text-gray-400';

  const envColor = { production: 'bg-red-900/40 text-red-300', staging: 'bg-yellow-900/40 text-yellow-300', development: 'bg-blue-900/40 text-blue-300' }[d.environment];

  return (
    <div className="flex items-center gap-3 py-3 border-b border-[hsl(var(--border))] last:border-0">
      <div className={`w-1.5 h-1.5 rounded-full ${color.replace('text-', 'bg-')}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white truncate">{d.serviceName}</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${envColor}`}>{d.environment}</span>
        </div>
        <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
          {d.fromTag} → <span className="text-[hsl(var(--accent))]">{d.toTag}</span>
        </div>
      </div>
      <div className="text-right">
        <div className={`text-xs font-medium ${color}`}>{d.status.toUpperCase()}</div>
        <div className="text-[11px] text-[hsl(var(--muted-foreground))]">
          {formatDistanceToNow(new Date(d.startedAt), { addSuffix: true })}
        </div>
      </div>
    </div>
  );
}

export function Overview() {
  const { data: stats } = useApi<Stats>('/stats', 10000);
  const { data: deployments } = useApi<Deployment[]>('/deployments?limit=8', 15000);
  const { data: metrics } = useApi<{ serviceId: string; timestamp: string; requests: number; errorRate: number }[]>('/services/api-gateway/metrics', 30000);

  const chartData = metrics?.map(m => ({
    time: new Date(m.timestamp).getHours() + ':00',
    requests: m.requests,
    errors: +(m.errorRate).toFixed(1),
  })) || [];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">
          Multi-environment deployment status at a glance
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Services"
          value={stats ? `${stats.servicesHealthy}/${stats.servicesTotal}` : '—'}
          sub="healthy"
          icon={Server}
          accent="text-[hsl(var(--accent))]"
        />
        <StatCard
          label="Success Rate"
          value={stats ? `${stats.successRate}%` : '—'}
          sub={`${stats?.total || 0} total deployments`}
          icon={CheckCircle2}
          accent="text-[hsl(var(--accent))]"
        />
        <StatCard
          label="Today"
          value={stats?.deploymentsToday ?? '—'}
          sub="deployments"
          icon={Rocket}
        />
        <StatCard
          label="Failed"
          value={stats?.failed ?? '—'}
          sub="need attention"
          icon={AlertCircle}
          accent={stats?.failed ? 'text-red-400' : undefined}
        />
      </div>

      {/* Chart + recent deployments */}
      <div className="grid grid-cols-5 gap-6">
        {/* Chart */}
        <div className="col-span-3 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Request Volume (24h)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Line type="monotone" dataKey="requests" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="errors" stroke="hsl(0 72% 51%)" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent deployments */}
        <div className="col-span-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3">Recent Deployments</h2>
          {deployments?.length ? (
            deployments.map(d => <DeploymentRow key={d.id} d={d} />)
          ) : (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">No deployments yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
