import {
  isAssignmentExpression,
  isCallExpression,
  isVariableDeclaration,
} from '@babel/types';

// const module = require('module');
export const isAssignmentRequire = node => {
  if (!isVariableDeclaration(node)) {
    return false;
  }

  return node.declarations.reduce((result, declarator) => {
    if (!isCallExpression(declarator.init)) {
      result = false;
      return;
    }

    const isRequire = declarator.init.callee.name === 'require';

    if (result === true && isRequire === true) {
      return true;
    }

    return false;
  }, true);
};

// module.exports = require('module');
export const isExportRequire = node => {
  if (!isAssignmentExpression(node) || node.operator !== '=') {
    return false;
  }

  const isModuleExport =
    node.left.name === 'exports' ||
    (node.left.object &&
      node.left.object.name === 'module' &&
      node.left.property &&
      node.left.property.name === 'exports');

  return (
    isModuleExport &&
    isCallExpression(node.right) &&
    node.right.callee.name === 'require'
  );
};
