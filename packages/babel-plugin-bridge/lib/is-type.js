const { isCallExpression } = require('@babel/types');

const isRequire = node =>
  isCallExpression(node) && node.callee.name === 'require';

module.exports = {
  isRequire,
};
