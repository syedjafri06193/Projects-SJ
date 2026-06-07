import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { Service } from '@dpo/shared';
import { apiGet } from '../utils/api';
import { printError, makeTable, statusColor, envColor, formatDate } from '../utils/display';

export function servicesCommand(): Command {
  const cmd = new Command('services').description('Manage services');

  cmd
    .command('list')
    .description('List all registered services')
    .option('-e, --env <environment>', 'Filter by environment')
    .action(async (options: { env?: string }) => {
      try {
        const spinner = ora('Loading services...').start();
        const services = await apiGet<Service[]>(
          `/services${options.env ? `?env=${options.env}` : ''}`
        );
        spinner.stop();

        if (!services.length) {
          console.log(chalk.gray('No services registered.'));
          return;
        }

        const table = makeTable(['Name', 'Env', 'Image', 'Tag', 'Status', 'Updated']);
        services.forEach((svc) => {
          table.push([
            chalk.white.bold(svc.name),
            envColor(svc.environment),
            chalk.gray(svc.image),
            chalk.magenta(svc.tag),
            statusColor(svc.status),
            formatDate(svc.updatedAt),
          ]);
        });
        console.log(table.toString());
      } catch (err) {
        printError((err as Error).message);
        process.exit(1);
      }
    });

  cmd
    .command('inspect <service>')
    .description('Show full details of a service')
    .option('-e, --env <environment>', 'Environment', 'staging')
    .action(async (service: string, options: { env: string }) => {
      try {
        const spinner = ora(`Inspecting ${service}...`).start();
        const svc = await apiGet<Service>(`/services/${service}?env=${options.env}`);
        spinner.stop();

        console.log('\n' + chalk.cyan.bold(`Service: ${svc.name}`));
        console.log(chalk.gray('─'.repeat(50)));

        const fields: [string, string][] = [
          ['ID', svc.id],
          ['Image', `${svc.image}:${svc.tag}`],
          ['Environment', envColor(svc.environment)],
          ['Status', statusColor(svc.status)],
          ['Health', `${svc.healthCheck.status} (${svc.healthCheck.endpoint})`],
          ['Replicas', `${svc.replicas.running}/${svc.replicas.desired} running`],
          ['Ports', svc.ports.map((p) => `${p.host}→${p.container}`).join(', ') || '-'],
          ['Created', formatDate(svc.createdAt)],
          ['Updated', formatDate(svc.updatedAt)],
        ];

        fields.forEach(([label, value]) => {
          console.log(`  ${chalk.gray(label.padEnd(14))} ${value}`);
        });

        if (Object.keys(svc.envVars).length) {
          console.log('\n' + chalk.gray('Environment Variables:'));
          Object.entries(svc.envVars).forEach(([k, v]) => {
            const masked = k.toLowerCase().includes('secret') || k.toLowerCase().includes('key')
              ? '***'
              : v;
            console.log(`  ${chalk.blue(k)} = ${chalk.gray(masked)}`);
          });
        }
        console.log('');
      } catch (err) {
        printError((err as Error).message);
        process.exit(1);
      }
    });

  return cmd;
}
