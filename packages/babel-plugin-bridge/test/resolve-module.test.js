import resolve from '../dist/lib/resolve-module.js';

describe('resolve-module', () => {
  it('returns undefined when no module exists', () => {
    const resolved = resolve('fake_module');
    expect(resolved).toBe(undefined);
  });

  it('correctly resolves modules from a base directory', () => {
    const resolved = resolve('@babel/babel', { basedir: '../../../mock/src' });

    expect(resolved).toEqual({
      src: `@babel/babel`,
      main: 'lib/index.js',
    });
  });
});
