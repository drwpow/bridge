import { existsSync, readFileSync } from 'fs';
import { dirname, relative } from 'path';
import resolve from 'resolve';
import pkgUp from 'pkg-up';
import { error, warn } from './console';

interface ModuleStats {
  src: string;
  license?: string;
  main?: string;
  name?: string;
  version?: string;
}

export default (id: string, opts: { basedir: string }) => {
  let src;

  try {
    src = resolve.sync(id, opts);
  } catch (err1) {
    try {
      src = require.resolve(id);
    } catch (err2) {
      error(`could not locate ${id} in ${opts.basedir || process.cwd()}`);
      return undefined;
    }
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

  const moduleStats: ModuleStats = {
    ...stats,
    license,
    main,
    name,
    version,
  };

  return moduleStats;
};
