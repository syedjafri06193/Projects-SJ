import { Command } from 'commander';
import chalk from 'chalk';
import WebSocket from 'ws';
import { apiGet } from '../utils/api';
import { DeploymentLog, Deployment } from '@dpo/shared';
import { printError, printInfo } from '../utils/display';
import { loadConfig } from '../config';

interface LogsOptions {
  follow: boolean;
  tail: number;
  env?: string;
}

function colorLog(log: DeploymentLog): string {
  const ts = chalk.gray(new Date(log.timestamp).toLocaleTimeString());
  const level = {
    info: chalk.blue('[INFO]'),
    warn: chalk.yellow('[WARN]'),
    error: chalk.red('[ERR ]'),
    success: chalk.green('[OK  ]'),
  }[log.level];
  const step = log.step ? chalk.cyan(`[${log.step}] `) : '';
  return `${ts} ${level} ${step}${log.message}`;
}

export function logsCommand(): Command {
  return new Command('logs')
    .description('Show logs for a deployment or service')
    .argument('<id>', 'Deployment ID or service name')
    .option('-f, --follow', 'Stream logs in real-time', false)
    .option('-n, --tail <lines>', 'Number of recent lines to show', '50')
    .option('-e, --env <environment>', 'Environment (when following a service)')
    .action(async (id: string, options: LogsOptions) => {
      try {
        if (!options.follow) {
          const deployment = await apiGet<Deployment>(`/deployments/${id}`);
          const logs = deployment.logs.slice(-Number(options.tail));

          console.log(chalk.gray(`\n── Deployment ${chalk.cyan(id.slice(0, 8))} logs ──\n`));
          logs.forEach((log) => console.log(colorLog(log)));
          console.log('');
          return;
        }

        // Follow mode — WebSocket stream
        const config = loadConfig();
        const wsUrl = (config.apiUrl || 'http://localhost:3001/api')
          .replace('http', 'ws')
          .replace('/api', '');

        printInfo(`Streaming logs for ${chalk.cyan(id)} (Ctrl+C to stop)...\n`);

        const ws = new WebSocket(`${wsUrl}/ws/logs?service=${id}&env=${options.env || 'staging'}`);

        ws.on('message', (data: WebSocket.Data) => {
          try {
            const log: DeploymentLog = JSON.parse(data.toString());
            console.log(colorLog(log));
          } catch {
            console.log(chalk.gray(data.toString()));
          }
        });

        ws.on('error', (err) => printError(`WebSocket error: ${err.message}`));
        ws.on('close', () => printInfo('Log stream closed.'));

        process.on('SIGINT', () => {
          ws.close();
          process.exit(0);
        });
      } catch (err) {
        printError((err as Error).message);
        process.exit(1);
      }
    });
}
