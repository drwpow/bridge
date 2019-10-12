/**
 * @module lib/resolve
 */
import { existsSync, statSync } from 'fs';
import { resolve, sep } from 'path';

// Utilities

export const testPath = (filename: string) => {
  if (existsSync(filename)) {
    let returnPath = filename;
    try {
      returnPath = require.resolve(filename);
    } finally {
      return returnPath;
    }
  }

  const withExtension = `${filename}.js`;
  if (existsSync(withExtension)) {
    return withExtension;
  }

  return false;
};

export const fileExists = (filename: string) =>
  existsSync(filename) && statSync(filename).isFile();

const parentDir = (baseDir: string) => resolve(baseDir, '..');

// Methods

/**
 * Resolve file by recursively searching parent directories. Useful for finding
 * things like package.json or node_modules
 * @param {object} params
 * @param {string} params.baseDir Starting directory
 * @param {string} params.filename Relative filename to search
 * @param {boolean} params.isDir Is directory
 */
export const searchUpwards = (params: {
  baseDir: string;
  filename: string;
  isDir?: boolean;
}) => {
  const { baseDir, filename, isDir = false } = params;
  let cwd = baseDir;

  while (cwd !== sep && !testPath(resolve(cwd, filename))) {
    cwd = parentDir(cwd);
  }

  const result = resolve(cwd, filename);

  // If this is a dir, return wherever we landed
  if (isDir) {
    return existsSync(result) ? result : false;
  }

  // Return file location, or search for sensible locations/indexes
  return testPath(result);
};

/**
 * Try to resolve a file or node module by specifing a starting directory and
 * filename to search for
 * @param {object} params
 * @param {string} params.baseDir Starting directory
 * @param {string} params.filename Relative filename to search
 * @param {boolean?} params.nodeModule Should we search node_modules for this?
 * @returns {string|boolean} Absolute pathname, or false
 */
export default (params: {
  baseDir: string;
  filename: string;
  nodeModule?: boolean;
}) => {
  const { baseDir, filename, nodeModule = false } = params;

  if (nodeModule) {
    const modules = searchUpwards({
      filename: 'node_modules',
      baseDir,
      isDir: true,
    });

    if (modules) {
      return searchUpwards({ baseDir: modules, filename });
    }
  }

  return searchUpwards({ filename, baseDir });
};
