import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { DeploymentStrategy, Environment } from '@dpo/shared';
import { apiPost, apiGet } from '../utils/api';
import { printSuccess, printError, formatDuration, envColor } from '../utils/display';

interface DeployOptions {
  env: Environment;
  strategy: DeploymentStrategy;
  tag: string;
  yes: boolean;
}

export function deployCommand(): Command {
  return new Command('deploy')
    .description('Deploy a service to an environment')
    .argument('<service>', 'Service name to deploy')
    .option('-e, --env <environment>', 'Target environment', 'staging')
    .option('-s, --strategy <strategy>', 'Deployment strategy (rolling|blue-green|canary|recreate)', 'rolling')
    .option('-t, --tag <tag>', 'Docker image tag to deploy', 'latest')
    .option('-y, --yes', 'Skip confirmation prompt', false)
    .action(async (service: string, options: DeployOptions) => {
      try {
        if (!options.yes) {
          const { confirmed } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirmed',
              message: `Deploy ${chalk.cyan(service)} → ${envColor(options.env)} using ${chalk.yellow(options.strategy)} strategy with tag ${chalk.magenta(options.tag)}?`,
              default: false,
            },
          ]);

          if (!confirmed) {
            console.log(chalk.gray('Deployment cancelled.'));
            return;
          }
        }

        const spinner = ora(`Starting deployment of ${service}...`).start();

        const deployment = await apiPost<{ id: string; estimatedDuration: number }>('/deployments', {
          serviceName: service,
          environment: options.env,
          strategy: options.strategy,
          tag: options.tag,
        });

        spinner.succeed(`Deployment started: ${chalk.cyan(deployment.id)}`);
        console.log('');

        // Poll for status
        const pollSpinner = ora('Deploying...').start();
        let done = false;
        let attempts = 0;

        while (!done && attempts < 120) {
          await sleep(3000);
          attempts++;

          const status = await apiGet<{ status: string; logs: { level: string; message: string }[]; duration?: number }>(
            `/deployments/${deployment.id}`
          );

          const lastLog = status.logs[status.logs.length - 1];
          if (lastLog) {
            pollSpinner.text = chalk.gray(`[${lastLog.level.toUpperCase()}] ${lastLog.message}`);
          }

          if (['success', 'failed', 'rolled-back', 'cancelled'].includes(status.status)) {
            done = true;

            if (status.status === 'success') {
              pollSpinner.succeed(
                `Deployment successful! ${status.duration ? `(${formatDuration(status.duration)})` : ''}`
              );
              printSuccess(`${service} is now live on ${envColor(options.env)}`);
            } else {
              pollSpinner.fail(`Deployment ${status.status}`);
              printError(`Run ${chalk.cyan(`dpo logs ${deployment.id}`)} for details`);
              process.exit(1);
            }
          }
        }

        if (!done) {
          pollSpinner.warn('Deployment is taking longer than expected. Check status with:');
          console.log(chalk.cyan(`  dpo status ${service} --env ${options.env}`));
        }
      } catch (err) {
        printError((err as Error).message);
        process.exit(1);
      }
    });
}

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}
