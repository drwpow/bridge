import { readFileSync } from 'fs';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { isRequire } from './node-type';

const OPTIONS = {
  sourceType: 'module',
};

export default (file: string) => {
  const tree = {};

  const shake = (filepath: string) => {
    const code = readFileSync(filepath, 'utf8');
    const ast = parse(code, OPTIONS);

    traverse(ast, {
      enter(path) {
        if (isRequire(path.node)) {
          let moduleName = path.node.arguments[0].value;
          if (typeof moduleName !== 'string') return undefined;
          console.log(moduleName);
        }
      },
    });
  };

  shake(file);

  return tree;
};
