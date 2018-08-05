const commandLineArgs = require('command-line-args');
const glob = require('glob');
const spec = require('./config/options');
const error = require('./lib/error');
const parse = require('./lib/parse');

const { ignore, src } = commandLineArgs(spec);

try {
  src.forEach(loc =>
    glob(loc, { ignore }, async (err, files) => {
      if (err) return error(err);
      if (!files.length)
        return error(`could not find ${loc} in ${process.cwd()}`);
      const tree = await parse(files);
      console.log(tree);
    })
  );
} catch (e) {
  error(
    'must specify entry file(s): `bridge src/app/index.js src/vendor/**/*.js`'
  );
}
