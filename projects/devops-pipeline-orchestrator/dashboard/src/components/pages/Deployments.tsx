'use client';

import { useState } from 'react';
import { useApi, apiPost } from '@/hooks/useApi';
import { Deployment, DeploymentStatus } from '@dpo/shared';
import { RotateCcw, ChevronDown, Clock, User } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

const STATUS_STYLES: Record<DeploymentStatus, { text: string; bg: string; border: string }> = {
  success:     { text: 'text-green-400',  bg: 'bg-green-900/30',  border: 'border-green-800/40' },
  failed:      { text: 'text-red-400',    bg: 'bg-red-900/30',    border: 'border-red-800/40' },
  'rolled-back': { text: 'text-yellow-400', bg: 'bg-yellow-900/30', border: 'border-yellow-800/40' },
  'in-progress': { text: 'text-blue-400',  bg: 'bg-blue-900/30',   border: 'border-blue-800/40' },
  pending:     { text: 'text-gray-400',   bg: 'bg-gray-800/30',   border: 'border-gray-700/40' },
  cancelled:   { text: 'text-gray-400',   bg: 'bg-gray-800/30',   border: 'border-gray-700/40' },
};

function DeploymentCard({ d, onRollback }: { d: Deployment; onRollback: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const style = STATUS_STYLES[d.status];

  return (
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-[hsl(var(--muted)/0.3)] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Status badge */}
        <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold uppercase ${style.text} ${style.bg} ${style.border}`}>
          {d.status}
        </span>

        {/* Service info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{d.serviceName}</span>
            <span className="text-xs text-[hsl(var(--muted-foreground))] font-mono">
              {d.fromTag} → <span className="text-[hsl(var(--accent))]">{d.toTag}</span>
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
              { production: 'bg-red-900/40 text-red-300', staging: 'bg-yellow-900/40 text-yellow-300', development: 'bg-blue-900/40 text-blue-300' }[d.environment]
            }`}>{d.environment}</span>
            <span className="text-xs text-[hsl(var(--muted-foreground))]">{d.strategy}</span>
            <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
              <User size={10} /> {d.triggeredBy}
            </span>
          </div>
        </div>

        {/* Duration */}
        {d.duration && (
          <div className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
            <Clock size={11} />
            {(d.duration / 1000).toFixed(1)}s
          </div>
        )}

        {/* Time */}
        <div className="text-xs text-[hsl(var(--muted-foreground))] text-right">
          {formatDistanceToNow(new Date(d.startedAt), { addSuffix: true })}
        </div>

        {/* Rollback button */}
        {d.rollbackAvailable && d.status === 'success' && (
          <button
            onClick={(e) => { e.stopPropagation(); onRollback(d.id); }}
            className="p-1.5 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.1)] transition-all"
            title="Rollback to this deployment"
          >
            <RotateCcw size={14} />
          </button>
        )}

        <ChevronDown size={15} className={`text-[hsl(var(--muted-foreground))] transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </div>

      {expanded && (
        <div className="border-t border-[hsl(var(--border))] p-5 bg-[hsl(var(--muted)/0.2)]">
          <div className="text-xs text-[hsl(var(--muted-foreground))] mb-3">Deployment Logs</div>
          <div className="space-y-1.5 font-mono text-xs max-h-48 overflow-y-auto">
            {d.logs.map((log, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[hsl(var(--muted-foreground))]">{format(new Date(log.timestamp), 'HH:mm:ss')}</span>
                <span className={{
                  info: 'text-blue-400', warn: 'text-yellow-400',
                  error: 'text-red-400', success: 'text-green-400'
                }[log.level]}>[{log.level.toUpperCase()}]</span>
                {log.step && <span className="text-[hsl(var(--accent))]">[{log.step}]</span>}
                <span className="text-[hsl(var(--foreground))]">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Deployments() {
  const { data: deployments, loading, refetch } = useApi<Deployment[]>('/deployments?limit=50', 15000);
  const [statusFilter, setStatusFilter] = useState<DeploymentStatus | 'all'>('all');

  const filtered = deployments?.filter(d => statusFilter === 'all' || d.status === statusFilter) ?? [];

  async function handleRollback(deploymentId: string) {
    const d = deployments?.find(dep => dep.id === deploymentId);
    if (!d || !confirm(`Roll back ${d.serviceName} to ${d.toTag}?`)) return;

    try {
      await apiPost('/rollbacks', {
        serviceId: d.serviceName,
        environment: d.environment,
        targetDeploymentId: deploymentId,
      });
      refetch();
    } catch (e) {
      alert('Rollback failed: ' + (e as Error).message);
    }
  }

  const statuses: (DeploymentStatus | 'all')[] = ['all', 'success', 'in-progress', 'failed', 'rolled-back'];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Deployments</h1>
          <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">
            {filtered.length} deployments
          </p>
        </div>
        <div className="flex bg-[hsl(var(--muted))] rounded-lg p-0.5">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                statusFilter === s ? 'bg-[hsl(var(--card))] text-white shadow' : 'text-[hsl(var(--muted-foreground))] hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading && !deployments ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-[hsl(var(--card))] rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(d => <DeploymentCard key={d.id} d={d} onRollback={handleRollback} />)}
        </div>
      )}
    </div>
  );
}
