const { existsSync } = require('fs');
const path = require('path');

const NODE_MODULES = 'node_modules';

module.exports = (cwd = process.cwd(), search) => {
  const isRelative = search[0] === '.';

  // If relative, this should be easy
  // If using babel-plugin-module-resolver, that should convert to relative

  if (isRelative) {
    return require.resolve(path.resolve(cwd, search));
  }

  // If absolute, check in node_modules
  // TODO: check webpack resolver?

  const npmPath = path.resolve(process.cwd(), NODE_MODULES, search);

  if (existsSync(npmPath)) {
    return require.resolve(npmPath);
  }
};
