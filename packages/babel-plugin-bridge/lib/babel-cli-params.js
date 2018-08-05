module.exports = {
  getOutDir(args = process.argv) {
    const dirIndex = args.findIndex(arg => arg === '--out-dir' || arg === '-d');
    if (dirIndex !== -1) return args[dirIndex + 1];

    const fileIndex = args.findIndex(
      arg => arg === '--out-file' || arg === '-o'
    );
    if (fileIndex !== -1) return args[fileIndex + 1].replace(/[^/]*$/, '');
    return undefined;
  },

  getSrcDir(args = process.argv) {
    const srcIndex = args.findIndex(arg => arg.indexOf('babel') !== -1) + 1;
    return args[srcIndex];
  },
};
