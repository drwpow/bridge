const { declare } = require('@babel/helper-plugin-utils');
const bridge = require('../babel-plugin-bridge');

module.exports = declare((api, { aliases, ignore }) => {
  api.assertVersion(7);

  return {
    plugins: [
      ['transform-inline-environment-variables'],
      [bridge, { aliases, ignore }],
    ],
  };
});
