import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { Service } from '@dpo/shared';
import { apiGet } from '../utils/api';
import { printError, makeTable, healthColor, envColor } from '../utils/display';

interface HealthOptions {
  env?: string;
}

export function healthCommand(): Command {
  return new Command('health')
    .description('Run health checks across services')
    .argument('[service]', 'Specific service (omit for all)')
    .option('-e, --env <environment>', 'Filter by environment')
    .action(async (service: string | undefined, options: HealthOptions) => {
      try {
        const spinner = ora('Running health checks...').start();

        const url = service
          ? `/services/${service}${options.env ? `?env=${options.env}` : ''}`
          : `/services${options.env ? `?env=${options.env}` : ''}`;

        const data = service
          ? [await apiGet<Service>(url)]
          : await apiGet<Service[]>(url);

        spinner.stop();

        const table = makeTable(
          ['Service', 'Env', 'Endpoint', 'Status', 'Latency', 'Code', 'Last Checked'],
          [20, 12, 30, 14, 10, 8, 24]
        );

        data.forEach((svc) => {
          const hc = svc.healthCheck;
          table.push([
            chalk.white.bold(svc.name),
            envColor(svc.environment),
            chalk.gray(hc.endpoint),
            healthColor(hc.status),
            hc.latency ? `${hc.latency}ms` : '-',
            hc.responseCode ? String(hc.responseCode) : '-',
            chalk.gray(new Date(hc.lastChecked).toLocaleString()),
          ]);
        });

        console.log(table.toString());

        const unhealthy = data.filter((s) => s.healthCheck.status !== 'healthy');
        if (unhealthy.length) {
          console.log(
            chalk.yellow(`\n⚠  ${unhealthy.length} service(s) degraded or unhealthy`)
          );
        } else {
          console.log(chalk.green('\n✔  All services healthy'));
        }
      } catch (err) {
        printError((err as Error).message);
        process.exit(1);
      }
    });
}
