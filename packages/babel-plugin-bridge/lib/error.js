const chalk = require('chalk');

module.exports = message => console.error(chalk.red(`🚫 Error: ${message}`));
