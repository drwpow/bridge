import {
  LocalModule,
  AbsoluteModule,
  NodeModuleESM,
  NodeModuleCJS,
  NodeModuleCJSDeep,
  NodeModuleCJSReferential,
} from '../dist';

describe('babel-plugin-bridge', () => {
  it('handles local modules', () => {
    expect(LocalModule).toBe('local');
  });

  it('handles absolute modules', () => {
    expect(AbsoluteModule).toBe('absolute');
  });

  it('handles ESM packages', () => {
    expect(NodeModuleESM).toBe('esm');
  });

  it('handles CJS NPM packages', () => {
    expect(NodeModuleCJS).toBe('cjs');
  });

  it('handles CJS NPM packages that require internal modules', () => {
    expect(NodeModuleCJSDeep).toBe('cjs-deep');
  });

  it('handles CJS NPM packages that require internal modules', () => {
    expect(NodeModuleCJSReferential).toBe('cjs-referential');
  });
});
