import { writeFileSync } from 'fs';
import { dirname, relative, resolve } from 'path';
import { declare } from '@babel/helper-plugin-utils';
import { importDeclaration, stringLiteral } from '@babel/types';
import minimatch from 'minimatch';
import prettier from 'prettier';
import { getOutDir, getSrcDir } from './lib/babel-cli-params';
import resolveModule from './lib/resolve-module';
import treeShake from './lib/tree-shake';

const dist = getOutDir();
const src = getSrcDir();

const stats = {
  dist,
  env: process.env.NODE_ENV || 'development',
  files: {},
  modules: [],
};

const addModuleSrc = (loc: string) => {
  const modulesDir = loc.replace(/node_modules(\/|\\).*$/, `node_modules`);
  if (stats.modules.indexOf(modulesDir) === -1) stats.modules.push(modulesDir);
};

export default declare((api, { aliases = {}, ignore = [] }) => {
  api.assertVersion(7);

  return {
    visitor: {
      ImportDeclaration(
        path: {
          node: { source: { value: string }; specifiers: any };
          replaceWith: any;
        },
        state: { file: { opts: { filename: string } } }
      ) {
        const { filename } = state.file.opts;

        // 1. If ignore pattern is matched, skip
        if (ignore.some(pattern => minimatch(filename, pattern))) return;

        // 2. Ignore local paths (it’s either been resolved, or will be hit with Babel later)
        if (path.node.source.value[0] === '.') return;

        // 3. Identify file by path relative to current working directory (cwd)
        const id = relative(src, filename);
        if (!stats.files[id]) stats.files[id] = [];

        // 4. Resolve module
        const alias = aliases[path.node.source.value] || path.node.source.value;
        const resolvedModule = resolveModule(alias, {
          basedir: dirname(filename),
        });

        // 5. Add this module folder to stats
        addModuleSrc(resolvedModule.src);

        // 6. Add dependency to file, if it hasn’t been added already
        const existingDep = stats.files[id].find(
          ({ name, version }) =>
            name === resolvedModule.name && version === resolvedModule.version
        );
        if (!existingDep) stats.files[id].push(resolvedModule);

        // 7. Transform this node to refer to new file
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
