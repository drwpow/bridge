const { readFileSync } = require('fs-extra');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { isRequire } = require('./is-type.js');

const OPTIONS = {
  sourceType: 'module',
};

module.exports = file => {
  const tree = {};

  const shake = filepath => {
    const code = readFileSync(filepath, 'utf8');
    const ast = parse(code, OPTIONS);

    traverse(ast, {
      enter(path) {
        if (isRequire(path.node)) {
          const moduleName = path.node.arguments[0].value;
          if (typeof moduleName !== 'string') return;
          console.log(moduleName);
        }
      },
    });
  };

  shake(file);

  return tree;
};
