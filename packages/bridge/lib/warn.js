const chalk = require('chalk');

module.exports = message =>
  console.warn(chalk.yellow(`⚠️  Warning: ${message}`));
