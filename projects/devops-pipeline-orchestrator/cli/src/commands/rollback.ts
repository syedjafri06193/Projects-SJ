import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { Deployment, Environment } from '@dpo/shared';
import { apiGet, apiPost } from '../utils/api';
import { printSuccess, printError, makeTable, formatDate, statusColor, envColor } from '../utils/display';

interface RollbackOptions {
  env: Environment;
  yes: boolean;
  reason?: string;
}

export function rollbackCommand(): Command {
  return new Command('rollback')
    .description('Roll back a service to a previous deployment')
    .argument('<service>', 'Service name to roll back')
    .option('-e, --env <environment>', 'Target environment', 'staging')
    .option('-y, --yes', 'Skip confirmation prompt', false)
    .option('-r, --reason <reason>', 'Reason for rollback')
    .action(async (service: string, options: RollbackOptions) => {
      try {
        const spinner = ora(`Fetching deployment history for ${service}...`).start();
        const deployments = await apiGet<Deployment[]>(
          `/services/${service}/deployments?env=${options.env}&limit=5`
        );
        spinner.stop();

        if (!deployments.length) {
          printError(`No deployments found for ${service} in ${options.env}`);
          return;
        }

        // Show history
        const table = makeTable(['#', 'ID', 'Tag', 'Status', 'Deployed At', 'Duration']);
        deployments.forEach((d, i) => {
          table.push([
            i === 0 ? chalk.green('▶ current') : String(i),
            chalk.gray(d.id.slice(0, 8)),
            chalk.magenta(d.toTag),
            statusColor(d.status),
            formatDate(d.startedAt),
            d.duration ? `${(d.duration / 1000).toFixed(1)}s` : '-',
          ]);
        });
        console.log(table.toString());

        const rollbackable = deployments.filter((d, i) => i > 0 && d.status === 'success');
        if (!rollbackable.length) {
          printError('No successful previous deployments available to roll back to.');
          return;
        }

        let target: Deployment;
        if (options.yes) {
          target = rollbackable[0];
        } else {
          const { targetId } = await inquirer.prompt([
            {
              type: 'list',
              name: 'targetId',
              message: 'Select deployment to roll back to:',
              choices: rollbackable.map((d) => ({
                name: `${d.id.slice(0, 8)} — tag: ${d.toTag} — ${formatDate(d.startedAt)}`,
                value: d.id,
              })),
            },
          ]);
          target = rollbackable.find((d) => d.id === targetId)!;
        }

        if (!options.yes) {
          const { confirmed } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirmed',
              message: `Roll back ${chalk.cyan(service)} on ${envColor(options.env)} to tag ${chalk.magenta(target.toTag)}?`,
              default: false,
            },
          ]);
          if (!confirmed) {
            console.log(chalk.gray('Rollback cancelled.'));
            return;
          }
        }

        const rollbackSpinner = ora('Initiating rollback...').start();
        const result = await apiPost<{ success: boolean; message: string; duration: number }>(
          '/rollbacks',
          {
            serviceId: service,
            environment: options.env,
            targetDeploymentId: target.id,
            reason: options.reason,
          }
        );

        if (result.success) {
          rollbackSpinner.succeed(`Rollback complete in ${(result.duration / 1000).toFixed(1)}s`);
          printSuccess(result.message);
        } else {
          rollbackSpinner.fail('Rollback failed');
          printError(result.message);
          process.exit(1);
        }
      } catch (err) {
        printError((err as Error).message);
        process.exit(1);
      }
    });
}
