import { isCallExpression, isMemberExpression } from '@babel/types';

export const isRequire = node =>
  isCallExpression(node) && node.callee.name === 'require';

export const isModuleExport = node =>
  isMemberExpression(node) && node.object && node.object.name === 'module';
