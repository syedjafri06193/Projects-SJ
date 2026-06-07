import chalk from 'chalk';
import Table from 'cli-table3';
import { ServiceStatus, HealthStatus, DeploymentStatus, Environment } from '@dpo/shared';

export function statusColor(status: ServiceStatus | DeploymentStatus): string {
  const colors: Record<string, chalk.Chalk> = {
    running: chalk.green,
    success: chalk.green,
    healthy: chalk.green,
    stopped: chalk.gray,
    error: chalk.red,
    failed: chalk.red,
    unhealthy: chalk.red,
    deploying: chalk.yellow,
    'in-progress': chalk.yellow,
    'rolling-back': chalk.yellow,
    'rolled-back': chalk.cyan,
    pending: chalk.gray,
    degraded: chalk.yellow,
    unknown: chalk.gray,
    cancelled: chalk.gray,
  };
  const fn = colors[status] || chalk.white;
  return fn(status.toUpperCase());
}

export function healthColor(status: HealthStatus): string {
  const colors: Record<HealthStatus, chalk.Chalk> = {
    healthy: chalk.green,
    unhealthy: chalk.red,
    degraded: chalk.yellow,
    unknown: chalk.gray,
  };
  return colors[status](status.toUpperCase());
}

export function envColor(env: Environment): string {
  const colors: Record<Environment, chalk.Chalk> = {
    production: chalk.red.bold,
    staging: chalk.yellow,
    development: chalk.blue,
  };
  return colors[env](env);
}

export function makeTable(head: string[], colWidths?: number[]): Table.Table {
  return new Table({
    head: head.map((h) => chalk.cyan.bold(h)),
    ...(colWidths ? { colWidths } : {}),
    style: {
      head: [],
      border: ['gray'],
    },
    chars: {
      top: '─',
      'top-mid': '┬',
      'top-left': '╭',
      'top-right': '╮',
      bottom: '─',
      'bottom-mid': '┴',
      'bottom-left': '╰',
      'bottom-right': '╯',
      left: '│',
      'left-mid': '├',
      mid: '─',
      'mid-mid': '┼',
      right: '│',
      'right-mid': '┤',
      middle: '│',
    },
  });
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}m ${s}s`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function printError(msg: string): void {
  console.error(chalk.red('✖ ') + msg);
}

export function printSuccess(msg: string): void {
  console.log(chalk.green('✔ ') + msg);
}

export function printInfo(msg: string): void {
  console.log(chalk.blue('ℹ ') + msg);
}

export function printWarn(msg: string): void {
  console.warn(chalk.yellow('⚠ ') + msg);
}
