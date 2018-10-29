import { existsSync, readFileSync, statSync, writeFileSync } from 'fs';
import { dirname, relative, sep } from 'path';
import { copySync, mkdirpSync } from 'fs-extra';
import glob from 'glob';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import {
  importDeclaration,
  isImportDeclaration,
  stringLiteral,
} from '@babel/types';
import generate from '@babel/generator';
import { getOutDir } from './babel-cli-params';
import resolveModule, { fileExists, searchUpwards } from './resolve';
import forwardSlash from './forward-slash';

/**
 * Load metadata for node module (name, version, etc.)
 * @param {string} baseDir Starting directory
 */
const getMeta = (packageJSON: string) => {
  return JSON.parse(readFileSync(packageJSON, 'utf8'));
};

/**
 * @param {string} filename File to parse & copy
 * @param {object} options
 * @param {boolean} options.sourceMaps Generate sourcemaps? Default: false
 */
const copy = async (filename: string, options?: { sourceMaps: boolean }) => {
  const sourceMaps =
    (typeof options === 'object' && options.sourceMaps) || false;

  const packageJSON = searchUpwards({
    baseDir: dirname(filename),
    filename: 'package.json',
  });

  // Not a NPM module
  if (!packageJSON) {
    return;
  }

  const rootDir = dirname(packageJSON);
  const meta = getMeta(packageJSON);

  const newFilename = (oldPath: string) =>
    oldPath.replace(
      `node_modules${sep}${meta.name}`,
      `${getOutDir()}${sep}node_modules${sep}${meta.name}@${meta.version}`
    );

  if (!existsSync(newFilename(rootDir))) {
    mkdirpSync(newFilename(rootDir));
  }

  glob(`${rootDir}${sep}**/*`, (err, files) => {
    files.forEach(file => {
      if (!fileExists(file)) {
        return;
      }

      // Exit if we’ve copied this already (caching handled by babel-preset-bridge)
      if (existsSync(newFilename(file))) {
        return;
      }

      if (file.match(/\.js$/i)) {
        const code = readFileSync(file, 'utf8');
        const ast = parse(code, { sourceType: 'module' });
        traverse(ast, {
          enter(path) {
            if (!isImportDeclaration(path)) {
              return;
            }

            const foundModule = resolveModule({
              baseDir: dirname(file),
              filename: path.node.source.value,
              nodeModule: true,
            });

            if (!foundModule) {
              return;
            }

            copy(foundModule, options);

            let relativePath = relative(dirname(file), foundModule);

            // Node sometimes omits relative `.' needed for ES Modules
            if (relativePath[0] !== '.') {
              relativePath = `.${sep}${relativePath}`;
            }

            const foundPackageJSON = searchUpwards({
              baseDir: dirname(foundModule),
              filename: 'package.json',
            });

            if (foundPackageJSON) {
              const foundMeta = getMeta(foundPackageJSON);
              relativePath = relativePath.replace(
                `${sep}${foundMeta.name}${sep}`,
                `${sep}${foundMeta.name}@${foundMeta.version}${sep}`
              );
            }

            path.replaceWith(
              importDeclaration(
                path.node.specifiers,
                stringLiteral(forwardSlash(relativePath))
              )
            );
          },
        });
        const reassembled = generate(ast);

        if (!existsSync(dirname(newFilename(file)))) {
          mkdirpSync(dirname(newFilename(file)));
        }

        writeFileSync(newFilename(file), reassembled.code);

        if (sourceMaps) {
          writeFileSync(
            newFilename(file).replace(/\.js$/, '.map.js'),
            reassembled.maps
          );
        }
      } else {
        copySync(file, newFilename(file));
      }
    });
  });
};

export default copy;
