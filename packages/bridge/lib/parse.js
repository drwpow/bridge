const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { isImportDeclaration } = require('@babel/types');
const findBabelConfig = require('find-babel-config');
const error = require('./error');
const loadBabelPlugins = require('./load-babel-plugins');
const requireResolve = require('./resolve');

const DEFAULT_OPTIONS = {
  sourceType: 'module',
};

// Find all import & require statements via Babel
const findImports = file => {
  const parentDir = path.dirname(file);
  const { config } = findBabelConfig.sync(parentDir);
  if (!config)
    error(`could not find Babel config in any parent directory of ${file}`);

  const plugins = loadBabelPlugins(config);

  return new Promise((resolve, reject) =>
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        error(err);
        return reject(err);
      }

      const ast = parse(data, {
        ...DEFAULT_OPTIONS,
        ...config,
        plugins: [...plugins, ...config.plugins],
      });

      const imports = [];

      traverse(ast, {
        enter(node) {
          if (isImportDeclaration(node)) {
            const loc = requireResolve(parentDir, node.node.source.value);
            imports.push(loc);
          }
        },
      });

      return resolve(imports);
    })
  );
};

const buildFlatTree = async files => {
  // Keep the tree one level up so async can just work
  const shakenTree = [];

  const recursiveScan = async newFiles =>
    newFiles.forEach(async file => {
      const imports = await findImports(file);
      if (!imports.length) return;
      const newImports = imports.filter(loc => shakenTree.indexOf(loc) === -1);
      shakenTree.push(newImports);
      recursiveScan(newImports);
    });

  await recursiveScan(files);

  return shakenTree;
};

module.exports = buildFlatTree;
