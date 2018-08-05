const { writeFileSync } = require('fs');
const { dirname, relative, resolve } = require('path');
const { declare } = require('@babel/helper-plugin-utils');
const { importDeclaration, stringLiteral } = require('@babel/types');
const prettier = require('prettier');
const { getOutDir, getSrcDir } = require('./lib/babel-cli-params.js');
const resolveModule = require('./lib/resolve-module.js');

const dist = getOutDir();
const src = getSrcDir();

const stats = {
  modules: [],
  dist,
  files: {},
};

const addModuleSrc = loc => {
  const modulesDir = loc.replace(/node_modules(\/|\\).*$/, `node_modules`);
  if (stats.modules.indexOf(modulesDir) === -1) stats.modules.push(modulesDir);
};

module.exports = declare((api, { ignore }) => {
  api.assertVersion(7);

  return {
    visitor: {
      ImportDeclaration(path, state) {
        const { filename } = state.file.opts;

        // 1. If this is a local module, ignore (this will be revisited by Babel later)
        if (path.node.source.value[0] === '.') return;

        // 2. Identify file by path relative to current working directory (cwd)
        const id = relative(src, filename);
        if (!stats.files[id]) stats.files[id] = [];

        // 3. Resolve module
        const resolvedModule = resolveModule(path.node.source.value, {
          basedir: dirname(filename),
        });

        // 4. Add this module folder to stats
        addModuleSrc(resolvedModule.src);

        // 5. Add dependency to file, if it hasn’t been added already
        const existingDep = stats.files[id].find(
          ({ name, version }) =>
            name === resolvedModule.name && version === resolvedModule.version
        );
        if (!existingDep) stats.files[id].push(resolvedModule);

        // 6. Transform this node to refer to new file
        let newPath = relative(dirname(id), resolvedModule.src);
        if (newPath[0] !== '.') newPath = `./${newPath}`;
        path.replaceWith(
          importDeclaration(path.node.specifiers, stringLiteral(newPath))
        );
      },
    },
    post() {
      writeFileSync(
        resolve(dist, 'bridge-stats.json'),
        prettier.format(JSON.stringify(stats), { parser: 'json' })
      );
    },

    // TODO:
    // 1. Copy tree to dist/
    // 2. Update require -> import
    // 3. Update module.exports = export
    // 4. Update paths within node_modules
  };
});
