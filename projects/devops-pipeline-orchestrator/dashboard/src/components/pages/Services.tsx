'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { Service, Environment } from '@dpo/shared';
import { ChevronDown, RefreshCw, Layers } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ENV_COLORS: Record<Environment, string> = {
  production: 'bg-red-900/40 text-red-300 border-red-800/40',
  staging: 'bg-yellow-900/40 text-yellow-300 border-yellow-800/40',
  development: 'bg-blue-900/40 text-blue-300 border-blue-800/40',
};

const STATUS_COLORS: Record<string, string> = {
  running: 'text-green-400',
  deploying: 'text-yellow-400',
  error: 'text-red-400',
  stopped: 'text-gray-400',
  'rolling-back': 'text-orange-400',
};

function HealthBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    healthy: 'bg-green-900/40 text-green-400 border-green-800/40',
    unhealthy: 'bg-red-900/40 text-red-400 border-red-800/40',
    degraded: 'bg-yellow-900/40 text-yellow-400 border-yellow-800/40',
    unknown: 'bg-gray-800 text-gray-400 border-gray-700',
  };
  return (
    <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${colors[status] || colors.unknown}`}>
      {status}
    </span>
  );
}

function ServiceCard({ svc }: { svc: Service }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden hover:border-[hsl(var(--accent)/0.4)] transition-colors">
      <div
        className="flex items-center gap-4 p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Status dot */}
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${svc.status === 'running' ? 'bg-green-400' : svc.status === 'deploying' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'}`}
          style={svc.status === 'running' ? { boxShadow: '0 0 8px rgb(74 222 128)' } : undefined}
        />

        {/* Name + env */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{svc.name}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${ENV_COLORS[svc.environment]}`}>
              {svc.environment}
            </span>
          </div>
          <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 font-mono">
            {svc.image}:<span className="text-[hsl(var(--accent))]">{svc.tag}</span>
          </div>
        </div>

        {/* Replicas */}
        <div className="text-center">
          <div className="text-sm font-semibold text-white">{svc.replicas.running}/{svc.replicas.desired}</div>
          <div className="text-[10px] text-[hsl(var(--muted-foreground))]">replicas</div>
        </div>

        {/* Health */}
        <HealthBadge status={svc.healthCheck.status} />
        {svc.healthCheck.latency && (
          <div className="text-xs text-[hsl(var(--muted-foreground))]">{svc.healthCheck.latency}ms</div>
        )}

        {/* Status */}
        <div className={`text-xs font-semibold uppercase ${STATUS_COLORS[svc.status] || 'text-gray-400'}`}>
          {svc.status}
        </div>

        <ChevronDown size={16} className={`text-[hsl(var(--muted-foreground))] transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-[hsl(var(--border))] px-5 py-4 bg-[hsl(var(--muted)/0.3)]">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-[hsl(var(--muted-foreground))] text-xs mb-1">Health Endpoint</div>
              <div className="font-mono text-xs text-[hsl(var(--accent))]">{svc.healthCheck.endpoint}</div>
            </div>
            <div>
              <div className="text-[hsl(var(--muted-foreground))] text-xs mb-1">Ports</div>
              <div className="font-mono text-xs text-white">
                {svc.ports.map(p => `${p.host}→${p.container}`).join(', ') || '—'}
              </div>
            </div>
            <div>
              <div className="text-[hsl(var(--muted-foreground))] text-xs mb-1">Last Updated</div>
              <div className="text-xs text-white">{formatDistanceToNow(new Date(svc.updatedAt), { addSuffix: true })}</div>
            </div>
          </div>
          {Object.keys(svc.envVars).length > 0 && (
            <div className="mt-3">
              <div className="text-[hsl(var(--muted-foreground))] text-xs mb-1.5">Environment Variables</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(svc.envVars).map(([k, v]) => (
                  <span key={k} className="font-mono text-[11px] bg-[hsl(var(--muted))] px-2 py-0.5 rounded text-[hsl(var(--muted-foreground))]">
                    {k}=<span className="text-white">{v}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Services() {
  const [envFilter, setEnvFilter] = useState<Environment | 'all'>('all');
  const { data: services, loading, refetch } = useApi<Service[]>(
    envFilter === 'all' ? '/services' : `/services?env=${envFilter}`,
    15000
  );

  const envs: (Environment | 'all')[] = ['all', 'production', 'staging', 'development'];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Services</h1>
          <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">
            {services?.length ?? 0} services registered
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[hsl(var(--muted))] rounded-lg p-0.5">
            {envs.map(e => (
              <button
                key={e}
                onClick={() => setEnvFilter(e)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  envFilter === e ? 'bg-[hsl(var(--card))] text-white shadow' : 'text-[hsl(var(--muted-foreground))] hover:text-white'
                }`}
              >
                {e.charAt(0).toUpperCase() + e.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={refetch}
            className="p-2 rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-white transition-colors"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading && !services ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-[hsl(var(--card))] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {services?.map(svc => <ServiceCard key={svc.id} svc={svc} />)}
        </div>
      )}
    </div>
  );
}
