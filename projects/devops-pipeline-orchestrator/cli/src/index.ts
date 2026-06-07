#!/usr/bin/env node

import { Command } from 'commander';
import { deployCommand } from './commands/deploy';
import { rollbackCommand } from './commands/rollback';
import { statusCommand } from './commands/status';
import { logsCommand } from './commands/logs';
import { healthCommand } from './commands/health';
import { initCommand } from './commands/init';
import { servicesCommand } from './commands/services';
import chalk from 'chalk';

const program = new Command();

console.log(
  chalk.green(`
  ██████╗ ██████╗  ██████╗ 
  ██╔══██╗██╔══██╗██╔═══██╗
  ██║  ██║██████╔╝██║   ██║
  ██║  ██║██╔═══╝ ██║   ██║
  ██████╔╝██║     ╚██████╔╝
  ╚═════╝ ╚═╝      ╚═════╝ 
  `) +
  chalk.gray('  DevOps Pipeline Orchestrator v1.0.0\n')
);

program
  .name('dpo')
  .description('DevOps Pipeline Orchestrator — manage multi-environment deployments')
  .version('1.0.0');

program.addCommand(initCommand());
program.addCommand(deployCommand());
program.addCommand(rollbackCommand());
program.addCommand(statusCommand());
program.addCommand(logsCommand());
program.addCommand(healthCommand());
program.addCommand(servicesCommand());

program.parse(process.argv);
