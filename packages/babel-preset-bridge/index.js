const { declare } = require('@babel/helper-plugin-utils');
const bridge = require('babel-plugin-bridge');

module.exports = declare((api, options) => {
  api.assertVersion(7);

  return {
    plugins: [[bridge, options]],
  };
});
