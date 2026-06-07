'use client';

import { useApi } from '@/hooks/useApi';
import { Service } from '@dpo/shared';
import { Activity, Clock, Globe, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

function HealthCard({ svc }: { svc: Service }) {
  const hc = svc.healthCheck;
  const isHealthy = hc.status === 'healthy';
  const isDegraded = hc.status === 'degraded';

  const cardBorder = isHealthy
    ? 'border-[hsl(var(--border))] hover:border-green-800/50'
    : isDegraded
    ? 'border-yellow-800/50 bg-yellow-900/5'
    : 'border-red-800/50 bg-red-900/5';

  const dotColor = isHealthy ? 'bg-green-400' : isDegraded ? 'bg-yellow-400' : 'bg-red-400';
  const dotGlow = isHealthy
    ? { boxShadow: '0 0 10px rgb(74 222 128)' }
    : isDegraded
    ? { boxShadow: '0 0 10px rgb(234 179 8)' }
    : {};

  return (
    <div className={`bg-[hsl(var(--card))] border rounded-xl p-5 transition-colors ${cardBorder}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${dotColor} ${!isHealthy ? 'animate-pulse' : ''}`} style={dotGlow} />
            <span className="font-semibold text-white">{svc.name}</span>
          </div>
          <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1 ml-4.5">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
              { production: 'bg-red-900/40 text-red-300', staging: 'bg-yellow-900/40 text-yellow-300', development: 'bg-blue-900/40 text-blue-300' }[svc.environment]
            }`}>{svc.environment}</span>
          </div>
        </div>
        <span className={`text-xs font-semibold uppercase ${
          isHealthy ? 'text-green-400' : isDegraded ? 'text-yellow-400' : 'text-red-400'
        }`}>
          {hc.status}
        </span>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))]">
            <Globe size={12} />
            <span className="text-xs">Endpoint</span>
          </div>
          <span className="text-xs font-mono text-[hsl(var(--accent))]">{hc.endpoint}</span>
        </div>

        {hc.latency && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))]">
              <Activity size={12} />
              <span className="text-xs">Latency</span>
            </div>
            <span className={`text-xs font-mono ${hc.latency < 100 ? 'text-green-400' : hc.latency < 300 ? 'text-yellow-400' : 'text-red-400'}`}>
              {hc.latency}ms
            </span>
          </div>
        )}

        {hc.responseCode && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))]">
              <CheckCircle2 size={12} />
              <span className="text-xs">Response</span>
            </div>
            <span className={`text-xs font-mono ${hc.responseCode === 200 ? 'text-green-400' : 'text-red-400'}`}>
              {hc.responseCode}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[hsl(var(--muted-foreground))]">
            <Clock size={12} />
            <span className="text-xs">Last checked</span>
          </div>
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            {formatDistanceToNow(new Date(hc.lastChecked), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
}

export function HealthPage() {
  const { data: services, loading } = useApi<Service[]>('/services', 10000);

  const healthy = services?.filter(s => s.healthCheck.status === 'healthy').length ?? 0;
  const total = services?.length ?? 0;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Health</h1>
          <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">
            Real-time service health status
          </p>
        </div>
        {!loading && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
            {healthy === total
              ? <CheckCircle2 size={16} className="text-green-400" />
              : <AlertTriangle size={16} className="text-yellow-400" />
            }
            <span className="text-sm text-white font-semibold">
              {healthy}/{total}
            </span>
            <span className="text-xs text-[hsl(var(--muted-foreground))]">healthy</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-[hsl(var(--card))] rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <>
          {services?.some(s => s.healthCheck.status !== 'healthy') && (
            <div className="flex items-center gap-3 p-4 bg-yellow-900/20 border border-yellow-800/40 rounded-xl">
              <AlertTriangle size={16} className="text-yellow-400 flex-shrink-0" />
              <div>
                <div className="text-sm font-semibold text-yellow-300">Attention Required</div>
                <div className="text-xs text-yellow-300/70 mt-0.5">
                  {services?.filter(s => s.healthCheck.status !== 'healthy').map(s => s.name).join(', ')} {services?.filter(s => s.healthCheck.status !== 'healthy').length === 1 ? 'is' : 'are'} reporting issues.
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-4">
            {services?.map(svc => <HealthCard key={svc.id} svc={svc} />)}
          </div>
        </>
      )}
    </div>
  );
}
