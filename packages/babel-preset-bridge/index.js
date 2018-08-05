const { declare } = require('@babel/helper-plugin-utils');
const bridge = require('../babel-plugin-bridge');

module.exports = declare((api, { ignore }) => {
  api.assertVersion(7);

  return {
    plugins: [[bridge, { ignore }]],
  };
});
