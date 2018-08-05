const { existsSync, readFileSync } = require('fs');
const { dirname, relative } = require('path');
const resolve = require('resolve');
const pkgUp = require('pkg-up');
const warn = require('./warn.js');

module.exports = (id, opts) => {
  let src;

  try {
    src = resolve.sync(id, opts);
  } catch (e) {
    warn(`could not locate ${id} in ${opts.basedir || process.cwd()}`);
    return undefined;
  }

  const stats = {
    src: relative(process.cwd(), src),
  };

  const packageJSON = pkgUp.sync(dirname(src));

  if (!existsSync(packageJSON)) {
    warn(
      `could not find package.json for ${id} in ${opts.basedir ||
        process.cwd()}`
    );
    return stats;
  }

  const { license, main, name, version } = JSON.parse(
    readFileSync(packageJSON, 'utf8')
  );

  return {
    ...stats,
    license,
    main,
    name,
    version,
  };
};
