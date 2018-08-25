import { isCallExpression } from '@babel/types';

export const isRequire = (node: { callee: { name: string } }) =>
  isCallExpression(node) && node.callee.name === 'require';
