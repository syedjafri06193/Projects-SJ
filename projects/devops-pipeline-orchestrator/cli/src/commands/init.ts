import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { saveConfig } from '../config';
import { printSuccess } from '../utils/display';

export function initCommand(): Command {
  return new Command('init')
    .description('Initialize DPO configuration')
    .action(async () => {
      console.log(chalk.cyan('\n⚙  DPO Configuration Setup\n'));

      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'apiUrl',
          message: 'Dashboard API URL:',
          default: 'http://localhost:3001/api',
        },
        {
          type: 'password',
          name: 'apiKey',
          message: 'API key (leave empty if not configured):',
        },
        {
          type: 'list',
          name: 'defaultEnvironment',
          message: 'Default environment:',
          choices: ['development', 'staging', 'production'],
          default: 'staging',
        },
      ]);

      saveConfig({
        apiUrl: answers.apiUrl,
        apiKey: answers.apiKey || undefined,
        defaultEnvironment: answers.defaultEnvironment,
      });

      printSuccess('Configuration saved to ~/.dpo/config.yml');
      console.log(chalk.gray('\nRun `dpo services list` to verify the connection.\n'));
    });
}
