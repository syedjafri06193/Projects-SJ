import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { Service, Environment } from '@dpo/shared';
import { apiGet } from '../utils/api';
import { printError, makeTable, statusColor, healthColor, envColor } from '../utils/display';

interface StatusOptions {
  env?: Environment;
  watch: boolean;
}

export function statusCommand(): Command {
  return new Command('status')
    .description('Show status of services')
    .argument('[service]', 'Specific service name (omit for all)')
    .option('-e, --env <environment>', 'Filter by environment')
    .option('-w, --watch', 'Watch for changes (refresh every 5s)', false)
    .action(async (service: string | undefined, options: StatusOptions) => {
      const render = async () => {
        try {
          const url = service
            ? `/services/${service}${options.env ? `?env=${options.env}` : ''}`
            : `/services${options.env ? `?env=${options.env}` : ''}`;

          const spinner = ora('Fetching status...').start();
          const data = service
            ? [await apiGet<Service>(url)]
            : await apiGet<Service[]>(url);
          spinner.stop();

          if (options.watch) process.stdout.write('\x1Bc'); // clear screen

          const table = makeTable(
            ['Service', 'Environment', 'Tag', 'Status', 'Health', 'Replicas', 'Ports'],
            [20, 14, 16, 16, 14, 12, 16]
          );

          data.forEach((svc) => {
            const ports = svc.ports.map((p) => `${p.host}:${p.container}`).join(', ');
            table.push([
              chalk.white.bold(svc.name),
              envColor(svc.environment),
              chalk.magenta(svc.tag),
              statusColor(svc.status),
              healthColor(svc.healthCheck.status),
              `${svc.replicas.running}/${svc.replicas.desired}`,
              chalk.gray(ports || '-'),
            ]);
          });

          console.log(table.toString());

          if (options.watch) {
            console.log(chalk.gray(`\nLast updated: ${new Date().toLocaleTimeString()} — Ctrl+C to stop`));
          }
        } catch (err) {
          printError((err as Error).message);
          if (!options.watch) process.exit(1);
        }
      };

      await render();

      if (options.watch) {
        setInterval(render, 5000);
      }
    });
}
