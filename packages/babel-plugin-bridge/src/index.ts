import { readFileSync } from 'fs';
import { dirname, relative, resolve, sep } from 'path';
import { declare } from '@babel/helper-plugin-utils';
import { importDeclaration, stringLiteral } from '@babel/types';
import resolveModule, { searchUpwards } from './lib/resolve';
import { getSrcDir } from './lib/babel-cli-params';
import copy from './lib/copy';
import forwardSlash from './lib/forward-slash';

export default declare(
  (api, options?: { alias?: any; sourceMaps?: boolean }) => {
    const { alias = {}, sourceMaps = false } = options;
    api.assertVersion(7);

    return {
      visitor: {
        ImportDeclaration(path, hub) {
          let token = path.node.source.value;

          if (token[0] === '.') {
            return;
          }

          if (alias[token]) {
            token = alias[token];
          }

          let baseDir = dirname(hub.file.opts.filename);
          let foundModule = resolveModule({
            baseDir,
            filename: token,
            nodeModule: true,
          });

          if (!foundModule) {
            return;
          }

          const modulePackageJSON = searchUpwards({
            baseDir: dirname(foundModule),
            filename: 'package.json',
          });

          if (!modulePackageJSON) {
            return;
          }

          const { name, version } = JSON.parse(
            readFileSync(modulePackageJSON, 'utf8')
          );

          copy(foundModule, { sourceMaps });

          // If node_modules are above the src dir (common for many apps),
          // let’s pretend they’re in the root for when they get copied to output
          const isAboveSrcDir =
            dirname(foundModule).indexOf(resolve(__dirname, getSrcDir())) ===
            -1;

          if (isAboveSrcDir) {
            const modules = searchUpwards({
              baseDir: dirname(foundModule),
              filename: 'node_modules',
              isDir: true,
            });

            if (!modules) {
              return;
            }

            const src = relative(dirname(modules), getSrcDir());
            foundModule = foundModule.replace(
              `node_modules${sep}${name}`,
              `${src}${sep}node_modules${sep}${name}@${version}`
            );
          }

          let relativePath = relative(baseDir, foundModule);
          if (relativePath[0] !== '.') {
            relativePath = `.${sep}${relativePath}`;
          }

          path.replaceWith(
            importDeclaration(
              path.node.specifiers,
              stringLiteral(forwardSlash(relativePath))
            )
          );
        },
      },
      post() {},
    };
  }
);
