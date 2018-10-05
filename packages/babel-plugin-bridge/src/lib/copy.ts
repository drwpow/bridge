import { readFileSync, writeFileSync } from 'fs';
import { dirname, relative, resolve, sep } from 'path';
import { mkdirpSync } from 'fs-extra';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import {
  exportDefaultDeclaration,
  importDeclaration,
  importDefaultSpecifier,
  isAssignmentExpression,
  stringLiteral,
} from '@babel/types';
import generate from '@babel/generator';
import { getOutDir } from './babel-cli-params';
import resolveModule, { fileExists, searchUpwards } from './resolve';
import { isRequire, isModuleExport } from './node-type';
import forwardSlash from './forward-slash';

// Utils

/**
 * Load metadata for node module (name, version, etc.)
 * @param {string} baseDir Starting directory
 */
const getMeta = (baseDir: string) => {
  const packageJSON = searchUpwards({ baseDir, filename: 'package.json' });
  if (packageJSON) return JSON.parse(readFileSync(packageJSON, 'utf8'));
  return false;
};

const transformImportExport = (
  path,
  meta: { filename: string; required: string }
) => {
  const { filename, required } = meta;

  const requiredMeta = getMeta(dirname(required));

  // Enforce forward-slash here for web (we’re not in Node anymore)
  let newFilename = forwardSlash(relative(dirname(filename), required));
  if (newFilename[0] !== '.') newFilename = `./${newFilename}`;
  newFilename = newFilename.replace(
    `/${requiredMeta.name}/`,
    `/${requiredMeta.name}@${requiredMeta.version}`
  );

  const uid = path.scope.generateUidIdentifier('module');
  console.log(path.get('left').node.type);
  path.get('left').replaceWith(exportDefaultDeclaration(uid));
  path
    .get('right')
    .replaceWith(
      importDeclaration(
        [importDefaultSpecifier(uid)],
        stringLiteral(newFilename)
      )
    );
};

const transformExport = path => {
  // path.replaceWith(exportDefaultDeclaration());
};

const transformImport = (path, meta: { filename: string }) => {
  const { filename } = meta;

  const token = path.get('right').node.arguments[0].value;
  if (typeof token !== 'string') return;

  const isNodeModule = token[0] !== '.';
  const next = resolveModule({
    filename: token,
    baseDir: dirname(filename),
    nodeModule: isNodeModule,
  });
  if (!next) return;

  // ImportSpecifier: import { Component } from 'react';
  // ImportNamespaceSpecifier: import * as React from 'react';
  // ImportDefaultSpecifier: import React from 'react';

  // Start parsing next file in background
  copy(next);

  const nextMeta = getMeta(dirname(next));

  // Enforce forward-slash here for web (we’re not in Node anymore)
  let newFilename = forwardSlash(relative(dirname(filename), next));
  if (newFilename[0] !== '.') newFilename = `./${newFilename}`;
  newFilename = newFilename.replace(
    `/${nextMeta.name}/`,
    `/${nextMeta.name}@${nextMeta.version}`
  );

  path.node.arguments[0] = newFilename;
};

// Methods

/**
 * @param {string} filename File to parse & copy
 * @param {object} options
 * @param {boolean} options.sourceMaps Generate sourcemaps? Default: false
 */
const copy = async (filename: string, options?: { sourceMaps: boolean }) => {
  const sourceMaps =
    (typeof options === 'object' && options.sourceMaps) || false;

  let modulePath = filename;
  const { name, version } = getMeta(dirname(filename));
  const moduleName = `${name}@${version}`;

  modulePath = modulePath.replace(
    `node_modules${sep}${name}`,
    `${getOutDir()}${sep}node_modules${sep}${moduleName}`
  );

  // Exit if we’ve copied this already (caching handled by babel-preset-bridge)
  // if (fileExists(modulePath)) {
  //   return;
  // }
  mkdirpSync(dirname(modulePath));

  const code = readFileSync(filename, 'utf8');
  const ast = parse(code, { sourceType: 'module' });

  traverse(ast, {
    enter(path) {
      // Easy: var module = require('…');
      // if (isVariableDeclarator(path.node)) {
      //   console.log(path.node);
      //   // transformImport(path, { filename });
      // }

      // if (isModuleExport(path.node)) {
      //   transformExport(path);
      // }

      if (isAssignmentExpression(path.node)) {
        if (isRequire(path.node.right)) {
          const token = path.get('right').node.arguments[0].value;
          if (typeof token !== 'string') return;

          const isNodeModule = token[0] !== '.';
          const required = resolveModule({
            filename: token,
            baseDir: dirname(filename),
            nodeModule: isNodeModule,
          });

          // If next module can’t be found, ignore
          if (!required) return;

          // If next module is found, queue that up in background
          copy(required);

          if (isModuleExport(path.node.left) && path.node.operator === '=') {
            transformImportExport(path, { filename, required });
          }
        }
      }

      // if (isRequire(path.node)) {
      //   const parent = path.find(node => node.isAssignmentExpression());
      //   console.log(parent.node);
      // }
    },
  });

  const reassembled = generate(ast);
  writeFileSync(modulePath, reassembled.code);
  if (sourceMaps)
    writeFileSync(modulePath.replace(/\.js$/, '.map.js'), reassembled.maps);
};

export default copy;
