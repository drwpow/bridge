// Determine which plugins to load for @babel/parser
module.exports = config => {
  const ALL_PLUGINS = [
    'asyncGenerators',
    'bigInt',
    'flow',
    'flowComments',
    'jsx',
    'typescript',
  ];

  const configBody = JSON.stringify(config);
  return ALL_PLUGINS.filter(plugin => {
    const match = configBody.indexOf(plugin) !== -1;
    switch (plugin) {
      case 'asyncGenerator':
        return configBody.indexOf('async-generator') !== -1;
      case 'flowComments':
        return configBody.indexOf('flow-comments') !== -1;
      case 'jsx':
        return match || configBody.indexOf('react') !== -1;
      default:
        return match;
    }
  });
};
