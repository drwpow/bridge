import chalk from 'chalk';

export const error = (message: string) =>
  console.error(chalk.red(`🚫 Error: ${message}`));

export const warn = (message: string) =>
  console.error(chalk.yellow(`⚠️  Warning:  ${message}`));
